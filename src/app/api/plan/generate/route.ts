import { NextResponse } from "next/server";
import {
  generatePersonalizedPlan,
  suggestAdditionalModules,
} from "@/lib/ai/coach";
import {
  addModuleToPlan,
  getSanitizedState,
  readDb,
  savePlan,
  syncMasteryStandard,
  updateProfileAndConfig,
} from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.profile) {
      const before = readDb();
      const updatedProf = updateProfileAndConfig(body.profile);
      if (
        updatedProf.profile.targetLevel !== before.mastery.standardLevel ||
        updatedProf.profile.goalTitle !== before.mastery.examName
      ) {
        syncMasteryStandard(
          updatedProf.profile.targetLevel,
          updatedProf.profile.goalTitle
        );
      }
    }

    const db = readDb();

    if (body.mode === "suggest_more") {
      const suggestions = await suggestAdditionalModules(
        db,
        body.focusTopic,
        body.targetCategory,
        Number(body.count) || 4
      );
      if (body.autoAdd) {
        const addedModules = [];
        for (const mod of suggestions) {
          const added = addModuleToPlan(mod);
          addedModules.push(added.module);
        }
        return NextResponse.json({
          suggestions,
          addedModules,
          state: getSanitizedState(readDb()),
        });
      }
      return NextResponse.json({ suggestions });
    }

    const plan = await generatePersonalizedPlan(db, body.customNote);
    const updated = savePlan(plan);
    return NextResponse.json({
      plan,
      state: getSanitizedState(updated),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Plan generation failed" },
      { status: 500 }
    );
  }
}
