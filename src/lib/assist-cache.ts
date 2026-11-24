import fs from "fs";
import path from "path";
import type { DrillAssistResult } from "./ai/drills";

export interface LesenReaderPack {
  exerciseId: string;
  level: string;
  lang: string;
  generatedAt: string;
  fullTranslation: DrillAssistResult;
  sentences: Record<string, DrillAssistResult>; // key: normalizeKey(sentenceDe)
  words: Record<string, DrillAssistResult>; // key: normalizeKey(wordDe)
}

interface AssistCacheDiskSchema {
  version: number;
  updatedAt: string;
  entries: Record<string, DrillAssistResult>;
  readerPacks: Record<string, LesenReaderPack>;
  genericEntries: Record<string, unknown>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_PATH = path.join(DATA_DIR, "assist-cache.json");

const globalForAssistCache = globalThis as unknown as {
  __sprachcoachAssistCache?: AssistCacheDiskSchema;
};

export function normalizeCacheText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[„“"‚‘'»«()[\]{}]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[.,;:!?]+|[.,;:!?]+$/g, "")
    .trim();
}

export function makePackKey(
  exerciseId: string,
  lang: string,
  level: string
): string {
  return `${exerciseId}::${lang.toLowerCase()}::${level.toUpperCase()}`;
}

export function makeTranslateKey(
  exerciseId: string,
  lang: string,
  level: string
): string {
  return `translate::${exerciseId}::${lang.toLowerCase()}::${level.toUpperCase()}`;
}

export function makeModelAnswerKey(
  exerciseId: string,
  lang: string,
  level: string
): string {
  return `model_answer::${exerciseId}::${lang.toLowerCase()}::${level.toUpperCase()}`;
}

export function makeQuestionAssistKey(
  mode: "analyze_answer" | "explain_question",
  exerciseId: string,
  questionId: string,
  lang: string
): string {
  return `${mode}::${exerciseId}::${questionId}::${lang.toLowerCase()}`;
}

export function makeSelectionEntryKey(
  exerciseId: string,
  selectionType: "word" | "phrase" | "sentence",
  selectedText: string,
  lang: string,
  level: string
): string {
  return `sel::${exerciseId}::${selectionType}::${normalizeCacheText(
    selectedText
  )}::${lang.toLowerCase()}::${level.toUpperCase()}`;
}

function emptyCache(): AssistCacheDiskSchema {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    entries: {},
    readerPacks: {},
    genericEntries: {},
  };
}

function loadCacheFromDisk(): AssistCacheDiskSchema {
  if (globalForAssistCache.__sprachcoachAssistCache) {
    return globalForAssistCache.__sprachcoachAssistCache;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CACHE_PATH)) {
      const initial = emptyCache();
      globalForAssistCache.__sprachcoachAssistCache = initial;
      return initial;
    }
    const raw = fs.readFileSync(CACHE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<AssistCacheDiskSchema>;
    const normalized: AssistCacheDiskSchema = {
      version: parsed.version ?? 1,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      entries:
        parsed.entries && typeof parsed.entries === "object"
          ? parsed.entries
          : {},
      readerPacks:
        parsed.readerPacks && typeof parsed.readerPacks === "object"
          ? parsed.readerPacks
          : {},
      genericEntries:
        parsed.genericEntries && typeof parsed.genericEntries === "object"
          ? parsed.genericEntries
          : {},
    };
    globalForAssistCache.__sprachcoachAssistCache = normalized;
    return normalized;
  } catch {
    const initial = emptyCache();
    globalForAssistCache.__sprachcoachAssistCache = initial;
    return initial;
  }
}

function saveCacheToDisk(cache: AssistCacheDiskSchema): void {
  cache.updatedAt = new Date().toISOString();
  globalForAssistCache.__sprachcoachAssistCache = cache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const serialized = JSON.stringify(cache, null, 2);
  const tmpPath = `${CACHE_PATH}.${process.pid}.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 6)}.tmp`;
  try {
    fs.writeFileSync(tmpPath, serialized, "utf-8");
    fs.renameSync(tmpPath, CACHE_PATH);
  } catch {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      // ignore cleanup error
    }
    // Windows fallback if AV/indexer momentarily locks rename
    fs.writeFileSync(CACHE_PATH, serialized, "utf-8");
  }
}

export function isFallbackAssistResult(
  result: DrillAssistResult | null | undefined
): boolean {
  if (!result || !result.body?.trim()) return true;
  const b = result.body.toLowerCase();
  return (
    b.includes("connect an ai provider in settings") ||
    b.includes("connect gemini, groq") ||
    b.includes("selected german text:") && b.includes("in settings")
  );
}

