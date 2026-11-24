import fs from "node:fs";
import path from "node:path";
import { getCuratedResearch, getStarterModules } from "./curriculum";
import { localizeSpeakingModuleToGerman } from "./speaking-bank";
import {
  computeReadinessMetrics,
  createDefaultMastery,
  recalculateSkillsFromHistory,
} from "./standards";
import { recalculateVocabCategoriesFromEvidence } from "./vocab-pool-store";
import {
  AiConfig,
  Bottleneck,
  CefrLevel,
  DatabaseSchema,
  ExamSkill,
  LearnerProfile,
  MasteryTracker,
  SessionRecord,
  StudyModule,
  StudyPlan,
  TopicResearchResult,
  VocabularyItem,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "sprachcoach-db.json");

const globalForDb = globalThis as unknown as {
  __sprachcoachDbCache?: { mtimeMs: number; db: DatabaseSchema };
  __sprachcoachActiveMutationDb?: DatabaseSchema;
  __sprachcoachMutationDepth?: number;
};

function createDefaultDb(): DatabaseSchema {
  const now = new Date().toISOString();
  const profile: LearnerProfile = {
    name: "Learner",
    currentLevel: "A2",
    targetLevel: "B1",
    goalTitle: "Goethe-Zertifikat B1 Exam",
    goalDetails:
      "Pass all 3 parts of Goethe-Zertifikat B1 Sprechen (Teil 1: Gemeinsam etwas planen, Teil 2: Ein Thema präsentieren, Teil 3: Rückmeldung geben) with confident speaking & listening.",
    nativeLanguage: "English",
    dailyMinutes: 15,
    coachStyle: "balanced",
    onboardingComplete: false,
  };

  const aiConfig: AiConfig = {
    provider: "demo",
    geminiApiKey: process.env.GEMINI_API_KEY ?? "",
    geminiModel: "gemini-3.5-flash-lite",
    groqApiKey: process.env.GROQ_API_KEY ?? "",
    groqModel: "llama-3.3-70b-versatile",
    groqUseWhisper: true,
    ollamaBaseUrl: "http://localhost:11434",
    ollamaModel: "qwen2.5:7b",
    ttsProvider: "edge_neural",
    edgeVoice: "de-DE-SeraphinaMultilingualNeural",
    customTtsUrl: "http://localhost:8880/v1/audio/speech",
    customTtsModel: "kokoro",
    customTtsVoice: "af_bella",
    customTtsApiKey: "",
    voiceRate: 1.1,
    preferredVoiceName: "",
    autoSpeak: true,
    handsFreeDefault: true,
    blindListeningDefault: false,
  };

  // Auto-detect provider if env keys exist
  if (aiConfig.geminiApiKey) {
    aiConfig.provider = "gemini";
  } else if (aiConfig.groqApiKey) {
    aiConfig.provider = "groq";
  }

  const starterResearch = getCuratedResearch("A2", "B1", profile.goalTitle);
  const starterModules = getStarterModules("A2", "B1", profile.goalTitle);

  return {
    profile,
    aiConfig,
    latestResearch: starterResearch,
    plan: {
      id: `plan-${Date.now()}`,
      title: "A2 -> Goethe-Zertifikat B1 Speaking Plan",
      summary:
        "A guided, editable speaking roadmap covering Goethe B1 Teil 1–3, trending exam topics, and spontaneous listening reactions.",
      updatedAt: now,
      modules: starterModules,
    },
    memory: {
      summary:
        "Transitioning from A2 to B1 for the Goethe-Zertifikat B1 exam. Focus on speaking in connected sentences, verb-final order in Nebensätze, and polite negotiation phrases.",
      strengths: [
        "Can handle basic everyday greetings and simple present-tense statements",
      ],
      bottlenecks: [
        {
          id: "bn-starter-1",
          title: "Verb at the end in Nebensätze (weil / dass / obwohl)",
          category: "grammar",
          description:
            "Common A2->B1 bottleneck: keeping main-clause word order after 'weil' or 'dass' instead of sending the conjugated verb to the end.",
          exampleMistake: "Ich lerne Deutsch, weil ich wohne in Berlin.",
          betterGerman: "Ich lerne Deutsch, weil ich in Berlin wohne.",
          severity: "high",
          occurrences: 1,
          lastSeenAt: now,
          createdAt: now,
        },
        {
          id: "bn-starter-2",
          title: "Polite suggestions with Konjunktiv II (Teil 1)",
          category: "exam_strategy",
          description:
            "Using 'wir könnten...' and 'ich würde vorschlagen...' instead of repetitive 'wir machen...' during Goethe B1 planning tasks.",
          exampleMistake: "Wir machen die Party am Samstag.",
          betterGerman: "Wir könnten die Party am Samstag machen. Was meinst du?",
          severity: "medium",
          occurrences: 1,
          lastSeenAt: now,
          createdAt: now,
        },
      ],
      vocabulary: [
        {
          id: "voc-starter-1",
          german: "Ich schlage vor, dass...",
          meaning: "I suggest that...",
          exampleDe: "Ich schlage vor, dass wir uns am Samstag um 15 Uhr treffen.",
          topic: "Goethe B1 Teil 1",
          addedAt: now,
          mastered: false,
        },
        {
          id: "voc-starter-2",
          german: "Einerseits ... andererseits ...",
          meaning: "On the one hand ... on the other hand ...",
          exampleDe:
            "Einerseits spart man im Homeoffice Zeit, andererseits vermisst man die Kollegen.",
          topic: "Goethe B1 Teil 2",
          addedAt: now,
          mastered: false,
        },
      ],
      lastSessionRecap:
        "No sessions completed yet. Start your first guided conversation and your coach will automatically map your real speaking bottlenecks!",
      totalMinutesPracticed: 0,
      streakDays: 0,
    },
    mastery: createDefaultMastery(profile.targetLevel, profile.goalTitle),
    sessions: [],
    drillHistory: [],
    freeChats: [],
  };
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDb(): DatabaseSchema {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const initial = createDefaultDb();
    writeDb(initial);
    return initial;
  }

  try {
    const stat = fs.statSync(DB_PATH);
    if (
      globalForDb.__sprachcoachDbCache &&
      globalForDb.__sprachcoachDbCache.mtimeMs === stat.mtimeMs
    ) {
      recalculateVocabCategoriesFromEvidence(globalForDb.__sprachcoachDbCache.db);
      return globalForDb.__sprachcoachDbCache.db;
    }

    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    const defaults = createDefaultDb();

    const mergedProfile = { ...defaults.profile, ...(parsed.profile ?? {}) };
    const defaultMastery = createDefaultMastery(
      mergedProfile.targetLevel,
      mergedProfile.goalTitle
    );
    const mergedMastery: MasteryTracker = parsed.mastery
      ? {
          ...defaultMastery,
          ...parsed.mastery,
          skills: {
            ...defaultMastery.skills,
            ...(parsed.mastery.skills ?? {}),
          },
          vocabCategories:
            parsed.mastery.vocabCategories?.length
              ? parsed.mastery.vocabCategories
              : defaultMastery.vocabCategories,
          grammarStandards:
            parsed.mastery.grammarStandards?.length
              ? parsed.mastery.grammarStandards
              : defaultMastery.grammarStandards,
          history: parsed.mastery.history ?? [],
        }
      : defaultMastery;

    const rawPlan = parsed.plan ?? defaults.plan;
    const localizedPlan: StudyPlan = {
      ...rawPlan,
      modules: (rawPlan.modules ?? []).map((mod) => ({
        ...mod,
        ...localizeSpeakingModuleToGerman(mod),
      })),
    };

    const hydrated: DatabaseSchema = {
      profile: mergedProfile,
      aiConfig: { ...defaults.aiConfig, ...(parsed.aiConfig ?? {}) },
      latestResearch: parsed.latestResearch ?? defaults.latestResearch,
      plan: localizedPlan,
      memory: {
        ...defaults.memory,
        ...(parsed.memory ?? {}),
        bottlenecks: parsed.memory?.bottlenecks ?? defaults.memory.bottlenecks,
        vocabulary: parsed.memory?.vocabulary ?? defaults.memory.vocabulary,
        strengths: parsed.memory?.strengths ?? defaults.memory.strengths,
      },
      mastery: mergedMastery,
      sessions: parsed.sessions ?? [],
      drillHistory: parsed.drillHistory ?? [],
      freeChats: parsed.freeChats ?? [],
    };
    recalculateSkillsFromHistory(
      hydrated.mastery,
      hydrated.sessions,
      hydrated.drillHistory
    );
    recalculateVocabCategoriesFromEvidence(hydrated);
    globalForDb.__sprachcoachDbCache = { mtimeMs: stat.mtimeMs, db: hydrated };
    return hydrated;
  } catch {
    const initial = createDefaultDb();
    writeDb(initial);
    return initial;
  }
}

