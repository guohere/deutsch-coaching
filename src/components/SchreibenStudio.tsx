"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  GitCompare,
  HelpCircle,
  History,
  Lightbulb,
  ListChecks,
  Loader2,
  Pause,
  PenTool,
  Play,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Volume2,
  XCircle,
} from "lucide-react";
import { speakGerman, unlockMobileAudio } from "@/lib/speech";
import {
  getLeitpunktToolbox,
  isStructureAppliedInText,
  isVocabAppliedInText,
  LeitpunktToolboxData,
} from "@/lib/leitpunkt-toolbox";
import { ReadinessSummary } from "@/lib/standards";
import {
  DrillAttemptRecord,
  SkillDrillExercise,
  SkillDrillGrade,
  TtsProviderType,
  TurnCorrection,
  WritingDifficultyMode,
  WritingPrewriteOutline,
} from "@/lib/types";

type WritingStage = "briefing" | "prewrite" | "editor" | "evaluation";

interface VoiceConfigProps {
  ttsProvider: TtsProviderType;
  edgeVoice: string;
  geminiTtsVoice?: string;
  voiceRate: number;
  preferredVoiceName: string;
}

interface SchreibenStudioProps {
  exercise: SkillDrillExercise;
  voiceCfg: VoiceConfigProps;
  speed: number;
  writingText: string;
  setWritingText: React.Dispatch<React.SetStateAction<string>>;
  grade: SkillDrillGrade | null;
  grading: boolean;
  updatedReadiness: ReadinessSummary | null;
  attempts?: DrillAttemptRecord[];
  onSelectPastAttempt?: (attempt: DrillAttemptRecord) => void;
  onSubmitForGrading: () => Promise<void>;
  onResetExercise: () => void;
  onBackToLibrary: () => void;
}

function inferRegisterLabel(ex: SkillDrillExercise): string {
  const lbl = (ex.examPartLabel || "").toLowerCase();
  const prompt = (ex.writingPromptDe || "").toLowerCase();
  if (
    ex.examPartNumber === 3 ||
    lbl.includes("aufgabe 3") ||
    lbl.includes("formell") ||
    prompt.includes("sehr geehrte") ||
    prompt.includes("ihrer lehrerin") ||
    prompt.includes("ihrem chef") ||
    prompt.includes("hausverwaltung")
  ) {
    return "Formell (Sie-Form)";
  }
  if (
    ex.examPartNumber === 2 ||
    lbl.includes("aufgabe 2") ||
    lbl.includes("forum") ||
    lbl.includes("gästebuch") ||
    Boolean(ex.writingContextQuoteDe)
  ) {
    return "Meinungsäußerung im Forum";
  }
  return "Informell / Persönlich (du-Form)";
}

function inferTextFormatGuide(ex: SkillDrillExercise): {
  badge: string;
  shortRule: string;
  isEmail: boolean;
} {
  const reg = inferRegisterLabel(ex);
  if (reg.includes("Formell")) {
    return {
      badge: "Format: Formelle E-Mail (Anrede + Gruß)",
      shortRule:
        "E-Mail im „Sie“-Ton: Beginn mit „Sehr geehrte/r …,“ + höfliche Begründung/Bitte + Abschluss mit „Mit freundlichen Grüßen, [Name]“.",
      isEmail: true,
    };
  }
  if (reg.includes("Forum")) {
    return {
      badge: "Format: Forumsbeitrag / Absätze (KEINE E-Mail)",
      shortRule:
        "Kein Brief/keine E-Mail! Keine Anrede („Hallo…“) und keine Grußformel nötig — direkt mit Thema, eigener Meinung und Absätzen schreiben.",
      isEmail: false,
    };
  }
  return {
    badge: "Format: Informelle E-Mail (Anrede + Gruß)",
    shortRule:
      "Persönliche E-Mail im „du“-Ton: Beginn mit „Liebe/r …,“ oder „Hallo …,“ + alle Leitpunkte + Abschluss mit „Viele Grüße / Bis bald, [Name]“.",
    isEmail: true,
  };
}

