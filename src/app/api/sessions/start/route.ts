import { NextResponse } from "next/server";
import { createCoachMessage, generateCoachOpening } from "@/lib/ai/coach";
import {
  addModuleToPlan,
  readDb,
  updateModuleInPlan,
  upsertSession,
} from "@/lib/db";
import { prewarmCoachReplyTts } from "@/lib/tts-engine";
import { SessionRecord, StudyModule } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let db = readDb();

    let moduleItem: StudyModule | undefined;
    let targetBottleneck = body.bottleneckId
      ? db.memory.bottlenecks.find((b) => b.id === body.bottleneckId)
      : undefined;

    if (body.moduleId) {
      moduleItem = db.plan.modules.find((m) => m.id === body.moduleId);
    }

    // If launching directly from a bottleneck in Memory, create or reuse a targeted drill module
    if (!moduleItem && targetBottleneck) {
      const existingDrill = db.plan.modules.find(
        (m) =>
          m.source === "bottleneck" &&
          m.title.toLowerCase().includes(targetBottleneck!.title.toLowerCase())
      );
      if (existingDrill) {
        moduleItem = existingDrill;
      } else {
        const added = addModuleToPlan({
          title: `Bottleneck Drill: ${targetBottleneck.title}`,
          titleDe: `Gezieltes Training: ${targetBottleneck.title}`,
          category: "bottleneck_drill",
          targetLevel: db.profile.targetLevel,
          durationMinutes: 8,
          scenarioPrompt: `Targeted speaking drill to overcome this recurring bottleneck: ${targetBottleneck.description}. Practice replacing patterns like "${targetBottleneck.exampleMistake}" with natural German like "${targetBottleneck.betterGerman}".`,
          coachRole: "Focused German speaking & grammar drill coach",
          learnerGoal: `Use the corrected pattern ("${targetBottleneck.betterGerman}") naturally in 4–5 spoken replies.`,
          grammarFocus: [targetBottleneck.title],
          keyVocabulary: [targetBottleneck.betterGerman],
          status: "in_progress",
          source: "bottleneck",
        });
        db = added.db;
        moduleItem = added.module;
      }
    }

    // Default proactive pick: next queued/in_progress module in the plan
    if (!moduleItem) {
      moduleItem =
        db.plan.modules.find((m) => m.status === "in_progress") ??
        db.plan.modules.find((m) => m.status === "queued") ??
        db.plan.modules[0];
    }

    if (!moduleItem) {
      return NextResponse.json(
        { error: "No practice modules in your plan yet. Generate or add one first." },
        { status: 400 }
      );
    }

    if (!targetBottleneck) {
      targetBottleneck =
        db.memory.bottlenecks.find((b) => b.severity === "high") ??
        db.memory.bottlenecks.find((b) => b.severity === "medium");
    }

    updateModuleInPlan(moduleItem.id, { status: "in_progress" });

    const opening = await generateCoachOpening(db, moduleItem, targetBottleneck);
    const coachMsg = createCoachMessage(opening, "warmup");

    const session: SessionRecord = {
      id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      moduleId: moduleItem.id,
      moduleTitle: moduleItem.title,
      moduleCategory: moduleItem.category,
      targetBottleneckId: targetBottleneck?.id,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      currentPhase: "warmup",
      turnCount: 0,
      messages: [coachMsg],
    };

    upsertSession(session);

    await prewarmCoachReplyTts(coachMsg.textDe, db.aiConfig);

    return NextResponse.json({
      session,
      module: moduleItem,
      targetBottleneck: targetBottleneck ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start session" },
      { status: 500 }
    );
  }
}
