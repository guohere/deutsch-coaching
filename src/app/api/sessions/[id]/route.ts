import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = readDb();
  const session = db.sessions.find((s) => s.id === id);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const moduleItem =
    db.plan.modules.find((m) => m.id === session.moduleId) ?? null;
  const targetBottleneck = session.targetBottleneckId
    ? db.memory.bottlenecks.find((b) => b.id === session.targetBottleneckId) ??
      null
    : null;

  return NextResponse.json({
    session,
    module: moduleItem,
    targetBottleneck,
    profile: db.profile,
    aiConfig: {
      provider: db.aiConfig.provider,
      ttsProvider: db.aiConfig.ttsProvider ?? "edge_neural",
      edgeVoice: db.aiConfig.edgeVoice ?? "de-DE-SeraphinaMultilingualNeural",
      voiceRate: db.aiConfig.voiceRate,
      preferredVoiceName: db.aiConfig.preferredVoiceName,
      autoSpeak: db.aiConfig.autoSpeak,
      handsFreeDefault: db.aiConfig.handsFreeDefault,
      blindListeningDefault: db.aiConfig.blindListeningDefault,
      groqUseWhisper: db.aiConfig.groqUseWhisper,
      hasGroqKey: Boolean(db.aiConfig.groqApiKey?.trim()),
      hasGeminiKey: Boolean(db.aiConfig.geminiApiKey?.trim()),
    },
  });
}