export function SchreibenStudio({
  exercise,
  voiceCfg,
  speed,
  writingText,
  setWritingText,
  grade,
  grading,
  updatedReadiness,
  attempts = [],
  onSelectPastAttempt,
  onSubmitForGrading,
  onResetExercise,
  onBackToLibrary,
}: SchreibenStudioProps) {
  // Default to Guided so per-Leitpunkt sentence structures & vocabulary are always ready
  const [difficultyMode, setDifficultyMode] =
    useState<WritingDifficultyMode>("guided");
  const [stage, setStage] = useState<WritingStage>(
    grade ? "evaluation" : "briefing"
  );
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null
  );
  const [showCompareView, setShowCompareView] = useState(false);

  // Stage 2: Pre-Writing Brainstorming & Outline state
  const [rawBrainstormNotes, setRawBrainstormNotes] = useState("");
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [outline, setOutline] = useState<WritingPrewriteOutline | null>(null);

  // Stage 3: Split-Screen Editor state
  const [mobileEditorTab, setMobileEditorTab] = useState<"coach" | "editor">(
    "editor"
  );
  const [checkedBullets, setCheckedBullets] = useState<Record<number, boolean>>(
    {}
  );
  const [collapsedLeitpunkte, setCollapsedLeitpunkte] = useState<
    Record<number, boolean>
  >({});
  const [extraLeitpunktAi, setExtraLeitpunktAi] = useState<
    Record<number, LeitpunktToolboxData>
  >({});
  const [loadingLeitpunktIdx, setLoadingLeitpunktIdx] = useState<number | null>(
    null
  );
  const [savedVocabMap, setSavedVocabMap] = useState<Record<string, boolean>>(
    {}
  );
  const [stuckQuery, setStuckQuery] = useState("");
  const [loadingHint, setLoadingHint] = useState(false);
  const [sentenceHint, setSentenceHint] = useState<{
    hintTitle: string;
    startersDe: string[];
    grammarTip: string;
    vocabSuggestions: Array<{ german: string; meaning: string }>;
  } | null>(null);

  // Exam timer state (in seconds)
  const targetMinutes =
    exercise.recommendedMinutes ??
    (exercise.examPartNumber === 3 ? 15 : exercise.examPartNumber === 2 ? 25 : 20);
  const [timerSec, setTimerSec] = useState(targetMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Stage 4: Evaluation & Active Rewrite Loop state
  const [modelTab, setModelTab] = useState<"target" | "next_level">("target");
  const [pinnedMistakesForRewrite, setPinnedMistakesForRewrite] = useState<
    TurnCorrection[]
  >([]);

  // Sync stage when grade arrives or exercise resets
  useEffect(() => {
    if (grade) {
      setStage("evaluation");
      setTimerRunning(false);
    }
  }, [grade]);

  useEffect(() => {
    setDifficultyMode("guided");
    setStage(grade ? "evaluation" : "briefing");
    setRawBrainstormNotes("");
    setOutline(null);
    setCheckedBullets({});
    setCollapsedLeitpunkte({});
    setExtraLeitpunktAi({});
    setLoadingLeitpunktIdx(null);
    setSentenceHint(null);
    setStuckQuery("");
    setPinnedMistakesForRewrite([]);
    setTimerSec(targetMinutes * 60);
    setTimerRunning(false);
  }, [exercise.id, exercise.modelTestNumber, grade, targetMinutes]);

  // Countdown timer effect
  useEffect(() => {
    if (!timerRunning || stage !== "editor") return;
    const id = setInterval(() => {
      setTimerSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, stage]);

  const wordCount = writingText.trim()
    ? writingText.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const minWords = exercise.minWords ?? 80;
  const registerBadge = inferRegisterLabel(exercise);
  const formatGuide = inferTextFormatGuide(exercise);
  const bullets = exercise.writingBulletsDe ?? [];

  function formatTimer(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function handleGeneratePrewriteOutline() {
    setLoadingOutline(true);
    try {
      const res = await fetch("/api/drills/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "writing_prewrite",
          exercise,
          rawNotes: rawBrainstormNotes,
          difficultyMode,
        }),
      });
      const data = await res.json();
      if (data.outline) {
        setOutline(data.outline);
      }
    } finally {
      setLoadingOutline(false);
    }
  }

  async function handleRequestSentenceHint(customPrompt?: string) {
    if (difficultyMode !== "guided") return;
    setLoadingHint(true);
    try {
      const res = await fetch("/api/drills/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "writing_sentence_hint",
          exercise,
          currentDraft: writingText,
          stuckRequest:
            customPrompt ||
            stuckQuery.trim() ||
            "Gib mir Satzanfänge für den nächsten Leitpunkt",
        }),
      });
      const data = await res.json();
      if (data.hint) {
        setSentenceHint(data.hint);
        setStuckQuery("");
      }
    } finally {
      setLoadingHint(false);
    }
  }

  function handleEnterWritingPhase(fromMode?: WritingDifficultyMode) {
    const activeMode = fromMode ?? difficultyMode;
    setStage("editor");
    setMobileEditorTab("editor");
    if (activeMode === "exam_simulation") {
      setTimerRunning(true);
    }
  }

  function handleStartActiveRewriteLoop() {
    if (grade?.writingCorrections?.length) {
      setPinnedMistakesForRewrite(grade.writingCorrections);
    }
    setStage("editor");
    setMobileEditorTab("editor");
  }

  function insertTextChunk(chunk: string) {
    setWritingText((prev) => {
      if (!prev) return chunk;
      const needsSpace = !prev.endsWith(" ") && !prev.endsWith("\n");
      return `${prev}${needsSpace ? " " : ""}${chunk}`;
    });
  }

  async function handleFetchExtraLeitpunktCoach(
    bulletIndex: number,
    bulletDe: string
  ) {
    setLoadingLeitpunktIdx(bulletIndex);
    try {
      const res = await fetch("/api/drills/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "writing_leitpunkt_coach",
          exercise,
          bulletDe,
          bulletIndex,
        }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setExtraLeitpunktAi((prev) => {
          const existing = prev[bulletIndex] ?? { structures: [], vocab: [] };
          return {
            ...prev,
            [bulletIndex]: {
              structures: [
                ...existing.structures,
                ...(data.suggestions.structures ?? []),
              ],
              vocab: [...existing.vocab, ...(data.suggestions.vocab ?? [])],
            },
          };
        });
        setCollapsedLeitpunkte((prev) => ({ ...prev, [bulletIndex]: false }));
      }
    } finally {
      setLoadingLeitpunktIdx(null);
    }
  }

  async function handleSaveVocabToMemory(
    german: string,
    meaning: string,
    bulletDe: string
  ) {
    if (savedVocabMap[german]) return;
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vocabulary",
          german,
          meaning,
          exampleDe: `${german} (${bulletDe})`,
          topic: `${exercise.topicDe} · Schreiben`,
        }),
      });
      if (res.ok) {
        setSavedVocabMap((prev) => ({ ...prev, [german]: true }));
      }
    } catch {
      // ignore
    }
  }

  // Per-Leitpunkt Satzbau & Wortschatz toolboxes
  const leitpunktToolboxes = bullets.map((b, i) =>
    getLeitpunktToolbox(exercise, b, i, {
      structures: [
        ...(outline?.bulletCoverageCheck?.[i]?.structures ?? []),
        ...(extraLeitpunktAi[i]?.structures ?? []),
      ],
      vocab: [
        ...(outline?.bulletCoverageCheck?.[i]?.vocab ?? []),
        ...(extraLeitpunktAi[i]?.vocab ?? []),
      ],
    })
  );

  const totalToolboxVocabCount = leitpunktToolboxes.reduce(
    (sum, tb) => sum + tb.vocab.length,
    0
  );
  const appliedToolboxVocabCount = leitpunktToolboxes.reduce(
    (sum, tb) =>
      sum +
      tb.vocab.filter((v) => isVocabAppliedInText(v, writingText)).length,
    0
  );

  // Order saved attempts chronologically: oldest (#1) -> newest (#N)
  const chronologicalAttempts = [...attempts].reverse();
  const activeAttempt =
    chronologicalAttempts.find((a) => a.id === selectedAttemptId) ??
    (grade
      ? chronologicalAttempts.find(
          (a) =>
            a.grade.score === grade.score &&
            (a.writingText || "").trim() === writingText.trim()
        ) ?? chronologicalAttempts[chronologicalAttempts.length - 1]
      : undefined);

  const firstAttempt =
    chronologicalAttempts.length >= 2 ? chronologicalAttempts[0] : undefined;
  const compareTargetAttempt =
    activeAttempt && firstAttempt && activeAttempt.id !== firstAttempt.id
      ? activeAttempt
      : chronologicalAttempts.length >= 2
      ? chronologicalAttempts[chronologicalAttempts.length - 1]
      : undefined;

  const STAGES: Array<{
    key: WritingStage;
    num: number;
    label: string;
    disabled?: boolean;
  }> = [
    { key: "briefing", num: 1, label: "1. Aufgabe & Modus" },
    {
      key: "prewrite",
      num: 2,
      label:
        difficultyMode === "exam_simulation"
          ? "2. Gliederung (Übersprungen)"
          : "2. Brainstorming & Gliederung",
      disabled: difficultyMode === "exam_simulation",
    },
    { key: "editor", num: 3, label: `3. Schreib-Editor (${wordCount}w)` },
    {
      key: "evaluation",
      num: 4,
      label: "4. 4-Säulen-Bewertung",
      disabled: !grade,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top 4-Stage Writing State Machine Bar + Training Wheels Slider */}
      <section className="rounded-2xl bg-white border border-zinc-200/90 p-3.5 sm:p-4 space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Difficulty Mode ("Training Wheels" Slider) */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Schreib-Modus („Training Wheels“ Stufe wählen):
            </div>
            <div className="inline-flex flex-wrap items-center rounded-xl bg-zinc-100 p-1 text-xs font-bold gap-1">
              {(
                [
                  {
                    id: "guided" as const,
                    label: "1. Geführt (Outline + Redemittel)",
                    desc: "Brainstorming → Absatz-Gliederung, Redemittel & Satzanfänge",
                  },
                  {
                    id: "outline_only" as const,
                    label: "2. Nur Gliederung",
                    desc: "KI prüft nur deinen Stichpunkt-Plan vor dem Schreiben",
                  },
                  {
                    id: "exam_simulation" as const,
                    label: "3. Prüfungssimulation",
                    desc: "Strikter Timer, keine Tipps, Bewertung erst am Ende",
                  },
                ] as const
              ).map((m) => {
                const active = difficultyMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setDifficultyMode(m.id);
                      if (m.id === "exam_simulation" && stage === "prewrite") {
                        setStage("editor");
                        setTimerRunning(true);
                      }
                    }}
                    title={m.desc}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      active
                        ? m.id === "exam_simulation"
                          ? "bg-zinc-900 text-amber-300 shadow-xs"
                          : "bg-zinc-900 text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format + Register + Word Target Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                formatGuide.isEmail
                  ? "bg-teal-50 border-teal-200 text-teal-900"
                  : "bg-indigo-50 border-indigo-200 text-indigo-900"
              }`}
              title={formatGuide.shortRule}
            >
              {formatGuide.badge}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-950">
              Register: {registerBadge}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700">
              Ziel: ~{minWords} Wörter ({targetMinutes} Min.)
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            <strong className="text-zinc-800">Textformat-Hinweis:</strong>{" "}
            {formatGuide.shortRule}
          </p>
        </div>

        {/* 4-Stage Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-zinc-100">
          {STAGES.map((st) => {
            const active = stage === st.key;
            return (
              <button
                key={st.key}
                type="button"
                disabled={st.disabled}
                onClick={() => !st.disabled && setStage(st.key)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold text-left truncate transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  active
                    ? "bg-zinc-900 text-amber-300 shadow-xs"
                    : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200/70"
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SAVED WRITING ATTEMPTS TIMELINE & IMPROVEMENT HISTORY BAR
         ===================================================================== */}
      {chronologicalAttempts.length > 0 && (
        <section className="rounded-2xl bg-white border border-zinc-200/90 p-3.5 sm:p-4 space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Dein Schreib-Verlauf ({chronologicalAttempts.length}{" "}
                {chronologicalAttempts.length === 1
                  ? "gespeicherter Versuch"
                  : "gespeicherte Versuche"}
                )
              </span>
              <span className="hidden sm:inline text-[11px] text-emerald-700 font-medium">
                · Alle bisherigen Entwürfe &amp; Bewertungen bleiben dauerhaft gespeichert!
              </span>
            </div>

            <div className="flex items-center gap-2">
              {chronologicalAttempts.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setShowCompareView((v) => !v)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    showCompareView
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-200"
                  }`}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>
                    {showCompareView
                      ? "Fortschritts-Vergleich schließen"
                      : "Vorher / Nachher vergleichen"}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedAttemptId(null);
                  onResetExercise();
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 transition cursor-pointer"
                title="Startet einen neuen Versuch — deine bisherigen Versuche bleiben oben gespeichert!"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neuer Versuch</span>
              </button>
            </div>
          </div>

          {/* Chronological Attempt Pills (Versuch #1 -> Versuch #2 -> ...) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {chronologicalAttempts.map((att, idx) => {
              const prevAtt = idx > 0 ? chronologicalAttempts[idx - 1] : null;
              const delta = prevAtt
                ? att.grade.score - prevAtt.grade.score
                : null;
              const isSelected =
                stage === "evaluation" &&
                (selectedAttemptId
                  ? att.id === selectedAttemptId
                  : activeAttempt?.id === att.id);
              const attWords = (att.writingText || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean).length;
              const dateStr = new Date(att.completedAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => {
                    setSelectedAttemptId(att.id);
                    onSelectPastAttempt?.(att);
                    setStage("evaluation");
                  }}
                  className={`shrink-0 text-left rounded-xl border px-3 py-2 transition cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-amber-300" : "text-zinc-900"
                      }`}
                    >
                      Versuch #{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                        att.grade.passed
                          ? isSelected
                            ? "bg-emerald-500/25 text-emerald-300"
                            : "bg-emerald-100 text-emerald-900"
                          : isSelected
                          ? "bg-amber-500/25 text-amber-200"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {att.grade.score}/100
                    </span>
                    {delta !== null && delta !== 0 && (
                      <span
                        className={`text-[11px] font-bold ${
                          delta > 0
                            ? isSelected
                              ? "text-emerald-300"
                              : "text-emerald-700"
                            : isSelected
                            ? "text-rose-300"
                            : "text-rose-700"
                        }`}
                      >
                        {delta > 0 ? `+${delta} ↑` : `${delta} ↓`}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {attWords} Wörter · {dateStr}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Before vs. After Improvement Diff Panel (when 2+ attempts exist) */}
          {showCompareView && firstAttempt && compareTargetAttempt && (
            <div className="rounded-2xl bg-teal-50/70 border border-teal-200 p-4 space-y-3.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-sm text-teal-950 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-700" />
                  <span>
                    Deine Entwicklung: Versuch #1 ({firstAttempt.grade.score}/100) →{" "}
                    Versuch #
                    {chronologicalAttempts.findIndex(
                      (a) => a.id === compareTargetAttempt.id
                    ) + 1}{" "}
                    ({compareTargetAttempt.grade.score}/100)
                  </span>
                </div>
                <span
                  className={`font-extrabold px-2.5 py-1 rounded-full ${
                    compareTargetAttempt.grade.score - firstAttempt.grade.score >=
                    0
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {compareTargetAttempt.grade.score - firstAttempt.grade.score >=
                  0
                    ? `+${
                        compareTargetAttempt.grade.score -
                        firstAttempt.grade.score
                      } Punkte Verbesserung!`
                    : `${
                        compareTargetAttempt.grade.score -
                        firstAttempt.grade.score
                      } Punkte`}
                </span>
              </div>

              {/* 4-Pillar Delta Badges */}
              {firstAttempt.grade.pillarScores &&
                compareTargetAttempt.grade.pillarScores && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        [
                          "1. Inhalt",
                          firstAttempt.grade.pillarScores.inhalt.score,
                          compareTargetAttempt.grade.pillarScores.inhalt.score,
                        ],
                        [
                          "2. Gestaltung",
                          firstAttempt.grade.pillarScores
                            .kommunikativeGestaltung.score,
                          compareTargetAttempt.grade.pillarScores
                            .kommunikativeGestaltung.score,
                        ],
                        [
                          "3. Korrektheit",
                          firstAttempt.grade.pillarScores.korrektheit.score,
                          compareTargetAttempt.grade.pillarScores.korrektheit
                            .score,
                        ],
                        [
                          "4. Wortschatz",
                          firstAttempt.grade.pillarScores.wortschatz.score,
                          compareTargetAttempt.grade.pillarScores.wortschatz
                            .score,
                        ],
                      ] as const
                    ).map(([label, s1, s2]) => {
                      const diff = s2 - s1;
                      return (
                        <div
                          key={label}
                          className="rounded-xl bg-white border border-teal-200/80 p-2.5"
                        >
                          <div className="text-[11px] font-semibold text-zinc-500">
                            {label}
                          </div>
                          <div className="font-bold text-zinc-900 mt-0.5 flex items-center gap-1.5">
                            <span>
                              {s1} → {s2}/25
                            </span>
                            {diff !== 0 && (
                              <span
                                className={`text-[11px] ${
                                  diff > 0 ? "text-emerald-700" : "text-rose-700"
                                }`}
                              >
                                ({diff > 0 ? `+${diff}` : diff})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Side-by-Side Draft Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-white border border-zinc-200 p-3 space-y-1.5">
                  <div className="font-bold text-zinc-700 flex items-center justify-between">
                    <span>Erster Entwurf (Versuch #1)</span>
                    <span className="text-zinc-500">
                      {firstAttempt.grade.score}/100 Pkt.
                    </span>
                  </div>
                  <p className="text-zinc-700 whitespace-pre-line leading-relaxed">
                    {firstAttempt.writingText || "(Kein Text gespeichert)"}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-emerald-300 p-3 space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center justify-between">
                    <span>
                      Aktueller Entwurf (Versuch #
                      {chronologicalAttempts.findIndex(
                        (a) => a.id === compareTargetAttempt.id
                      ) + 1}
                      )
                    </span>
                    <span className="text-emerald-700">
                      {compareTargetAttempt.grade.score}/100 Pkt.
                    </span>
                  </div>
                  <p className="text-zinc-900 whitespace-pre-line leading-relaxed">
                    {compareTargetAttempt.writingText ||
                      "(Kein Text gespeichert)"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          STAGE 1: PROMPT BRIEFING & MANDATORY LEITPUNKTE
         ===================================================================== */}
      {stage === "briefing" && (
        <section className="rounded-2xl bg-white border border-zinc-200/90 p-5 sm:p-6 space-y-5 shadow-xs">
          {exercise.writingContextQuoteDe && (
            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Diskussionsbeitrag im Online-Gästebuch (Stimulus)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    unlockMobileAudio();
                    speakGerman(exercise.writingContextQuoteDe!, {
                      rate: speed,
                      ttsProvider: voiceCfg.ttsProvider,
                      edgeVoice: voiceCfg.edgeVoice,
                      geminiTtsVoice: voiceCfg.geminiTtsVoice,
                    });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 text-zinc-700 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Anhören</span>
                </button>
              </div>
              <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line font-medium">
                {exercise.writingContextQuoteDe}
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-amber-50/75 border border-amber-200 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                1. Offizielle Schreibaufgabe ({exercise.examPartLabel})
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 text-amber-300">
                {registerBadge}
              </span>
            </div>
            <p className="text-sm sm:text-base text-zinc-900 leading-relaxed font-medium">
              {exercise.writingPromptDe}
            </p>

            {bullets.length > 0 && (
              <div className="pt-2 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Pflichtpunkte (Leitpunkte — alle {bullets.length} müssen im Text vorkommen!):
                </div>
                <ul className="space-y-2.5 text-sm text-zinc-900">
                  {bullets.map((b, i) => {
                    const tb = leitpunktToolboxes[i];
                    return (
                      <li
                        key={i}
                        className="rounded-xl bg-white/95 border border-amber-200/90 p-3.5 space-y-2.5"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-bold text-amber-700">
                            {i + 1}.
                          </span>
                          <span className="font-semibold text-zinc-900">
                            {b}
                          </span>
                        </div>

                        {difficultyMode === "guided" && tb && (
                          <div className="pl-5 space-y-2 text-xs border-t border-amber-100 pt-2">
                            {/* Sentence Structures Preview (All 3+ Options — Clickable to Construct Draft!) */}
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                                  Satz-Optionen zu Punkt {i + 1} ({tb.structures.length} Auswahlmöglichkeiten — Klicken fügt direkt in Schritt 3 ein):
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleFetchExtraLeitpunktCoach(i, b)
                                  }
                                  disabled={loadingLeitpunktIdx === i}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 cursor-pointer disabled:opacity-50"
                                >
                                  {loadingLeitpunktIdx === i ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <Plus className="w-2.5 h-2.5" />
                                  )}
                                  <span>Mehr KI-Optionen</span>
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {tb.structures.slice(0, 5).map((st, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="rounded-lg bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 px-2.5 py-2 flex items-start justify-between gap-2 transition"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        insertTextChunk(st.insertDe);
                                        setStage("editor");
                                      }}
                                      className="text-left flex-1 cursor-pointer"
                                      title="Klicken, um diese Option in deinen Schreib-Editor einzufügen"
                                    >
                                      <div className="font-semibold text-amber-950 leading-snug">
                                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950 mr-1.5">
                                          Option {sIdx + 1}
                                        </span>
                                        {st.patternDe}
                                      </div>
                                      <div className="text-[11px] text-zinc-600 mt-0.5">
                                        {st.meaning} ·{" "}
                                        <span className="text-teal-800 font-medium">
                                          {st.grammarHint}
                                        </span>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        unlockMobileAudio();
                                        speakGerman(st.patternDe, {
                                          rate: speed,
                                          ttsProvider: voiceCfg.ttsProvider,
                                          edgeVoice: voiceCfg.edgeVoice,
                                          geminiTtsVoice:
                                            voiceCfg.geminiTtsVoice,
                                        });
                                      }}
                                      className="p-1 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 shrink-0 cursor-pointer"
                                      title="Satz anhören"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Key Vocabulary Preview */}
                            <div className="space-y-1">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                                Schlüsselwörter &amp; Wortschatz zum Anwenden:
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {tb.vocab.map((v, vIdx) => {
                                  const saved = Boolean(savedVocabMap[v.german]);
                                  return (
                                    <div
                                      key={vIdx}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50/70 border border-teal-200 px-2.5 py-1 text-xs"
                                    >
                                      <div>
                                        <span className="font-bold text-zinc-900">
                                          {v.german}
                                        </span>
                                        <span className="text-zinc-600 ml-1">
                                          ({v.meaning})
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          unlockMobileAudio();
                                          speakGerman(v.german, {
                                            rate: speed,
                                            ttsProvider: voiceCfg.ttsProvider,
                                            edgeVoice: voiceCfg.edgeVoice,
                                            geminiTtsVoice: voiceCfg.geminiTtsVoice,
                                          });
                                        }}
                                        className="p-0.5 rounded hover:bg-teal-100 text-teal-800 cursor-pointer"
                                        title="Aussprache anhören"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSaveVocabToMemory(
                                            v.german,
                                            v.meaning,
                                            b
                                          )
                                        }
                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                                          saved
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-white border border-teal-300 text-teal-900 hover:bg-teal-100"
                                        }`}
                                        title="In meinem Wortschatz-Gedächtnis speichern"
                                      >
                                        {saved ? "✓ Vocab" : "+ Vocab"}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-zinc-600">
              {difficultyMode === "guided" &&
                "Modus 1 (Geführt): Im nächsten Schritt sammelst du kurz Ideen und bekommst eine Absatz-Gliederung + Redemittel (ohne Ghostwriting!)."}
              {difficultyMode === "outline_only" &&
                "Modus 2 (Nur Gliederung): Im nächsten Schritt prüft die KI deinen Stichpunkt-Plan, ohne dir fertige Redemittel vorzugeben."}
              {difficultyMode === "exam_simulation" &&
                `Modus 3 (Prüfungssimulation): Du startest direkt im Editor mit ${targetMinutes}-Minuten-Timer ohne KI-Hilfe.`}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {difficultyMode !== "exam_simulation" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setStage("prewrite")}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-5 py-3 text-sm transition cursor-pointer shadow-xs"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Weiter zu Schritt 2: Brainstorming &amp; Gliederung</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnterWritingPhase()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold px-4 py-3 text-xs transition cursor-pointer"
                  >
                    <span>Direkt zum Schreib-Editor →</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleEnterWritingPhase("exam_simulation")}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 font-bold px-6 py-3 text-sm transition cursor-pointer shadow-xs"
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    Prüfungssimulation starten ({targetMinutes}:00 Timer) →
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          STAGE 2: PRE-WRITING BRAINSTORMING & OUTLINE ASSISTANT (NO GHOSTWRITING)
         ===================================================================== */}
      {stage === "prewrite" && (
        <section className="rounded-2xl bg-white border border-zinc-200/90 p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>
                  Schritt 2: Pre-Writing Brainstorming &amp; Gliederungs-Coach
                </span>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 mt-0.5">
                Sammle deine Ideen — die KI fasst deine Punkte zusammen &amp; baut komplette Sätze und Absätze
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                Schreibe Stichpunkte oder ganze Rohentwürfe (auf Deutsch, Englisch oder gemischt) zu den{" "}
                {bullets.length} Leitpunkten. Die KI erkennt deine Hauptideen und formuliert daraus{" "}
                <strong>komplette, natürliche deutsche Sätze und fertige Beispiel-Absätze</strong>, die du direkt übernehmen und anpassen kannst.
              </p>
            </div>
          </div>

          {/* Compact Reminder of the 3-4 Mandatory Bullets */}
          <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 space-y-1.5 text-xs">
            <div className="font-bold text-amber-950">
              Aufgabe: {exercise.writingPromptDe}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {bullets.map((b, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-zinc-800 font-medium"
                >
                  <strong>Punkt {i + 1}:</strong> {b}
                </span>
              ))}
            </div>
          </div>

          {/* Brainstorm Scratchpad Input */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-zinc-700">
              Deine rohen Ideen, Stichpunkte oder Entwurfs-Absätze (auf Deutsch, Englisch oder gemischt):
            </label>
            <textarea
              rows={5}
              value={rawBrainstormNotes}
              onChange={(e) => setRawBrainstormNotes(e.target.value)}
              placeholder="Schreib einfach frei drauf los — z.B. deine Gedanken oder rohe Sätze zu jedem Leitpunkt. Die KI erkennt deine Hauptpunkte und macht daraus klares, natürliches Deutsch (komplette Sätze + Beispiel-Absätze)..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleGeneratePrewriteOutline}
                disabled={loadingOutline}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 transition cursor-pointer disabled:opacity-50"
              >
                {loadingOutline ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  {outline
                    ? "Ideen neu auswerten & Beispiel-Absätze aktualisieren"
                    : "Ideen verstehen & komplette Sätze + Absätze erstellen"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleEnterWritingPhase()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-bold px-4 py-2.5 transition cursor-pointer"
              >
                <span>Weiter zu Schritt 3: Im Split-Screen schreiben</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Generated Pre-Writing Ideas Summary, Complete Sentences & Example Paragraphs */}
          {outline && (
            <div className="space-y-4 pt-3 border-t border-zinc-200">
              {outline.memoryReminder && (
                <div className="rounded-xl bg-rose-50/80 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-950 flex items-start gap-2">
                  <Brain className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{outline.memoryReminder}</span>
                </div>
              )}

              {/* Learner's Understood Main Ideas Summary */}
              {outline.mainIdeasSummary && outline.mainIdeasSummary.length > 0 && (
                <div className="rounded-xl bg-teal-50/80 border border-teal-200 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-teal-700" />
                      <span>Deine erkannten Hauptideen (so hat die KI deinen Entwurf verstanden)</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-teal-950">
                    {outline.mainIdeasSummary.map((idea, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="font-bold text-teal-700 shrink-0">•</span>
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bullet Coverage Check */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {outline.bulletCoverageCheck.map((bc, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 text-xs space-y-1 ${
                      bc.coveredInNotes
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                        : "bg-amber-50/70 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {bc.coveredInNotes ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span>Leitpunkt {idx + 1}: {bc.bulletDe}</span>
                    </div>
                    <p className="text-zinc-700 leading-relaxed">{bc.tip}</p>
                  </div>
                ))}
              </div>

              {/* Paragraph-by-Paragraph Complete Sentences & Example Paragraphs */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Komplette Beispielsätze &amp; fertige Beispiel-Absätze aus deinen Ideen:
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const fullDraft = outline.skeleton
                        .map(
                          (s) =>
                            s.exampleParagraphDe?.trim() ||
                            (s.completeSentencesDe?.length
                              ? s.completeSentencesDe.join(" ")
                              : s.starterPhrasesDe.join(" "))
                        )
                        .filter(Boolean)
                        .join("\n\n");
                      if (fullDraft) {
                        setWritingText(fullDraft);
                      }
                      handleEnterWritingPhase();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 transition cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Alle Beispiel-Absätze als Entwurf in Schritt 3 übernehmen</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {outline.skeleton.map((sec, i) => {
                    const sentences =
                      sec.completeSentencesDe && sec.completeSentencesDe.length > 0
                        ? sec.completeSentencesDe
                        : sec.starterPhrasesDe;
                    return (
                      <div
                        key={i}
                        className="rounded-2xl bg-zinc-50 border border-zinc-200/90 p-4 space-y-3 text-xs"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="text-sm font-bold text-zinc-900">
                              {sec.sectionLabel}
                            </div>
                            <div className="text-teal-800 font-medium">
                              Ziel: {sec.goalDe}
                            </div>
                          </div>
                          {sec.exampleParagraphDe && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  unlockMobileAudio();
                                  speakGerman(sec.exampleParagraphDe!, {
                                    rate: speed,
                                    ttsProvider: voiceCfg.ttsProvider,
                                    edgeVoice: voiceCfg.edgeVoice,
                                    geminiTtsVoice: voiceCfg.geminiTtsVoice,
                                  });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 text-zinc-800 font-semibold cursor-pointer"
                                title="Beispiel-Absatz anhören"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Anhören</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  insertTextChunk(sec.exampleParagraphDe!);
                                  handleEnterWritingPhase();
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold cursor-pointer"
                                title="Diesen kompletten Absatz in den Editor einfügen"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-300" />
                                <span>Absatz in Editor übernehmen</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {sec.userIdeaNote && (
                          <div className="rounded-xl bg-white border border-zinc-200/80 px-3 py-2 text-zinc-700 leading-relaxed">
                            <span className="font-bold text-zinc-900">Deine verstandene Idee: </span>
                            {sec.userIdeaNote}
                          </div>
                        )}

                        {sec.exampleParagraphDe && (
                          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 space-y-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                              Kompletter Beispiel-Absatz (aus deinen Ideen formuliert — zum Übernehmen &amp; Anpassen):
                            </div>
                            <p className="text-sm text-zinc-900 leading-relaxed font-medium">
                              {sec.exampleParagraphDe}
                            </p>
                          </div>
                        )}

                        {sentences.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                              Einzelne komplette Beispielsätze (Klicken fügt den Satz in Schritt 3 ein):
                            </div>
                            <div className="space-y-1.5">
                              {sentences.map((st, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-start justify-between gap-2 rounded-xl bg-white border border-amber-200/90 px-3 py-2 hover:bg-amber-50/60 transition"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      insertTextChunk(st);
                                      handleEnterWritingPhase();
                                    }}
                                    className="text-left flex-1 text-amber-950 font-medium leading-relaxed cursor-pointer"
                                    title="Klicken zum Übernehmen in den Schreib-Editor"
                                  >
                                    + {st}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      unlockMobileAudio();
                                      speakGerman(st, {
                                        rate: speed,
                                        ttsProvider: voiceCfg.ttsProvider,
                                        edgeVoice: voiceCfg.edgeVoice,
                                        geminiTtsVoice: voiceCfg.geminiTtsVoice,
                                      });
                                    }}
                                    className="p-1 rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-amber-100 text-zinc-700 shrink-0 cursor-pointer"
                                    title="Satz anhören"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          STAGE 3: SPLIT-SCREEN WRITING WORKSPACE (LEFT: COACH, RIGHT: EDITOR)
         ===================================================================== */}
      {stage === "editor" && (
        <section className="space-y-3">
          {/* Mobile 2-Tab Switcher (Eliminates vertical scrolling on iPhone!) */}
          <div className="lg:hidden grid grid-cols-2 gap-1.5 rounded-xl bg-zinc-200/80 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMobileEditorTab("coach")}
              className={`py-2 px-3 rounded-lg transition cursor-pointer ${
                mobileEditorTab === "coach"
                  ? "bg-zinc-900 text-amber-300 shadow-xs"
                  : "text-zinc-700"
              }`}
            >
              1. Aufgabe &amp; Coach ({Object.values(checkedBullets).filter(Boolean).length}/{bullets.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileEditorTab("editor")}
              className={`py-2 px-3 rounded-lg transition cursor-pointer ${
                mobileEditorTab === "editor"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-700"
              }`}
            >
              2. Schreib-Editor ({wordCount}/{minWords}w)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT PANEL (5 cols on Desktop): Prompt + Checkable Leitpunkte + Outline + Hint Scratchpad */}
            <div
              className={`lg:col-span-5 space-y-3 ${
                mobileEditorTab === "editor" ? "hidden lg:block" : "block"
              }`}
            >
              {/* Prompt + Interactive Leitpunkte Checklist */}
              <div className="rounded-2xl bg-white border border-zinc-200/90 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Aufgabe &amp; Pflichtpunkte
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950">
                    {registerBadge}
                  </span>
                </div>

                {exercise.writingContextQuoteDe && (
                  <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-700 leading-relaxed">
                    <div className="font-bold text-rose-700 mb-1">
                      Forumsbeitrag:
                    </div>
                    {exercise.writingContextQuoteDe}
                  </div>
                )}

                <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed">
                  {exercise.writingPromptDe}
                </p>

                {bullets.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                        <ListChecks className="w-3.5 h-3.5 text-teal-600" />
                        <span>
                          Hake jeden Leitpunkt ab, sobald du ihn geschrieben hast:
                        </span>
                      </div>
                      {difficultyMode === "guided" && totalToolboxVocabCount > 0 && (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            appliedToolboxVocabCount > 0
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-teal-50 border-teal-200 text-teal-800"
                          }`}
                        >
                          Wortschatz im Text: {appliedToolboxVocabCount}/
                          {totalToolboxVocabCount} genutzt
                        </span>
                      )}
                    </div>

                    {bullets.map((b, i) => {
                      const checked = Boolean(checkedBullets[i]);
                      const tb = leitpunktToolboxes[i];
                      const isCollapsed = Boolean(collapsedLeitpunkte[i]);
                      const appliedInThisBullet = tb
                        ? tb.vocab.filter((v) =>
                            isVocabAppliedInText(v, writingText)
                          ).length
                        : 0;

                      return (
                        <div
                          key={i}
                          className={`rounded-2xl border text-xs transition overflow-hidden ${
                            checked
                              ? "bg-emerald-50/50 border-emerald-300 text-emerald-950"
                              : "bg-zinc-50/90 border-zinc-200/90 text-zinc-800"
                          }`}
                        >
                          {/* Leitpunkt Header Row */}
                          <div className="p-3 flex items-start justify-between gap-2">
                            <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setCheckedBullets((prev) => ({
                                    ...prev,
                                    [i]: !prev[i],
                                  }))
                                }
                                className="mt-0.5 rounded accent-emerald-600"
                              />
                              <span
                                className={
                                  checked
                                    ? "line-through opacity-80 font-medium"
                                    : "font-bold text-zinc-900 leading-snug"
                                }
                              >
                                <span className="text-amber-700 mr-1">
                                  {i + 1}.
                                </span>
                                {b}
                              </span>
                            </label>

                            {difficultyMode === "guided" && tb && (
                              <div className="flex items-center gap-1 shrink-0">
                                {appliedInThisBullet > 0 && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    ✓ {appliedInThisBullet} Wort
                                    {appliedInThisBullet > 1 ? "e" : ""}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCollapsedLeitpunkte((prev) => ({
                                      ...prev,
                                      [i]: !prev[i],
                                    }))
                                  }
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 text-zinc-700 cursor-pointer"
                                >
                                  {isCollapsed
                                    ? "Satzbau & Vokabeln ▾"
                                    : "Ausblenden ▴"}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Embedded Per-Leitpunkt Satzbau & Wortschatz Toolbox (Mode 1 Guided) */}
                          {difficultyMode === "guided" && tb && !isCollapsed && (
                            <div className="bg-white border-t border-zinc-200/80 p-3 space-y-3">
                              {/* 1. COMPLETE CUSTOMIZABLE SENTENCES FOR THIS LEITPUNKT */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-600" />
                                    <span>
                                      Komplette Beispielsätze zu Punkt {i + 1}{" "}
                                      (Einfügen &amp; Wörter nach Wunsch ersetzen):
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleFetchExtraLeitpunktCoach(i, b)
                                    }
                                    disabled={loadingLeitpunktIdx === i}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 cursor-pointer disabled:opacity-50"
                                    title="Weitere komplette Beispielsätze & Schlüsselwörter mit KI generieren"
                                  >
                                    {loadingLeitpunktIdx === i ? (
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    ) : (
                                      <Plus className="w-2.5 h-2.5" />
                                    )}
                                    <span>Mehr Sätze</span>
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  {tb.structures.map((st, sIdx) => {
                                    const used = isStructureAppliedInText(
                                      st,
                                      writingText
                                    );
                                    return (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => {
                                          insertTextChunk(st.insertDe);
                                          setMobileEditorTab("editor");
                                        }}
                                        className={`w-full text-left rounded-xl border p-2 transition cursor-pointer ${
                                          used
                                            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                                            : "bg-amber-50/60 hover:bg-amber-100/80 border-amber-200/90 text-zinc-900"
                                        }`}
                                        title="Klicken, um diesen kompletten Satz einzufügen — danach kannst du einzelne Wörter nach Wunsch ersetzen"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="font-bold text-amber-950 leading-snug">
                                            + {st.patternDe}
                                          </span>
                                          {used && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-950 shrink-0">
                                              ✓ Im Text
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-zinc-600 mt-0.5">
                                          {st.meaning}
                                        </div>
                                        <div className="text-[10px] font-semibold text-teal-800 mt-0.5">
                                          💡 Satzbau: {st.grammarHint}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 2. WORTSCHATZ & SCHLÜSSELWÖRTER ZUM ANWENDEN FOR THIS LEITPUNKT */}
                              <div className="space-y-1.5 pt-1 border-t border-zinc-100">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                                  <BookOpen className="w-3 h-3 text-teal-600" />
                                  <span>
                                    Schlüsselwörter &amp; Wortschatz zum Anwenden
                                    (Punkt {i + 1}):
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 gap-1.5">
                                  {tb.vocab.map((v, vIdx) => {
                                    const used = isVocabAppliedInText(
                                      v,
                                      writingText
                                    );
                                    const saved = Boolean(
                                      savedVocabMap[v.german]
                                    );
                                    return (
                                      <div
                                        key={vIdx}
                                        className={`flex items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5 transition ${
                                          used
                                            ? "bg-emerald-50/90 border-emerald-300"
                                            : "bg-zinc-50/90 border-zinc-200 hover:border-teal-300"
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            insertTextChunk(v.german);
                                            setMobileEditorTab("editor");
                                          }}
                                          className="text-left flex-1 cursor-pointer"
                                          title="Klicken, um dieses Schlüsselwort in deinen Text einzufügen"
                                        >
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="font-bold text-zinc-900">
                                              + {v.german}
                                            </span>
                                            {used && (
                                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-950">
                                                ✓ Verwendet
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[11px] text-zinc-500">
                                            {v.meaning}
                                          </div>
                                        </button>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              unlockMobileAudio();
                                              speakGerman(v.german, {
                                                rate: speed,
                                                ttsProvider:
                                                  voiceCfg.ttsProvider,
                                                edgeVoice: voiceCfg.edgeVoice,
                                                geminiTtsVoice:
                                                  voiceCfg.geminiTtsVoice,
                                              });
                                            }}
                                            className="p-1 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 text-zinc-700 cursor-pointer"
                                            title="Aussprache anhören"
                                          >
                                            <Volume2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleSaveVocabToMemory(
                                                v.german,
                                                v.meaning,
                                                b
                                              )
                                            }
                                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer transition ${
                                              saved
                                                ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                                                : "bg-white border-zinc-200 hover:bg-teal-50 text-teal-900"
                                            }`}
                                            title="In meinem Wortschatz-Gedächtnis speichern"
                                          >
                                            {saved ? "✓ Vocab" : "+ Vocab"}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Approved Paragraph Skeleton (if generated in Stage 2) */}
              {outline && difficultyMode !== "exam_simulation" && (
                <div className="rounded-2xl bg-white border border-zinc-200/90 p-4 space-y-2.5 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Deine Absatz-Gliederung &amp; Beispiel-Absätze
                  </div>
                  <div className="space-y-2.5">
                    {outline.skeleton.map((sec, idx) => {
                      const sentences =
                        sec.completeSentencesDe && sec.completeSentencesDe.length > 0
                          ? sec.completeSentencesDe
                          : sec.starterPhrasesDe;
                      return (
                        <div
                          key={idx}
                          className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-3 text-xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-zinc-900">
                                {sec.sectionLabel}
                              </div>
                              <div className="text-zinc-600">{sec.goalDe}</div>
                            </div>
                            {sec.exampleParagraphDe && (
                              <button
                                type="button"
                                onClick={() => {
                                  insertTextChunk(sec.exampleParagraphDe!);
                                  setMobileEditorTab("editor");
                                }}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white shrink-0 cursor-pointer"
                                title="Kompletten Beispiel-Absatz einfügen"
                              >
                                + Absatz
                              </button>
                            )}
                          </div>
                          {sec.exampleParagraphDe && (
                            <p className="rounded-lg bg-emerald-50/70 border border-emerald-200 px-2.5 py-1.5 text-[11px] text-zinc-800 leading-relaxed">
                              {sec.exampleParagraphDe}
                            </p>
                          )}
                          {sentences.length > 0 && (
                            <div className="space-y-1 pt-0.5">
                              {sentences.map((st, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => {
                                    insertTextChunk(st);
                                    setMobileEditorTab("editor");
                                  }}
                                  className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-medium cursor-pointer leading-snug"
                                  title="Klicken zum Einfügen in den Editor"
                                >
                                  + {st}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clickable Complete Sentence & Vocabulary Coach (Mode 1 Guided Only) */}
              {difficultyMode === "guided" && (
                <div className="rounded-2xl bg-white border border-zinc-200/90 p-4 space-y-3 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Beispielsätze &amp; Satz-Coach (Einfügen &amp; Anpassen)</span>
                  </div>

                  {/* Clickable Redemittel Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {(outline?.redemittel?.length
                      ? outline.redemittel
                      : exercise.keyVocab.map((v) => ({
                          german: v.german,
                          meaning: v.meaning,
                          purpose: "Wortschatz",
                        }))
                    ).map((rm, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          insertTextChunk(rm.german.replace(/\s*\[.*?\]/g, ""));
                          setMobileEditorTab("editor");
                        }}
                        title={`${rm.meaning} (${rm.purpose}) — Klicken zum Einfügen`}
                        className="text-left text-xs px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 transition cursor-pointer"
                      >
                        <span className="font-semibold">+ {rm.german}</span>
                        <span className="block text-[10px] text-zinc-500">
                          {rm.meaning}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Interactive "Stuck? Ask for Complete Example Sentences" Scratchpad */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRequestSentenceHint();
                    }}
                    className="space-y-2 pt-2 border-t border-zinc-100"
                  >
                    <label className="block text-[11px] font-semibold text-zinc-600">
                      Nicht sicher, wie du den nächsten Satz formulieren sollst? Frag nach kompletten Beispielsätzen:
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        value={stuckQuery}
                        onChange={(e) => setStuckQuery(e.target.value)}
                        placeholder="z.B. Wie beschreibe ich ein Risiko für die Pflege? / Punkt 3..."
                        className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        type="submit"
                        disabled={loadingHint}
                        className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-2 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {loadingHint ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Tipp</span>
                      </button>
                    </div>
                  </form>

                  {sentenceHint && (
                    <div className="rounded-xl bg-teal-50/80 border border-teal-200 p-3 space-y-2 text-xs">
                      <div className="font-bold text-teal-950">
                        {sentenceHint.hintTitle}
                      </div>
                      <div className="space-y-1">
                        {sentenceHint.startersDe.map((st, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              insertTextChunk(st.trim());
                              setMobileEditorTab("editor");
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-teal-200 text-zinc-900 font-medium cursor-pointer"
                          >
                            + „{st}“
                          </button>
                        ))}
                      </div>
                      <p className="text-teal-900">{sentenceHint.grammarTip}</p>
                    </div>
                  )}
                </div>
              )}

              {difficultyMode === "exam_simulation" && (
                <div className="rounded-2xl bg-zinc-900 text-white p-4 space-y-1.5 text-xs">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Prüfungssimulation aktiv</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    In der echten Goethe-Prüfung sind keine Hilfsmittel oder Redemittel-Listen erlaubt. Achte auf alle {bullets.length} Leitpunkte, die richtige Anrede ({registerBadge}) und die Wortanzahl (~{minWords} Wörter).
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT PANEL (7 cols on Desktop): DISTRACTION-FREE GERMAN EDITOR */}
            <div
              className={`lg:col-span-7 space-y-3 ${
                mobileEditorTab === "coach" ? "hidden lg:block" : "block"
              }`}
            >
              {/* Active Rewrite Loop Banner (When fixing top 3 flagged mistakes!) */}
              {pinnedMistakesForRewrite.length > 0 && (
                <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>
                        Überarbeitungs-Modus: Korrigiere diese{" "}
                        {pinnedMistakesForRewrite.length} markierten Stellen in deinem Text!
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPinnedMistakesForRewrite([])}
                      className="text-xs text-amber-800 hover:underline cursor-pointer"
                    >
                      Ausblenden
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {pinnedMistakesForRewrite.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-white border border-amber-200 p-3 text-xs space-y-1.5"
                      >
                        <div className="font-bold text-amber-900">
                          Satz #{idx + 1} · {m.bottleneckTag || "Satzbau & Rechtschreibung"}
                        </div>
                        <div className="text-rose-700 font-medium">
                          ✗ Dein Satz: „{m.original}“
                        </div>
                        <div className="text-emerald-800 font-semibold">
                          ✓ Ziel-Struktur ({exercise.level}): „{m.corrected}“
                        </div>
                        {m.issues && m.issues.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {m.issues.map((iss, iIdx) => (
                              <span
                                key={iIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-zinc-800"
                              >
                                <span className="line-through text-rose-700">
                                  {iss.wrong}
                                </span>
                                <span>→</span>
                                <strong className="text-emerald-800">
                                  {iss.right}
                                </strong>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-zinc-600">{m.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-white border border-zinc-200/90 p-4 sm:p-5 space-y-3.5 shadow-xs">
                {/* Editor Top Toolbar: Word Counter + Timer + Quick Umlauts */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-zinc-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span>Dein deutscher Text</span>
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        wordCount >= minWords
                          ? "bg-emerald-100 text-emerald-900"
                          : wordCount >= Math.round(minWords * 0.6)
                          ? "bg-amber-100 text-amber-900"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {wordCount} / ~{minWords} Wörter
                    </span>
                  </div>

                  {/* Countdown Timer Control */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border tabular-nums ${
                        timerSec < 120
                          ? "bg-rose-50 border-rose-300 text-rose-800"
                          : timerRunning
                          ? "bg-zinc-900 border-zinc-900 text-amber-300"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimer(timerSec)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTimerRunning((r) => !r)}
                      className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                      title={timerRunning ? "Timer pausieren" : "Timer starten"}
                    >
                      {timerRunning ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick German Umlaut & Punctuation Bar */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-zinc-400 mr-1">
                    Sonderzeichen:
                  </span>
                  {(["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü", "„", "“"] as const).map(
                    (ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() =>
                          setWritingText((prev) => `${prev}${ch}`)
                        }
                        className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-800 font-semibold text-xs flex items-center justify-center cursor-pointer"
                      >
                        {ch}
                      </button>
                    )
                  )}
                </div>

                {/* Main Distraction-Free German Textarea */}
                <textarea
                  rows={12}
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  placeholder={
                    registerBadge.includes("Formell")
                      ? "Sehr geehrte Damen und Herren,\n\nich schreibe Ihnen, weil..."
                      : registerBadge.includes("Forum")
                      ? "Ich habe den Beitrag zum Thema ... gelesen und möchte meine Meinung dazu schreiben.\nMeiner Meinung nach..."
                      : "Liebe/r ...,\n\nwie geht es dir? Ich schreibe dir heute, weil..."
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 focus:bg-white p-4 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400 font-normal"
                />

                {/* Bottom Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-zinc-500">
                    Pflichtpunkte abgehakt:{" "}
                    <strong>
                      {Object.values(checkedBullets).filter(Boolean).length} /{" "}
                      {bullets.length}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={onSubmitForGrading}
                    disabled={grading || wordCount < 6}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-6 py-3 text-sm transition cursor-pointer disabled:opacity-40 shadow-xs"
                  >
                    {grading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Send className="w-4 h-4 text-amber-400" />
                    )}
                    <span>
                      {grading
                        ? "Prüfer bewertet nach 4-Säulen-Rubrik..."
                        : pinnedMistakesForRewrite.length > 0
                        ? "Überarbeiteten Text neu bewerten →"
                        : "Abgeben & nach Goethe 4-Säulen-Rubrik bewerten →"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          STAGE 4: 4-PILLAR GOETHE RUBRIC SCORECARD & ACTIVE REWRITE LOOP
         ===================================================================== */}
      {stage === "evaluation" && grade && (
        <section className="space-y-4">
          {/* Overall Score Header Card */}
          <div className="rounded-3xl bg-zinc-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Award className="w-4 h-4" />
                <span>
                  {grade.passed
                    ? "Bestanden (≥ 60/100 Punkte · Offizielle Goethe-Rubrik)"
                    : "Noch unter 60% — Nutze die Überarbeitungs-Schleife unten!"}
                </span>
              </div>
              <h2 className="text-xl font-bold">{grade.praise}</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {grade.summary}
              </p>
              {updatedReadiness && (
                <div className="inline-flex items-center gap-2 text-xs bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-emerald-300 font-semibold mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Readiness aktualisiert: {updatedReadiness.overallReadiness}%
                    Ready · {updatedReadiness.passProbabilityPct}% Pass Chance
                  </span>
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <div className="w-24 h-24 rounded-full border-4 border-amber-400 flex flex-col items-center justify-center bg-white/5">
                <span className="text-2xl font-bold text-amber-300">
                  {grade.score}
                </span>
                <span className="text-[10px] uppercase text-zinc-400">
                  / 100 Pkt.
                </span>
              </div>
            </div>
          </div>

          {/* Learner's Own Submitted Draft Card (So you always see what you wrote for this attempt!) */}
          {writingText.trim() && (
            <div className="rounded-2xl bg-white border border-zinc-200/90 p-4 sm:p-5 space-y-2.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-zinc-900">
                    Dein eingereichter Text
                    {activeAttempt
                      ? ` (Versuch #${
                          chronologicalAttempts.findIndex(
                            (a) => a.id === activeAttempt.id
                          ) + 1
                        } · ${wordCount} Wörter)`
                      : ` (${wordCount} Wörter)`}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      unlockMobileAudio();
                      speakGerman(writingText, {
                        rate: speed,
                        ttsProvider: voiceCfg.ttsProvider,
                        edgeVoice: voiceCfg.edgeVoice,
                        geminiTtsVoice: voiceCfg.geminiTtsVoice,
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Meinen Text anhören</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartActiveRewriteLoop}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Diesen Entwurf verbessern</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line bg-zinc-50 rounded-xl p-3.5 border border-zinc-200/80">
                {writingText}
              </p>
            </div>
          )}

          {/* 4 Official German Exam Pillars Breakdown (25 pts each) */}
          {grade.pillarScores && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(
                [
                  {
                    key: "inhalt",
                    title: "1. Inhalt & Aufgabenerfüllung",
                    data: grade.pillarScores.inhalt,
                    badge: "Leitpunkte & Umfang",
                  },
                  {
                    key: "kommunikativeGestaltung",
                    title: "2. Kommunikative Gestaltung",
                    data: grade.pillarScores.kommunikativeGestaltung,
                    badge: grade.pillarScores.kommunikativeGestaltung.registerExpected,
                  },
                  {
                    key: "korrektheit",
                    title: "3. Korrektheit (Grammatik & Satzbau)",
                    data: grade.pillarScores.korrektheit,
                    badge: "Verbstellung, Kasus, Artikel",
                  },
                  {
                    key: "wortschatz",
                    title: `4. Wortschatz & Ausdruck (${exercise.level})`,
                    data: grade.pillarScores.wortschatz,
                    badge: "Konnektoren & Varianz",
                  },
                ] as const
              ).map((pillar) => {
                const pct = Math.round(
                  (pillar.data.score / pillar.data.maxScore) * 100
                );
                return (
                  <div
                    key={pillar.key}
                    className="rounded-2xl bg-white border border-zinc-200/90 p-4 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-zinc-900">
                          {pillar.title}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {pillar.badge}
                        </div>
                      </div>
                      <span
                        className={`text-sm font-extrabold px-2.5 py-1 rounded-xl ${
                          pct >= 75
                            ? "bg-emerald-100 text-emerald-900"
                            : pct >= 60
                            ? "bg-amber-100 text-amber-950"
                            : "bg-rose-100 text-rose-900"
                        }`}
                      >
                        {pillar.data.score} / {pillar.data.maxScore}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 75
                            ? "bg-emerald-500"
                            : pct >= 60
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <p className="text-xs text-zinc-700 leading-relaxed">
                      {pillar.data.feedback}
                    </p>

                    {pillar.key === "inhalt" &&
                      grade.pillarScores?.inhalt.bulletChecks &&
                      grade.pillarScores.inhalt.bulletChecks.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-zinc-100">
                          {grade.pillarScores.inhalt.bulletChecks.map(
                            (bc, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-1.5 text-[11px]"
                              >
                                {bc.covered ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                )}
                                <span className="text-zinc-700">
                                  <strong>{bc.bulletDe}:</strong> {bc.note}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Exhaustive Sentence-by-Sentence + Spelling, Capitalization & Structure Analysis */}
          {grade.writingCorrections && grade.writingCorrections.length > 0 && (
            <div className="rounded-2xl bg-white border border-zinc-200/90 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-zinc-900">
                    Vollständige Satz- &amp; Wort-Analyse (Rechtschreibung, Groß-/Kleinschreibung, Satzbau &amp; Kasus)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Jeder Satz mit Fehlern wurde im Detail geprüft — inklusive Rechtschreibung, Nomen-Großschreibung und Verbposition für {exercise.level}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartActiveRewriteLoop}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold px-4 py-2.5 transition cursor-pointer shrink-0 shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    Alle {grade.writingCorrections.length} Sätze im Editor überarbeiten
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                {grade.writingCorrections.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-zinc-50 border border-zinc-200/90 p-4 text-xs space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-extrabold text-zinc-900 px-2 py-0.5 rounded bg-zinc-200/80 text-[11px]">
                        Satz #{i + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {c.bottleneckTag && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900">
                            {c.bottleneckTag}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            unlockMobileAudio();
                            speakGerman(c.corrected, {
                              rate: speed,
                              ttsProvider: voiceCfg.ttsProvider,
                              edgeVoice: voiceCfg.edgeVoice,
                              geminiTtsVoice: voiceCfg.geminiTtsVoice,
                            });
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-amber-50 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Korrektur hören</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-rose-700 line-through font-medium leading-relaxed">
                        ✗ Dein Satz: {c.original}
                      </div>
                      <div className="font-bold text-emerald-900 text-xs sm:text-sm leading-relaxed">
                        ✓ {exercise.level}-Korrektur: {c.corrected}
                      </div>
                    </div>

                    {/* Word-level Spelling, Capitalization, Word-Order & Case Breakdown */}
                    {c.issues && c.issues.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-zinc-200/70">
                        <div className="text-[11px] font-bold text-zinc-700">
                          Gefundene Wort-, Rechtschreib- &amp; Satzbau-Fehler in diesem Satz:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {c.issues.map((iss, idx) => {
                            const badgeStyle =
                              iss.type === "spelling"
                                ? {
                                    label: "Rechtschreibung",
                                    cls: "bg-rose-100 text-rose-900",
                                  }
                                : iss.type === "capitalization"
                                ? {
                                    label: "Groß-/Kleinschreibung",
                                    cls: "bg-amber-100 text-amber-950",
                                  }
                                : iss.type === "word_order"
                                ? {
                                    label: "Satzbau & Verbposition",
                                    cls: "bg-indigo-100 text-indigo-900",
                                  }
                                : iss.type === "case_gender"
                                ? {
                                    label: "Kasus & Artikel",
                                    cls: "bg-purple-100 text-purple-900",
                                  }
                                : {
                                    label: "Wortwahl & Ausdruck",
                                    cls: "bg-teal-100 text-teal-900",
                                  };

                            return (
                              <div
                                key={idx}
                                className="rounded-xl bg-white border border-zinc-200/90 p-2.5 space-y-1"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeStyle.cls}`}
                                  >
                                    {badgeStyle.label}
                                  </span>
                                </div>
                                <div className="font-semibold text-xs">
                                  <span className="line-through text-rose-700">
                                    „{iss.wrong}“
                                  </span>{" "}
                                  <span className="text-zinc-400">→</span>{" "}
                                  <span className="text-emerald-800 font-bold">
                                    „{iss.right}“
                                  </span>
                                </div>
                                <div className="text-[11px] text-zinc-600 leading-snug">
                                  {iss.rule}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <p className="text-zinc-600 leading-relaxed pt-0.5">
                      <strong className="text-zinc-800">Erklärung:</strong>{" "}
                      {c.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concrete B1 Action Checklist: "What You Could Have Done Better for B1" */}
          {grade.b1ImprovementTips && grade.b1ImprovementTips.length > 0 && (
            <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-5 space-y-2.5">
              <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>
                  Was du für ein starkes {exercise.level}-Ergebnis konkret besser machen kannst:
                </span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-800">
                {grade.b1ImprovementTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-700">
                      {idx + 1}.
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Two-Tier Model Version Comparison: Target Level Fix vs. +1 CEFR Level Upgrade */}
          {(grade.improvedVersionDe || grade.nextLevelVersionDe) && (
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center rounded-xl bg-white border border-emerald-200 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setModelTab("target")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      modelTab === "target"
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:text-zinc-900"
                    }`}
                  >
                    1. Dein Text korrigiert ({exercise.level})
                  </button>
                  {grade.nextLevelVersionDe && (
                    <button
                      type="button"
                      onClick={() => setModelTab("next_level")}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        modelTab === "next_level"
                          ? "bg-zinc-900 text-amber-300"
                          : "text-zinc-700 hover:text-zinc-900"
                      }`}
                    >
                      2. +1 Level Upgrade (B2/C1 Vorbild)
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    unlockMobileAudio();
                    const textToSpeak =
                      modelTab === "next_level" && grade.nextLevelVersionDe
                        ? grade.nextLevelVersionDe
                        : grade.improvedVersionDe || "";
                    speakGerman(textToSpeak, {
                      rate: speed,
                      ttsProvider: voiceCfg.ttsProvider,
                      edgeVoice: voiceCfg.edgeVoice,
                      geminiTtsVoice: voiceCfg.geminiTtsVoice,
                    });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Vorlesen</span>
                </button>
              </div>

              <p className="text-sm text-emerald-950 leading-relaxed whitespace-pre-line bg-white/90 rounded-xl p-4 border border-emerald-200/80">
                {modelTab === "next_level" && grade.nextLevelVersionDe
                  ? grade.nextLevelVersionDe
                  : grade.improvedVersionDe}
              </p>
            </div>
          )}

          {/* Bottom Navigation Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackToLibrary}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-3 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Zurück zur Übungsliste</span>
            </button>
            <button
              type="button"
              onClick={handleStartActiveRewriteLoop}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-bold px-4 py-3 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Text überarbeiten &amp; neu prüfen</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedAttemptId(null);
                onResetExercise();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-900 text-sm font-semibold px-4 py-3 cursor-pointer"
              title="Deine bisherigen Versuche bleiben oben in deinem Schreib-Verlauf gespeichert!"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Neuer Versuch (Verlauf bleibt gespeichert)</span>
            </button>
            <Link
              href="/progress"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-900 text-sm font-semibold px-4 py-3"
            >
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Progress Monitor</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
