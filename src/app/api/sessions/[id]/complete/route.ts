import { NextResponse } from "next/server";
import { generateSessionDebrief } from "@/lib/ai/coach";
import {
  addVocabularyItems,
  readDb,
  recordMasteryProgress,
  updateDb,
  upsertBottleneck,
} from "@/lib/db";
import { StudyModule } from "@/lib/types";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const db = readDb();
    const session = db.sessions.find((s) => s.id === id);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const moduleItem: StudyModule =
      db.plan.modules.find((m) => m.id === session.moduleId) ?? {
        id: session.moduleId,
        order: 0,
        title: session.moduleTitle,
        titleDe: session.moduleTitle,
        category: session.moduleCategory,
        targetLevel: db.profile.targetLevel,
        durationMinutes: 10,
        scenarioPrompt: "Guided German speaking conversation.",
        coachRole: "German speaking coach",
        learnerGoal: "Speak confidently in German.",
        grammarFocus: [],
        keyVocabulary: [],
        status: "in_progress",
        source: "custom",
        completedCount: 0,
      };

    const debrief = await generateSessionDebrief(db, session, moduleItem);
    const now = new Date().toISOString();
    const durationSeconds =
      typeof body.durationSeconds === "number" && body.durationSeconds > 0
        ? body.durationSeconds
        : Math.max(
            60,
            Math.round(
              (Date.now() - new Date(session.startedAt).getTime()) / 1000
            )
          );

    const completedSession = {
      ...session,
      completedAt: now,
      durationSeconds,
      currentPhase: "debrief" as const,
      debrief,
    };

    // Update session, module progress, streak, and memory summary
    updateDb((state) => {
      const sIdx = state.sessions.findIndex((s) => s.id === session.id);
      if (sIdx >= 0) {
        state.sessions[sIdx] = completedSession;
      }

      const mod = state.plan.modules.find((m) => m.id === session.moduleId);
      if (mod) {
        mod.status = "completed";
        mod.completedCount += 1;
        mod.lastPracticedAt = now;
      }

      // Streak & minutes
      const todayKey = now.slice(0, 10);
      const addedMinutes = Math.max(1, Math.round(durationSeconds / 60));
      state.memory.totalMinutesPracticed += addedMinutes;

      if (state.memory.lastPracticeDate !== todayKey) {
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        state.memory.streakDays =
          state.memory.lastPracticeDate === yesterday
            ? state.memory.streakDays + 1
            : Math.max(1, state.memory.streakDays === 0 ? 1 : 1);
        state.memory.lastPracticeDate = todayKey;
      }

      state.memory.lastSessionRecap = `${moduleItem.title} (Score ${debrief.overallScore}/100): ${debrief.summary}`;

      // Mark improved bottlenecks
      for (const improvedTitle of debrief.improvedBottlenecks) {
        const match = state.memory.bottlenecks.find((b) =>
          b.title.toLowerCase().includes(improvedTitle.toLowerCase()) ||
          improvedTitle.toLowerCase().includes(b.title.toLowerCase())
        );
        if (match) {
          match.severity =
            match.severity === "improving" ? "mastered" : "improving";
          match.lastSeenAt = now;
        }
      }

      if (debrief.praise && !state.memory.strengths.includes(debrief.praise)) {
        state.memory.strengths.unshift(debrief.praise);
        state.memory.strengths = state.memory.strengths.slice(0, 8);
      }
    });

    // Save newly discovered or recurring bottlenecks
    for (const bn of debrief.newBottlenecks) {
      upsertBottleneck({
        title: bn.title,
        category: bn.category,
        description: bn.description,
        exampleMistake: bn.exampleMistake,
        betterGerman: bn.betterGerman,
        severity: bn.severity,
      });
    }

    // Save extracted German phrases to Vocabulary Bank
    if (debrief.newVocabulary.length > 0) {
      addVocabularyItems(
        debrief.newVocabulary.map((v) => ({
          german: v.german,
          meaning: v.meaning,
          exampleDe: v.exampleDe,
          topic: moduleItem.titleDe,
        }))
      );
    }

    // Automatically advance Visual Progress Monitor (Sprechen + gentle Hören boost + Vocab + Grammar)
    recordMasteryProgress({
      skill: moduleItem.category === "listening_qa" ? "hoeren" : "sprechen",
      sessionScore: debrief.overallScore,
      label: moduleItem.title,
      topicHint: `${moduleItem.title} ${moduleItem.titleDe} ${moduleItem.scenarioPrompt}`,
      grammarHints: [
        ...moduleItem.grammarFocus,
        ...debrief.improvedBottlenecks,
      ],
      newVocabCount: debrief.newVocabulary.length,
      alsoBoostListening: true,
    });

    const finalDb = readDb();

    return NextResponse.json({
      session: completedSession,
      debrief,
      memory: finalDb.memory,
      mastery: finalDb.mastery,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to complete session" },
      { status: 500 }
    );
  }
}
