import { NextResponse } from "next/server";
import { createCoachMessage, generateCoachTurn } from "@/lib/ai/coach";
import { readDb, upsertSession } from "@/lib/db";
import { prewarmCoachReplyTts } from "@/lib/tts-engine";
import { SessionMessage, StudyModule } from "@/lib/types";

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
    const session = db.sessions.find((s) => s.id === id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const moduleItem: StudyModule =
      db.plan.modules.find((m) => m.id === session.moduleId) ?? {
        id: session.moduleId,
        order: 0,
        title: session.moduleTitle,
        titleDe: session.moduleTitle,
        category: session.moduleCategory,
        targetLevel: db.profile.targetLevel,
        durationMinutes: 10,
        scenarioPrompt: "Guided German speaking conversation.",
        coachRole: "German speaking coach",
        learnerGoal: "Practice fluent German speaking.",
        grammarFocus: [],
        keyVocabulary: [],
        status: "in_progress",
        source: "custom",
        completedCount: 0,
      };

    const targetBottleneck = session.targetBottleneckId
      ? db.memory.bottlenecks.find((b) => b.id === session.targetBottleneckId)
      : undefined;

    const coachReply = await generateCoachTurn(
      db,
      session,
      moduleItem,
      learnerTextDe,
      targetBottleneck
    );

    const learnerMsg: SessionMessage = {
      id: `msg-${Date.now()}-u`,
      role: "learner",
      textDe: learnerTextDe,
      phase: session.currentPhase,
      timestamp: new Date().toISOString(),
      correction: coachReply.correction,
    };

    const coachMsg = createCoachMessage(coachReply);

    const updatedSession = {
      ...session,
      turnCount: session.turnCount + 1,
      currentPhase: coachReply.nextPhase,
      durationSeconds:
        typeof body.durationSeconds === "number"
          ? body.durationSeconds
          : session.durationSeconds,
      messages: [...session.messages, learnerMsg, coachMsg],
    };

    upsertSession(updatedSession);

    // Pre-warm Sentence 1 TTS on the server right before returning so voice starts with ~0ms gap!
    await prewarmCoachReplyTts(coachMsg.textDe, db.aiConfig);

    return NextResponse.json({
      session: updatedSession,
      coachMessage: coachMsg,
      learnerMessage: learnerMsg,
      shouldOfferDebrief: coachReply.shouldOfferDebrief,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process turn" },
      { status: 500 }
    );
  }
}
