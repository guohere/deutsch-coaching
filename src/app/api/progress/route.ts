import { NextResponse } from "next/server";
import {
  generatePersonalizedPlan,
  researchTopicsForGoal,
} from "@/lib/ai/coach";
import {
  getSanitizedState,
  readDb,
  savePlan,
  saveResearch,
  syncMasteryStandard,
  updateDb,
  updateProfileAndConfig,
} from "@/lib/db";
import { loadAllLocalExercises } from "@/lib/exercise-store";
import { inferExercisePartNumber } from "@/lib/goethe-exam-specs";
import { GOETHE_SPEAKING_BANK } from "@/lib/speaking-bank";
import {
  computePacingAnalytics,
  computeReadinessMetrics,
  NEXT_HORIZON_TRACKS,
} from "@/lib/standards";
import { DatabaseSchema, ExamSkill } from "@/lib/types";
import { inferVocabCategoryFromTopic } from "@/lib/vocab-pool-store";

export interface CategoryExerciseStat {
  doneCount: number;
  totalCount: number;
  avgPoints: number | null;
  attemptsCount: number;
  partTotals?: Record<number, number>;
}

export interface ExerciseProgressStats {
  bySkill: Record<ExamSkill, CategoryExerciseStat>;
  byTopicCategory: Record<string, CategoryExerciseStat>;
  byGrammarStandard: Record<string, CategoryExerciseStat>;
}

