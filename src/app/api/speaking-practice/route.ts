import { NextResponse } from "next/server";
import { extractJsonObject, generateWithAi } from "@/lib/ai/providers";
import { readDb } from "@/lib/db";
import {
  CasualInterview,
  QaReflexDrill,
} from "@/lib/speaking-practice-bank";
import {
  CollectedSpeakingPhrase,
  getMergedInterviews,
  getMergedQaDrills,
  readSpeakingPracticeStore,
  writeSpeakingPracticeStore,
} from "@/lib/speaking-practice-store";
import { B1_VOCAB_CATEGORIES_META } from "@/lib/vocab-grammar-bank";

export async function GET() {
  const db = readDb();
  const store = readSpeakingPracticeStore();

  return NextResponse.json({
    interviews: getMergedInterviews(),
    qaDrills: getMergedQaDrills(),
    collectedPhrases: store.collectedPhrases,
    completedInterviews: store.completedInterviews,
    targetLevel: db.profile.targetLevel || "B1",
    aiConfig: {
      ttsProvider: db.aiConfig.ttsProvider ?? "edge_neural",
      edgeVoice: db.aiConfig.edgeVoice ?? "de-DE-SeraphinaMultilingualNeural",
      geminiTtsVoice: db.aiConfig.geminiTtsVoice ?? "Kore",
      voiceRate: db.aiConfig.voiceRate ?? 0.95,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    const db = readDb();
    const store = readSpeakingPracticeStore();
    const now = new Date().toISOString();

    if (action === "collect_phrase") {
      const german = String(body.german ?? "").trim();
      const meaningEn = String(body.meaningEn ?? "").trim();
      const categoryId = String(body.categoryId ?? "voc-education").trim();

      if (!german) {
        return NextResponse.json(
          { error: "German sentence or phrase is required." },
          { status: 400 }
        );
      }

      const norm = german.toLowerCase().replace(/[„“".,!?]/g, "").trim();
      const existing = store.collectedPhrases.find(
        (p) => p.german.toLowerCase().replace(/[„“".,!?]/g, "").trim() === norm
      );

      if (existing) {
        return NextResponse.json({
          phrase: existing,
          collectedPhrases: store.collectedPhrases,
          alreadySaved: true,
        });
      }

      const newPhrase: CollectedSpeakingPhrase = {
        id: `spk-p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        categoryId,
        german,
        patternDe: String(body.patternDe ?? "").trim() || undefined,
        meaningEn: meaningEn || german,
        spokenExampleDe: String(body.spokenExampleDe ?? "").trim() || undefined,
        emailBridgeDe: String(body.emailBridgeDe ?? "").trim() || undefined,
        emailBridgeEn: String(body.emailBridgeEn ?? "").trim() || undefined,
        sourceLabel:
          String(body.sourceLabel ?? "").trim() || "Collected Speaking Phrase",
        correctStreak: 0,
        totalPracticed: 0,
        needsRepeat: true,
        createdAt: now,
      };

      store.collectedPhrases.unshift(newPhrase);
      writeSpeakingPracticeStore(store);

      return NextResponse.json({
        phrase: newPhrase,
        collectedPhrases: store.collectedPhrases,
        alreadySaved: false,
      });
    }

    if (action === "remove_phrase") {
      const phraseId = String(body.phraseId ?? "").trim();
      store.collectedPhrases = store.collectedPhrases.filter(
        (p) => p.id !== phraseId
      );
      writeSpeakingPracticeStore(store);
      return NextResponse.json({
        collectedPhrases: store.collectedPhrases,
      });
    }

    if (action === "practice_phrase_result") {
      const phraseId = String(body.phraseId ?? "").trim();
      const gotIt = Boolean(body.gotIt);
      const item = store.collectedPhrases.find((p) => p.id === phraseId);
      if (!item) {
        return NextResponse.json(
          { error: "Phrase not found" },
          { status: 404 }
        );
      }

      item.totalPracticed += 1;
      item.lastPracticedAt = now;
      if (gotIt) {
        item.correctStreak += 1;
        if (item.correctStreak >= 3) {
          item.needsRepeat = false;
        }
      } else {
        item.correctStreak = 0;
        item.needsRepeat = true;
      }

      writeSpeakingPracticeStore(store);
      return NextResponse.json({
        phrase: item,
        collectedPhrases: store.collectedPhrases,
      });
    }

    if (action === "record_qa_result") {
      const drillId = String(body.drillId ?? "").trim();
      const correct = Boolean(body.correct);
      if (!drillId) {
        return NextResponse.json(
          { error: "drillId is required" },
          { status: 400 }
        );
      }

      const prev = store.qaStats[drillId] ?? {
        correctStreak: 0,
        totalCorrect: 0,
        totalWrong: 0,
        needsRetry: false,
      };

      const nextStreak = correct ? prev.correctStreak + 1 : 0;
      store.qaStats[drillId] = {
        correctStreak: nextStreak,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        totalWrong: prev.totalWrong + (correct ? 0 : 1),
        needsRetry: !correct ? true : prev.needsRetry && nextStreak < 2,
        lastPracticedAt: now,
      };

      writeSpeakingPracticeStore(store);
      return NextResponse.json({
        qaDrills: getMergedQaDrills(),
      });
    }

    if (action === "toggle_interview_done") {
      const interviewId = String(body.interviewId ?? "").trim();
      if (!interviewId) {
        return NextResponse.json(
          { error: "interviewId required" },
          { status: 400 }
        );
      }
      const exists = store.completedInterviews.includes(interviewId);
      if (exists) {
        store.completedInterviews = store.completedInterviews.filter(
          (id) => id !== interviewId
        );
      } else {
        store.completedInterviews.push(interviewId);
      }
      writeSpeakingPracticeStore(store);
      return NextResponse.json({
        completedInterviews: store.completedInterviews,
        isDone: !exists,
      });
    }

    if (action === "generate_interview") {
      const hasKey =
        Boolean(db.aiConfig.geminiApiKey?.trim()) ||
        Boolean(db.aiConfig.groqApiKey?.trim()) ||
        db.aiConfig.provider === "ollama";

      if (db.aiConfig.provider === "demo" || !hasKey) {
        return NextResponse.json(
          {
            error:
              "Connect Groq, Gemini, or Ollama in Settings to generate a fresh B1 casual interview.",
          },
          { status: 400 }
        );
      }

      const categoryId = String(body.categoryId ?? "voc-work").trim();
      const catMeta =
        B1_VOCAB_CATEGORIES_META.find((c) => c.id === categoryId) ??
        B1_VOCAB_CATEGORIES_META[0];
      const level = db.profile.targetLevel || "B1";
      const nativeLang = db.profile.nativeLanguage || "English";
      const existingTitles = getMergedInterviews()
        .filter((i) => i.categoryId === categoryId)
        .map((i) => i.titleDe)
        .join(" | ");

      const aiRes = await generateWithAi(db.aiConfig, {
        messages: [
          {
            role: "system",
            content: `You are an Easy German / street-interview dialogue writer for ${level} learners. Write super natural, casual everyday German conversations packed with reusable "Lego Brick" chunks and Spoken-to-Email bridges. Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Create ONE fresh, lively ${level} casual German interview or two-person everyday chat for:
Topic: "${catMeta.titleDe} (${catMeta.titleEn})"
Do NOT repeat: ${existingTitles || "(none)"}

Requirements:
- 6–8 natural conversational turns alternating between one female and one male German speaker.
- Casual, real spoken German (like Easy German street interviews: "Ehrlich gesagt...", "Das kommt darauf an...", "Sag mal..."), NOT stiff textbook language.
- 5 reusable "Lego Brick" chunks extracted from the dialogue, each with a customizable [slot] pattern, a spoken swap example, AND a polished Email Bridge version ("Chunk-to-Email Bridge")!
- 1 short "3-2-1 Solo Speaking Drill" summary prompt.

Return ONLY valid JSON:
{
  "titleDe": "Catchy German title",
  "titleEn": "Translation in ${nativeLang}",
  "settingDe": "Short German setting description",
  "settingEn": "Setting in ${nativeLang}",
  "turns": [
    { "speaker": "Name", "voiceRole": "female", "textDe": "Natural spoken German turn", "textEn": "Translation in ${nativeLang}" },
    { "speaker": "Name2", "voiceRole": "male", "textDe": "Natural spoken German reply", "textEn": "Translation in ${nativeLang}" }
  ],
  "legoBricks": [
    {
      "chunkDe": "Exact reusable phrase from the dialogue",
      "patternDe": "Customizable template with [X]",
      "meaningEn": "Natural meaning in ${nativeLang}",
      "spokenExampleDe": "Everyday speaking swap example",
      "emailBridgeDe": "Slightly polished email version",
      "emailBridgeEn": "Email version in ${nativeLang}"
    }
  ],
  "drill321PromptDe": "1-sentence solo summary task in German",
  "drill321PromptEn": "Translation in ${nativeLang}"
}`,
          },
        ],
        temperature: 0.75,
        jsonMode: true,
        workload: "dynamic",
      });

      const parsed = extractJsonObject<{
        titleDe?: string;
        titleEn?: string;
        settingDe?: string;
        settingEn?: string;
        turns?: Array<{
          speaker: string;
          voiceRole: "female" | "male";
          textDe: string;
          textEn: string;
        }>;
        legoBricks?: Array<{
          chunkDe: string;
          patternDe: string;
          meaningEn: string;
          spokenExampleDe: string;
          emailBridgeDe: string;
          emailBridgeEn: string;
        }>;
        drill321PromptDe?: string;
        drill321PromptEn?: string;
      }>(aiRes.text);

      if (!parsed?.titleDe || !Array.isArray(parsed.turns) || parsed.turns.length < 4) {
        return NextResponse.json(
          { error: "Could not parse generated interview. Please retry." },
          { status: 500 }
        );
      }

      const idBase = `int-ai-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      const newInterview: CasualInterview = {
        id: idBase,
        categoryId,
        level,
        titleDe: parsed.titleDe.trim(),
        titleEn: (parsed.titleEn || parsed.titleDe).trim(),
        settingDe: (parsed.settingDe || "Alltagsgespräch").trim(),
        settingEn: (parsed.settingEn || "Everyday conversation").trim(),
        durationLabel: "~2 Min.",
        turns: parsed.turns.slice(0, 10).map((t, idx) => ({
          id: `${idBase}-t${idx + 1}`,
          speaker: (t.speaker || (idx % 2 === 0 ? "Lena" : "Max")).trim(),
          voiceRole: t.voiceRole === "male" ? "male" : idx % 2 === 0 ? "female" : "male",
          textDe: String(t.textDe ?? "").trim(),
          textEn: String(t.textEn ?? "").trim(),
        })),
        legoBricks: Array.isArray(parsed.legoBricks)
          ? parsed.legoBricks
              .filter((b) => b?.chunkDe?.trim() && b?.meaningEn?.trim())
              .slice(0, 6)
              .map((b, idx) => ({
                id: `${idBase}-lb${idx + 1}`,
                chunkDe: b.chunkDe.trim(),
                patternDe: (b.patternDe || b.chunkDe).trim(),
                meaningEn: b.meaningEn.trim(),
                spokenExampleDe: (b.spokenExampleDe || b.chunkDe).trim(),
                emailBridgeDe: (b.emailBridgeDe || b.chunkDe).trim(),
                emailBridgeEn: (b.emailBridgeEn || b.meaningEn).trim(),
              }))
          : [],
        drill321PromptDe:
          parsed.drill321PromptDe?.trim() ||
          "Fasse das Gespräch in 3 → 2 → 1 Minuten frei auf Deutsch zusammen und nutze mindestens 2 Bausteine!",
        drill321PromptEn:
          parsed.drill321PromptEn?.trim() ||
          "Summarize the conversation freely in German (3 → 2 → 1 min) using at least 2 Lego Bricks!",
        source: "ai",
      };

      store.customInterviews.unshift(newInterview);
      writeSpeakingPracticeStore(store);

      return NextResponse.json({
        interview: newInterview,
        interviews: getMergedInterviews(),
      });
    }

    if (action === "generate_qa_batch") {
      if (db.aiConfig.provider === "demo") {
        return NextResponse.json(
          {
            error:
              "Connect Groq, Gemini, or Ollama in Settings to generate fresh Q&A reflex drills.",
          },
          { status: 400 }
        );
      }

      const categoryId = String(body.categoryId ?? "voc-work").trim();
      const catMeta =
        B1_VOCAB_CATEGORIES_META.find((c) => c.id === categoryId) ??
        B1_VOCAB_CATEGORIES_META[0];
      const level = db.profile.targetLevel || "B1";
      const nativeLang = db.profile.nativeLanguage || "English";

      const aiRes = await generateWithAi(db.aiConfig, {
        messages: [
          {
            role: "system",
            content: `You create fast, practical everyday German ${level} Q&A multiple-choice reflex drills (learning how to ASK simple natural questions and how to ANSWER them naturally). Output ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Generate 8 NEW, short, super practical everyday ${level} Q&A multiple-choice drills for:
Topic: "${catMeta.titleDe} (${catMeta.titleEn})"

Include:
- 4 drills with "drillType": "answer" (a natural everyday German question asked to the learner -> pick the best, most natural B1 German answer out of 4 options)
- 4 drills with "drillType": "ask" (a real-life situation -> pick the best, most natural German question to ask out of 4 options)

Keep questions and answers SHORT, simple, natural, and immediately reusable in real life! Randomize which index (0, 1, 2, or 3) is correct.

Return ONLY valid JSON:
{
  "drills": [
    {
      "drillType": "answer",
      "promptDe": "German question or Situation: ...",
      "promptEn": "Translation in ${nativeLang}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanationEn": "1 short clear tip in ${nativeLang}",
      "reusableChunkDe": "Short reusable German Lego-brick phrase",
      "reusableChunkEn": "Meaning in ${nativeLang}"
    }
  ]
}`,
          },
        ],
        temperature: 0.65,
        jsonMode: true,
        workload: "dynamic",
      });

      const parsed = extractJsonObject<{
        drills?: Array<Omit<QaReflexDrill, "id" | "categoryId" | "source">>;
      }>(aiRes.text);

      const added: QaReflexDrill[] = [];
      if (Array.isArray(parsed?.drills)) {
        for (const d of parsed.drills.slice(0, 8)) {
          if (
            !d?.promptDe?.trim() ||
            !Array.isArray(d.options) ||
            d.options.length < 2
          ) {
            continue;
          }
          const safeIdx = Math.max(
            0,
            Math.min(d.options.length - 1, Number(d.correctIndex ?? 0))
          );
          const item: QaReflexDrill = {
            id: `qa-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            categoryId,
            drillType: d.drillType === "ask" ? "ask" : "answer",
            promptDe: d.promptDe.trim(),
            promptEn: (d.promptEn || "").trim(),
            options: d.options.map((o) => String(o).trim()),
            correctIndex: safeIdx,
            explanationEn: (d.explanationEn || "").trim(),
            reusableChunkDe: (
              d.reusableChunkDe || d.options[safeIdx]
            ).trim(),
            reusableChunkEn: (d.reusableChunkEn || "").trim(),
            source: "ai",
          };
          store.customQaDrills.unshift(item);
          added.push(item);
        }
      }

      if (added.length > 0) {
        writeSpeakingPracticeStore(store);
      }

      return NextResponse.json({
        addedCount: added.length,
        qaDrills: getMergedQaDrills(),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Speaking practice action failed",
      },
      { status: 500 }
    );
  }
}
