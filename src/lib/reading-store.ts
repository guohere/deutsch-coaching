import fs from "fs";
import path from "path";
import {
  CURATED_B1_READING_ARTICLES,
  ReadingArticle,
  ReadingGlossaryEntry,
} from "./reading-articles-bank";
import { READING_ARTICLES_EXPANSION_A } from "./reading-articles-expansion-a";
import { READING_ARTICLES_EXPANSION_B } from "./reading-articles-expansion-b";
import { READING_ARTICLES_EXPANSION_C } from "./reading-articles-expansion-c";
import { READING_ARTICLES_EXPANSION_D } from "./reading-articles-expansion-d";

interface ReadingPracticeDiskSchema {
  version: number;
  updatedAt: string;
  customArticles: ReadingArticle[];
  readArticleIds: string[];
  articleGlossaryOverrides: Record<string, ReadingGlossaryEntry[]>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const READING_STORE_PATH = path.join(DATA_DIR, "reading-practice.json");

const globalForReading = globalThis as unknown as {
  __sprachcoachReadingStore?: ReadingPracticeDiskSchema;
};

function createEmptyStore(): ReadingPracticeDiskSchema {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    customArticles: [],
    readArticleIds: [],
    articleGlossaryOverrides: {},
  };
}

export function readReadingStore(): ReadingPracticeDiskSchema {
  if (globalForReading.__sprachcoachReadingStore) {
    return globalForReading.__sprachcoachReadingStore;
  }

  try {
    if (fs.existsSync(READING_STORE_PATH)) {
      const parsed = JSON.parse(
        fs.readFileSync(READING_STORE_PATH, "utf-8")
      ) as Partial<ReadingPracticeDiskSchema>;
      const store: ReadingPracticeDiskSchema = {
        version: 1,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        customArticles: Array.isArray(parsed.customArticles)
          ? parsed.customArticles
          : [],
        readArticleIds: Array.isArray(parsed.readArticleIds)
          ? parsed.readArticleIds
          : [],
        articleGlossaryOverrides:
          parsed.articleGlossaryOverrides &&
          typeof parsed.articleGlossaryOverrides === "object"
            ? parsed.articleGlossaryOverrides
            : {},
      };
      globalForReading.__sprachcoachReadingStore = store;
      return store;
    }
  } catch {
    // fall through to empty
  }

  const initial = createEmptyStore();
  globalForReading.__sprachcoachReadingStore = initial;
  return initial;
}

export function writeReadingStore(store: ReadingPracticeDiskSchema): void {
  store.updatedAt = new Date().toISOString();
  globalForReading.__sprachcoachReadingStore = store;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const serialized = JSON.stringify(store, null, 2);
  const tmpPath = `${READING_STORE_PATH}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tmpPath, serialized, "utf-8");
    fs.renameSync(tmpPath, READING_STORE_PATH);
  } catch {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      // ignore
    }
    fs.writeFileSync(READING_STORE_PATH, serialized, "utf-8");
  }
}

function mergeGlossaryEntries(
  base: ReadingGlossaryEntry[],
  extra?: ReadingGlossaryEntry[]
): ReadingGlossaryEntry[] {
  if (!extra || extra.length === 0) return base;
  const seen = new Set(base.map((g) => g.word.trim().toLowerCase()));
  const merged = [...base];
  for (const item of extra) {
    const key = item.word?.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

export function getMergedReadingArticles(): ReadingArticle[] {
  const store = readReadingStore();
  const overrides = store.articleGlossaryOverrides ?? {};
  const seen = new Set<string>();
  const merged: ReadingArticle[] = [];

  for (const a of store.customArticles) {
    if (!a.id || seen.has(a.id)) continue;
    seen.add(a.id);
    merged.push({
      ...a,
      glossary: mergeGlossaryEntries(a.glossary, overrides[a.id]),
    });
  }
  for (const a of [
    ...CURATED_B1_READING_ARTICLES,
    ...READING_ARTICLES_EXPANSION_A,
    ...READING_ARTICLES_EXPANSION_B,
    ...READING_ARTICLES_EXPANSION_C,
    ...READING_ARTICLES_EXPANSION_D,
  ]) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    merged.push({
      ...a,
      glossary: mergeGlossaryEntries(a.glossary, overrides[a.id]),
    });
  }
  return merged;
}
