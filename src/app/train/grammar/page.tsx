"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flame,
  Loader2,
  RefreshCw,
  Sparkles,
  Volume2,
  XCircle,
} from "lucide-react";
import { speakGerman, unlockMobileAudio } from "@/lib/speech";
import { ReadinessSummary } from "@/lib/standards";
import { GrammarStandardProgress, TtsProviderType } from "@/lib/types";
import type { EnrichedGrammarDrillItem } from "@/lib/vocab-pool-store";

interface GrammarPoolPayload {
  grammarItems: EnrichedGrammarDrillItem[];
  grammarStandards: GrammarStandardProgress[];
  targetLevel: string;
  readiness: ReadinessSummary;
  aiConfig: {
    ttsProvider: TtsProviderType;
    edgeVoice: string;
    geminiTtsVoice?: string;
    voiceRate: number;
    preferredVoiceName: string;
  };
}

function shuffleWithOptions(item: EnrichedGrammarDrillItem): {
  item: EnrichedGrammarDrillItem;
  shuffledOptions: Array<{ text: string; isCorrect: boolean }>;
} {
  const opts = item.options.map((text, idx) => ({
    text,
    isCorrect: idx === item.correctIndex,
  }));
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { item, shuffledOptions: opts };
}

function GrammarTrainerInner() {
  const searchParams = useSearchParams();
  const initialStandard = searchParams.get("standard") || "all";

  const [data, setData] = useState<GrammarPoolPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [standardFilter, setStandardFilter] = useState(initialStandard);

  const [queue, setQueue] = useState<
    Array<{
      item: EnrichedGrammarDrillItem;
      shuffledOptions: Array<{ text: string; isCorrect: boolean }>;
    }>
  >([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pickedOptionIdx, setPickedOptionIdx] = useState<number | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadPool = useCallback(async () => {
    try {
      const res = await fetch("/api/practice-pool");
      if (!res.ok) throw new Error("Failed to load grammar pool");
      const payload = (await res.json()) as GrammarPoolPayload;
      setData(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPool();
  }, [loadPool]);

  const filteredItems = useMemo(() => {
    const items = data?.grammarItems ?? [];
    if (standardFilter === "all") return items;
    if (standardFilter === "retry") {
      return items.filter((i) => i.stats.needsRetry || i.stats.totalWrong > 0);
    }
    return items.filter((i) => i.standardId === standardFilter);
  }, [data, standardFilter]);

  const retryCount = useMemo(
    () =>
      (data?.grammarItems ?? []).filter((i) => i.stats.needsRetry).length,
    [data]
  );

  const buildQueue = useCallback((items: EnrichedGrammarDrillItem[]) => {
    const retry = items.filter((i) => i.stats.needsRetry);
    const learning = items.filter(
      (i) => !i.stats.needsRetry && i.stats.correctStreak < 2
    );
    const mastered = items.filter((i) => i.stats.correctStreak >= 2);
    const shuffle = <T,>(arr: T[]) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    const ordered = [
      ...shuffle(retry),
      ...shuffle(learning),
      ...shuffle(mastered),
    ].slice(0, 10);

    setQueue(ordered.map(shuffleWithOptions));
    setCurrentIdx(0);
    setPickedOptionIdx(null);
    setSessionCorrect(0);
    setSessionTotal(0);
  }, []);

  useEffect(() => {
    if (!data) return;
    buildQueue(filteredItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(data), standardFilter]);

  async function handleChooseOption(optIdx: number) {
    if (pickedOptionIdx !== null || !queue[currentIdx]) return;
    const entry = queue[currentIdx];
    const chosen = entry.shuffledOptions[optIdx];
    const isCorrect = Boolean(chosen?.isCorrect);

    setPickedOptionIdx(optIdx);
    setSessionTotal((t) => t + 1);
    if (isCorrect) setSessionCorrect((c) => c + 1);

    try {
      const res = await fetch("/api/practice-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_grammar_result",
          itemId: entry.item.id,
          standardId: entry.item.standardId,
          correct: isCorrect,
        }),
      });
      if (res.ok) {
        const out = await res.json();
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            readiness: out.readiness ?? prev.readiness,
            grammarStandards: out.grammarStandards ?? prev.grammarStandards,
            grammarItems: prev.grammarItems.map((g) =>
              g.id === entry.item.id ? { ...g, stats: out.stats } : g
            ),
          };
        });
      }
    } catch {
      // ignore
    }
  }

  async function handleGenerateAiGrammar() {
    const targetStd =
      standardFilter !== "all" && standardFilter !== "retry"
        ? standardFilter
        : data?.grammarStandards[0]?.id || "gram-nebensatz";

    setGeneratingAi(true);
    setNotice(null);
    try {
      const res = await fetch("/api/practice-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_more_grammar",
          standardId: targetStd,
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Failed to generate drills");
      setData((prev) =>
        prev ? { ...prev, grammarItems: out.grammarItems } : prev
      );
      setNotice(
        `Added +${out.addedCount} fresh ${data?.targetLevel ?? "B1"} grammar drills! Click New Round to practice them.`
      );
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Could not generate grammar drills"
      );
    } finally {
      setGeneratingAi(false);
    }
  }

  function speakSentence(text: string) {
    if (!data?.aiConfig) return;
    unlockMobileAudio();
    speakGerman(text, {
      rate: data.aiConfig.voiceRate || 1.0,
      ttsProvider: data.aiConfig.ttsProvider,
      edgeVoice: data.aiConfig.edgeVoice,
      geminiTtsVoice: data.aiConfig.geminiTtsVoice,
    });
  }

  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-64 bg-zinc-200 rounded-xl" />
        <div className="h-64 bg-zinc-200 rounded-2xl" />
      </div>
    );
  }

  const currentEntry = queue[currentIdx];
  const isFinished = queue.length > 0 && currentIdx >= queue.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/exercises"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exercises</span>
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Exercise Mode · {data.targetLevel} Grammar Training Studio
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Master Official {data.targetLevel} Grammar Rules
            </h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              Practice every official {data.targetLevel} grammar standard. Missed
              questions repeat automatically until mastered — and directly boost
              your Grammar Mastery score.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/train/vocab"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900"
          >
            <span>Switch to Vocab Matching →</span>
          </Link>
          <Link
            href="/progress"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            <span>Grammar Mastery: {data.readiness.grammarAvg}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-2">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-emerald-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grammar Standards Filter */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-700">
            Select Grammar Rule ({data.grammarItems.length} drills available):
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateAiGrammar}
              disabled={generatingAi}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 cursor-pointer disabled:opacity-50"
            >
              {generatingAi ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>
                {generatingAi ? "Generating…" : "+6 AI Grammar Drills"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => buildQueue(filteredItems)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Round</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStandardFilter("all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              standardFilter === "all"
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
            }`}
          >
            All Rules ({data.grammarItems.length})
          </button>

          <button
            type="button"
            onClick={() => setStandardFilter("retry")}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              standardFilter === "retry"
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Needs Retry ({retryCount})</span>
          </button>

          {data.grammarStandards.map((std) => {
            const active = standardFilter === std.id;
            return (
              <button
                key={std.id}
                type="button"
                onClick={() => setStandardFilter(std.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                  active
                    ? "bg-indigo-700 text-white border-indigo-700"
                    : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200"
                }`}
              >
                {std.titleDe.split("(")[0].trim()} ·{" "}
                <span className={active ? "text-amber-300" : "text-teal-700"}>
                  {std.masteryPct}%
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Drill Card */}
      <section className="rounded-2xl bg-white border border-zinc-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
        {queue.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 border border-dashed border-zinc-300 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-800">
              {standardFilter === "retry"
                ? "No missed grammar questions waiting for retry!"
                : "No questions in this filter yet."}
            </p>
            <button
              type="button"
              onClick={() => setStandardFilter("all")}
              className="rounded-xl bg-zinc-900 text-white text-xs font-semibold px-4 py-2 cursor-pointer"
            >
              Train All Grammar Rules
            </button>
          </div>
        ) : isFinished ? (
          <div className="rounded-2xl bg-zinc-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Grammar Session Complete!
              </div>
              <div className="text-xl font-bold">
                Score: {sessionCorrect} / {sessionTotal} (
                {Math.round(
                  (sessionCorrect / Math.max(1, sessionTotal)) * 100
                )}
                %)
              </div>
              <p className="text-xs text-zinc-300">
                Updated Grammar Mastery: {data.readiness.grammarAvg}% · Exam
                Readiness: {data.readiness.overallReadiness}%
              </p>
            </div>
            <button
              type="button"
              onClick={() => buildQueue(filteredItems)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm px-5 py-3 cursor-pointer shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start Next Round →</span>
            </button>
          </div>
        ) : (
          currentEntry && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-amber-300 font-bold">
                    Question {currentIdx + 1} / {queue.length}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold">
                    {currentEntry.item.ruleTag}
                  </span>
                  {currentEntry.item.stats.needsRetry && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                      Repeat Question
                    </span>
                  )}
                </div>
                <span className="text-zinc-500 font-semibold">
                  Session: {sessionCorrect}/{sessionTotal} right
                </span>
              </div>

              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 sm:p-5">
                <p className="text-base sm:text-lg font-bold text-zinc-900 leading-relaxed">
                  {currentEntry.item.promptDe}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentEntry.shuffledOptions.map((opt, idx) => {
                  const answered = pickedOptionIdx !== null;
                  const isPicked = pickedOptionIdx === idx;
                  const showCorrect = answered && opt.isCorrect;
                  const showWrong = answered && isPicked && !opt.isCorrect;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleChooseOption(idx)}
                      className={`w-full text-left rounded-xl border px-4 py-3 text-sm font-semibold flex items-center justify-between gap-2 transition cursor-pointer disabled:cursor-default ${
                        showCorrect
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                          : showWrong
                          ? "bg-rose-50 border-rose-400 text-rose-950"
                          : "bg-white hover:bg-amber-50 border-zinc-200 hover:border-amber-300 text-zinc-900"
                      }`}
                    >
                      <span>{opt.text}</span>
                      {showCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {showWrong && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {pickedOptionIdx !== null && (
                <div className="rounded-xl bg-teal-50/80 border border-teal-200 p-4 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-bold text-teal-950 text-sm">
                        „{currentEntry.item.correctSentenceDe}“
                      </div>
                      <p className="text-zinc-700 leading-relaxed">
                        {currentEntry.item.explanationEn}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        speakSentence(currentEntry.item.correctSentenceDe)
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-teal-200 hover:bg-teal-100 text-teal-900 font-semibold cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIdx((idx) => idx + 1);
                        setPickedOptionIdx(null);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-2 cursor-pointer"
                    >
                      <span>
                        {currentIdx + 1 >= queue.length
                          ? "Finish Round"
                          : "Next Question"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </section>
    </div>
  );
}

export default function GrammarTrainerPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-64 bg-zinc-200 rounded-xl" />
          <div className="h-64 bg-zinc-200 rounded-2xl" />
        </div>
      }
    >
      <GrammarTrainerInner />
    </Suspense>
  );
}
