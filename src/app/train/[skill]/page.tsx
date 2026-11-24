"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookmarkPlus,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  FileJson,
  Globe,
  Headphones,
  HelpCircle,
  History,
  Languages,
  Lightbulb,
  Loader2,
  MessageCircleQuestion,
  Pause,
  PenTool,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Square,
  Trash2,
  Upload,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import {
  InteractiveGermanText,
  InteractiveSelectionPayload,
} from "@/components/InteractiveGermanText";
import { SchreibenStudio } from "@/components/SchreibenStudio";
import { VoiceSpeedControl } from "@/components/VoiceSpeedControl";
import {
  GOETHE_B1_BLUEPRINT,
  getExerciseTargetSeconds,
  inferExercisePartNumber,
} from "@/lib/goethe-exam-specs";
import {
  AudioTrackProgress,
  estimateGermanTrackTimeline,
  pauseSpeaking,
  resumeSpeaking,
  seekSpeaking,
  speakGerman,
  speakGermanSegments,
  stopSpeaking,
  unlockMobileAudio,
} from "@/lib/speech";
import { ReadinessSummary } from "@/lib/standards";
import {
  CefrLevel,
  DrillAttemptRecord,
  ExamPassageSection,
  SkillDrillExercise,
  SkillDrillGrade,
  TtsProviderType,
} from "@/lib/types";

interface VoiceSettings {
  ttsProvider: TtsProviderType;
  edgeVoice: string;
  geminiTtsVoice?: string;
  voiceRate: number;
  preferredVoiceName: string;
}

interface EnrichedExercise {
  exercise: SkillDrillExercise;
  attemptCount: number;
  bestScore: number | null;
  latestAttempt: DrillAttemptRecord | null;
  attempts?: DrillAttemptRecord[];
}

interface AssistOutput {
  title: string;
  body: string;
  germanExample?: string;
  germanExampleTranslation?: string;
  sentenceBreakdowns?: Array<{
    german: string;
    translation: string;
  }>;
  difficultWords?: Array<{
    german: string;
    translation: string;
    note?: string;
  }>;
  grammarNotes?: Array<{
    pattern: string;
    explanation: string;
  }>;
  bulletHighlights?: string[];
}

interface LibraryResponse {
  exercises: EnrichedExercise[];
  recentAiAttempts: DrillAttemptRecord[];
  vocabCategories: Array<{ id: string; titleDe: string; titleEn: string }>;
  aiConfig: VoiceSettings;
}

const SAMPLE_JSON_TEMPLATE = JSON.stringify(
  [
    {
      id: "my-custom-lesen-b1-1",
      skill: "lesen",
      level: "B1",
      topicDe: "Alltag & Arbeit",
      topicEn: "Work & Daily Life",
      vocabCategoryId: "voc-work",
      title: "Flexible Arbeitszeiten im Mittelstand",
      examPartLabel: "Lesen · Teil 2 (B1)",
      instructions: "Read the German text and choose the right answer.",
      passageDe:
        "Immer mehr kleine Betriebe bieten ihren Mitarbeitern flexible Arbeitszeiten an. Wer zwischen sieben und zehn Uhr beginnt, kann nachmittags früher nach Hause gehen. Besonders Eltern schätzen diese Regelung, weil sie ihre Kinder leichter von der Schule abholen können.",
      questions: [
        {
          id: "q1",
          questionDe: "Warum schätzen besonders Eltern flexible Arbeitszeiten?",
          options: [
            "Weil sie dadurch mehr Urlaubstage bekommen.",
            "Weil sie ihre Kinder leichter von der Schule abholen können.",
            "Weil sie abends länger im Büro bleiben dürfen.",
          ],
          correctIndex: 1,
          explanation:
            "Im Text steht: „weil sie ihre Kinder leichter von der Schule abholen können.“",
        },
      ],
      keyVocab: [
        { german: "die Regelung", meaning: "rule / arrangement" },
        { german: "abholen", meaning: "to pick up" },
      ],
    },
  ],
  null,
  2
);

