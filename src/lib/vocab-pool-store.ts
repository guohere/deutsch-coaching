import fs from "fs";
import path from "path";
import { DatabaseSchema } from "./types";
import {
  BUILTIN_B1_GRAMMAR_BANK,
  BUILTIN_B1_VOCAB_BANK,
  CORE_MUST_WRITE_IDS,
  GrammarDrillItem,
  VocabPoolItem,
} from "./vocab-grammar-bank";

export interface PracticeItemStats {
  correctStreak: number; // consecutive correct matches; daily goal is 3x today
  totalCorrect: number;
  totalWrong: number;
  needsRetry: boolean; // true whenever wrong until completed cleanly 3x in a day
  // Multi-day Spaced Repetition (SRS):
  // Complete 3x correct in one day -> rests until tomorrow ("Done for today"),
  // Complete across 3 distinct days -> permanently Mastered!
  todayDate?: string; // "YYYY-MM-DD"
  todayCorrectCount?: number; // 0..3+ correct matches on todayDate
  masteredDays?: string[]; // distinct "YYYY-MM-DD" dates where 3x daily goal was achieved
  nextReviewDate?: string; // "YYYY-MM-DD" earliest date word should reappear
  mastered?: boolean; // true once masteredDays.length >= 3
  writeStreak?: number; // consecutive correct active-recall writes; mastered at >= 2
  writeCorrect?: number;
  writeWrong?: number;
  writeNeedsRetry?: boolean;
  lastPracticedAt?: string;
}

export function getDateKeyOffset(baseDateKey: string, addDays: number): string {
  const parts = baseDateKey.split("-").map(Number);
  const dt =
    parts.length === 3 && parts.every((n) => Number.isFinite(n))
      ? new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]))
      : new Date();
  dt.setUTCDate(dt.getUTCDate() + addDays);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface PracticePoolDiskSchema {
  version: number;
  updatedAt: string;
  customVocabItems: VocabPoolItem[];
  customGrammarItems: GrammarDrillItem[];
  vocabStats: Record<string, PracticeItemStats>;
  grammarStats: Record<string, PracticeItemStats>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const POOL_PATH = path.join(DATA_DIR, "practice-pool.json");

const globalForPool = globalThis as unknown as {
  __sprachcoachPracticePool?: PracticePoolDiskSchema;
};

function emptyPool(): PracticePoolDiskSchema {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    customVocabItems: [],
    customGrammarItems: [],
    vocabStats: {},
    grammarStats: {},
  };
}

export function readPracticePool(): PracticePoolDiskSchema {
  if (globalForPool.__sprachcoachPracticePool) {
    return globalForPool.__sprachcoachPracticePool;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(POOL_PATH)) {
      const initial = emptyPool();
      globalForPool.__sprachcoachPracticePool = initial;
      return initial;
    }
    const raw = fs.readFileSync(POOL_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<PracticePoolDiskSchema>;
    const normalized: PracticePoolDiskSchema = {
      version: parsed.version ?? 1,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      customVocabItems: Array.isArray(parsed.customVocabItems)
        ? parsed.customVocabItems
        : [],
      customGrammarItems: Array.isArray(parsed.customGrammarItems)
        ? parsed.customGrammarItems
        : [],
      vocabStats:
        parsed.vocabStats && typeof parsed.vocabStats === "object"
          ? parsed.vocabStats
          : {},
      grammarStats:
        parsed.grammarStats && typeof parsed.grammarStats === "object"
          ? parsed.grammarStats
          : {},
    };
    globalForPool.__sprachcoachPracticePool = normalized;
    return normalized;
  } catch {
    const initial = emptyPool();
    globalForPool.__sprachcoachPracticePool = initial;
    return initial;
  }
}

export function writePracticePool(pool: PracticePoolDiskSchema): void {
  pool.updatedAt = new Date().toISOString();
  globalForPool.__sprachcoachPracticePool = pool;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const serialized = JSON.stringify(pool, null, 2);
  const tmpPath = `${POOL_PATH}.${process.pid}.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 6)}.tmp`;
  try {
    fs.writeFileSync(tmpPath, serialized, "utf-8");
    fs.renameSync(tmpPath, POOL_PATH);
  } catch {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      // ignore
    }
    fs.writeFileSync(POOL_PATH, serialized, "utf-8");
  }
}

