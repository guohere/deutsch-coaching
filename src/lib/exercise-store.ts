import fs from "node:fs";
import path from "node:path";
import { VERIFIED_EXERCISES } from "./exercise-bank";
import { SCHREIBEN_EXPANSION_BANK } from "./schreiben-expansion-bank";
import { CefrLevel, SkillDrillExercise } from "./types";

const LIBRARY_DIR = path.join(process.cwd(), "data", "exercise-library");
const CUSTOM_FILE = path.join(LIBRARY_DIR, "custom-exercises.json");

function ensureLibraryDir() {
  if (!fs.existsSync(LIBRARY_DIR)) {
    fs.mkdirSync(LIBRARY_DIR, { recursive: true });
  }
}

function normalizeExercise(
  raw: Partial<SkillDrillExercise>,
  defaultSource: SkillDrillExercise["source"] = "imported",
  fallbackCredit = "Local JSON Pack"
): SkillDrillExercise | null {
  if (!raw || !raw.skill || !["hoeren", "lesen", "schreiben"].includes(raw.skill)) {
    return null;
  }
  if (!raw.title?.trim()) return null;

  if (raw.skill === "schreiben") {
    if (!raw.writingPromptDe?.trim()) return null;
  } else {
    if (!raw.passageDe?.trim() || !Array.isArray(raw.questions) || raw.questions.length === 0) {
      return null;
    }
  }

  const validLevels: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
  const level: CefrLevel = validLevels.includes(raw.level as CefrLevel)
    ? (raw.level as CefrLevel)
    : "B1";

  return {
    id:
      raw.id?.trim() ||
      `custom-${raw.skill}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    skill: raw.skill,
    level,
    topicDe: raw.topicDe?.trim() || "Alltag & Prüfung",
    topicEn: raw.topicEn?.trim() || "General Topic",
    vocabCategoryId: raw.vocabCategoryId,
    grammarStandardId: raw.grammarStandardId,
    title: raw.title.trim(),
    examPartLabel:
      raw.examPartLabel?.trim() || `${raw.skill.toUpperCase()} (${level})`,
    instructions:
      raw.instructions?.trim() ||
      (raw.skill === "schreiben"
        ? "Write your German response covering all bullet points."
        : "Answer all comprehension questions based on the German text."),
    source: raw.source || defaultSource,
    sourceCredit: raw.sourceCredit?.trim() || fallbackCredit,
    passageDe: raw.passageDe?.trim(),
    questions: raw.questions?.map((q, idx) => ({
      id: q.id || `q${idx + 1}`,
      questionDe: q.questionDe,
      options: q.options,
      correctIndex:
        typeof q.correctIndex === "number"
          ? Math.max(0, Math.min(q.options.length - 1, q.correctIndex))
          : 0,
      explanation: q.explanation || "",
    })),
    writingPromptDe: raw.writingPromptDe?.trim(),
    writingBulletsDe: Array.isArray(raw.writingBulletsDe)
      ? raw.writingBulletsDe
      : undefined,
    minWords: raw.minWords,
    keyVocab: Array.isArray(raw.keyVocab) ? raw.keyVocab : [],
  };
}

export function loadCustomExercises(): SkillDrillExercise[] {
  ensureLibraryDir();
  const collected: SkillDrillExercise[] = [];

  try {
    const files = fs
      .readdirSync(LIBRARY_DIR)
      .filter((f) => f.toLowerCase().endsWith(".json"));

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(LIBRARY_DIR, file), "utf-8");
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.exercises)
          ? parsed.exercises
          : [];
        for (const item of list) {
          const normalized = normalizeExercise(
            item,
            "imported",
            file === "custom-exercises.json" ? "Saved Local Library" : file
          );
          if (normalized) collected.push(normalized);
        }
      } catch {
        // ignore malformed external pack file
      }
    }
  } catch {
    // ignore
  }

  return collected;
}

export function loadAllLocalExercises(): SkillDrillExercise[] {
  const custom = loadCustomExercises();
  const byId = new Map<string, SkillDrillExercise>();
  for (const ex of VERIFIED_EXERCISES) {
    byId.set(ex.id, ex);
  }
  for (const ex of SCHREIBEN_EXPANSION_BANK) {
    if (!byId.has(ex.id)) {
      byId.set(ex.id, ex);
    }
  }
  for (const ex of custom) {
    byId.set(ex.id, ex);
  }
  return Array.from(byId.values());
}

export function saveExercisesToCustomFile(
  incoming: Partial<SkillDrillExercise>[],
  source: SkillDrillExercise["source"] = "imported",
  sourceCredit = "Imported Local Pack"
): { added: SkillDrillExercise[]; skipped: number } {
  ensureLibraryDir();

  let existing: SkillDrillExercise[] = [];
  if (fs.existsSync(CUSTOM_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(CUSTOM_FILE, "utf-8"));
      if (Array.isArray(parsed)) existing = parsed;
    } catch {
      existing = [];
    }
  }

  const added: SkillDrillExercise[] = [];
  let skipped = 0;

  for (const raw of incoming) {
    const normalized = normalizeExercise(raw, source, sourceCredit);
    if (!normalized) {
      skipped += 1;
      continue;
    }
    const idx = existing.findIndex((e) => e.id === normalized.id);
    if (idx >= 0) {
      existing[idx] = normalized;
    } else {
      existing.unshift(normalized);
    }
    added.push(normalized);
  }

  const tmp = `${CUSTOM_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(existing, null, 2), "utf-8");
  fs.renameSync(tmp, CUSTOM_FILE);

  return { added, skipped };
}

export function deleteCustomExercise(id: string): boolean {
  ensureLibraryDir();
  if (!fs.existsSync(CUSTOM_FILE)) return false;

  try {
    const parsed = JSON.parse(fs.readFileSync(CUSTOM_FILE, "utf-8"));
    if (!Array.isArray(parsed)) return false;
    const filtered = parsed.filter((e: SkillDrillExercise) => e.id !== id);
    if (filtered.length === parsed.length) return false;
    const tmp = `${CUSTOM_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(filtered, null, 2), "utf-8");
    fs.renameSync(tmp, CUSTOM_FILE);
    return true;
  } catch {
    return false;
  }
}
