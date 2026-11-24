import { NextResponse } from "next/server";
import { extractJsonObject, generateWithAi } from "@/lib/ai/providers";
import {
  getCachedEntry,
  normalizeCacheText,
  setCachedEntry,
} from "@/lib/assist-cache";
import { readDb, updateDb } from "@/lib/db";
import { computeReadinessMetrics } from "@/lib/standards";
import {
  B1_VOCAB_CATEGORIES_META,
  GrammarDrillItem,
  VocabPoolItem,
} from "@/lib/vocab-grammar-bank";
import {
  getDateKeyOffset,
  getMergedGrammarPool,
  getMergedVocabPool,
  readPracticePool,
  recalculateVocabCategoriesFromEvidence,
  writePracticePool,
} from "@/lib/vocab-pool-store";

export async function GET() {
  const db = readDb();
  const vocabItems = getMergedVocabPool(db);
  const grammarItems = getMergedGrammarPool();
  const readiness = computeReadinessMetrics(db.mastery, db.memory, db.profile);

  return NextResponse.json({
    vocabItems,
    grammarItems,
    vocabCategories: db.mastery.vocabCategories,
    grammarStandards: db.mastery.grammarStandards,
    targetLevel: db.profile.targetLevel || "B1",
    readiness,
    aiConfig: {
      ttsProvider: db.aiConfig.ttsProvider ?? "edge_neural",
      edgeVoice: db.aiConfig.edgeVoice ?? "de-DE-SeraphinaMultilingualNeural",
      geminiTtsVoice: db.aiConfig.geminiTtsVoice ?? "Kore",
      voiceRate: db.aiConfig.voiceRate ?? 1.0,
      preferredVoiceName: db.aiConfig.preferredVoiceName ?? "",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    const db = readDb();
    const pool = readPracticePool();
    const now = new Date().toISOString();

    if (action === "record_vocab_result") {
      const wordId = String(body.wordId ?? "");
      const categoryId = String(body.categoryId ?? "");
      const correct = Boolean(body.correct);
      const todayKey =
        typeof body.localDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.localDate)
          ? body.localDate
          : now.slice(0, 10);

      if (!wordId) {
        return NextResponse.json({ error: "wordId required" }, { status: 400 });
      }

      const prev = pool.vocabStats[wordId] ?? {
        correctStreak: 0,
        totalCorrect: 0,
        totalWrong: 0,
        needsRetry: false,
        todayDate: todayKey,
        todayCorrectCount: 0,
        masteredDays: [],
        mastered: false,
      };

      const prevDays = Array.isArray(prev.masteredDays) ? [...prev.masteredDays] : [];
      const isSameDay = prev.todayDate === todayKey;
      const prevTodayCorrect = isSameDay ? prev.todayCorrectCount ?? 0 : 0;

      const nextStreak = correct ? prev.correctStreak + 1 : 0;
      const nextTodayCorrect = correct ? prevTodayCorrect + 1 : 0;
      const completedTodayGoal = correct && nextTodayCorrect >= 3;

      const nextMasteredDays =
        completedTodayGoal && !prevDays.includes(todayKey)
          ? [...prevDays, todayKey]
          : prevDays;

      // Require 3 distinct days of 3x correct matches to mark permanently Mastered!
      const isMultiDayMastered = nextMasteredDays.length >= 3;

      // Once hit 3x correct today, schedule for tomorrow so it won't reappear again today!
      let nextReviewDate = prev.nextReviewDate;
      if (!correct) {
        nextReviewDate = todayKey; // Keep due today for immediate repeat
      } else if (completedTodayGoal) {
        nextReviewDate = getDateKeyOffset(todayKey, 1);
      }

      const nextStats = {
        ...prev,
        correctStreak: nextStreak,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        totalWrong: prev.totalWrong + (correct ? 0 : 1),
        needsRetry: !correct ? true : prev.needsRetry && !completedTodayGoal,
        todayDate: todayKey,
        todayCorrectCount: nextTodayCorrect,
        masteredDays: nextMasteredDays,
        nextReviewDate,
        mastered: isMultiDayMastered,
        lastPracticedAt: now,
      };

      pool.vocabStats[wordId] = nextStats;
      writePracticePool(pool);

      // Recalculate all topic category percentages strictly from multi-day SRS & unique task evidence
      const updatedDb = updateDb((state) => {
        recalculateVocabCategoriesFromEvidence(state);
        if (categoryId) {
          const cat = state.mastery.vocabCategories.find(
            (v) => v.id === categoryId
          );
          if (cat) cat.lastPracticedAt = now;
        }
        state.mastery.updatedAt = now;
      });

      return NextResponse.json({
        stats: nextStats,
        readiness: computeReadinessMetrics(
          updatedDb.mastery,
          updatedDb.memory,
          updatedDb.profile
        ),
        vocabCategories: updatedDb.mastery.vocabCategories,
      });
    }

    if (action === "record_vocab_write_result") {
      const wordId = String(body.wordId ?? "");
      const categoryId = String(body.categoryId ?? "");
      const correct = Boolean(body.correct);
      const usedAnswerReveal = Boolean(body.usedAnswerReveal);
      if (!wordId) {
        return NextResponse.json({ error: "wordId required" }, { status: 400 });
      }

      const prev = pool.vocabStats[wordId] ?? {
        correctStreak: 0,
        totalCorrect: 0,
        totalWrong: 0,
        needsRetry: false,
        writeStreak: 0,
        writeCorrect: 0,
        writeWrong: 0,
        writeNeedsRetry: false,
      };

      const cleanWin = correct && !usedAnswerReveal;
      const nextWriteStreak = cleanWin ? (prev.writeStreak ?? 0) + 1 : 0;
      const nextStats = {
        ...prev,
        writeStreak: nextWriteStreak,
        writeCorrect: (prev.writeCorrect ?? 0) + (cleanWin ? 1 : 0),
        writeWrong: (prev.writeWrong ?? 0) + (cleanWin ? 0 : 1),
        // Repeat missed/revealed words in Write Mode until written cleanly 2x in a row!
        writeNeedsRetry: !cleanWin
          ? true
          : Boolean(prev.writeNeedsRetry) && nextWriteStreak < 2,
        lastPracticedAt: now,
      };

      pool.vocabStats[wordId] = nextStats;
      writePracticePool(pool);

      const updatedDb = updateDb((state) => {
        recalculateVocabCategoriesFromEvidence(state);
        if (categoryId) {
          const cat = state.mastery.vocabCategories.find(
            (v) => v.id === categoryId
          );
          if (cat) cat.lastPracticedAt = now;
        }
        state.mastery.updatedAt = now;
      });

      return NextResponse.json({
        stats: nextStats,
        readiness: computeReadinessMetrics(
          updatedDb.mastery,
          updatedDb.memory,
          updatedDb.profile
        ),
        vocabCategories: updatedDb.mastery.vocabCategories,
      });
    }

    if (action === "vocab_usage_examples") {
      const german = String(body.german ?? "").trim();
      const translation = String(body.translation ?? "").trim();
      const existingExampleDe = String(body.exampleDe ?? "").trim();
      if (!german) {
        return NextResponse.json({ error: "german word required" }, { status: 400 });
      }

      const level = db.profile.targetLevel || "B1";
      const lang = db.profile.nativeLanguage || "English";
      const cacheKey = `vocab_usage::${normalizeCacheText(german)}::${lang.toLowerCase()}::${level.toUpperCase()}`;

      const cached = getCachedEntry(cacheKey);
      if (cached) {
        return NextResponse.json({ usage: cached, cached: true });
      }

      const fallback = {
        title: `How to use „${german}“ (${level})`,
        body: `Use „${german}“ (${translation}) naturally in ${level} speaking and writing tasks.`,
        sentenceBreakdowns: existingExampleDe
          ? [{ german: existingExampleDe, translation: `Example using "${translation}"` }]
          : [],
        grammarNotes: [
          {
            pattern: german,
            explanation: `Pay attention to the article/capitalization (nouns are capitalized in German) and common verb pairings.`,
          },
        ],
      };

      if (db.aiConfig.provider === "demo") {
        return NextResponse.json({ usage: fallback, cached: false });
      }

      const aiRes = await generateWithAi(db.aiConfig, {
        messages: [
          {
            role: "system",
            content: `You are a practical German ${level} vocabulary tutor. Show clearly how to use a German word in real everyday & exam sentences. Output ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Explain how to use the German ${level} word/phrase „${german}“ (meaning: "${translation}") in sentences for a learner whose support language is ${lang}.

Return ONLY valid JSON:
{
  "title": "How to use „${german}“ (${level})",
  "body": "1-2 concise sentences in ${lang} explaining key collocations, preposition/case requirements, plural/conjugation, or common pitfalls.",
  "sentenceBreakdowns": [
    { "german": "Natural ${level} German sentence #1 using ${german}", "translation": "Natural ${lang} translation" },
    { "german": "Natural ${level} German sentence #2 (different context, e.g. email or speaking)", "translation": "Natural ${lang} translation" },
    { "german": "Natural ${level} German sentence #3 (slightly richer ${level} phrasing)", "translation": "Natural ${lang} translation" }
  ],
  "grammarNotes": [
    { "pattern": "Grammar / Collocation Tip (e.g. Plural, Präposition + Kasus, Trennbares Verb)", "explanation": "Clear concise tip in ${lang}" }
  ]
}`,
          },
        ],
        temperature: 0.4,
        jsonMode: true,
      });

      const parsed = extractJsonObject<typeof fallback>(aiRes.text);
      const usage = parsed?.sentenceBreakdowns?.length
        ? {
            title: parsed.title || fallback.title,
            body: parsed.body || fallback.body,
            sentenceBreakdowns: parsed.sentenceBreakdowns.slice(0, 3),
            grammarNotes: Array.isArray(parsed.grammarNotes)
              ? parsed.grammarNotes.slice(0, 2)
              : undefined,
          }
        : fallback;

      setCachedEntry(cacheKey, usage);
      return NextResponse.json({ usage, cached: false });
    }

    if (action === "add_vocab") {
      const german = String(body.german ?? "").trim();
      const translation = String(body.translation ?? "").trim();
      const categoryId = String(body.categoryId ?? "voc-education").trim();
      const exampleDe = String(body.exampleDe ?? "").trim() || undefined;
      const requestedSource =
        body.source === "reading_click" ? "reading_click" : "custom";

      if (!german || !translation) {
        return NextResponse.json(
          { error: "Both German word and translation are required." },
          { status: 400 }
        );
      }

      const normGerman = german.toLowerCase();
      const existingIdx = pool.customVocabItems.findIndex(
        (i) => i.german.trim().toLowerCase() === normGerman
      );

      let savedItem: VocabPoolItem;
      if (existingIdx >= 0) {
        const existing = pool.customVocabItems[existingIdx];
        savedItem = {
          ...existing,
          translation: existing.translation || translation,
          exampleDe: existing.exampleDe || exampleDe,
          source:
            requestedSource === "reading_click"
              ? "reading_click"
              : existing.source,
        };
        pool.customVocabItems[existingIdx] = savedItem;
      } else {
        savedItem = {
          id: `${requestedSource === "reading_click" ? "read-v" : "custom-v"}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          categoryId,
          german,
          translation,
          exampleDe,
          level: db.profile.targetLevel || "B1",
          source: requestedSource,
        };
        pool.customVocabItems.unshift(savedItem);
      }

      writePracticePool(pool);

      return NextResponse.json({
        item: {
          ...savedItem,
          stats: pool.vocabStats[savedItem.id] ?? {
            correctStreak: 0,
            totalCorrect: 0,
            totalWrong: 0,
            needsRetry: false,
          },
        },
        vocabItems: getMergedVocabPool(db),
      });
    }

    if (action === "delete_custom_vocab") {
      const wordId = String(body.wordId ?? "");
      pool.customVocabItems = pool.customVocabItems.filter(
        (i) => i.id !== wordId
      );
      delete pool.vocabStats[wordId];
      writePracticePool(pool);
      return NextResponse.json({
        vocabItems: getMergedVocabPool(db),
      });
    }

    if (action === "generate_more_vocab") {
      const categoryId = String(body.categoryId ?? "voc-work");
      const catMeta =
        B1_VOCAB_CATEGORIES_META.find((c) => c.id === categoryId) ??
        B1_VOCAB_CATEGORIES_META[0];
      const existingMerged = getMergedVocabPool(db);
      const existingGerman = new Set(
        existingMerged.map((w) => w.german.trim().toLowerCase())
      );
      const existingList = existingMerged
        .filter((w) => w.categoryId === categoryId)
        .map((w) => w.german)
        .slice(0, 40)
        .join(", ");

      const level = db.profile.targetLevel || "B1";
      const lang = db.profile.nativeLanguage || "English";

      if (db.aiConfig.provider === "demo") {
        return NextResponse.json(
          {
            error:
              "Connect Gemini, Groq, or Ollama in Settings to generate fresh AI vocabulary.",
          },
          { status: 400 }
        );
      }

      const aiRes = await generateWithAi(db.aiConfig, {
        messages: [
          {
            role: "system",
            content: `You are a Goethe-Zertifikat ${level} vocabulary curriculum expert. Generate authentic, high-frequency ${level} German vocabulary with articles for nouns. Output ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Generate 10 NEW, practical Goethe ${level} German words/expressions for the topic category:
"${catMeta.titleDe} (${catMeta.titleEn})"

DO NOT repeat any of these existing words:
${existingList || "(none)"}

Return ONLY valid JSON:
{
  "words": [
    {
      "german": "German word with article for nouns (e.g. 'die Vereinbarung', 'beantragen', 'zuverlässig')",
      "translation": "Short, clear ${lang} translation (2-5 words, great for a matching game)",
      "exampleDe": "One natural ${level} German example sentence using this word."
    }
  ]
}`,
          },
        ],
        temperature: 0.7,
        jsonMode: true,
      });

      const parsed = extractJsonObject<{
        words?: Array<{ german: string; translation: string; exampleDe?: string }>;
      }>(aiRes.text);

      const added: VocabPoolItem[] = [];
      for (const w of parsed?.words ?? []) {
        if (!w?.german?.trim() || !w?.translation?.trim()) continue;
        const key = w.german.trim().toLowerCase();
        if (existingGerman.has(key)) continue;
        existingGerman.add(key);

        const item: VocabPoolItem = {
          id: `ai-v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          categoryId,
          german: w.german.trim(),
          translation: w.translation.trim(),
          exampleDe: w.exampleDe?.trim() || undefined,
          level,
          source: "ai",
        };
        pool.customVocabItems.unshift(item);
        added.push(item);
      }

      writePracticePool(pool);
      return NextResponse.json({
        addedCount: added.length,
        vocabItems: getMergedVocabPool(db),
      });
    }

    if (action === "record_grammar_result") {
      const itemId = String(body.itemId ?? "");
      const standardId = String(body.standardId ?? "");
      const correct = Boolean(body.correct);
      if (!itemId) {
        return NextResponse.json({ error: "itemId required" }, { status: 400 });
      }

      const prev = pool.grammarStats[itemId] ?? {
        correctStreak: 0,
        totalCorrect: 0,
        totalWrong: 0,
        needsRetry: false,
      };

      const nextStreak = correct ? prev.correctStreak + 1 : 0;
      const nextStats = {
        correctStreak: nextStreak,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        totalWrong: prev.totalWrong + (correct ? 0 : 1),
        needsRetry: !correct ? true : prev.needsRetry && nextStreak < 2,
        lastPracticedAt: now,
      };

      pool.grammarStats[itemId] = nextStats;
      writePracticePool(pool);

      let updatedDb = db;
      if (standardId) {
        updatedDb = updateDb((state) => {
          const std = state.mastery.grammarStandards.find(
            (g) => g.id === standardId
          );
          if (std) {
            std.practiceCount += 1;
            std.lastPracticedAt = now;
            if (correct) {
              std.masteryPct = Math.min(100, std.masteryPct + (nextStreak >= 2 ? 4 : 2));
            } else {
              std.masteryPct = Math.max(5, std.masteryPct - 1);
            }
            state.mastery.updatedAt = now;
          }
        });
      }

      return NextResponse.json({
        stats: nextStats,
        readiness: computeReadinessMetrics(
          updatedDb.mastery,
          updatedDb.memory,
          updatedDb.profile
        ),
        grammarStandards: updatedDb.mastery.grammarStandards,
      });
    }

    if (action === "generate_more_grammar") {
      const standardId = String(body.standardId ?? "gram-nebensatz");
      const std =
        db.mastery.grammarStandards.find((g) => g.id === standardId) ??
        db.mastery.grammarStandards[0];
      const level = db.profile.targetLevel || "B1";
      const lang = db.profile.nativeLanguage || "English";

      if (db.aiConfig.provider === "demo") {
        return NextResponse.json(
          {
            error:
              "Connect Gemini, Groq, or Ollama in Settings to generate fresh AI grammar drills.",
          },
          { status: 400 }
        );
      }

      const aiRes = await generateWithAi(db.aiConfig, {
        messages: [
          {
            role: "system",
            content: `You are a Goethe-Zertifikat ${level} German grammar examiner. Create crystal-clear multiple-choice fill-in-the-blank grammar drills with ONE unambiguously correct option. Output ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Create 6 fresh ${level} German grammar drill questions testing:
"${std.titleDe}" (${std.description})
Example: "${std.exampleDe}"

Return ONLY valid JSON:
{
  "items": [
    {
      "promptDe": "German sentence with ___ for the missing word/form",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "correctSentenceDe": "Full complete correct German sentence",
      "explanationEn": "Concise 1-2 sentence explanation in ${lang} of WHY this grammar form is right",
      "ruleTag": "Short German rule label (3-5 words)"
    }
  ]
}`,
          },
        ],
        temperature: 0.65,
        jsonMode: true,
      });

      const parsed = extractJsonObject<{
        items?: Array<{
          promptDe: string;
          options: string[];
          correctIndex: number;
          correctSentenceDe: string;
          explanationEn: string;
          ruleTag?: string;
        }>;
      }>(aiRes.text);

      const added: GrammarDrillItem[] = [];
      for (const q of parsed?.items ?? []) {
        if (
          !q?.promptDe ||
          !Array.isArray(q.options) ||
          q.options.length < 3 ||
          typeof q.correctIndex !== "number"
        ) {
          continue;
        }
        const safeIdx = Math.max(
          0,
          Math.min(q.options.length - 1, Math.round(q.correctIndex))
        );
        const item: GrammarDrillItem = {
          id: `ai-g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          standardId: std.id,
          promptDe: q.promptDe.trim(),
          options: q.options.slice(0, 4).map((o) => String(o).trim()),
          correctIndex: safeIdx,
          correctSentenceDe: q.correctSentenceDe?.trim() || q.promptDe.trim(),
          explanationEn: q.explanationEn?.trim() || std.description,
          ruleTag: q.ruleTag?.trim() || std.titleDe,
          source: "ai",
        };
        pool.customGrammarItems.unshift(item);
        added.push(item);
      }

      writePracticePool(pool);
      return NextResponse.json({
        addedCount: added.length,
        grammarItems: getMergedGrammarPool(),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Practice pool action failed" },
      { status: 500 }
    );
  }
}
