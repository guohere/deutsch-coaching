"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  Languages,
  Loader2,
  MessageSquareQuote,
  MousePointerClick,
  PenTool,
  Plus,
  RefreshCw,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import {
  InteractiveGermanText,
  InteractiveSelectionPayload,
} from "@/components/InteractiveGermanText";
import { DrillAssistResult } from "@/lib/ai/drills";
import {
  ReadingArticle,
  ReadingGlossaryEntry,
} from "@/lib/reading-articles-bank";
import { speakGerman, stopSpeaking } from "@/lib/speech";
import { SkillDrillExercise } from "@/lib/types";
import {
  B1_VOCAB_CATEGORIES_META,
  VocabPoolItem,
} from "@/lib/vocab-grammar-bank";

interface EnrichedReadingVocabItem extends VocabPoolItem {
  stats?: {
    correctStreak: number;
    totalCorrect: number;
    totalWrong: number;
    needsRetry: boolean;
    mastered?: boolean;
  };
}

interface ReadingPracticePayload {
  articles: ReadingArticle[];
  readArticleIds: string[];
  readingVocabItems: EnrichedReadingVocabItem[];
  allSavedGermanWords: string[];
  vocabCategories: Array<{
    id: string;
    titleDe: string;
    titleEn: string;
    progressPct: number;
  }>;
  targetLevel: string;
  aiConfig: {
    ttsProvider: "edge_neural" | "gemini_tts" | "browser";
    edgeVoice: string;
    geminiTtsVoice: string;
    voiceRate: number;
    preferredVoiceName: string;
  };
}

interface InspectorView {
  kind: "glossary_instant" | "ai_selection";
  selectedText: string;
  surroundingSentence: string;
  selectionType: "word" | "phrase" | "sentence";
  cached?: boolean;
  sourceBadge?: string;
  isWebDictFallback?: boolean;
  contextNote?: string;
  examples?: Array<{ de: string; en?: string }>;
  // For instant glossary / fast word lookup
  glossaryEntry?: ReadingGlossaryEntry;
  // For AI / cached sentence assist lookup
  assistResult?: DrillAssistResult;
  // Primary word candidate for one-click "+ Add to Reading Vocab Pool"
  saveCandidate?: {
    german: string;
    translation: string;
    exampleDe?: string;
  };
}

