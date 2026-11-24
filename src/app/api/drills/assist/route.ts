import { NextResponse } from "next/server";
import {
  assistSkillDrill,
  DrillAssistMode,
  generateLeitpunktCoachSuggestions,
  generateSpeakingExampleDialogue,
  generateWritingPrewriteOutline,
  generateWritingSentenceHint,
} from "@/lib/ai/drills";
import {
  getCachedEntry,
  getGenericCached,
  lookupCachedSelection,
  makeModelAnswerKey,
  makeQuestionAssistKey,
  makeSelectionEntryKey,
  makeTranslateKey,
  setCachedEntry,
  setGenericCached,
} from "@/lib/assist-cache";
import { readDb } from "@/lib/db";
import { SkillDrillExercise, WritingDifficultyMode } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();

    const lang = db.profile.nativeLanguage || "English";
    const isDemo = db.aiConfig.provider === "demo";

    if (body.mode === "speaking_example" && body.module) {
      const modKey = `speaking_example::${String(
        body.module.id || body.module.titleDe || body.module.title
      )}::${lang.toLowerCase()}`;
      if (!isDemo) {
        const cached = getGenericCached(modKey);
        if (cached) return NextResponse.json({ sample: cached, cached: true });
      }
      const sample = await generateSpeakingExampleDialogue(db, body.module);
      if (!isDemo && sample) setGenericCached(modKey, sample);
      return NextResponse.json({ sample, cached: false });
    }

    if (body.mode === "writing_prewrite" && body.exercise) {
      const rawNotes = String(body.rawNotes ?? "").trim();
      const diffMode =
        (body.difficultyMode as WritingDifficultyMode) || "guided";
      const ex = body.exercise as SkillDrillExercise;
      // Only cache empty-notes static skeleton; personalized rough notes are dynamic!
      const prewriteKey = `writing_prewrite_static::${ex.id}::${diffMode}::${lang.toLowerCase()}`;
      if (!isDemo && !rawNotes) {
        const cached = getGenericCached(prewriteKey);
        if (cached) return NextResponse.json({ outline: cached, cached: true });
      }
      const outline = await generateWritingPrewriteOutline(
        db,
        ex,
        rawNotes,
        diffMode
      );
      if (!isDemo && !rawNotes && outline) setGenericCached(prewriteKey, outline);
      return NextResponse.json({ outline, cached: false });
    }

    if (body.mode === "writing_sentence_hint" && body.exercise) {
      const hint = await generateWritingSentenceHint(
        db,
        body.exercise as SkillDrillExercise,
        String(body.currentDraft ?? ""),
        String(body.stuckRequest ?? "")
      );
      return NextResponse.json({ hint });
    }

    if (body.mode === "writing_leitpunkt_coach" && body.exercise) {
      const ex = body.exercise as SkillDrillExercise;
      const bIdx = Number(body.bulletIndex ?? 0);
      const lpKey = `writing_leitpunkt::${ex.id}::${bIdx}::${lang.toLowerCase()}`;
      if (!isDemo) {
        const cached = getGenericCached(lpKey);
        if (cached)
          return NextResponse.json({ suggestions: cached, cached: true });
      }
      const suggestions = await generateLeitpunktCoachSuggestions(
        db,
        ex,
        String(body.bulletDe ?? ""),
        bIdx
      );
      if (!isDemo && suggestions) setGenericCached(lpKey, suggestions);
      return NextResponse.json({ suggestions, cached: false });
    }

    const mode = body.mode as DrillAssistMode;
    const exercise = body.exercise as SkillDrillExercise | undefined;

    if (!exercise || !mode) {
      return NextResponse.json(
        { error: "Missing mode or exercise payload." },
        { status: 400 }
      );
    }

    const studyLevel = db.profile.targetLevel || exercise.level || "B1";

    // Check persistent static database cache FIRST for instant <5ms responses & ZERO repeat API calls!
    if (!isDemo && !body.bypassCache) {
      if (mode === "translate_passage") {
        const hit = getCachedEntry(
          makeTranslateKey(exercise.id, lang, studyLevel)
        );
        if (hit) {
          return NextResponse.json({ result: hit, cached: true });
        }
      } else if (mode === "model_answer") {
        const hit = getCachedEntry(
          makeModelAnswerKey(exercise.id, lang, studyLevel)
        );
        if (hit) {
          return NextResponse.json({ result: hit, cached: true });
        }
      } else if (
        mode === "explain_selection" &&
        typeof body.selectedText === "string" &&
        body.selectedText.trim()
      ) {
        const selType =
          body.selectionType === "word" ||
          body.selectionType === "phrase" ||
          body.selectionType === "sentence"
            ? body.selectionType
            : "word";
        const hit = lookupCachedSelection({
          exerciseId: exercise.id,
          selectionType: selType,
          selectedText: body.selectedText,
          lang,
          level: studyLevel,
        });
        if (hit) {
          return NextResponse.json({ result: hit, cached: true });
        }
      } else if (
        (mode === "analyze_answer" || mode === "explain_question") &&
        typeof body.questionId === "string"
      ) {
        const hit = getCachedEntry(
          makeQuestionAssistKey(mode, exercise.id, body.questionId, lang)
        );
        if (hit) {
          return NextResponse.json({ result: hit, cached: true });
        }
      }
    }

    const result = await assistSkillDrill(db, {
      mode,
      exercise,
      questionId: body.questionId,
      userQuestion: body.userQuestion,
      selectedText: body.selectedText,
      surroundingSentence: body.surroundingSentence,
      selectionType: body.selectionType,
    });

    // Permanently save static results in local database cache so future clicks use ZERO API quota!
    if (!isDemo && result?.body) {
      if (mode === "translate_passage") {
        setCachedEntry(makeTranslateKey(exercise.id, lang, studyLevel), result);
      } else if (mode === "model_answer") {
        setCachedEntry(makeModelAnswerKey(exercise.id, lang, studyLevel), result);
      } else if (
        mode === "explain_selection" &&
        typeof body.selectedText === "string" &&
        body.selectedText.trim()
      ) {
        const selType =
          body.selectionType === "word" ||
          body.selectionType === "phrase" ||
          body.selectionType === "sentence"
            ? body.selectionType
            : "word";
        setCachedEntry(
          makeSelectionEntryKey(
            exercise.id,
            selType,
            body.selectedText,
            lang,
            studyLevel
          ),
          result
        );
      } else if (
        (mode === "analyze_answer" || mode === "explain_question") &&
        typeof body.questionId === "string"
      ) {
        setCachedEntry(
          makeQuestionAssistKey(mode, exercise.id, body.questionId, lang),
          result
        );
      }
    }

    return NextResponse.json({ result, cached: false });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Tutor assist failed" },
      { status: 500 }
    );
  }
}