export function makeGlobalWordCacheKey(word: string, lang: string): string {
  return `global_word::${normalizeCacheText(word)}::${lang.toLowerCase()}`;
}

export function getCachedEntry(key: string): DrillAssistResult | null {
  const cache = loadCacheFromDisk();
  const hit = cache.entries[key] ?? null;
  if (hit && isFallbackAssistResult(hit)) {
    delete cache.entries[key];
    saveCacheToDisk(cache);
    return null;
  }
  return hit;
}

export function setCachedEntry(key: string, result: DrillAssistResult): void {
  if (isFallbackAssistResult(result)) return;
  const cache = loadCacheFromDisk();
  cache.entries[key] = result;
  saveCacheToDisk(cache);
}

export function setCachedEntriesBatch(
  updates: Array<{ key: string; result: DrillAssistResult }>
): void {
  const clean = updates.filter((u) => !isFallbackAssistResult(u.result));
  if (clean.length === 0) return;
  const cache = loadCacheFromDisk();
  for (const { key, result } of clean) {
    cache.entries[key] = result;
  }
  saveCacheToDisk(cache);
}

export function getGenericCached<T>(key: string): T | null {
  const cache = loadCacheFromDisk();
  return key in cache.genericEntries ? (cache.genericEntries[key] as T) : null;
}

export function setGenericCached(key: string, value: unknown): void {
  const cache = loadCacheFromDisk();
  cache.genericEntries[key] = value;
  saveCacheToDisk(cache);
}

export function getReaderPack(
  exerciseId: string,
  lang: string,
  level: string
): LesenReaderPack | null {
  const cache = loadCacheFromDisk();
  return cache.readerPacks[makePackKey(exerciseId, lang, level)] ?? null;
}

export function saveReaderPack(pack: LesenReaderPack): void {
  const cache = loadCacheFromDisk();
  const key = makePackKey(pack.exerciseId, pack.lang, pack.level);
  cache.readerPacks[key] = pack;
  // Also populate translate_passage entry for instant hits
  cache.entries[makeTranslateKey(pack.exerciseId, pack.lang, pack.level)] =
    pack.fullTranslation;
  saveCacheToDisk(cache);
}

export function listCachedReaderPackExerciseIds(
  lang: string,
  level: string
): string[] {
  const cache = loadCacheFromDisk();
  const suffix = `::${lang.toLowerCase()}::${level.toUpperCase()}`;
  const ids: string[] = [];
  for (const [k, pack] of Object.entries(cache.readerPacks)) {
    if (k.endsWith(suffix) && pack?.exerciseId) {
      ids.push(pack.exerciseId);
    }
  }
  return ids;
}

export function lookupCachedSelection(params: {
  exerciseId: string;
  selectionType: "word" | "phrase" | "sentence";
  selectedText: string;
  lang: string;
  level: string;
}): DrillAssistResult | null {
  const { exerciseId, selectionType, selectedText, lang, level } = params;
  const cache = loadCacheFromDisk();

  // 1. Exact per-click cached entry
  const directKey = makeSelectionEntryKey(
    exerciseId,
    selectionType,
    selectedText,
    lang,
    level
  );
  if (cache.entries[directKey]) {
    if (isFallbackAssistResult(cache.entries[directKey])) {
      delete cache.entries[directKey];
      saveCacheToDisk(cache);
    } else {
      return cache.entries[directKey];
    }
  }

  // 2. Pre-computed Lesen Reader Pack lookup
  const pack = cache.readerPacks[makePackKey(exerciseId, lang, level)];
  if (!pack) return null;

  const norm = normalizeCacheText(selectedText);
  if (!norm) return null;

  if (selectionType === "word") {
    if (pack.words[norm]) return pack.words[norm];
    // Try base match if word has trailing hyphen or punctuation
    const stripped = norm.replace(/^-+|-+$/g, "");
    if (pack.words[stripped]) return pack.words[stripped];
    return null;
  }

  if (pack.sentences[norm]) {
    return pack.sentences[norm];
  }

  // Fuzzy containment check for slight punctuation/quote differences in sentences
  if (selectionType === "sentence" && norm.length >= 15) {
    for (const [sentKey, val] of Object.entries(pack.sentences)) {
      if (sentKey.includes(norm) || norm.includes(sentKey)) {
        return val;
      }
    }
  }

  return null;
}