function computeExerciseProgressStats(
  db: DatabaseSchema
): ExerciseProgressStats {
  const targetLevel = db.profile.targetLevel || "B1";
  const allLocalDrills = loadAllLocalExercises();

  // --- 1. Per-Skill Pool & Completion Stats ---
  const skillPoolKeys: Record<ExamSkill, Set<string>> = {
    sprechen: new Set(),
    hoeren: new Set(),
    lesen: new Set(),
    schreiben: new Set(),
  };
  const skillPartPools: Record<ExamSkill, Record<number, Set<string>>> = {
    sprechen: { 1: new Set(), 2: new Set(), 3: new Set() },
    hoeren: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() },
    lesen: { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set() },
    schreiben: { 1: new Set(), 2: new Set(), 3: new Set() },
  };
  const skillDoneBest: Record<ExamSkill, Map<string, number>> = {
    sprechen: new Map(),
    hoeren: new Map(),
    lesen: new Map(),
    schreiben: new Map(),
  };
  const skillAttempts: Record<ExamSkill, number> = {
    sprechen: 0,
    hoeren: 0,
    lesen: 0,
    schreiben: 0,
  };

  // --- 2. Per-Topic-Category & Per-Grammar-Standard Pool & Completion Stats ---
  const topicPoolKeys = new Map<string, Set<string>>();
  const topicDoneBest = new Map<string, Map<string, number>>();
  const topicAttempts = new Map<string, number>();
  for (const cat of db.mastery.vocabCategories) {
    topicPoolKeys.set(cat.id, new Set());
    topicDoneBest.set(cat.id, new Map());
    topicAttempts.set(cat.id, 0);
  }

  const grammarPoolKeys = new Map<string, Set<string>>();
  const grammarDoneBest = new Map<string, Map<string, number>>();
  const grammarAttempts = new Map<string, number>();
  for (const g of db.mastery.grammarStandards) {
    grammarPoolKeys.set(g.id, new Set());
    grammarDoneBest.set(g.id, new Map());
    grammarAttempts.set(g.id, 0);
  }

  // Register local drill pool (Hören, Lesen, Schreiben) for target level
  for (const ex of allLocalDrills) {
    if (ex.level !== targetLevel) continue;
    const key = `drill:${ex.id}`;
    skillPoolKeys[ex.skill].add(key);
    const partNum = inferExercisePartNumber(ex);
    if (partNum) {
      if (!skillPartPools[ex.skill][partNum]) {
        skillPartPools[ex.skill][partNum] = new Set();
      }
      skillPartPools[ex.skill][partNum].add(key);
    }

    const catId =
      ex.vocabCategoryId ||
      inferVocabCategoryFromTopic(`${ex.topicDe} ${ex.title}`);
    topicPoolKeys.get(catId)?.add(key);

    if (ex.grammarStandardId && grammarPoolKeys.has(ex.grammarStandardId)) {
      grammarPoolKeys.get(ex.grammarStandardId)!.add(key);
    }
  }

  // Register Speaking pool (user plan modules + built-in Goethe Speaking Bank) for target level
  const registerSpeakingPoolItem = (
    titleDe: string,
    title: string,
    category: string,
    level: string
  ) => {
    if (level !== targetLevel) return;
    const normKey = `speak:${(titleDe || title).trim().toLowerCase()}`;
    skillPoolKeys.sprechen.add(normKey);
    const partNum =
      category === "exam_teil1_planning"
        ? 1
        : category === "exam_teil2_presentation"
        ? 2
        : category === "exam_teil3_discussion"
        ? 3
        : null;
    if (partNum) {
      skillPartPools.sprechen[partNum].add(normKey);
    }
    const catId = inferVocabCategoryFromTopic(`${titleDe} ${title}`);
    topicPoolKeys.get(catId)?.add(normKey);
  };

  for (const mod of db.plan.modules) {
    registerSpeakingPoolItem(mod.titleDe, mod.title, mod.category, mod.targetLevel);
  }
  for (const item of GOETHE_SPEAKING_BANK) {
    registerSpeakingPoolItem(
      item.titleDe,
      item.title,
      item.category,
      item.targetLevel
    );
  }

  // Record completed drills (Hören, Lesen, Schreiben)
  for (const d of db.drillHistory) {
    const skill = d.skill;
    const key = `drill:${d.exerciseId || d.exercise.title}`;
    const score = d.grade.score;

    skillAttempts[skill] += 1;
    skillPoolKeys[skill].add(key);
    const prevSkill = skillDoneBest[skill].get(key);
    if (prevSkill === undefined || score > prevSkill) {
      skillDoneBest[skill].set(key, score);
    }

    const catId =
      d.exercise.vocabCategoryId ||
      inferVocabCategoryFromTopic(`${d.exercise.topicDe} ${d.exercise.title}`);
    if (topicDoneBest.has(catId)) {
      topicPoolKeys.get(catId)!.add(key);
      topicAttempts.set(catId, (topicAttempts.get(catId) ?? 0) + 1);
      const prevTopic = topicDoneBest.get(catId)!.get(key);
      if (prevTopic === undefined || score > prevTopic) {
        topicDoneBest.get(catId)!.set(key, score);
      }
    }

    if (
      d.exercise.grammarStandardId &&
      grammarDoneBest.has(d.exercise.grammarStandardId)
    ) {
      const gId = d.exercise.grammarStandardId;
      grammarPoolKeys.get(gId)!.add(key);
      grammarAttempts.set(gId, (grammarAttempts.get(gId) ?? 0) + 1);
      const prevGram = grammarDoneBest.get(gId)!.get(key);
      if (prevGram === undefined || score > prevGram) {
        grammarDoneBest.get(gId)!.set(key, score);
      }
    }
  }

  // Record completed Speaking sessions
  const moduleById = new Map(db.plan.modules.map((m) => [m.id, m]));
  for (const s of db.sessions) {
    if (!s.completedAt || !s.debrief) continue;
    const mod = moduleById.get(s.moduleId);
    const normTitle = (mod?.titleDe || s.moduleTitle || s.moduleId)
      .trim()
      .toLowerCase();
    const key = `speak:${normTitle}`;
    const score = s.debrief.overallScore;

    skillAttempts.sprechen += 1;
    skillPoolKeys.sprechen.add(key);
    const prevSpk = skillDoneBest.sprechen.get(key);
    if (prevSpk === undefined || score > prevSpk) {
      skillDoneBest.sprechen.set(key, score);
    }

    const catId = inferVocabCategoryFromTopic(
      `${mod?.titleDe ?? ""} ${s.moduleTitle}`
    );
    if (topicDoneBest.has(catId)) {
      topicPoolKeys.get(catId)!.add(key);
      topicAttempts.set(catId, (topicAttempts.get(catId) ?? 0) + 1);
      const prevTopic = topicDoneBest.get(catId)!.get(key);
      if (prevTopic === undefined || score > prevTopic) {
        topicDoneBest.get(catId)!.set(key, score);
      }
    }
  }

  const avgOfMap = (map: Map<string, number>): number | null => {
    if (map.size === 0) return null;
    const vals = Array.from(map.values());
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const bySkill = {} as Record<ExamSkill, CategoryExerciseStat>;
  for (const sk of ["sprechen", "hoeren", "lesen", "schreiben"] as ExamSkill[]) {
    const partTotals: Record<number, number> = {};
    for (const [pNum, set] of Object.entries(skillPartPools[sk])) {
      partTotals[Number(pNum)] = set.size;
    }
    bySkill[sk] = {
      doneCount: skillDoneBest[sk].size,
      totalCount: skillPoolKeys[sk].size,
      avgPoints: avgOfMap(skillDoneBest[sk]),
      attemptsCount: skillAttempts[sk],
      partTotals,
    };
  }

  const byTopicCategory: Record<string, CategoryExerciseStat> = {};
  for (const cat of db.mastery.vocabCategories) {
    const doneMap = topicDoneBest.get(cat.id)!;
    byTopicCategory[cat.id] = {
      doneCount: doneMap.size,
      totalCount: topicPoolKeys.get(cat.id)!.size,
      avgPoints: avgOfMap(doneMap),
      attemptsCount: topicAttempts.get(cat.id) ?? 0,
    };
  }

  const byGrammarStandard: Record<string, CategoryExerciseStat> = {};
  for (const g of db.mastery.grammarStandards) {
    const doneMap = grammarDoneBest.get(g.id)!;
    byGrammarStandard[g.id] = {
      doneCount: doneMap.size,
      totalCount: grammarPoolKeys.get(g.id)!.size,
      avgPoints: avgOfMap(doneMap),
      attemptsCount: grammarAttempts.get(g.id) ?? 0,
    };
  }

  return { bySkill, byTopicCategory, byGrammarStandard };
}