function SkillTrainerInner() {
  const params = useParams<{ skill: string }>();
  const searchParams = useSearchParams();
  const rawSkill = params.skill;
  const skill = (
    ["hoeren", "lesen", "schreiben"].includes(rawSkill) ? rawSkill : "hoeren"
  ) as "hoeren" | "lesen" | "schreiben";

  const initialVocab = searchParams.get("vocab") || "all";
  const grammarStandardId = searchParams.get("grammar") || undefined;
  const queryExerciseId = searchParams.get("exerciseId") || undefined;
  const queryReviewAttemptId = searchParams.get("reviewAttemptId") || undefined;

  // Library state
  const [library, setLibrary] = useState<LibraryResponse | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [practiceMode, setPracticeMode] = useState<
    "all" | "exam" | "exercise"
  >("all");
  const [modelTestFilter, setModelTestFilter] = useState<
    "all" | 1 | 2 | 3
  >("all");
  const [partFilter, setPartFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5>(
    "all"
  );
  const [levelFilter, setLevelFilter] = useState<"all" | CefrLevel>("all");
  const [vocabFilter, setVocabFilter] = useState<string>(initialVocab);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "new" | "in_progress" | "done"
  >("all");

  // Import JSON Pack Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importCredit, setImportCredit] = useState("Open-Source / Local Pack");
  const [importing, setImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Active Practice / Review state
  const [activeExercise, setActiveExercise] =
    useState<SkillDrillExercise | null>(null);
  const [isReviewingPast, setIsReviewingPast] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [savingToBank, setSavingToBank] = useState(false);
  const [savedToBankNotice, setSavedToBankNotice] = useState<string | null>(
    null
  );

  const [voiceCfg, setVoiceCfg] = useState<VoiceSettings>({
    ttsProvider: "edge_neural",
    edgeVoice: "de-DE-SeraphinaMultilingualNeural",
    voiceRate: 1.1,
    preferredVoiceName: "",
  });
  const [grading, setGrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hören audio & official Goethe Pre-Listening Reading Timer ("Lesezeit") state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [audioCurrentSec, setAudioCurrentSec] = useState(0);
  const [audioTotalSec, setAudioTotalSec] = useState(0);
  const [audioDraggingSec, setAudioDraggingSec] = useState<number | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [sectionPlayCounts, setSectionPlayCounts] = useState<
    Record<string, number>
  >({});
  const [activeSegmentId, setActiveSegmentId] = useState<string | undefined>(
    undefined
  );
  // For multi-text exercises (e.g. Hören Teil 1's 5 texts, Lesen Teil 2's 2 articles),
  // focus on one text at a time so only its questions are shown without scrolling!
  const [focusedSectionId, setFocusedSectionId] = useState<string | "all">(
    "all"
  );
  const [listeningFlowPhase, setListeningFlowPhase] = useState<
    "idle" | "reading_prep" | "between_plays"
  >("idle");
  const [readingCountdownSec, setReadingCountdownSec] = useState(0);
  const [readingTotalSec, setReadingTotalSec] = useState(15);
  const [readingPaused, setReadingPaused] = useState(false);
  const [strictExamReplay, setStrictExamReplay] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speed, setSpeed] = useState(1.1);

  const triggerScheduledPlayRef = useRef<() => void>(() => {});

  // Task countdown & finish-time tracking (starts automatically on task entry)
  const [taskTargetSec, setTaskTargetSec] = useState(600);
  const [taskElapsedSec, setTaskElapsedSec] = useState(0);
  const [taskTimerPaused, setTaskTimerPaused] = useState(false);

  // Answers state
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [writingText, setWritingText] = useState("");
  const [grade, setGrade] = useState<SkillDrillGrade | null>(null);
  const [updatedReadiness, setUpdatedReadiness] =
    useState<ReadinessSummary | null>(null);

  // Interactive Tutor Help, Answer Analysis & Model Answers
  const [assistLoadingKey, setAssistLoadingKey] = useState<string | null>(null);
  const [questionAssists, setQuestionAssists] = useState<
    Record<string, AssistOutput>
  >({});
  const [globalAssist, setGlobalAssist] = useState<AssistOutput | null>(null);
  const [showAskTutor, setShowAskTutor] = useState(false);
  const [tutorQuestionInput, setTutorQuestionInput] = useState("");

  // Interactive Lesen Reader (Click word / Click sentence / Highlight phrase)
  const [readerClickMode, setReaderClickMode] = useState<"word" | "sentence">(
    "word"
  );
  const [pendingPhraseSelection, setPendingPhraseSelection] =
    useState<InteractiveSelectionPayload | null>(null);
  const [activeSelection, setActiveSelection] =
    useState<InteractiveSelectionPayload | null>(null);
  const [selectionAssist, setSelectionAssist] = useState<AssistOutput | null>(
    null
  );
  const [selectionAssistLoading, setSelectionAssistLoading] = useState(false);
  const [selectionAssistCache, setSelectionAssistCache] = useState<
    Record<string, AssistOutput>
  >({});
  const [savedReaderVocab, setSavedReaderVocab] = useState<
    Record<string, boolean>
  >({});
  const [precomputedTranslation, setPrecomputedTranslation] =
    useState<AssistOutput | null>(null);
  const [precomputedModelAnswer, setPrecomputedModelAnswer] =
    useState<AssistOutput | null>(null);
  const [precomputedQuestionAnalyses, setPrecomputedQuestionAnalyses] =
    useState<Record<string, AssistOutput>>({});
  const [precomputedQuestionExplains, setPrecomputedQuestionExplains] =
    useState<Record<string, AssistOutput>>({});
  const [readerCacheStatus, setReaderCacheStatus] = useState<
    "idle" | "checking" | "building" | "ready"
  >("idle");
  const [cachedLesenIds, setCachedLesenIds] = useState<string[]>([]);
  const [bulkPrecomputing, setBulkPrecomputing] = useState<{
    current: number;
    total: number;
    title: string;
  } | null>(null);

  const loadLibrary = useCallback(async () => {
    setLoadingLibrary(true);
    try {
      const res = await fetch(`/api/exercises?skill=${skill}`);
      const data = (await res.json()) as LibraryResponse;
      setLibrary(data);
      if (data.aiConfig) {
        setVoiceCfg(data.aiConfig);
        setSpeed(data.aiConfig.voiceRate || 1.1);
      }
      return data;
    } catch {
      setErrorMsg("Could not load local exercise library.");
      return null;
    } finally {
      setLoadingLibrary(false);
    }
  }, [skill]);

  useEffect(() => {
    stopSpeaking();
    setActiveExercise(null);
    setGrade(null);
    setIsReviewingPast(false);
    setVocabFilter(initialVocab);
    loadLibrary().then((data) => {
      if (!data) return;
      if (queryReviewAttemptId) {
        const allAttempts = [
          ...data.exercises
            .map((e) => e.latestAttempt)
            .filter((a): a is DrillAttemptRecord => Boolean(a)),
          ...data.recentAiAttempts,
        ];
        const found = allAttempts.find((a) => a.id === queryReviewAttemptId);
        if (found) {
          openPastAttemptForReview(found);
          return;
        }
      }
      if (queryExerciseId) {
        const foundEx = data.exercises.find(
          (e) => e.exercise.id === queryExerciseId
        );
        if (foundEx) {
          openExerciseForPractice(foundEx.exercise);
        }
      }
    });
    return () => {
      stopSpeaking();
    };
  }, [initialVocab, loadLibrary, queryExerciseId, queryReviewAttemptId, skill]);

  function hasPerSectionQuestionTabs(ex: SkillDrillExercise | null): boolean {
    if (!ex?.sections || ex.sections.length <= 1 || !ex.questions?.length) {
      return false;
    }
    const part = inferExercisePartNumber(ex);
    if (ex.skill === "hoeren" && part === 1) return true;
    if (ex.skill === "lesen" && part === 2) return true;
    return false;
  }

  function getQuestionsForSection(
    ex: SkillDrillExercise,
    secId: string | "all"
  ) {
    const allQs = ex.questions ?? [];
    if (
      secId === "all" ||
      !ex.sections ||
      ex.sections.length <= 1 ||
      !hasPerSectionQuestionTabs(ex)
    ) {
      return allQs;
    }
    const secIndex = ex.sections.findIndex((s) => s.id === secId);
    if (secIndex < 0) return allQs;
    const sec = ex.sections[secIndex];
    const secLabelLower = sec.label.toLowerCase();

    const matched = allQs.filter((q) => {
      if (!q.sectionLabel) return false;
      const qLbl = q.sectionLabel.toLowerCase();
      return secLabelLower.includes(qLbl) || qLbl.includes(secLabelLower);
    });
    if (matched.length > 0) return matched;

    // Fallback: proportional slice by section index
    const perSec = Math.max(
      1,
      Math.round(allQs.length / ex.sections.length)
    );
    const start = secIndex * perSec;
    const end =
      secIndex === ex.sections.length - 1
        ? allQs.length
        : Math.min(allQs.length, start + perSec);
    return allQs.slice(start, end);
  }

  function getReadingPrepDurationSec(
    ex: SkillDrillExercise,
    isSingleShortText: boolean
  ): number {
    if (isSingleShortText) return 15; // Official Goethe Hören Teil 1: ~15s reading time per 2-question short text
    const qCount = ex.questions?.length ?? 3;
    if (qCount >= 5) return 60; // Official Goethe Hören Teil 2 / 3 / 4: 60s reading time before audio
    return 20; // 3-question focused drill: 20s reading time
  }

  function formatMmSs(totalSec: number): string {
    const abs = Math.max(0, Math.round(Math.abs(totalSec)));
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function openExerciseForPractice(ex: SkillDrillExercise) {
    stopSpeaking();
    setIsPlaying(false);
    setIsAudioPaused(false);
    setAudioCurrentSec(0);
    setAudioTotalSec(0);
    setAudioDraggingSec(null);
    setActiveSegmentId(undefined);
    setActiveExercise(ex);
    setIsReviewingPast(false);
    setGrade(null);
    setUpdatedReadiness(null);
    setAnswers({});
    setWritingText("");
    setPlayCount(0);
    setSectionPlayCounts({});
    setShowTranscript(false);
    setErrorMsg(null);
    setSavedToBankNotice(null);
    setQuestionAssists({});
    setGlobalAssist(null);
    setShowAskTutor(false);
    setTutorQuestionInput("");
    setPendingPhraseSelection(null);
    setActiveSelection(null);
    setSelectionAssist(null);
    setSelectionAssistCache({});
    setPrecomputedTranslation(null);
    setPrecomputedModelAnswer(null);
    setPrecomputedQuestionAnalyses({});
    setPrecomputedQuestionExplains({});
    setReaderCacheStatus("idle");

    // Start task countdown & finish-time tracker immediately on task entry
    setTaskTargetSec(getExerciseTargetSeconds(ex));
    setTaskElapsedSec(0);
    setTaskTimerPaused(false);

    const useTabs = hasPerSectionQuestionTabs(ex);
    const initialSecId =
      useTabs && ex.sections?.[0] ? ex.sections[0].id : "all";
    setFocusedSectionId(initialSecId);

    if (ex.skill === "hoeren") {
      const prepSec = getReadingPrepDurationSec(ex, useTabs);
      // Do NOT start the countdown on page entry! Wait until user clicks "Start Listening"
      setListeningFlowPhase("idle");
      setReadingTotalSec(prepSec);
      setReadingCountdownSec(prepSec);
      setReadingPaused(true);
    } else {
      setListeningFlowPhase("idle");
      setReadingCountdownSec(0);
      setReadingPaused(true);
    }
  }

  function openPastAttemptForReview(attempt: DrillAttemptRecord) {
    stopSpeaking();
    setIsPlaying(false);
    setIsAudioPaused(false);
    setAudioCurrentSec(0);
    setAudioTotalSec(0);
    setAudioDraggingSec(null);
    setActiveSegmentId(undefined);
    setActiveExercise(attempt.exercise);
    setIsReviewingPast(true);
    setAnswers(attempt.answers ?? {});
    setWritingText(attempt.writingText ?? "");
    setGrade(attempt.grade);
    setUpdatedReadiness(null);
    setPlayCount(0);
    setSectionPlayCounts({});
    setFocusedSectionId("all");
    setListeningFlowPhase("idle");
    setReadingCountdownSec(0);
    setShowTranscript(true);
    setErrorMsg(null);
    setSavedToBankNotice(null);
    setQuestionAssists({});
    setGlobalAssist(null);
    setShowAskTutor(false);
    setPendingPhraseSelection(null);
    setActiveSelection(null);
    setSelectionAssist(null);
    setSelectionAssistCache({});
    setPrecomputedTranslation(null);
    setPrecomputedModelAnswer(null);
    setPrecomputedQuestionAnalyses({});
    setPrecomputedQuestionExplains({});
    setReaderCacheStatus("idle");
    setTaskTargetSec(
      attempt.targetDurationSec ?? getExerciseTargetSeconds(attempt.exercise)
    );
    setTaskElapsedSec(attempt.durationSec ?? 0);
    setTaskTimerPaused(true);
  }

  function handleSelectSectionTab(
    sec: ExamPassageSection,
    options?: { playImmediately?: boolean }
  ) {
    if (!activeExercise) return;
    stopSpeaking();
    setIsPlaying(false);
    setIsAudioPaused(false);
    setAudioCurrentSec(0);
    setAudioTotalSec(0);
    setAudioDraggingSec(null);
    setActiveSegmentId(undefined);
    setFocusedSectionId(sec.id);
    setErrorMsg(null);

    if (options?.playImmediately) {
      setListeningFlowPhase("idle");
      setReadingCountdownSec(0);
      handlePlaySectionAudio(sec, true);
      return;
    }

    if (activeExercise.skill === "hoeren" && !grade) {
      const prepSec = getReadingPrepDurationSec(activeExercise, true);
      // Do NOT auto-start countdown when switching tabs; wait for user to click Start Listening
      setListeningFlowPhase("idle");
      setReadingTotalSec(prepSec);
      setReadingCountdownSec(prepSec);
      setReadingPaused(true);
    }
  }

  function handleStartListeningWithCountdown() {
    if (!activeExercise) return;
    unlockMobileAudio();
    stopSpeaking();
    setIsPlaying(false);
    const useTabs =
      hasPerSectionQuestionTabs(activeExercise) && focusedSectionId !== "all";
    const prepSec = getReadingPrepDurationSec(activeExercise, useTabs);
    setReadingTotalSec(prepSec);
    setReadingCountdownSec(prepSec);
    setReadingPaused(false);
    setListeningFlowPhase("reading_prep");
  }

  function normalizeSelectionKey(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[„“"‚‘'»«()[\]{}]/g, "")
      .replace(/\s+/g, " ")
      .replace(/^[.,;:!?]+|[.,;:!?]+$/g, "")
      .trim();
  }

  // Load static DB cache inventory for Lesen & Hören library header (0 AI calls!)
  useEffect(() => {
    if (skill !== "lesen" && skill !== "hoeren") return;
    fetch(`/api/drills/precompute?skill=${skill}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.cachedExerciseIds) {
          setCachedLesenIds(d.cachedExerciseIds);
        }
      })
      .catch(() => {});
  }, [skill, library]);

  // Instant DB Hydration whenever ANY exercise opens (0 AI calls — reads local data/assist-cache.json only!)
  useEffect(() => {
    if (!activeExercise) return;
    let cancelled = false;
    const ex = activeExercise;

    async function hydrateFromLocalDb() {
      setReaderCacheStatus("checking");
      try {
        const res = await fetch(
          `/api/drills/precompute?exerciseId=${encodeURIComponent(ex.id)}`
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;

        if (data.selectionEntries) {
          setSelectionAssistCache((prev) => ({
            ...prev,
            ...data.selectionEntries,
          }));
        }
        if (data.fullTranslation) {
          setPrecomputedTranslation(data.fullTranslation);
        }
        if (data.modelAnswer) {
          setPrecomputedModelAnswer(data.modelAnswer);
        }
        if (data.questionAnalyses) {
          setPrecomputedQuestionAnalyses(data.questionAnalyses);
        }
        if (data.questionExplains) {
          setPrecomputedQuestionExplains(data.questionExplains);
        }

        setReaderCacheStatus(data.isPrecomputed ? "ready" : "idle");
      } catch {
        if (!cancelled) setReaderCacheStatus("idle");
      }
    }

    void hydrateFromLocalDb();
    return () => {
      cancelled = true;
    };
  }, [activeExercise]);

  async function handlePrebuildCurrentExercise() {
    if (!activeExercise || readerCacheStatus === "building") return;
    setReaderCacheStatus("building");
    try {
      const res = await fetch("/api/drills/precompute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise: activeExercise }),
      });
      if (!res.ok) {
        setReaderCacheStatus("idle");
        return;
      }
      const built = await res.json();
      if (built.selectionEntries) {
        setSelectionAssistCache((prev) => ({
          ...prev,
          ...built.selectionEntries,
        }));
      }
      if (built.fullTranslation) setPrecomputedTranslation(built.fullTranslation);
      if (built.modelAnswer) setPrecomputedModelAnswer(built.modelAnswer);
      if (built.questionAnalyses) {
        setPrecomputedQuestionAnalyses(built.questionAnalyses);
      }
      if (built.questionExplains) {
        setPrecomputedQuestionExplains(built.questionExplains);
      }
      setReaderCacheStatus(built.isPrecomputed ? "ready" : "idle");
      if (built.isPrecomputed) {
        setCachedLesenIds((prev) =>
          prev.includes(activeExercise.id) ? prev : [...prev, activeExercise.id]
        );
      }
    } catch {
      setReaderCacheStatus("idle");
    }
  }

  async function handlePrebuildAllLesenCache() {
    if (bulkPrecomputing || !library) return;
    const uncached = library.exercises
      .map((e) => e.exercise)
      .filter((ex) => ex.skill === skill && !cachedLesenIds.includes(ex.id));

    if (uncached.length === 0) return;

    for (let i = 0; i < uncached.length; i++) {
      const ex = uncached[i];
      setBulkPrecomputing({
        current: i + 1,
        total: uncached.length,
        title: ex.title,
      });
      try {
        const res = await fetch("/api/drills/precompute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercise: ex }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isPrecomputed) {
            setCachedLesenIds((prev) =>
              prev.includes(ex.id) ? prev : [...prev, ex.id]
            );
          }
        }
      } catch {
        // continue with next exercise
      }
    }
    setBulkPrecomputing(null);
  }

  async function requestAssist(
    mode:
      | "explain_question"
      | "analyze_answer"
      | "model_answer"
      | "translate_passage"
      | "ask_tutor",
    questionId?: string,
    userQuestion?: string
  ) {
    if (!activeExercise) return;

    // 0ms instant hits from local DB cache — ZERO API usage!
    if (mode === "translate_passage" && precomputedTranslation) {
      setGlobalAssist(precomputedTranslation);
      return;
    }
    if (mode === "model_answer" && precomputedModelAnswer) {
      setGlobalAssist(precomputedModelAnswer);
      return;
    }
    if (
      mode === "analyze_answer" &&
      questionId &&
      precomputedQuestionAnalyses[questionId]
    ) {
      setQuestionAssists((prev) => ({
        ...prev,
        [questionId]: precomputedQuestionAnalyses[questionId],
      }));
      return;
    }
    if (
      mode === "explain_question" &&
      questionId &&
      precomputedQuestionExplains[questionId]
    ) {
      setQuestionAssists((prev) => ({
        ...prev,
        [questionId]: precomputedQuestionExplains[questionId],
      }));
      return;
    }

    const key = questionId ? `${mode}:${questionId}` : mode;
    setAssistLoadingKey(key);
    try {
      const res = await fetch("/api/drills/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          exercise: activeExercise,
          questionId,
          userQuestion,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tutor assist failed");
      if (questionId && data.result) {
        setQuestionAssists((prev) => ({ ...prev, [questionId]: data.result }));
        if (mode === "analyze_answer") {
          setPrecomputedQuestionAnalyses((prev) => ({
            ...prev,
            [questionId]: data.result,
          }));
        } else if (mode === "explain_question") {
          setPrecomputedQuestionExplains((prev) => ({
            ...prev,
            [questionId]: data.result,
          }));
        }
      } else if (data.result) {
        setGlobalAssist(data.result);
        if (mode === "translate_passage") {
          setPrecomputedTranslation(data.result);
        } else if (mode === "model_answer") {
          setPrecomputedModelAnswer(data.result);
        }
      }
      if (mode === "ask_tutor") {
        setTutorQuestionInput("");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not get help");
    } finally {
      setAssistLoadingKey(null);
    }
  }

  async function handleInspectSelection(payload: InteractiveSelectionPayload) {
    if (!activeExercise) return;
    const cleanText = payload.selectedText.trim();
    if (!cleanText) return;

    setPendingPhraseSelection(null);
    setActiveSelection(payload);

    const norm = normalizeSelectionKey(cleanText);
    const cacheKey = `${activeExercise.id}::${payload.selectionType}::${norm}`;
    const exactHit = selectionAssistCache[cacheKey];
    if (exactHit) {
      setSelectionAssist(exactHit);
      return;
    }

    // Fuzzy sentence match against hydrated DB cache for 0ms instant hit
    if (payload.selectionType === "sentence" && norm.length >= 15) {
      const sentPrefix = `${activeExercise.id}::sentence::`;
      for (const [k, val] of Object.entries(selectionAssistCache)) {
        if (!k.startsWith(sentPrefix)) continue;
        const cachedNorm = k.slice(sentPrefix.length);
        if (cachedNorm.includes(norm) || norm.includes(cachedNorm)) {
          setSelectionAssist(val);
          return;
        }
      }
    }

    setSelectionAssistLoading(true);
    try {
      const res = await fetch("/api/drills/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "explain_selection",
          exercise: activeExercise,
          selectedText: cleanText,
          surroundingSentence: payload.surroundingSentence,
          selectionType: payload.selectionType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Explanation failed");
      if (data.result) {
        setSelectionAssist(data.result);
        setSelectionAssistCache((prev) => ({
          ...prev,
          [cacheKey]: data.result,
        }));
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not explain selection"
      );
    } finally {
      setSelectionAssistLoading(false);
    }
  }

  async function handleSaveReaderVocab(
    german: string,
    meaning: string,
    exampleDe?: string
  ) {
    if (!german.trim() || savedReaderVocab[german]) return;
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vocabulary",
          german: german.trim(),
          meaning: meaning.trim(),
          exampleDe: exampleDe || activeSelection?.surroundingSentence || "",
          topic: activeExercise?.topicDe || "Lesen",
        }),
      });
      if (res.ok) {
        setSavedReaderVocab((prev) => ({ ...prev, [german]: true }));
      }
    } catch {
      // ignore transient save error
    }
  }

  async function handleGenerateAiBonus(specificPart?: 1 | 2 | 3 | 4 | 5) {
    stopSpeaking();
    setIsPlaying(false);
    setGeneratingAi(true);
    setErrorMsg(null);
    try {
      const targetPart =
        specificPart ?? (partFilter !== "all" ? partFilter : undefined);
      const res = await fetch("/api/drills/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill,
          vocabCategoryId: vocabFilter !== "all" ? vocabFilter : undefined,
          grammarStandardId,
          examPartNumber: targetPart,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate AI bonus");
      openExerciseForPractice({
        ...data.exercise,
        source: "ai_generated",
        sourceCredit: "AI Generated (Saved)",
      });
      if (data.autoSaved) {
        setSavedToBankNotice(
          "Auto-saved to your local Exercise Library & Memory!"
        );
        loadLibrary();
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "AI bonus generation failed"
      );
    } finally {
      setGeneratingAi(false);
    }
  }

  async function handleSaveActiveToLocalLibrary() {
    if (!activeExercise) return;
    setSavingToBank(true);
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: activeExercise,
          sourceCredit: "Saved AI Exercise",
        }),
      });
      const out = await res.json();
      if (res.ok && out.ok) {
        setSavedToBankNotice(
          "Saved permanently to your local library (data/exercise-library/custom-exercises.json)!"
        );
        loadLibrary();
      }
    } finally {
      setSavingToBank(false);
    }
  }

  async function handleImportJsonPack() {
    setImporting(true);
    setImportNotice(null);
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: Array.isArray(parsed)
            ? parsed
            : parsed?.exercises ?? [parsed],
          sourceCredit: importCredit.trim() || "Imported JSON Pack",
        }),
      });
      const out = await res.json();
      if (!res.ok) {
        throw new Error(out.error || "Import failed");
      }
      setImportNotice(
        `Imported ${out.addedCount} exercise(s) into your local library!${
          out.skippedCount ? ` (${out.skippedCount} skipped)` : ""
        }`
      );
      setImportJsonText("");
      await loadLibrary();
    } catch (err) {
      setImportNotice(
        err instanceof Error ? `Error: ${err.message}` : "Invalid JSON format."
      );
    } finally {
      setImporting(false);
    }
  }

  async function handleDeleteCustom(id: string) {
    if (!window.confirm("Remove this custom/imported exercise from your local library?")) {
      return;
    }
    await fetch(`/api/exercises?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    loadLibrary();
  }

  function handleAudioProgress(progress: AudioTrackProgress) {
    setAudioCurrentSec(progress.currentSec);
    setAudioTotalSec(progress.totalSec);
    setIsAudioPaused(progress.isPaused);
  }

  function handleStopAudioTrack() {
    stopSpeaking();
    setIsPlaying(false);
    setIsAudioPaused(false);
    setActiveSegmentId(undefined);
    setAudioDraggingSec(null);
  }

  function handleTogglePauseOrPlay(estimatedTotalSec?: number) {
    if (isPlaying) {
      if (isAudioPaused) {
        resumeSpeaking();
        setIsAudioPaused(false);
      } else {
        pauseSpeaking();
        setIsAudioPaused(true);
      }
      return;
    }
    const maxSec = audioTotalSec || estimatedTotalSec || 0;
    const startSec =
      audioCurrentSec > 0 && (!maxSec || audioCurrentSec < maxSec - 1)
        ? audioCurrentSec
        : 0;
    handlePlayAudio(startSec);
  }

  function handleSeekAudioTo(targetSec: number, autoPlayIfIdle = false) {
    const safeSec = Math.max(0, targetSec);
    setAudioCurrentSec(safeSec);
    setAudioDraggingSec(null);
    if (isPlaying) {
      seekSpeaking(safeSec);
      if (autoPlayIfIdle && isAudioPaused) {
        resumeSpeaking();
        setIsAudioPaused(false);
      }
    } else if (autoPlayIfIdle) {
      handlePlayAudio(safeSec);
    }
  }

  function handlePlayAudio(startAtSecOverride?: number) {
    if (!activeExercise?.passageDe && !activeExercise?.sections?.length) return;
    const explicitStart =
      typeof startAtSecOverride === "number" ? startAtSecOverride : undefined;

    if (isPlaying && explicitStart === undefined) {
      handleStopAudioTrack();
      return;
    }

    // If user is in Hören Teil 1 and focusing on a specific short text (Text 1..5),
    // the primary Play button plays that focused short text!
    unlockMobileAudio();
    if (
      activeExercise.skill === "hoeren" &&
      hasPerSectionQuestionTabs(activeExercise) &&
      focusedSectionId !== "all"
    ) {
      const targetSec = activeExercise.sections?.find(
        (s) => s.id === focusedSectionId
      );
      if (targetSec) {
        handlePlaySectionAudio(targetSec, true, explicitStart);
        return;
      }
    }

    setListeningFlowPhase("idle");
    setReadingCountdownSec(0);

    const maxAllowed = activeExercise.maxPlays ?? 2;
    if (strictExamReplay && !grade && playCount >= maxAllowed) {
      setErrorMsg(
        `Offizielles Goethe-Prüfungslimit erreicht: Dieser Teil darf in der Prüfung nur ${maxAllowed}× gehört werden! (Schalten Sie „Strict Exam Limit“ aus, wenn Sie im freien Übungsmodus beliebig oft hören möchten.)`
      );
      return;
    }

    const startOffset =
      explicitStart !== undefined
        ? Math.max(0, explicitStart)
        : !strictExamReplay && audioCurrentSec > 0
        ? audioCurrentSec
        : 0;

    // Only increment official play count when starting from the beginning (or first play)
    const nextCount = startOffset < 2 || playCount === 0 ? playCount + 1 : playCount;
    if (nextCount !== playCount) {
      setPlayCount(nextCount);
    }

    const onFullTrackFinished = () => {
      setIsPlaying(false);
      setIsAudioPaused(false);
      setAudioCurrentSec(0);
      setActiveSegmentId(undefined);
      // If official rule is 2x hören (Teil 1 / Teil 4) and this was the 1st listen (1/2x),
      // automatically schedule the 6-second pause before the 2nd listen!
      if (
        activeExercise.skill === "hoeren" &&
        !grade &&
        maxAllowed === 2 &&
        nextCount === 1 &&
        startOffset < 2
      ) {
        setListeningFlowPhase("between_plays");
        setReadingTotalSec(6);
        setReadingCountdownSec(6);
        setReadingPaused(false);
      }
    };

    // If exercise has multi-speaker or multi-text sections with distinct voices, play them sequentially with live speaker highlight!
    if (activeExercise.sections && activeExercise.sections.length > 0) {
      speakGermanSegments(
        activeExercise.sections.map((s) => ({
          id: s.id,
          textDe: s.textDe,
          edgeVoice: s.edgeVoice,
        })),
        {
          rate: speed,
          ttsProvider: voiceCfg.ttsProvider,
          edgeVoice: voiceCfg.edgeVoice,
          geminiTtsVoice: voiceCfg.geminiTtsVoice,
          voiceName: voiceCfg.preferredVoiceName || undefined,
          startAtSec: startOffset,
          onStart: () => {
            setIsPlaying(true);
            setIsAudioPaused(false);
          },
          onProgress: handleAudioProgress,
          onSegmentChange: (segId) => setActiveSegmentId(segId),
          onEnd: onFullTrackFinished,
          onError: () => {
            setIsPlaying(false);
            setIsAudioPaused(false);
            setActiveSegmentId(undefined);
          },
        }
      );
      return;
    }

    speakGerman(activeExercise.passageDe || "", {
      rate: speed,
      ttsProvider: voiceCfg.ttsProvider,
      edgeVoice: voiceCfg.edgeVoice,
      geminiTtsVoice: voiceCfg.geminiTtsVoice,
      voiceName: voiceCfg.preferredVoiceName || undefined,
      startAtSec: startOffset,
      onStart: () => {
        setIsPlaying(true);
        setIsAudioPaused(false);
      },
      onProgress: handleAudioProgress,
      onEnd: onFullTrackFinished,
      onError: () => {
        setIsPlaying(false);
        setIsAudioPaused(false);
      },
    });
  }

  function handlePlaySectionAudio(
    sec: ExamPassageSection,
    forcePlay = false,
    startAtSecOverride?: number
  ) {
    if (!activeExercise) return;
    unlockMobileAudio();
    // Focus questions on this section when playing it in Hören Teil 1 / Lesen Teil 2
    if (hasPerSectionQuestionTabs(activeExercise)) {
      setFocusedSectionId(sec.id);
    }

    if (!forcePlay && isPlaying && activeSegmentId === sec.id) {
      handleStopAudioTrack();
      return;
    }

    stopSpeaking();
    setListeningFlowPhase("idle");
    setReadingCountdownSec(0);

    const maxAllowed = activeExercise.maxPlays ?? 2;
    const currentSecCount = sectionPlayCounts[sec.id] ?? 0;
    if (strictExamReplay && !grade && currentSecCount >= maxAllowed) {
      setErrorMsg(
        `Offizielles Prüfungslimit erreicht: „${sec.label}“ wurde bereits ${maxAllowed}× abgespielt.`
      );
      return;
    }

    const startOffset =
      typeof startAtSecOverride === "number"
        ? Math.max(0, startAtSecOverride)
        : !strictExamReplay &&
          focusedSectionId === sec.id &&
          audioCurrentSec > 0
        ? audioCurrentSec
        : 0;

    const nextSecCount =
      startOffset < 2 || currentSecCount === 0
        ? currentSecCount + 1
        : currentSecCount;
    if (nextSecCount !== currentSecCount) {
      setSectionPlayCounts((prev) => ({
        ...prev,
        [sec.id]: nextSecCount,
      }));
    }
    setActiveSegmentId(sec.id);

    const partNum = inferExercisePartNumber(activeExercise);
    const isMultiSpeakerDialogue =
      activeExercise.skill === "hoeren" && (partNum === 3 || partNum === 4);

    speakGerman(sec.textDe, {
      rate: speed,
      ttsProvider: voiceCfg.ttsProvider,
      edgeVoice: voiceCfg.edgeVoice,
      speakerEdgeVoiceHint: isMultiSpeakerDialogue ? sec.edgeVoice : undefined,
      geminiTtsVoice: voiceCfg.geminiTtsVoice,
      voiceName: voiceCfg.preferredVoiceName || undefined,
      startAtSec: startOffset,
      onStart: () => {
        setIsPlaying(true);
        setIsAudioPaused(false);
      },
      onProgress: handleAudioProgress,
      onEnd: () => {
        setIsPlaying(false);
        setIsAudioPaused(false);
        setAudioCurrentSec(0);
        setActiveSegmentId(undefined);
        // Official Goethe Hören Teil 1 rule: each short text is heard 2×!
        // After the 1st listen (1/2×), give a 6s pause and automatically play the 2nd listen (2/2×)!
        if (
          activeExercise.skill === "hoeren" &&
          !grade &&
          maxAllowed === 2 &&
          nextSecCount === 1 &&
          startOffset < 2
        ) {
          setListeningFlowPhase("between_plays");
          setReadingTotalSec(6);
          setReadingCountdownSec(6);
          setReadingPaused(false);
        }
      },
      onError: () => {
        setIsPlaying(false);
        setIsAudioPaused(false);
        setActiveSegmentId(undefined);
      },
    });
  }

  // Keep latest play trigger in a ref for the 1-second Lesezeit countdown
  triggerScheduledPlayRef.current = () => {
    if (!activeExercise || activeExercise.skill !== "hoeren" || isPlaying) {
      return;
    }
    if (
      hasPerSectionQuestionTabs(activeExercise) &&
      focusedSectionId !== "all"
    ) {
      const sec = activeExercise.sections?.find(
        (s) => s.id === focusedSectionId
      );
      if (sec) {
        handlePlaySectionAudio(sec, true);
        return;
      }
    }
    handlePlayAudio();
  };

  useEffect(() => {
    if (
      !activeExercise ||
      activeExercise.skill !== "hoeren" ||
      listeningFlowPhase === "idle" ||
      readingPaused ||
      isPlaying ||
      Boolean(grade)
    ) {
      return;
    }

    if (readingCountdownSec <= 0) {
      setListeningFlowPhase("idle");
      triggerScheduledPlayRef.current();
      return;
    }

    const timer = setTimeout(() => {
      setReadingCountdownSec((c) => Math.max(0, c - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    activeExercise,
    grade,
    isPlaying,
    listeningFlowPhase,
    readingCountdownSec,
    readingPaused,
  ]);

  // Task countdown & elapsed finish-time interval
  useEffect(() => {
    if (!activeExercise || grade || isReviewingPast || taskTimerPaused) return;
    const id = setInterval(() => {
      setTaskElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [activeExercise, grade, isReviewingPast, taskTimerPaused]);

  async function handleSubmit() {
    if (!activeExercise) return;
    stopSpeaking();
    setIsPlaying(false);
    setActiveSegmentId(undefined);
    setListeningFlowPhase("idle");
    setReadingCountdownSec(0);
    setTaskTimerPaused(true);
    setGrading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/drills/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: activeExercise,
          answers,
          writingText,
          durationSec: taskElapsedSec > 0 ? taskElapsedSec : undefined,
          targetDurationSec: taskTargetSec,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Grading failed");
      setGrade(data.grade);
      setUpdatedReadiness(data.readiness ?? null);
      if (skill === "hoeren") {
        setShowTranscript(true);
      }
      // Refresh library counts & history in background
      loadLibrary();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to grade");
    } finally {
      setGrading(false);
    }
  }

  const blueprint = GOETHE_B1_BLUEPRINT[skill];

  const skillMeta =
    skill === "hoeren"
      ? {
          icon: Headphones,
          titleDe: "Hören · Listening Library",
          accent: "text-teal-700",
          badgeBg: "bg-teal-50 text-teal-800 border-teal-200",
        }
      : skill === "lesen"
      ? {
          icon: BookOpen,
          titleDe: "Lesen · Reading Library",
          accent: "text-indigo-700",
          badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
        }
      : {
          icon: PenTool,
          titleDe: "Schreiben · Writing Library",
          accent: "text-rose-700",
          badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
        };

  const Icon = skillMeta.icon;
  const wordCount = writingText.trim().split(/\s+/).filter(Boolean).length;
  const allMcqAnswered =
    activeExercise?.questions?.every(
      (q) => typeof answers[q.id] === "number"
    ) ?? false;

  const allLibraryExercises = library?.exercises ?? [];
  const examModeCount = allLibraryExercises.filter(
    (e) => e.exercise.isOfficialFullPart
  ).length;
  const exerciseModeCount = allLibraryExercises.filter(
    (e) => !e.exercise.isOfficialFullPart
  ).length;

  const filteredCards = allLibraryExercises.filter((item) => {
    const isExamTask = Boolean(item.exercise.isOfficialFullPart);
    if (practiceMode === "exam" && !isExamTask) return false;
    if (practiceMode === "exercise" && isExamTask) return false;
    if (
      modelTestFilter !== "all" &&
      item.exercise.modelTestNumber !== modelTestFilter
    ) {
      return false;
    }
    const inferredPart = inferExercisePartNumber(item.exercise);
    if (partFilter !== "all" && inferredPart !== partFilter) {
      return false;
    }
    if (levelFilter !== "all" && item.exercise.level !== levelFilter) {
      return false;
    }
    if (
      vocabFilter !== "all" &&
      item.exercise.vocabCategoryId !== vocabFilter
    ) {
      return false;
    }
    const isPassed = item.bestScore !== null && item.bestScore >= 60;
    const isInProgress = item.attemptCount > 0 && !isPassed;
    const isNew = item.attemptCount === 0;
    if (statusFilter === "new" && !isNew) return false;
    if (statusFilter === "in_progress" && !isInProgress) return false;
    if (statusFilter === "done" && !isPassed) return false;
    return true;
  });

  // =========================================================================
  // VIEW 1: VERIFIED LOCAL EXERCISE LIBRARY & PAST ATTEMPT REVIEW HUB
  // =========================================================================
  if (!activeExercise) {
    return (
      <div className="space-y-6 pb-10">
        {/* Top Bar with Skill Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/progress"
              className="p-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${skillMeta.accent}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{skillMeta.titleDe}</span>
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                {blueprint.moduleTitleDe}
              </h1>
            </div>
          </div>

          {/* Quick Skill Tabs */}
          <div className="inline-flex rounded-xl bg-white border border-zinc-200 p-1 self-start sm:self-center">
            {(
              [
                ["hoeren", "Hören (4 Teile)", Headphones],
                ["lesen", "Lesen (5 Teile)", BookOpen],
                ["schreiben", "Schreiben (3 Aufg.)", PenTool],
              ] as const
            ).map(([k, lbl, TabIcon]) => (
              <Link
                key={k}
                href={`/train/${k}`}
                onClick={() => setPartFilter("all")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  skill === k
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{lbl}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* OFFICIAL GOETHE-ZERTIFIKAT B1 EXAM BLUEPRINT & INTERACTIVE TEIL SELECTOR */}
        <section className="rounded-2xl bg-white border border-zinc-200/90 p-5 space-y-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Offizieller Goethe-Zertifikat B1 Prüfungsaufbau</span>
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-900 text-amber-300">
                  {blueprint.totalItemsLabel} · {blueprint.totalMinutes} Min.
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  {blueprint.passingScoreLabel}
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
                {blueprint.overviewDe}
              </p>

              {/* Static Instant Database Cache Bar (Lesen & Hören — stores Q&A analyses & translations permanently!) */}
              {(skill === "lesen" || skill === "hoeren") &&
                allLibraryExercises.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold border ${
                        cachedLesenIds.length >= allLibraryExercises.length
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-indigo-50 border-indigo-200 text-indigo-900"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        Static Local DB: {cachedLesenIds.length} /{" "}
                        {allLibraryExercises.length}{" "}
                        {skill === "lesen" ? "Lesen" : "Hören"} exercises cached
                        (0 API cost)
                      </span>
                    </span>

                    {bulkPrecomputing ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-950 font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        <span>
                          Saving {bulkPrecomputing.current}/
                          {bulkPrecomputing.total}:{" "}
                          {bulkPrecomputing.title.slice(0, 38)}…
                        </span>
                      </span>
                    ) : cachedLesenIds.length < allLibraryExercises.length ? (
                      <button
                        type="button"
                        onClick={handlePrebuildAllLesenCache}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition cursor-pointer"
                        title="Pre-generate and save all question analyses, answer keys, translations, and word guides into your local database so future reviews use ZERO API calls"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>
                          Pre-build Q&amp;A &amp; Text DB (
                          {allLibraryExercises.length - cachedLesenIds.length})
                        </span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        ✓ All {skill === "lesen" ? "Lesen" : "Hören"} answers,
                        analyses &amp; translations saved locally (0 API cost)!
                      </span>
                    )}
                  </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setImportNotice(null);
                  setShowImportModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold px-3.5 py-2.5 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>

              <button
                onClick={() => handleGenerateAiBonus()}
                disabled={generatingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-semibold px-3.5 py-2.5 transition cursor-pointer disabled:opacity-60"
              >
                {generatingAi ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>
                  {generatingAi
                    ? "Generating Official Format..."
                    : partFilter !== "all"
                    ? `Bonus: Generate AI ${
                        skill === "schreiben" ? "Aufgabe" : "Teil"
                      } ${partFilter}`
                    : "Bonus: Generate AI Exam Part"}
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Official Goethe Parts Grid (Teil 1..4 / Teil 1..5 / Aufgabe 1..3) */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              blueprint.parts.length === 5
                ? "lg:grid-cols-5"
                : blueprint.parts.length === 4
                ? "lg:grid-cols-4"
                : "lg:grid-cols-3"
            } gap-2.5`}
          >
            {blueprint.parts.map((part) => {
              const isSelected = partFilter === part.partNumber;
              const matchCount = (library?.exercises ?? []).filter(
                (e) => inferExercisePartNumber(e.exercise) === part.partNumber
              ).length;

              return (
                <div
                  key={part.partNumber}
                  onClick={() =>
                    setPartFilter(isSelected ? "all" : part.partNumber)
                  }
                  className={`rounded-xl border p-3.5 transition cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                      : "bg-zinc-50/70 hover:bg-zinc-100/80 border-zinc-200 text-zinc-900"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-amber-400 text-zinc-950"
                            : "bg-zinc-900 text-white"
                        }`}
                      >
                        {part.shortLabel}
                      </span>
                      {part.listenBadgeDe ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            part.listenCount === 1
                              ? isSelected
                                ? "bg-rose-500/30 text-rose-200 border border-rose-400/40"
                                : "bg-rose-100 text-rose-800"
                              : isSelected
                              ? "bg-teal-500/30 text-teal-200 border border-teal-400/40"
                              : "bg-teal-100 text-teal-800"
                          }`}
                        >
                          {part.listenBadgeDe}
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-semibold ${
                            isSelected ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          ~{part.recommendedMinutes} Min. · {part.points} Pkt.
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-xs leading-snug">
                      {part.titleDe}
                    </div>
                    <p
                      className={`text-[11px] leading-relaxed ${
                        isSelected ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    >
                      {part.questionFormatDe}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/40 text-[11px] font-semibold">
                    <span
                      className={
                        isSelected ? "text-amber-300" : "text-zinc-700"
                      }
                    >
                      {part.itemCountLabel}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-zinc-200/80 text-zinc-700"
                      }`}
                    >
                      {matchCount} Sets
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
            {errorMsg}
          </div>
        )}

        {/* Exam Mode vs Exercise Mode + Model Test Selector + Filters Row */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Exam Mode vs Exercise Mode Switcher */}
            <div className="inline-flex items-center rounded-xl bg-white border border-zinc-200 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setPracticeMode("all");
                  setModelTestFilter("all");
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  practiceMode === "all"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                All ({allLibraryExercises.length})
              </button>
              <button
                type="button"
                onClick={() => setPracticeMode("exam")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  practiceMode === "exam"
                    ? "bg-zinc-900 text-amber-300"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Exam Mode · Official Model Tests ({examModeCount})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPracticeMode("exercise");
                  setModelTestFilter("all");
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  practiceMode === "exercise"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Exercise Mode · Quick Drills ({exerciseModeCount})
              </button>
            </div>

            {/* Model Exam Set Selector (Modelltest 1, Modelltest 2, Modelltest 3) */}
            {practiceMode !== "exercise" && (
              <div className="inline-flex items-center rounded-xl bg-amber-50 border border-amber-200 p-1 text-xs font-semibold">
                {(
                  [
                    ["all", "All Model Tests"],
                    [1, "Modelltest 1"],
                    [2, "Modelltest 2"],
                    [3, "Modelltest 3"],
                  ] as const
                ).map(([mt, lbl]) => (
                  <button
                    key={String(mt)}
                    type="button"
                    onClick={() => {
                      setModelTestFilter(mt);
                      if (mt !== "all") setPracticeMode("exam");
                    }}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      modelTestFilter === mt
                        ? "bg-zinc-900 text-amber-300 font-bold"
                        : "text-amber-950 hover:bg-amber-100"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Part Pills */}
            <div className="inline-flex items-center rounded-xl bg-white border border-zinc-200 p-1 text-xs font-semibold">
              <button
                onClick={() => setPartFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  partFilter === "all"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Alle {skill === "schreiben" ? "Aufgaben" : "Teile"}
              </button>
              {blueprint.parts.map((p) => (
                <button
                  key={p.partNumber}
                  onClick={() => setPartFilter(p.partNumber)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    partFilter === p.partNumber
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {p.shortLabel}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center rounded-xl bg-white border border-zinc-200 p-1 text-xs font-medium">
              {(["all", "A2", "B1", "B2"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    levelFilter === lvl
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {lvl === "all" ? "All Levels" : lvl}
                </button>
              ))}
            </div>

            <select
              value={vocabFilter}
              onChange={(e) => setVocabFilter(e.target.value)}
              className="text-xs font-medium rounded-xl bg-white border border-zinc-200 px-3 py-2 text-zinc-700"
            >
              <option value="all">All Categories</option>
              {(library?.vocabCategories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titleDe}
                </option>
              ))}
            </select>

            <div className="inline-flex items-center rounded-xl bg-white border border-zinc-200 p-1 text-xs font-medium">
              {(
                [
                  ["all", "All"],
                  ["new", "New"],
                  ["in_progress", "In Progress"],
                  ["done", "Done"],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setStatusFilter(k)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    statusFilter === k
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Local Exercise Cards Grid */}
        {loadingLibrary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-44 bg-zinc-200 rounded-2xl animate-pulse" />
            <div className="h-44 bg-zinc-200 rounded-2xl animate-pulse" />
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="rounded-2xl bg-white border border-zinc-200 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-800">
              No local exercises match those filters yet.
            </p>
            <p className="text-xs text-zinc-500">
              Switch Teil/Level/Category to &ldquo;All&rdquo;, import a JSON pack, or use
              the optional AI Bonus generator.
            </p>
            <button
              onClick={() => {
                setPartFilter("all");
                setLevelFilter("all");
                setVocabFilter("all");
                setStatusFilter("all");
              }}
              className="mt-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-zinc-900 text-white cursor-pointer"
            >
              Show All Local Exercises
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map(
              ({ exercise: ex, attemptCount, bestScore, latestAttempt }) => {
                const isCustom = ex.source !== "verified_bank";
                const passed = bestScore !== null && bestScore >= 60;

                return (
                  <div
                    key={ex.id}
                    className={`rounded-2xl bg-white border p-5 flex flex-col justify-between gap-4 transition ${
                      ex.isOfficialFullPart
                        ? passed
                          ? "border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-200"
                          : "border-zinc-900/25 ring-1 ring-amber-300/60 hover:border-zinc-400"
                        : passed
                        ? "border-emerald-200 bg-emerald-50/15"
                        : "border-zinc-200/80 hover:border-zinc-300"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              ex.isOfficialFullPart
                                ? "bg-zinc-900 text-amber-300"
                                : "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {ex.isOfficialFullPart
                              ? ex.modelTestNumber
                                ? `★ Exam Mode · Modelltest ${ex.modelTestNumber}`
                                : "★ Exam Mode"
                              : "Exercise Mode"}
                          </span>

                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${skillMeta.badgeBg}`}
                          >
                            {ex.examPartLabel}
                          </span>

                          {/* Provenance Badge: Web / Official Source (with link) vs AI Generated */}
                          {ex.source === "ai_generated" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>AI Generated</span>
                            </span>
                          ) : ex.sourceUrl ? (
                            <a
                              href={ex.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={`Open source: ${ex.sourceCredit}`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition"
                            >
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">
                                {ex.sourceCredit || "Goethe-Institut B1"}
                              </span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                              <Globe className="w-3 h-3" />
                              <span>
                                {ex.sourceCredit || "Goethe-Institut B1"}
                              </span>
                            </span>
                          )}

                          {ex.officialFormatBadge && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                              {ex.officialFormatBadge}
                            </span>
                          )}
                        </div>

                        {bestScore !== null ? (
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              passed
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            Best {bestScore}% ({attemptCount}×)
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400 font-medium">
                            New
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-zinc-900">
                          {ex.title}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {ex.topicDe} · {ex.topicEn}
                        </p>
                      </div>

                      {ex.keyVocab.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {ex.keyVocab.slice(0, 3).map((v, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700"
                            >
                              {v.german}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openExerciseForPractice(ex)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3.5 py-2 transition cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                          <span>
                            {attemptCount > 0 ? "Retake" : "Start Practice"}
                          </span>
                        </button>

                        {latestAttempt && (
                          <button
                            onClick={() =>
                              openPastAttemptForReview(latestAttempt)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold px-3 py-2 transition cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        )}
                      </div>

                      {isCustom && (
                        <button
                          onClick={() => handleDeleteCustom(ex.id)}
                          title="Delete custom exercise"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* Completed AI Bonus Attempts (Reviewable Anytime!) */}
        {library && library.recentAiAttempts.length > 0 && (
          <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3">
            <h2 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600" />
              Past AI Bonus Exercises You Completed ({library.recentAiAttempts.length})
            </h2>
            <div className="space-y-2">
              {library.recentAiAttempts.map((att) => (
                <div
                  key={att.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200/70 px-3.5 py-2.5"
                >
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {att.exercise.title}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {att.exercise.examPartLabel} ·{" "}
                      {new Date(att.completedAt).toLocaleDateString()} · Score{" "}
                      {att.grade.score}%
                    </div>
                  </div>
                  <button
                    onClick={() => openPastAttemptForReview(att)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer"
                  >
                    Review Attempt
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Import Open-Source / Local JSON Pack Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-teal-600" />
                  Import Local or Open-Source Exercise Pack (JSON)
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3.5 text-xs text-zinc-600 space-y-1.5">
                <p>
                  <strong className="text-zinc-900">Tip:</strong> You can also drop
                  any <code>.json</code> pack directly into{" "}
                  <code className="px-1 py-0.5 rounded bg-zinc-200">
                    data/exercise-library/
                  </code>{" "}
                  on your PC and it loads automatically!
                </p>
                <p>
                  Great open-source & free German exam sources to adapt into JSON:
                  Goethe-Institut official B1/B2 practice PDFs, Deutsche Welle
                  Top-Thema / Nicos Weg, VHS Lernportal, and GitHub datasets like{" "}
                  <code>abdullahbutt/wordfeather</code>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Load .json File from PC</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImportCredit(file.name);
                      file.text().then((txt) => setImportJsonText(txt));
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setImportJsonText(SAMPLE_JSON_TEMPLATE)}
                  className="text-xs font-medium px-3 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                >
                  Fill Sample JSON Template
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Source / Pack Label
                </label>
                <input
                  value={importCredit}
                  onChange={(e) => setImportCredit(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Exercise Pack JSON (Array of exercises)
                </label>
                <textarea
                  rows={10}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='[ { "skill": "lesen", "level": "B1", "title": "...", "passageDe": "...", "questions": [...] } ]'
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs"
                />
              </div>

              {importNotice && (
                <div
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-medium ${
                    importNotice.startsWith("Error:")
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  }`}
                >
                  {importNotice}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleImportJsonPack}
                  disabled={importing || !importJsonText.trim()}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold cursor-pointer disabled:opacity-40"
                >
                  {importing ? "Importing..." : "Save Pack to Local Library"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE PRACTICE OR PAST ATTEMPT REVIEW STUDIO
  // =========================================================================
  return (
    <div className="space-y-6 pb-10">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              stopSpeaking();
              setIsPlaying(false);
              setActiveExercise(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Exercises</span>
          </button>
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${skillMeta.accent}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>
                {isReviewingPast
                  ? "Reviewing Completed Attempt"
                  : skillMeta.titleDe}
              </span>
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
              {activeExercise.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Automatic Task Countdown & Finish-Time Tracker */}
          {(() => {
            const remainingSec = taskTargetSec - taskElapsedSec;
            const isOvertime = remainingSec < 0;
            const isLow = !isOvertime && remainingSec <= 120;
            const isFinished = Boolean(grade) || isReviewingPast;

            if (isFinished) {
              if (taskElapsedSec <= 0) return null;
              const diffSec = taskTargetSec - taskElapsedSec;
              return (
                <div
                  className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border ${
                    diffSec >= 0
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                  title="Saved finish time for this task"
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Finished in {formatMmSs(taskElapsedSec)} /{" "}
                    {formatMmSs(taskTargetSec)}
                  </span>
                </div>
              );
            }

            return (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs transition ${
                  isOvertime
                    ? "bg-rose-50 border-rose-300 text-rose-900"
                    : isLow
                    ? "bg-amber-50 border-amber-300 text-amber-950"
                    : "bg-white border-zinc-200 text-zinc-900"
                }`}
              >
                <Clock
                  className={`w-4 h-4 shrink-0 ${
                    isOvertime
                      ? "text-rose-600 animate-pulse"
                      : isLow
                      ? "text-amber-600"
                      : "text-teal-700"
                  }`}
                />
                <div className="leading-tight">
                  <div className="text-xs font-extrabold font-mono">
                    {isOvertime
                      ? `+${formatMmSs(Math.abs(remainingSec))} over`
                      : `${formatMmSs(remainingSec)} left`}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium font-mono">
                    Elapsed {formatMmSs(taskElapsedSec)} /{" "}
                    {formatMmSs(taskTargetSec)}
                  </div>
                </div>
                <div className="flex items-center gap-1 pl-1 border-l border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setTaskTimerPaused((p) => !p)}
                    className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                    title={taskTimerPaused ? "Resume countdown" : "Pause countdown"}
                  >
                    {taskTimerPaused ? (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Pause className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTaskElapsedSec(0);
                      setTaskTimerPaused(false);
                    }}
                    className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                    title="Reset timer"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })()}

          {activeExercise.source === "ai_generated" && (
            <button
              onClick={handleSaveActiveToLocalLibrary}
              disabled={savingToBank}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>
                {savingToBank ? "Saving..." : "Save to Local Library"}
              </span>
            </button>
          )}
          {isReviewingPast && (
            <button
              onClick={() => openExerciseForPractice(activeExercise)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Retake Fresh</span>
            </button>
          )}
        </div>
      </div>

      {savedToBankNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-900 font-medium">
          {savedToBankNotice}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Exercise Meta Header (Shows Mode, Exam Part, Topic & Clickable Source / Origin Link!) */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                activeExercise.isOfficialFullPart
                  ? "bg-zinc-900 text-amber-300"
                  : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {activeExercise.isOfficialFullPart
                ? activeExercise.modelTestNumber
                  ? `★ Exam Mode · Modelltest ${activeExercise.modelTestNumber}`
                  : "★ Exam Mode"
                : "Exercise Mode"}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${skillMeta.badgeBg}`}
            >
              {activeExercise.examPartLabel}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
              Topic: {activeExercise.topicDe}
            </span>
          </div>

          {/* Provenance & Clickable Source Link at Top of Task Description */}
          {activeExercise.source === "ai_generated" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Generated Exercise</span>
            </span>
          ) : (
            <div className="inline-flex flex-wrap items-center gap-2 text-xs bg-teal-50/80 border border-teal-200 text-teal-900 px-3 py-1 rounded-full">
              <Globe className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span className="font-semibold">
                Source:{" "}
                {activeExercise.sourceCredit ||
                  "Goethe-Institut B1 Übungsmaterialien"}
              </span>
              {activeExercise.sourceUrl && (
                <a
                  href={activeExercise.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline"
                >
                  <span>({activeExercise.sourceUrl})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-zinc-600">{activeExercise.instructions}</p>

        {/* Interactive Tutor Help, Model Answer & Q&A Bar */}
        <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => requestAssist("model_answer")}
            disabled={assistLoadingKey !== null}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 transition cursor-pointer disabled:opacity-50"
          >
            {assistLoadingKey === "model_answer" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>
              {skill === "schreiben"
                ? "Generate Model Answer & Example"
                : "Show Full Answer Key & Analysis"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => requestAssist("translate_passage")}
            disabled={assistLoadingKey !== null}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 transition cursor-pointer disabled:opacity-50"
          >
            {assistLoadingKey === "translate_passage" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Languages className="w-3.5 h-3.5 text-teal-600" />
            )}
            <span>Translate Text / Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAskTutor((v) => !v)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              showAskTutor
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
            }`}
          >
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            <span>Ask Tutor for Help</span>
          </button>
        </div>

        {/* Free-form Tutor Question Box */}
        {showAskTutor && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tutorQuestionInput.trim()) return;
              requestAssist("ask_tutor", undefined, tutorQuestionInput.trim());
            }}
            className="flex flex-col sm:flex-row gap-2 pt-2"
          >
            <input
              value={tutorQuestionInput}
              onChange={(e) => setTutorQuestionInput(e.target.value)}
              placeholder="Ask anything about this exercise... e.g. 'What does vorausgesetzt mean?' or 'Give me an example for bullet 2'"
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={assistLoadingKey !== null || !tutorQuestionInput.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2 cursor-pointer disabled:opacity-40"
            >
              {assistLoadingKey === "ask_tutor" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Ask Tutor</span>
            </button>
          </form>
        )}

        {/* Global Tutor Output Card (Model Answer / Full Translation + Vocab + Grammar / Q&A) */}
        {globalAssist && (
          <div className="mt-2 rounded-2xl bg-teal-50/70 border border-teal-200 p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-xs uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>{globalAssist.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setGlobalAssist(null)}
                className="text-xs text-teal-700 hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="rounded-xl bg-white border border-teal-200/80 p-4">
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
                {globalAssist.body}
              </p>
            </div>

            {globalAssist.germanExample && (
              <div className="rounded-xl bg-white border border-teal-200/80 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                    German Model / Example
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      unlockMobileAudio();
                      speakGerman(globalAssist.germanExample!, {
                        rate: speed,
                        ttsProvider: voiceCfg.ttsProvider,
                        edgeVoice: voiceCfg.edgeVoice,
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                </div>
                <p className="text-sm text-zinc-900 leading-relaxed whitespace-pre-line">
                  {globalAssist.germanExample}
                </p>
                {globalAssist.germanExampleTranslation && (
                  <p className="text-xs text-zinc-600 italic leading-relaxed">
                    → {globalAssist.germanExampleTranslation}
                  </p>
                )}
              </div>
            )}

            {/* Key Vocabulary Appearing in This Section */}
            {globalAssist.difficultWords &&
              globalAssist.difficultWords.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    Key {activeExercise.level} Vocabulary in This Text
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {globalAssist.difficultWords.map((w, idx) => {
                      const saved = Boolean(savedReaderVocab[w.german]);
                      return (
                        <div
                          key={idx}
                          className="rounded-xl bg-amber-50/80 border border-amber-200 px-3 py-2 flex items-start justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="font-bold text-amber-950">
                              {w.german}
                            </div>
                            <div className="text-zinc-700">{w.translation}</div>
                            {w.note && (
                              <div className="text-[11px] text-amber-900/80 italic">
                                {w.note}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                unlockMobileAudio();
                                speakGerman(w.german, {
                                  rate: speed,
                                  ttsProvider: voiceCfg.ttsProvider,
                                  edgeVoice: voiceCfg.edgeVoice,
                                });
                              }}
                              className="p-1 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 cursor-pointer"
                              title="Listen"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveReaderVocab(w.german, w.translation)
                              }
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                                saved
                                  ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                                  : "bg-white border-amber-200 hover:bg-teal-50 text-teal-900"
                              }`}
                            >
                              {saved ? "✓ Saved" : "+ Vocab"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Grammar Rules Appearing in This Section */}
            {globalAssist.grammarNotes &&
              globalAssist.grammarNotes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                    {activeExercise.level} Grammar Rules Appearing in This Text
                  </div>
                  <div className="space-y-2">
                    {globalAssist.grammarNotes.map((g, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-indigo-50/70 border border-indigo-200 px-3.5 py-2.5 text-xs space-y-0.5"
                      >
                        <div className="font-bold text-indigo-950">
                          {g.pattern}
                        </div>
                        <div className="text-zinc-700 leading-relaxed">
                          {g.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {globalAssist.bulletHighlights &&
              globalAssist.bulletHighlights.length > 0 && (
                <ul className="space-y-1 text-xs text-teal-950">
                  {globalAssist.bulletHighlights.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-teal-700">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        )}
      </div>

      {/* HÖREN: Human Neural Audio Player + Official Goethe Pre-Listening Reading Timer ("Lesezeit") + Per-Text Focused Tabs */}
      {skill === "hoeren" &&
        (activeExercise.passageDe || activeExercise.sections?.length) &&
        (() => {
          const isPerTextTabs = hasPerSectionQuestionTabs(activeExercise);
          const focusedSec =
            isPerTextTabs && focusedSectionId !== "all"
              ? activeExercise.sections?.find((s) => s.id === focusedSectionId)
              : undefined;
          const focusedSecIndex =
            isPerTextTabs && focusedSec
              ? activeExercise.sections!.findIndex(
                  (s) => s.id === focusedSec.id
                )
              : -1;
          const visibleQuestionsForPrompt = getQuestionsForSection(
            activeExercise,
            focusedSectionId
          );
          const qNumbersLabel =
            visibleQuestionsForPrompt.length > 0
              ? visibleQuestionsForPrompt
                  .map((q, idx) => q.itemNumber ?? idx + 1)
                  .join(", ")
              : "alle";
          const currentSecPlayCount = focusedSec
            ? sectionPlayCounts[focusedSec.id] ?? 0
            : playCount;
          const maxAllowedPlays = activeExercise.maxPlays ?? 2;

          return (
            <section className="rounded-3xl bg-zinc-900 text-white p-6 space-y-4">
              {/* Top Row: Title + Replay Rule + Main Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                      <Headphones className="w-4 h-4" />
                      <span>
                        {focusedSec
                          ? `Aktiver Hörtext: ${focusedSec.label}`
                          : "German Exam Audio Track"}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        activeExercise.maxPlays === 1
                          ? "bg-rose-500/25 text-rose-200 border border-rose-400/40"
                          : "bg-teal-500/25 text-teal-200 border border-teal-400/40"
                      }`}
                    >
                      {activeExercise.maxPlays === 1
                        ? "Offiziell: NUR 1× hören!"
                        : "Offiziell: 2× hören"}
                    </span>
                    {activeExercise.sections &&
                      activeExercise.sections.length > 1 && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                          Multi-Voice Neural Audio (
                          {activeExercise.sections.length} Abschnitte)
                        </span>
                      )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    {focusedSec
                      ? `${focusedSec.title || focusedSec.label} · Gehört: ${currentSecPlayCount} / ${maxAllowedPlays}× · Unten sehen Sie nur die Aufgaben (${qNumbersLabel}) für diesen Text.`
                      : `Gehört: ${playCount} / ${maxAllowedPlays}× · ${
                          activeExercise.maxPlays === 1
                            ? "In der echten Goethe-Prüfung (Teil 2 & 3) hören Sie den Text NUR EINMAL!"
                            : "In der echten Goethe-Prüfung (Teil 1 & 4) hören Sie den Text ZWEIMAL."
                        }`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStrictExamReplay((v) => !v)}
                    className={`text-xs font-semibold px-3 py-2 rounded-xl border transition cursor-pointer ${
                      strictExamReplay
                        ? "bg-rose-500/25 border-rose-400 text-rose-100"
                        : "bg-white/10 border-white/15 text-zinc-300 hover:text-white"
                    }`}
                    title="Toggle whether to enforce the official Goethe 1× / 2× listening limit"
                  >
                    {strictExamReplay
                      ? `Exam Limit ON (${maxAllowedPlays}×)`
                      : "Free Replay Mode"}
                  </button>

                  <VoiceSpeedControl
                    value={speed}
                    onChange={setSpeed}
                    variant="dark"
                  />

                  <button
                    onClick={() => {
                      if (isPlaying) {
                        handlePlayAudio();
                        return;
                      }
                      // If not played yet and countdown hasn't started, clicking Start Listening starts the reading countdown!
                      if (
                        currentSecPlayCount === 0 &&
                        listeningFlowPhase === "idle" &&
                        !grade
                      ) {
                        handleStartListeningWithCountdown();
                        return;
                      }
                      handlePlayAudio();
                    }}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition cursor-pointer ${
                      isPlaying
                        ? "bg-rose-500 hover:bg-rose-600 text-white"
                        : "bg-amber-400 hover:bg-amber-300 text-zinc-950"
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        <span>Stop Audio</span>
                      </>
                    ) : currentSecPlayCount === 0 &&
                      listeningFlowPhase === "idle" &&
                      !grade ? (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>
                          {focusedSec
                            ? `Start Text ${focusedSecIndex + 1} (${getReadingPrepDurationSec(
                                activeExercise,
                                true
                              )}s Lesezeit)`
                            : `Start Listening (${getReadingPrepDurationSec(
                                activeExercise,
                                false
                              )}s Lesezeit)`}
                        </span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>
                          {focusedSec
                            ? currentSecPlayCount > 0
                              ? `Text ${focusedSecIndex + 1} nochmal hören (${currentSecPlayCount}/${maxAllowedPlays}×)`
                              : `Text ${focusedSecIndex + 1} sofort abspielen`
                            : playCount > 0
                            ? "Replay Exam Audio"
                            : "Play Audio Now"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* INTERACTIVE AUDIO TIMELINE SLIDER (CHOOSE WHERE TO START, PAUSE, SKIP ±5s, OR JUMP TO ANY SECTION) */}
              {(() => {
                const trackItems = focusedSec
                  ? [
                      {
                        id: focusedSec.id,
                        label: focusedSec.label,
                        textDe: focusedSec.textDe,
                      },
                    ]
                  : activeExercise.sections && activeExercise.sections.length > 0
                  ? activeExercise.sections.map((s) => ({
                      id: s.id,
                      label: s.speakerRole || s.label,
                      textDe: s.textDe,
                    }))
                  : [
                      {
                        id: "full",
                        label: activeExercise.examPartLabel,
                        textDe: activeExercise.passageDe || "",
                      },
                    ];

                const timeline = estimateGermanTrackTimeline(trackItems, speed);
                const effectiveTotalSec = Math.max(
                  2,
                  audioTotalSec > 0 ? audioTotalSec : timeline.totalSec
                );
                const displayedSec = Math.min(
                  effectiveTotalSec,
                  Math.max(
                    0,
                    audioDraggingSec !== null ? audioDraggingSec : audioCurrentSec
                  )
                );
                const progressPct = Math.min(
                  100,
                  Math.max(0, (displayedSec / effectiveTotalSec) * 100)
                );
                const seekLocked = strictExamReplay && !grade;
                const activeMarker =
                  timeline.markers.find((m) => m.id && m.id === activeSegmentId) ||
                  [...timeline.markers]
                    .reverse()
                    .find((m) => displayedSec >= m.startSec) ||
                  timeline.markers[0];

                return (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleTogglePauseOrPlay(effectiveTotalSec)
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold px-3 py-1.5 transition cursor-pointer"
                          title={
                            isPlaying && !isAudioPaused
                              ? "Pause audio"
                              : isPlaying && isAudioPaused
                              ? "Resume audio"
                              : displayedSec > 0
                              ? `Start listening at ${formatMmSs(displayedSec)}`
                              : "Play audio"
                          }
                        >
                          {isPlaying && !isAudioPaused ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>
                                {isPlaying && isAudioPaused
                                  ? "Resume"
                                  : displayedSec > 0
                                  ? `Play from ${formatMmSs(displayedSec)}`
                                  : "Play"}
                              </span>
                            </>
                          )}
                        </button>

                        {!seekLocked && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleSeekAudioTo(
                                  Math.max(0, displayedSec - 5),
                                  false
                                )
                              }
                              className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-200 text-[11px] font-bold px-2.5 py-1.5 transition cursor-pointer"
                              title="Rewind 5 seconds"
                            >
                              −5s
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSeekAudioTo(
                                  Math.min(
                                    effectiveTotalSec - 0.5,
                                    displayedSec + 5
                                  ),
                                  false
                                )
                              }
                              className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-200 text-[11px] font-bold px-2.5 py-1.5 transition cursor-pointer"
                              title="Forward 5 seconds"
                            >
                              +5s
                            </button>
                          </>
                        )}

                        {isPlaying && (
                          <button
                            type="button"
                            onClick={handleStopAudioTrack}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/30 text-rose-200 text-[11px] font-bold px-2.5 py-1.5 transition cursor-pointer"
                            title="Stop audio"
                          >
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        {activeMarker && timeline.markers.length > 1 && (
                          <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-200 border border-amber-400/25">
                            {activeMarker.label}
                          </span>
                        )}
                        <span className="text-amber-300 font-bold">
                          {formatMmSs(displayedSec)}
                        </span>
                        <span className="text-zinc-500">/</span>
                        <span className="text-zinc-300">
                          {formatMmSs(effectiveTotalSec)}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Range Slider */}
                    <div className="space-y-1">
                      <div className="relative flex items-center">
                        <input
                          type="range"
                          min={0}
                          max={effectiveTotalSec}
                          step={0.5}
                          value={displayedSec}
                          disabled={seekLocked}
                          onChange={(e) => {
                            const nextVal = Number(e.target.value);
                            setAudioDraggingSec(nextVal);
                          }}
                          onMouseUp={(e) => {
                            if (seekLocked) return;
                            const nextVal = Number(
                              (e.target as HTMLInputElement).value
                            );
                            handleSeekAudioTo(nextVal, false);
                          }}
                          onTouchEnd={(e) => {
                            if (seekLocked) return;
                            const nextVal = Number(
                              (e.target as HTMLInputElement).value
                            );
                            handleSeekAudioTo(nextVal, false);
                          }}
                          onKeyUp={(e) => {
                            if (seekLocked) return;
                            const nextVal = Number(
                              (e.target as HTMLInputElement).value
                            );
                            handleSeekAudioTo(nextVal, false);
                          }}
                          aria-label="Audio playback position slider"
                          className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed accent-amber-400"
                          style={{
                            background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${progressPct}%, rgba(255,255,255,0.16) ${progressPct}%, rgba(255,255,255,0.16) 100%)`,
                          }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400">
                        <span>
                          {seekLocked
                            ? "Scrubbing locked in Strict Exam Limit mode — switch to Free Replay Mode above to seek."
                            : isPlaying
                            ? "Drag the slider to jump anywhere in the audio, or click Pause / Stop."
                            : "Slide to pick where to start listening, then press Play."}
                        </span>
                        {!seekLocked && displayedSec > 0 && !isPlaying && (
                          <button
                            type="button"
                            onClick={() => setAudioCurrentSec(0)}
                            className="text-amber-300 hover:underline font-semibold cursor-pointer"
                          >
                            Reset to 00:00
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Jump Pills for Multi-Turn Dialogues (Teil 3 & Teil 4) */}
                    {!seekLocked &&
                      !isPerTextTabs &&
                      timeline.markers.length > 1 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/10">
                          <span className="text-[10px] text-zinc-400 mr-0.5">
                            Jump to turn:
                          </span>
                          {timeline.markers.map((mk, mIdx) => {
                            const isCurrent =
                              activeSegmentId
                                ? mk.id === activeSegmentId
                                : activeMarker?.id === mk.id && displayedSec > 0;
                            return (
                              <button
                                key={`${mk.id ?? mIdx}-${mIdx}`}
                                type="button"
                                onClick={() =>
                                  handleSeekAudioTo(mk.startSec, true)
                                }
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                                  isCurrent
                                    ? "bg-amber-400 text-zinc-950 border-amber-300"
                                    : "bg-white/5 hover:bg-white/15 text-zinc-200 border-white/10"
                                }`}
                                title={`Jump and play from ${mk.label} (${formatMmSs(mk.startSec)})`}
                              >
                                {mIdx + 1}. {mk.label} ({formatMmSs(mk.startSec)})
                              </button>
                            );
                          })}
                        </div>
                      )}
                  </div>
                );
              })()}

              {/* OFFICIAL GOETHE PRE-LISTENING INSTRUCTIONS & READING TIME COUNTDOWN ("LESEZEIT VOR DEM HÖRTEXT") */}
              {!grade && listeningFlowPhase === "reading_prep" && (
                <div className="rounded-2xl bg-amber-400/15 border border-amber-300/40 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                        <Clock className="w-4 h-4" />
                        <span>
                          Offizielle Prüfungsansage & Lesezeit vor dem Hörtext
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {focusedSec
                          ? `Was kommt jetzt: ${focusedSec.label}${
                              focusedSec.title ? ` — ${focusedSec.title}` : ""
                            }`
                          : `Was kommt jetzt: ${activeExercise.title} (${activeExercise.examPartLabel})`}
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed">
                        <strong className="text-amber-200">
                          Zu lösende Aufgaben:
                        </strong>{" "}
                        Aufgabe{" "}
                        {visibleQuestionsForPrompt
                          .map(
                            (q, idx) =>
                              `${q.itemNumber ?? idx + 1} (${
                                q.questionType === "richtig_falsch"
                                  ? "Richtig/Falsch"
                                  : q.questionType === "speaker_match"
                                  ? "Wer sagt was?"
                                  : "Multiple Choice a/b/c"
                              })`
                          )
                          .join(" · ")}{" "}
                        ·{" "}
                        <strong className="text-teal-300">
                          {maxAllowedPlays === 1
                            ? "Achtung: Sie hören diesen Text NUR EINMAL (1×)!"
                            : "Sie hören diesen Text zweimal (2×)."}
                        </strong>
                      </p>
                      <p className="text-xs text-amber-100/90">
                        Lesen Sie jetzt zuerst in Ruhe die{" "}
                        {visibleQuestionsForPrompt.length === 1
                          ? "Aufgabe"
                          : `${visibleQuestionsForPrompt.length} Aufgaben`}{" "}
                        unten durch! Der Hörtext startet automatisch nach Ablauf
                        der Lesezeit.
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-950/80 border border-amber-300/40 px-3.5 py-2">
                        <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span className="text-xs text-zinc-300">Lesezeit:</span>
                        <span className="text-lg font-extrabold text-amber-300 tabular-nums">
                          {readingCountdownSec}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (readingCountdownSec /
                              Math.max(1, readingTotalSec)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  {/* Action Controls for Reading Time */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setListeningFlowPhase("idle");
                        setReadingCountdownSec(0);
                        triggerScheduledPlayRef.current();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold px-3.5 py-2 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>
                        Fertig gelesen — Hörtext jetzt sofort starten
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReadingPaused((p) => !p)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold px-3 py-2 transition cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>
                        {readingPaused
                          ? "Lesezeit fortsetzen"
                          : "Lesezeit pausieren"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReadingCountdownSec((c) => c + 15);
                        setReadingTotalSec((t) => Math.max(t, readingCountdownSec + 15));
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-200 text-xs font-semibold px-3 py-2 transition cursor-pointer"
                    >
                      <span>+15 Sek. mehr Lesezeit</span>
                    </button>
                  </div>
                </div>
              )}

              {/* BETWEEN 1ST & 2ND LISTEN PAUSE BANNER (FOR 2× HÖREN PARTS: TEIL 1 & TEIL 4) */}
              {!grade && listeningFlowPhase === "between_plays" && (
                <div className="rounded-2xl bg-teal-500/15 border border-teal-400/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-teal-300">
                      ✓ 1. Durchgang (1/2×) beendet — Offizielle Pause vor dem
                      2. Hören
                    </div>
                    <p className="text-xs text-zinc-200">
                      Sie hören{" "}
                      {focusedSec ? focusedSec.label : "den Hörtext"} in{" "}
                      <strong className="text-amber-300">
                        {readingCountdownSec} Sekunden
                      </strong>{" "}
                      automatisch ein zweites Mal (2/2×). Prüfen Sie jetzt Ihre
                      Antworten!
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setListeningFlowPhase("idle");
                        setReadingCountdownSec(0);
                        triggerScheduledPlayRef.current();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold px-3.5 py-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>2. Hören sofort starten</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setListeningFlowPhase("idle");
                        setReadingCountdownSec(0);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-200 text-xs font-semibold px-3 py-2 cursor-pointer"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span>2. Hören überspringen</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Ready-to-Start Briefing Banner (shown when idle before user clicks Start Listening) */}
              {!grade &&
                listeningFlowPhase === "idle" &&
                !isPlaying && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-200">
                    <div className="space-y-0.5">
                      <div className="font-bold text-amber-300">
                        Bereit für{" "}
                        {focusedSec
                          ? `${focusedSec.label} (${
                              focusedSec.title || "Kurztext"
                            })`
                          : activeExercise.examPartLabel}
                      </div>
                      <p className="text-zinc-300">
                        Dazu gehören:{" "}
                        <strong className="text-white">
                          Aufgaben {qNumbersLabel}
                        </strong>{" "}
                        · Offizielle Lesezeit vor dem Hörtext:{" "}
                        <strong className="text-amber-300">
                          {getReadingPrepDurationSec(
                            activeExercise,
                            isPerTextTabs
                          )}{" "}
                          Sekunden
                        </strong>{" "}
                        ({maxAllowedPlays}× hören). Der Countdown startet erst,
                        wenn Sie auf Start klicken!
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleStartListeningWithCountdown}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-3.5 py-2 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Start mit{" "}
                          {getReadingPrepDurationSec(
                            activeExercise,
                            isPerTextTabs
                          )}
                          s Lesezeit
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-3 py-2 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Sofort abspielen</span>
                      </button>
                    </div>
                  </div>
                )}

              {/* Individual Short Texts Selector & Player (for Hören Teil 1's 5 short texts) or Live Speaker Badge (for Teil 3 / Teil 4) */}
              {activeExercise.sections &&
                activeExercise.sections.length > 0 && (
                  <div className="border-t border-white/10 pt-3 space-y-2.5">
                    {isPerTextTabs ? (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[11px] font-semibold text-zinc-300">
                            Wählen Sie einen Text aus — unten werden dann{" "}
                            <strong className="text-amber-300">
                              nur die Aufgaben für diesen Text
                            </strong>{" "}
                            angezeigt (kein Scrollen nötig!):
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFocusedSectionId(
                                focusedSectionId === "all"
                                  ? activeExercise.sections![0].id
                                  : "all"
                              )
                            }
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                              focusedSectionId === "all"
                                ? "bg-amber-400 text-zinc-950 border-amber-300"
                                : "bg-white/10 hover:bg-white/15 text-zinc-200 border-white/15"
                            }`}
                          >
                            {focusedSectionId === "all"
                              ? "✓ Alle 10 Aufgaben angezeigt (Klicken für Einzelansicht)"
                              : `Alle ${
                                  activeExercise.questions?.length ?? 10
                                } Aufgaben gleichzeitig zeigen`}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                          {activeExercise.sections.map((sec, sIdx) => {
                            const isSelectedTab = focusedSectionId === sec.id;
                            const activeThisAudio =
                              isPlaying && activeSegmentId === sec.id;
                            const count = sectionPlayCounts[sec.id] ?? 0;
                            const secQs = getQuestionsForSection(
                              activeExercise,
                              sec.id
                            );
                            const answeredCount = secQs.filter(
                              (q) => typeof answers[q.id] === "number"
                            ).length;
                            const allSecAnswered =
                              secQs.length > 0 &&
                              answeredCount === secQs.length;

                            return (
                              <div
                                key={sec.id}
                                onClick={() => handleSelectSectionTab(sec)}
                                className={`rounded-xl border p-3 text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                                  activeThisAudio
                                    ? "bg-amber-400 text-zinc-950 border-amber-300 font-bold ring-2 ring-amber-200"
                                    : isSelectedTab
                                    ? "bg-white/15 text-white border-amber-400 ring-2 ring-amber-400/50"
                                    : "bg-white/5 hover:bg-white/10 border-white/15 text-zinc-200"
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-1 text-xs font-bold">
                                    <span className="truncate">
                                      Text {sIdx + 1}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        activeThisAudio
                                          ? "bg-zinc-900 text-amber-300"
                                          : allSecAnswered
                                          ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                                          : "bg-white/10 text-zinc-300"
                                      }`}
                                    >
                                      {allSecAnswered ? "✓ " : ""}
                                      {answeredCount}/{secQs.length} Fragen
                                    </span>
                                  </div>
                                  <div
                                    className={`text-[10px] font-medium truncate ${
                                      activeThisAudio
                                        ? "text-zinc-800"
                                        : "text-zinc-300"
                                    }`}
                                  >
                                    {sec.title || sec.label}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
                                  <span
                                    className={`text-[10px] font-semibold ${
                                      activeThisAudio
                                        ? "text-zinc-900"
                                        : "text-teal-300"
                                    }`}
                                  >
                                    {activeThisAudio
                                      ? "🔊 Spielt..."
                                      : `Gehört: ${count}/${maxAllowedPlays}×`}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectSectionTab(sec, {
                                        playImmediately: true,
                                      });
                                    }}
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition cursor-pointer ${
                                      activeThisAudio
                                        ? "bg-zinc-900 text-white"
                                        : "bg-amber-400 hover:bg-amber-300 text-zinc-950"
                                    }`}
                                  >
                                    <Volume2 className="w-3 h-3" />
                                    <span>
                                      {activeThisAudio ? "Stop" : "Hören"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-zinc-400">
                          Sprecher im Hörtext:
                        </span>
                        {Array.from(
                          new Set(
                            activeExercise.sections.map(
                              (s) => s.speakerRole || s.label
                            )
                          )
                        ).map((speaker) => {
                          const activeSec = activeExercise.sections?.find(
                            (s) => s.id === activeSegmentId
                          );
                          const isSpeakingNow =
                            isPlaying &&
                            (activeSec?.speakerRole === speaker ||
                              activeSec?.label === speaker);
                          return (
                            <span
                              key={speaker}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
                                isSpeakingNow
                                  ? "bg-amber-400 text-zinc-950 border-amber-300 animate-pulse"
                                  : "bg-white/10 text-zinc-200 border-white/15"
                              }`}
                            >
                              {isSpeakingNow ? "🔊 " : ""}
                              {speaker}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              <div className="border-t border-white/10 pt-3">
                <button
                  onClick={() => setShowTranscript((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  {showTranscript ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {showTranscript
                      ? "Hide German Transcript"
                      : focusedSec
                      ? `Reveal Transcript for ${focusedSec.label} (if stuck)`
                      : "Reveal German Transcript (if stuck)"}
                  </span>
                </button>
                {showTranscript && (
                  <div className="mt-2.5 space-y-2 bg-white/5 rounded-xl p-4 border border-white/10">
                    {focusedSec ? (
                      <div className="text-sm leading-relaxed text-zinc-100">
                        <span className="font-bold text-amber-300">
                          {focusedSec.label}
                          {focusedSec.title ? ` (${focusedSec.title})` : ""}:{" "}
                        </span>
                        <span>{focusedSec.textDe}</span>
                      </div>
                    ) : activeExercise.sections &&
                      activeExercise.sections.length > 0 ? (
                      activeExercise.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className={`text-sm leading-relaxed p-2 rounded-lg ${
                            activeSegmentId === sec.id
                              ? "bg-amber-400/20 text-white"
                              : "text-zinc-200"
                          }`}
                        >
                          <span className="font-bold text-amber-300">
                            {sec.label}
                            {sec.title ? ` (${sec.title})` : ""}:{" "}
                          </span>
                          <span>{sec.textDe}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-200 leading-relaxed">
                        {activeExercise.passageDe}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        })()}

      {/* LESEN: Interactive Clickable Reading Layouts (Click Word / Click Sentence / Highlight Phrase + Full Level Grammar Breakdown) */}
      {skill === "lesen" &&
        (activeExercise.passageDe || activeExercise.sections?.length) && (
          <section className="space-y-4">
            {/* Interactive Reader Mode Bar */}
            <div className="rounded-2xl bg-indigo-50/70 border border-indigo-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Interactive Reader:</strong> Click any{" "}
                  {readerClickMode === "word" ? "word" : "sentence"} or highlight
                  any phrase for instant translation &amp;{" "}
                  <strong>{activeExercise.level}</strong> grammar rules.
                </span>
                {readerCacheStatus === "ready" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
                    ✓ Instant DB Ready (0 API Cost)
                  </span>
                )}
                {readerCacheStatus === "idle" && (
                  <button
                    type="button"
                    onClick={handlePrebuildCurrentExercise}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-amber-50 text-indigo-900 border border-indigo-300 text-[10px] font-bold cursor-pointer"
                    title="Pre-save all words, sentences, translation & answer analyses for this exercise into your local database once"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                    <span>Save All to Local DB</span>
                  </button>
                )}
                {readerCacheStatus === "building" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Saving to Local DB…</span>
                  </span>
                )}
              </div>

              <div className="inline-flex items-center rounded-xl bg-white border border-indigo-200 p-0.5 text-[11px] font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setReaderClickMode("word")}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    readerClickMode === "word"
                      ? "bg-amber-400 text-zinc-950"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Tap: Word
                </button>
                <button
                  type="button"
                  onClick={() => setReaderClickMode("sentence")}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    readerClickMode === "sentence"
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Tap: Whole Sentence
                </button>
              </div>
            </div>

            {/* Highlighted Multi-Word Phrase Action Pill */}
            {pendingPhraseSelection && (
              <div className="rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-xs">
                <div className="text-amber-950 truncate max-w-xl">
                  <span className="font-bold">Selected phrase:</span> „
                  {pendingPhraseSelection.selectedText}“
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      handleInspectSelection(pendingPhraseSelection)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-3 py-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Translate &amp; Explain {activeExercise.level} Grammar
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingPhraseSelection(null)}
                    className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-900 cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeExercise.sections && activeExercise.sections.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    {inferExercisePartNumber(activeExercise) === 3
                      ? "Anzeigenmarkt (Anzeigen A bis H) — Offizielles Goethe Teil-3-Format"
                      : inferExercisePartNumber(activeExercise) === 4
                      ? "Online-Leserforum (7 Meinungen) — Offizielles Goethe Teil-4-Format"
                      : `Lesetexte (${activeExercise.examPartLabel})`}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {hasPerSectionQuestionTabs(activeExercise) && (
                      <div className="inline-flex items-center rounded-xl bg-white border border-zinc-200 p-1 text-xs font-semibold">
                        {activeExercise.sections.map((sec) => (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => setFocusedSectionId(sec.id)}
                            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                              focusedSectionId === sec.id
                                ? "bg-zinc-900 text-white"
                                : "text-zinc-600 hover:bg-zinc-100"
                            }`}
                          >
                            {sec.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setFocusedSectionId("all")}
                          className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                            focusedSectionId === "all"
                              ? "bg-zinc-900 text-white"
                              : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          Beide Artikel
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handlePlayAudio()}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 text-zinc-700 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {isPlaying ? "Stop Audio" : "Hear All Read Aloud"}
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  className={
                    inferExercisePartNumber(activeExercise) === 3
                      ? "grid grid-cols-1 md:grid-cols-2 gap-3"
                      : "space-y-3"
                  }
                >
                  {activeExercise.sections
                    .filter(
                      (sec) =>
                        !hasPerSectionQuestionTabs(activeExercise) ||
                        focusedSectionId === "all" ||
                        focusedSectionId === sec.id
                    )
                    .map((sec) => {
                      const isSecPlaying =
                        isPlaying && activeSegmentId === sec.id;
                      return (
                        <div
                          key={sec.id}
                          className={`rounded-2xl bg-white border p-5 space-y-2 shadow-xs transition ${
                            isSecPlaying
                              ? "border-amber-400 ring-2 ring-amber-200"
                              : "border-zinc-200/90"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-950 text-amber-300">
                                {sec.label}
                              </span>
                              {sec.title && (
                                <span className="font-bold text-sm text-zinc-900">
                                  {sec.title}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePlaySectionAudio(sec)}
                              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 cursor-pointer shrink-0"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{isSecPlaying ? "Stop" : "Listen"}</span>
                            </button>
                          </div>
                          <InteractiveGermanText
                            text={sec.textDe}
                            clickMode={readerClickMode}
                            activeSelectionText={activeSelection?.selectedText}
                            className="text-sm sm:text-base leading-relaxed text-zinc-800"
                            onSelectChunk={handleInspectSelection}
                            onHighlightPhrase={setPendingPhraseSelection}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-zinc-200/90 p-6 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Lesetext ({activeExercise.examPartLabel})
                  </span>
                  <button
                    onClick={() => handlePlayAudio()}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? "Stop" : "Hear Text Read Aloud"}</span>
                  </button>
                </div>
                <InteractiveGermanText
                  text={activeExercise.passageDe || ""}
                  clickMode={readerClickMode}
                  activeSelectionText={activeSelection?.selectedText}
                  className="text-base leading-relaxed text-zinc-900"
                  onSelectChunk={handleInspectSelection}
                  onHighlightPhrase={setPendingPhraseSelection}
                />
              </div>
            )}

            {/* Docked Interactive Word / Phrase / Sentence Inspector Panel */}
            {(selectionAssistLoading || selectionAssist) && activeSelection && (
              <div className="rounded-2xl bg-white border-2 border-indigo-200 shadow-sm p-4 sm:p-5 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold uppercase text-[10px]">
                      {activeSelection.selectionType}
                    </span>
                    <span className="font-bold text-sm text-zinc-900">
                      {selectionAssistLoading
                        ? `Analyzing „${activeSelection.selectedText.slice(0, 60)}${activeSelection.selectedText.length > 60 ? "…" : ""}“…`
                        : selectionAssist?.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeSelection.selectionType === "word" &&
                      activeSelection.surroundingSentence &&
                      activeSelection.surroundingSentence !==
                        activeSelection.selectedText && (
                        <button
                          type="button"
                          onClick={() =>
                            handleInspectSelection({
                              selectedText: activeSelection.surroundingSentence,
                              surroundingSentence:
                                activeSelection.surroundingSentence,
                              selectionType: "sentence",
                            })
                          }
                          disabled={selectionAssistLoading}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 text-[11px] cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>
                            Explain Whole Sentence &amp; {activeExercise.level}{" "}
                            Grammar
                          </span>
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSelection(null);
                        setSelectionAssist(null);
                      }}
                      className="text-zinc-500 hover:text-zinc-900 font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {selectionAssistLoading ? (
                  <div className="flex items-center gap-2 text-indigo-700 py-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Translating &amp; checking {activeExercise.level} grammar
                      rules...
                    </span>
                  </div>
                ) : (
                  selectionAssist && (
                    <div className="space-y-3">
                      {/* Clicked German Text + Audio */}
                      <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-bold text-zinc-900">
                            „{selectionAssist.germanExample || activeSelection.selectedText}“
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              unlockMobileAudio();
                              speakGerman(
                                selectionAssist.germanExample ||
                                  activeSelection.selectedText,
                                {
                                  rate: speed,
                                  ttsProvider: voiceCfg.ttsProvider,
                                  edgeVoice: voiceCfg.edgeVoice,
                                }
                              );
                            }}
                            className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 text-zinc-800 cursor-pointer shrink-0"
                            title="Listen to pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {selectionAssist.germanExampleTranslation && (
                          <p className="text-xs text-teal-800 font-medium leading-relaxed">
                            → {selectionAssist.germanExampleTranslation}
                          </p>
                        )}
                      </div>

                      {/* Meaning / Full Explanation */}
                      <p className="text-xs sm:text-sm text-zinc-800 whitespace-pre-line leading-relaxed">
                        {selectionAssist.body}
                      </p>

                      {/* Level Grammar Rules Applied */}
                      {selectionAssist.grammarNotes &&
                        selectionAssist.grammarNotes.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-900">
                              {activeExercise.level} Grammar Rules Applied Here
                            </div>
                            <div className="space-y-1.5">
                              {selectionAssist.grammarNotes.map((g, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-xl bg-indigo-50/70 border border-indigo-200 px-3 py-2 space-y-0.5"
                                >
                                  <div className="font-bold text-indigo-950">
                                    {g.pattern}
                                  </div>
                                  <div className="text-zinc-700 leading-relaxed">
                                    {g.explanation}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Key / Difficult Words */}
                      {selectionAssist.difficultWords &&
                        selectionAssist.difficultWords.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                              Vocabulary &amp; Word Breakdown
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {selectionAssist.difficultWords.map((w, idx) => {
                                const saved = Boolean(
                                  savedReaderVocab[w.german]
                                );
                                return (
                                  <div
                                    key={idx}
                                    className="rounded-xl bg-amber-50/70 border border-amber-200 px-2.5 py-2 flex items-start justify-between gap-2"
                                  >
                                    <div className="min-w-0 space-y-0.5">
                                      <div className="font-bold text-amber-950">
                                        {w.german}
                                      </div>
                                      <div className="text-[11px] text-zinc-700">
                                        {w.translation}
                                      </div>
                                      {w.note && (
                                        <div className="text-[10px] text-amber-900/80 italic">
                                          {w.note}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          unlockMobileAudio();
                                          speakGerman(w.german, {
                                            rate: speed,
                                            ttsProvider: voiceCfg.ttsProvider,
                                            edgeVoice: voiceCfg.edgeVoice,
                                          });
                                        }}
                                        className="p-1 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 cursor-pointer"
                                        title="Listen"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSaveReaderVocab(
                                            w.german,
                                            w.translation,
                                            activeSelection.surroundingSentence
                                          )
                                        }
                                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                                          saved
                                            ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                                            : "bg-white border-amber-200 hover:bg-teal-50 text-teal-900"
                                        }`}
                                      >
                                        {saved ? "✓ Saved" : "+ Vocab"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        )}

      {/* QUESTIONS FOR HÖREN & LESEN (WITH PER-TEXT FOCUSED VIEW + NEXT/PREV TEXT STEPPER) */}
      {skill !== "schreiben" &&
        activeExercise.questions &&
        (() => {
          const isPerTextTabs = hasPerSectionQuestionTabs(activeExercise);
          const visibleQuestions = getQuestionsForSection(
            activeExercise,
            focusedSectionId
          );
          const sections = activeExercise.sections ?? [];
          const currentSecIndex =
            isPerTextTabs && focusedSectionId !== "all"
              ? sections.findIndex((s) => s.id === focusedSectionId)
              : -1;
          const currentSec =
            currentSecIndex >= 0 ? sections[currentSecIndex] : undefined;
          const prevSec =
            currentSecIndex > 0 ? sections[currentSecIndex - 1] : undefined;
          const nextSec =
            currentSecIndex >= 0 && currentSecIndex < sections.length - 1
              ? sections[currentSecIndex + 1]
              : undefined;
          const totalAnsweredCount = activeExercise.questions.filter(
            (q) => typeof answers[q.id] === "number"
          ).length;

          return (
            <section className="space-y-3">
              {/* Focused Section Indicator Header */}
              {isPerTextTabs && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white border border-zinc-200/90 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold px-2.5 py-1 rounded-lg bg-zinc-900 text-amber-300">
                      {currentSec ? currentSec.label : "Alle Texte"}
                    </span>
                    <span className="font-semibold text-zinc-800">
                      {currentSec
                        ? `Zeigt nur die ${visibleQuestions.length} Aufgaben für diesen Text`
                        : `Zeigt alle ${activeExercise.questions.length} Aufgaben`}
                    </span>
                    <span className="text-zinc-500">
                      · Gesamt beantwortet: {totalAnsweredCount} /{" "}
                      {activeExercise.questions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {prevSec && (
                      <button
                        type="button"
                        onClick={() => handleSelectSectionTab(prevSec)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Vorheriger Text</span>
                      </button>
                    )}
                    {nextSec && (
                      <button
                        type="button"
                        onClick={() => handleSelectSectionTab(nextSec)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
                      >
                        <span>Nächster Text</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {visibleQuestions.map((q) => {
                const qIdx = activeExercise.questions!.findIndex(
                  (item) => item.id === q.id
                );
                const selected = answers[q.id];
                const result = grade?.questionResults?.find(
                  (r) => r.questionId === q.id
                );
                const displayNumber = q.itemNumber ?? qIdx + 1;
                const isBinaryChoice =
                  q.options.length === 2 ||
                  q.questionType === "richtig_falsch" ||
                  q.questionType === "ja_nein";

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-white">
                            Aufgabe {displayNumber}
                          </span>
                          {q.sectionLabel && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-950">
                              {q.sectionLabel}
                            </span>
                          )}
                          {q.questionType && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                              {q.questionType === "richtig_falsch"
                                ? "Richtig / Falsch"
                                : q.questionType === "ja_nein"
                                ? "Ja (Dafür) / Nein (Dagegen)"
                                : q.questionType === "speaker_match"
                                ? "Wer sagt was? (a/b/c)"
                                : q.questionType === "ad_match"
                                ? "Anzeige zuordnen"
                                : "Multiple Choice (a/b/c)"}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-sm sm:text-base text-zinc-900">
                          {q.questionDe}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            requestAssist("explain_question", q.id)
                          }
                          disabled={assistLoadingKey !== null}
                          title="Translate & explain this question without spoiling the answer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-950 transition cursor-pointer disabled:opacity-50"
                        >
                          {assistLoadingKey === `explain_question:${q.id}` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <HelpCircle className="w-3 h-3" />
                          )}
                          <span>Explain Question</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => requestAssist("analyze_answer", q.id)}
                          disabled={assistLoadingKey !== null}
                          title="Show full answer analysis with exact German text evidence"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 transition cursor-pointer disabled:opacity-50"
                        >
                          {assistLoadingKey === `analyze_answer:${q.id}` ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Lightbulb className="w-3 h-3" />
                          )}
                          <span>Analyze Answer</span>
                        </button>
                      </div>
                    </div>
                    <div
                      className={
                        isBinaryChoice ? "grid grid-cols-2 gap-2.5" : "space-y-2"
                      }
                    >
                      {q.options.map((opt, oIdx) => {
                        const isPicked = selected === oIdx;
                        const isRight =
                          Boolean(grade) && oIdx === q.correctIndex;
                        const isWrongPicked =
                          Boolean(grade) && isPicked && oIdx !== q.correctIndex;

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={Boolean(grade)}
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                            }
                            className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${
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

                    {result && (
                      <div
                        className={`rounded-xl px-3.5 py-2.5 text-xs ${
                          result.correct
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                            : "bg-amber-50 text-amber-950 border border-amber-200"
                        }`}
                      >
                        <span className="font-bold">
                          {result.correct ? "Richtig! " : "Erklärung: "}
                        </span>
                        {result.explanation}
                      </div>
                    )}

                    {questionAssists[q.id] && (
                      <div className="rounded-xl bg-teal-50/70 border border-teal-200 p-3.5 text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-teal-900">
                            {questionAssists[q.id].title}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionAssists((prev) => {
                                const copy = { ...prev };
                                delete copy[q.id];
                                return copy;
                              })
                            }
                            className="text-teal-700 hover:underline cursor-pointer"
                          >
                            Hide
                          </button>
                        </div>
                        <p className="text-zinc-800 whitespace-pre-line leading-relaxed">
                          {questionAssists[q.id].body}
                        </p>

                        {/* Key Evidence Quote + Full-Sentence Translation */}
                        {questionAssists[q.id].germanExample && (
                          <div className="rounded-lg bg-white border border-teal-200 px-3 py-2.5 space-y-1">
                            <div className="flex items-start justify-between gap-2 text-teal-950 font-medium">
                              <span>„{questionAssists[q.id].germanExample}“</span>
                              <button
                                type="button"
                                onClick={() => {
                                  unlockMobileAudio();
                                  speakGerman(
                                    questionAssists[q.id].germanExample!,
                                    {
                                      rate: speed,
                                      ttsProvider: voiceCfg.ttsProvider,
                                      edgeVoice: voiceCfg.edgeVoice,
                                    }
                                  );
                                }}
                                className="p-1 rounded hover:bg-teal-50 cursor-pointer shrink-0"
                                title="Satz anhören"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {questionAssists[q.id].germanExampleTranslation && (
                              <p className="text-[11px] text-zinc-600 italic leading-relaxed">
                                → {questionAssists[q.id].germanExampleTranslation}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Sentence-by-Sentence Translations */}
                        {questionAssists[q.id].sentenceBreakdowns &&
                          questionAssists[q.id].sentenceBreakdowns!.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                                Full-Sentence Translations
                              </div>
                              <div className="space-y-1.5">
                                {questionAssists[q.id].sentenceBreakdowns!.map(
                                  (sb, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-lg bg-white/90 border border-teal-200/80 px-3 py-2 space-y-0.5"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="font-semibold text-zinc-900 leading-snug">
                                          {sb.german}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            unlockMobileAudio();
                                            speakGerman(sb.german, {
                                              rate: speed,
                                              ttsProvider: voiceCfg.ttsProvider,
                                              edgeVoice: voiceCfg.edgeVoice,
                                            });
                                          }}
                                          className="p-1 rounded hover:bg-teal-50 text-teal-800 cursor-pointer shrink-0"
                                          title="Satz anhören"
                                        >
                                          <Volume2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      <div className="text-[11px] text-zinc-600 leading-relaxed">
                                        {sb.translation}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Difficult Words & Expressions */}
                        {questionAssists[q.id].difficultWords &&
                          questionAssists[q.id].difficultWords!.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                                Difficult Words &amp; Expressions
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {questionAssists[q.id].difficultWords!.map(
                                  (w, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-lg bg-amber-50/70 border border-amber-200/90 px-2.5 py-2 flex items-start justify-between gap-2"
                                    >
                                      <div className="space-y-0.5 min-w-0">
                                        <div className="font-bold text-amber-950 leading-snug">
                                          {w.german}
                                        </div>
                                        <div className="text-[11px] text-zinc-700">
                                          {w.translation}
                                        </div>
                                        {w.note && (
                                          <div className="text-[10px] text-amber-900/80 italic">
                                            {w.note}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          unlockMobileAudio();
                                          speakGerman(w.german, {
                                            rate: speed,
                                            ttsProvider: voiceCfg.ttsProvider,
                                            edgeVoice: voiceCfg.edgeVoice,
                                          });
                                        }}
                                        className="p-1 rounded hover:bg-amber-100 text-amber-900 cursor-pointer shrink-0"
                                        title="Aussprache anhören"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Grammar Explanations */}
                        {questionAssists[q.id].grammarNotes &&
                          questionAssists[q.id].grammarNotes!.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-900">
                                Grammar Breakdown
                              </div>
                              <div className="space-y-1.5">
                                {questionAssists[q.id].grammarNotes!.map(
                                  (g, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-lg bg-indigo-50/60 border border-indigo-200/80 px-3 py-2 space-y-0.5"
                                    >
                                      <div className="font-bold text-indigo-950">
                                        {g.pattern}
                                      </div>
                                      <div className="text-[11px] text-zinc-700 leading-relaxed">
                                        {g.explanation}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {questionAssists[q.id].bulletHighlights &&
                          questionAssists[q.id].bulletHighlights!.length >
                            0 && (
                            <ul className="space-y-1 text-teal-950">
                              {questionAssists[q.id].bulletHighlights!.map(
                                (line, idx) => (
                                  <li key={idx}>• {line}</li>
                                )
                              )}
                            </ul>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom Step Navigation Bar for Multi-Text Exercises + Final Submit Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {isPerTextTabs && focusedSectionId !== "all" && (
                  <div className="flex flex-wrap items-center gap-2">
                    {prevSec && (
                      <button
                        type="button"
                        onClick={() => handleSelectSectionTab(prevSec)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-semibold px-4 py-2.5 text-xs transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Zurück zu {prevSec.label}</span>
                      </button>
                    )}

                    {nextSec && (
                      <button
                        type="button"
                        onClick={() => handleSelectSectionTab(nextSec)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-5 py-2.5 text-xs sm:text-sm transition cursor-pointer shadow-xs"
                      >
                        <span>
                          Weiter zu {nextSec.label}{" "}
                          {skill === "hoeren" ? "(mit 15s Lesezeit)" : ""}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {!grade && (
                  <button
                    onClick={handleSubmit}
                    disabled={grading || !allMcqAnswered}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-6 py-3 text-sm transition cursor-pointer disabled:opacity-40"
                  >
                    {grading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>
                      Check All {activeExercise.questions.length} Answers (
                      {totalAnsweredCount}/{activeExercise.questions.length}{" "}
                      answered)
                    </span>
                  </button>
                )}
              </div>
            </section>
          );
        })()}

      {/* SCHREIBEN: 4-Stage Guided & Exam-Simulation Writing Studio (Aufgabe 1, 2, 3) */}
      {skill === "schreiben" && (
        <SchreibenStudio
          exercise={activeExercise}
          voiceCfg={voiceCfg}
          speed={speed}
          writingText={writingText}
          setWritingText={setWritingText}
          grade={grade}
          grading={grading}
          updatedReadiness={updatedReadiness}
          attempts={
            library?.exercises.find((e) => e.exercise.id === activeExercise.id)
              ?.attempts ?? []
          }
          onSelectPastAttempt={(att) => openPastAttemptForReview(att)}
          onSubmitForGrading={handleSubmit}
          onResetExercise={() => openExerciseForPractice(activeExercise)}
          onBackToLibrary={() => {
            stopSpeaking();
            setActiveExercise(null);
          }}
        />
      )}

      {/* GRADED RESULTS & PROGRESS BOOST CARD (for Hören & Lesen; Schreiben renders its 4-Pillar Rubric in Stage 4 above) */}
      {grade && skill !== "schreiben" && (
        <section className="space-y-4">
          <div className="rounded-3xl bg-zinc-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Award className="w-4 h-4" />
                <span>
                  {grade.passed
                    ? "Passed Official 60% Margin!"
                    : "Keep Practicing — Saved for Review"}
                </span>
              </div>
              <h2 className="text-xl font-bold">{grade.praise}</h2>
              <p className="text-sm text-zinc-300">{grade.summary}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {taskElapsedSec > 0 && (
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs rounded-xl px-3 py-1.5 font-semibold border ${
                      taskElapsedSec <= taskTargetSec
                        ? "bg-teal-500/20 border-teal-400/30 text-teal-200"
                        : "bg-rose-500/20 border-rose-400/30 text-rose-200"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Finish Time: {formatMmSs(taskElapsedSec)} (Target{" "}
                      {formatMmSs(taskTargetSec)}
                      {taskElapsedSec <= taskTargetSec
                        ? ` · ${formatMmSs(taskTargetSec - taskElapsedSec)} ahead`
                        : ` · +${formatMmSs(taskElapsedSec - taskTargetSec)} over`}
                      )
                    </span>
                  </div>
                )}
                {updatedReadiness && (
                  <div className="inline-flex items-center gap-2 text-xs bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-emerald-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      Progress Monitor Updated: {updatedReadiness.overallReadiness}%
                      Ready · {updatedReadiness.passProbabilityPct}% Pass Chance
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 w-24 h-24 rounded-full border-4 border-amber-400 flex flex-col items-center justify-center bg-white/5">
              <span className="text-2xl font-bold text-amber-300">
                {grade.score}%
              </span>
              <span className="text-[10px] uppercase text-zinc-400">Score</span>
            </div>
          </div>

          {grade.writingCorrections && grade.writingCorrections.length > 0 && (
            <div className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3">
              <h3 className="font-bold text-zinc-900">
                Line-by-Line German Writing Corrections
              </h3>
              <div className="space-y-2.5">
                {grade.writingCorrections.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-zinc-50 border border-zinc-200/70 p-3.5 text-xs space-y-1"
                  >
                    <div className="text-rose-700 line-through">
                      {c.original}
                    </div>
                    <div className="font-semibold text-emerald-800">
                      ✓ {c.corrected}
                    </div>
                    <p className="text-zinc-600">{c.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {grade.improvedVersionDe && (
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-emerald-950">
                  Natural {activeExercise.level} Model Version
                </h3>
                <button
                  onClick={() =>
                    speakGerman(grade.improvedVersionDe!, {
                      rate: speed,
                      ttsProvider: voiceCfg.ttsProvider,
                      edgeVoice: voiceCfg.edgeVoice,
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-900 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>
              <p className="text-sm text-emerald-950 leading-relaxed whitespace-pre-line">
                {grade.improvedVersionDe}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                stopSpeaking();
                setActiveExercise(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-3 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to Exercise Library</span>
            </button>
            <button
              onClick={() => openExerciseForPractice(activeExercise)}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-900 text-sm font-semibold px-4 py-3 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Exercise</span>
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

export default function SkillTrainerPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl bg-white border border-zinc-200 p-12 text-center text-sm text-zinc-500">
          Loading local exercise library...
        </div>
      }
    >
      <SkillTrainerInner />
    </Suspense>
  );
}
