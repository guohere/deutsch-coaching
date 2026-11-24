"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  Flame,
  Lightbulb,
  Loader2,
  PenTool,
  Plus,
  RefreshCw,
  Shuffle,
  Sparkles,
  Trash2,
  Volume2,
  XCircle,
} from "lucide-react";
import { speakGerman, unlockMobileAudio } from "@/lib/speech";
import { ReadinessSummary } from "@/lib/standards";
import { TtsProviderType, VocabCategoryProgress } from "@/lib/types";
import { B1_VOCAB_CATEGORIES_META } from "@/lib/vocab-grammar-bank";
import type { EnrichedVocabPoolItem } from "@/lib/vocab-pool-store";

interface PracticePoolPayload {
  vocabItems: EnrichedVocabPoolItem[];
  vocabCategories: VocabCategoryProgress[];
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

interface UsageExamplesOutput {
  title: string;
  body: string;
  sentenceBreakdowns?: Array<{ german: string; translation: string }>;
  grammarNotes?: Array<{ pattern: string; explanation: string }>;
}

function getTodayLocalDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWordTodayCorrect(
  item: EnrichedVocabPoolItem,
  todayKey: string
): number {
  return item.stats.todayDate === todayKey
    ? item.stats.todayCorrectCount ?? 0
    : 0;
}

function getWordCompletedDays(item: EnrichedVocabPoolItem): number {
  return Array.isArray(item.stats.masteredDays)
    ? item.stats.masteredDays.length
    : 0;
}

function isWordMultiDayMastered(item: EnrichedVocabPoolItem): boolean {
  return Boolean(item.stats.mastered) || getWordCompletedDays(item) >= 3;
}

function isWordDoneForToday(
  item: EnrichedVocabPoolItem,
  todayKey: string
): boolean {
  if (item.stats.needsRetry) return false;
  if (getWordTodayCorrect(item, todayKey) >= 3) return true;
  if (item.stats.nextReviewDate && item.stats.nextReviewDate > todayKey) {
    return true;
  }
  return false;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeGermanAnswer(raw: string): string {
  return raw
    .trim()
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/[.,!?;:"„“]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function extractGermanVariants(target: string): string[] {
  return target
    .split("/")
    .map((v) => v.trim())
    .filter(Boolean);
}

function stripLeadingArticle(phrase: string): { article?: string; core: string } {
  const m = phrase.trim().match(/^(der|die|das)\s+(.+)$/i);
  if (m) {
    return { article: m[1].toLowerCase(), core: m[2].trim() };
  }
  return { core: phrase.trim() };
}

function buildLetterPatternHint(german: string): {
  typeLabel: string;
  pattern: string;
} {
  const primary = extractGermanVariants(german)[0] || german;
  const cleanPrimary = primary.replace(/\s*\(.*?\)\s*/g, "").trim();
  const { article, core } = stripLeadingArticle(cleanPrimary);

  const maskWord = (w: string) => {
    if (w.length <= 2) return `${w[0]}_`;
    return `${w[0]}${"_".repeat(Math.min(12, w.length - 1))} (${w.length} letters)`;
  };

  if (article) {
    return {
      typeLabel: `Noun (Article: „${article}“)`,
      pattern: `${article} ${maskWord(core)}`,
    };
  }
  if (/^sich\s+/i.test(cleanPrimary)) {
    const rest = cleanPrimary.replace(/^sich\s+/i, "");
    return {
      typeLabel: "Reflexive Verb (sich ...)",
      pattern: `sich ${maskWord(rest)}`,
    };
  }
  if (/\s/.test(cleanPrimary)) {
    const parts = cleanPrimary.split(/\s+/);
    return {
      typeLabel: "Expression / Phrase",
      pattern: parts.map((p) => `${p[0]}${"_".repeat(Math.max(1, p.length - 1))}`).join(" "),
    };
  }
  return {
    typeLabel: /^[A-ZÄÖÜ]/.test(cleanPrimary) ? "Noun" : "Verb / Adjective",
    pattern: maskWord(cleanPrimary),
  };
}

function buildMaskedExampleSentence(
  exampleDe: string | undefined,
  german: string
): string | null {
  if (!exampleDe?.trim()) return null;
  const primary = extractGermanVariants(german)[0] || german;
  const { core } = stripLeadingArticle(primary.replace(/\s*\(.*?\)\s*/g, ""));
  const tokens = core
    .split(/\s+/)
    .map((t) => t.replace(/[.,!?]/g, ""))
    .filter((t) => t.length >= 3);

  let masked = exampleDe;
  for (const tok of tokens) {
    const stem = tok.length > 5 ? tok.slice(0, tok.length - 2) : tok;
    const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(`\\b${escaped}[A-Za-zÄÖÜäöüß]*`, "gi");
    masked = masked.replace(rx, (match) => `${match[0]}_____`);
  }
  return masked;
}

function evaluateWrittenAnswer(
  input: string,
  targetGerman: string
): "exact" | "missing_or_wrong_article" | "wrong" {
  const userNorm = normalizeGermanAnswer(input);
  if (!userNorm) return "wrong";

  const variants = extractGermanVariants(targetGerman);
  for (const v of variants) {
    const targetNorm = normalizeGermanAnswer(v);
    if (userNorm === targetNorm) return "exact";

    const targetParts = stripLeadingArticle(targetNorm);
    const userParts = stripLeadingArticle(userNorm);
    if (
      targetParts.article &&
      userParts.core === targetParts.core
    ) {
      return userParts.article === targetParts.article
        ? "exact"
        : "missing_or_wrong_article";
    }
  }
  return "wrong";
}

function VocabMatchingTrainerInner() {
  const searchParams = useSearchParams();
  const initialCategory =
    searchParams.get("filter") || searchParams.get("category") || "all";
  const initialMode =
    searchParams.get("mode") === "write" ? "write" : "match";

  const [data, setData] = useState<PracticePoolPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainingMode, setTrainingMode] = useState<"match" | "write">(
    initialMode
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [batchSize, setBatchSize] = useState<6 | 8 | 10>(6);

  // Active Write-from-Memory Mode state
  const [writeQueue, setWriteQueue] = useState<EnrichedVocabPoolItem[]>([]);
  const [writeIdx, setWriteIdx] = useState(0);
  const [writeInput, setWriteInput] = useState("");
  const [writeHintLevel, setWriteHintLevel] = useState<0 | 1 | 2>(0);
  const [writeAnswerRevealed, setWriteAnswerRevealed] = useState(false);
  const [writeFeedback, setWriteFeedback] = useState<
    null | "exact" | "missing_or_wrong_article" | "wrong" | "revealed"
  >(null);
  const [writeSessionCorrect, setWriteSessionCorrect] = useState(0);
  const [writeSessionTotal, setWriteSessionTotal] = useState(0);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageOutput, setUsageOutput] = useState<UsageExamplesOutput | null>(
    null
  );
  const [usageCache, setUsageCache] = useState<
    Record<string, UsageExamplesOutput>
  >({});

  // Active matching round state
  const [leftItems, setLeftItems] = useState<EnrichedVocabPoolItem[]>([]);
  const [rightItems, setRightItems] = useState<EnrichedVocabPoolItem[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Record<string, boolean>>({});
  const [wrongFlash, setWrongFlash] = useState<{
    leftId: string;
    rightId: string;
  } | null>(null);
  const [lastMatchedItem, setLastMatchedItem] =
    useState<EnrichedVocabPoolItem | null>(null);
  const [roundMistakes, setRoundMistakes] = useState<Record<string, number>>(
    {}
  );
  const [roundMatchesCount, setRoundMatchesCount] = useState(0);

  // Pool manager state (add custom word / AI expand / browse pool)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGerman, setNewGerman] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newCategory, setNewCategory] = useState(
    initialCategory.startsWith("voc-") ? initialCategory : "voc-work"
  );
  const [savingWord, setSavingWord] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [showPoolList, setShowPoolList] = useState(false);
  const [poolSearch, setPoolSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const loadPool = useCallback(async () => {
    try {
      const res = await fetch("/api/practice-pool");
      if (!res.ok) throw new Error("Failed to load practice pool");
      const payload = (await res.json()) as PracticePoolPayload;
      setData(payload);
      return payload;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPool();
  }, [loadPool]);

  const filteredPool = useMemo(() => {
    const items = data?.vocabItems ?? [];
    if (categoryFilter === "all") return items;
    if (categoryFilter === "core_write") {
      return items.filter((i) => Boolean(i.isCoreMustWrite));
    }
    if (categoryFilter === "retry") {
      return items.filter(
        (i) =>
          i.stats.needsRetry ||
          i.stats.writeNeedsRetry ||
          i.stats.totalWrong > 0 ||
          (i.stats.writeWrong ?? 0) > 0
      );
    }
    if (categoryFilter === "reading_clicks") {
      return items.filter((i) => i.source === "reading_click");
    }
    if (categoryFilter === "saved") {
      return items.filter(
        (i) =>
          i.source === "memory" ||
          i.source === "custom" ||
          i.source === "ai" ||
          i.source === "reading_click"
      );
    }
    return items.filter((i) => i.categoryId === categoryFilter);
  }, [data, categoryFilter]);

  const readingClicksCount = useMemo(
    () =>
      (data?.vocabItems ?? []).filter((i) => i.source === "reading_click")
        .length,
    [data]
  );

  const coreMustWriteCount = useMemo(
    () => (data?.vocabItems ?? []).filter((i) => Boolean(i.isCoreMustWrite)).length,
    [data]
  );

  const todayKey = useMemo(() => getTodayLocalDateKey(), []);

  const retryCountTotal = useMemo(
    () =>
      (data?.vocabItems ?? []).filter(
        (i) =>
          i.stats.needsRetry ||
          i.stats.writeNeedsRetry
      ).length,
    [data]
  );

  const writeMasteredCountTotal = useMemo(
    () =>
      (data?.vocabItems ?? []).filter((i) => (i.stats.writeStreak ?? 0) >= 2)
        .length,
    [data]
  );

  const doneTodayCountTotal = useMemo(
    () =>
      (data?.vocabItems ?? []).filter(
        (i) => !isWordMultiDayMastered(i) && isWordDoneForToday(i, todayKey)
      ).length,
    [data, todayKey]
  );

  const masteredCountTotal = useMemo(
    () =>
      (data?.vocabItems ?? []).filter((i) => isWordMultiDayMastered(i)).length,
    [data]
  );

  const buildNewRound = useCallback(
    (
      sourceItems: EnrichedVocabPoolItem[],
      size: number,
      includeRestingOverride = false
    ) => {
      if (sourceItems.length === 0) {
        setLeftItems([]);
        setRightItems([]);
        setMatchedIds({});
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setLastMatchedItem(null);
        setRoundMistakes({});
        setRoundMatchesCount(0);
        return;
      }

      // Exclude words already completed 3x today (scheduled for tomorrow!) and 3-day Mastered words
      const activeToday = includeRestingOverride
        ? sourceItems
        : sourceItems.filter(
            (i) =>
              !isWordMultiDayMastered(i) && !isWordDoneForToday(i, todayKey)
          );

      if (activeToday.length === 0) {
        setLeftItems([]);
        setRightItems([]);
        setMatchedIds({});
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setLastMatchedItem(null);
        setRoundMistakes({});
        setRoundMatchesCount(0);
        return;
      }

      // Priority 1: Missed words needing immediate repeat today
      const retryWords = shuffleArray(
        activeToday.filter((i) => i.stats.needsRetry)
      );
      // Priority 2: Words already started today (1/3 or 2/3) so you finish their 3x daily set cleanly
      const inProgressToday = shuffleArray(
        activeToday.filter(
          (i) =>
            !i.stats.needsRetry &&
            getWordTodayCorrect(i, todayKey) > 0 &&
            getWordTodayCorrect(i, todayKey) < 3
        )
      ).sort(
        (a, b) =>
          getWordTodayCorrect(b, todayKey) - getWordTodayCorrect(a, todayKey)
      );
      // Priority 3: Returning words due for Day 2/3 or Day 3/3 spaced review
      const returningMultiDay = shuffleArray(
        activeToday.filter(
          (i) =>
            !i.stats.needsRetry &&
            getWordTodayCorrect(i, todayKey) === 0 &&
            getWordCompletedDays(i) > 0
        )
      );
      // Priority 4: Fresh unseen words (Day 0/3)
      const freshWords = shuffleArray(
        activeToday.filter(
          (i) =>
            !i.stats.needsRetry &&
            getWordTodayCorrect(i, todayKey) === 0 &&
            getWordCompletedDays(i) === 0
        )
      );

      const selected = [
        ...retryWords,
        ...inProgressToday,
        ...returningMultiDay,
        ...freshWords,
      ].slice(0, Math.min(size, activeToday.length));

      const shuffledLeft = shuffleArray(selected);
      let shuffledRight = shuffleArray(selected);
      // Guarantee right column is in a genuinely different order when >= 2 items
      if (
        shuffledRight.length >= 2 &&
        shuffledRight.every((item, idx) => item.id === shuffledLeft[idx].id)
      ) {
        shuffledRight = [...shuffledRight.slice(1), shuffledRight[0]];
      }

      setLeftItems(shuffledLeft);
      setRightItems(shuffledRight);
      setMatchedIds({});
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setWrongFlash(null);
      setLastMatchedItem(null);
      setRoundMistakes({});
      setRoundMatchesCount(0);
    },
    [todayKey]
  );

  const buildWriteRound = useCallback(
    (sourceItems: EnrichedVocabPoolItem[], size: number) => {
      if (sourceItems.length === 0) {
        setWriteQueue([]);
        setWriteIdx(0);
        setWriteInput("");
        setWriteHintLevel(0);
        setWriteAnswerRevealed(false);
        setWriteFeedback(null);
        setUsageOutput(null);
        setWriteSessionCorrect(0);
        setWriteSessionTotal(0);
        return;
      }

      // Priority 1: Missed words in Write Mode
      const retryWrite = shuffleArray(
        sourceItems.filter((i) => Boolean(i.stats.writeNeedsRetry))
      );
      // Priority 2: Core Must-Write Top B1 words not yet write-mastered (streak < 2)
      const coreUnmastered = shuffleArray(
        sourceItems.filter(
          (i) =>
            !i.stats.writeNeedsRetry &&
            Boolean(i.isCoreMustWrite) &&
            (i.stats.writeStreak ?? 0) < 2
        )
      );
      // Priority 3: Other unmastered words
      const otherUnmastered = shuffleArray(
        sourceItems.filter(
          (i) =>
            !i.stats.writeNeedsRetry &&
            !i.isCoreMustWrite &&
            (i.stats.writeStreak ?? 0) < 2
        )
      );
      // Priority 4: Mastered review words
      const masteredWrite = shuffleArray(
        sourceItems.filter((i) => (i.stats.writeStreak ?? 0) >= 2)
      );

      const ordered = [
        ...retryWrite,
        ...coreUnmastered,
        ...otherUnmastered,
        ...masteredWrite,
      ].slice(0, Math.min(Math.max(size, 8), sourceItems.length));

      setWriteQueue(ordered);
      setWriteIdx(0);
      setWriteInput("");
      setWriteHintLevel(0);
      setWriteAnswerRevealed(false);
      setWriteFeedback(null);
      setUsageOutput(null);
      setWriteSessionCorrect(0);
      setWriteSessionTotal(0);
    },
    []
  );

  // Build initial round when pool loads or filter/batchSize/mode changes
  useEffect(() => {
    if (!data) return;
    buildNewRound(filteredPool, batchSize);
    buildWriteRound(filteredPool, batchSize);
    if (categoryFilter.startsWith("voc-")) {
      setNewCategory(categoryFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(data), categoryFilter, batchSize]);

  async function recordWriteOutcome(
    item: EnrichedVocabPoolItem,
    correct: boolean,
    usedAnswerReveal: boolean
  ) {
    try {
      const res = await fetch("/api/practice-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_vocab_write_result",
          wordId: item.id,
          categoryId: item.categoryId,
          correct,
          usedAnswerReveal,
        }),
      });
      if (!res.ok) return;
      const result = await res.json();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          readiness: result.readiness ?? prev.readiness,
          vocabCategories: result.vocabCategories ?? prev.vocabCategories,
          vocabItems: prev.vocabItems.map((w) =>
            w.id === item.id ? { ...w, stats: result.stats } : w
          ),
        };
      });
    } catch {
      // ignore transient error
    }
  }

