import { NextResponse } from "next/server";
import { gradeWritingDrill } from "@/lib/ai/drills";
import {
  addVocabularyItems,
  readDb,
  recordMasteryProgress,
  updateDb,
  upsertBottleneck,
} from "@/lib/db";
import { computeReadinessMetrics } from "@/lib/standards";
import { SkillDrillExercise, SkillDrillGrade } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const exercise = body.exercise as SkillDrillExercise | undefined;
    if (!exercise || !exercise.skill) {
      return NextResponse.json(
        { error: "Missing exercise payload" },
        { status: 400 }
      );
    }

    const db = readDb();
    let grade: SkillDrillGrade;

    if (exercise.skill === "schreiben") {
      const writingText = String(body.writingText ?? "").trim();
      if (!writingText) {
        return NextResponse.json(
          { error: "Please write your German response before grading." },
          { status: 400 }
        );
      }
      grade = await gradeWritingDrill(db, exercise, writingText);
    } else {
      // Grade Hören / Lesen multiple choice answers accurately
      const answers = (body.answers ?? {}) as Record<string, number>;
      const questions = exercise.questions ?? [];
      let correctCount = 0;
      const questionResults = questions.map((q) => {
        const chosen = answers[q.id];
        const correct = chosen === q.correctIndex;
        if (correct) correctCount += 1;
        return {
          questionId: q.id,
          correct,
          explanation: q.explanation,
        };
      });

      const score =
        questions.length > 0
          ? Math.round((correctCount / questions.length) * 100)
          : 0;
      const passed = score >= 60;

      grade = {
        score,
        passed,
        praise: passed
          ? `Strong ${exercise.skill === "hoeren" ? "listening" : "reading"} comprehension (${correctCount}/${questions.length} correct)!`
          : `Good practice (${correctCount}/${questions.length} correct) — review the explanations and key vocabulary below.`,
        summary: `Completed ${exercise.examPartLabel} on "${exercise.topicDe}" with ${score}%.`,
        questionResults,
        newBottlenecks:
          score < 67
            ? [
                {
                  title: `${exercise.skill === "hoeren" ? "Listening" : "Reading"} comprehension: ${exercise.topicEn}`,
                  category: "vocabulary",
                  description: `Missed ${questions.length - correctCount}/${questions.length} detail questions on "${exercise.topicDe}". Review the key words and replay the passage.`,
                  exampleMistake: `Detail question missed in ${exercise.examPartLabel}`,
                  betterGerman: exercise.keyVocab[0]?.german ?? exercise.topicDe,
                  severity: "medium",
                },
              ]
            : [],
        newVocabulary: exercise.keyVocab.map((v) => ({
          german: v.german,
          meaning: v.meaning,
          exampleDe: `${v.german} (${exercise.topicDe})`,
        })),
      };
    }

    const now = new Date().toISOString();
    const rawDuration =
      typeof body.durationSec === "number" && Number.isFinite(body.durationSec) && body.durationSec > 0
        ? Math.round(body.durationSec)
        : undefined;
    const rawTarget =
      typeof body.targetDurationSec === "number" &&
      Number.isFinite(body.targetDurationSec) &&
      body.targetDurationSec > 0
        ? Math.round(body.targetDurationSec)
        : undefined;

    const attemptRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      exerciseId: exercise.id,
      skill: exercise.skill,
      exercise,
      answers: exercise.skill === "schreiben" ? undefined : body.answers ?? {},
      writingText:
        exercise.skill === "schreiben"
          ? String(body.writingText ?? "").trim()
          : undefined,
      grade,
      durationSec: rawDuration,
      targetDurationSec: rawTarget,
      completedAt: now,
    };

    // Perform all memory, drillHistory, and mastery updates in ONE atomic disk write
    const updatedDb = updateDb((state) => {
      for (const bn of grade.newBottlenecks) {
        upsertBottleneck(bn);
      }
      if (grade.newVocabulary.length > 0) {
        addVocabularyItems(
          grade.newVocabulary.map((v) => ({
            german: v.german,
            meaning: v.meaning,
            exampleDe: v.exampleDe,
            topic: exercise.topicDe,
          }))
        );
      }

      state.drillHistory.unshift(attemptRecord);
      if (state.drillHistory.length > 100) {
        state.drillHistory = state.drillHistory.slice(0, 100);
      }

      state.memory.totalMinutesPracticed += 5;
      const todayKey = now.slice(0, 10);
      if (state.memory.lastPracticeDate !== todayKey) {
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        state.memory.streakDays =
          state.memory.lastPracticeDate === yesterday
            ? state.memory.streakDays + 1
            : 1;
        state.memory.lastPracticeDate = todayKey;
      }
      state.memory.lastSessionRecap = `${exercise.examPartLabel} · ${exercise.topicDe} (Score ${grade.score}/100): ${grade.summary}`;

      recordMasteryProgress({
        skill: exercise.skill,
        sessionScore: grade.score,
        label: `${exercise.examPartLabel}: ${exercise.topicEn}`,
        topicHint: `${exercise.topicDe} ${exercise.topicEn}`,
        vocabCategoryId: exercise.vocabCategoryId,
        grammarStandardId: exercise.grammarStandardId,
        newVocabCount: grade.newVocabulary.length,
      });
    });

    const readiness = computeReadinessMetrics(
      updatedDb.mastery,
      updatedDb.memory,
      updatedDb.profile
    );

    return NextResponse.json({
      grade,
      attempt: attemptRecord,
      mastery: updatedDb.mastery,
      readiness,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not grade drill" },
      { status: 500 }
    );
  }
}
