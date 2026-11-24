import { NextResponse } from "next/server";
import { generateSkillDrill } from "@/lib/ai/drills";
import { readDb } from "@/lib/db";
import { saveExercisesToCustomFile } from "@/lib/exercise-store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const skill = body.skill as "hoeren" | "lesen" | "schreiben";
    if (!["hoeren", "lesen", "schreiben"].includes(skill)) {
      return NextResponse.json(
        { error: "Skill must be hoeren, lesen, or schreiben" },
        { status: 400 }
      );
    }

    const db = readDb();
    const rawPart = Number(body.examPartNumber);
    const examPartNumber =
      rawPart >= 1 && rawPart <= 5
        ? (rawPart as 1 | 2 | 3 | 4 | 5)
        : undefined;
    const exercise = await generateSkillDrill(
      db,
      skill,
      body.vocabCategoryId,
      body.grammarStandardId,
      examPartNumber
    );

    // Automatically save every AI-generated exercise into the local library so it's never lost
    const savedExercise = {
      ...exercise,
      source: "ai_generated" as const,
      sourceCredit: "AI Generated (Saved)",
    };
    saveExercisesToCustomFile(
      [savedExercise],
      "ai_generated",
      "AI Generated (Saved)"
    );

    return NextResponse.json({
      exercise: savedExercise,
      autoSaved: true,
      aiConfig: {
        ttsProvider: db.aiConfig.ttsProvider ?? "edge_neural",
        edgeVoice: db.aiConfig.edgeVoice ?? "de-DE-SeraphinaMultilingualNeural",
        voiceRate: db.aiConfig.voiceRate ?? 0.95,
        preferredVoiceName: db.aiConfig.preferredVoiceName ?? "",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not generate drill" },
      { status: 500 }
    );
  }
}
