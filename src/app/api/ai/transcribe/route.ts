import { NextResponse } from "next/server";
import {
  transcribeWithGeminiAudio,
  transcribeWithGroqWhisper,
} from "@/lib/ai/providers";
import { readDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const db = readDb();
    const hasGroq = Boolean(db.aiConfig.groqApiKey?.trim());
    const hasGemini = Boolean(db.aiConfig.geminiApiKey?.trim());

    if (!hasGroq && !hasGemini) {
      return NextResponse.json(
        {
          error:
            "Neither Groq Whisper nor Gemini API key is configured for audio transcription.",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    if (!(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing audio file in form data." },
        { status: 400 }
      );
    }

    const rawName = audio instanceof File && audio.name ? audio.name : "";
    const mime = (audio.type || "").toLowerCase();
    const filename =
      rawName ||
      (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")
        ? "recording.mp4"
        : mime.includes("ogg")
        ? "recording.ogg"
        : mime.includes("wav")
        ? "recording.wav"
        : "recording.webm");

    // Prefer Groq Whisper when explicitly enabled + key present; otherwise use Gemini native audio!
    if (hasGroq && db.aiConfig.groqUseWhisper) {
      const text = await transcribeWithGroqWhisper(
        db.aiConfig.groqApiKey,
        audio,
        filename
      );
      return NextResponse.json({ text, engine: "groq_whisper" });
    }

    if (hasGemini) {
      const text = await transcribeWithGeminiAudio(
        db.aiConfig.geminiApiKey,
        db.aiConfig.geminiModel,
        audio,
        mime
      );
      return NextResponse.json({ text, engine: "gemini_audio" });
    }

    const text = await transcribeWithGroqWhisper(
      db.aiConfig.groqApiKey,
      audio,
      filename
    );
    return NextResponse.json({ text, engine: "groq_whisper" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
