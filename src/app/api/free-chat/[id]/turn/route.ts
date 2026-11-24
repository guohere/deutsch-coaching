import { NextResponse } from "next/server";
import { generateFreeChatReply } from "@/lib/ai/free-chat";
import { readDb, updateDb } from "@/lib/db";
import { prewarmCoachReplyTts } from "@/lib/tts-engine";
import { FreeChatMessage, FreeChatRecord } from "@/lib/types";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const learnerTextDe = String(body.textDe ?? "").trim();
    if (!learnerTextDe) {
      return NextResponse.json(
        { error: "Spoken or typed German text is required." },
        { status: 400 }
      );
    }

    const db = readDb();
    const chat = db.freeChats.find((c) => c.id === id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const reply = await generateFreeChatReply(db, chat, learnerTextDe);
    const now = new Date().toISOString();

    const learnerMsg: FreeChatMessage = {
      id: `fc-msg-${Date.now()}-u`,
      role: "learner",
      textDe: learnerTextDe,
      timestamp: now,
      correction: reply.correction,
      alternatives: reply.alternatives,
    };

    const coachMsg: FreeChatMessage = {
      id: `fc-msg-${Date.now()}-c`,
      role: "coach",
      textDe: reply.coachTextDe,
      translation: reply.translation,
      timestamp: now,
      hints: reply.hints,
      memoryBridgeNote: reply.memoryBridgeNote,
    };

    const updatedChat: FreeChatRecord = {
      ...chat,
      updatedAt: now,
      turnCount: chat.turnCount + 1,
      messages: [...chat.messages, learnerMsg, coachMsg],
    };

    updateDb((state) => {
      state.freeChats = state.freeChats.map((c) =>
        c.id === id ? updatedChat : c
      );
    });

    await prewarmCoachReplyTts(coachMsg.textDe, db.aiConfig);

    return NextResponse.json({
      chat: updatedChat,
      learnerMessage: learnerMsg,
      coachMessage: coachMsg,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process chat turn" },
      { status: 500 }
    );
  }
}
