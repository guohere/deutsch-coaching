import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { synthesizeClipWithCache } from "@/lib/tts-engine";
import { TtsProviderType } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = String(body.text ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const db = readDb();
    const cfg = db.aiConfig;

    const provider: TtsProviderType =
      body.ttsProvider || cfg.ttsProvider || "edge_neural";
    const rate =
      typeof body.rate === "number" ? body.rate : cfg.voiceRate ?? 1.1;
    const edgeVoice = String(
      body.edgeVoice || cfg.edgeVoice || "de-DE-SeraphinaMultilingualNeural"
    );
    const speakerEdgeVoiceHint = body.speakerEdgeVoiceHint
      ? String(body.speakerEdgeVoiceHint)
      : undefined;

    if (provider === "browser") {
      return NextResponse.json(
        { error: "Browser TTS selected; synthesize client-side." },
        { status: 400 }
      );
    }

    const clip = await synthesizeClipWithCache({
      text,
      provider,
      rate,
      edgeVoice,
      speakerEdgeVoiceHint,
      geminiApiKey: String(cfg.geminiApiKey ?? ""),
      geminiTtsVoice: String(
        body.geminiTtsVoice || cfg.geminiTtsVoice || "Kore"
      ),
      customUrl: String(body.customTtsUrl ?? cfg.customTtsUrl ?? ""),
      customModel: String(body.customTtsModel ?? cfg.customTtsModel ?? ""),
      customVoice: String(body.customTtsVoice ?? cfg.customTtsVoice ?? ""),
      customApiKey: String(body.customTtsApiKey ?? cfg.customTtsApiKey ?? ""),
      allowNeuralFallback: body.allowNeuralFallback !== false,
    });

    return new NextResponse(Buffer.from(clip.buffer), {
      status: 200,
      headers: {
        "Content-Type": clip.contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Neural voice synthesis failed",
      },
      { status: 500 }
    );
  }
}
