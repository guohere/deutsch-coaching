import { NextResponse } from "next/server";
import {
  assistSkillDrill,
  generateLesenReaderPack,
  generateQuestionAnalysesBatch,
} from "@/lib/ai/drills";
import {
  buildClientHydrationPayload,
  getCachedEntry,
  getReaderPack,
  listCachedExerciseIdsForSkill,
  makeQuestionAssistKey,
  makeTranslateKey,
  saveReaderPack,
  setCachedEntry,
} from "@/lib/assist-cache";
import { readDb } from "@/lib/db";
import { loadAllLocalExercises } from "@/lib/exercise-store";
import { SkillDrillExercise } from "@/lib/types";

const globalForPrecompute = globalThis as unknown as {
  __sprachcoachInFlightPrecompute?: Map<string, Promise<void>>;
};

const inFlightPrecompute =
  globalForPrecompute.__sprachcoachInFlightPrecompute ??
  (globalForPrecompute.__sprachcoachInFlightPrecompute = new Map());

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get("exerciseId");
  const skillParam = searchParams.get("skill") || "lesen";
  const levelParam = searchParams.get("level");

  const db = readDb();
  const lang = db.profile.nativeLanguage || "English";
  const studyLevel = levelParam || db.profile.targetLevel || "B1";

  if (exerciseId) {
    const hydration = buildClientHydrationPayload(exerciseId, lang, studyLevel);
    return NextResponse.json(hydration);
  }

  // Library-wide static DB cache inventory for Lesen or Hören
  const skillExercises = loadAllLocalExercises().filter(
    (e) => e.skill === skillParam
  );
  const cachedIds = listCachedExerciseIdsForSkill(
    skillExercises,
    lang,
    studyLevel
  );

  return NextResponse.json({
    lang,
    studyLevel,
    skill: skillParam,
    totalCount: skillExercises.length,
    cachedCount: cachedIds.length,
    cachedExerciseIds: cachedIds,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const exercise = body.exercise as SkillDrillExercise | undefined;
    const force = Boolean(body.force);

    if (!exercise || !exercise.id) {
      return NextResponse.json(
        { error: "Missing exercise payload" },
        { status: 400 }
      );
    }

    const db = readDb();
    const lang = db.profile.nativeLanguage || "English";
    const studyLevel = db.profile.targetLevel || exercise.level || "B1";

    if (db.aiConfig.provider === "demo") {
      return NextResponse.json({
        ...buildClientHydrationPayload(exercise.id, lang, studyLevel),
        skippedDemo: true,
      });
    }

    const qList = exercise.questions ?? [];
    const hasAllQs =
      qList.length === 0 ||
      qList.every((q) =>
        Boolean(
          getCachedEntry(
            makeQuestionAssistKey("analyze_answer", exercise.id, q.id, lang)
          )
        )
      );
    const hasLesenPack =
      exercise.skill !== "lesen" ||
      Boolean(getReaderPack(exercise.id, lang, studyLevel));
    const hasHoerenTranslation =
      exercise.skill !== "hoeren" ||
      Boolean(getCachedEntry(makeTranslateKey(exercise.id, lang, studyLevel)));

    if (!force && hasAllQs && hasLesenPack && hasHoerenTranslation) {
      return NextResponse.json({
        ...buildClientHydrationPayload(exercise.id, lang, studyLevel),
        fromDiskCache: true,
      });
    }

    const flightKey = `${exercise.id}::${lang}::${studyLevel}`;
    let promise = inFlightPrecompute.get(flightKey);
    if (!promise) {
      promise = (async () => {
        if (exercise.skill === "lesen" && (force || !hasLesenPack)) {
          const pack = await generateLesenReaderPack(db, exercise);
          if (pack) {
            saveReaderPack(pack);
          }
        } else if (
          exercise.skill === "hoeren" &&
          (force || !hasHoerenTranslation)
        ) {
          const trans = await assistSkillDrill(db, {
            mode: "translate_passage",
            exercise,
          });
          if (trans?.body) {
            setCachedEntry(
              makeTranslateKey(exercise.id, lang, studyLevel),
              trans
            );
          }
        }

        if (qList.length > 0 && (force || !hasAllQs)) {
          await generateQuestionAnalysesBatch(db, exercise);
        }
      })().finally(() => {
        inFlightPrecompute.delete(flightKey);
      });
      inFlightPrecompute.set(flightKey, promise);
    }

    await promise;

    return NextResponse.json({
      ...buildClientHydrationPayload(exercise.id, lang, studyLevel),
      fromDiskCache: false,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Pre-computing static exercise cache failed",
      },
      { status: 500 }
    );
  }
}