export function writeDb(db: DatabaseSchema): void {
  ensureDataDir();
  const payload = JSON.stringify(db, null, 2);
  const tmpPath = `${DB_PATH}.${process.pid}.${Date.now()}.${Math.random()
    .toString(36)
    .slice(2, 7)}.tmp`;

  try {
    fs.writeFileSync(tmpPath, payload, "utf-8");
    try {
      fs.renameSync(tmpPath, DB_PATH);
    } catch {
      // On Windows, fs.renameSync can throw EPERM/EBUSY when Defender, IDE, or file watchers
      // briefly hold a read handle on DB_PATH. Direct writeFileSync succeeds reliably in-place.
      fs.writeFileSync(DB_PATH, payload, "utf-8");
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {
        // ignore cleanup error
      }
    }
  } catch {
    // Final direct write fallback if temp file creation encountered a lock
    fs.writeFileSync(DB_PATH, payload, "utf-8");
  }

  // Clean up any stale legacy .tmp file if present
  try {
    const legacyTmp = `${DB_PATH}.tmp`;
    if (fs.existsSync(legacyTmp)) {
      fs.unlinkSync(legacyTmp);
    }
  } catch {
    // ignore
  }

  try {
    const stat = fs.statSync(DB_PATH);
    globalForDb.__sprachcoachDbCache = { mtimeMs: stat.mtimeMs, db };
  } catch {
    globalForDb.__sprachcoachDbCache = { mtimeMs: Date.now(), db };
  }
}

