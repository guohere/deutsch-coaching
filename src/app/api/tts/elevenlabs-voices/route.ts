import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { ELEVENLABS_GERMAN_VOICES } from "@/lib/tts-voices";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const db = readDb();
    const apiKey = String(
      body.apiKey ?? db.aiConfig.customTtsApiKey ?? ""
    ).trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Paste your ElevenLabs API key (sk_...) in the API Key field first.",
          voices: ELEVENLABS_GERMAN_VOICES,
        },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          error: `ElevenLabs returned ${res.status}: ${errText.slice(0, 180)}`,
          voices: ELEVENLABS_GERMAN_VOICES,
        },
        { status: 200 }
      );
    }

    const data = (await res.json()) as {
      voices?: Array<{
        voice_id: string;
        name: string;
        category?: string;
        labels?: Record<string, string>;
      }>;
    };

    // Only keep "premade" / "generated" / "cloned" voices that work on the Free Tier API (exclude paid-only library voices)
    const freeVoices = (data.voices ?? [])
      .filter((v) => v.category === "premade" || v.category === "generated")
      .map((v) => {
        const gRaw = (v.labels?.gender || "").toLowerCase();
        const gender: "Female" | "Male" = gRaw.includes("male") && !gRaw.includes("female")
          ? "Male"
          : "Female";
        const desc = [
          v.labels?.description,
          v.labels?.age,
          v.labels?.accent,
          v.labels?.["use case"] || v.labels?.use_case,
        ]
          .filter(Boolean)
          .join(" · ");

        return {
          id: v.voice_id,
          name: v.name,
          label: `${v.name} (${desc || "Default Free-Tier Voice"})`,
          gender,
          style: desc || "Official ElevenLabs Free-Tier Default Voice",
        };
      });

    return NextResponse.json({
      voices: freeVoices.length > 0 ? freeVoices : ELEVENLABS_GERMAN_VOICES,
      count: freeVoices.length,
    });
  } catch (err) {
    return NextResponse.json({
      error:
        err instanceof Error ? err.message : "Could not fetch ElevenLabs voices",
      voices: ELEVENLABS_GERMAN_VOICES,
    });
  }
}
