"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Headphones,
  Loader2,
  Mic,
  PenTool,
  RefreshCw,
  Rocket,
  Sparkles,
  TrendingUp,
  Volume2,
} from "lucide-react";
import { speakGerman } from "@/lib/speech";
import { PacingAnalyticsSummary, ReadinessSummary } from "@/lib/standards";
import {
  DatabaseSchema,
  ExamSkill,
  LearnerMemory,
  LearnerProfile,
  MasteryTracker,
} from "@/lib/types";

interface NextHorizonTrack {
  id: string;
  title: string;
  badge: string;
  targetLevel: string;
  goalTitle: string;
  goalDetails: string;
  description: string;
}

interface CategoryExerciseStat {
  doneCount: number;
  totalCount: number;
  avgPoints: number | null;
  attemptsCount: number;
  partTotals?: Record<number, number>;
}

interface ExerciseProgressStats {
  bySkill: Record<ExamSkill, CategoryExerciseStat>;
  byTopicCategory: Record<string, CategoryExerciseStat>;
  byGrammarStandard: Record<string, CategoryExerciseStat>;
}

interface ProgressPayload {
  mastery: MasteryTracker;
  readiness: ReadinessSummary;
  pacingAnalytics?: PacingAnalyticsSummary;
  exerciseProgressStats?: ExerciseProgressStats;
  memory: LearnerMemory;
  profile: LearnerProfile;
  nextHorizons: NextHorizonTrack[];
}

