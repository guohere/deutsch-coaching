"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Flame,
  HelpCircle,
  Layers,
  Loader2,
  Mail,
  MessageCircle,
  Mic,
  MicOff,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  Volume2,
} from "lucide-react";
import {
  CasualInterview,
  SpeakingLegoBrick,
} from "@/lib/speaking-practice-bank";
import {
  CollectedSpeakingPhrase,
  EnrichedQaReflexDrill,
} from "@/lib/speaking-practice-store";
import {
  createGermanSpeechRecognition,
  speakGerman,
  speakGermanSegments,
  stopSpeaking,
} from "@/lib/speech";
import { B1_VOCAB_CATEGORIES_META } from "@/lib/vocab-grammar-bank";

interface SpeakingPracticePayload {
  interviews: CasualInterview[];
  qaDrills: EnrichedQaReflexDrill[];
  collectedPhrases: CollectedSpeakingPhrase[];
  completedInterviews: string[];
  targetLevel: string;
  aiConfig: {
    ttsProvider: "edge_neural" | "gemini_tts" | "browser";
    edgeVoice: string;
    geminiTtsVoice: string;
    voiceRate: number;
  };
}

function normGerman(text: string): string {
  return text.toLowerCase().replace(/[„“".,!?]/g, "").trim();
}

function formatTimer(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}

function SpeakingStudioInner() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");
  const initialCategory = searchParams.get("category") || "all";

  const [data, setData] = useState<SpeakingPracticePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"interviews" | "qa" | "vault">(
    initialTabParam === "qa"
      ? "qa"
      : initialTabParam === "vault"
      ? "vault"
      : "interviews"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [toast, setToast] = useState<string | null>(null);

  // --- TAB 1: INTERVIEW & SHADOWING & 3-2-1 STATE ---
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);
  const [showTranslations, setShowTranslations] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<0.82 | 1.0>(1.0);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null);
  const [generatingInterview, setGeneratingInterview] = useState(false);

  // 3-2-1 Solo Speaking Drill State
  const [drill321Open, setDrill321Open] = useState(false);
  const [drill321Round, setDrill321Round] = useState<3 | 2 | 1>(3);
  const [drill321SecLeft, setDrill321SecLeft] = useState(180);
  const [drill321Running, setDrill321Running] = useState(false);
  const [hideTranscriptFor321, setHideTranscriptFor321] = useState(true);
  const [drill321Transcript, setDrill321Transcript] = useState("");
  const [micActive, setMicActive] = useState(false);
  const recognitionRef = useRef<ReturnType<
    typeof createGermanSpeechRecognition
  > | null>(null);

  // --- TAB 2: Q&A REFLEX DRILLS STATE ---
  const [qaTypeFilter, setQaTypeFilter] = useState<
    "all" | "answer" | "ask" | "retry"
  >("all");
  const [qaQueue, setQaQueue] = useState<EnrichedQaReflexDrill[]>([]);
  const [qaIndex, setQaIndex] = useState(0);
  const [qaShuffledOrder, setQaShuffledOrder] = useState<number[]>([0, 1, 2, 3]);
  const [qaSelectedDisplayIdx, setQaSelectedDisplayIdx] = useState<number | null>(
    null
  );
  const [qaSessionCorrect, setQaSessionCorrect] = useState(0);
  const [qaSessionTotal, setQaSessionTotal] = useState(0);
  const [generatingQa, setGeneratingQa] = useState(false);

  // --- TAB 3: COLLECTED PHRASE VAULT REPEAT TRAINER STATE ---
  const [vaultMode, setVaultMode] = useState<"practice" | "list">("practice");
  const [vaultOnlyRepeat, setVaultOnlyRepeat] = useState(false);
  const [vaultIdx, setVaultIdx] = useState(0);
  const [vaultRevealed, setVaultRevealed] = useState(false);
  const [vaultSpokenText, setVaultSpokenText] = useState("");
  const [vaultMicActive, setVaultMicActive] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const res = await fetch("/api/speaking-practice");
      if (!res.ok) throw new Error("Failed to load speaking practice studio");
      const payload = (await res.json()) as SpeakingPracticePayload;
      setData(payload);
      return payload;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
    return () => {
      stopSpeaking();
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, [loadAll]);

  // 3-2-1 Countdown Interval
  useEffect(() => {
    if (!drill321Running) return;
    const id = window.setInterval(() => {
      setDrill321SecLeft((prev) => {
        if (prev <= 1) {
          setDrill321Running(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [drill321Running]);

  const savedNormSet = useMemo(() => {
    const s = new Set<string>();
    for (const p of data?.collectedPhrases ?? []) {
      s.add(normGerman(p.german));
    }
    return s;
  }, [data]);

  function isPhraseCollected(german: string): boolean {
    return savedNormSet.has(normGerman(german));
  }

  function speakLine(text: string, voiceOverride?: string, rateOverride?: number) {
    if (!text.trim()) return;
    speakGerman(text, {
      rate: rateOverride ?? playbackRate,
      ttsProvider: data?.aiConfig?.ttsProvider ?? "edge_neural",
      edgeVoice: voiceOverride ?? data?.aiConfig?.edgeVoice,
      geminiTtsVoice: data?.aiConfig?.geminiTtsVoice,
    });
  }

  // --- INTERVIEW FILTERING ---
  const filteredInterviews = useMemo(() => {
    const list = data?.interviews ?? [];
    if (categoryFilter === "all") return list;
    return list.filter((i) => i.categoryId === categoryFilter);
  }, [data, categoryFilter]);

  const activeInterview = useMemo(() => {
    if (!filteredInterviews.length) return null;
    if (activeInterviewId) {
      const found = filteredInterviews.find((i) => i.id === activeInterviewId);
      if (found) return found;
    }
    return filteredInterviews[0];
  }, [filteredInterviews, activeInterviewId]);

  useEffect(() => {
    if (activeInterview && activeInterview.id !== activeInterviewId) {
      setActiveInterviewId(activeInterview.id);
    }
  }, [activeInterview, activeInterviewId]);

  function handlePlayFullInterview() {
    if (!activeInterview) return;
    if (isPlayingFull) {
      stopSpeaking();
      setIsPlayingFull(false);
      setActiveTurnId(null);
      return;
    }
    setIsPlayingFull(true);
    const segments = activeInterview.turns.map((t) => ({
      id: t.id,
      textDe: t.textDe,
      edgeVoice:
        t.voiceRole === "male"
          ? "de-DE-FlorianMultilingualNeural"
          : "de-DE-SeraphinaMultilingualNeural",
    }));
    speakGermanSegments(segments, {
      rate: playbackRate,
      ttsProvider: data?.aiConfig?.ttsProvider ?? "edge_neural",
      onSegmentChange: (segId) => setActiveTurnId(segId ?? null),
      onEnd: () => {
        setIsPlayingFull(false);
        setActiveTurnId(null);
      },
      onError: () => {
        setIsPlayingFull(false);
        setActiveTurnId(null);
      },
    });
  }

  async function handleCollectPhrase(payload: {
    german: string;
    meaningEn: string;
    categoryId: string;
    patternDe?: string;
    spokenExampleDe?: string;
    emailBridgeDe?: string;
    emailBridgeEn?: string;
    sourceLabel: string;
  }) {
    const res = await fetch("/api/speaking-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "collect_phrase",
        ...payload,
      }),
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json.collectedPhrases)) {
      setData((prev) =>
        prev ? { ...prev, collectedPhrases: json.collectedPhrases } : prev
      );
      showToast(
        json.alreadySaved
          ? "Already in your Collected Phrases!"
          : `Collected! Added to My Phrases (${json.collectedPhrases.length}).`
      );
    }
  }

  async function handleRemovePhrase(phraseId: string) {
    const res = await fetch("/api/speaking-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove_phrase", phraseId }),
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json.collectedPhrases)) {
      setData((prev) =>
        prev ? { ...prev, collectedPhrases: json.collectedPhrases } : prev
      );
      showToast("Removed phrase from your vault.");
    }
  }

  async function handleToggleInterviewDone() {
    if (!activeInterview) return;
    const res = await fetch("/api/speaking-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle_interview_done",
        interviewId: activeInterview.id,
      }),
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json.completedInterviews)) {
      setData((prev) =>
        prev ? { ...prev, completedInterviews: json.completedInterviews } : prev
      );
      showToast(
        json.isDone ? "Interview marked practiced ✓" : "Unmarked interview."
      );
    }
  }

  async function handleGenerateInterview() {
    const targetCat = categoryFilter.startsWith("voc-")
      ? categoryFilter
      : activeInterview?.categoryId || "voc-work";
    setGeneratingInterview(true);
    try {
      const res = await fetch("/api/speaking-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_interview",
          categoryId: targetCat,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate interview");
      setData((prev) =>
        prev ? { ...prev, interviews: json.interviews } : prev
      );
      setCategoryFilter(targetCat);
      setActiveInterviewId(json.interview.id);
      showToast(`Created new casual interview: "${json.interview.titleDe}"!`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not generate interview"
      );
    } finally {
      setGeneratingInterview(false);
    }
  }

  function startStopMic(target: "321" | "vault") {
    const active = target === "321" ? micActive : vaultMicActive;
    if (active) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setMicActive(false);
      setVaultMicActive(false);
      return;
    }

    const rec = createGermanSpeechRecognition();
    if (!rec) {
      showToast(
        "Browser speech recognition unavailable here — speak out loud directly!"
      );
      return;
    }
    recognitionRef.current = rec;
    rec.onresult = (event) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript + " ";
      }
      if (target === "321") {
        setDrill321Transcript(full.trim());
      } else {
        setVaultSpokenText(full.trim());
      }
    };
    rec.onend = () => {
      setMicActive(false);
      setVaultMicActive(false);
    };
    rec.onerror = () => {
      setMicActive(false);
      setVaultMicActive(false);
    };
    try {
      rec.start();
      if (target === "321") setMicActive(true);
      else setVaultMicActive(true);
    } catch {
      showToast("Could not start microphone.");
    }
  }

  // --- TAB 2: Q&A REFLEX DRILL QUEUE ---
  const filteredQaDrills = useMemo(() => {
    const all = data?.qaDrills ?? [];
    return all.filter((d) => {
      if (categoryFilter !== "all" && d.categoryId !== categoryFilter) {
        return false;
      }
      if (qaTypeFilter === "answer" && d.drillType !== "answer") return false;
      if (qaTypeFilter === "ask" && d.drillType !== "ask") return false;
      if (qaTypeFilter === "retry" && !d.stats.needsRetry) return false;
      return true;
    });
  }, [data, categoryFilter, qaTypeFilter]);

  const shuffleIndices = useCallback((len: number) => {
    const arr = Array.from({ length: len }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const rebuildQaQueue = useCallback(
    (source: EnrichedQaReflexDrill[]) => {
      // Prioritize needsRetry first, then unpracticed, then oldest practiced
      const sorted = [...source].sort((a, b) => {
        if (a.stats.needsRetry !== b.stats.needsRetry) {
          return a.stats.needsRetry ? -1 : 1;
        }
        const aTotal = a.stats.totalCorrect + a.stats.totalWrong;
        const bTotal = b.stats.totalCorrect + b.stats.totalWrong;
        if (aTotal !== bTotal) return aTotal - bTotal;
        return a.stats.correctStreak - b.stats.correctStreak;
      });
      setQaQueue(sorted);
      setQaIndex(0);
      setQaSelectedDisplayIdx(null);
      if (sorted[0]) {
        setQaShuffledOrder(shuffleIndices(sorted[0].options.length));
      }
    },
    [shuffleIndices]
  );

  useEffect(() => {
    if (!loading && data) {
      rebuildQaQueue(filteredQaDrills);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, qaTypeFilter, loading, data?.qaDrills.length]);

  const currentQa = qaQueue[qaIndex] ?? null;

  async function handleSelectQaOption(displayIdx: number) {
    if (!currentQa || qaSelectedDisplayIdx !== null) return;
    setQaSelectedDisplayIdx(displayIdx);
    const origIdx = qaShuffledOrder[displayIdx];
    const isCorrect = origIdx === currentQa.correctIndex;

    setQaSessionTotal((n) => n + 1);
    if (isCorrect) setQaSessionCorrect((n) => n + 1);

    // Speak the correct German response/question immediately to build ear-mouth memory!
    const correctText = currentQa.options[currentQa.correctIndex];
    speakLine(correctText);

    const res = await fetch("/api/speaking-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "record_qa_result",
        drillId: currentQa.id,
        correct: isCorrect,
      }),
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json.qaDrills)) {
      setData((prev) => (prev ? { ...prev, qaDrills: json.qaDrills } : prev));
    }

    // If wrong, re-insert this drill 2 cards later so the user practices it again!
    if (!isCorrect) {
      setQaQueue((prev) => {
        const next = [...prev];
        const insertAt = Math.min(next.length, qaIndex + 3);
        next.splice(insertAt, 0, currentQa);
        return next;
      });
    }
  }

  function handleNextQa() {
    const nextIdx = qaIndex + 1;
    if (nextIdx < qaQueue.length) {
      setQaIndex(nextIdx);
      setQaSelectedDisplayIdx(null);
      setQaShuffledOrder(shuffleIndices(qaQueue[nextIdx].options.length));
    } else {
      rebuildQaQueue(filteredQaDrills);
      showToast("Round complete! Shuffled a fresh Q&A set.");
    }
  }

  async function handleGenerateQaBatch() {
    const targetCat = categoryFilter.startsWith("voc-")
      ? categoryFilter
      : "voc-work";
    setGeneratingQa(true);
    try {
      const res = await fetch("/api/speaking-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_qa_batch",
          categoryId: targetCat,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not generate Q&A batch");
      setData((prev) => (prev ? { ...prev, qaDrills: json.qaDrills } : prev));
      setCategoryFilter(targetCat);
      showToast(`Added +${json.addedCount} fresh Ask & Answer drills!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGeneratingQa(false);
    }
  }

  // --- TAB 3: VAULT PHRASES FILTERING ---
  const filteredVaultPhrases = useMemo(() => {
    const list = data?.collectedPhrases ?? [];
    return list.filter((p) => {
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) {
        return false;
      }
      if (vaultOnlyRepeat && !p.needsRepeat) return false;
      return true;
    });
  }, [data, categoryFilter, vaultOnlyRepeat]);

  const currentVaultPhrase =
    filteredVaultPhrases[vaultIdx % Math.max(1, filteredVaultPhrases.length)] ??
    null;

  async function handleVaultResult(gotIt: boolean) {
    if (!currentVaultPhrase) return;
    const res = await fetch("/api/speaking-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "practice_phrase_result",
        phraseId: currentVaultPhrase.id,
        gotIt,
      }),
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json.collectedPhrases)) {
      setData((prev) =>
        prev ? { ...prev, collectedPhrases: json.collectedPhrases } : prev
      );
    }
    setVaultRevealed(false);
    setVaultSpokenText("");
    setVaultIdx((i) => i + 1);
  }

  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 w-80 bg-zinc-200 rounded-2xl" />
        <div className="h-14 bg-zinc-200 rounded-2xl" />
        <div className="h-96 bg-zinc-200 rounded-2xl" />
      </div>
    );
  }

  const collectedCount = data.collectedPhrases.length;
  const qaRetryCount = data.qaDrills.filter((d) => d.stats.needsRetry).length;
  const completedInterviewSet = new Set(data.completedInterviews);
  const activeInterviewCat = B1_VOCAB_CATEGORIES_META.find(
    (c) => c.id === activeInterview?.categoryId
  );

  return (
    <div className="space-y-5 pb-12">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-zinc-900 text-white text-xs font-semibold px-4 py-2.5 shadow-lg border border-zinc-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link
              href="/exercises"
              className="inline-flex items-center gap-1 hover:text-zinc-900 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exercises Hub</span>
            </Link>
            <span>·</span>
            <span className="font-semibold text-amber-700">
              Exercise Mode · Active Speaking Extraction &amp; Q&amp;A
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {data.targetLevel} Casual Interviews, Lego Bricks &amp; Q&amp;A Studio
          </h1>
          <p className="text-sm text-zinc-600">
            Turn passive recognition into fast active speaking: listen &amp;
            shadow casual German conversations, mine reusable phrases + email
            bridges, drill everyday Q&amp;A reflexes, and repeat your collected
            sentences until automatic!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <Link
            href="/train/reading"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reading Studio</span>
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab("vault")}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>My Collected Phrases ({collectedCount})</span>
          </button>
        </div>
      </div>

      {/* 3 MAIN MODE TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-2xl bg-zinc-100 p-1.5 border border-zinc-200/80">
        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            setIsPlayingFull(false);
            setActiveTab("interviews");
          }}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "interviews"
              ? "bg-zinc-900 text-amber-300 shadow-xs"
              : "text-zinc-700 hover:text-zinc-950"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>1. Casual Interviews &amp; Shadowing ({data.interviews.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            setIsPlayingFull(false);
            setActiveTab("qa");
          }}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "qa"
              ? "bg-zinc-900 text-amber-300 shadow-xs"
              : "text-zinc-700 hover:text-zinc-950"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>2. Q&amp;A Reflex Drills — Ask &amp; Answer ({data.qaDrills.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            setIsPlayingFull(false);
            setActiveTab("vault");
          }}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "vault"
              ? "bg-zinc-900 text-amber-300 shadow-xs"
              : "text-zinc-700 hover:text-zinc-950"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Repeat My Collected Phrases ({collectedCount})</span>
        </button>
      </div>

      {/* CATEGORY FILTER BAR (ALL 8 B1 CATEGORIES) */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              categoryFilter === "all"
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
            }`}
          >
            All {B1_VOCAB_CATEGORIES_META.length} Topics
          </button>
          {B1_VOCAB_CATEGORIES_META.map((cat) => {
            const active = categoryFilter === cat.id;
            const countInTab =
              activeTab === "interviews"
                ? data.interviews.filter((i) => i.categoryId === cat.id).length
                : activeTab === "qa"
                ? data.qaDrills.filter((d) => d.categoryId === cat.id).length
                : data.collectedPhrases.filter((p) => p.categoryId === cat.id)
                    .length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                  active
                    ? "bg-indigo-700 text-white border-indigo-700"
                    : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200"
                }`}
              >
                {cat.titleDe.split(",")[0]}{" "}
                <span className={active ? "text-amber-300" : "text-zinc-400"}>
                  ({countInTab})
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === "interviews" && (
          <button
            type="button"
            onClick={handleGenerateInterview}
            disabled={generatingInterview}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 transition cursor-pointer disabled:opacity-60"
          >
            {generatingInterview ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            )}
            <span>
              {generatingInterview ? "Creating Interview…" : "+ AI Casual Interview"}
            </span>
          </button>
        )}

        {activeTab === "qa" && (
          <button
            type="button"
            onClick={handleGenerateQaBatch}
            disabled={generatingQa}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 transition cursor-pointer disabled:opacity-60"
          >
            {generatingQa ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            )}
            <span>{generatingQa ? "Creating +8…" : "+8 AI Q&A Drills"}</span>
          </button>
        )}
      </section>

      {/* =====================================================================
          TAB 1: CASUAL INTERVIEWS, LEGO-BRICK MINING, SHADOWING & 3-2-1 DRILL
      ===================================================================== */}
      {activeTab === "interviews" && (
        <div className="space-y-4">
          {/* Interview Selector Strip */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filteredInterviews.map((item) => {
              const selected = activeInterview?.id === item.id;
              const done = completedInterviewSet.has(item.id);
              const catShort =
                B1_VOCAB_CATEGORIES_META.find((c) => c.id === item.categoryId)
                  ?.titleDe.split(",")[0] ?? "B1";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setIsPlayingFull(false);
                    setActiveTurnId(null);
                    setActiveInterviewId(item.id);
                  }}
                  className={`shrink-0 w-64 text-left rounded-xl border p-3 transition cursor-pointer ${
                    selected
                      ? "bg-amber-50/90 border-amber-400 ring-1 ring-amber-300"
                      : "bg-white hover:bg-zinc-50 border-zinc-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      {catShort} · {item.durationLabel}
                    </span>
                    {done && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5" />
                        Practiced
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-zinc-900 line-clamp-2">
                    {item.titleDe}
                  </div>
                  <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                    {item.settingEn}
                  </div>
                </button>
              );
            })}
          </div>

          {activeInterview && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT: INTERACTIVE 2-VOICE DIALOGUE + SHADOWING + 3-2-1 DRILL (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-4 shadow-xs">
                  {/* Title & Setting */}
                  <div className="space-y-1.5 border-b border-zinc-100 pb-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950">
                        {activeInterviewCat?.titleDe ?? "B1 Conversation"}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                        2-Voice Casual German · {activeInterview.turns.length}{" "}
                        Turns
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-950">
                      {activeInterview.titleDe}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {activeInterview.settingDe} ({activeInterview.settingEn})
                    </p>
                  </div>

                  {/* Audio & Shadowing Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50 border border-zinc-200/80 p-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePlayFullInterview}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer ${
                          isPlayingFull
                            ? "bg-rose-600 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-white"
                        }`}
                      >
                        {isPlayingFull ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Stop Dialogue</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                            <span>Play Full Interview</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPlaybackRate((r) => (r === 1.0 ? 0.82 : 1.0))
                        }
                        className={`text-xs font-semibold px-2.5 py-2 rounded-lg border transition cursor-pointer ${
                          playbackRate === 0.82
                            ? "bg-indigo-50 text-indigo-900 border-indigo-300"
                            : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                        }`}
                        title="Toggle slow shadowing speed (0.82x) vs natural speed (1.0x)"
                      >
                        Speed: {playbackRate === 0.82 ? "0.82× Shadow" : "1.0× Natural"}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowTranslations((v) => !v)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                      >
                        {showTranslations ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        <span>{showTranslations ? "Hide EN" : "Show EN"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleInterviewDone}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                          completedInterviewSet.has(activeInterview.id)
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {completedInterviewSet.has(activeInterview.id)
                            ? "Practiced ✓"
                            : "Mark Practiced"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Step 3 Tip: Shadowing Instruction */}
                  <div className="text-[11px] text-zinc-500">
                    <strong>Shadowing &amp; Mining:</strong> Press{" "}
                    <strong>🔊</strong> on any turn to listen &amp; repeat out
                    loud copying the speaker&apos;s rhythm — or click{" "}
                    <strong>+ Collect Line</strong> on any sentence you want to
                    drill until automatic!
                  </div>

                  {/* Dialogue Turns (Hidden cleanly when 3-2-1 Drill is active & transcript hidden!) */}
                  {drill321Open && hideTranscriptFor321 ? (
                    <div className="rounded-xl bg-amber-50/70 border border-dashed border-amber-300 p-6 text-center space-y-2">
                      <EyeOff className="w-5 h-5 text-amber-700 mx-auto" />
                      <div className="text-xs font-bold text-amber-950">
                        Transcript hidden for your 3-2-1 Solo Speaking Drill!
                      </div>
                      <p className="text-[11px] text-amber-900">
                        Use only the <strong>Lego Bricks</strong> on the right
                        as cue cards and summarize out loud in German.
                      </p>
                      <button
                        type="button"
                        onClick={() => setHideTranscriptFor321(false)}
                        className="text-xs font-semibold text-indigo-700 underline cursor-pointer"
                      >
                        Peek at transcript
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeInterview.turns.map((turn) => {
                        const isSpeakingNow = activeTurnId === turn.id;
                        const collected = isPhraseCollected(turn.textDe);
                        const voice =
                          turn.voiceRole === "male"
                            ? "de-DE-FlorianMultilingualNeural"
                            : "de-DE-SeraphinaMultilingualNeural";
                        return (
                          <div
                            key={turn.id}
                            className={`rounded-xl border p-3.5 transition space-y-1.5 ${
                              isSpeakingNow
                                ? "bg-amber-50 border-amber-400 ring-1 ring-amber-300"
                                : turn.voiceRole === "female"
                                ? "bg-zinc-50/70 border-zinc-200/80"
                                : "bg-teal-50/30 border-teal-200/60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-[11px] font-bold uppercase tracking-wider ${
                                  turn.voiceRole === "female"
                                    ? "text-indigo-700"
                                    : "text-teal-800"
                                }`}
                              >
                                {turn.speaker}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    stopSpeaking();
                                    setIsPlayingFull(false);
                                    setActiveTurnId(turn.id);
                                    speakLine(turn.textDe, voice);
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-white border border-zinc-200 hover:border-teal-400 text-zinc-700 hover:text-teal-900 cursor-pointer"
                                  title="Listen & shadow this line"
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                                  <span>Shadow</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={collected}
                                  onClick={() =>
                                    handleCollectPhrase({
                                      german: turn.textDe,
                                      meaningEn: turn.textEn,
                                      categoryId: activeInterview.categoryId,
                                      sourceLabel: `Interview: ${activeInterview.titleDe.slice(
                                        0,
                                        34
                                      )}`,
                                    })
                                  }
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                                    collected
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-amber-100 hover:bg-amber-200 text-amber-950 cursor-pointer"
                                  }`}
                                >
                                  {collected ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Collected</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Collect Line</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            <p className="text-sm font-medium text-zinc-900 leading-relaxed">
                              {turn.textDe}
                            </p>
                            {showTranslations && (
                              <p className="text-xs text-zinc-500 leading-relaxed">
                                {turn.textEn}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* STEP 4: BUILT-IN "3-2-1" SOLO SPEAKING DRILL CARD */}
                <section className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/70 border border-indigo-200/90 p-5 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Step 4 · The „3-2-1“ Solo Speaking Drill</span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 mt-0.5">
                        Summarize Out Loud: 3 Min → 2 Min → 1 Min
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDrill321Open((v) => !v)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
                    >
                      {drill321Open ? "Close 3-2-1 Drill" : "Start 3-2-1 Drill"}
                    </button>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed">
                    <strong>{activeInterview.drill321PromptDe}</strong>
                    <br />
                    <span className="text-zinc-500">
                      {activeInterview.drill321PromptEn}
                    </span>
                  </p>

                  {drill321Open && (
                    <div className="rounded-xl bg-white border border-indigo-200 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {([3, 2, 1] as const).map((mins) => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => {
                                setDrill321Round(mins);
                                setDrill321SecLeft(mins * 60);
                                setDrill321Running(false);
                              }}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                                drill321Round === mins
                                  ? "bg-indigo-700 text-white border-indigo-700"
                                  : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                              }`}
                            >
                              Round {mins} min
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-extrabold text-zinc-900">
                            {formatTimer(drill321SecLeft)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDrill321Running((r) => !r)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer ${
                              drill321Running
                                ? "bg-rose-600 text-white"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            {drill321Running ? "Pause" : "Start Timer"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDrill321Running(false);
                              setDrill321SecLeft(drill321Round * 60);
                            }}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                            title="Reset timer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <label className="inline-flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hideTranscriptFor321}
                            onChange={(e) =>
                              setHideTranscriptFor321(e.target.checked)
                            }
                            className="rounded border-zinc-300"
                          />
                          <span>
                            Hide transcript (use only Lego Bricks as cues!)
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => startStopMic("321")}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer ${
                            micActive
                              ? "bg-rose-600 text-white"
                              : "bg-amber-400 hover:bg-amber-300 text-zinc-950"
                          }`}
                        >
                          {micActive ? (
                            <>
                              <MicOff className="w-3.5 h-3.5" />
                              <span>Stop Live Mic</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5" />
                              <span>Optional Live German Mic</span>
                            </>
                          )}
                        </button>
                      </div>

                      {drill321Transcript && (
                        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-800 leading-relaxed">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Your Spoken Summary Capture:
                          </div>
                          {drill321Transcript}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT: MINED LEGO BRICKS + SPOKEN-TO-EMAIL BRIDGE (5 cols) */}
              <aside className="lg:col-span-5 space-y-3 lg:sticky lg:top-6">
                <div className="rounded-2xl bg-white border border-zinc-200/80 p-4 sm:p-5 space-y-3.5 shadow-xs">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-800">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Step 1 &amp; 2 · Lego Bricks + Email Bridge</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mt-0.5">
                      Reusable Chunks to Mine From This Interview
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Click <strong>+ Collect Chunk</strong> on phrases you want
                      in your active speaking &amp; email toolkit!
                    </p>
                  </div>

                  <div className="space-y-3">
                    {activeInterview.legoBricks.map((brick: SpeakingLegoBrick) => {
                      const collected = isPhraseCollected(brick.chunkDe);
                      return (
                        <div
                          key={brick.id}
                          className="rounded-xl border border-zinc-200/90 bg-zinc-50/50 p-3.5 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="text-sm font-bold text-zinc-950">
                                „{brick.chunkDe}“
                              </div>
                              <div className="text-xs font-medium text-teal-800">
                                {brick.meaningEn}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => speakLine(brick.chunkDe)}
                              className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:border-teal-400 text-teal-700 shrink-0 cursor-pointer"
                              title="Listen & shadow"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="rounded-lg bg-indigo-50/60 border border-indigo-100 px-2.5 py-1.5 text-[11px] text-indigo-950">
                            <strong>Lego Pattern:</strong> {brick.patternDe}
                          </div>

                          <div className="space-y-1 text-[11px]">
                            <div className="flex items-start justify-between gap-1.5 text-zinc-700">
                              <span>
                                <strong className="text-zinc-900">
                                  Speaking Swap:
                                </strong>{" "}
                                {brick.spokenExampleDe}
                              </span>
                              <button
                                type="button"
                                onClick={() => speakLine(brick.spokenExampleDe)}
                                className="text-zinc-400 hover:text-teal-700 shrink-0 cursor-pointer"
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="rounded-lg bg-amber-50/80 border border-amber-200/70 px-2.5 py-1.5 text-amber-950 flex items-start justify-between gap-1.5">
                              <div>
                                <div className="inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-amber-900">
                                  <Mail className="w-3 h-3" />
                                  <span>Email Bridge</span>
                                </div>
                                <div className="font-medium mt-0.5">
                                  {brick.emailBridgeDe}
                                </div>
                                <div className="text-[10px] text-amber-800/80">
                                  {brick.emailBridgeEn}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => speakLine(brick.emailBridgeDe)}
                                className="text-amber-700 hover:text-amber-950 shrink-0 cursor-pointer mt-0.5"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={collected}
                            onClick={() =>
                              handleCollectPhrase({
                                german: brick.chunkDe,
                                patternDe: brick.patternDe,
                                meaningEn: brick.meaningEn,
                                spokenExampleDe: brick.spokenExampleDe,
                                emailBridgeDe: brick.emailBridgeDe,
                                emailBridgeEn: brick.emailBridgeEn,
                                categoryId: activeInterview.categoryId,
                                sourceLabel: `Lego Brick · ${activeInterviewCat?.titleDe.split(",")[0] ?? "B1"}`,
                              })
                            }
                            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold py-2 px-3 transition ${
                              collected
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                : "bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer"
                            }`}
                          >
                            {collected ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Collected in My Phrases ✓</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Collect Lego Brick for Repeat Practice</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: FAST CONVERSATIONAL Q&A REFLEX DRILLS (HOW TO ASK & ANSWER)
      ===================================================================== */}
      {activeTab === "qa" && (
        <div className="space-y-4">
          {/* Sub-filter Pills: All / How to Answer / How to Ask / Needs Retry */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white border border-zinc-200/80 p-3.5">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all", label: `All Q&A (${filteredQaDrills.length})` },
                  { id: "answer", label: "How to ANSWER Questions" },
                  { id: "ask", label: "How to ASK Questions" },
                  { id: "retry", label: `Needs Retry (${qaRetryCount})` },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setQaTypeFilter(pill.id)}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    qaTypeFilter === pill.id
                      ? pill.id === "retry"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-zinc-900 text-white border-zinc-900"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  {pill.id === "retry" && <Flame className="w-3.5 h-3.5" />}
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span>
                Session:{" "}
                <strong className="text-emerald-700">
                  {qaSessionCorrect} / {qaSessionTotal}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => rebuildQaQueue(filteredQaDrills)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>

          {!currentQa ? (
            <div className="rounded-2xl bg-white border border-dashed border-zinc-300 p-10 text-center space-y-2">
              <p className="text-sm font-bold text-zinc-800">
                {qaTypeFilter === "retry"
                  ? "Zero missed Q&A drills right now — great reflex accuracy!"
                  : "No Q&A drills match this filter yet."}
              </p>
              <button
                type="button"
                onClick={() => setQaTypeFilter("all")}
                className="rounded-xl bg-zinc-900 text-white text-xs font-bold px-4 py-2 cursor-pointer"
              >
                Show All Q&amp;A Drills
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      currentQa.drillType === "ask"
                        ? "bg-indigo-100 text-indigo-900"
                        : "bg-teal-100 text-teal-900"
                    }`}
                  >
                    {currentQa.drillType === "ask"
                      ? "How to ASK a Question"
                      : "How to ANSWER Naturally"}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                    {B1_VOCAB_CATEGORIES_META.find(
                      (c) => c.id === currentQa.categoryId
                    )?.titleDe.split(",")[0] ?? "B1"}
                  </span>
                  {currentQa.stats.needsRetry && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      <Flame className="w-3 h-3" />
                      Retry Drill
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-zinc-400">
                  Card {qaIndex + 1} / {qaQueue.length}
                </span>
              </div>

              {/* Prompt Box */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-4 space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-base sm:text-lg font-bold text-zinc-950 leading-snug">
                    {currentQa.promptDe}
                  </div>
                  <button
                    type="button"
                    onClick={() => speakLine(currentQa.promptDe)}
                    className="p-2 rounded-xl bg-white border border-zinc-200 hover:border-teal-400 text-teal-700 shrink-0 cursor-pointer"
                    title="Hear German prompt"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-zinc-500">{currentQa.promptEn}</div>
              </div>

              {/* 4 Multiple-Choice Options */}
              <div className="space-y-2.5">
                {qaShuffledOrder.map((origIdx, dispIdx) => {
                  const text = currentQa.options[origIdx];
                  const isAnswered = qaSelectedDisplayIdx !== null;
                  const isChosen = qaSelectedDisplayIdx === dispIdx;
                  const isRight = origIdx === currentQa.correctIndex;

                  let style =
                    "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900";
                  if (isAnswered) {
                    if (isRight) {
                      style =
                        "bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-300";
                    } else if (isChosen) {
                      style =
                        "bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-300";
                    } else {
                      style = "bg-zinc-50/50 border-zinc-200 text-zinc-400";
                    }
                  }

                  return (
                    <button
                      key={dispIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectQaOption(dispIdx)}
                      className={`w-full text-left rounded-xl border p-3.5 transition flex items-start gap-3 ${style} ${
                        !isAnswered ? "cursor-pointer" : ""
                      }`}
                    >
                      <span className="shrink-0 w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {String.fromCharCode(65 + dispIdx)}
                      </span>
                      <span className="text-sm font-medium leading-snug flex-1">
                        {text}
                      </span>
                      {isAnswered && isRight && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Instant Collect to Phrase Vault */}
              {qaSelectedDisplayIdx !== null && (
                <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-4 space-y-3">
                  <div className="text-xs text-zinc-800 leading-relaxed">
                    <strong>Coach Tip:</strong> {currentQa.explanationEn}
                  </div>

                  <div className="rounded-lg bg-white border border-amber-200/80 p-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                        Reusable Speaking Brick
                      </div>
                      <div className="text-sm font-bold text-zinc-950">
                        „{currentQa.reusableChunkDe}“
                      </div>
                      <div className="text-xs text-zinc-500">
                        {currentQa.reusableChunkEn}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => speakLine(currentQa.reusableChunkDe)}
                        className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-teal-400 text-teal-700 cursor-pointer"
                        title="Listen & shadow"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isPhraseCollected(currentQa.reusableChunkDe)}
                        onClick={() =>
                          handleCollectPhrase({
                            german: currentQa.reusableChunkDe,
                            meaningEn: currentQa.reusableChunkEn,
                            categoryId: currentQa.categoryId,
                            sourceLabel:
                              currentQa.drillType === "ask"
                                ? "Q&A · How to Ask"
                                : "Q&A · How to Answer",
                          })
                        }
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg transition ${
                          isPhraseCollected(currentQa.reusableChunkDe)
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer"
                        }`}
                      >
                        {isPhraseCollected(currentQa.reusableChunkDe) ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Collected</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Collect Phrase</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQa}
                    className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 cursor-pointer"
                  >
                    Next Q&amp;A Drill →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: MY COLLECTED PHRASES — ACTIVE REPEAT TRAINER
      ===================================================================== */}
      {activeTab === "vault" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white border border-zinc-200/80 p-3.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setVaultMode("practice")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                  vaultMode === "practice"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200"
                }`}
              >
                Active Recall Repeat Trainer
              </button>
              <button
                type="button"
                onClick={() => setVaultMode("list")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                  vaultMode === "list"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200"
                }`}
              >
                Browse All Collected ({filteredVaultPhrases.length})
              </button>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={vaultOnlyRepeat}
                onChange={(e) => {
                  setVaultOnlyRepeat(e.target.checked);
                  setVaultIdx(0);
                }}
                className="rounded border-zinc-300"
              />
              <span>Only phrases needing repeat (streak &lt; 3)</span>
            </label>
          </div>

          {filteredVaultPhrases.length === 0 ? (
            <div className="rounded-2xl bg-white border border-dashed border-zinc-300 p-10 text-center space-y-3">
              <Layers className="w-7 h-7 text-zinc-400 mx-auto" />
              <div className="text-sm font-bold text-zinc-900">
                No collected sentences or Lego Bricks in this filter yet!
              </div>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Open <strong>Casual Interviews</strong> or{" "}
                <strong>Q&amp;A Reflex Drills</strong> and click{" "}
                <strong>+ Collect Line / + Collect Lego Brick</strong> on any
                phrase you want to repeat until you can use it automatically!
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("interviews")}
                  className="rounded-xl bg-zinc-900 text-white text-xs font-bold px-4 py-2 cursor-pointer"
                >
                  Open Casual Interviews →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("qa")}
                  className="rounded-xl bg-amber-400 text-zinc-950 text-xs font-bold px-4 py-2 cursor-pointer"
                >
                  Open Q&amp;A Drills →
                </button>
              </div>
            </div>
          ) : vaultMode === "practice" && currentVaultPhrase ? (
            <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-zinc-200/80 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950">
                  {currentVaultPhrase.sourceLabel}
                </span>
                <span className="font-semibold text-zinc-500">
                  Confidence Streak: {currentVaultPhrase.correctStreak} / 3 ·
                  Card {(vaultIdx % filteredVaultPhrases.length) + 1} /{" "}
                  {filteredVaultPhrases.length}
                </span>
              </div>

              {/* Active Recall Prompt (English Cue -> Say it in German!) */}
              <div className="rounded-xl bg-indigo-50/60 border border-indigo-200 p-5 text-center space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Say This Out Loud in German (Active Recall)
                </div>
                <div className="text-lg font-bold text-zinc-950">
                  {currentVaultPhrase.meaningEn}
                </div>
                {currentVaultPhrase.patternDe && !vaultRevealed && (
                  <div className="text-xs text-indigo-800/80">
                    Hint pattern: {currentVaultPhrase.patternDe.split(" ").slice(0, 3).join(" ")}…
                  </div>
                )}
              </div>

              {/* Optional Mic Test */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => startStopMic("vault")}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition ${
                    vaultMicActive
                      ? "bg-rose-600 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200"
                  }`}
                >
                  {vaultMicActive ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop Mic</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-amber-600" />
                      <span>Test Speaking Into Mic (Optional)</span>
                    </>
                  )}
                </button>
                {vaultSpokenText && (
                  <div className="text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5">
                    You said: <strong>„{vaultSpokenText}“</strong>
                  </div>
                )}
              </div>

              {!vaultRevealed ? (
                <button
                  type="button"
                  onClick={() => {
                    setVaultRevealed(true);
                    speakLine(currentVaultPhrase.german);
                  }}
                  className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold py-3 cursor-pointer"
                >
                  Reveal &amp; Listen in German 🔊
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-base font-bold text-zinc-950">
                        „{currentVaultPhrase.german}“
                      </div>
                      <button
                        type="button"
                        onClick={() => speakLine(currentVaultPhrase.german)}
                        className="p-2 rounded-lg bg-white border border-emerald-200 text-teal-700 shrink-0 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    {currentVaultPhrase.patternDe && (
                      <div className="text-xs text-emerald-950">
                        <strong>Lego Pattern:</strong>{" "}
                        {currentVaultPhrase.patternDe}
                      </div>
                    )}
                    {currentVaultPhrase.emailBridgeDe && (
                      <div className="rounded-lg bg-white/90 border border-amber-200 px-3 py-2 text-xs text-amber-950">
                        <strong>Email Bridge:</strong>{" "}
                        {currentVaultPhrase.emailBridgeDe}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleVaultResult(false)}
                      className="rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold py-3 cursor-pointer"
                    >
                      Still Hesitated — Repeat Soon
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVaultResult(true)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 cursor-pointer"
                    >
                      Said Smoothly! (+1 Streak) ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredVaultPhrases.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl bg-white border border-zinc-200/80 p-4 flex flex-col justify-between gap-2.5"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                        {p.sourceLabel} · Streak {p.correctStreak}/3
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => speakLine(p.german)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-teal-700 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhrase(p.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-700 cursor-pointer"
                          title="Remove from vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-zinc-950">
                      „{p.german}“
                    </div>
                    <div className="text-xs text-zinc-600">{p.meaningEn}</div>
                    {p.emailBridgeDe && (
                      <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200/70 rounded-lg px-2.5 py-1 mt-1">
                        <strong>Email:</strong> {p.emailBridgeDe}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SpeakingPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-zinc-500">
          Loading B1 Speaking &amp; Q&amp;A Studio…
        </div>
      }
    >
      <SpeakingStudioInner />
    </Suspense>
  );
}