export function updateDb(
  updater: (db: DatabaseSchema) => DatabaseSchema | void
): DatabaseSchema {
  const depth = globalForDb.__sprachcoachMutationDepth ?? 0;
  if (depth > 0 && globalForDb.__sprachcoachActiveMutationDb) {
    globalForDb.__sprachcoachMutationDepth = depth + 1;
    try {
      const maybeNext = updater(globalForDb.__sprachcoachActiveMutationDb);
      if (maybeNext) {
        globalForDb.__sprachcoachActiveMutationDb = maybeNext;
      }
      return globalForDb.__sprachcoachActiveMutationDb;
    } finally {
      globalForDb.__sprachcoachMutationDepth = depth;
    }
  }

  const db = readDb();
  globalForDb.__sprachcoachActiveMutationDb = db;
  globalForDb.__sprachcoachMutationDepth = 1;
  try {
    const maybeNext = updater(db);
    const nextDb = maybeNext ?? globalForDb.__sprachcoachActiveMutationDb ?? db;
    writeDb(nextDb);
    return nextDb;
  } finally {
    globalForDb.__sprachcoachMutationDepth = 0;
    globalForDb.__sprachcoachActiveMutationDb = undefined;
  }
}

export function resetDb(): DatabaseSchema {
  const fresh = createDefaultDb();
  writeDb(fresh);
  return fresh;
}

export function getSanitizedState(db: DatabaseSchema) {
  return {
    ...db,
    aiConfig: {
      ...db.aiConfig,
      hasGeminiKey: Boolean(db.aiConfig.geminiApiKey?.trim()),
      hasGroqKey: Boolean(db.aiConfig.groqApiKey?.trim()),
    },
  };
}

export function updateProfileAndConfig(
  profilePatch?: Partial<LearnerProfile>,
  aiConfigPatch?: Partial<AiConfig>
): DatabaseSchema {
  return updateDb((db) => {
    if (profilePatch) {
      db.profile = { ...db.profile, ...profilePatch };
    }
    if (aiConfigPatch) {
      db.aiConfig = { ...db.aiConfig, ...aiConfigPatch };
    }
  });
}

export function saveResearch(research: TopicResearchResult): DatabaseSchema {
  return updateDb((db) => {
    db.latestResearch = research;
  });
}

export function savePlan(plan: StudyPlan): DatabaseSchema {
  return updateDb((db) => {
    db.plan = {
      ...plan,
      updatedAt: new Date().toISOString(),
      modules: plan.modules.map((m, idx) => ({ ...m, order: idx })),
    };
  });
}

export function addModuleToPlan(
  moduleData: Omit<StudyModule, "id" | "order" | "completedCount">
): { db: DatabaseSchema; module: StudyModule } {
  let created!: StudyModule;
  const db = updateDb((state) => {
    const existing = state.plan.modules.find(
      (m) =>
        m.titleDe.toLowerCase().trim() ===
          moduleData.titleDe.toLowerCase().trim() ||
        m.title.toLowerCase().trim() === moduleData.title.toLowerCase().trim()
    );
    if (existing) {
      created = existing;
      return;
    }

    created = {
      ...moduleData,
      id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      order: 0,
      completedCount: 0,
    };
    state.plan.modules.unshift(created);
    state.plan.modules = state.plan.modules.map((m, i) => ({ ...m, order: i }));
    state.plan.updatedAt = new Date().toISOString();
  });
  return { db, module: created };
}