function normalizeGermanKey(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/^(der|die|das|ein|eine|einen|einem|einer)\s+/i, "")
    .replace(/[.,!?;:„“"()]/g, "")
    .trim();
}

function matchGlossaryEntry(
  clickedWord: string,
  glossary: ReadingGlossaryEntry[]
): ReadingGlossaryEntry | null {
  const clean = clickedWord
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:„“"()]/g, "");
  if (!clean) return null;

  for (const entry of glossary) {
    const w = entry.word.toLowerCase().replace(/[.,!?;:„“"()]/g, "");
    const baseClean = normalizeGermanKey(entry.baseForm.split(",")[0].split("(")[0]);
    if (w === clean || baseClean === clean) return entry;
    if (w.split(/\s+/).some((tok) => tok === clean)) return entry;
  }
  return null;
}

function extractSaveCandidateFromAssist(
  sel: InteractiveSelectionPayload,
  result: DrillAssistResult
): { german: string; translation: string; exampleDe?: string } | undefined {
  // Prefer the first difficultWord entry if this was a single-word or short-phrase click
  if (
    sel.selectionType !== "sentence" &&
    result.difficultWords &&
    result.difficultWords.length > 0
  ) {
    const first = result.difficultWords[0];
    if (first.german?.trim() && first.translation?.trim()) {
      return {
        german: first.german.trim(),
        translation: first.translation.trim(),
        exampleDe: sel.surroundingSentence,
      };
    }
  }
  if (sel.selectionType === "word") {
    // Fallback: extract clean concise meaning from body
    const firstLine = (result.body || "").split(/[\n.]/)[0]?.trim() || "";
    const cleanedMeaning = firstLine
      .replace(/^["„“][^"„“]+["„“]\s*(means|ist|bedeutet|:|-)\s*/i, "")
      .trim();
    if (cleanedMeaning) {
      return {
        german: sel.selectedText.trim(),
        translation: cleanedMeaning.slice(0, 120),
        exampleDe: sel.surroundingSentence,
      };
    }
  }
  return undefined;
}

function buildSyntheticExercise(article: ReadingArticle): SkillDrillExercise {
  const catMeta = B1_VOCAB_CATEGORIES_META.find(
    (c) => c.id === article.categoryId
  );
  return {
    id: article.id,
    skill: "lesen",
    level: (article.level as SkillDrillExercise["level"]) || "B1",
    topicDe: catMeta?.titleDe ?? "Lesetraining",
    topicEn: catMeta?.titleEn ?? "Reading Practice",
    vocabCategoryId: article.categoryId,
    title: article.titleDe,
    examPartLabel: `Lesetraining (${article.level})`,
    instructions: "Interactive B1 Reading Practice",
    source: "verified_bank",
    sourceCredit: article.sourceStyle,
    passageDe: article.paragraphs.map((p) => p.de).join("\n\n"),
    keyVocab: article.glossary.map((g) => ({
      german: g.baseForm,
      meaning: g.meaningEn,
    })),
  };
}

function ReadingPracticeStudioInner() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [data, setData] = useState<ReadingPracticePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  // Reader interaction states
  const [clickMode, setClickMode] = useState<"word" | "sentence">("word");
  const [showTranslations, setShowTranslations] = useState(false);
  const [speakingArticle, setSpeakingArticle] = useState(false);

  // Inspector states
  const [activeSelectionText, setActiveSelectionText] = useState<string>("");
  const [lastSelectionPayload, setLastSelectionPayload] =
    useState<InteractiveSelectionPayload | null>(null);
  const [inspector, setInspector] = useState<InspectorView | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [inspectorError, setInspectorError] = useState<string | null>(null);
  const lookupSeqRef = useRef(0);
  const [enrichingGlossary, setEnrichingGlossary] = useState(false);

  // Saving clicked words into Reading Vocab Pool
  const [savingWordKey, setSavingWordKey] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  // Add/Generate article controls
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTitle, setImportTitle] = useState("");
  const [importText, setImportText] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [importCategory, setImportCategory] = useState(
    initialCategory.startsWith("voc-") ? initialCategory : "voc-work"
  );
  const [importing, setImporting] = useState(false);
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [togglingRead, setTogglingRead] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const loadReadingData = useCallback(async () => {
    try {
      const res = await fetch("/api/reading-practice");
      if (!res.ok) throw new Error("Failed to load reading library");
      const payload = (await res.json()) as ReadingPracticePayload;
      setData(payload);
      setSavedKeys(
        new Set(
          (payload.readingVocabItems ?? []).map((item) =>
            normalizeGermanKey(item.german)
          )
        )
      );
      return payload;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReadingData();
    return () => {
      stopSpeaking();
    };
  }, [loadReadingData]);

  const filteredArticles = useMemo(() => {
    const all = data?.articles ?? [];
    if (categoryFilter === "all") return all;
    return all.filter((a) => a.categoryId === categoryFilter);
  }, [data, categoryFilter]);

  const activeArticle = useMemo(() => {
    if (!filteredArticles.length) return null;
    if (activeArticleId) {
      const found = filteredArticles.find((a) => a.id === activeArticleId);
      if (found) return found;
    }
    return filteredArticles[0];
  }, [filteredArticles, activeArticleId]);

  useEffect(() => {
    if (activeArticle && activeArticle.id !== activeArticleId) {
      setActiveArticleId(activeArticle.id);
    }
  }, [activeArticle, activeArticleId]);

  const readSet = useMemo(
    () => new Set(data?.readArticleIds ?? []),
    [data]
  );

  function speakText(text: string, onDone?: () => void) {
    if (!text.trim()) return;
    speakGerman(text, {
      rate: data?.aiConfig?.voiceRate ?? 0.95,
      ttsProvider: data?.aiConfig?.ttsProvider ?? "edge_neural",
      edgeVoice: data?.aiConfig?.edgeVoice,
      geminiTtsVoice: data?.aiConfig?.geminiTtsVoice,
      onEnd: onDone,
      onError: onDone,
    });
  }

  function handleToggleReadAloud() {
    if (!activeArticle) return;
    if (speakingArticle) {
      stopSpeaking();
      setSpeakingArticle(false);
      return;
    }
    const fullText = activeArticle.paragraphs.map((p) => p.de).join(" ");
    setSpeakingArticle(true);
    speakText(fullText, () => setSpeakingArticle(false));
  }

  function isAlreadySaved(german: string): boolean {
    const norm = normalizeGermanKey(german);
    return Boolean(norm && savedKeys.has(norm));
  }

  async function handleSaveToReadingVocab(
    german: string,
    translation: string,
    exampleDe?: string
  ) {
    const cleanDe = german.trim();
    const cleanEn = translation.trim();
    if (!cleanDe || !cleanEn) return;

    const key = normalizeGermanKey(cleanDe);
    setSavingWordKey(key);
    try {
      const res = await fetch("/api/practice-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_vocab",
          german: cleanDe,
          translation: cleanEn,
          exampleDe: exampleDe?.trim() || undefined,
          categoryId: activeArticle?.categoryId || "voc-education",
          source: "reading_click",
        }),
      });
      if (!res.ok) throw new Error("Could not save word");
      setSavedKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      // Refresh reading vocab count smoothly
      const refreshRes = await fetch("/api/reading-practice");
      if (refreshRes.ok) {
        const refreshed = (await refreshRes.json()) as ReadingPracticePayload;
        setData(refreshed);
      }
      showToast(`Added "${cleanDe}" to My Clicked Reading Vocab!`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save word to vocab pool"
      );
    } finally {
      setSavingWordKey(null);
    }
  }

  async function requestFastWordLookup(
    payload: InteractiveSelectionPayload,
    bypassLocal = false
  ) {
    const seq = ++lookupSeqRef.current;
    setInspectorLoading(true);
    setInspectorError(null);
    try {
      const res = await fetch("/api/reading-practice/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: payload.selectedText,
          surroundingSentence: payload.surroundingSentence,
          bypassLocal,
        }),
      });
      const json = await res.json();
      if (seq !== lookupSeqRef.current) return;
      if (!res.ok || !json.lookup) {
        throw new Error(json.error || "Could not look up this word");
      }
      const lk = json.lookup as {
        word: string;
        baseForm: string;
        partOfSpeech: string;
        meaningEn: string;
        contextNote?: string;
        exampleDe?: string;
        examples?: Array<{ de: string; en?: string }>;
        source:
          | "local_glossary"
          | "local_vocab_pool"
          | "disk_cache"
          | "ai_fast"
          | "web_dict";
      };
      const badgeMap: Record<typeof lk.source, string> = {
        local_glossary: "Instant · Glossary",
        local_vocab_pool: "Instant · Vocab Pool",
        disk_cache: "Instant · Cached",
        ai_fast: "Fast AI",
        web_dict: "Instant · Dictionary",
      };
      const examplesList =
        Array.isArray(lk.examples) && lk.examples.length > 0
          ? lk.examples
          : lk.exampleDe
          ? [{ de: lk.exampleDe }]
          : payload.surroundingSentence
          ? [{ de: payload.surroundingSentence }]
          : [];
      setInspector({
        kind: "glossary_instant",
        selectedText: payload.selectedText,
        surroundingSentence: payload.surroundingSentence,
        selectionType: "word",
        cached: Boolean(json.cached),
        sourceBadge: badgeMap[lk.source] || "Instant",
        isWebDictFallback: lk.source === "web_dict",
        contextNote: lk.contextNote,
        examples: examplesList,
        glossaryEntry: {
          word: lk.word,
          baseForm: lk.baseForm,
          meaningEn: lk.meaningEn,
          partOfSpeech: lk.partOfSpeech,
          exampleDe: examplesList[0]?.de || payload.surroundingSentence,
        },
        saveCandidate: {
          german: lk.baseForm,
          translation: lk.meaningEn,
          exampleDe: examplesList[0]?.de || payload.surroundingSentence,
        },
      });
    } catch (err) {
      if (seq !== lookupSeqRef.current) return;
      setInspectorError(
        err instanceof Error ? err.message : "Lookup failed. Please try again."
      );
    } finally {
      if (seq === lookupSeqRef.current) {
        setInspectorLoading(false);
      }
    }
  }

  async function requestAiSelectionLookup(
    payload: InteractiveSelectionPayload,
    article: ReadingArticle
  ) {
    const seq = ++lookupSeqRef.current;
    setInspectorLoading(true);
    setInspectorError(null);
    try {
      const res = await fetch("/api/drills/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "explain_selection",
          exercise: buildSyntheticExercise(article),
          selectedText: payload.selectedText,
          surroundingSentence: payload.surroundingSentence,
          selectionType: payload.selectionType,
        }),
      });
      const json = await res.json();
      if (seq !== lookupSeqRef.current) return;
      if (!res.ok || !json.result) {
        throw new Error(json.error || "Could not analyze selection");
      }
      const result = json.result as DrillAssistResult;
      setInspector({
        kind: "ai_selection",
        selectedText: payload.selectedText,
        surroundingSentence: payload.surroundingSentence,
        selectionType: payload.selectionType,
        cached: Boolean(json.cached),
        sourceBadge: json.cached ? "Instant · Cached" : "AI Analysis",
        assistResult: result,
        saveCandidate: extractSaveCandidateFromAssist(payload, result),
      });
    } catch (err) {
      if (seq !== lookupSeqRef.current) return;
      setInspectorError(
        err instanceof Error ? err.message : "Lookup failed. Please try again."
      );
    } finally {
      if (seq === lookupSeqRef.current) {
        setInspectorLoading(false);
      }
    }
  }

  function handleSelectChunk(payload: InteractiveSelectionPayload) {
    if (!activeArticle) return;
    setActiveSelectionText(payload.selectedText);
    setLastSelectionPayload(payload);
    setInspectorError(null);

    // 1. Instant 0ms client glossary hit for single-word clicks!
    if (payload.selectionType === "word") {
      const glossaryHit = matchGlossaryEntry(
        payload.selectedText,
        activeArticle.glossary
      );
      if (glossaryHit) {
        lookupSeqRef.current += 1;
        setInspectorLoading(false);
        setInspector({
          kind: "glossary_instant",
          selectedText: payload.selectedText,
          surroundingSentence: payload.surroundingSentence,
          selectionType: "word",
          cached: true,
          sourceBadge: "Instant · Glossary",
          glossaryEntry: glossaryHit,
          saveCandidate: {
            german: glossaryHit.baseForm,
            translation: glossaryHit.meaningEn,
            exampleDe: glossaryHit.exampleDe || payload.surroundingSentence,
          },
        });
        return;
      }

      // 2. Ultra-fast 4-tier single-word pipeline (Local Pool -> Global Cache -> Fast Micro-AI -> Free Web Dict)
      void requestFastWordLookup(payload);
      return;
    }

    // 3. Full sentence / multi-word phrase analysis via cached /api/drills/assist
    void requestAiSelectionLookup(payload, activeArticle);
  }

  async function handleEnrichArticleGlossary() {
    if (!activeArticle || enrichingGlossary) return;
    setEnrichingGlossary(true);
    try {
      const res = await fetch("/api/reading-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enrich_glossary",
          articleId: activeArticle.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not pre-load words");
      if (Array.isArray(json.articles)) {
        setData((prev) =>
          prev ? { ...prev, articles: json.articles } : prev
        );
      }
      showToast(
        json.addedCount > 0
          ? `Pre-loaded +${json.addedCount} words! Every click in this article is now 0ms instant.`
          : "All key words in this article are already pre-loaded!"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not pre-load words"
      );
    } finally {
      setEnrichingGlossary(false);
    }
  }

  async function handleToggleReadStatus() {
    if (!activeArticle) return;
    setTogglingRead(true);
    try {
      const res = await fetch("/api/reading-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_read",
          articleId: activeArticle.id,
        }),
      });
      const json = await res.json();
      if (res.ok && Array.isArray(json.readArticleIds)) {
        setData((prev) =>
          prev ? { ...prev, readArticleIds: json.readArticleIds } : prev
        );
        showToast(
          json.isRead ? "Marked article as read!" : "Unmarked article."
        );
      }
    } finally {
      setTogglingRead(false);
    }
  }

  async function handleImportArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!importTitle.trim() || !importText.trim()) return;
    setImporting(true);
    try {
      const res = await fetch("/api/reading-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import_article",
          titleDe: importTitle.trim(),
          textDe: importText.trim(),
          categoryId: importCategory,
          sourceUrl: importUrl.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      setData((prev) =>
        prev ? { ...prev, articles: json.articles } : prev
      );
      setCategoryFilter(importCategory);
      setActiveArticleId(json.article.id);
      setImportTitle("");
      setImportText("");
      setImportUrl("");
      setShowImportModal(false);
      setInspector(null);
      showToast("Imported article! Click any word or sentence to study it.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not import text");
    } finally {
      setImporting(false);
    }
  }

  async function handleGenerateArticle() {
    const targetCat = categoryFilter.startsWith("voc-")
      ? categoryFilter
      : activeArticle?.categoryId || "voc-work";
    setGeneratingArticle(true);
    try {
      const res = await fetch("/api/reading-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_article",
          categoryId: targetCat,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      setData((prev) =>
        prev ? { ...prev, articles: json.articles } : prev
      );
      setCategoryFilter(targetCat);
      setActiveArticleId(json.article.id);
      setInspector(null);
      showToast(
        `Created & saved new B1 article: "${json.article.titleDe}"!`
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not generate article"
      );
    } finally {
      setGeneratingArticle(false);
    }
  }

  async function handleDeleteCustomArticle(articleId: string) {
    if (!window.confirm("Remove this custom reading article?")) return;
    const res = await fetch("/api/reading-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_custom_article", articleId }),
    });
    const json = await res.json();
    if (res.ok) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              articles: json.articles,
              readArticleIds: json.readArticleIds,
            }
          : prev
      );
      setActiveArticleId(null);
      setInspector(null);
      showToast("Removed article.");
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 w-80 bg-zinc-200 rounded-2xl" />
        <div className="h-14 bg-zinc-200 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 h-[480px] bg-zinc-200 rounded-2xl" />
          <div className="lg:col-span-4 h-[480px] bg-zinc-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalReadCount = data.readArticleIds.length;
  const totalArticlesCount = data.articles.length;
  const readingVocabCount = data.readingVocabItems.length;
  const activeCatMeta = B1_VOCAB_CATEGORIES_META.find(
    (c) => c.id === activeArticle?.categoryId
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Toast banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-zinc-900 text-white text-xs font-semibold px-4 py-2.5 shadow-lg border border-zinc-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* TOP HEADER */}
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
            <span className="font-semibold text-indigo-700">
              Exercise Mode · Interactive B1 Reading
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            {data.targetLevel} Reading Practice Studio
          </h1>
          <p className="text-sm text-zinc-600">
            Read curated, high-value German articles across all{" "}
            {B1_VOCAB_CATEGORIES_META.length} everyday &amp; Goethe{" "}
            {data.targetLevel} topics. Click any word for instant translation +
            save it to your dedicated <strong>Clicked Reading Vocab</strong>{" "}
            trainer!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            {totalReadCount} / {totalArticlesCount} Articles Read
          </span>

          <Link
            href="/train/vocab?filter=reading_clicks"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold px-3.5 py-2 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Train Clicked Vocab ({readingVocabCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* CATEGORY TABS (ALL 8 OFFICIAL B1 CATEGORIES) */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("all");
                setInspector(null);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                categoryFilter === "all"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
              }`}
            >
              All Topics ({totalReadCount}/{totalArticlesCount})
            </button>

            {B1_VOCAB_CATEGORIES_META.map((cat) => {
              const catArticles = data.articles.filter(
                (a) => a.categoryId === cat.id
              );
              const catRead = catArticles.filter((a) =>
                readSet.has(a.id)
              ).length;
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    setInspector(null);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    active
                      ? "bg-indigo-700 text-white border-indigo-700"
                      : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200"
                  }`}
                >
                  {cat.titleDe.split(",")[0]}{" "}
                  <span
                    className={
                      active
                        ? "text-amber-300"
                        : catRead === catArticles.length && catArticles.length > 0
                        ? "text-emerald-700"
                        : "text-zinc-400"
                    }
                  >
                    ({catRead}/{catArticles.length})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setImportCategory(
                  categoryFilter.startsWith("voc-")
                    ? categoryFilter
                    : activeArticle?.categoryId || "voc-work"
                );
                setShowImportModal((v) => !v);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Paste Web Article</span>
            </button>
            <button
              type="button"
              onClick={handleGenerateArticle}
              disabled={generatingArticle}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 transition cursor-pointer disabled:opacity-60"
            >
              {generatingArticle ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              )}
              <span>
                {generatingArticle ? "Creating Article…" : "+ AI B1 Article"}
              </span>
            </button>
          </div>
        </div>

        {/* Paste / Import Web Article Form */}
        {showImportModal && (
          <form
            onSubmit={handleImportArticle}
            className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-zinc-900">
                Paste Any German Article from the Web (DW, Tagesschau, Spiegel, Blog…)
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                value={importTitle}
                onChange={(e) => setImportTitle(e.target.value)}
                placeholder="German headline (e.g. Arbeiten im Homeoffice)"
                className="sm:col-span-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={importCategory}
                onChange={(e) => setImportCategory(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900"
              >
                {B1_VOCAB_CATEGORIES_META.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titleDe}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              required
              rows={5}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste German paragraphs here (separate paragraphs with a blank line)..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Optional source URL (e.g. https://learngerman.dw.com/...)"
                className="flex-1 min-w-[220px] rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900"
              />
              <button
                type="submit"
                disabled={importing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 cursor-pointer disabled:opacity-60"
              >
                {importing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Save &amp; Open Interactive Reader</span>
              </button>
            </div>
          </form>
        )}

        {/* Article Selector Strip */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filteredArticles.map((art) => {
            const selected = activeArticle?.id === art.id;
            const isRead = readSet.has(art.id);
            const catShort =
              B1_VOCAB_CATEGORIES_META.find((c) => c.id === art.categoryId)
                ?.titleDe.split(",")[0] ?? "B1";
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setSpeakingArticle(false);
                  setActiveArticleId(art.id);
                  setInspector(null);
                  setActiveSelectionText("");
                  setShowTranslations(false);
                }}
                className={`shrink-0 w-64 text-left rounded-xl border p-3 transition cursor-pointer ${
                  selected
                    ? "bg-indigo-50/90 border-indigo-400 ring-1 ring-indigo-300"
                    : "bg-zinc-50/60 hover:bg-zinc-100/80 border-zinc-200/80"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                    {catShort} · {art.readingMinutes} min
                  </span>
                  {isRead && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5" />
                      Read
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">
                  {art.titleDe}
                </div>
                <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                  {art.titleEn}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* MAIN 2-COLUMN READER + INSPECTOR */}
      {activeArticle && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: INTERACTIVE READING ARTICLE (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <article className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-5 shadow-xs">
              {/* Article Header */}
              <div className="space-y-2 border-b border-zinc-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                      {activeCatMeta?.titleDe ?? "B1 Topic"}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                      {activeArticle.level} · ~{activeArticle.readingMinutes} Min.
                    </span>
                    {activeArticle.sourceUrl ? (
                      <a
                        href={activeArticle.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:underline px-2 py-0.5"
                      >
                        <span>{activeArticle.sourceStyle}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-zinc-500">
                        {activeArticle.sourceStyle}
                      </span>
                    )}
                  </div>

                  {activeArticle.source !== "curated" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomArticle(activeArticle.id)}
                      className="text-xs text-rose-600 hover:text-rose-800 inline-flex items-center gap-1 cursor-pointer"
                      title="Delete custom article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 leading-snug">
                  {activeArticle.titleDe}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500">
                  {activeArticle.titleEn}
                </p>
              </div>

              {/* Reader Toolbar: Click Mode + Audio + Translations + Mark Read */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50 border border-zinc-200/80 p-2.5">
                <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setClickMode("word")}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                      clickMode === "word"
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span>Click Word</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClickMode("sentence")}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                      clickMode === "sentence"
                        ? "bg-indigo-700 text-white"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Analyze Sentence</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleReadAloud}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      speakingArticle
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200"
                    }`}
                  >
                    {speakingArticle ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>

                  {activeArticle.paragraphs.some((p) => p.en?.trim()) && (
                    <button
                      type="button"
                      onClick={() => setShowTranslations((v) => !v)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                        showTranslations
                          ? "bg-indigo-50 text-indigo-900 border-indigo-300"
                          : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200"
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>
                        {showTranslations
                          ? "Hide Translations"
                          : "Paragraph Translations"}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleEnrichArticleGlossary}
                    disabled={enrichingGlossary}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 transition cursor-pointer disabled:opacity-60"
                    title="Pre-load definitions for all remaining words in this article in one batch so every word click is 0ms instant forever"
                  >
                    {enrichingGlossary ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>
                      {enrichingGlossary
                        ? "Pre-loading…"
                        : `Pre-load All Words (${activeArticle.glossary.length})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleReadStatus}
                    disabled={togglingRead}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                      readSet.has(activeArticle.id)
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {readSet.has(activeArticle.id)
                        ? "Read ✓"
                        : "Mark as Read"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Helper Tip */}
              <div className="text-[11px] text-zinc-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Tip:{" "}
                  {clickMode === "word"
                    ? "Click any German word to translate it instantly & add it to your Reading Vocab Pool — or drag-highlight any phrase for grammar analysis."
                    : "Click any full German sentence to get its exact translation, difficult words, and B1 grammar breakdown."}
                </span>
              </div>

              {/* Interactive Paragraphs */}
              <div className="space-y-5">
                {activeArticle.paragraphs.map((para, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50/30 p-3.5 sm:p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Absatz {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(para.de)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
                        title="Listen to this paragraph in German"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>

                    <InteractiveGermanText
                      text={para.de}
                      clickMode={clickMode}
                      activeSelectionText={activeSelectionText}
                      className="text-[16px] leading-8 text-zinc-900"
                      onSelectChunk={handleSelectChunk}
                      onHighlightPhrase={handleSelectChunk}
                    />

                    {showTranslations && para.en && (
                      <div className="mt-2 pt-2.5 border-t border-indigo-100 text-xs sm:text-sm text-indigo-950/85 leading-relaxed bg-indigo-50/40 rounded-lg px-3 py-2">
                        {para.en}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Key Glossary Chips (Zero-API Instant Add) */}
              {activeArticle.glossary.length > 0 && (
                <div className="pt-2 border-t border-zinc-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Key B1 Vocabulary in This Text (Click to Inspect or Save)
                    </h3>
                    <span className="text-[11px] text-zinc-400">
                      Instant · 0 API usage
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeArticle.glossary.map((g) => {
                      const saved = isAlreadySaved(g.baseForm);
                      return (
                        <div
                          key={g.baseForm}
                          className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs ${
                            saved
                              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                              : "bg-white border-zinc-200 text-zinc-800"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSelectionText(g.word);
                              setInspector({
                                kind: "glossary_instant",
                                selectedText: g.word,
                                surroundingSentence: g.exampleDe,
                                selectionType: "word",
                                cached: true,
                                glossaryEntry: g,
                                saveCandidate: {
                                  german: g.baseForm,
                                  translation: g.meaningEn,
                                  exampleDe: g.exampleDe,
                                },
                              });
                            }}
                            className="font-semibold hover:text-indigo-700 cursor-pointer"
                            title={`${g.meaningEn} — click for details`}
                          >
                            {g.baseForm}
                          </button>
                          <button
                            type="button"
                            onClick={() => speakText(g.baseForm)}
                            className="p-0.5 text-zinc-400 hover:text-teal-700 cursor-pointer"
                            title="Pronounce"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveToReadingVocab(
                                g.baseForm,
                                g.meaningEn,
                                g.exampleDe
                              )
                            }
                            disabled={saved}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition ${
                              saved
                                ? "text-emerald-700"
                                : "bg-amber-100 hover:bg-amber-200 text-amber-950 cursor-pointer"
                            }`}
                            title={
                              saved
                                ? "Already in Clicked Reading Vocab Pool"
                                : "Add to Clicked Reading Vocab Pool"
                            }
                          >
                            {saved ? "✓" : "+ Pool"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>

            {/* SPEAKING & WRITING TRANSFER KIT */}
            {(activeArticle.transferExpressions.length > 0 ||
              activeArticle.speakingWritingPromptDe) && (
              <section className="rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-teal-50/60 border border-amber-200/80 p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      <span>Grow Your Speaking &amp; Writing From This Text</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mt-0.5">
                      Reusable B1 Redemittel &amp; Exam Transfer Kit
                    </h3>
                  </div>
                </div>

                {activeArticle.transferExpressions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeArticle.transferExpressions.map((expr, idx) => {
                      const saved = isAlreadySaved(expr.de);
                      return (
                        <div
                          key={idx}
                          className="rounded-xl bg-white/90 border border-amber-200/70 p-3 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                                {expr.useIn === "Beides"
                                  ? "Sprechen & Schreiben"
                                  : expr.useIn}
                              </span>
                              <button
                                type="button"
                                onClick={() => speakText(expr.de)}
                                className="p-1 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-teal-700 cursor-pointer"
                                title="Listen to pronunciation"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-xs font-bold text-zinc-900 leading-snug">
                              „{expr.de}“
                            </div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              {expr.en}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={saved}
                            onClick={() =>
                              handleSaveToReadingVocab(expr.de, expr.en)
                            }
                            className={`self-start text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                              saved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-100 hover:bg-amber-200 text-amber-950 cursor-pointer"
                            }`}
                          >
                            {saved
                              ? "✓ Saved in Reading Vocab"
                              : "+ Save Expression to Reading Pool"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeArticle.speakingWritingPromptDe && (
                  <div className="rounded-xl bg-white border border-zinc-200/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                        Active Output Prompt (Say Aloud or Jot 2–3 Sentences)
                      </div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {activeArticle.speakingWritingPromptDe}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {activeArticle.speakingWritingPromptEn}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        speakText(activeArticle.speakingWritingPromptDe)
                      }
                      className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hear Question</span>
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* RIGHT: STICKY WORD / SENTENCE INSPECTOR + CLICKED VOCAB COLLECTION (4 cols) */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
            {/* Live Inspector Card */}
            <div className="rounded-2xl bg-white border border-zinc-200/80 p-4 sm:p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Word &amp; Sentence Inspector</span>
                </div>
                {(inspector?.sourceBadge || inspector?.cached) && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {inspector.sourceBadge || "Instant · Cached"}
                  </span>
                )}
              </div>

              {inspectorLoading && (
                <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-5 flex flex-col items-center justify-center gap-2 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-700" />
                  <div className="text-xs font-semibold text-indigo-900">
                    Looking up „{activeSelectionText}“…
                  </div>
                </div>
              )}

              {inspectorError && !inspectorLoading && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 space-y-2.5 text-xs text-rose-800">
                  <div>{inspectorError}</div>
                  {lastSelectionPayload && activeArticle && (
                    <button
                      type="button"
                      onClick={() => {
                        if (lastSelectionPayload.selectionType === "word") {
                          void requestFastWordLookup(lastSelectionPayload, true);
                        } else {
                          void requestAiSelectionLookup(
                            lastSelectionPayload,
                            activeArticle
                          );
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold px-3 py-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry Lookup</span>
                    </button>
                  )}
                </div>
              )}

              {!inspector && !inspectorLoading && !inspectorError && (
                <div className="rounded-xl bg-zinc-50 border border-dashed border-zinc-300 p-5 text-center space-y-2">
                  <MousePointerClick className="w-6 h-6 text-zinc-400 mx-auto" />
                  <div className="text-xs font-bold text-zinc-800">
                    Click any word or sentence on the left
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Get instant meanings, pronunciation, grammar rules, and
                    one-click saving to your{" "}
                    <strong>Clicked Reading Vocab</strong> training pool.
                  </p>
                </div>
              )}

              {/* INSTANT GLOSSARY / FAST WORD RESULT */}
              {!inspectorLoading &&
                !inspectorError &&
                inspector?.kind === "glossary_instant" &&
                inspector.glossaryEntry && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-3.5 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                            {inspector.glossaryEntry.partOfSpeech}
                          </span>
                          <div className="text-base font-bold text-zinc-950">
                            {inspector.glossaryEntry.baseForm}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            speakText(inspector.glossaryEntry!.baseForm)
                          }
                          className="p-2 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-800 cursor-pointer"
                          title="Listen in German"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-teal-900">
                        {inspector.glossaryEntry.meaningEn}
                      </div>
                      {inspector.contextNote && (
                        <div className="text-[11px] text-indigo-900/80 leading-snug pt-0.5">
                          {inspector.contextNote}
                        </div>
                      )}
                    </div>

                    {/* Simple Example Sentences (2-3 short everyday sentences!) */}
                    {(() => {
                      const examplesToShow =
                        inspector.examples && inspector.examples.length > 0
                          ? inspector.examples
                          : inspector.glossaryEntry?.exampleDe
                          ? [{ de: inspector.glossaryEntry.exampleDe }]
                          : [];
                      return (
                        <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                              Simple Example Sentences ({examplesToShow.length})
                            </span>
                            {examplesToShow.length < 2 && (
                              <button
                                type="button"
                                onClick={() =>
                                  requestFastWordLookup(
                                    {
                                      selectedText:
                                        inspector.glossaryEntry?.baseForm ||
                                        inspector.selectedText,
                                      surroundingSentence:
                                        inspector.surroundingSentence,
                                      selectionType: "word",
                                    },
                                    true
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>+ 3 Simple Examples</span>
                              </button>
                            )}
                          </div>

                          <div className="space-y-2">
                            {examplesToShow.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="rounded-lg bg-white border border-zinc-200/80 px-2.5 py-2 space-y-0.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-medium text-zinc-900 leading-relaxed">
                                    <span className="text-zinc-400 font-bold mr-1">
                                      {exIdx + 1}.
                                    </span>
                                    {ex.de}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => speakText(ex.de)}
                                    className="text-teal-700 hover:text-teal-900 shrink-0 mt-0.5 cursor-pointer"
                                    title="Listen to example sentence"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {ex.en && (
                                  <p className="text-[11px] text-zinc-500 pl-3.5">
                                    {ex.en}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* One-click Add to Reading Vocab Pool */}
                    {(() => {
                      const cand = inspector.saveCandidate!;
                      const saved = isAlreadySaved(cand.german);
                      const isSaving =
                        savingWordKey === normalizeGermanKey(cand.german);
                      return (
                        <button
                          type="button"
                          disabled={saved || isSaving}
                          onClick={() =>
                            handleSaveToReadingVocab(
                              cand.german,
                              cand.translation,
                              cand.exampleDe
                            )
                          }
                          className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold py-2.5 px-3 transition ${
                            saved
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer"
                          }`}
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : saved ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          <span>
                            {saved
                              ? "Saved in Clicked Reading Vocab ✓"
                              : "Add to Reading Vocab Pool"}
                          </span>
                        </button>
                      );
                    })()}

                    <button
                      type="button"
                      onClick={() =>
                        requestAiSelectionLookup(
                          {
                            selectedText: inspector.surroundingSentence,
                            surroundingSentence: inspector.surroundingSentence,
                            selectionType: "sentence",
                          },
                          activeArticle
                        )
                      }
                      className="w-full text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 py-1 cursor-pointer"
                    >
                      Analyze full surrounding sentence &amp; grammar →
                    </button>
                  </div>
                )}

              {/* AI / CACHED SELECTION RESULT */}
              {!inspectorLoading &&
                !inspectorError &&
                inspector?.kind === "ai_selection" &&
                inspector.assistResult && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-3.5 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-bold text-indigo-950">
                          {inspector.assistResult.title}
                        </div>
                        <button
                          type="button"
                          onClick={() => speakText(inspector.selectedText)}
                          className="p-1.5 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-800 shrink-0 cursor-pointer"
                          title="Listen in German"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-800 leading-relaxed whitespace-pre-line">
                        {inspector.assistResult.body}
                      </p>
                    </div>

                    {/* Primary Save Candidate Button for clicked word/phrase */}
                    {inspector.saveCandidate && (() => {
                      const cand = inspector.saveCandidate;
                      const saved = isAlreadySaved(cand.german);
                      const isSaving =
                        savingWordKey === normalizeGermanKey(cand.german);
                      return (
                        <button
                          type="button"
                          disabled={saved || isSaving}
                          onClick={() =>
                            handleSaveToReadingVocab(
                              cand.german,
                              cand.translation,
                              cand.exampleDe
                            )
                          }
                          className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold py-2.5 px-3 transition ${
                            saved
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer"
                          }`}
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : saved ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          <span>
                            {saved
                              ? `„${cand.german}“ in Reading Vocab ✓`
                              : `Add „${cand.german}“ to Reading Vocab Pool`}
                          </span>
                        </button>
                      );
                    })()}

                    {/* Sentence Breakdowns */}
                    {inspector.assistResult.sentenceBreakdowns &&
                      inspector.assistResult.sentenceBreakdowns.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            Sentence Translation
                          </div>
                          {inspector.assistResult.sentenceBreakdowns.map(
                            (sb, i) => (
                              <div
                                key={i}
                                className="rounded-lg bg-zinc-50 border border-zinc-200 p-2.5 space-y-1 text-xs"
                              >
                                <div className="font-semibold text-zinc-900 flex items-start justify-between gap-2">
                                  <span>{sb.german}</span>
                                  <button
                                    type="button"
                                    onClick={() => speakText(sb.german)}
                                    className="text-teal-700 shrink-0 cursor-pointer"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="text-zinc-600">
                                  {sb.translation}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* Difficult Words with One-Click + Reading Vocab */}
                    {inspector.assistResult.difficultWords &&
                      inspector.assistResult.difficultWords.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            Key Words to Save
                          </div>
                          <div className="space-y-1.5">
                            {inspector.assistResult.difficultWords.map(
                              (dw, idx) => {
                                const saved = isAlreadySaved(dw.german);
                                return (
                                  <div
                                    key={idx}
                                    className="rounded-lg bg-white border border-zinc-200 px-2.5 py-2 flex items-start justify-between gap-2"
                                  >
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-zinc-900">
                                        {dw.german}
                                      </div>
                                      <div className="text-[11px] text-zinc-600">
                                        {dw.translation}
                                      </div>
                                      {dw.note && (
                                        <div className="text-[10px] text-zinc-400 mt-0.5">
                                          {dw.note}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => speakText(dw.german)}
                                        className="p-1 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-teal-700 cursor-pointer"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={saved}
                                        onClick={() =>
                                          handleSaveToReadingVocab(
                                            dw.german,
                                            dw.translation,
                                            inspector.surroundingSentence
                                          )
                                        }
                                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                                          saved
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 cursor-pointer"
                                        }`}
                                      >
                                        {saved ? "✓ Saved" : "+ Pool"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}

                    {/* Grammar Rules */}
                    {inspector.assistResult.grammarNotes &&
                      inspector.assistResult.grammarNotes.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            Grammar Structure
                          </div>
                          {inspector.assistResult.grammarNotes.map((gn, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-teal-50/70 border border-teal-200/80 p-2.5 space-y-0.5"
                            >
                              <div className="text-xs font-bold text-teal-950">
                                {gn.pattern}
                              </div>
                              <div className="text-[11px] text-teal-900/90 leading-relaxed">
                                {gn.explanation}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
            </div>

            {/* MY CLICKED READING VOCAB COLLECTION CARD */}
            <div className="rounded-2xl bg-gradient-to-br from-teal-50/80 via-white to-amber-50/70 border border-teal-200/90 p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-zinc-900">
                    My Clicked Reading Vocab ({readingVocabCount})
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Words you clicked &amp; saved while reading
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900">
                  {readingVocabCount}
                </span>
              </div>

              {readingVocabCount === 0 ? (
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Click any German word in an article and press{" "}
                  <strong>+ Add to Reading Vocab Pool</strong> to build your
                  personal reading vocabulary list.
                </p>
              ) : (
                <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                  {data.readingVocabItems.slice(0, 15).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg bg-white/90 border border-zinc-200/80 px-2.5 py-1.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 truncate">
                        <span className="font-bold text-zinc-900">
                          {item.german}
                        </span>{" "}
                        <span className="text-zinc-500">
                          — {item.translation}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakText(item.german)}
                        className="text-zinc-400 hover:text-teal-700 shrink-0 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {readingVocabCount > 15 && (
                    <div className="text-[11px] text-zinc-500 text-center pt-1">
                      + {readingVocabCount - 15} more words in your reading pool
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <Link
                  href="/train/vocab?filter=reading_clicks"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-teal-800 text-white text-xs font-bold py-2.5 px-3 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Match Clicked</span>
                </Link>
                <Link
                  href="/train/vocab?filter=reading_clicks&mode=write"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-amber-50 text-zinc-900 border border-zinc-300 text-xs font-bold py-2.5 px-3 transition"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-600" />
                  <span>Write Clicked</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function ReadingPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-zinc-500">
          Loading Reading Practice Studio…
        </div>
      }
    >
      <ReadingPracticeStudioInner />
    </Suspense>
  );
}