function formatSecMmSs(sec: number): string {
  const safe = Math.max(0, Math.round(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const SKILL_META: Record<
  ExamSkill,
  {
    icon: typeof Mic;
    colorText: string;
    colorBg: string;
    barColor: string;
    actionLabel: string;
  }
> = {
  sprechen: {
    icon: Mic,
    colorText: "text-amber-700",
    colorBg: "bg-amber-50 border-amber-200",
    barColor: "bg-amber-500",
    actionLabel: "Practice Speaking",
  },
  hoeren: {
    icon: Headphones,
    colorText: "text-teal-700",
    colorBg: "bg-teal-50 border-teal-200",
    barColor: "bg-teal-600",
    actionLabel: "Train Listening",
  },
  lesen: {
    icon: BookOpen,
    colorText: "text-indigo-700",
    colorBg: "bg-indigo-50 border-indigo-200",
    barColor: "bg-indigo-600",
    actionLabel: "Train Reading",
  },
  schreiben: {
    icon: PenTool,
    colorText: "text-rose-700",
    colorBg: "bg-rose-50 border-rose-200",
    barColor: "bg-rose-500",
    actionLabel: "Train Writing",
  },
};

function SkillRadarChart({ mastery }: { mastery: MasteryTracker }) {
  const cx = 130;
  const cy = 125;
  const maxR = 82;

  const axes: Array<{ key: ExamSkill; label: string; dx: number; dy: number }> = [
    { key: "sprechen", label: "Sprechen", dx: 0, dy: -1 },
    { key: "hoeren", label: "Hören", dx: 1, dy: 0 },
    { key: "lesen", label: "Lesen", dx: 0, dy: 1 },
    { key: "schreiben", label: "Schreiben", dx: -1, dy: 0 },
  ];

  const getPoints = (pcts: number[]) =>
    axes
      .map((a, idx) => {
        const r = (Math.max(5, Math.min(100, pcts[idx])) / 100) * maxR;
        return `${cx + a.dx * r},${cy + a.dy * r}`;
      })
      .join(" ");

  const currentValues = axes.map((a) => mastery.skills[a.key].score);
  const passLinePoints = getPoints([60, 60, 60, 60]);
  const currentPoints = getPoints(currentValues);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg viewBox="-25 0 310 250" className="w-full max-w-[290px] h-auto">
        {/* Background concentric rings */}
        {[25, 50, 75, 100].map((lvl) => (
          <polygon
            key={lvl}
            points={getPoints([lvl, lvl, lvl, lvl])}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axes.map((a) => (
          <line
            key={a.key}
            x1={cx}
            y1={cy}
            x2={cx + a.dx * maxR}
            y2={cy + a.dy * maxR}
            stroke="#e4e4e7"
            strokeWidth="1"
          />
        ))}

        {/* Official 60% Goethe Pass Threshold Polygon */}
        <polygon
          points={passLinePoints}
          fill="rgba(16, 185, 129, 0.06)"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Current Learner Mastery Polygon */}
        <polygon
          points={currentPoints}
          fill="rgba(217, 119, 6, 0.24)"
          stroke="#d97706"
          strokeWidth="2.5"
        />

        {/* Vertex dots */}
        {axes.map((a, idx) => {
          const val = currentValues[idx];
          const r = (Math.max(5, Math.min(100, val)) / 100) * maxR;
          return (
            <circle
              key={a.key}
              cx={cx + a.dx * r}
              cy={cy + a.dy * r}
              r="4.5"
              fill={val >= 60 ? "#059669" : "#d97706"}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Axis labels */}
        <text
          x={cx}
          y={24}
          textAnchor="middle"
          className="fill-zinc-800 text-[11px] font-bold"
        >
          Sprechen ({mastery.skills.sprechen.score}%)
        </text>
        <text
          x={cx + maxR + 12}
          y={cy + 4}
          textAnchor="start"
          className="fill-zinc-800 text-[11px] font-bold"
        >
          Hören
        </text>
        <text
          x={cx + maxR + 12}
          y={cy + 17}
          textAnchor="start"
          className="fill-zinc-500 text-[10px]"
        >
          {mastery.skills.hoeren.score}%
        </text>
        <text
          x={cx}
          y={236}
          textAnchor="middle"
          className="fill-zinc-800 text-[11px] font-bold"
        >
          Lesen ({mastery.skills.lesen.score}%)
        </text>
        <text
          x={cx - maxR - 10}
          y={cy + 4}
          textAnchor="end"
          className="fill-zinc-800 text-[11px] font-bold"
        >
          Schreiben
        </text>
        <text
          x={cx - maxR - 10}
          y={cy + 17}
          textAnchor="end"
          className="fill-zinc-500 text-[10px]"
        >
          {mastery.skills.schreiben.score}%
        </text>
      </svg>

      <div className="flex items-center gap-4 text-[11px] text-zinc-500 mt-1">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-amber-600 inline-block" />
          Your Mastery
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
          60% Official Pass Line
        </span>
      </div>
    </div>
  );
}

function GrowthChart({ history }: { history: MasteryTracker["history"] }) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl bg-zinc-50 border border-dashed border-zinc-300 p-6 text-center space-y-1.5">
        <TrendingUp className="w-6 h-6 text-zinc-400 mx-auto" />
        <p className="text-sm font-medium text-zinc-700">
          Your growth curve starts after your first completed session or drill
        </p>
        <p className="text-xs text-zinc-500">
          Every completed Speaking, Listening, Reading, or Writing session logs a
          point here so you can watch your exam readiness climb step by step.
        </p>
      </div>
    );
  }

  const width = 560;
  const height = 160;
  const padX = 28;
  const padY = 18;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const pts = history.map((h, i) => {
    const x =
      history.length === 1
        ? padX + innerW / 2
        : padX + (i / (history.length - 1)) * innerW;
    const y = padY + innerH - (h.overallReadiness / 100) * innerH;
    return { x, y, ...h };
  });

  const linePath = pts
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(
    padY + innerH
  ).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  const passY = padY + innerH - 0.6 * innerH;

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        {/* 60% official pass margin line */}
        <line
          x1={padX}
          y1={passY}
          x2={width - padX}
          y2={passY}
          stroke="#10b981"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <text
          x={width - padX}
          y={passY - 4}
          textAnchor="end"
          className="fill-emerald-600 text-[10px] font-semibold"
        >
          60% Pass Margin
        </text>

        {/* Area & line */}
        {pts.length > 1 && (
          <>
            <path d={areaPath} fill="rgba(15, 118, 110, 0.12)" />
            <path
              d={linePath}
              fill="none"
              stroke="#0f766e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Session dots */}
        {pts.map((p) => (
          <g key={p.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#0f766e"
              stroke="#ffffff"
              strokeWidth="1.5"
            >
              <title>
                {p.label} · Session {p.sessionScore}% → Readiness {p.overallReadiness}%
              </title>
            </circle>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500">
        {history.slice(-4).map((h) => (
          <span
            key={h.id}
            className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700"
          >
            {h.skill.toUpperCase()} {h.sessionScore}% → {h.overallReadiness}% ready
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProgressMonitorPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<ProgressPayload | null>(null);
  const [voiceCfg, setVoiceCfg] = useState<DatabaseSchema["aiConfig"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [launchingKey, setLaunchingKey] = useState<string | null>(null);
  const [switchingTrack, setSwitchingTrack] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadAll() {
    const [progRes, stateRes] = await Promise.all([
      fetch("/api/progress"),
      fetch("/api/state"),
    ]);
    const progData = (await progRes.json()) as ProgressPayload;
    const stateData = (await stateRes.json()) as DatabaseSchema;
    setPayload(progData);
    setVoiceCfg(stateData.aiConfig);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function launchSkillTraining(
    skill: ExamSkill,
    opts?: { vocabCategoryId?: string; grammarStandardId?: string; topicTitle?: string }
  ) {
    if (skill === "sprechen") {
      setLaunchingKey(`sprechen-${opts?.vocabCategoryId || opts?.grammarStandardId || "main"}`);
      try {
        // Launch a proactive speaking session (custom module if from a grammar/vocab card!)
        if (opts?.topicTitle) {
          const addRes = await fetch("/api/plan/modules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `Standard Focus: ${opts.topicTitle}`,
              titleDe: opts.topicTitle,
              category: opts.grammarStandardId ? "bottleneck_drill" : "everyday_roleplay",
              targetLevel: payload?.mastery.standardLevel ?? "B1",
              durationMinutes: 8,
              scenarioPrompt: `Targeted speaking practice to strengthen "${opts.topicTitle}" toward ${payload?.mastery.examName ?? "B1"} standards.`,
              coachRole: "Goethe exam speaking coach",
              learnerGoal: `Actively speak using "${opts.topicTitle}" across 4–5 natural German turns.`,
              grammarFocus: opts.grammarStandardId ? [opts.topicTitle] : [],
              keyVocabulary: [],
              source: "custom",
            }),
          });
          const added = await addRes.json();
          const startRes = await fetch("/api/sessions/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleId: added.module?.id }),
          });
          const started = await startRes.json();
          if (started?.session?.id) {
            router.push(`/session/${started.session.id}`);
          }
          return;
        }

        const startRes = await fetch("/api/sessions/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const started = await startRes.json();
        if (started?.session?.id) {
          router.push(`/session/${started.session.id}`);
        }
      } finally {
        setLaunchingKey(null);
      }
      return;
    }

    const q = new URLSearchParams();
    if (opts?.vocabCategoryId) q.set("vocab", opts.vocabCategoryId);
    if (opts?.grammarStandardId) q.set("grammar", opts.grammarStandardId);
    const qs = q.toString();
    router.push(`/train/${skill}${qs ? `?${qs}` : ""}`);
  }

  async function handleQuickBoost(
    type: "vocab" | "grammar",
    id: string,
    nextPct: number
  ) {
    const res = await fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        type === "vocab"
          ? { type: "vocab", id, progressPct: nextPct }
          : { type: "grammar", id, masteryPct: nextPct }
      ),
    });
    const out = await res.json();
    if (out.mastery && out.readiness) {
      setPayload((prev) =>
        prev ? { ...prev, mastery: out.mastery, readiness: out.readiness } : prev
      );
    }
  }

  async function handleSwitchHorizon(trackId: string) {
    if (
      !window.confirm(
        "Switch your active goal & generate a new roadmap for this track? (Your learner memory & past sessions are kept!)"
      )
    ) {
      return;
    }
    setSwitchingTrack(trackId);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId }),
      });
      if (res.ok) {
        setNotice("Switched to your new horizon track and generated a fresh study plan!");
        await loadAll();
      }
    } finally {
      setSwitchingTrack(null);
    }
  }

  if (loading || !payload) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-72 bg-zinc-200 rounded-xl" />
        <div className="h-52 bg-zinc-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-zinc-200 rounded-2xl" />
          <div className="h-64 bg-zinc-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    mastery,
    readiness,
    pacingAnalytics,
    exerciseProgressStats,
    memory,
    profile,
    nextHorizons,
  } = payload;

  // Circular gauge math
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    circumference - (readiness.overallReadiness / 100) * circumference;

  const verdictBadgeColor =
    readiness.verdictTone === "ready"
      ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/40"
      : readiness.verdictTone === "high"
      ? "bg-teal-400/20 text-teal-200 border-teal-400/40"
      : readiness.verdictTone === "passing"
      ? "bg-amber-400/20 text-amber-200 border-amber-400/40"
      : "bg-white/10 text-amber-300 border-white/15";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Official Standards & Visual Progress Monitor
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-0.5">
            {mastery.examName} Readiness Monitor
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Tracks all 4 official exam skills, {mastery.standardLevel} vocabulary
            categories, and grammar standards automatically as you practice.
          </p>
        </div>

        <button
          onClick={async () => {
            const res = await fetch("/api/progress", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "sync_standard" }),
            });
            if (res.ok) {
              setNotice(`Synced standards checklist to ${profile.goalTitle}.`);
              loadAll();
            }
          }}
          className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-medium px-3 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Standards to Goal</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900 font-medium">
          {notice}
        </div>
      )}

      {/* 1. HERO READINESS GAUGE & PASS FORECAST */}
      <section className="rounded-3xl bg-zinc-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-14 -bottom-14 w-64 h-64 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Circular SVG Gauge */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 132 132">
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="10"
                />
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke={
                    readiness.overallReadiness >= 72
                      ? "#34d399"
                      : readiness.overallReadiness >= 58
                      ? "#fbbf24"
                      : "#f59e0b"
                  }
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tracking-tight">
                  {readiness.overallReadiness}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                  {mastery.standardLevel} Ready
                </span>
              </div>
            </div>

            <div className="space-y-2.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${verdictBadgeColor}`}
                >
                  <Award className="w-3.5 h-3.5" />
                  {readiness.verdictTitle}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-zinc-200 font-medium">
                  Estimated Standing: {readiness.estimatedCefrStanding}
                </span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {readiness.verdictDetail}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 max-w-2xl">
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <div className="text-[10px] uppercase text-zinc-400">
                    Pass Chance
                  </div>
                  <div className="text-lg font-bold text-amber-300">
                    {readiness.passProbabilityPct}%
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <div className="text-[10px] uppercase text-zinc-400">
                    Teile Tested
                  </div>
                  <div className="text-lg font-bold text-amber-200">
                    {readiness.testedTeileTotal ?? 0} /{" "}
                    {readiness.totalTeileCount ?? 15}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <div className="text-[10px] uppercase text-zinc-400">
                    Topics Trained
                  </div>
                  <div className="text-lg font-bold text-teal-200">
                    {readiness.topicsTrainedCount ?? 0} /{" "}
                    {readiness.totalTopicsCount ?? 8}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <div className="text-[10px] uppercase text-zinc-400">
                    Skills ≥ 60%
                  </div>
                  <div className="text-lg font-bold text-emerald-300">
                    {readiness.skillsPassingCount} / 4
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase text-zinc-400">
                    Topic / Gram
                  </div>
                  <div className="text-lg font-bold text-teal-300">
                    {readiness.topicBreadthPct ?? readiness.vocabAvg}% / {readiness.grammarAvg}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => launchSkillTraining(readiness.weakestSkill)}
              disabled={launchingKey !== null}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-5 py-3.5 text-sm shadow-lg transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                Boost Weakest Skill (
                {mastery.skills[readiness.weakestSkill].labelDe})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-zinc-400 text-center">
              Official Goethe passing margin is 60% per module
            </p>
          </div>
        </div>
      </section>

      {/* 2. FOUR OFFICIAL EXAM SKILLS (RADAR + 4 TRAINABLE CARDS) */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="font-bold text-lg text-zinc-900">
            1. Official 4-Module Exam Readiness ({mastery.standardLevel})
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Train Speaking, Listening, Reading, and Writing directly — each
            completed drill updates your readiness and learner memory automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5">
            <SkillRadarChart mastery={mastery} />
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(["sprechen", "hoeren", "lesen", "schreiben"] as ExamSkill[]).map(
              (skillKey) => {
                const s = mastery.skills[skillKey];
                const meta = SKILL_META[skillKey];
                const Icon = meta.icon;
                const passing = s.score >= s.passThreshold;
                const skillStat = exerciseProgressStats?.bySkill?.[skillKey];
                const doneCount =
                  skillStat?.doneCount ?? s.uniqueTasksCount ?? s.sessionsCount;
                const totalPoolCount = skillStat?.totalCount ?? null;
                const avgPoints =
                  skillStat?.avgPoints ?? s.practicedAccuracyAvg ?? null;

                return (
                  <div
                    key={skillKey}
                    className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${meta.colorBg}`}
                          >
                            <Icon className={`w-4 h-4 ${meta.colorText}`} />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-zinc-900">
                              {s.labelDe}{" "}
                              <span className="text-zinc-400 font-normal">
                                · {s.label}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              <strong>
                                {s.testedPartsCount ?? 0}/
                                {s.totalPartsCount ?? 3} Teile
                              </strong>{" "}
                              tested
                              {s.sessionsCount > doneCount
                                ? ` · ${s.sessionsCount} attempts`
                                : ""}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block text-sm font-bold px-2 py-0.5 rounded-lg ${
                              passing
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-zinc-200/80 text-zinc-800"
                            }`}
                            title="Verified Exam Readiness across all official Teile (untested Teile count as 0% until practiced)"
                          >
                            {s.score}%
                          </span>
                          {avgPoints != null && (
                            <div className="text-[10px] font-semibold text-teal-800 mt-0.5">
                              Avg: Ø {avgPoints} pts
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pool Completion & Average Points Meta Row */}
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-zinc-600">
                          Exercises done:{" "}
                          <strong className="text-zinc-900">
                            {doneCount}
                            {totalPoolCount != null ? ` / ${totalPoolCount}` : ""}
                          </strong>
                        </span>
                        <span
                          className={`font-semibold ${
                            avgPoints == null
                              ? "text-zinc-400"
                              : avgPoints >= 75
                              ? "text-emerald-700"
                              : avgPoints >= 60
                              ? "text-teal-700"
                              : "text-amber-700"
                          }`}
                        >
                          {avgPoints != null ? `Ø ${avgPoints} pts avg` : "No score yet"}
                        </span>
                      </div>

                      {/* Bar with 60% official passing marker */}
                      <div className="relative w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            passing ? "bg-emerald-500" : meta.barColor
                          }`}
                          style={{ width: `${s.score}%` }}
                        />
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-zinc-900/60"
                          style={{ left: `${s.passThreshold}%` }}
                          title="60% Official Goethe Pass Threshold"
                        />
                      </div>

                      {/* Per-Teil Coverage & Accuracy Breakdown */}
                      {s.teilBreakdown && s.teilBreakdown.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {s.teilBreakdown.map((tb) => {
                            const tested = tb.uniqueTasksCount > 0;
                            const partPoolTotal =
                              skillStat?.partTotals?.[tb.partNumber] ?? null;
                            const denom =
                              partPoolTotal && partPoolTotal >= tb.uniqueTasksCount
                                ? partPoolTotal
                                : Math.max(3, tb.uniqueTasksCount);
                            return (
                              <span
                                key={tb.partNumber}
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                                  tested
                                    ? (tb.avgScore ?? 0) >= 60
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                      : "bg-amber-50 border-amber-200 text-amber-900"
                                    : "bg-white/70 border-dashed border-zinc-300 text-zinc-400"
                                }`}
                                title={
                                  tested
                                    ? `${tb.label}: Ø ${tb.avgScore} pts avg across ${tb.uniqueTasksCount} of ${denom} pool tasks (${tb.readinessContribution}% readiness contribution; 3+ unique tasks = full depth confidence)`
                                    : `${tb.label}: 0/${denom} done (contributes 0% to overall ${s.labelDe} readiness until practiced)`
                                }
                              >
                                {tested
                                  ? `✓ ${tb.label}: Ø ${tb.avgScore} pts (${tb.uniqueTasksCount}/${denom})`
                                  : `○ ${tb.label}: 0/${denom}`}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <p className="text-[11px] text-zinc-500 leading-snug">
                        {s.examParts}
                      </p>
                    </div>

                    <button
                      onClick={() => launchSkillTraining(skillKey)}
                      disabled={launchingKey !== null}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold py-2 px-3 transition cursor-pointer disabled:opacity-60"
                    >
                      {launchingKey === `sprechen-main` && skillKey === "sprechen" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Icon className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{meta.actionLabel}</span>
                    </button>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* 1.5. EXAM PACING & FINISH-TIME PREDICTOR */}
      {pacingAnalytics && (
        <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Exam Pacing &amp; Finish-Time Predictor
              </h2>
              <p className="text-xs text-zinc-500">
                Tracks your actual finish time per task and predicts your total
                exam-day duration for each full module (Hören 40m · Lesen 65m ·
                Schreiben 60m).
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 self-start sm:self-auto">
              {pacingAnalytics.totalTimedAttempts} timed task
              {pacingAnalytics.totalTimedAttempts === 1 ? "" : "s"} logged
            </span>
          </div>

          {pacingAnalytics.totalTimedAttempts === 0 ? (
            <div className="rounded-xl bg-zinc-50 border border-dashed border-zinc-300 p-4 text-xs text-zinc-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-800">
                  No timed tasks recorded yet.
                </p>
                <p className="mt-0.5">
                  Open any Lesen, Hören, or Schreiben exercise — the countdown
                  starts automatically and records your exact finish time upon
                  submission to build your per-Teil averages and full-exam time
                  predictions.
                </p>
              </div>
              <Link
                href="/train/lesen"
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-3.5 py-2 shrink-0"
              >
                <span>Start a Timed Lesen Task</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                {(["hoeren", "lesen", "schreiben"] as const).map((sk) => {
                  const sp = pacingAnalytics!.skills[sk];
                  const meta = SKILL_META[sk];
                  const Icon = meta.icon;
                  const pctOfLimit =
                    sp.predictedFullExamMinutes !== null
                      ? Math.min(
                          130,
                          Math.round(
                            (sp.predictedFullExamMinutes /
                              sp.officialTotalMinutes) *
                              100
                          )
                        )
                      : 0;

                  return (
                    <div
                      key={sk}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center ${meta.colorBg}`}
                            >
                              <Icon className={`w-4 h-4 ${meta.colorText}`} />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-zinc-900">
                                {sp.labelDe} · {sp.officialTotalMinutes}m Limit
                              </div>
                              <div className="text-[11px] text-zinc-500">
                                {sp.timedAttemptsCount} timed ·{" "}
                                {sp.testedPartsCount}/{sp.totalPartsCount} Teile
                              </div>
                            </div>
                          </div>

                          {sp.status !== "no_data" && sp.marginMinutes !== null ? (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                sp.status === "ahead"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : sp.status === "on_track"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {sp.marginMinutes >= 0
                                ? `${sp.marginMinutes}m ahead`
                                : `+${Math.abs(sp.marginMinutes)}m over`}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600">
                              No data
                            </span>
                          )}
                        </div>

                        {/* Predicted Full-Module Finish Time */}
                        <div className="rounded-xl bg-white border border-zinc-200/80 p-3 space-y-1.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[11px] font-semibold text-zinc-500">
                              Predicted Full Module:
                            </span>
                            <span className="text-base font-extrabold text-zinc-900 font-mono">
                              {sp.predictedFullExamMinutes !== null
                                ? `~${sp.predictedFullExamMinutes} min`
                                : "—"}
                              <span className="text-xs font-normal text-zinc-400">
                                {" "}
                                / {sp.officialTotalMinutes}m
                              </span>
                            </span>
                          </div>

                          {sp.predictedFullExamMinutes !== null && (
                            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  sp.status === "ahead"
                                    ? "bg-emerald-500"
                                    : sp.status === "on_track"
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${Math.min(100, pctOfLimit)}%` }}
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
                            <span>
                              Avg Task:{" "}
                              <strong className="text-zinc-800 font-mono">
                                {sp.avgTaskDurationSec !== null
                                  ? formatSecMmSs(sp.avgTaskDurationSec)
                                  : "—"}
                              </strong>
                            </span>
                            {sp.observedPacingRatio !== null && (
                              <span>
                                Pace:{" "}
                                <strong className="text-zinc-800">
                                  {Math.round(sp.observedPacingRatio * 100)}%
                                </strong>{" "}
                                of limit
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Per-Teil Average / Estimated Breakdown */}
                        <div className="space-y-1">
                          {sp.parts.map((part) => (
                            <div
                              key={part.partNumber}
                              className="flex items-center justify-between gap-2 text-[11px] px-2 py-1 rounded-lg bg-white/80 border border-zinc-200/60"
                            >
                              <span className="font-semibold text-zinc-800 truncate">
                                {part.shortLabel}
                                <span className="text-zinc-400 font-normal">
                                  {" "}
                                  ({part.officialMinutes}m)
                                </span>
                              </span>
                              {part.avgDurationSec !== null ? (
                                <span className="font-mono font-bold text-teal-800 shrink-0">
                                  Avg {formatSecMmSs(part.avgDurationSec)}{" "}
                                  <span className="text-[10px] font-normal text-zinc-500">
                                    ({part.attemptsCount}×)
                                  </span>
                                </span>
                              ) : part.predictedMinutes !== null ? (
                                <span className="font-mono text-zinc-500 shrink-0">
                                  Est. ~{part.predictedMinutes}m
                                </span>
                              ) : (
                                <span className="text-zinc-400 shrink-0">
                                  Untimed
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Timed Tasks Strip */}
              {pacingAnalytics.recentTimedTasks.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                    Recent Timed Completions
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pacingAnalytics.recentTimedTasks.map((item) => {
                      const withinLimit =
                        item.durationSec <= item.targetDurationSec;
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-3 py-2 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-900 truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {item.examPartLabel} · Score {item.score}%
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div
                              className={`font-mono font-bold ${
                                withinLimit
                                  ? "text-emerald-700"
                                  : "text-rose-700"
                              }`}
                            >
                              {formatSecMmSs(item.durationSec)}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              Target {formatSecMmSs(item.targetDurationSec)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* 3. STEP-BY-STEP GROWTH TIMELINE */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              2. Step-by-Step Progress Growth
            </h2>
            <p className="text-xs text-zinc-500">
              Watch your overall readiness climb across every completed Speaking,
              Listening, Reading, and Writing session.
            </p>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            {mastery.history.length} milestones logged
          </span>
        </div>

        <GrowthChart history={mastery.history} />
      </section>

      {/* 4. OFFICIAL VOCABULARY CATEGORIES (WORTSCHATZ-STANDARDS) */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-lg text-zinc-900">
              3. Official {mastery.standardLevel} Vocabulary Categories (Wortschatz)
            </h2>
            <p className="text-xs text-zinc-500">
              Required thematic word clusters for {mastery.examName}. Practice any
              category to grow your vocabulary coverage!
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 self-start sm:self-center">
            Average Coverage: {readiness.vocabAvg}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {mastery.vocabCategories.map((cat) => {
            const catStat = exerciseProgressStats?.byTopicCategory?.[cat.id];
            const catDone = catStat?.doneCount ?? 0;
            const catTotal = catStat?.totalCount ?? 0;
            const catAvg = catStat?.avgPoints ?? null;
            return (
            <div
              key={cat.id}
              className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-zinc-900">
                    {cat.titleDe}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {cat.titleEn} · ~{cat.masteredWords} / {cat.targetWords} words
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    cat.progressPct >= 70
                      ? "bg-emerald-100 text-emerald-800"
                      : cat.progressPct >= 40
                      ? "bg-amber-100 text-amber-900"
                      : "bg-zinc-200 text-zinc-700"
                  }`}
                >
                  {cat.progressPct}%
                </span>
              </div>

              {/* Exercises Done & Average Points Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-white/80 border border-zinc-200/70 rounded-lg px-2.5 py-1.5">
                <span className="text-zinc-600">
                  Exercises done:{" "}
                  <strong className="text-zinc-900">
                    {catDone} / {catTotal}
                  </strong>
                  {catStat && catStat.attemptsCount > catDone ? (
                    <span className="text-zinc-400">
                      {" "}
                      ({catStat.attemptsCount} tries)
                    </span>
                  ) : null}
                </span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-md ${
                    catAvg == null
                      ? "bg-zinc-100 text-zinc-500"
                      : catAvg >= 75
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : catAvg >= 60
                      ? "bg-teal-50 text-teal-800 border border-teal-200"
                      : "bg-amber-50 text-amber-900 border border-amber-200"
                  }`}
                >
                  {catAvg != null ? `Avg: Ø ${catAvg} pts` : "No score yet"}
                </span>
              </div>

              <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    cat.progressPct >= 70 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${cat.progressPct}%` }}
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {cat.sampleWords.slice(0, 4).map((w) => (
                  <button
                    key={w}
                    onClick={() =>
                      speakGerman(w, {
                        rate: voiceCfg?.voiceRate ?? 0.95,
                        ttsProvider: voiceCfg?.ttsProvider ?? "edge_neural",
                        edgeVoice: voiceCfg?.edgeVoice,
                      })
                    }
                    title="Click to hear German pronunciation"
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white border border-zinc-200 hover:border-amber-400 text-zinc-700 cursor-pointer"
                  >
                    <Volume2 className="w-2.5 h-2.5 text-zinc-400" />
                    <span>{w}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/train/vocab?category=${cat.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Match Vocab</span>
                  </Link>
                  <Link
                    href={`/train/reading?category=${cat.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 transition"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Read Articles</span>
                  </Link>
                  <Link
                    href={`/train/speaking?category=${cat.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition"
                  >
                    <Mic className="w-3 h-3" />
                    <span>Interviews &amp; Q&amp;A</span>
                  </Link>
                  <button
                    onClick={() =>
                      launchSkillTraining("sprechen", {
                        vocabCategoryId: cat.id,
                        topicTitle: cat.titleDe,
                      })
                    }
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
                  >
                    Speak
                  </button>
                  <button
                    onClick={() =>
                      launchSkillTraining("hoeren", { vocabCategoryId: cat.id })
                    }
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 cursor-pointer"
                  >
                    Listen
                  </button>
                  <button
                    onClick={() =>
                      launchSkillTraining("lesen", { vocabCategoryId: cat.id })
                    }
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 cursor-pointer"
                  >
                    Read
                  </button>
                  <button
                    onClick={() =>
                      launchSkillTraining("schreiben", { vocabCategoryId: cat.id })
                    }
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 cursor-pointer"
                  >
                    Write
                  </button>
                </div>

                <button
                  onClick={() =>
                    handleQuickBoost(
                      "vocab",
                      cat.id,
                      Math.min(100, cat.progressPct + 15)
                    )
                  }
                  title="Self-report known words from outside study"
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 cursor-pointer"
                >
                  +15% I know these
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* 5. OFFICIAL GRAMMAR STANDARDS (LINKED TO MEMORY BOTTLENECKS) */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-lg text-zinc-900">
              4. Official {mastery.standardLevel} Grammar Standards (Grammatik)
            </h2>
            <p className="text-xs text-zinc-500">
              Core grammatical structures required for {mastery.standardLevel}.
              Active bottlenecks from your Learner Memory are highlighted automatically.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-200 self-start sm:self-center">
            Grammar Mastery: {readiness.grammarAvg}%
          </span>
        </div>

        <div className="space-y-3">
          {mastery.grammarStandards.map((g) => {
            const gStat = exerciseProgressStats?.byGrammarStandard?.[g.id];
            const linkedBottleneck = memory.bottlenecks.find(
              (b) =>
                b.severity !== "mastered" &&
                (b.title.toLowerCase().includes(g.titleDe.split(" ")[0].toLowerCase()) ||
                  g.titleDe.toLowerCase().includes(b.title.split(" ")[0].toLowerCase()))
            );

            return (
              <div
                key={g.id}
                className={`rounded-xl border p-4 space-y-2.5 ${
                  linkedBottleneck
                    ? "border-rose-200 bg-rose-50/30"
                    : "border-zinc-200/80 bg-zinc-50/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900">
                        {g.titleDe}
                      </span>
                      {g.masteryPct >= 75 && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      {linkedBottleneck && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          Active Memory Bottleneck
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600">{g.description}</p>
                    <div className="flex items-center gap-2 text-xs text-teal-800 italic">
                      <span>„{g.exampleDe}“</span>
                      <button
                        onClick={() =>
                          speakGerman(g.exampleDe, {
                            rate: voiceCfg?.voiceRate ?? 0.95,
                            ttsProvider: voiceCfg?.ttsProvider ?? "edge_neural",
                            edgeVoice: voiceCfg?.edgeVoice,
                          })
                        }
                        className="p-1 rounded hover:bg-teal-100 cursor-pointer"
                        title="Listen in German"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-zinc-800 w-10 text-right">
                      {g.masteryPct}%
                    </span>
                    <Link
                      href={`/train/grammar?standard=${g.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 transition"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Grammar Drill</span>
                    </Link>
                    <button
                      onClick={() =>
                        launchSkillTraining("sprechen", {
                          grammarStandardId: g.id,
                          topicTitle: g.titleDe,
                        })
                      }
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
                    >
                      Voice Drill
                    </button>
                    <button
                      onClick={() =>
                        launchSkillTraining("schreiben", {
                          grammarStandardId: g.id,
                        })
                      }
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                    >
                      Write
                    </button>
                  </div>
                </div>

                {gStat && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-zinc-600">
                      Exercises done:{" "}
                      <strong className="text-zinc-900">
                        {gStat.doneCount} / {gStat.totalCount}
                      </strong>
                    </span>
                    <span
                      className={`font-semibold ${
                        gStat.avgPoints == null
                          ? "text-zinc-400"
                          : gStat.avgPoints >= 75
                          ? "text-emerald-700"
                          : gStat.avgPoints >= 60
                          ? "text-teal-700"
                          : "text-amber-700"
                      }`}
                    >
                      {gStat.avgPoints != null
                        ? `Avg: Ø ${gStat.avgPoints} pts`
                        : "No score yet"}
                    </span>
                  </div>
                )}

                <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      g.masteryPct >= 75
                        ? "bg-emerald-500"
                        : linkedBottleneck
                        ? "bg-rose-500"
                        : "bg-teal-600"
                    }`}
                    style={{ width: `${g.masteryPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. NEXT HORIZONS: LEVEL UP OR EXPLORE REAL-WORLD / BUSINESS TRACKS */}
      <section className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-teal-50 border border-amber-200/80 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
              <Rocket className="w-4 h-4" />
              <span>
                {readiness.readyForNextHorizon
                  ? "Milestone Unlocked — Ready for Your Next Horizon!"
                  : "Future Horizons (Level Up or Explore New Contexts)"}
              </span>
            </div>
            <h2 className="font-bold text-lg text-zinc-900 mt-1">
              What Comes After {mastery.examName}?
            </h2>
            <p className="text-xs text-zinc-600">
              Once you cross your passing margin — or anytime you want to branch
              out — switch seamlessly to B2, Business German, or Real-Life Germany
              while keeping all your Learner Memory.
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:underline shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Or customize your own goal</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {nextHorizons.map((track) => (
            <div
              key={track.id}
              className="rounded-2xl bg-white border border-zinc-200/80 p-4 flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1.5">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                  {track.badge}
                </span>
                <h3 className="font-bold text-sm text-zinc-900">
                  {track.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {track.description}
                </p>
              </div>

              <button
                onClick={() => handleSwitchHorizon(track.id)}
                disabled={switchingTrack !== null}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold py-2.5 px-3 transition cursor-pointer disabled:opacity-60"
              >
                {switchingTrack === track.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>
                  {switchingTrack === track.id
                    ? "Building Track..."
                    : "Explore This Track"}
                </span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
