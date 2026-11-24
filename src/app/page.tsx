"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  Headphones,
  Mic,
  PenTool,
  Play,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { CATEGORY_META, GOAL_PRESETS } from "@/lib/curriculum";
import { computeReadinessMetrics } from "@/lib/standards";
import { CefrLevel, DatabaseSchema, ModuleStatus } from "@/lib/types";

type HydratedState = DatabaseSchema & {
  aiConfig: DatabaseSchema["aiConfig"] & {
    hasGeminiKey?: boolean;
    hasGroqKey?: boolean;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<HydratedState | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [roadmapStatusTab, setRoadmapStatusTab] = useState<
    "all" | ModuleStatus
  >("all");
  const [roadmapPartTab, setRoadmapPartTab] = useState<
    "all" | "exam_teil1_planning" | "exam_teil2_presentation" | "exam_teil3_discussion"
  >("all");

  // Quick setup fields for first-time learners
  const [quickLevel, setQuickLevel] = useState<CefrLevel>("A2");
  const [quickGoalId, setQuickGoalId] = useState("goethe-b1");
  const [quickName, setQuickName] = useState("Learner");

  async function loadState() {
    const res = await fetch("/api/state");
    const data = (await res.json()) as HydratedState;
    setState(data);
    setQuickLevel(data.profile.currentLevel);
    setQuickName(data.profile.name);
    setLoading(false);
  }

  useEffect(() => {
    loadState();
  }, []);

  async function startSession(payload: {
    moduleId?: string;
    bottleneckId?: string;
  }) {
    const key = payload.moduleId || payload.bottleneckId || "recommended";
    setStartingId(key);
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.session?.id) {
        router.push(`/session/${data.session.id}`);
      }
    } finally {
      setStartingId(null);
    }
  }

  async function handleQuickSetup() {
    setSavingOnboarding(true);
    try {
      const preset =
        GOAL_PRESETS.find((g) => g.id === quickGoalId) ?? GOAL_PRESETS[0];
      await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            name: quickName.trim() || "Learner",
            currentLevel: quickLevel,
            targetLevel: preset.targetLevel,
            goalTitle: preset.label,
            goalDetails: preset.details,
            onboardingComplete: true,
          },
        }),
      });
      await fetch("/api/research", { method: "POST" });
      await fetch("/api/plan/generate", { method: "POST" });
      await loadState();
    } finally {
      setSavingOnboarding(false);
    }
  }

  if (loading || !state) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-64 bg-zinc-200 rounded-xl" />
        <div className="h-56 bg-zinc-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-zinc-200 rounded-2xl" />
          <div className="h-44 bg-zinc-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { profile, plan, memory, mastery, sessions, aiConfig } = state;
  const readiness = mastery
    ? computeReadinessMetrics(mastery, memory, profile)
    : null;
  const nextModule =
    plan.modules.find((m) => m.status === "in_progress") ??
    plan.modules.find((m) => m.status === "queued") ??
    plan.modules[0];

  const activeBottlenecks = memory.bottlenecks.filter(
    (b) => b.severity !== "mastered"
  );
  const topBottleneck =
    activeBottlenecks.find((b) => b.severity === "high") ??
    activeBottlenecks[0];

  const completedCount = plan.modules.filter(
    (m) => m.status === "completed"
  ).length;
  const totalModules = plan.modules.length || 1;
  const progressPct = Math.round((completedCount / totalModules) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Proactive Speaking Coach · {profile.currentLevel} →{" "}
            {profile.targetLevel}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-0.5">
            Guten Tag, {profile.name}
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Goal: <span className="font-medium text-zinc-800">{profile.goalTitle}</span>{" "}
            — your coach has today&apos;s speaking session ready for you.
          </p>
        </div>

        {aiConfig.provider === "demo" && (
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 self-start sm:self-center px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium hover:bg-amber-100 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Connect Free Gemini / Groq or Local Ollama</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* First-Time Quick Goal Setup Banner */}
      {!profile.onboardingComplete && (
        <section className="rounded-2xl bg-white border border-amber-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Quick Personalization (30 seconds)
              </span>
              <h2 className="text-lg font-bold text-zinc-900 mt-2">
                Tell your coach your level & target exam
              </h2>
              <p className="text-sm text-zinc-600 mt-0.5">
                I&apos;ll research the exam topics, build an editable speaking roadmap,
                and remember your bottlenecks as we talk.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Your Name
              </label>
              <input
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Current German Level
              </label>
              <select
                value={quickLevel}
                onChange={(e) => setQuickLevel(e.target.value as CefrLevel)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="A1">A1 — Beginner</option>
                <option value="A2">A2 — Elementary</option>
                <option value="B1">B1 — Intermediate</option>
                <option value="B2">B2 — Upper Intermediate</option>
                <option value="C1">C1 — Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Primary Goal
              </label>
              <select
                value={quickGoalId}
                onChange={(e) => setQuickGoalId(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {GOAL_PRESETS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleQuickSetup}
              disabled={savingOnboarding}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium px-4 py-2.5 transition cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {savingOnboarding
                  ? "Researching & Generating Plan..."
                  : "Build My Plan & Save"}
              </span>
            </button>
            <button
              onClick={async () => {
                await fetch("/api/state", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    profile: { onboardingComplete: true },
                  }),
                });
                loadState();
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 px-2 py-1 cursor-pointer"
            >
              Keep default A2 → Goethe B1 plan
            </button>
          </div>
        </section>
      )}

      {/* HERO: Today's Proactive Guided Session */}
      {nextModule && (
        <section className="rounded-3xl bg-zinc-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  Today&apos;s Coach-Led Session
                </span>
                <span className="text-xs bg-white/10 text-zinc-200 px-2.5 py-1 rounded-full">
                  {CATEGORY_META[nextModule.category]?.badge ?? nextModule.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />~{nextModule.durationMinutes} min
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {nextModule.title}
                </h2>
                <p className="text-amber-300/90 text-sm font-medium mt-0.5">
                  {nextModule.titleDe}
                </p>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {nextModule.scenarioPrompt}
              </p>

              {topBottleneck && (
                <div className="inline-flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200">
                  <Brain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-amber-300 font-semibold">
                      Memory Focus Woven In:
                    </span>{" "}
                    {topBottleneck.title}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-white/5">
                  1. Warm-up
                </span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-white/5">
                  2. Guided German Roleplay
                </span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-white/5">
                  3. Spoken Correction Drill
                </span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-white/5">
                  4. Memory Update
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 shrink-0">
              <button
                onClick={() => startSession({ moduleId: nextModule.id })}
                disabled={startingId !== null}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-6 py-4 text-base shadow-lg transition cursor-pointer disabled:opacity-60"
              >
                <Mic className="w-5 h-5" />
                <span>
                  {startingId === nextModule.id
                    ? "Coach is Starting..."
                    : "Start Talking Now"}
                </span>
              </button>
              <Link
                href="/plan"
                className="text-center text-xs text-zinc-400 hover:text-white py-1 transition"
              >
                Or pick / edit another module in Plan →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Visual Exam Readiness & 4-Skill Quick Bar */}
      {mastery && readiness && (
        <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-zinc-900">
                  {mastery.examName} Readiness: {readiness.overallReadiness}%
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {readiness.verdictTitle}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Estimated Standing: <strong>{readiness.estimatedCefrStanding}</strong>{" "}
                · Pass Chance: <strong>{readiness.passProbabilityPct}%</strong> ·{" "}
                {readiness.skillsPassingCount}/4 exam skills at 60%+ passing margin
              </p>
            </div>
            <Link
              href="/progress"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline shrink-0"
            >
              <span>Open Full Visual Monitor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {(
              [
                {
                  key: "sprechen" as const,
                  label: "Sprechen",
                  icon: Mic,
                  href: null,
                  color: "text-amber-700",
                },
                {
                  key: "hoeren" as const,
                  label: "Hören",
                  icon: Headphones,
                  href: "/train/hoeren",
                  color: "text-teal-700",
                },
                {
                  key: "lesen" as const,
                  label: "Lesen",
                  icon: BookOpen,
                  href: "/train/lesen",
                  color: "text-indigo-700",
                },
                {
                  key: "schreiben" as const,
                  label: "Schreiben",
                  icon: PenTool,
                  href: "/train/schreiben",
                  color: "text-rose-700",
                },
              ] as const
            ).map((item) => {
              const s = mastery.skills[item.key];
              const SkillIcon = item.icon;
              const inner = (
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 hover:border-zinc-400 p-3 transition space-y-2 h-full">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                      <SkillIcon className={`w-3.5 h-3.5 ${item.color}`} />
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-zinc-800">
                      {s.score}%
                    </span>
                  </div>
                  <div className="relative w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.score >= 60 ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${s.score}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-zinc-900/50"
                      style={{ left: "60%" }}
                    />
                  </div>
                </div>
              );

              if (item.href) {
                return (
                  <Link key={item.key} href={item.href}>
                    {inner}
                  </Link>
                );
              }
              return (
                <button
                  key={item.key}
                  onClick={() => startSession({})}
                  className="text-left cursor-pointer"
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-white border border-zinc-200/80 p-4">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Plan Progress</span>
            <Target className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1.5">
            {completedCount}/{plan.modules.length}
          </div>
          <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-zinc-200/80 p-4">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Speaking Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1.5">
            {memory.streakDays} {memory.streakDays === 1 ? "day" : "days"}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Daily target: {profile.dailyMinutes} min
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-zinc-200/80 p-4">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total Spoken</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1.5">
            {memory.totalMinutesPracticed} min
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {sessions.filter((s) => s.completedAt).length} completed sessions
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-zinc-200/80 p-4">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Active Bottlenecks</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1.5">
            {activeBottlenecks.length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {memory.vocabulary.length} saved German phrases
          </p>
        </div>
      </div>

      {/* Two-Column: Bottlenecks to Fix Fastest + Upcoming Modules / Recent Recap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Bottlenecks */}
        <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-rose-500" />
                Your Fastest-Improvement Bottlenecks
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Your coach remembers these and weaves them into your voice sessions.
              </p>
            </div>
            <Link
              href="/memory"
              className="text-xs font-medium text-amber-700 hover:underline shrink-0"
            >
              Manage →
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {activeBottlenecks.length === 0 ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
                All tracked bottlenecks are mastered! Complete a speaking session to
                discover your next growth edge.
              </div>
            ) : (
              activeBottlenecks.slice(0, 3).map((bn) => (
                <div
                  key={bn.id}
                  className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-sm text-zinc-900">
                      {bn.title}
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        bn.severity === "high"
                          ? "bg-rose-100 text-rose-800"
                          : bn.severity === "improving"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {bn.severity}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">{bn.description}</p>
                  {bn.betterGerman && (
                    <div className="text-xs bg-white border border-zinc-200/70 rounded-lg px-2.5 py-1.5 text-emerald-800 font-medium">
                      ✓ {bn.betterGerman}
                    </div>
                  )}
                  <button
                    onClick={() => startSession({ bottleneckId: bn.id })}
                    disabled={startingId !== null}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:text-amber-700 pt-0.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>
                      {startingId === bn.id
                        ? "Launching drill..."
                        : "Launch 8-min voice drill on this"}
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Up Next in Editable Plan + Coach Memory Recap */}
        <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  Your Editable Roadmap ({plan.modules.length})
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Filter by New / In Progress / Done or Teil 1–3, and click the
                  circle to cycle status.
                </p>
              </div>
              <Link
                href="/plan"
                className="text-xs font-medium text-amber-700 hover:underline shrink-0"
              >
                + Load Teil 1–3 / Edit →
              </Link>
            </div>

            {/* Status & Teil Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-xl bg-zinc-100 p-0.5 text-[11px] font-semibold">
                {(
                  [
                    ["all", "All"],
                    ["queued", "New"],
                    ["in_progress", "In Progress"],
                    ["completed", "Done"],
                  ] as const
                ).map(([st, lbl]) => (
                  <button
                    key={st}
                    onClick={() => setRoadmapStatusTab(st)}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      roadmapStatusTab === st
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="inline-flex rounded-xl bg-amber-50 border border-amber-200/80 p-0.5 text-[11px] font-medium">
                {(
                  [
                    ["all", "All"],
                    ["exam_teil1_planning", "Teil 1"],
                    ["exam_teil2_presentation", "Teil 2"],
                    ["exam_teil3_discussion", "Teil 3"],
                  ] as const
                ).map(([pt, lbl]) => (
                  <button
                    key={pt}
                    onClick={() => setRoadmapPartTab(pt)}
                    className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                      roadmapPartTab === pt
                        ? "bg-amber-400 text-zinc-950 font-bold"
                        : "text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {plan.modules
                .filter((mod) => {
                  if (
                    roadmapStatusTab !== "all" &&
                    mod.status !== roadmapStatusTab
                  )
                    return false;
                  if (
                    roadmapPartTab !== "all" &&
                    mod.category !== roadmapPartTab
                  )
                    return false;
                  return true;
                })
                .map((mod) => {
                  const nextStatus: ModuleStatus =
                    mod.status === "queued"
                      ? "in_progress"
                      : mod.status === "in_progress"
                      ? "completed"
                      : "queued";

                  return (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between gap-2.5 rounded-xl border border-zinc-200/70 px-3.5 py-2.5 hover:border-zinc-300 transition"
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <button
                          type="button"
                          title={`Status: ${mod.status} (click to switch to ${nextStatus})`}
                          onClick={async () => {
                            const res = await fetch("/api/plan/modules", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: mod.id,
                                status: nextStatus,
                              }),
                            });
                            const out = await res.json();
                            if (out.state) setState(out.state);
                          }}
                          className="shrink-0 cursor-pointer"
                        >
                          {mod.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : mod.status === "in_progress" ? (
                            <div className="w-4 h-4 rounded-full border-2 border-amber-500 bg-amber-200" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-300 hover:border-zinc-500" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-900 truncate">
                            {mod.title}
                          </div>
                          <div className="text-xs text-zinc-500 truncate">
                            {mod.titleDe} · {mod.durationMinutes}m
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => startSession({ moduleId: mod.id })}
                        disabled={startingId !== null}
                        className="shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
                      >
                        {startingId === mod.id ? "..." : "Practice"}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Where You Left Off (Coach Memory)
            </div>
            <p className="text-xs text-zinc-700 mt-1 leading-relaxed">
              {memory.lastSessionRecap}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
