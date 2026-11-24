"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Headphones,
  Layers,
  Lightbulb,
  Loader2,
  Mic,
  PenTool,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Volume2,
  XCircle,
} from "lucide-react";
import { GOAL_PRESETS } from "@/lib/curriculum";
import { speakGerman } from "@/lib/speech";
import {
  ErrorClusterDiagnostic,
  GrammarClinicLesson,
  StudyPlanDiagnosticReport,
} from "@/lib/study-planner";
import {
  CefrLevel,
  DatabaseSchema,
  ExamSkill,
  StudyModule,
} from "@/lib/types";

export default function PlanPage() {
  const router = useRouter();
  const [state, setState] = useState<DatabaseSchema | null>(null);
  const [report, setReport] = useState<StudyPlanDiagnosticReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Goal bar state
  const [currentLevel, setCurrentLevel] = useState<CefrLevel>("A2");
  const [targetLevel, setTargetLevel] = useState<CefrLevel>("B1");
  const [goalTitle, setGoalTitle] = useState("Goethe-Zertifikat B1 Exam");
  const [goalDetails, setGoalDetails] = useState("");
  const [customNote, setCustomNote] = useState("");

  // Action loading flags
  const [researching, setResearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showResearchDetails, setShowResearchDetails] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Grammar Clinic & Interactive Personalized Exercise State
  const [selectedClusterId, setSelectedClusterId] = useState<string>(
    "cluster-sentence-structure"
  );
  const [customClinics, setCustomClinics] = useState<
    Record<string, GrammarClinicLesson>
  >({});
  const [generatingAiClinic, setGeneratingAiClinic] = useState(false);
  const [clinicAnswers, setClinicAnswers] = useState<Record<string, number>>(
    {}
  );
  const [clinicSubmitted, setClinicSubmitted] = useState<
    Record<string, boolean>
  >({});
  const [launchingGrammarSpeaking, setLaunchingGrammarSpeaking] = useState<
    string | null
  >(null);

  async function loadAll() {
    const [stateRes, coachRes] = await Promise.all([
      fetch("/api/state"),
      fetch("/api/plan/coach"),
    ]);
    const data = (await stateRes.json()) as DatabaseSchema;
    const coachData = (await coachRes.json()) as {
      report: StudyPlanDiagnosticReport;
    };
    setState(data);
    setReport(coachData.report);
    setCurrentLevel(data.profile.currentLevel);
    setTargetLevel(data.profile.targetLevel);
    setGoalTitle(data.profile.goalTitle);
    setGoalDetails(data.profile.goalDetails);
    if (coachData.report?.errorClusters?.[0]) {
      setSelectedClusterId((prev) =>
        coachData.report.errorClusters.some((c) => c.id === prev)
          ? prev
          : coachData.report.errorClusters[0].id
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function flash(msg: string) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4500);
  }

  async function handleResearchTopics() {
    setResearching(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            currentLevel,
            targetLevel,
            goalTitle,
            goalDetails,
            onboardingComplete: true,
          },
        }),
      });
      const data = await res.json();
      if (data.state) {
        setState(data.state);
        setShowResearchDetails(true);
        flash(
          data.research?.sourceMode === "live_search"
            ? "Researched live exam topics & CEFR requirements via Google Search!"
            : "Updated exam topics & CEFR blueprint for your goal!"
        );
      }
    } finally {
      setResearching(false);
    }
  }

  async function handleGeneratePlan() {
    setGenerating(true);
    try {
      const res = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            currentLevel,
            targetLevel,
            goalTitle,
            goalDetails,
            onboardingComplete: true,
          },
          customNote,
        }),
      });
      const data = await res.json();
      if (data.state) {
        await loadAll();
        flash(
          "Updated your study plan & refreshed your AI diagnostic priority schedule!"
        );
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateFreshAiGrammarQuestions(
    cluster: ErrorClusterDiagnostic
  ) {
    setGeneratingAiClinic(true);
    try {
      const res = await fetch("/api/plan/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate_ai_clinic",
          clusterId: cluster.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.clinic) {
        setCustomClinics((prev) => ({ ...prev, [cluster.id]: data.clinic }));
        // Clear previous quiz selections for this cluster so user can solve the new set
        setClinicSubmitted((prev) => ({ ...prev, [cluster.id]: false }));
        setClinicAnswers((prev) => {
          const next = { ...prev };
          for (const q of data.clinic.practiceQuestions ?? []) {
            delete next[`${cluster.id}:${q.id}`];
          }
          return next;
        });
        flash(
          `Generated 4 fresh grammar exercises tailored to your "${cluster.title}" mistakes!`
        );
      }
    } finally {
      setGeneratingAiClinic(false);
    }
  }

  async function handleCheckGrammarClinicQuiz(
    cluster: ErrorClusterDiagnostic,
    clinic: GrammarClinicLesson
  ) {
    setClinicSubmitted((prev) => ({ ...prev, [cluster.id]: true }));
    const total = clinic.practiceQuestions.length;
    const correctCount = clinic.practiceQuestions.filter(
      (q) => clinicAnswers[`${cluster.id}:${q.id}`] === q.correctIndex
    ).length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 100;

    const res = await fetch("/api/plan/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "record_clinic_score",
        clusterId: cluster.id,
        score,
      }),
    });
    const data = await res.json();
    if (res.ok && data.report) {
      setReport(data.report);
      flash(
        `Grammar Clinic scored ${score}% (${correctCount}/${total}) — your B1 Grammar Mastery in Progress Monitor was boosted!`
      );
    }
  }

  async function handleLaunchTargetedSpeakingDrill(
    cluster: ErrorClusterDiagnostic,
    startImmediately: boolean
  ) {
    setLaunchingGrammarSpeaking(cluster.id);
    try {
      const modSpec = cluster.clinic.suggestedSpeakingModule;
      // Check if an identical bottleneck module already exists in plan
      let targetMod: StudyModule | undefined = state?.plan.modules.find(
        (m) => m.title === modSpec.title || m.titleDe === modSpec.titleDe
      );

      if (!targetMod) {
        const res = await fetch("/api/plan/modules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modSpec),
        });
        const data = await res.json();
        if (data.state) {
          setState(data.state);
          targetMod = data.state.plan.modules[0];
        }
      }

      if (!targetMod) return;

      if (!startImmediately) {
        flash(
          `Added "${targetMod.titleDe}" to your Exercises list! Go to Exercises anytime to practice it.`
        );
        return;
      }

      const startRes = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: targetMod.id }),
      });
      const startData = await startRes.json();
      if (startData?.session?.id) {
        router.push(`/session/${startData.session.id}`);
      }
    } finally {
      setLaunchingGrammarSpeaking(null);
    }
  }

  function handleSpeakSample(textDe: string) {
    speakGerman(textDe, {
      rate: state?.aiConfig.voiceRate || 0.95,
      ttsProvider: state?.aiConfig.ttsProvider || "edge_neural",
      edgeVoice:
        state?.aiConfig.edgeVoice || "de-DE-SeraphinaMultilingualNeural",
    });
  }

  if (loading || !state || !report) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 w-80 bg-zinc-200 rounded-xl" />
        <div className="h-64 bg-zinc-200 rounded-2xl" />
        <div className="h-72 bg-zinc-200 rounded-2xl" />
      </div>
    );
  }

  const research = state.latestResearch;
  const activeCluster =
    report.errorClusters.find((c) => c.id === selectedClusterId) ??
    report.errorClusters[0];
  const activeClinic =
    customClinics[activeCluster.id] ?? activeCluster.clinic;
  const isQuizSubmitted = Boolean(clinicSubmitted[activeCluster.id]);
  const allClinicQuestionsAnswered = activeClinic.practiceQuestions.every(
    (q) => typeof clinicAnswers[`${activeCluster.id}:${q.id}`] === "number"
  );

  const skillIcons: Record<ExamSkill, typeof Mic> = {
    sprechen: Mic,
    hoeren: Headphones,
    lesen: BookOpen,
    schreiben: PenTool,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            <span>Memory-Driven AI Study Planner & Weakness Coach</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-0.5">
            Your Personalized Study Plan & Grammar Clinic
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Built directly from your performance scores and the real mistakes
            captured in your Coach Memory — showing your exact study priorities,
            recommended timing, and interactive grammar exercises to fix your
            weak points.
          </p>
        </div>

        <Link
          href="/exercises"
          className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shrink-0"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Open Full Exercise List →</span>
        </Link>
      </div>

      {statusMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900 font-medium">
          {statusMessage}
        </div>
      )}

      {/* =====================================================================
          SECTION 1: DIAGNOSTIC STUDY PRIORITY & TIMING SCHEDULE (FROM MEMORY)
         ===================================================================== */}
      <section className="rounded-3xl bg-white border border-zinc-200/90 p-5 sm:p-6 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
              <Target className="w-3.5 h-3.5" />
              <span>
                1. AI Study Priority & Timing Plan (Based on Your Performance &
                Memory)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              {report.speakingDiagnosis.headlineVerdict}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {report.speakingDiagnosis.actionableTip}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-zinc-900 text-white px-4 py-3 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Recommended Schedule
              </div>
              <div className="text-sm font-bold text-amber-300">
                ~{report.dailyTargetMinutes} Min / Day ·{" "}
                {report.totalWeeklyMinutesRecommended} Min / Week
              </div>
            </div>
          </div>
        </div>

        {/* Speaking Sub-Skill Diagnosis Bars (Why Speaking is Priority #1: Grammar vs. Vocabulary!) */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Inside Your Speaking Performance (Sub-Skill Breakdown from{" "}
                  {report.speakingDiagnosis.completedSessionsCount} Sessions &{" "}
                  {report.speakingDiagnosis.totalCapturedGrammarErrors} Memory
                  Notes)
                </span>
              </h3>
            </div>
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              Main Bottleneck: Grammar & Sentence Structure (
              {
                report.speakingDiagnosis.subSkills.find(
                  (s) => s.key === "grammar"
                )?.score
              }
              %)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.speakingDiagnosis.subSkills.map((sub) => {
              const isWeak = sub.status === "weak";
              const isStrong = sub.status === "strong";
              return (
                <div
                  key={sub.key}
                  className={`rounded-xl border p-3.5 space-y-2 ${
                    isWeak
                      ? "bg-rose-50/60 border-rose-300 ring-1 ring-rose-200"
                      : "bg-white border-zinc-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-zinc-900">
                      {sub.label}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                        isWeak
                          ? "bg-rose-600 text-white"
                          : isStrong
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {sub.score}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isWeak
                          ? "bg-rose-500"
                          : isStrong
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, sub.score)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    {sub.diagnosis}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranked Priority Cards (#1 to #4) with Clear Timing & Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Your Ranked Study Priorities & Weekly Time Allocation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.priorities.map((p) => {
              const SkillIcon = skillIcons[p.skill];
              const isCritical = p.urgency === "critical";
              const isHigh = p.urgency === "high";
              const isMaint = p.urgency === "maintenance";

              return (
                <div
                  key={p.rank}
                  className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition ${
                    isCritical
                      ? "bg-amber-50/40 border-amber-400 ring-1 ring-amber-300"
                      : isHigh
                      ? "bg-white border-zinc-300"
                      : "bg-white border-zinc-200/80"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isCritical
                            ? "bg-zinc-900 text-amber-300"
                            : isHigh
                            ? "bg-rose-100 text-rose-900"
                            : isMaint
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-indigo-100 text-indigo-900"
                        }`}
                      >
                        <SkillIcon className="w-3.5 h-3.5" />
                        <span>{p.urgencyLabel}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                        <Clock className="w-3 h-3 text-teal-700" />
                        <span>{p.timingBadge}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-zinc-900 leading-snug">
                        {p.title}
                      </h4>
                      <p className="text-xs font-medium text-zinc-500 mt-0.5">
                        {p.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-zinc-700 leading-relaxed bg-white/80 rounded-xl p-3 border border-zinc-200/70">
                      <strong className="text-zinc-900">Why now:</strong>{" "}
                      {p.whyChosen}
                    </p>

                    <p className="text-xs text-teal-900 bg-teal-50/70 border border-teal-200/70 rounded-xl p-2.5">
                      <strong>Coach Study Strategy:</strong> {p.focusAdvice}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200/60">
                    {p.primaryActionHref.startsWith("#") ? (
                      <a
                        href={p.primaryActionHref}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3.5 py-2.5 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{p.primaryActionLabel}</span>
                      </a>
                    ) : (
                      <Link
                        href={p.primaryActionHref}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3.5 py-2.5 transition"
                      >
                        <span>{p.primaryActionLabel}</span>
                      </Link>
                    )}

                    {p.secondaryActionLabel && p.secondaryClusterId && (
                      <button
                        type="button"
                        onClick={() => {
                          const cluster =
                            report.errorClusters.find(
                              (c) => c.id === p.secondaryClusterId
                            ) ?? report.errorClusters[0];
                          handleLaunchTargetedSpeakingDrill(cluster, true);
                        }}
                        disabled={launchingGrammarSpeaking !== null}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold px-3.5 py-2.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{p.secondaryActionLabel}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: PERSONALIZED GRAMMAR & SENTENCE-STRUCTURE CLINIC
          (BUILT FROM CAPTURED SPEAKING MISTAKES + INTERACTIVE EXERCISES)
         ===================================================================== */}
      <section
        id="grammar-clinic"
        className="rounded-3xl bg-white border border-zinc-200/90 p-5 sm:p-6 space-y-5 shadow-xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>
                2. Personal Grammar & Sentence-Structure Clinic (From Your
                Speaking Errors)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              Understand the Grammar Behind Your Mistakes & Practice Custom
              Exercises
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Select any grammar weakness captured during your speaking sessions
              below to review your actual sentences, see the visual B1 word-order
              formula, solve custom repair exercises, or launch a targeted voice
              drill.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              handleGenerateFreshAiGrammarQuestions(activeCluster)
            }
            disabled={generatingAiClinic}
            className="inline-flex items-center gap-1.5 self-start lg:self-center rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold px-4 py-2.5 transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            {generatingAiClinic ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
            )}
            <span>
              {generatingAiClinic
                ? "Generating Custom Exercises..."
                : "AI: Generate 4 Fresh Exercises for This Grammar"}
            </span>
          </button>
        </div>

        {/* Error Cluster Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {report.errorClusters.map((cluster) => {
            const isSelected = cluster.id === activeCluster.id;
            return (
              <button
                key={cluster.id}
                type="button"
                onClick={() => setSelectedClusterId(cluster.id)}
                className={`text-left rounded-2xl border p-4 transition cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                    : "bg-zinc-50 hover:bg-zinc-100/80 border-zinc-200 text-zinc-900"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-amber-400 text-zinc-950"
                          : cluster.severityLabel === "High Priority"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {cluster.severityLabel}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        isSelected ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {cluster.capturedMistakes.length} captured examples
                    </span>
                  </div>
                  <div className="font-bold text-xs sm:text-sm leading-snug">
                    {cluster.title}
                  </div>
                </div>
                <div
                  className={`text-[11px] font-semibold flex items-center gap-1 pt-1 ${
                    isSelected ? "text-amber-300" : "text-teal-700"
                  }`}
                >
                  <span>Open Grammar Lesson & 4 Exercises</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Grammar Cluster Deep-Dive */}
        <div className="space-y-5 pt-2">
          {/* A. Visual B1 Grammar Rule & Why It Happened */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-2xl bg-zinc-900 text-white p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>{activeClinic.title}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white leading-snug">
                {activeClinic.ruleHeadlineDe}
              </div>
              <pre className="text-xs sm:text-sm font-mono bg-white/10 border border-white/15 rounded-xl p-3.5 text-amber-200 whitespace-pre-wrap leading-relaxed">
                {activeClinic.ruleFormula}
              </pre>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-1">
                  <div className="font-bold text-zinc-300">
                    Why this happened in your speaking:
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {activeClinic.whyItHappens}
                  </p>
                </div>
                <div className="rounded-xl bg-teal-500/15 border border-teal-400/30 p-3 space-y-1">
                  <div className="font-bold text-teal-300">
                    How to fix it while speaking live:
                  </div>
                  <p className="text-zinc-200 leading-relaxed">
                    {activeClinic.howToFixInSpeaking}
                  </p>
                </div>
              </div>
            </div>

            {/* B. Your Real Captured Mistakes From Memory + Plug & Play Templates */}
            <div className="lg:col-span-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Your Captured Speaking Sentences → Fixed</span>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {activeCluster.capturedMistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-white border border-zinc-200/90 p-3 text-xs space-y-1.5"
                  >
                    <div className="text-[10px] font-semibold text-zinc-400">
                      {m.sourceLabel}
                    </div>
                    <div className="text-rose-700 line-through">
                      „{m.original}“
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-emerald-800">
                        ✓ „{m.corrected}“
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSpeakSample(m.corrected)}
                        className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 shrink-0 cursor-pointer"
                        title="Listen to natural German correction"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-600">{m.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  3 Speaking Sentence Frames to Memorize:
                </div>
                {activeClinic.speakingTemplates.map((tpl, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-amber-50/70 border border-amber-200 px-3 py-2 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-zinc-900">
                        {tpl.patternDe}
                      </div>
                      <div className="text-[11px] text-zinc-600">
                        z. B. „{tpl.exampleDe}“
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSpeakSample(tpl.exampleDe)}
                      className="p-1.5 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* C. Interactive 4-Question Grammar Repair Exercises Built From Your Mistakes */}
          <div className="rounded-2xl bg-zinc-50 border border-zinc-200/90 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-zinc-900">
                  Interactive Grammar Practice ({activeClinic.practiceQuestions.length}{" "}
                  Exercises Based on Your Mistakes)
                </h3>
                <p className="text-xs text-zinc-600">
                  Test your understanding of this grammar structure right now.
                  Completing this drill updates your Grammar Mastery in the
                  Progress Monitor!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleLaunchTargetedSpeakingDrill(activeCluster, true)
                  }
                  disabled={launchingGrammarSpeaking !== null}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold px-3.5 py-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>
                    {launchingGrammarSpeaking === activeCluster.id
                      ? "Starting Voice Drill..."
                      : "Practice This Grammar Live in Speaking Now"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleLaunchTargetedSpeakingDrill(activeCluster, false)
                  }
                  disabled={launchingGrammarSpeaking !== null}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs font-semibold px-3 py-2 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Drill to My Exercises</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeClinic.practiceQuestions.map((q, qIdx) => {
                const answerKey = `${activeCluster.id}:${q.id}`;
                const picked = clinicAnswers[answerKey];

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl bg-white border border-zinc-200/90 p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {q.mistakeContext && (
                        <div className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200/70">
                          {q.mistakeContext}
                        </div>
                      )}
                      <div className="font-bold text-sm text-zinc-900">
                        {qIdx + 1}. {q.promptDe}
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isPicked = picked === oIdx;
                          const isRight =
                            isQuizSubmitted && oIdx === q.correctIndex;
                          const isWrongPicked =
                            isQuizSubmitted &&
                            isPicked &&
                            oIdx !== q.correctIndex;

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isQuizSubmitted}
                              onClick={() =>
                                setClinicAnswers((prev) => ({
                                  ...prev,
                                  [answerKey]: oIdx,
                                }))
                              }
                              className={`w-full text-left rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm transition flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${
                                isRight
                                  ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold"
                                  : isWrongPicked
                                  ? "bg-rose-50 border-rose-400 text-rose-950"
                                  : isPicked
                                  ? "bg-zinc-900 border-zinc-900 text-white font-medium"
                                  : "bg-zinc-50 border-zinc-200 hover:border-zinc-400 text-zinc-800"
                              }`}
                            >
                              <span>{opt}</span>
                              {isRight && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {isWrongPicked && (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isQuizSubmitted && (
                      <div
                        className={`rounded-xl px-3 py-2 text-xs flex items-start justify-between gap-2 ${
                          picked === q.correctIndex
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                            : "bg-amber-50 text-amber-950 border border-amber-200"
                        }`}
                      >
                        <div>
                          <span className="font-bold">
                            {picked === q.correctIndex
                              ? "Richtig! "
                              : "Erklärung: "}
                          </span>
                          <span>{q.explanation}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeakSample(q.options[q.correctIndex])
                          }
                          className="p-1 rounded bg-white/80 hover:bg-white text-zinc-800 shrink-0 cursor-pointer"
                          title="Listen to the correct sentence"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {!isQuizSubmitted ? (
                <button
                  type="button"
                  disabled={!allClinicQuestionsAnswered}
                  onClick={() =>
                    handleCheckGrammarClinicQuiz(activeCluster, activeClinic)
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 transition cursor-pointer disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Check Grammar Answers & Boost My Grammar Mastery
                  </span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900">
                    <Award className="w-4 h-4" />
                    <span>
                      Completed! Ready to try a fresh AI set or test it in live
                      Speaking?
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setClinicSubmitted((prev) => ({
                        ...prev,
                        [activeCluster.id]: false,
                      }));
                      setClinicAnswers((prev) => {
                        const copy = { ...prev };
                        for (const q of activeClinic.practiceQuestions) {
                          delete copy[`${activeCluster.id}:${q.id}`];
                        }
                        return copy;
                      });
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                  >
                    Retry These 4 Questions
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleGenerateFreshAiGrammarQuestions(activeCluster)
                    }
                    disabled={generatingAiClinic}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate 4 New AI Questions on This Grammar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: GOAL & LEVEL CONFIGURATION + OFFICIAL CEFR RESEARCH
         ===================================================================== */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-zinc-900">
            3. Configure Your Exam Goal & Level Target
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {GOAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setGoalTitle(preset.label);
                  setTargetLevel(preset.targetLevel);
                  setGoalDetails(preset.details);
                }}
                className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  goalTitle === preset.label
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Current Level
            </label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value as CefrLevel)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50 focus:bg-white"
            >
              {(["A1", "A2", "B1", "B2", "C1"] as CefrLevel[]).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Target Level
            </label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value as CefrLevel)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50 focus:bg-white"
            >
              {(["A1", "A2", "B1", "B2", "C1"] as CefrLevel[]).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Target Exam or Speaking Goal
            </label>
            <input
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Goethe-Zertifikat B1 Exam"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-12">
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Optional Extra Focus / Topics You Want Included
            </label>
            <input
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Focus more on sentence structure in Teil 2 presentations, job interviews, or medical visits..."
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm bg-zinc-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResearchTopics}
              disabled={researching}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-medium px-4 py-2.5 transition cursor-pointer disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              <span>
                {researching
                  ? "Researching Exam & Topics..."
                  : "Research Latest Topics & Level Requirements"}
              </span>
            </button>

            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium px-4 py-2.5 transition cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {generating
                  ? "Updating Study Plan..."
                  : "Recalculate Full Plan"}
              </span>
            </button>
          </div>

          <Link
            href="/exercises"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:underline"
          >
            <Play className="w-3.5 h-3.5" />
            <span>
              Manage & Practice All {state.plan.modules.length} Speaking,
              Listening, Reading & Writing Exercises in Exercises Hub →
            </span>
          </Link>
        </div>
      </section>

      {/* Optional Collapsible CEFR Blueprint */}
      {research && (
        <section className="rounded-2xl bg-white border border-zinc-200/80 overflow-hidden">
          <button
            onClick={() => setShowResearchDetails((v) => !v)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-50 transition cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <h2 className="font-bold text-zinc-900">
                  4. Official {research.targetLevel} ({research.goal}) CEFR
                  Requirements & Grammar Targets
                </h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {research.sourceMode === "live_search"
                    ? "Live Web Search"
                    : "CEFR Blueprint"}
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-1">{research.summary}</p>
            </div>
            <span className="text-xs font-medium text-zinc-500 ml-4 shrink-0">
              {showResearchDetails ? "Hide" : "Expand"}
            </span>
          </button>

          {showResearchDetails && (
            <div className="px-5 pb-5 border-t border-zinc-100 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-zinc-50 border border-zinc-200/70 p-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    CEFR Can-Do Capabilities ({research.targetLevel})
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-700">
                    {research.canDoCompetencies.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-zinc-50 border border-zinc-200/70 p-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Key Grammar Targets for {research.targetLevel}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-700">
                    {research.keyGrammarTargets.map((g, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {research.citations && research.citations.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 pt-1">
                  <span className="font-medium">Sources:</span>
                  {research.citations.slice(0, 4).map((c, i) => (
                    <a
                      key={i}
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-teal-700 hover:underline"
                    >
                      <span>{c.title}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
