"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Headphones,
  History,
  Layers,
  Loader2,
  Mic,
  PenTool,
  Play,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { CATEGORY_META } from "@/lib/curriculum";
import {
  GOETHE_B1_BLUEPRINT,
  inferExercisePartNumber,
} from "@/lib/goethe-exam-specs";
import {
  filterAvailableSpeakingBank,
  SpeakingBankItem,
} from "@/lib/speaking-bank";
import {
  DatabaseSchema,
  DrillAttemptRecord,
  ExamSkill,
  ModuleStatus,
  SessionRecord,
  SkillDrillExercise,
  StudyModule,
} from "@/lib/types";

interface EnrichedDrillItem {
  exercise: SkillDrillExercise;
  attemptCount: number;
  bestScore: number | null;
  latestAttempt: DrillAttemptRecord | null;
}

type UnifiedStatus = "in_progress" | "queued" | "completed";

interface UnifiedExerciseCard {
  id: string;
  skill: ExamSkill;
  title: string;
  subtitle: string;
  level: string;
  partBadge: string;
  isExamModeTask: boolean;
  modelTestNumber?: number;
  provenanceType: "web_source" | "ai";
  provenanceLabel: string;
  sourceUrl?: string;
  status: UnifiedStatus;
  bestScore: number | null;
  attemptCount: number;
  activeSessionId?: string;
  latestSessionId?: string;
  latestAttemptId?: string;
  moduleRef?: StudyModule;
  drillRef?: SkillDrillExercise;
  canDelete: boolean;
}

