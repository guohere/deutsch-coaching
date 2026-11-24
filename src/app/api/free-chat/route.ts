import { NextResponse } from "next/server";
import {
  buildMemoryContextDigest,
  FREE_CHAT_THEMES,
  generateFreeChatOpening,
  generateThemePivot,
} from "@/lib/ai/free-chat";
import { readDb, updateDb } from "@/lib/db";
import { prewarmCoachReplyTts } from "@/lib/tts-engine";
import { FreeChatMessage, FreeChatRecord } from "@/lib/types";

export async function GET() {
  const db = readDb();
  const digest = buildMemoryContextDigest(db);

  return NextResponse.json({
    chats: db.freeChats ?? [],
    themes: FREE_CHAT_THEMES,
    memoryContext: {
      activeBottlenecks: digest.activeBottleneckTitles,
      recentExercises: digest.recentExerciseTitles,
      recentVocab: digest.recentVocabWords,
    },
    profile: db.profile,
    aiConfig: {
      provider: db.aiConfig.provider,
      ttsProvider: db.aiConfig.ttsProvider ?? "edge_neural",
      edgeVoice: db.aiConfig.edgeVoice ?? "de-DE-SeraphinaMultilingualNeural",
      voiceRate: db.aiConfig.voiceRate ?? 1.1,
      preferredVoiceName: db.aiConfig.preferredVoiceName ?? "",
      autoSpeak: db.aiConfig.autoSpeak,
      handsFreeDefault: db.aiConfig.handsFreeDefault,
      blindListeningDefault: db.aiConfig.blindListeningDefault,
      groqUseWhisper: db.aiConfig.groqUseWhisper,
      hasGroqKey: Boolean(db.aiConfig.groqApiKey?.trim()),
      hasGeminiKey: Boolean(db.aiConfig.geminiApiKey?.trim()),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const db = readDb();

    const preset = FREE_CHAT_THEMES.find((t) => t.id === body.themeId);
    const customTopic = String(body.customTopic ?? "").trim();

    const themeId = customTopic ? "custom" : preset?.id ?? FREE_CHAT_THEMES[0].id;
    const themeTitle = customTopic || preset?.title || FREE_CHAT_THEMES[0].title;
    const themeTitleDe =
      customTopic || preset?.titleDe || FREE_CHAT_THEMES[0].titleDe;

    const opening = await generateFreeChatOpening(db, themeTitle, themeTitleDe);
    const now = new Date().toISOString();

    const coachMsg: FreeChatMessage = {
      id: `fc-msg-${Date.now()}-c`,
      role: "coach",
      textDe: opening.coachTextDe,
      translation: opening.translation,
      timestamp: now,
      hints: opening.hints,
      memoryBridgeNote: opening.memoryBridgeNote,
    };

    const newChat: FreeChatRecord = {
      id: `fc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      themeId,
      themeTitle,
      themeTitleDe,
      startedAt: now,
      updatedAt: now,
      turnCount: 0,
      messages: [coachMsg],
    };

    updateDb((state) => {
      state.freeChats.unshift(newChat);
      if (state.freeChats.length > 30) {
        state.freeChats = state.freeChats.slice(0, 30);
      }
    });

    await prewarmCoachReplyTts(coachMsg.textDe, db.aiConfig);

    return NextResponse.json({ chat: newChat, coachMessage: coachMsg });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start free chat" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const chatId = String(body.chatId ?? "");
    const db = readDb();
    const chat = db.freeChats.find((c) => c.id === chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const preset = FREE_CHAT_THEMES.find((t) => t.id === body.themeId);
    const customTopic = String(body.customTopic ?? "").trim();
    const themeId = customTopic ? "custom" : preset?.id ?? chat.themeId;
    const themeTitle = customTopic || preset?.title || chat.themeTitle;
    const themeTitleDe = customTopic || preset?.titleDe || chat.themeTitleDe;

    const pivot = await generateThemePivot(db, chat, themeTitle, themeTitleDe);
    const now = new Date().toISOString();

    const coachMsg: FreeChatMessage = {
      id: `fc-msg-${Date.now()}-p`,
      role: "coach",
      textDe: pivot.coachTextDe,
      translation: pivot.translation,
      timestamp: now,
      hints: pivot.hints,
      memoryBridgeNote: pivot.memoryBridgeNote,
    };

    const updatedChat: FreeChatRecord = {
      ...chat,
      themeId,
      themeTitle,
      themeTitleDe,
      updatedAt: now,
      messages: [...chat.messages, coachMsg],
    };

    updateDb((state) => {
      state.freeChats = state.freeChats.map((c) =>
        c.id === chatId ? updatedChat : c
      );
    });

    await prewarmCoachReplyTts(coachMsg.textDe, db.aiConfig);

    return NextResponse.json({ chat: updatedChat, coachMessage: coachMsg });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not switch theme" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Chat id required" }, { status: 400 });
  }
  updateDb((state) => {
    state.freeChats = state.freeChats.filter((c) => c.id !== id);
  });
  return NextResponse.json({ ok: true });
}