export function listCachedExerciseIdsForSkill(
  exercises: Array<{ id: string; skill: string; questions?: Array<{ id: string }> }>,
  lang: string,
  level: string
): string[] {
  const cache = loadCacheFromDisk();
  const ids: string[] = [];
  for (const ex of exercises) {
    if (ex.skill === "lesen") {
      const hasPack = Boolean(
        cache.readerPacks[makePackKey(ex.id, lang, level)]
      );
      const qList = ex.questions ?? [];
      const hasAllQs =
        qList.length === 0 ||
        qList.every((q) =>
          Boolean(
            cache.entries[
              makeQuestionAssistKey("analyze_answer", ex.id, q.id, lang)
            ]
          )
        );
      if (hasPack && hasAllQs) {
        ids.push(ex.id);
      }
    } else if (ex.skill === "hoeren") {
      const qList = ex.questions ?? [];
      const hasAllQs =
        qList.length > 0 &&
        qList.every((q) =>
          Boolean(
            cache.entries[
              makeQuestionAssistKey("analyze_answer", ex.id, q.id, lang)
            ]
          )
        );
      if (hasAllQs) {
        ids.push(ex.id);
      }
    }
  }
  return ids;
}

/**
 * Returns a flat client-ready map of all cached word/sentence/phrase explanations,
 * full translation, full answer key / model answer, and per-question answer analyses
 * so the frontend gets 0ms clicks with ZERO repeat API usage!
 */
export function buildClientHydrationPayload(
  exerciseId: string,
  lang: string,
  level: string
): {
  isPrecomputed: boolean;
  fullTranslation: DrillAssistResult | null;
  modelAnswer: DrillAssistResult | null;
  questionAnalyses: Record<string, DrillAssistResult>;
  questionExplains: Record<string, DrillAssistResult>;
  selectionEntries: Record<string, DrillAssistResult>;
  wordCount: number;
  sentenceCount: number;
  cachedQuestionCount: number;
} {
  const cache = loadCacheFromDisk();
  const pack = cache.readerPacks[makePackKey(exerciseId, lang, level)] ?? null;
  const fullTranslation =
    pack?.fullTranslation ??
    cache.entries[makeTranslateKey(exerciseId, lang, level)] ??
    null;
  const modelAnswer =
    cache.entries[makeModelAnswerKey(exerciseId, lang, level)] ?? null;

  const selectionEntries: Record<string, DrillAssistResult> = {};
  const questionAnalyses: Record<string, DrillAssistResult> = {};
  const questionExplains: Record<string, DrillAssistResult> = {};

  if (pack) {
    for (const [normWord, res] of Object.entries(pack.words)) {
      selectionEntries[`${exerciseId}::word::${normWord}`] = res;
    }
    for (const [normSent, res] of Object.entries(pack.sentences)) {
      selectionEntries[`${exerciseId}::sentence::${normSent}`] = res;
    }
  }

  const selPrefix = `sel::${exerciseId}::`;
  const selSuffix = `::${lang.toLowerCase()}::${level.toUpperCase()}`;
  const analyzePrefix = `analyze_answer::${exerciseId}::`;
  const explainPrefix = `explain_question::${exerciseId}::`;
  const langSuffix = `::${lang.toLowerCase()}`;

  for (const [k, res] of Object.entries(cache.entries)) {
    if (k.startsWith(selPrefix) && k.endsWith(selSuffix)) {
      const middle = k.slice(selPrefix.length, k.length - selSuffix.length);
      selectionEntries[`${exerciseId}::${middle}`] = res;
    } else if (k.startsWith(analyzePrefix) && k.endsWith(langSuffix)) {
      const qId = k.slice(analyzePrefix.length, k.length - langSuffix.length);
      questionAnalyses[qId] = res;
    } else if (k.startsWith(explainPrefix) && k.endsWith(langSuffix)) {
      const qId = k.slice(explainPrefix.length, k.length - langSuffix.length);
      questionExplains[qId] = res;
    }
  }

  const cachedQuestionCount = Object.keys(questionAnalyses).length;

  return {
    isPrecomputed: Boolean(pack) || cachedQuestionCount > 0,
    fullTranslation,
    modelAnswer,
    questionAnalyses,
    questionExplains,
    selectionEntries,
    wordCount: pack ? Object.keys(pack.words).length : 0,
    sentenceCount: pack ? Object.keys(pack.sentences).length : 0,
    cachedQuestionCount,
  };
}
