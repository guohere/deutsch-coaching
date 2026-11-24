import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import {
  deleteCustomExercise,
  loadAllLocalExercises,
  saveExercisesToCustomFile,
} from "@/lib/exercise-store";
import { DrillAttemptRecord, SkillDrillExercise } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get("skill");

  const db = readDb();
  const allLocal = loadAllLocalExercises();
  const filteredLocal = skill
    ? allLocal.filter((e) => e.skill === skill)
    : allLocal;

  const historyForSkill = skill
    ? db.drillHistory.filter((h) => h.skill === skill)
    : db.drillHistory;

  // Group attempts by exerciseId
  const attemptsByEx = new Map<string, DrillAttemptRecord[]>();
  for (const att of historyForSkill) {
    const list = attemptsByEx.get(att.exerciseId) ?? [];
    list.push(att);
    attemptsByEx.set(att.exerciseId, list);
  }

  const enrichedExercises = filteredLocal.map((ex) => {
    const attempts = attemptsByEx.get(ex.id) ?? [];
    const bestScore =
      attempts.length > 0
        ? Math.max(...attempts.map((a) => a.grade.score))
        : null;
    return {
      exercise: ex,
      attemptCount: attempts.length,
      bestScore,
      latestAttempt: attempts[0] ?? null,
      attempts: attempts.slice(0, 15),
    };
  });

  // Also include completed AI-generated bonus attempts not saved in the local bank so users can still review them!
  const localIds = new Set(filteredLocal.map((e) => e.id));
  const extraAttempts = historyForSkill.filter(
    (h) => !localIds.has(h.exerciseId)
  );

  return NextResponse.json({
    exercises: enrichedExercises,
    recentAiAttempts: extraAttempts.slice(0, 15),
    vocabCategories: db.mastery.vocabCategories.map((v) => ({
      id: v.id,
      titleDe: v.titleDe,
      titleEn: v.titleEn,
    })),
    aiConfig: {
      ttsProvider: db.aiConfig.ttsProvider ?? "edge_neural",
      edgeVoice: db.aiConfig.edgeVoice ?? "de-DE-SeraphinaMultilingualNeural",
      geminiTtsVoice: db.aiConfig.geminiTtsVoice ?? "Kore",
      voiceRate: db.aiConfig.voiceRate ?? 1.1,
      preferredVoiceName: db.aiConfig.preferredVoiceName ?? "",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support saving a single exercise OR importing a JSON pack array
    let list: Partial<SkillDrillExercise>[] = [];
    let source: SkillDrillExercise["source"] = "imported";
    let credit = String(body.sourceCredit ?? "Imported JSON Pack");

    if (body.exercise) {
      list = [body.exercise];
      source = body.exercise.source === "ai_generated" ? "ai_generated" : "imported";
      credit = body.sourceCredit || "Saved to Local Library";
    } else if (Array.isArray(body.exercises)) {
      list = body.exercises;
    } else if (Array.isArray(body)) {
      list = body;
    } else {
      return NextResponse.json(
        { error: "Provide an `exercise` object or an `exercises` JSON array." },
        { status: 400 }
      );
    }

    const { added, skipped } = saveExercisesToCustomFile(list, source, credit);
    if (added.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid exercises found in JSON. Make sure each item has skill (hoeren/lesen/schreiben), title, and passageDe+questions (or writingPromptDe).",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      addedCount: added.length,
      skippedCount: skipped,
      added,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to import exercises" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Exercise id is required" }, { status: 400 });
  }
  const removed = deleteCustomExercise(id);
  return NextResponse.json({ ok: removed });
}
