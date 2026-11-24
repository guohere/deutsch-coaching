import { NextResponse } from "next/server";
import { extractFreeChatInsights } from "@/lib/ai/free-chat";
import {
  addVocabularyItems,
  readDb,
  recordMasteryProgress,
  updateDb,
  upsertBottleneck,
} from "@/lib/db";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = readDb();
    const chat = db.freeChats.find((c) => c.id === id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const insights = await extractFreeChatInsights(db, chat);
    const now = new Date().toISOString();

    updateDb((state) => {
      for (const bn of insights.newBottlenecks) {
        upsertBottleneck(bn);
      }

      if (insights.newVocabulary.length > 0) {
        addVocabularyItems(
          insights.newVocabulary.map((v) => ({
            german: v.german,
            meaning: v.meaning,
            exampleDe: v.exampleDe,
            topic: `Free Chat: ${chat.themeTitleDe}`,
          }))
        );
      }

      state.freeChats = state.freeChats.map((c) =>
        c.id === id ? { ...c, savedToMemoryAt: now } : c
      );

      state.memory.totalMinutesPracticed += Math.max(2, chat.turnCount * 2);
      const todayKey = now.slice(0, 10);
      if (state.memory.lastPracticeDate !== todayKey) {
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        state.memory.streakDays =
          state.memory.lastPracticeDate === yesterday
            ? state.memory.streakDays + 1
            : 1;
        state.memory.lastPracticeDate = todayKey;
      }

      state.memory.lastSessionRecap = `Free Chat (${chat.themeTitleDe}): ${insights.summary}`;

      for (const improvedTitle of insights.improvedBottlenecks) {
        const match = state.memory.bottlenecks.find(
          (b) =>
            b.title.toLowerCase().includes(improvedTitle.toLowerCase()) ||
            improvedTitle.toLowerCase().includes(b.title.toLowerCase())
        );
        if (match) {
          match.severity =
            match.severity === "improving" ? "mastered" : "improving";
          match.lastSeenAt = now;
        }
      }

      recordMasteryProgress({
        skill: "sprechen",
        sessionScore: insights.score,
        label: `Free Chat: ${chat.themeTitle}`,
        topicHint: `${chat.themeTitle} ${chat.themeTitleDe}`,
        grammarHints: insights.improvedBottlenecks,
        newVocabCount: insights.newVocabulary.length,
        alsoBoostListening: true,
      });
    });

    return NextResponse.json({
      ok: true,
      insights,
      savedAt: now,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save insights" },
      { status: 500 }
    );
  }
}