export async function GET() {
  const db = readDb();
  const readiness = computeReadinessMetrics(db.mastery, db.memory, db.profile);
  const pacingAnalytics = computePacingAnalytics(db.drillHistory);
  const exerciseProgressStats = computeExerciseProgressStats(db);
  return NextResponse.json({
    mastery: db.mastery,
    readiness,
    pacingAnalytics,
    exerciseProgressStats,
    memory: db.memory,
    profile: db.profile,
    nextHorizons: NEXT_HORIZON_TRACKS,
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "sync_standard") {
      const db = readDb();
      const updated = syncMasteryStandard(
        db.profile.targetLevel,
        db.profile.goalTitle
      );
      const readiness = computeReadinessMetrics(
        updated.mastery,
        updated.memory,
        updated.profile
      );
      return NextResponse.json({
        mastery: updated.mastery,
        readiness,
      });
    }

    const updated = updateDb((state) => {
      if (body.type === "vocab" && body.id) {
        const cat = state.mastery.vocabCategories.find((v) => v.id === body.id);
        if (cat && typeof body.progressPct === "number") {
          cat.progressPct = Math.max(0, Math.min(100, Math.round(body.progressPct)));
          cat.masteredWords = Math.round((cat.progressPct / 100) * cat.targetWords);
          cat.lastPracticedAt = new Date().toISOString();
        }
      } else if (body.type === "grammar" && body.id) {
        const g = state.mastery.grammarStandards.find((x) => x.id === body.id);
        if (g && typeof body.masteryPct === "number") {
          g.masteryPct = Math.max(0, Math.min(100, Math.round(body.masteryPct)));
          g.lastPracticedAt = new Date().toISOString();
        }
      }
      state.mastery.updatedAt = new Date().toISOString();
    });

    const readiness = computeReadinessMetrics(
      updated.mastery,
      updated.memory,
      updated.profile
    );

    return NextResponse.json({
      mastery: updated.mastery,
      readiness,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Progress update failed" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const track = NEXT_HORIZON_TRACKS.find((t) => t.id === body.trackId);
    if (!track) {
      return NextResponse.json({ error: "Unknown horizon track" }, { status: 400 });
    }

    const dbBefore = readDb();
    const nextCurrentLevel =
      track.targetLevel === "B2" ? "B1" : dbBefore.profile.currentLevel;

    updateProfileAndConfig({
      currentLevel: nextCurrentLevel,
      targetLevel: track.targetLevel,
      goalTitle: track.goalTitle,
      goalDetails: track.goalDetails,
      onboardingComplete: true,
    });

    syncMasteryStandard(track.targetLevel, track.goalTitle);

    const dbUpdated = readDb();
    const research = await researchTopicsForGoal(dbUpdated);
    saveResearch(research);
    const plan = await generatePersonalizedPlan(readDb(), track.goalDetails);
    const finalDb = savePlan(plan);
    const readiness = computeReadinessMetrics(
      finalDb.mastery,
      finalDb.memory,
      finalDb.profile
    );

    return NextResponse.json({
      state: getSanitizedState(finalDb),
      readiness,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not switch track" },
      { status: 500 }
    );
  }
}