export default function ExercisesHubPage() {
  const router = useRouter();
  const [state, setState] = useState<DatabaseSchema | null>(null);
  const [drills, setDrills] = useState<EnrichedDrillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [practiceMode, setPracticeMode] = useState<
    "all" | "exam" | "exercise"
  >("exam");
  const [skillFilter, setSkillFilter] = useState<"all" | ExamSkill>("all");
  const [bankPartFilter, setBankPartFilter] = useState<
    "all" | "exam_teil1_planning" | "exam_teil2_presentation" | "exam_teil3_discussion"
  >("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UnifiedStatus>("all");

  const [startingId, setStartingId] = useState<string | null>(null);
  const [addingTopicKey, setAddingTopicKey] = useState<string | null>(null);
  const [generatingSkill, setGeneratingSkill] = useState<
    "hoeren" | "lesen" | "schreiben" | null
  >(null);
  const [toast, setToast] = useState<string | null>(null);

  async function loadAll() {
    const [stateRes, exRes] = await Promise.all([
      fetch("/api/state"),
      fetch("/api/exercises"),
    ]);
    const stateData = (await stateRes.json()) as DatabaseSchema;
    const exData = (await exRes.json()) as { exercises: EnrichedDrillItem[] };
    setState(stateData);
    setDrills(exData.exercises ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleStartSpeaking(moduleId: string) {
    setStartingId(moduleId);
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });
      const data = await res.json();
      if (data?.session?.id) {
        router.push(`/session/${data.session.id}`);
      }
    } finally {
      setStartingId(null);
    }
  }

  async function handleAddRecommendedTopic(topic: {
    topicDe: string;
    topicEn: string;
    samplePromptDe: string;
  }) {
    setAddingTopicKey(topic.topicDe);
    try {
      const res = await fetch("/api/plan/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Speaking Topic: ${topic.topicEn}`,
          titleDe: topic.topicDe,
          category: "exam_teil2_presentation",
          targetLevel: state?.profile.targetLevel ?? "B1",
          durationMinutes: 10,
          scenarioPrompt: topic.samplePromptDe,
          coachRole: "Goethe-B1-Prüfer/in und Gesprächspartner/in",
          learnerGoal:
            "Stellen Sie Ihre persönlichen Erfahrungen sowie Vor- und Nachteile klar dar und beantworten Sie Anschlussfragen auf Deutsch.",
          grammarFocus: state?.latestResearch?.keyGrammarTargets.slice(0, 2) ?? [],
          keyVocabulary: [],
          source: "custom",
        }),
      });
      if (res.ok) {
        await loadAll();
        showToast(
          `Moved "${topic.topicDe}" into My Exercise List (Sprechen)!`
        );
      }
    } finally {
      setAddingTopicKey(null);
    }
  }

  async function handleGenerateAndSaveAi(
    skill: "hoeren" | "lesen" | "schreiben"
  ) {
    setGeneratingSkill(skill);
    try {
      const res = await fetch("/api/drills/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill }),
      });
      const data = await res.json();
      if (res.ok && data.exercise?.id) {
        await loadAll();
        showToast(
          `Generated & saved "${data.exercise.title}" into your local Exercise List & Memory!`
        );
      }
    } finally {
      setGeneratingSkill(null);
    }
  }

  async function handleAddSpeakingBankItems(items: SpeakingBankItem[]) {
    if (items.length === 0) return;
    const res = await fetch("/api/plan/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modules: items }),
    });
    if (res.ok) {
      await loadAll();
      setSkillFilter("sprechen");
      setStatusFilter("queued");
      showToast(
        items.length === 1
          ? `Moved "${items[0].titleDe}" into your "New" Speaking List!`
          : `Added ${items.length} Goethe Speaking exercises into your "New" list!`
      );
    }
  }

  async function handleSetSpeakingModuleStatus(
    moduleId: string,
    status: ModuleStatus
  ) {
    const res = await fetch("/api/plan/modules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: moduleId, status }),
    });
    if (res.ok) {
      await loadAll();
    }
  }

  async function handleRemoveItem(card: UnifiedExerciseCard) {
    if (!window.confirm(`Remove "${card.title}" from your exercise list?`)) {
      return;
    }
    if (card.moduleRef) {
      await fetch(
        `/api/plan/modules?id=${encodeURIComponent(card.moduleRef.id)}`,
        { method: "DELETE" }
      );
    } else if (card.drillRef) {
      await fetch(
        `/api/exercises?id=${encodeURIComponent(card.drillRef.id)}`,
        { method: "DELETE" }
      );
    }
    await loadAll();
    showToast(`Removed "${card.title}".`);
  }

  if (loading || !state) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-72 bg-zinc-200 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-24 bg-zinc-200 rounded-2xl" />
          <div className="h-24 bg-zinc-200 rounded-2xl" />
          <div className="h-24 bg-zinc-200 rounded-2xl" />
          <div className="h-24 bg-zinc-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-zinc-200 rounded-2xl" />
      </div>
    );
  }

  // Build unified exercise cards across ALL 4 skills (Sprechen + Hören + Lesen + Schreiben)
  const sessionsByModule = new Map<string, SessionRecord[]>();
  for (const s of state.sessions) {
    const list = sessionsByModule.get(s.moduleId) ?? [];
    list.push(s);
    sessionsByModule.set(s.moduleId, list);
  }

  const speakingCards: UnifiedExerciseCard[] = state.plan.modules.map((mod) => {
    const modSessions = sessionsByModule.get(mod.id) ?? [];
    const openSession = modSessions.find((s) => !s.completedAt);
    const completedSessions = modSessions.filter((s) => Boolean(s.completedAt));
    const bestScore =
      completedSessions.length > 0
        ? Math.max(
            ...completedSessions.map((s) => s.debrief?.overallScore ?? 0)
          )
        : null;

    const status: UnifiedStatus = openSession
      ? "in_progress"
      : mod.status === "completed" || completedSessions.length > 0
      ? "completed"
      : "queued";

    const isExamSpeaking = [
      "exam_teil1_planning",
      "exam_teil2_presentation",
      "exam_teil3_discussion",
    ].includes(mod.category);

    const isAiGeneratedSpeaking =
      mod.source === "bottleneck" || mod.id.startsWith("mod-179");

    return {
      id: mod.id,
      skill: "sprechen",
      title: mod.title,
      subtitle: mod.titleDe,
      level: mod.targetLevel,
      partBadge: isExamSpeaking
        ? mod.category === "exam_teil1_planning"
          ? "Sprechen · Teil 1 (Planen)"
          : mod.category === "exam_teil2_presentation"
          ? "Sprechen · Teil 2 (Präsentation)"
          : "Sprechen · Teil 3 (Rückmeldung)"
        : `Sprechen · ${mod.durationMinutes}m`,
      isExamModeTask: isExamSpeaking,
      provenanceType: isAiGeneratedSpeaking ? "ai" : "web_source",
      provenanceLabel: isAiGeneratedSpeaking
        ? "AI Generated"
        : "Goethe-Institut B1 Modellsatz (goethe.de)",
      sourceUrl: isAiGeneratedSpeaking
        ? undefined
        : "https://www.goethe.de/de/spr/prf/dzu/gzb1/ueb.html",
      status,
      bestScore,
      attemptCount: completedSessions.length,
      activeSessionId: openSession?.id,
      latestSessionId: completedSessions[0]?.id,
      moduleRef: mod,
      canDelete: true,
    };
  });

  const drillCards: UnifiedExerciseCard[] = drills.map((item) => {
    const ex = item.exercise;
    const status: UnifiedStatus =
      item.attemptCount > 0 ? "completed" : "queued";
    const isAi = ex.source === "ai_generated";

    return {
      id: ex.id,
      skill: ex.skill,
      title: ex.title,
      subtitle: `${ex.topicDe} · ${ex.topicEn}`,
      level: ex.level,
      partBadge: ex.examPartLabel,
      isExamModeTask: Boolean(ex.isOfficialFullPart),
      modelTestNumber: ex.modelTestNumber,
      provenanceType: isAi ? "ai" : "web_source",
      provenanceLabel: isAi
        ? "AI Generated"
        : ex.sourceCredit || "Goethe-Institut B1 (goethe.de)",
      sourceUrl: isAi ? undefined : ex.sourceUrl,
      status,
      bestScore: item.bestScore,
      attemptCount: item.attemptCount,
      latestAttemptId: item.latestAttempt?.id,
      drillRef: ex,
      canDelete: ex.source !== "verified_bank",
    };
  });

  const allCards = [...speakingCards, ...drillCards];

  const examModeTotalCount = allCards.filter((c) => c.isExamModeTask).length;
  const exerciseModeTotalCount = allCards.filter(
    (c) => !c.isExamModeTask
  ).length;
  const inProgressCount = allCards.filter((c) => c.status === "in_progress").length;
  const queuedCount = allCards.filter((c) => c.status === "queued").length;
  const completedCount = allCards.filter((c) => c.status === "completed").length;

  const visibleCards = allCards.filter((c) => {
    if (practiceMode === "exam" && !c.isExamModeTask) return false;
    if (practiceMode === "exercise" && c.isExamModeTask) return false;
    if (skillFilter !== "all" && c.skill !== skillFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  // Researched topics NOT yet added to My Exercise List
  const recommendedToAdd = (state.latestResearch?.trendingTopics ?? []).filter(
    (topic) => {
      const de = topic.topicDe.toLowerCase().trim();
      const en = topic.topicEn.toLowerCase().trim();
      return !state.plan.modules.some((m) => {
        const mDe = m.titleDe.toLowerCase();
        const mEn = m.title.toLowerCase();
        return (
          mDe.includes(de) ||
          de.includes(mDe) ||
          mEn.includes(en) ||
          en.includes(mEn)
        );
      });
    }
  );

  const skillMetaMap: Record<
    ExamSkill,
    { label: string; icon: typeof Mic; badge: string }
  > = {
    sprechen: {
      label: "Sprechen",
      icon: Mic,
      badge: "bg-amber-50 text-amber-900 border-amber-200",
    },
    hoeren: {
      label: "Hören",
      icon: Headphones,
      badge: "bg-teal-50 text-teal-900 border-teal-200",
    },
    lesen: {
      label: "Lesen",
      icon: BookOpen,
      badge: "bg-indigo-50 text-indigo-900 border-indigo-200",
    },
    schreiben: {
      label: "Schreiben",
      icon: PenTool,
      badge: "bg-rose-50 text-rose-900 border-rose-200",
    },
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Unified Exercise Workspace</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-0.5">
            All My Exercises & Practice Options
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            See every available exercise across Speaking, Listening, Reading, and
            Writing — track what&apos;s queued, in progress, or done, and add new
            topics cleanly into your list.
          </p>
        </div>

        <Link
          href="/train/lesen"
          className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800"
        >
          <span>Import JSON Packs →</span>
        </Link>
      </div>

      {toast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900 font-medium">
          {toast}
        </div>
      )}

      {/* 1. Interactive Status Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            {
              key: "all" as const,
              label: "All Exercises",
              count: allCards.length,
              tone: "text-zinc-900",
              sub: "Across all 4 skills",
            },
            {
              key: "in_progress" as const,
              label: "In Progress",
              count: inProgressCount,
              tone: "text-amber-700",
              sub: "Started · ready to resume",
            },
            {
              key: "queued" as const,
              label: "Not Started",
              count: queuedCount,
              tone: "text-teal-700",
              sub: "Available to practice",
            },
            {
              key: "completed" as const,
              label: "Completed",
              count: completedCount,
              tone: "text-emerald-700",
              sub: "Done · ready to review",
            },
          ] as const
        ).map((tile) => {
          const active = statusFilter === tile.key;
          return (
            <button
              key={tile.key}
              onClick={() => setStatusFilter(tile.key)}
              className={`text-left rounded-2xl border p-4 transition cursor-pointer ${
                active
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                  : "bg-white border-zinc-200/80 hover:border-zinc-400"
              }`}
            >
              <div
                className={`text-xs font-medium ${
                  active ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                {tile.label}
              </div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  active ? "text-amber-300" : tile.tone
                }`}
              >
                {tile.count}
              </div>
              <div
                className={`text-[11px] mt-0.5 ${
                  active ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {tile.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. STREAMLINED 2-ROW FILTER: MODE (Exam vs. Exercise) + 4 SKILLS */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-3 sm:p-4 space-y-3">
        {/* Row 1: Exam Mode vs. Exercise Mode (2 clean choices) */}
        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-zinc-100 p-1 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() =>
              setPracticeMode((prev) => (prev === "exam" ? "all" : "exam"))
            }
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition cursor-pointer ${
              practiceMode === "exam"
                ? "bg-zinc-900 text-amber-300 shadow-xs"
                : "text-zinc-700 hover:text-zinc-900"
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Exam Mode ({examModeTotalCount})</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setPracticeMode((prev) =>
                prev === "exercise" ? "all" : "exercise"
              )
            }
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition cursor-pointer ${
              practiceMode === "exercise"
                ? "bg-zinc-900 text-white shadow-xs"
                : "text-zinc-700 hover:text-zinc-900"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Exercise Mode ({exerciseModeTotalCount})</span>
          </button>
        </div>

        {/* Row 2: The 4 Skill Categories (combined with Exam / Exercise Mode) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {(
            [
              ["all", "All Skills"],
              ["sprechen", "Sprechen"],
              ["hoeren", "Hören"],
              ["lesen", "Lesen"],
              ["schreiben", "Schreiben"],
            ] as const
          ).map(([k, lbl]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSkillFilter(k)}
              className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border transition cursor-pointer ${
                k === "all" ? "col-span-2 sm:col-span-1" : ""
              } ${
                skillFilter === k
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Contextual 1-tap AI Generator when a non-speaking skill is chosen in Exercise Mode */}
        {(skillFilter === "hoeren" ||
          skillFilter === "lesen" ||
          skillFilter === "schreiben") && (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100">
            <span className="text-[11px] text-zinc-500">
              Want a brand-new AI practice set for {skillMetaMap[skillFilter].label}?
            </span>
            <button
              type="button"
              onClick={() => handleGenerateAndSaveAi(skillFilter)}
              disabled={generatingSkill !== null}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              {generatingSkill === skillFilter ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>+ Generate {skillMetaMap[skillFilter].label}</span>
            </button>
          </div>
        )}
      </section>

      {/* 2.5. EXERCISE MODE SPECIALIZED TRAINERS: SPEAKING INTERVIEWS & Q&A, READING, VOCAB & GRAMMAR */}
      {(practiceMode === "exercise" || practiceMode === "all") && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Link
            href="/train/speaking"
            className="group rounded-2xl bg-gradient-to-br from-amber-50 via-white to-rose-50/50 border border-amber-200/90 hover:border-amber-400 p-5 flex flex-col justify-between gap-4 shadow-xs transition"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                <Mic className="w-3 h-3" />
                <span>Exercise Mode · Speaking &amp; Q&amp;A Studio</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 group-hover:text-amber-900">
                Casual B1 Interviews, Lego Bricks &amp; Q&amp;A Reflex Drills
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Listen &amp; shadow 2-voice casual conversations across all 8
                topics, collect sentences &amp; Email Bridges into your personal
                repeat vault, run 3-2-1 solo speaking drills, and drill 48+
                simple Ask &amp; Answer reflex questions!
              </p>
            </div>
            <span className="self-start inline-flex items-center gap-1 rounded-xl bg-zinc-900 group-hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 transition">
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Start Speaking Drills</span>
            </span>
          </Link>

          <Link
            href="/train/reading"
            className="group rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-amber-50/60 border border-emerald-200/90 hover:border-emerald-400 p-5 flex flex-col justify-between gap-4 shadow-xs transition"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                <BookOpen className="w-3 h-3" />
                <span>Exercise Mode · Reading Studio</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 group-hover:text-emerald-900">
                B1 Interactive Reading Practice (11 Topic Categories)
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                77 curated multi-paragraph B1 articles across all 11 everyday,
                career &amp; Goethe topics (including Banking, Food/Restaurants
                &amp; AI Graduate Job Search — 7 per category). Click any word
                for instant translation &amp; save to your Clicked Reading Vocab
                pool, analyze sentences, and collect Redemittel!
              </p>
            </div>
            <span className="self-start inline-flex items-center gap-1 rounded-xl bg-zinc-900 group-hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 transition">
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Start Reading</span>
            </span>
          </Link>

          <Link
            href="/train/vocab"
            className="group rounded-2xl bg-gradient-to-br from-teal-50 via-white to-amber-50/60 border border-teal-200/90 hover:border-teal-400 p-5 flex flex-col justify-between gap-4 shadow-xs transition"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>Exercise Mode · Vocab Pool</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 group-hover:text-teal-900">
                B1 Vocabulary Matching &amp; Write Trainer
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Match shuffled German words &amp; translations or write Must-Write
                words from memory with multi-day SRS — includes a dedicated{" "}
                <strong>Clicked in Reading</strong> filter!
              </p>
            </div>
            <span className="self-start inline-flex items-center gap-1 rounded-xl bg-zinc-900 group-hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 transition">
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Start Match</span>
            </span>
          </Link>

          <Link
            href="/train/grammar"
            className="group rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-amber-50/50 border border-indigo-200/90 hover:border-indigo-400 p-5 flex flex-col justify-between gap-4 shadow-xs transition"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                <BookOpen className="w-3 h-3" />
                <span>Exercise Mode · Grammar Drills</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 group-hover:text-indigo-900">
                B1 Grammar Training Studio (8 Official Standards)
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Targeted sentence drills on Nebensätze, Konjunktiv II,
                Relativsätze, Passiv, Wechselpräpositionen, Infinitiv mit „zu“
                &amp; Adjektivdeklination — with automatic mistake repetition!
              </p>
            </div>
            <span className="self-start inline-flex items-center gap-1 rounded-xl bg-zinc-900 group-hover:bg-indigo-800 text-white text-xs font-bold px-3.5 py-2 transition">
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Train Rules</span>
            </span>
          </Link>
        </section>
      )}

      {/* 3. MY EXERCISE LIST */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-zinc-900">
            {practiceMode === "exam"
              ? `Exam Mode${skillFilter !== "all" ? ` · ${skillMetaMap[skillFilter].label}` : ""} (${visibleCards.length})`
              : practiceMode === "exercise"
              ? `Exercise Mode${skillFilter !== "all" ? ` · ${skillMetaMap[skillFilter].label}` : ""} (${visibleCards.length})`
              : `All Exercises${skillFilter !== "all" ? ` · ${skillMetaMap[skillFilter].label}` : ""} (${visibleCards.length})`}
          </h2>
          {(practiceMode !== "all" ||
            skillFilter !== "all" ||
            statusFilter !== "all") && (
            <button
              onClick={() => {
                setPracticeMode("all");
                setSkillFilter("all");
                setStatusFilter("all");
              }}
              className="text-xs font-medium text-amber-700 hover:underline cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>

        {visibleCards.length === 0 ? (
          <div className="rounded-2xl bg-white border border-zinc-200 p-8 text-center text-sm text-zinc-500">
            No exercises match these filters yet. Try switching the mode or
            category filter above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {visibleCards.map((card) => {
              const sMeta = skillMetaMap[card.skill];
              const SkillIcon = sMeta.icon;

              return (
                <div
                  key={`${card.skill}-${card.id}`}
                  className={`rounded-2xl bg-white border p-4 sm:p-5 flex flex-col justify-between gap-3.5 transition ${
                    card.status === "in_progress"
                      ? "border-amber-300 bg-amber-50/25"
                      : card.status === "completed"
                      ? "border-emerald-200 bg-emerald-50/15"
                      : "border-zinc-200/80 hover:border-zinc-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sMeta.badge}`}
                        >
                          <SkillIcon className="w-3 h-3" />
                          <span>{card.partBadge}</span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            card.isExamModeTask
                              ? "bg-zinc-900 text-amber-300"
                              : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {card.isExamModeTask
                            ? card.modelTestNumber
                              ? `★ Exam · Modelltest ${card.modelTestNumber}`
                              : "★ Exam Mode"
                            : "Exercise Mode"}
                        </span>

                        {/* Clean Provenance Indicator: Web Source (with clickable link) vs AI Generated */}
                        {card.provenanceType === "ai" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>AI Generated</span>
                          </span>
                        ) : card.sourceUrl ? (
                          <a
                            href={card.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={`Open original source: ${card.provenanceLabel}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition"
                          >
                            <Globe className="w-3 h-3" />
                            <span className="truncate max-w-[180px]">
                              {card.provenanceLabel}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                            <Globe className="w-3 h-3" />
                            <span>{card.provenanceLabel}</span>
                          </span>
                        )}
                      </div>

                      {/* Live Status Pill / 1-Click Toggle for Speaking */}
                      {card.skill === "sprechen" && card.moduleRef ? (
                        <div className="inline-flex items-center rounded-lg bg-zinc-100 p-0.5 text-[10px] font-semibold">
                          {(
                            [
                              ["queued", "New"],
                              ["in_progress", "In Progress"],
                              ["completed", "Done"],
                            ] as const
                          ).map(([st, lbl]) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() =>
                                handleSetSpeakingModuleStatus(
                                  card.moduleRef!.id,
                                  st
                                )
                              }
                              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                                card.status === st
                                  ? st === "completed"
                                    ? "bg-emerald-600 text-white"
                                    : st === "in_progress"
                                    ? "bg-amber-500 text-zinc-950"
                                    : "bg-white text-zinc-900 shadow-xs"
                                  : "text-zinc-500 hover:text-zinc-900"
                              }`}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      ) : card.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                          {card.bestScore !== null ? ` · ${card.bestScore}%` : ""}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-zinc-400">
                          New
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-zinc-900">
                        {card.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {card.subtitle} · {card.level}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {card.skill === "sprechen" && card.moduleRef ? (
                        <>
                          {card.activeSessionId ? (
                            <Link
                              href={`/session/${card.activeSessionId}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold px-3.5 py-2 transition"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Resume Session</span>
                            </Link>
                          ) : (
                            <button
                              onClick={() =>
                                handleStartSpeaking(card.moduleRef!.id)
                              }
                              disabled={startingId !== null}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3.5 py-2 transition cursor-pointer disabled:opacity-60"
                            >
                              <Mic className="w-3.5 h-3.5 text-amber-400" />
                              <span>
                                {startingId === card.moduleRef.id
                                  ? "Starting..."
                                  : card.status === "completed"
                                  ? "Practice Again"
                                  : "Start Speaking"}
                              </span>
                            </button>
                          )}

                          {card.latestSessionId && (
                            <Link
                              href={`/session/${card.latestSessionId}`}
                              className="inline-flex items-center gap-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold px-3 py-2"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </Link>
                          )}
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/train/${card.skill}?exerciseId=${encodeURIComponent(
                              card.id
                            )}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3.5 py-2 transition"
                          >
                            <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                            <span>
                              {card.status === "completed" ? "Retake" : "Start"}
                            </span>
                          </Link>

                          {card.latestAttemptId && (
                            <Link
                              href={`/train/${card.skill}?reviewAttemptId=${encodeURIComponent(
                                card.latestAttemptId
                              )}`}
                              className="inline-flex items-center gap-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold px-3 py-2"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </Link>
                          )}
                        </>
                      )}
                    </div>

                    {card.canDelete && (
                      <button
                        onClick={() => handleRemoveItem(card)}
                        title="Remove from my exercise list"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. GOETHE SPEAKING EXAM BANK (TEIL 1–3) + RECOMMENDED TOPICS TO ADD */}
      {(() => {
        const availAll = filterAvailableSpeakingBank(
          state.plan.modules,
          "all"
        );
        const availT1 = filterAvailableSpeakingBank(
          state.plan.modules,
          "exam_teil1_planning"
        );
        const availT2 = filterAvailableSpeakingBank(
          state.plan.modules,
          "exam_teil2_presentation"
        );
        const availT3 = filterAvailableSpeakingBank(
          state.plan.modules,
          "exam_teil3_discussion"
        );
        const shownBank =
          bankPartFilter === "all"
            ? availAll
            : bankPartFilter === "exam_teil1_planning"
            ? availT1
            : bankPartFilter === "exam_teil2_presentation"
            ? availT2
            : availT3;

        return (
          <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-lg text-zinc-900">
                  Goethe Speaking Exam Bank — Teil 1, Teil 2 &amp; Teil 3 (
                  {shownBank.length} available to add)
                </h2>
                <p className="text-xs text-zinc-500">
                  Focus on a specific exam part for repeated pattern practice!
                  Click <strong>+ Add</strong> (or <strong>Add All Shown</strong>
                  ) to move cards straight into your <strong>New</strong>{" "}
                  Exercise List above.
                </p>
              </div>
              <Link
                href="/plan"
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                AI Generate More on Study Plan →
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    ["all", `All Parts (${availAll.length})`],
                    [
                      "exam_teil1_planning",
                      `Teil 1 · Planen (${availT1.length})`,
                    ],
                    [
                      "exam_teil2_presentation",
                      `Teil 2 · Präsentation (${availT2.length})`,
                    ],
                    [
                      "exam_teil3_discussion",
                      `Teil 3 · Rückmeldung (${availT3.length})`,
                    ],
                  ] as const
                ).map(([k, lbl]) => (
                  <button
                    key={k}
                    onClick={() => setBankPartFilter(k)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                      bankPartFilter === k
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-amber-400"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {shownBank.length > 0 && (
                <button
                  onClick={() => handleAddSpeakingBankItems(shownBank)}
                  className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add All {shownBank.length} Shown to My List</span>
                </button>
              )}
            </div>

            {shownBank.length === 0 ? (
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-900 font-medium">
                All verified Goethe Speaking Bank cards for this part are
                already in your Exercise List above!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {shownBank.map((item) => {
                  const meta =
                    CATEGORY_META[item.category] ??
                    CATEGORY_META.everyday_roleplay;
                  return (
                    <div
                      key={item.bankId}
                      className="rounded-xl border border-zinc-200/80 p-3.5 flex items-start justify-between gap-3 hover:border-amber-300 transition bg-zinc-50/40"
                    >
                      <div className="space-y-1 min-w-0">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}
                        >
                          {meta.badge}
                        </span>
                        <div className="font-semibold text-sm text-zinc-900">
                          {item.title}
                        </div>
                        <div className="text-xs font-medium text-amber-800">
                          {item.titleDe}
                        </div>
                        <p className="text-xs text-zinc-600 line-clamp-2">
                          {item.scenarioPrompt}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddSpeakingBankItems([item])}
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-zinc-900 hover:text-white text-amber-950 border border-amber-200 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {recommendedToAdd.length > 0 && (
              <div className="pt-3 border-t border-zinc-100 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Additional Researched Topics ({recommendedToAdd.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendedToAdd.map((topic, idx) => (
                    <div
                      key={`${topic.topicDe}-${idx}`}
                      className="rounded-xl border border-zinc-200/80 p-3.5 flex items-start justify-between gap-3 hover:border-amber-300 transition bg-zinc-50/40"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-zinc-900">
                          {topic.topicDe}{" "}
                          <span className="text-zinc-500 font-normal">
                            ({topic.topicEn})
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600">
                          {topic.samplePromptDe}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddRecommendedTopic(topic)}
                        disabled={addingTopicKey !== null}
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-zinc-900 hover:text-white text-amber-950 border border-amber-200 transition cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {addingTopicKey === topic.topicDe
                            ? "Adding..."
                            : "Add"}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })()}
    </div>
  );
}