export function updateModuleInPlan(
  id: string,
  patch: Partial<StudyModule>
): DatabaseSchema {
  return updateDb((state) => {
    state.plan.modules = state.plan.modules.map((mod) =>
      mod.id === id ? { ...mod, ...patch, id: mod.id } : mod
    );
    state.plan.updatedAt = new Date().toISOString();
  });
}

export function deleteModuleFromPlan(id: string): DatabaseSchema {
  return updateDb((state) => {
    state.plan.modules = state.plan.modules
      .filter((m) => m.id !== id)
      .map((m, idx) => ({ ...m, order: idx }));
    state.plan.updatedAt = new Date().toISOString();
  });
}

export function reorderModuleInPlan(
  id: string,
  direction: "up" | "down"
): DatabaseSchema {
  return updateDb((state) => {
    const idx = state.plan.modules.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= state.plan.modules.length) return;
    const copy = [...state.plan.modules];
    [copy[idx], copy[swapIdx]] = [copy[swapIdx], copy[idx]];
    state.plan.modules = copy.map((m, i) => ({ ...m, order: i }));
    state.plan.updatedAt = new Date().toISOString();
  });
}

export function upsertSession(session: SessionRecord): DatabaseSchema {
  return updateDb((state) => {
    const idx = state.sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      state.sessions[idx] = session;
    } else {
      state.sessions.unshift(session);
    }
  });
}

export function getSessionById(id: string): SessionRecord | undefined {
  const db = readDb();
  return db.sessions.find((s) => s.id === id);
}

export function upsertBottleneck(
  item: Omit<Bottleneck, "id" | "createdAt" | "lastSeenAt" | "occurrences"> & {
    id?: string;
    occurrences?: number;
  }
): DatabaseSchema {
  const now = new Date().toISOString();
  return updateDb((state) => {
    if (item.id) {
      state.memory.bottlenecks = state.memory.bottlenecks.map((b) =>
        b.id === item.id ? { ...b, ...item, lastSeenAt: now } : b
      );
      return;
    }

    const existing = state.memory.bottlenecks.find(
      (b) => b.title.toLowerCase() === item.title.toLowerCase()
    );
    if (existing) {
      existing.occurrences += 1;
      existing.lastSeenAt = now;
      existing.description = item.description || existing.description;
      existing.exampleMistake = item.exampleMistake || existing.exampleMistake;
      existing.betterGerman = item.betterGerman || existing.betterGerman;
      if (item.severity === "high") existing.severity = "high";
    } else {
      state.memory.bottlenecks.unshift({
        id: `bn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: item.title,
        category: item.category,
        description: item.description,
        exampleMistake: item.exampleMistake,
        betterGerman: item.betterGerman,
        severity: item.severity,
        occurrences: item.occurrences ?? 1,
        createdAt: now,
        lastSeenAt: now,
      });
    }
  });
}

export function addVocabularyItems(
  items: Array<Omit<VocabularyItem, "id" | "addedAt" | "mastered">>
): DatabaseSchema {
  const now = new Date().toISOString();
  return updateDb((state) => {
    for (const item of items) {
      const exists = state.memory.vocabulary.some(
        (v) => v.german.toLowerCase() === item.german.toLowerCase()
      );
      if (!exists && item.german.trim()) {
        state.memory.vocabulary.unshift({
          id: `voc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          german: item.german.trim(),
          meaning: item.meaning.trim(),
          exampleDe: item.exampleDe.trim(),
          topic: item.topic.trim(),
          addedAt: now,
          mastered: false,
        });
      }
    }
  });
}

export function syncMasteryStandard(
  targetLevel: CefrLevel,
  examName: string
): DatabaseSchema {
  return updateDb((state) => {
    state.mastery = createDefaultMastery(targetLevel, examName);
  });
}

