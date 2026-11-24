import { NextResponse } from "next/server";
import { extractJsonObject, generateWithAi } from "@/lib/ai/providers";
import { readDb } from "@/lib/db";
import { ReadingArticle } from "@/lib/reading-articles-bank";
import {
  getMergedReadingArticles,
  readReadingStore,
  writeReadingStore,
} from "@/lib/reading-store";
import { B1_VOCAB_CATEGORIES_META } from "@/lib/vocab-grammar-bank";
import { getMergedVocabPool } from "@/lib/vocab-pool-store";

export async function GET() {
  const db = readDb();
  const store = readReadingStore();
  const articles = getMergedReadingArticles();
  const vocabPool = getMergedVocabPool(db);
  const readingVocabItems = vocabPool.filter((v) => v.source === "reading_click");

  return NextResponse.json({
    articles,
    readArticleIds: store.readArticleIds,
    readingVocabItems,
    allSavedGermanWords: vocabPool
      .filter((v) => v.source === "reading_click")
      .map((v) => v.german),
    vocabCategories: db.mastery.vocabCategories,
    targetLevel: db.profile.targetLevel || "B1",
    aiConfig: {
      ttsProvider: db.aiConfig.ttsProvider ?? "edge_neural",
      edgeVoice: db.aiConfig.edgeVoice ?? "de-DE-SeraphinaMultilingualNeural",
      geminiTtsVoice: db.aiConfig.geminiTtsVoice ?? "Kore",
      voiceRate: db.aiConfig.voiceRate ?? 0.95,
      preferredVoiceName: db.aiConfig.preferredVoiceName ?? "",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    const db = readDb();
    const store = readReadingStore();

    if (action === "toggle_read") {
      const articleId = String(body.articleId ?? "").trim();
      if (!articleId) {
        return NextResponse.json(
          { error: "articleId is required" },
          { status: 400 }
        );
      }
      const exists = store.readArticleIds.includes(articleId);
      if (exists) {
        store.readArticleIds = store.readArticleIds.filter(
          (id) => id !== articleId
        );
      } else {
        store.readArticleIds.push(articleId);
      }
      writeReadingStore(store);
      return NextResponse.json({
        readArticleIds: store.readArticleIds,
        isRead: !exists,
      });
    }

    if (action === "import_article") {
      const titleDe = String(body.titleDe ?? "").trim();
      const rawTextDe = String(body.textDe ?? "").trim();
      const categoryId = String(body.categoryId ?? "voc-education").trim();
      const sourceUrl = String(body.sourceUrl ?? "").trim() || undefined;
      const sourceStyle =
        String(body.sourceStyle ?? "").trim() || "Imported German Web Article";

      if (!titleDe || !rawTextDe) {
        return NextResponse.json(
          { error: "German title and article text are required." },
          { status: 400 }
        );
      }

      const rawParas = rawTextDe
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\s+/g, " ").trim())
        .filter(Boolean);

      const wordCount = rawTextDe.split(/\s+/).filter(Boolean).length;

      const article: ReadingArticle = {
        id: `read-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        categoryId,
        level: db.profile.targetLevel || "B1",
        titleDe,
        titleEn: String(body.titleEn ?? "").trim() || titleDe,
        summaryEn:
          "Imported German article — click any word or sentence to translate, analyze grammar, and add words to your Reading Vocab Pool.",
        sourceStyle,
        sourceUrl,
        readingMinutes: Math.max(1, Math.round(wordCount / 85)),
        paragraphs: rawParas.map((de) => ({ de, en: "" })),
        glossary: [],
        transferExpressions: [],
        speakingWritingPromptDe:
          "Fassen Sie den Artikel kurz in 2–3 eigenen Sätzen auf Deutsch zusammen und sagen Sie Ihre Meinung zum Thema.",
        speakingWritingPromptEn:
          "Summarize the article briefly in 2–3 sentences in German and share your opinion on the topic.",
        source: "custom",
        createdAt: new Date().toISOString(),
      };

      store.customArticles.unshift(article);
      writeReadingStore(store);

      return NextResponse.json({
        article,
        articles: getMergedReadingArticles(),
      });
    }

    if (action === "generate_article") {
      const hasKey =
        Boolean(db.aiConfig.geminiApiKey?.trim()) ||
        Boolean(db.aiConfig.groqApiKey?.trim()) ||
        db.aiConfig.provider === "ollama";

      if (db.aiConfig.provider === "demo" || !hasKey) {
        return NextResponse.json(
          {
            error:
              "Connect Gemini, Groq, or Ollama in Settings to generate a fresh B1 reading article.",
          },
          { status: 400 }
        );
      }

      const categoryId = String(body.categoryId ?? "voc-work").trim();
      const customFocus = String(body.topicHint ?? "").trim();
      const catMeta =
        B1_VOCAB_CATEGORIES_META.find((c) => c.id === categoryId) ??
        B1_VOCAB_CATEGORIES_META[0];
      const level = db.profile.targetLevel || "B1";
      const nativeLang = db.profile.nativeLanguage || "English";

      const existingTitles = getMergedReadingArticles()
        .filter((a) => a.categoryId === categoryId)
        .map((a) => a.titleDe)
        .join(" | ");

      const aiRes = await generateWithAi(db.aiConfig, {
        messages: [
          {
            role: "system",
            content: `You are a Goethe-Institut ${level} curriculum author (DW Top-Thema magazine style). Write authentic, rich, natural German reading articles with useful connectors and idioms that transfer directly to Speaking & Writing. Output ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Create ONE fresh, high-value ${level} German magazine reading article for the topic category:
"${catMeta.titleDe} (${catMeta.titleEn})"
${customFocus ? `Specific angle requested by learner: "${customFocus}"` : ""}

DO NOT repeat these existing article titles:
${existingTitles || "(none)"}

Requirements:
- 3 well-structured paragraphs in natural ${level} German (~200–240 words total) with useful connectors (einerseits...andererseits, obwohl, deshalb, während, sodass, stattdessen).
- Accurate paragraph-by-paragraph translation into ${nativeLang}.
- 8–10 glossary entries for key ${level} words appearing literally in the German text (with baseForm including der/die/das + plural for nouns, meaningEn in ${nativeLang}, partOfSpeech, and a practical exampleDe).
- 4 reusable Speaking/Writing transfer expressions (Redemittel) taken from the article.
- 1 short speaking/writing reflection prompt.

Return ONLY valid JSON:
{
  "titleDe": "Natural German magazine headline",
  "titleEn": "Translation in ${nativeLang}",
  "summaryEn": "1-sentence summary in ${nativeLang}",
  "paragraphs": [
    { "de": "Paragraph 1 in German", "en": "Paragraph 1 translation" },
    { "de": "Paragraph 2 in German", "en": "Paragraph 2 translation" },
    { "de": "Paragraph 3 in German", "en": "Paragraph 3 translation" }
  ],
  "glossary": [
    {
      "word": "exact word as written in text",
      "baseForm": "der/die/das Noun, -Pl. or verb infinitive",
      "meaningEn": "meaning in ${nativeLang}",
      "partOfSpeech": "Noun | Verb | Adjective | Phrase",
      "exampleDe": "Short practical B1 sentence"
    }
  ],
  "transferExpressions": [
    { "de": "Reusable German Redemittel", "en": "Meaning in ${nativeLang}", "useIn": "Beides" }
  ],
  "speakingWritingPromptDe": "1 reflection question in German",
  "speakingWritingPromptEn": "Translation in ${nativeLang}"
}`,
          },
        ],
        temperature: 0.7,
        jsonMode: true,
      });

      const parsed = extractJsonObject<{
        titleDe?: string;
        titleEn?: string;
        summaryEn?: string;
        paragraphs?: Array<{ de: string; en: string }>;
        glossary?: ReadingArticle["glossary"];
        transferExpressions?: ReadingArticle["transferExpressions"];
        speakingWritingPromptDe?: string;
        speakingWritingPromptEn?: string;
      }>(aiRes.text);

      if (!parsed?.titleDe || !Array.isArray(parsed.paragraphs) || parsed.paragraphs.length === 0) {
        return NextResponse.json(
          { error: "Could not parse generated reading article. Please retry." },
          { status: 500 }
        );
      }

      const fullText = parsed.paragraphs.map((p) => p.de).join(" ");
      const wordCount = fullText.split(/\s+/).filter(Boolean).length;

      const newArticle: ReadingArticle = {
        id: `read-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        categoryId,
        level,
        titleDe: parsed.titleDe.trim(),
        titleEn: (parsed.titleEn || parsed.titleDe).trim(),
        summaryEn: (parsed.summaryEn || "").trim(),
        sourceStyle: `AI Curated ${level} Magazine · Saved Locally`,
        readingMinutes: Math.max(2, Math.round(wordCount / 85)),
        paragraphs: parsed.paragraphs
          .filter((p) => p?.de?.trim())
          .map((p) => ({
            de: p.de.trim(),
            en: (p.en || "").trim(),
          })),
        glossary: Array.isArray(parsed.glossary) ? parsed.glossary.slice(0, 12) : [],
        transferExpressions: Array.isArray(parsed.transferExpressions)
          ? parsed.transferExpressions.slice(0, 5)
          : [],
        speakingWritingPromptDe:
          parsed.speakingWritingPromptDe?.trim() ||
          "Fassen Sie die Hauptidee dieses Textes kurz auf Deutsch zusammen.",
        speakingWritingPromptEn:
          parsed.speakingWritingPromptEn?.trim() ||
          "Briefly summarize the main idea of this text in German.",
        source: "ai",
        createdAt: new Date().toISOString(),
      };

      store.customArticles.unshift(newArticle);
      writeReadingStore(store);

      return NextResponse.json({
        article: newArticle,
        articles: getMergedReadingArticles(),
      });
    }

    if (action === "enrich_glossary") {
      const articleId = String(body.articleId ?? "").trim();
      const allArticles = getMergedReadingArticles();
      const article = allArticles.find((a) => a.id === articleId);
      if (!article) {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        );
      }

      if (db.aiConfig.provider === "demo") {
        return NextResponse.json(
          {
            error:
              "Connect Groq, Gemini, or Ollama in Settings to pre-load all words for this article.",
          },
          { status: 400 }
        );
      }

      const fullText = article.paragraphs.map((p) => p.de).join("\n");
      const existingWords = new Set(
        article.glossary.map((g) => g.word.trim().toLowerCase())
      );

      // Extract unique German content words (>= 4 chars) not yet in glossary
      const stopWords = new Set([
        "aber", "alle", "allem", "allen", "aller", "alles", "also", "auch",
        "beim", "dann", "dass", "dazu", "dein", "deine", "dem", "denn",
        "deren", "dies", "diese", "diesem", "diesen", "dieser", "dieses",
        "doch", "dort", "durch", "eine", "einem", "einen", "einer", "eines",
        "etwa", "etwas", "euch", "euer", "für", "ganz", "gibt", "habe",
        "haben", "hatte", "hier", "ihre", "ihrem", "ihren", "ihrer", "immer",
        "jede", "jedem", "jeden", "jeder", "jedes", "jetzt", "kann", "kein",
        "keine", "keinem", "keinen", "keiner", "können", "machen", "mehr",
        "mein", "meine", "mich", "muss", "müssen", "nach", "nicht", "noch",
        "oder", "ohne", "sehr", "sein", "seine", "seinem", "seinen", "seiner",
        "selbst", "sich", "sind", "sogar", "soll", "sollen", "sondern",
        "über", "unter", "viel", "viele", "vielen", "vieler", "vom", "wann",
        "waren", "weil", "wenn", "werden", "wird", "wirklich", "wobei",
        "während", "zwischen",
      ]);

      const rawTokens = fullText.match(/[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)*/g) ?? [];
      const candidates: string[] = [];
      const seenCand = new Set<string>();
      for (const tok of rawTokens) {
        const lower = tok.toLowerCase();
        if (lower.length < 4 || stopWords.has(lower)) continue;
        if (existingWords.has(lower) || seenCand.has(lower)) continue;
        seenCand.add(lower);
        candidates.push(tok);
      }

      const batchWords = candidates.slice(0, 40);
      if (batchWords.length === 0) {
        return NextResponse.json({
          addedCount: 0,
          articles: allArticles,
        });
      }

      const nativeLang = db.profile.nativeLanguage || "English";
      const level = db.profile.targetLevel || "B1";

      const aiRes = await generateWithAi(db.aiConfig, {
        messages: [
          {
            role: "system",
            content: `You are a fast German ${level} dictionary builder. Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `For the German article below, define EVERY word in this list so a ${level} learner gets instant click-lookup without waiting:
WORDS: ${batchWords.join(", ")}

ARTICLE CONTEXT:
${fullText.slice(0, 1400)}

Return ONLY valid JSON:
{
  "entries": [
    {
      "word": "EXACT word from WORDS list",
      "baseForm": "der/die/das Noun, -Pl. OR verb infinitive OR base adj/adv",
      "meaningEn": "concise meaning in ${nativeLang}",
      "partOfSpeech": "Noun | Verb | Adjective | Adverb | Phrase",
      "exampleDe": "Short 6-10 word B1 German example sentence"
    }
  ]
}`,
          },
        ],
        temperature: 0.2,
        jsonMode: true,
        timeoutMs: 25000,
        workload: "dynamic",
      });

      const parsed = extractJsonObject<{
        entries?: ReadingArticle["glossary"];
      }>(aiRes.text);

      const newEntries = Array.isArray(parsed?.entries)
        ? parsed.entries.filter(
            (e) => e && e.word?.trim() && e.meaningEn?.trim()
          )
        : [];

      if (newEntries.length > 0) {
        const prevOverrides = store.articleGlossaryOverrides?.[articleId] ?? [];
        const seen = new Set(
          prevOverrides.map((g) => g.word.trim().toLowerCase())
        );
        const combined = [...prevOverrides];
        for (const item of newEntries) {
          const k = item.word.trim().toLowerCase();
          if (seen.has(k)) continue;
          seen.add(k);
          combined.push({
            word: item.word.trim(),
            baseForm: (item.baseForm || item.word).trim(),
            meaningEn: item.meaningEn.trim(),
            partOfSpeech: (item.partOfSpeech || "Word").trim(),
            exampleDe: (item.exampleDe || "").trim(),
          });
        }
        store.articleGlossaryOverrides = {
          ...(store.articleGlossaryOverrides ?? {}),
          [articleId]: combined,
        };
        writeReadingStore(store);
      }

      return NextResponse.json({
        addedCount: newEntries.length,
        articles: getMergedReadingArticles(),
      });
    }

    if (action === "delete_custom_article") {
      const articleId = String(body.articleId ?? "").trim();
      store.customArticles = store.customArticles.filter(
        (a) => a.id !== articleId
      );
      store.readArticleIds = store.readArticleIds.filter(
        (id) => id !== articleId
      );
      writeReadingStore(store);
      return NextResponse.json({
        articles: getMergedReadingArticles(),
        readArticleIds: store.readArticleIds,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Reading practice action failed",
      },
      { status: 500 }
    );
  }
}
