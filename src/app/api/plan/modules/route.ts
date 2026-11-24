import { NextResponse } from "next/server";
import {
  addModuleToPlan,
  deleteModuleFromPlan,
  getSanitizedState,
  reorderModuleInPlan,
  updateModuleInPlan,
} from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support bulk adding multiple speaking modules at once (e.g. from the Goethe Speaking Bank)
    if (Array.isArray(body.modules)) {
      const addedModules = [];
      let latestDb;
      for (const item of body.modules) {
        const res = addModuleToPlan({
          title: item.title || "Speaking Module",
          titleDe: item.titleDe || item.title || "Sprechmodul",
          category: item.category || "exam_teil1_planning",
          targetLevel: item.targetLevel || "B1",
          durationMinutes: Number(item.durationMinutes) || 10,
          scenarioPrompt:
            item.scenarioPrompt || "Guided German speaking conversation.",
          coachRole: item.coachRole || "Supportive German speaking coach",
          learnerGoal:
            item.learnerGoal || "Speak confidently in connected German sentences.",
          grammarFocus: Array.isArray(item.grammarFocus) ? item.grammarFocus : [],
          keyVocabulary: Array.isArray(item.keyVocabulary)
            ? item.keyVocabulary
            : [],
          status: "queued",
          source: item.source || "generated",
        });
        addedModules.push(res.module);
        latestDb = res.db;
      }

      if (!latestDb) {
        return NextResponse.json(
          { error: "No modules provided" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        addedModules,
        state: getSanitizedState(latestDb),
      });
    }

    const { db, module } = addModuleToPlan({
      title: body.title || "Custom Speaking Module",
      titleDe: body.titleDe || body.title || "Eigenes Modul",
      category: body.category || "everyday_roleplay",
      targetLevel: body.targetLevel || "B1",
      durationMinutes: Number(body.durationMinutes) || 10,
      scenarioPrompt:
        body.scenarioPrompt ||
        "Practice a natural German conversation on this topic with guided follow-up questions.",
      coachRole: body.coachRole || "Supportive German speaking coach",
      learnerGoal:
        body.learnerGoal ||
        "Speak confidently in connected German sentences and ask follow-up questions.",
      grammarFocus: Array.isArray(body.grammarFocus) ? body.grammarFocus : [],
      keyVocabulary: Array.isArray(body.keyVocabulary) ? body.keyVocabulary : [],
      status: "queued",
      source: body.source || "custom",
    });

    return NextResponse.json({
      module,
      state: getSanitizedState(db),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not add module" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Module id is required" }, { status: 400 });
    }

    let updated;
    if (body.reorder === "up" || body.reorder === "down") {
      updated = reorderModuleInPlan(body.id, body.reorder);
    } else {
      const { id, ...patch } = body;
      updated = updateModuleInPlan(id, patch);
    }

    return NextResponse.json({ state: getSanitizedState(updated) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update module" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Module id is required" }, { status: 400 });
    }
    const updated = deleteModuleFromPlan(id);
    return NextResponse.json({ state: getSanitizedState(updated) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not delete module" },
      { status: 400 }
    );
  }
}
