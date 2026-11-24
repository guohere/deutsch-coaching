import fs from "fs";
import path from "path";
import {
  CasualInterview,
  CURATED_B1_INTERVIEWS,
  CURATED_B1_QA_DRILLS,
  QaReflexDrill,
} from "./speaking-practice-bank";

export interface CollectedSpeakingPhrase {
  id: string;
  categoryId: string;
  german: string;
  patternDe?: string;
  meaningEn: string;
  spokenExampleDe?: string;
  emailBridgeDe?: string;
  emailBridgeEn?: string;
  sourceLabel: string; // e.g. "Interview: Neuer Job" or "Q&A Reflex"
  correctStreak: number;
  totalPracticed: number;
  needsRepeat: boolean;
  lastPracticedAt?: string;
  createdAt: string;
}

export interface QaDrillStats {
  correctStreak: number;
  totalCorrect: number;
  totalWrong: number;
  needsRetry: boolean;
  lastPracticedAt?: string;
}

export interface EnrichedQaReflexDrill extends QaReflexDrill {
  stats: QaDrillStats;
}

interface SpeakingPracticeDiskSchema {
  version: number;
  updatedAt: string;
  collectedPhrases: CollectedSpeakingPhrase[];
  qaStats: Record<string, QaDrillStats>;
  customInterviews: CasualInterview[];
  customQaDrills: QaReflexDrill[];
  completedInterviews: string[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const SPEAKING_STORE_PATH = path.join(DATA_DIR, "speaking-practice.json");

const globalForSpeaking = globalThis as unknown as {
  __sprachcoachSpeakingPracticeStore?: SpeakingPracticeDiskSchema;
};

const DEFAULT_QA_STATS: QaDrillStats = {
  correctStreak: 0,
  totalCorrect: 0,
  totalWrong: 0,
  needsRetry: false,
};

function createEmptyStore(): SpeakingPracticeDiskSchema {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    collectedPhrases: [],
    qaStats: {},
    customInterviews: [],
    customQaDrills: [],
    completedInterviews: [],
  };
}

export function readSpeakingPracticeStore(): SpeakingPracticeDiskSchema {
  if (globalForSpeaking.__sprachcoachSpeakingPracticeStore) {
    return globalForSpeaking.__sprachcoachSpeakingPracticeStore;
  }

  try {
    if (fs.existsSync(SPEAKING_STORE_PATH)) {
      const parsed = JSON.parse(
        fs.readFileSync(SPEAKING_STORE_PATH, "utf-8")
      ) as Partial<SpeakingPracticeDiskSchema>;
      const store: SpeakingPracticeDiskSchema = {
        version: 1,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        collectedPhrases: Array.isArray(parsed.collectedPhrases)
          ? parsed.collectedPhrases
          : [],
        qaStats:
          parsed.qaStats && typeof parsed.qaStats === "object"
            ? parsed.qaStats
            : {},
        customInterviews: Array.isArray(parsed.customInterviews)
          ? parsed.customInterviews
          : [],
        customQaDrills: Array.isArray(parsed.customQaDrills)
          ? parsed.customQaDrills
          : [],
        completedInterviews: Array.isArray(parsed.completedInterviews)
          ? parsed.completedInterviews
          : [],
      };
      globalForSpeaking.__sprachcoachSpeakingPracticeStore = store;
      return store;
    }
  } catch {
    // fall through
  }

  const initial = createEmptyStore();
  globalForSpeaking.__sprachcoachSpeakingPracticeStore = initial;
  return initial;
}

export function writeSpeakingPracticeStore(
  store: SpeakingPracticeDiskSchema
): void {
  store.updatedAt = new Date().toISOString();
  globalForSpeaking.__sprachcoachSpeakingPracticeStore = store;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const serialized = JSON.stringify(store, null, 2);
  const tmpPath = `${SPEAKING_STORE_PATH}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tmpPath, serialized, "utf-8");
    fs.renameSync(tmpPath, SPEAKING_STORE_PATH);
  } catch {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      // ignore
    }
    fs.writeFileSync(SPEAKING_STORE_PATH, serialized, "utf-8");
  }
}

export function getMergedInterviews(): CasualInterview[] {
  const store = readSpeakingPracticeStore();
  const seen = new Set<string>();
  const out: CasualInterview[] = [];
  for (const item of [...store.customInterviews, ...CURATED_B1_INTERVIEWS]) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export function getMergedQaDrills(): EnrichedQaReflexDrill[] {
  const store = readSpeakingPracticeStore();
  const seen = new Set<string>();
  const out: EnrichedQaReflexDrill[] = [];
  for (const item of [...store.customQaDrills, ...CURATED_B1_QA_DRILLS]) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push({
      ...item,
      stats: store.qaStats[item.id] ?? { ...DEFAULT_QA_STATS },
    });
  }
  return out;
}