  async function handleFetchWordUsage(item: EnrichedVocabPoolItem) {
    const cacheKey = item.id;
    if (usageCache[cacheKey]) {
      setUsageOutput(usageCache[cacheKey]);
      return;
    }
    setUsageLoading(true);
    try {
      const res = await fetch("/api/practice-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "vocab_usage_examples",
          german: item.german,
          translation: item.translation,
          exampleDe: item.exampleDe,
        }),
      });
      const out = await res.json();
      if (res.ok && out.usage) {
        setUsageOutput(out.usage);
        setUsageCache((prev) => ({ ...prev, [cacheKey]: out.usage }));
      }
    } finally {
      setUsageLoading(false);
    }
  }

  function handleCheckWriteAnswer(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const currentWord = writeQueue[writeIdx];
    if (!currentWord || !writeInput.trim()) return;

    const verdict = evaluateWrittenAnswer(writeInput, currentWord.german);
    setWriteFeedback(verdict);

    if (verdict === "exact") {
      setWriteSessionTotal((t) => t + 1);
      if (!writeAnswerRevealed) {
        setWriteSessionCorrect((c) => c + 1);
      }
      void recordWriteOutcome(currentWord, true, writeAnswerRevealed);
    } else if (verdict === "wrong") {
      setWriteSessionTotal((t) => t + 1);
      void recordWriteOutcome(currentWord, false, writeAnswerRevealed);
    }
    // For "missing_or_wrong_article", let them immediately fix the article and re-check without locking!
  }

  function handleRevealWriteAnswer() {
    const currentWord = writeQueue[writeIdx];
    if (!currentWord) return;
    setWriteAnswerRevealed(true);
    setWriteFeedback("revealed");
    setWriteSessionTotal((t) => t + 1);
    void recordWriteOutcome(currentWord, false, true);
  }

  function handleAdvanceWriteWord() {
    setWriteIdx((i) => i + 1);
    setWriteInput("");
    setWriteHintLevel(0);
    setWriteAnswerRevealed(false);
    setWriteFeedback(null);
    setUsageOutput(null);
  }

  async function recordWordOutcome(item: EnrichedVocabPoolItem, correct: boolean) {
    try {
      const res = await fetch("/api/practice-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_vocab_result",
          wordId: item.id,
          categoryId: item.categoryId,
          correct,
          localDate: todayKey,
        }),
      });
      if (!res.ok) return;
      const result = await res.json();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          readiness: result.readiness ?? prev.readiness,
          vocabCategories: result.vocabCategories ?? prev.vocabCategories,
          vocabItems: prev.vocabItems.map((w) =>
            w.id === item.id ? { ...w, stats: result.stats } : w
          ),
        };
      });
    } catch {
      // ignore transient error
    }
  }

  function evaluatePair(leftId: string, rightId: string) {
    const leftItem = leftItems.find((i) => i.id === leftId);
    if (!leftItem) return;

    if (leftId === rightId) {
      // Correct match!
      setMatchedIds((prev) => ({ ...prev, [leftId]: true }));
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setWrongFlash(null);
      setLastMatchedItem(leftItem);
      setRoundMatchesCount((c) => c + 1);

      const hadMistakeInThisRound = Boolean(roundMistakes[leftId]);
      // Only increment consecutive mastery streak if matched cleanly without guessing wrong on it first
      if (!hadMistakeInThisRound) {
        void recordWordOutcome(leftItem, true);
      }
    } else {
      // Wrong match! Flash rose, reset streak & mark for repeat
      setWrongFlash({ leftId, rightId });
      setRoundMistakes((prev) => ({
        ...prev,
        [leftId]: (prev[leftId] ?? 0) + 1,
      }));
      void recordWordOutcome(leftItem, false);

      setTimeout(() => {
        setWrongFlash(null);
        setSelectedLeftId(null);
        setSelectedRightId(null);
      }, 600);
    }
  }

  function handleClickLeft(item: EnrichedVocabPoolItem) {
    if (matchedIds[item.id] || wrongFlash) return;
    if (selectedRightId) {
      evaluatePair(item.id, selectedRightId);
    } else {
      setSelectedLeftId((prev) => (prev === item.id ? null : item.id));
    }
  }

  function handleClickRight(item: EnrichedVocabPoolItem) {
    if (matchedIds[item.id] || wrongFlash) return;
    if (selectedLeftId) {
      evaluatePair(selectedLeftId, item.id);
    } else {
      setSelectedRightId((prev) => (prev === item.id ? null : item.id));
    }
  }

  async function handleAddCustomWord(e: React.FormEvent) {
    e.preventDefault();
    if (!newGerman.trim() || !newTranslation.trim()) return;
    setSavingWord(true);
    setNotice(null);
    try {
      const res = await fetch("/api/practice-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_vocab",
          german: newGerman.trim(),
          translation: newTranslation.trim(),
          categoryId: newCategory,
          exampleDe: newExample.trim() || undefined,
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Failed to add word");
      setData((prev) =>
        prev ? { ...prev, vocabItems: out.vocabItems } : prev
      );
      setNewGerman("");
      setNewTranslation("");
      setNewExample("");
      setNotice(`Added „${out.item.german}“ to your Vocab Pool!`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not add word");
    } finally {
      setSavingWord(false);
    }
  }

  async function handleGenerateAiWords() {
    const targetCat = categoryFilter.startsWith("voc-")
      ? categoryFilter
      : newCategory;
    setGeneratingAi(true);
    setNotice(null);
    try {
      const res = await fetch("/api/practice-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_more_vocab",
          categoryId: targetCat,
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "AI generation failed");
      setData((prev) =>
        prev ? { ...prev, vocabItems: out.vocabItems } : prev
      );
      const catName =
        B1_VOCAB_CATEGORIES_META.find((c) => c.id === targetCat)?.titleDe ??
        targetCat;
      setNotice(
        `Added +${out.addedCount} fresh ${data?.targetLevel ?? "B1"} words to „${catName}“! Click Refresh Batch to train them.`
      );
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Could not generate words"
      );
    } finally {
      setGeneratingAi(false);
    }
  }

  async function handleDeleteCustomWord(wordId: string) {
    try {
      const res = await fetch("/api/practice-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_custom_vocab", wordId }),
      });
      const out = await res.json();
      if (res.ok && out.vocabItems) {
        setData((prev) =>
          prev ? { ...prev, vocabItems: out.vocabItems } : prev
        );
      }
    } catch {
      // ignore
    }
  }

  function speakWord(text: string) {
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

  const isRoundComplete =
    leftItems.length > 0 && roundMatchesCount >= leftItems.length;
  const roundMissedCount = Object.keys(roundMistakes).length;

  const browsableItems = filteredPool.filter((item) => {
    if (!poolSearch.trim()) return true;
    const q = poolSearch.trim().toLowerCase();
    return (
      item.german.toLowerCase().includes(q) ||
      item.translation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
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
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Exercise Mode · {data.targetLevel} Vocabulary Matching Pool
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Match German Words &amp; Translations
            </h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              Match each German word <strong>3× cleanly today</strong> to
              schedule it for tomorrow (won&apos;t repeat again today!). Complete
              across <strong>3 separate days</strong> to mark it permanently
              mastered — missed words always repeat first.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/train/reading"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reading Practice →</span>
          </Link>
          <Link
            href="/train/grammar"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Grammar Trainer →</span>
          </Link>
          <Link
            href="/progress"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            <span>
              Topics Trained: {data.readiness.topicsTrainedCount}/
              {data.readiness.totalTopicsCount}
            </span>
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

      {/* Stats + Difficulty Mode Switcher + Topic Category Filter Pills */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-4 sm:p-5 space-y-3.5 shadow-xs">
        {/* Mode Switcher: Match Pairs vs. Write from Memory (Hard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setTrainingMode("match")}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg transition cursor-pointer ${
              trainingMode === "match"
                ? "bg-zinc-900 text-amber-300 shadow-xs"
                : "text-zinc-700 hover:text-zinc-900"
            }`}
          >
            <Shuffle className="w-4 h-4 shrink-0" />
            <span>Mode 1: Match Pairs (Fast Recognition)</span>
          </button>
          <button
            type="button"
            onClick={() => setTrainingMode("write")}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg transition cursor-pointer ${
              trainingMode === "write"
                ? "bg-zinc-900 text-amber-300 shadow-xs"
                : "text-zinc-700 hover:text-zinc-900"
            }`}
          >
            <PenTool className="w-4 h-4 shrink-0" />
            <span>Mode 2: Write from Memory (Hard · Top B1 Production)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-amber-300 font-bold">
              Pool Size: {data.vocabItems.length} words
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
              ✓ Mastered (3 days): {masteredCountTotal}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 font-bold">
              📅 Done Today (Next Day): {doneTodayCountTotal}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold">
              ✍️ Written (2×): {writeMasteredCountTotal}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full font-bold border ${
                retryCountTotal > 0
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600"
              }`}
            >
              🔥 Needs Repeat: {retryCountTotal}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Word</span>
            </button>
            <button
              type="button"
              onClick={handleGenerateAiWords}
              disabled={generatingAi}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 cursor-pointer disabled:opacity-50"
            >
              {generatingAi ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>
                {generatingAi ? "Generating +10…" : "+10 AI B1 Words"}
              </span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
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
            All Topics ({data.vocabItems.length})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("core_write")}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              categoryFilter === "core_write"
                ? "bg-amber-400 text-zinc-950 border-amber-500"
                : "bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300"
            }`}
            title="Top high-frequency Goethe B1 words you must be able to spell and write from memory"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Must-Write Top {data.targetLevel} ({coreMustWriteCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("retry")}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              categoryFilter === "retry"
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Needs Retry ({retryCountTotal})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("reading_clicks")}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              categoryFilter === "reading_clicks"
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300"
            }`}
            title="Train ONLY the words & expressions you clicked and saved while reading B1 articles"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Clicked in Reading ({readingClicksCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter("saved")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              categoryFilter === "saved"
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-200"
            }`}
          >
            My Saved &amp; Added (
            {
              data.vocabItems.filter(
                (i) =>
                  i.source === "memory" ||
                  i.source === "custom" ||
                  i.source === "ai" ||
                  i.source === "reading_click"
              ).length
            }
            )
          </button>

          {B1_VOCAB_CATEGORIES_META.map((cat) => {
            const catCount = data.vocabItems.filter(
              (i) => i.categoryId === cat.id
            ).length;
            const catProgress =
              data.vocabCategories.find((v) => v.id === cat.id)?.progressPct ??
              0;
            const active = categoryFilter === cat.id;
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
                {cat.titleDe.split(",")[0]} ({catCount}) ·{" "}
                <span className={active ? "text-amber-300" : "text-teal-700"}>
                  {catProgress}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Manual Quick-Add Vocab Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomWord}
            className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3"
          >
            <div className="text-xs font-bold text-zinc-900">
              Add a New Word to Your Persistent Vocab Pool
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                value={newGerman}
                onChange={(e) => setNewGerman(e.target.value)}
                placeholder="German (e.g. die Vereinbarung)"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <input
                value={newTranslation}
                onChange={(e) => setNewTranslation(e.target.value)}
                placeholder="Translation (e.g. agreement)"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {B1_VOCAB_CATEGORIES_META.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titleDe}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                placeholder="Optional German example sentence..."
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={savingWord}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 cursor-pointer disabled:opacity-50"
              >
                {savingWord ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Save to Pool</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* MODE 1: INTERACTIVE MATCH-PAIRS BOARD */}
      {trainingMode === "match" && (
        <section className="rounded-2xl bg-white border border-zinc-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-zinc-900">
              Match Pairs ({roundMatchesCount} / {leftItems.length} connected)
            </div>
            <div className="text-[11px] text-zinc-500">
              Click one German word on the left, then click its matching
              translation on the right.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-xl bg-zinc-100 p-0.5 text-[11px] font-bold">
              {([6, 8, 10] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setBatchSize(sz)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    batchSize === sz
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {sz} pairs
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => buildNewRound(filteredPool, batchSize)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold px-3.5 py-2 transition cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Refresh New Batch</span>
            </button>
          </div>
        </div>

        {leftItems.length === 0 ? (
          <div className="rounded-xl bg-emerald-50/60 border border-dashed border-emerald-300 p-8 text-center space-y-3">
            <p className="text-sm font-bold text-emerald-950">
              {categoryFilter === "retry"
                ? "Zero words in Needs Retry! You've cleared all past mistakes."
                : categoryFilter === "reading_clicks" && filteredPool.length === 0
                ? "No clicked reading words saved yet — click any German word in the Reading Studio and press '+ Add to Reading Vocab Pool'!"
                : filteredPool.length > 0
                ? "🎉 All words in this filter are done for today (or mastered across 3 days)!"
                : "No words in this filter yet."}
            </p>
            {categoryFilter === "reading_clicks" && filteredPool.length === 0 && (
              <div className="pt-1">
                <Link
                  href="/train/reading"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open B1 Reading Practice Studio →</span>
                </Link>
              </div>
            )}
            {filteredPool.length > 0 && categoryFilter !== "retry" && (
              <p className="text-xs text-emerald-900 max-w-lg mx-auto">
                Words you matched 3× today are resting until tomorrow so you
                build real multi-day memory. Switch to another topic, add +10 AI
                words, or practice extra review below.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold px-4 py-2 cursor-pointer"
              >
                <span>Train All Remaining Topics</span>
              </button>
              {filteredPool.length > 0 && (
                <button
                  type="button"
                  onClick={() => buildNewRound(filteredPool, batchSize, true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-950 text-xs font-semibold px-4 py-2 cursor-pointer"
                >
                  <span>Extra Review Anyway</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Last Matched Example Sentence Toast */}
            {lastMatchedItem && !isRoundComplete && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-emerald-900">
                    ✓ {lastMatchedItem.german} = {lastMatchedItem.translation}
                  </span>
                  {lastMatchedItem.exampleDe && (
                    <span className="block text-emerald-800 mt-0.5 italic">
                      „{lastMatchedItem.exampleDe}“
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speakWord(
                      lastMatchedItem.exampleDe || lastMatchedItem.german
                    )
                  }
                  className="p-1.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-900 cursor-pointer shrink-0"
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 2-Column Matching Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEFT COLUMN: GERMAN WORDS */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-1">
                  German (Deutsch)
                </div>
                {leftItems.map((item) => {
                  const isMatched = Boolean(matchedIds[item.id]);
                  const isSelected = selectedLeftId === item.id;
                  const isWrong = wrongFlash?.leftId === item.id;
                  const liveItem =
                    data.vocabItems.find((w) => w.id === item.id) ?? item;
                  const todayCount = getWordTodayCorrect(liveItem, todayKey);
                  const daysDone = getWordCompletedDays(liveItem);
                  const multiDayMastered = isWordMultiDayMastered(liveItem);

                  return (
                    <div
                      key={item.id}
                      className={`w-full rounded-xl border px-3.5 py-3 flex items-center justify-between gap-2 transition ${
                        isMatched
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-900 opacity-75"
                          : isWrong
                          ? "bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-200"
                          : isSelected
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-sm ring-2 ring-amber-400"
                          : "bg-zinc-50/80 hover:bg-amber-50/60 border-zinc-200 hover:border-amber-300 text-zinc-900"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={isMatched}
                        onClick={() => handleClickLeft(item)}
                        className="flex-1 text-left cursor-pointer disabled:cursor-default min-w-0"
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-sm">
                            {item.german}
                          </span>
                          {liveItem.stats.needsRetry && !isMatched && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? "bg-rose-500 text-white"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              Repeat
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {/* Today's 3-Dot Progress Indicator */}
                          <span
                            className="inline-flex items-center gap-0.5"
                            title={`Today: ${Math.min(3, todayCount)}/3 correct matches (rests until tomorrow after 3×)`}
                          >
                            {[1, 2, 3].map((dot) => (
                              <span
                                key={dot}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  todayCount >= dot
                                    ? isSelected
                                      ? "bg-amber-400"
                                      : "bg-emerald-500"
                                    : isSelected
                                    ? "bg-white/25"
                                    : "bg-zinc-300"
                                }`}
                              />
                            ))}
                          </span>
                          <span
                            className={`text-[10px] ${
                              isSelected ? "text-zinc-300" : "text-zinc-500"
                            }`}
                          >
                            {todayCount >= 3
                              ? "Done today → Next day"
                              : `Today ${todayCount}/3`}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              multiDayMastered
                                ? "bg-emerald-100 text-emerald-800"
                                : daysDone > 0
                                ? isSelected
                                  ? "bg-amber-400/20 text-amber-200"
                                  : "bg-teal-50 text-teal-800 border border-teal-200"
                                : isSelected
                                ? "bg-white/10 text-zinc-300"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {multiDayMastered
                              ? "✓ Mastered (3d)"
                              : `Day ${daysDone}/3`}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(item.german);
                          }}
                          className={`p-1.5 rounded-lg border cursor-pointer transition ${
                            isSelected
                              ? "bg-white/10 border-white/20 text-amber-300 hover:bg-white/20"
                              : "bg-white border-zinc-200 text-zinc-600 hover:bg-amber-50"
                          }`}
                          title="Listen pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        {isMatched && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                        {isWrong && (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: SHUFFLED TRANSLATIONS */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-1">
                  Translation (Shuffled Order)
                </div>
                {rightItems.map((item) => {
                  const isMatched = Boolean(matchedIds[item.id]);
                  const isSelected = selectedRightId === item.id;
                  const isWrong = wrongFlash?.rightId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleClickRight(item)}
                      className={`w-full text-left rounded-xl border px-3.5 py-3.5 flex items-center justify-between gap-2 transition cursor-pointer disabled:cursor-default ${
                        isMatched
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-900 opacity-75"
                          : isWrong
                          ? "bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-200"
                          : isSelected
                          ? "bg-indigo-700 border-indigo-700 text-white shadow-sm ring-2 ring-amber-400"
                          : "bg-white hover:bg-indigo-50/60 border-zinc-200 hover:border-indigo-300 text-zinc-800"
                      }`}
                    >
                      <span className="font-semibold text-sm">
                        {item.translation}
                      </span>
                      {isMatched && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isWrong && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Round Completed Banner */}
            {isRoundComplete && (
              <div className="rounded-2xl bg-zinc-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Round Complete!</span>
                  </div>
                  <div className="text-base font-bold">
                    {roundMissedCount === 0
                      ? "Perfect round — every word matched cleanly on the first try!"
                      : `Matched all ${leftItems.length} pairs (${roundMissedCount} missed word${roundMissedCount === 1 ? "" : "s"} queued to reappear until matched 3× cleanly).`}
                  </div>
                  <div className="text-xs text-zinc-300">
                    Overall Exam Readiness: {data.readiness.overallReadiness}% ·
                    Topics Trained: {data.readiness.topicsTrainedCount}/
                    {data.readiness.totalTopicsCount}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => buildNewRound(filteredPool, batchSize)}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm px-5 py-3 transition cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Next Round (Repeats First) →</span>
                </button>
              </div>
            )}
          </>
        )}
        </section>
      )}

      {/* MODE 2: WRITE FROM MEMORY (HARD · MUST-WRITE TOP B1 WORDS + SIDE COACH FOR TIPS, ANSWER & SENTENCE USAGE) */}
      {trainingMode === "write" &&
        (() => {
          const currentWord = writeQueue[writeIdx];
          const isWriteRoundDone =
            writeQueue.length > 0 && writeIdx >= writeQueue.length;
          const liveWord = currentWord
            ? data.vocabItems.find((w) => w.id === currentWord.id) ?? currentWord
            : null;
          const hintInfo = currentWord
            ? buildLetterPatternHint(currentWord.german)
            : null;
          const maskedSentence = currentWord
            ? buildMaskedExampleSentence(
                currentWord.exampleDe,
                currentWord.german
              )
            : null;
          const catTitle = currentWord
            ? B1_VOCAB_CATEGORIES_META.find(
                (c) => c.id === currentWord.categoryId
              )?.titleDe ?? currentWord.categoryId
            : "";
          const canAdvance =
            writeFeedback === "exact" ||
            writeFeedback === "wrong" ||
            writeFeedback === "revealed";

          return (
            <section className="space-y-4">
              {writeQueue.length === 0 ? (
                <div className="rounded-2xl bg-white border border-dashed border-zinc-300 p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-zinc-800">
                    No words in this filter for Write Mode yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("core_write")}
                    className="rounded-xl bg-zinc-900 text-white text-xs font-semibold px-4 py-2 cursor-pointer"
                  >
                    Practice Must-Write Top {data.targetLevel} Words
                  </button>
                </div>
              ) : isWriteRoundDone ? (
                <div className="rounded-2xl bg-zinc-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Write-from-Memory Round Complete!</span>
                    </div>
                    <div className="text-lg font-bold">
                      Clean Recalls: {writeSessionCorrect} / {writeSessionTotal}
                    </div>
                    <p className="text-xs text-zinc-300">
                      Any missed or revealed words are queued to repeat until
                      you write them cleanly 2× in a row. Overall Exam
                      Readiness: {data.readiness.overallReadiness}%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => buildWriteRound(filteredPool, batchSize)}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm px-5 py-3 transition cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Start Next Write Round →</span>
                  </button>
                </div>
              ) : (
                currentWord &&
                liveWord && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* LEFT: ACTIVE WRITING CHALLENGE */}
                    <div className="lg:col-span-7 rounded-2xl bg-white border border-zinc-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-amber-300 font-bold">
                            Word {writeIdx + 1} / {writeQueue.length}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold">
                            {catTitle.split(",")[0]}
                          </span>
                          {currentWord.isCoreMustWrite && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 font-bold text-[10px]">
                              ★ Must-Write {data.targetLevel}
                            </span>
                          )}
                          {liveWord.stats.writeNeedsRetry && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              Repeat Until 2× Clean
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-zinc-500">
                            Write Streak:{" "}
                            <strong className="text-zinc-900">
                              {liveWord.stats.writeStreak ?? 0}/2
                            </strong>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              buildWriteRound(filteredPool, batchSize)
                            }
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                            title="Shuffle a new batch"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Translation Prompt */}
                      <div className="rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-teal-50/50 border border-amber-200/80 p-5 space-y-1.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                          Write the German word (include article for nouns):
                        </div>
                        <div className="text-xl sm:text-2xl font-extrabold text-zinc-950">
                          {currentWord.translation}
                        </div>
                        {hintInfo && (
                          <div className="text-xs text-zinc-600">
                            Type:{" "}
                            <strong className="text-zinc-800">
                              {hintInfo.typeLabel.replace(
                                /\(Article:.*?\)/,
                                "(Noun — include der/die/das)"
                              )}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Input Box + Quick Umlaut Bar */}
                      <form onSubmit={handleCheckWriteAnswer} className="space-y-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-zinc-500 mr-1">
                            Umlauts:
                          </span>
                          {["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"].map((ch) => (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => setWriteInput((prev) => prev + ch)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 border border-zinc-200 text-xs font-bold text-zinc-900 cursor-pointer"
                            >
                              {ch}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            value={writeInput}
                            onChange={(e) => setWriteInput(e.target.value)}
                            disabled={canAdvance}
                            autoFocus
                            placeholder="Type German word here (e.g. die Bewerbung)..."
                            className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white px-4 py-3 text-base font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-70"
                          />
                          {!canAdvance ? (
                            <button
                              type="submit"
                              disabled={!writeInput.trim()}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold px-5 py-3 transition cursor-pointer disabled:opacity-40 shrink-0"
                            >
                              <CheckCircle2 className="w-4 h-4 text-amber-400" />
                              <span>Check</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleAdvanceWriteWord}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-bold px-5 py-3 transition cursor-pointer shrink-0"
                            >
                              <span>
                                {writeIdx + 1 >= writeQueue.length
                                  ? "Finish Round"
                                  : "Next Word"}
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </form>

                      {/* Feedback Banner */}
                      {writeFeedback === "exact" && (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>
                                Richtig! „{currentWord.german}“
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => speakWord(currentWord.german)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-900 font-semibold cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </button>
                          </div>
                          {currentWord.exampleDe && (
                            <div className="flex items-center justify-between gap-2 text-emerald-900 italic">
                              <span>„{currentWord.exampleDe}“</span>
                              <button
                                type="button"
                                onClick={() =>
                                  speakWord(currentWord.exampleDe!)
                                }
                                className="p-1 rounded hover:bg-emerald-100 cursor-pointer shrink-0"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {writeFeedback === "missing_or_wrong_article" && (
                        <div className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-950 space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            <span>
                              Right word! Check the article (der / die / das) and
                              submit again:
                            </span>
                          </div>
                          <p className="text-amber-900">
                            Hint: Try typing the article in front of the noun
                            (or click <strong>Show Answer</strong> on the right).
                          </p>
                        </div>
                      )}

                      {(writeFeedback === "wrong" ||
                        writeFeedback === "revealed") && (
                        <div className="rounded-xl bg-rose-50 border border-rose-300 p-4 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-bold text-rose-950 text-sm flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>
                                Correct German: „{currentWord.german}“
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => speakWord(currentWord.german)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-rose-200 hover:bg-rose-100 text-rose-900 font-semibold cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </button>
                          </div>
                          {currentWord.exampleDe && (
                            <p className="text-rose-900 italic">
                              „{currentWord.exampleDe}“
                            </p>
                          )}
                          <p className="text-[11px] text-rose-800">
                            Queued in <strong>Needs Repeat</strong> — this word
                            will come back until you write it cleanly 2× in a
                            row.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT: SIDE COACH PANEL (TIPS, REVEAL ANSWER & SENTENCE USAGE) */}
                    <div className="lg:col-span-5 rounded-2xl bg-white border border-zinc-200/90 p-5 space-y-3.5 shadow-xs text-xs">
                      <div className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Side Coach · Tips, Answer &amp; Sentence Usage</span>
                      </div>

                      {/* 3 Action Buttons on the Side */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setWriteHintLevel((lvl) =>
                              lvl === 0 ? 1 : lvl === 1 ? 2 : 2
                            )
                          }
                          disabled={writeHintLevel >= 2}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold px-3 py-2 cursor-pointer disabled:opacity-50"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            {writeHintLevel === 0
                              ? "Get Tip (First Letter)"
                              : writeHintLevel === 1
                              ? "More Tip (Context Clue)"
                              : "All Tips Shown"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleFetchWordUsage(currentWord)}
                          disabled={usageLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-950 font-bold px-3 py-2 cursor-pointer disabled:opacity-50"
                        >
                          {usageLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                          )}
                          <span>How to Use in Sentences</span>
                        </button>

                        {!canAdvance && (
                          <button
                            type="button"
                            onClick={handleRevealWriteAnswer}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 font-bold px-3 py-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Show Answer</span>
                          </button>
                        )}
                      </div>

                      {/* Progressive Tips Output */}
                      {writeHintLevel >= 1 && hintInfo && (
                        <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                            Tip 1 · Word Pattern &amp; Article
                          </div>
                          <div className="text-sm font-mono font-bold text-amber-950">
                            {hintInfo.pattern}
                          </div>
                          <div className="text-[11px] text-amber-900">
                            {hintInfo.typeLabel}
                          </div>
                        </div>
                      )}

                      {writeHintLevel >= 2 && (
                        <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900">
                              Tip 2 · Context Sentence Clue
                            </span>
                            <button
                              type="button"
                              onClick={() => speakWord(currentWord.german)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-900 cursor-pointer"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Hear Word</span>
                            </button>
                          </div>
                          <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                            {maskedSentence
                              ? `„${maskedSentence}“`
                              : `Think of the German ${data.targetLevel} word for „${currentWord.translation}“.`}
                          </p>
                        </div>
                      )}

                      {/* Sentence Usage Guide (Cached Permanently in DB!) */}
                      {usageOutput && (
                        <div className="rounded-xl bg-teal-50/70 border border-teal-200 p-3.5 space-y-2.5">
                          <div className="font-bold text-teal-950">
                            {usageOutput.title}
                          </div>
                          <p className="text-zinc-700 leading-relaxed">
                            {usageOutput.body}
                          </p>

                          {usageOutput.sentenceBreakdowns &&
                            usageOutput.sentenceBreakdowns.length > 0 && (
                              <div className="space-y-1.5">
                                {usageOutput.sentenceBreakdowns.map(
                                  (sb, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded-lg bg-white border border-teal-200/80 px-2.5 py-2 space-y-0.5"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="font-semibold text-zinc-900 leading-snug">
                                          {sb.german}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => speakWord(sb.german)}
                                          className="p-1 rounded hover:bg-teal-50 text-teal-800 cursor-pointer shrink-0"
                                          title="Listen"
                                        >
                                          <Volume2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      <div className="text-[11px] text-zinc-600">
                                        {sb.translation}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                          {usageOutput.grammarNotes &&
                            usageOutput.grammarNotes.length > 0 && (
                              <div className="space-y-1">
                                {usageOutput.grammarNotes.map((g, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-lg bg-indigo-50/70 border border-indigo-200 px-2.5 py-1.5"
                                  >
                                    <span className="font-bold text-indigo-950">
                                      {g.pattern}:{" "}
                                    </span>
                                    <span className="text-zinc-700">
                                      {g.explanation}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      )}

                      {writeHintLevel === 0 && !usageOutput && !canAdvance && (
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          Try recalling and spelling the German word on the left
                          first. Stuck? Use <strong>Get Tip</strong> for the
                          article &amp; letter pattern,{" "}
                          <strong>How to Use in Sentences</strong> for real{" "}
                          {data.targetLevel} usage examples, or{" "}
                          <strong>Show Answer</strong> to learn it and repeat it
                          later.
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </section>
          );
        })()}

      {/* Collapsible Full Vocab Pool Browser */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-sm text-zinc-900">
              Manage Vocab Pool ({filteredPool.length} words in current filter)
            </h2>
            <p className="text-xs text-zinc-500">
              See every word&apos;s mastery streak, repeat queue status, or
              remove custom entries.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPoolList((v) => !v)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer"
          >
            {showPoolList ? "Hide Pool List" : "Browse All Words"}
          </button>
        </div>

        {showPoolList && (
          <div className="space-y-3 pt-2 border-t border-zinc-100">
            <input
              value={poolSearch}
              onChange={(e) => setPoolSearch(e.target.value)}
              placeholder="Search German word or translation..."
              className="w-full sm:w-80 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
              {browsableItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-900 truncate">
                        {item.german}
                      </span>
                      {item.stats.needsRetry && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                          Repeat
                        </span>
                      )}
                      {isWordMultiDayMastered(item) ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          ✓ Mastered (3d)
                        </span>
                      ) : isWordDoneForToday(item, todayKey) ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-900">
                          Done today · Day {getWordCompletedDays(item)}/3
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-200/80 text-zinc-700">
                          Today {getWordTodayCorrect(item, todayKey)}/3 · Day{" "}
                          {getWordCompletedDays(item)}/3
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-600 truncate">
                      {item.translation}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => speakWord(item.german)}
                      className="p-1 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 text-zinc-700 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {(item.source === "custom" || item.source === "ai") && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomWord(item.id)}
                        className="p-1 rounded-lg bg-white border border-zinc-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        title="Remove from pool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function VocabMatchingPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-64 bg-zinc-200 rounded-xl" />
          <div className="h-64 bg-zinc-200 rounded-2xl" />
        </div>
      }
    >
      <VocabMatchingTrainerInner />
    </Suspense>
  );
}