export function inferVocabCategoryFromTopic(topic: string): string {
  const t = (topic || "").toLowerCase();
  if (/jobsuche|lebenslauf|anschreiben|vorstellungsgespräch|berufseinsteiger|masterarbeit|probezeit|initiativbewerbung|karriere|stellenanzeige|portfolio/.test(t)) return "voc-jobsearch";
  if (/bank|konto|überweis|finanz|iban|dauerauftrag|lastschrift|zins|kredit|geldautomat|bargeld|giro/.test(t)) return "voc-banking";
  if (/essen|restaurant|café|bäckerei|speisekarte|trinkgeld|kellner|gericht|frühstück|abendbrot|imbiss|kantine|menü|beilage|bestellen/.test(t)) return "voc-food";
  if (/arbeit|beruf|bewerb|büro|job|firma|homeoffice|vier-tage/.test(t)) return "voc-work";
  if (/wohn|miet|nachbar|haus|alltag|umzug/.test(t)) return "voc-living";
  if (/gesund|ernähr|sport|arzt|krank|fitness|schlaf/.test(t)) return "voc-health";
  if (/reis|verkehr|bahn|zug|auto|urlaub|mobil|carsharing/.test(t)) return "voc-travel";
  if (/umwelt|natur|konsum|klima|müll|einkauf|shopping|becher|plastik/.test(t)) return "voc-environment";
  if (/medien|digital|internet|handy|smartphone|app|kommunikation|social/.test(t)) return "voc-media";
  if (/freizeit|kultur|fest|konzert|museum|hobby|verein|kino|party/.test(t)) return "voc-leisure";
  return "voc-education";
}

export interface EnrichedVocabPoolItem extends VocabPoolItem {
  stats: PracticeItemStats;
}

export interface EnrichedGrammarDrillItem extends GrammarDrillItem {
  stats: PracticeItemStats;
}

const DEFAULT_STATS: PracticeItemStats = {
  correctStreak: 0,
  totalCorrect: 0,
  totalWrong: 0,
  needsRetry: false,
};

export function getMergedVocabPool(db: DatabaseSchema): EnrichedVocabPoolItem[] {
  const pool = readPracticePool();
  const seen = new Set<string>();
  const merged: VocabPoolItem[] = [];

  const pushUnique = (item: VocabPoolItem) => {
    const key = item.german.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  };

  // 1. User custom & AI-expanded vocab first
  for (const item of pool.customVocabItems) {
    pushUnique(item);
  }

  // 2. Learner Memory vocabulary saved from Lesen/Schreiben/Chat
  for (const mv of db.memory.vocabulary) {
    if (!mv.german?.trim() || !mv.meaning?.trim()) continue;
    pushUnique({
      id: `mem-${mv.id}`,
      categoryId: inferVocabCategoryFromTopic(mv.topic || ""),
      german: mv.german.trim(),
      translation: mv.meaning.trim(),
      exampleDe: mv.exampleDe?.trim() || undefined,
      level: db.profile.targetLevel || "B1",
      source: "memory",
    });
  }

  // 3. Built-in 120 B1 words across all 8 official categories
  for (const item of BUILTIN_B1_VOCAB_BANK) {
    pushUnique({
      ...item,
      isCoreMustWrite: item.isCoreMustWrite ?? CORE_MUST_WRITE_IDS.has(item.id),
    });
  }

  return merged.map((item) => ({
    ...item,
    isCoreMustWrite:
      item.isCoreMustWrite ??
      (CORE_MUST_WRITE_IDS.has(item.id) || item.source === "custom"),
    stats: pool.vocabStats[item.id] ?? { ...DEFAULT_STATS },
  }));
}

export function getMergedGrammarPool(): EnrichedGrammarDrillItem[] {
  const pool = readPracticePool();
  const all = [...pool.customGrammarItems, ...BUILTIN_B1_GRAMMAR_BANK];
  return all.map((item) => ({
    ...item,
    stats: pool.grammarStats[item.id] ?? { ...DEFAULT_STATS },
  }));
}

/**
 * Evidence-based recalculation of all 8 Topic Category vocabulary percentages:
 * - 75% weight: Real multi-day SRS word mastery + active writing mastery in that topic's pool
 *   (Day 0 started = 8–16%, Day 1 done 3x = 28%, Day 2 = 52%, Day 3 Mastered = 75%, + Write 2x = +25%)
 * - 25% weight: Unique exam drills (Hören/Lesen/Schreiben) & Speaking sessions completed in that topic
 *
 * Prevents single-day matching or repeated drills from inflating a category to 90–100%.
 */