export function recordMasteryProgress(input: {
  skill: ExamSkill;
  sessionScore: number; // 0-100
  label: string;
  topicHint?: string;
  grammarHints?: string[];
  vocabCategoryId?: string;
  grammarStandardId?: string;
  newVocabCount?: number;
  alsoBoostListening?: boolean;
}): DatabaseSchema {
  const now = new Date().toISOString();
  return updateDb((state) => {
    const mastery = state.mastery;
    const clampedScore = Math.max(
      0,
      Math.min(100, Math.round(input.sessionScore))
    );

    // Recompute all 4 skill scores directly from actual unique tasks & Teil coverage
    recalculateSkillsFromHistory(
      mastery,
      state.sessions,
      state.drillHistory
    );
    mastery.skills[input.skill].lastPracticedAt = now;

    // Update matching Vocabulary Category
    const hintText = `${input.label} ${input.topicHint ?? ""}`.toLowerCase();
    const vocabMatchers: Record<string, string[]> = {
      "voc-work": ["arbeit", "beruf", "homeoffice", "büro", "bewerb", "work", "job", "office"],
      "voc-living": ["wohn", "stadt", "land", "miete", "nachbar", "city", "countryside", "apartment"],
      "voc-health": ["gesund", "arzt", "krank", "ernährung", "sport", "fast food", "doctor", "sick", "health"],
      "voc-travel": ["reis", "urlaub", "zug", "verkehr", "ausflug", "auto", "travel", "train", "trip"],
      "voc-environment": ["umwelt", "klima", "plastik", "müll", "natur", "einkauf", "shopping", "environment"],
      "voc-media": ["medien", "smartphone", "internet", "online", "digital", "ki", "social media"],
      "voc-leisure": ["party", "abschied", "freizeit", "wochenende", "fest", "kultur", "farewell", "weekend"],
      "voc-education": ["schule", "studium", "lern", "prüfung", "bildung", "kurs", "exam", "study"],
    };

    let matchedVocab = input.vocabCategoryId
      ? mastery.vocabCategories.find((v) => v.id === input.vocabCategoryId)
      : undefined;

    if (!matchedVocab) {
      for (const cat of mastery.vocabCategories) {
        const words = vocabMatchers[cat.id] ?? [];
        if (words.some((w) => hintText.includes(w))) {
          matchedVocab = cat;
          break;
        }
      }
    }

    if (!matchedVocab && mastery.vocabCategories.length > 0) {
      // Gently advance the lowest-progress category so every session builds vocabulary coverage
      matchedVocab = [...mastery.vocabCategories].sort(
        (a, b) => a.progressPct - b.progressPct
      )[0];
    }

    if (matchedVocab) {
      matchedVocab.lastPracticedAt = now;
    }
    // Recalculate all 8 topic category percentages strictly from multi-day SRS + unique task evidence
    recalculateVocabCategoriesFromEvidence(state);

    // Update matching Grammar Standards
    const grammarText = `${(input.grammarHints ?? []).join(" ")} ${hintText}`.toLowerCase();
    const grammarMatchers: Record<string, string[]> = {
      "gram-nebensatz": ["nebensatz", "weil", "dass", "obwohl", "wenn", "damit", "verb"],
      "gram-konjunktiv2": ["konjunktiv", "könnte", "würde", "hätte", "wäre", "vorschlag", "planen", "teil 1"],
      "gram-relativsatz": ["relativ", "der/die/das"],
      "gram-past": ["perfekt", "präteritum", "vergangenheit", "erzähl"],
      "gram-passiv": ["passiv"],
      "gram-prepositions": ["präposition", "dativ", "akkusativ", "wechsel"],
      "gram-infinitiv-zu": ["infinitiv", "um...zu", "um ... zu"],
      "gram-adjectives": ["adjektiv", "komparativ", "vergleich"],
    };

    const matchedGrammars = mastery.grammarStandards.filter((g) => {
      if (input.grammarStandardId && g.id === input.grammarStandardId) return true;
      const keys = grammarMatchers[g.id] ?? [];
      return keys.some((k) => grammarText.includes(k));
    });

    const targets =
      matchedGrammars.length > 0
        ? matchedGrammars.slice(0, 2)
        : mastery.grammarStandards.slice(0, 1);

    for (const gram of targets) {
      const gramGain = Math.max(5, Math.round((clampedScore / 100) * 14));
      gram.masteryPct = Math.min(100, gram.masteryPct + gramGain);
      gram.practiceCount += 1;
      gram.lastPracticedAt = now;
    }

    mastery.updatedAt = now;

    // Append growth snapshot for visual progress chart
    const readiness = computeReadinessMetrics(mastery, state.memory, state.profile);
    mastery.history.push({
      id: `snap-${Date.now()}`,
      date: now,
      label: input.label,
      skill: input.skill,
      sessionScore: clampedScore,
      overallReadiness: readiness.overallReadiness,
    });
    if (mastery.history.length > 40) {
      mastery.history = mastery.history.slice(-40);
    }
  });
}