export function recalculateVocabCategoriesFromEvidence(
  db: DatabaseSchema
): void {
  // Ensure newly added everyday B1 categories (e.g. Banking & Food) exist in legacy DBs
  const defaultExtras = [
    {
      id: "voc-banking",
      titleDe: "Bank, Geld & Finanzen",
      titleEn: "Banking, Accounts & Transfers",
      targetWords: 260,
      masteredWords: 0,
      sampleWords: [
        "das Girokonto",
        "überweisen",
        "der Dauerauftrag",
        "die Kontoführungsgebühr",
        "Geld abheben",
        "der Kontoauszug",
      ],
      progressPct: 0,
    },
    {
      id: "voc-food",
      titleDe: "Essen, Trinken & Restaurant",
      titleEn: "Food, Dining & Restaurants",
      targetWords: 280,
      masteredWords: 0,
      sampleWords: [
        "die Speisekarte",
        "bestellen",
        "das Trinkgeld",
        "getrennt bezahlen",
        "die Reservierung",
        "die Beilage",
      ],
      progressPct: 0,
    },
    {
      id: "voc-jobsearch",
      titleDe: "Jobsuche, Bewerbung & KI-Karriere",
      titleEn: "Job Search, Applications & AI Career",
      targetWords: 260,
      masteredWords: 0,
      sampleWords: [
        "der Lebenslauf",
        "das Anschreiben",
        "der Berufseinsteiger",
        "die Stellenanzeige",
        "die Probezeit",
        "die Rückmeldung",
      ],
      progressPct: 0,
    },
  ];
  for (const extra of defaultExtras) {
    if (!db.mastery.vocabCategories.some((c) => c.id === extra.id)) {
      db.mastery.vocabCategories.push({ ...extra });
    }
  }

  const allWords = getMergedVocabPool(db);

  // Group unique completed drill & speaking scores by vocabCategoryId
  const uniqueTaskScoresByCat = new Map<string, Map<string, number>>();
  for (const cat of db.mastery.vocabCategories) {
    uniqueTaskScoresByCat.set(cat.id, new Map());
  }

  for (const d of db.drillHistory) {
    const catId =
      d.exercise.vocabCategoryId ||
      inferVocabCategoryFromTopic(`${d.exercise.topicDe} ${d.exercise.title}`);
    const taskMap = uniqueTaskScoresByCat.get(catId);
    if (!taskMap) continue;
    const taskKey = `drill:${d.exerciseId || d.exercise.title}`;
    const prev = taskMap.get(taskKey);
    if (prev === undefined || d.grade.score > prev) {
      taskMap.set(taskKey, d.grade.score);
    }
  }

  for (const s of db.sessions) {
    if (!s.completedAt || !s.debrief) continue;
    const catId = inferVocabCategoryFromTopic(s.moduleTitle);
    const taskMap = uniqueTaskScoresByCat.get(catId);
    if (!taskMap) continue;
    const taskKey = `speak:${s.moduleId || s.moduleTitle}`;
    const prev = taskMap.get(taskKey);
    if (prev === undefined || s.debrief.overallScore > prev) {
      taskMap.set(taskKey, s.debrief.overallScore);
    }
  }

  for (const cat of db.mastery.vocabCategories) {
    // Fix legacy article typo if present in existing DB
    if (cat.sampleWords?.includes("die Datenschutz")) {
      cat.sampleWords = cat.sampleWords.map((w) =>
        w === "die Datenschutz" ? "der Datenschutz" : w
      );
    }

    const catWords = allWords.filter((w) => w.categoryId === cat.id);
    const denominator = Math.max(15, catWords.length);

    let earnedUnits = 0;
    for (const w of catWords) {
      const st = w.stats;
      const days =
        Array.isArray(st.masteredDays) && st.masteredDays.length > 0
          ? st.masteredDays.length
          : st.correctStreak >= 3
          ? 1
          : 0;
      const todayHits =
        typeof st.todayCorrectCount === "number"
          ? st.todayCorrectCount
          : st.correctStreak > 0
          ? Math.min(3, st.correctStreak)
          : 0;
      const writeStreak = st.writeStreak ?? 0;

      if (st.needsRetry || st.writeNeedsRetry) {
        // Missed word waiting for repeat gets minimal credit until cleared
        earnedUnits += 0.06;
        continue;
      }

      // Multi-day recognition mastery (max 0.75 per word; Day 1 = 0.28, Day 2 = 0.52, Day 3 = 0.75)
      let recognitionCredit = 0;
      if (st.mastered || days >= 3) recognitionCredit = 0.75;
      else if (days === 2) recognitionCredit = 0.52;
      else if (days === 1) recognitionCredit = 0.28;
      else if (todayHits >= 2) recognitionCredit = 0.16;
      else if (todayHits === 1) recognitionCredit = 0.08;

      // Active writing production mastery (max +0.25 per word)
      let writeCredit = 0;
      if (writeStreak >= 2) writeCredit = 0.25;
      else if (writeStreak === 1) writeCredit = 0.12;

      earnedUnits += Math.min(1.0, recognitionCredit + writeCredit);
    }

    const vocabPoolPct = Math.min(100, (earnedUnits / denominator) * 100);

    // Contextual exposure from unique exam drills & speaking sessions in this topic (max 25% of total)
    const taskScores = Array.from(
      uniqueTaskScoresByCat.get(cat.id)?.values() ?? []
    );
    let contextualPct = 0;
    if (taskScores.length > 0) {
      const avgTaskScore =
        taskScores.reduce((a, b) => a + b, 0) / taskScores.length;
      const depthWeight =
        taskScores.length >= 3 ? 1.0 : taskScores.length === 2 ? 0.75 : 0.45;
      contextualPct = avgTaskScore * depthWeight;
    }

    const combinedPct = Math.max(
      0,
      Math.min(100, Math.round(vocabPoolPct * 0.75 + contextualPct * 0.25))
    );

    cat.progressPct = combinedPct;
    cat.masteredWords = Math.round((combinedPct / 100) * cat.targetWords);
  }
}
