import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { AiConfig, TtsProviderType } from "./types";

interface CachedClip {
  buffer: Uint8Array;
  contentType: string;
  isFallback?: boolean;
}

// Keep in-memory cache + in-flight coalescing + Gemini TTS queue across hot reloads
const globalForTts = globalThis as unknown as {
  __sprachcoachAudioCacheV2?: Map<string, CachedClip>;
  __sprachcoachInFlightV2?: Map<string, Promise<CachedClip>>;
  __sprachcoachEdgeClients?: Map<string, { tts: MsEdgeTTS; ready: Promise<void> }>;
  __sprachcoachGeminiQueue?: Promise<unknown>;
};

const audioCache =
  globalForTts.__sprachcoachAudioCacheV2 ??
  (globalForTts.__sprachcoachAudioCacheV2 = new Map<string, CachedClip>());

const inFlight =
  globalForTts.__sprachcoachInFlightV2 ??
  (globalForTts.__sprachcoachInFlightV2 = new Map<string, Promise<CachedClip>>());

const edgeClients =
  globalForTts.__sprachcoachEdgeClients ??
  (globalForTts.__sprachcoachEdgeClients = new Map());

const MAX_CACHE_ENTRIES = 100;

function setCache(key: string, clip: CachedClip) {
  if (clip.isFallback) return; // Never cache a temporary fallback under the primary voice key
  if (audioCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = audioCache.keys().next().value;
    if (oldestKey) audioCache.delete(oldestKey);
  }
  audioCache.set(key, clip);
}

/**
 * Serializes Gemini TTS requests with a small spacing so multi-section Hören
 * exercises never trigger concurrent 429 rate-limit drops on the preview TTS endpoint.
 */
function enqueueGeminiTts<T>(task: () => Promise<T>): Promise<T> {
  const prev = globalForTts.__sprachcoachGeminiQueue ?? Promise.resolve();
  const next = prev
    .catch(() => null)
    .then(() => task());
  globalForTts.__sprachcoachGeminiQueue = next;
  return next;
}

/**
 * Cleans written-German artifacts (slashes, abbreviations, markdown, bracket tags,
 * stiff typographic dashes) so neural TTS speaks with natural human rhythm and pauses.
 */
export function humanizeGermanTextForSpeech(raw: string): string {
  return raw
    .replace(/\[.*?\]/g, "") // strip grammar tags like [Verb am Ende]
    .replace(/\bhttps?:\/\/\S+\s*/gi, "") // strip raw URLs
    .replace(/\bwww\.[a-z0-9.-]+\.[a-z]{2,}\s*[·•|-]?\s*/gi, "") // strip forum header URLs like www.schulforum-aktuell.de ·
    .replace(/([A-Za-zÄÖÜäöüß])_([A-Za-zÄÖÜäöüß])/g, "$1 $2") // convert Julia_M -> Julia M
    .replace(/[*_`#]+/g, "") // strip markdown formatting
    .replace(/\s*·\s*/g, ", ") // convert middle dots into soft breath pauses
    .replace(/\bFreund\/in\b/gi, "Freund oder Freundin")
    .replace(/\bSchüler\/innen\b/gi, "Schülerinnen und Schüler")
    .replace(/\bKollege\/in\b/gi, "Kollege oder Kollegin")
    .replace(/\bPartner\/in\b/gi, "Partner oder Partnerin")
    .replace(/\bMitarbeiter\/innen\b/gi, "Mitarbeiterinnen und Mitarbeiter")
    .replace(/\bz\.\s*B\./gi, "zum Beispiel")
    .replace(/\bd\.\s*h\./gi, "das heißt")
    .replace(/\bbzw\./gi, "beziehungsweise")
    .replace(/\bca\./gi, "zirka")
    .replace(/\busw\./gi, "und so weiter")
    .replace(/\bu\.\s*a\./gi, "unter anderem")
    .replace(/\bPkt\./g, "Punkte")
    .replace(/\bMin\./g, "Minuten")
    .replace(/\s*[—–]\s*/g, ", ") // convert em/en-dashes to soft comma breath pauses
    .replace(/->|→/g, " bis ")
    .replace(/[„“"]/g, "") // remove quote marks that trigger artificial TTS pauses
    .replace(/\s{2,}/g, " ")
    .trim();
}

function escapeSsmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rateNumberToEdgePercent(rate: number): string {
  const clamped = Math.max(0.5, Math.min(2.0, rate || 1.1));
  const pct = Math.round((clamped - 1) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Groups German sentences into cohesive conversational passages (~900 chars).
 * Keeping a full coach turn or an entire Hören short text / dialogue turn in ONE
 * synthesis stream preserves natural cross-sentence intonation, human breathing,
 * and avoids multi-request rate limits.
 */
export function splitIntoGermanSentences(text: string): string[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  if (cleaned.length <= 950) {
    return [cleaned];
  }

  const rawParts = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawParts.length <= 1) return [cleaned];

  const groups: string[] = [];
  let current = "";
  for (const part of rawParts) {
    if (!current) {
      current = part;
    } else if (current.length + 1 + part.length <= 850) {
      current = `${current} ${part}`;
    } else {
      groups.push(current);
      current = part;
    }
  }
  if (current) {
    groups.push(current);
  }

  return groups;
}

async function getWarmEdgeClient(voiceName: string): Promise<MsEdgeTTS> {
  const voice = voiceName || "de-DE-SeraphinaMultilingualNeural";
  const existing = edgeClients.get(voice);
  if (existing) {
    try {
      await existing.ready;
      return existing.tts;
    } catch {
      edgeClients.delete(voice);
    }
  }

  const tts = new MsEdgeTTS({
    connectionTimeoutMs: 7000,
    synthesisTimeoutMs: 15000,
  });

  // 96kbps 24kHz high-fidelity neural audio for warm, natural human vocal formants
  const ready = tts.setMetadata(
    voice,
    OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
  );

  edgeClients.set(voice, { tts, ready });

  try {
    await ready;
    return tts;
  } catch (err) {
    edgeClients.delete(voice);
    throw err;
  }
}

async function synthesizeEdgeNeuralFast(
  text: string,
  voice: string,
  rate: number
): Promise<Uint8Array> {
  const spokenText = humanizeGermanTextForSpeech(text) || text;
  const attemptSynth = async (resetClient: boolean) => {
    const voiceId = voice || "de-DE-SeraphinaMultilingualNeural";
    if (resetClient) {
      const old = edgeClients.get(voiceId);
      if (old) {
        try {
          old.tts.close();
        } catch {
          // ignore
        }
        edgeClients.delete(voiceId);
      }
    }

    const tts = await getWarmEdgeClient(voiceId);
    const { audioStream } = tts.toStream(escapeSsmlText(spokenText), {
      rate: rateNumberToEdgePercent(rate),
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const bytes = new Uint8Array(Buffer.concat(chunks));
    if (bytes.byteLength === 0) {
      throw new Error("Empty Edge TTS stream");
    }
    return bytes;
  };

  try {
    return await attemptSynth(false);
  } catch {
    return await attemptSynth(true);
  }
}

/**
 * Wraps raw 24kHz 16-bit mono PCM bytes from Gemini 2.5 Flash TTS into a standard WAV container.
 */
function pcm24kMono16BitToWav(
  pcmBytes: Uint8Array,
  sampleRate = 24000
): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBytes.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  const out = new Uint8Array(buffer);
  out.set(pcmBytes, 44);
  return out;
}

/**
 * Maps multi-speaker Hören role voices (e.g. Male vs. Female speakers in Hören Teil 3/4)
 * to distinct Gemini Native Audio voices while always using the learner's chosen primary
 * Gemini voice for single-speaker texts and primary roles.
 */
export function resolveGeminiVoiceForSpeaker(
  preferredGeminiVoice: string,
  speakerEdgeVoiceHint?: string
): string {
  const primary = preferredGeminiVoice || "Kore";
  if (!speakerEdgeVoiceHint) return primary;

  const hint = speakerEdgeVoiceHint.toLowerCase();
  // If section explicitly requests a male speaker (Conrad / Florian / Killian)
  if (
    hint.includes("conrad") ||
    hint.includes("florian") ||
    hint.includes("killian")
  ) {
    return primary === "Puck" ? "Charon" : "Puck";
  }
  // If section explicitly requests a 2nd distinct female speaker (Katja / Amala)
  if (hint.includes("katja") || hint.includes("amala")) {
    return primary === "Aoede" ? "Leda" : "Aoede";
  }
  return primary;
}

/**
 * Maps each Gemini voice to a strict gender- and character-matched 96kbps Neural German
 * voice so a Female selection (Aoede, Kore, Leda) NEVER falls back to a Male voice!
 */
export function mapGeminiVoiceToGenderMatchedNeural(voiceName: string): string {
  switch (voiceName) {
    // Female voices -> 6 distinct Female Neural German voices
    case "Aoede":
      return "de-DE-SeraphinaMultilingualNeural"; // Warm Expressive Female
    case "Kore":
      return "de-DE-KatjaNeural"; // Calm Clear Female
    case "Zephyr":
      return "de-DE-ElkeNeural"; // Gentle Relaxed Female
    case "Callirrhoe":
      return "de-DE-KlarissaNeural"; // Smooth Articulate Female
    case "Despina":
      return "de-DE-LouisaNeural"; // Casual Everyday Female
    case "Leda":
      return "de-DE-MajaNeural"; // Warm Storyteller Female
    // Male voices -> 5 distinct Male Neural German voices
    case "Puck":
      return "de-DE-FlorianMultilingualNeural"; // Warm Conversational Male
    case "Charon":
      return "de-DE-ConradNeural"; // Deep Calm Male
    case "Orus":
      return "de-DE-ChristophNeural"; // Smooth Articulate Male
    case "Enceladus":
      return "de-DE-BerndNeural"; // Grounded Steady Male
    case "Fenrir":
      return "de-DE-KasperNeural"; // Relaxed Everyday Male
    default:
      return "de-DE-SeraphinaMultilingualNeural";
  }
}

async function synthesizeGeminiNativeAudioTts(params: {
  apiKey: string;
  voiceName: string;
  text: string;
  fallbackEdgeVoice: string;
  rate: number;
}): Promise<CachedClip> {
  const voiceName = params.voiceName || "Aoede";
  const genderMatchedEdgeVoice = mapGeminiVoiceToGenderMatchedNeural(voiceName);
  const apiKey = params.apiKey.trim() || process.env.GEMINI_API_KEY || "";

  // Note: Vertex Express keys starting with "AQ." do not expose the AI Studio
  // gemini-2.5-flash-preview-tts endpoint, so skip straight to the gender-matched
  // 96kbps Neural voice without waiting on a failed HTTP roundtrip.
  if (!apiKey || apiKey.startsWith("AQ.")) {
    const bytes = await synthesizeEdgeNeuralFast(
      params.text,
      genderMatchedEdgeVoice,
      params.rate
    );
    return { buffer: bytes, contentType: "audio/mpeg" };
  }

  const spokenText = humanizeGermanTextForSpeech(params.text) || params.text;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  return enqueueGeminiTts(async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Read the following German text aloud with a warm, natural, realistic human voice and authentic German pronunciation:\n\n${spokenText}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName,
                  },
                },
              },
            },
          }),
          signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) {
          if (attempt === 0 && (res.status === 429 || res.status >= 500)) {
            await new Promise((r) => setTimeout(r, 600));
            continue;
          }
          throw new Error(`Gemini TTS status ${res.status}`);
        }

        const data = (await res.json()) as {
          candidates?: Array<{
            content?: {
              parts?: Array<{
                inlineData?: { mimeType?: string; data?: string };
              }>;
            };
          }>;
        };

        const inline = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (!inline?.data) {
          throw new Error("Empty Gemini TTS audio payload");
        }

        const rawBytes = new Uint8Array(Buffer.from(inline.data, "base64"));
        const mime = (inline.mimeType || "").toLowerCase();
        if (
          mime.includes("wav") ||
          mime.includes("mpeg") ||
          mime.includes("mp3")
        ) {
          return {
            buffer: rawBytes,
            contentType: mime.includes("wav") ? "audio/wav" : "audio/mpeg",
          };
        }

        const wavBytes = pcm24kMono16BitToWav(rawBytes, 24000);
        return { buffer: wavBytes, contentType: "audio/wav" };
      } catch {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
      }
    }

    // Strict gender-matched 96kbps Neural German fallback (Female -> Female, Male -> Male)
    const bytes = await synthesizeEdgeNeuralFast(
      params.text,
      genderMatchedEdgeVoice,
      params.rate
    );
    return { buffer: bytes, contentType: "audio/mpeg", isFallback: true };
  });
}

const ELEVENLABS_VOICE_NAME_TO_ID: Record<string, string> = {
  alice: "Xb7hH8MSUJpSbSDYk0k2",
  matilda: "XrExE9yKIg1WjnnlVkGX",
  lily: "pFZP5JQG7iQjIQuC4Bku",
  jessica: "cgSgspJ2msm6clMCkdW9",
  laura: "FGY2WhTYpPnrIDTdsKH5",
  rachel: "21m00Tcm4TlvDq8ikWAM",
  sarah: "EXAVITQu4vr4xnSDxMaL",
  domi: "AZnzlk1XvdvUeBnXmlld",
  george: "JBFqnCBsd6RMkjVDRZzb",
  daniel: "onwK4e9ZLuTAKqWW03F9",
  eric: "cjVigY5qzO86Huf0OWal",
  charlie: "IKne3meq5aSn9XLyUdCD",
  callum: "N2lVS1w4EtoT3dr4eOWO",
  will: "bIHbv24MWmeRgasZH58o",
  brian: "nPczCjzI2devNBz1zQrb",
  liam: "TX3LPaxmHKxFdv7VOQHJ",
};

function resolveElevenLabsVoiceId(
  voiceOrId: string,
  endpoint: string,
  speakerEdgeVoiceHint?: string
): string {
  // In multi-speaker Hören dialogues, differentiate Male vs. Female speakers using Free-Tier Premade voices
  if (speakerEdgeVoiceHint) {
    const hint = speakerEdgeVoiceHint.toLowerCase();
    if (
      hint.includes("conrad") ||
      hint.includes("florian") ||
      hint.includes("killian")
    ) {
      return "JBFqnCBsd6RMkjVDRZzb"; // George (Warm Calm European Male · Free Tier)
    }
    if (hint.includes("katja") || hint.includes("amala")) {
      return "XrExE9yKIg1WjnnlVkGX"; // Matilda (Warm Storyteller Female · Free Tier)
    }
  }

  const trimmed = (voiceOrId || "").trim();
  const byName = ELEVENLABS_VOICE_NAME_TO_ID[trimmed.toLowerCase()];
  if (byName) return byName;
  if (/^[a-zA-Z0-9]{18,24}$/.test(trimmed)) return trimmed;

  const urlMatch = endpoint.match(/text-to-speech\/([a-zA-Z0-9]{18,24})/);
  if (urlMatch?.[1]) return urlMatch[1];

  return "Xb7hH8MSUJpSbSDYk0k2"; // Default to Alice (Calm Clear European Female · Free Tier)
}

async function synthesizeOpenAiCompat(params: {
  url: string;
  model: string;
  voice: string;
  apiKey: string;
  text: string;
  rate: number;
  speakerEdgeVoiceHint?: string;
}): Promise<CachedClip> {
  const endpoint = params.url.trim();
  const apiKey = params.apiKey.trim();
  const isElevenLabs =
    endpoint.includes("api.elevenlabs.io") ||
    apiKey.startsWith("sk_") ||
    apiKey.startsWith("xi-") ||
    (params.model || "").startsWith("eleven_");

  if (!endpoint && !isElevenLabs) {
    throw new Error(
      "Custom TTS URL is empty. Enter a running local TTS URL or paste your ElevenLabs API key."
    );
  }

  const spokenText = humanizeGermanTextForSpeech(params.text) || params.text;

  // Native ElevenLabs synthesis (automatically resolves voice ID & URL!)
  if (isElevenLabs) {
    if (!apiKey) {
      throw new Error(
        "ElevenLabs requires your ElevenLabs API Key (starts with sk_...). Paste it in the API Key field below!"
      );
    }
    const voiceId = resolveElevenLabsVoiceId(
      params.voice,
      endpoint,
      params.speakerEdgeVoiceHint
    );
    const modelId = (params.model || "").startsWith("eleven_")
      ? params.model
      : "eleven_multilingual_v2";

    const callEleven = async (vid: string, includeSpeed: boolean) =>
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: spokenText,
          model_id: modelId,
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.78,
            style: 0.0,
            use_speaker_boost: true,
            ...(includeSpeed
              ? {
                  speed: Math.max(
                    0.7,
                    Math.min(1.2, Number((params.rate || 1.0).toFixed(2)))
                  ),
                }
              : {}),
          },
        }),
        signal: AbortSignal.timeout(18000),
      });

    let res = await callEleven(voiceId, true);
    // If model rejects `speed` inside voice_settings (400/422), retry cleanly without `speed`
    if (res.status === 400 || res.status === 422) {
      res = await callEleven(voiceId, false);
    }
    // If user selected a paid-only Library voice ID (402), retry once with Free-Tier Default Alice
    if (res.status === 402 && voiceId !== "Xb7hH8MSUJpSbSDYk0k2") {
      res = await callEleven("Xb7hH8MSUJpSbSDYk0k2", false);
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `ElevenLabs API error (${res.status}): ${errText.slice(0, 240)}`
      );
    }
    const arr = new Uint8Array(await res.arrayBuffer());
    return { buffer: arr, contentType: "audio/mpeg" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (params.apiKey.trim()) {
    headers.Authorization = `Bearer ${params.apiKey.trim()}`;
  }

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: params.model || "tts-1",
        input: spokenText,
        voice: params.voice || "alloy",
        speed: Math.max(0.5, Math.min(2.0, params.rate || 1.0)),
        response_format: "mp3",
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(
      `Could not connect to local TTS server at ${endpoint}. Make sure your local TTS server (AllTalk / Kokoro / Piper) is running, or use 'Gemini Native Audio' / 'Neural Human German' for zero-setup human voices.`
    );
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Custom TTS server error (${res.status}): ${errText.slice(0, 220)}`
    );
  }

  const contentType = res.headers.get("content-type") || "audio/mpeg";
  const arr = new Uint8Array(await res.arrayBuffer());
  return { buffer: arr, contentType };
}

export interface SynthesizeParams {
  text: string;
  provider: TtsProviderType;
  rate: number;
  edgeVoice: string;
  speakerEdgeVoiceHint?: string;
  geminiApiKey?: string;
  geminiTtsVoice?: string;
  customUrl?: string;
  customModel?: string;
  customVoice?: string;
  customApiKey?: string;
  allowNeuralFallback?: boolean;
}

export async function synthesizeClipWithCache(
  params: SynthesizeParams
): Promise<CachedClip> {
  const cleaned = params.text.trim();
  const effectiveGeminiVoice = resolveGeminiVoiceForSpeaker(
    params.geminiTtsVoice || "Kore",
    params.speakerEdgeVoiceHint
  );

  const cacheKey = `${params.provider}|${
    params.provider === "edge_neural"
      ? params.speakerEdgeVoiceHint || params.edgeVoice
      : params.provider === "gemini_tts"
      ? effectiveGeminiVoice
      : `${params.customUrl}|${params.customModel}|${params.customVoice}|${
          params.speakerEdgeVoiceHint || ""
        }`
  }|${params.rate.toFixed(2)}|${cleaned}`;

  const hit = audioCache.get(cacheKey);
  if (hit) return hit;

  const pending = inFlight.get(cacheKey);
  if (pending) return pending;

  const promise = (async (): Promise<CachedClip> => {
    if (params.provider === "gemini_tts") {
      const clip = await synthesizeGeminiNativeAudioTts({
        apiKey: params.geminiApiKey ?? "",
        voiceName: effectiveGeminiVoice,
        text: cleaned,
        fallbackEdgeVoice: params.speakerEdgeVoiceHint || params.edgeVoice,
        rate: params.rate,
      });
      setCache(cacheKey, clip);
      return clip;
    }

    if (params.provider === "openai_compat") {
      try {
        const clip = await synthesizeOpenAiCompat({
          url: params.customUrl ?? "",
          model: params.customModel ?? "",
          voice: params.customVoice ?? "",
          apiKey: params.customApiKey ?? "",
          text: cleaned,
          rate: params.rate,
          speakerEdgeVoiceHint: params.speakerEdgeVoiceHint,
        });
        setCache(cacheKey, clip);
        return clip;
      } catch (err) {
        if (params.allowNeuralFallback === false) {
          throw err;
        }
        // Never drop to the robotic OS browser voice if ElevenLabs quota/network fails:
        // seamlessly fall back to gender-matched 96kbps Neural Human German!
        const elId = resolveElevenLabsVoiceId(
          params.customVoice ?? "",
          params.customUrl ?? "",
          params.speakerEdgeVoiceHint
        );
        const femaleElevenIds = new Set([
          "Xb7hH8MSUJpSbSDYk0k2", // Alice
          "XrExE9yKIg1WjnnlVkGX", // Matilda
          "pFZP5JQG7iQjIQuC4Bku", // Lily
          "cgSgspJ2msm6clMCkdW9", // Jessica
          "FGY2WhTYpPnrIDTdsKH5", // Laura
          "21m00Tcm4TlvDq8ikWAM", // Rachel
          "EXAVITQu4vr4xnSDxMaL", // Sarah
          "AZnzlk1XvdvUeBnXmlld", // Domi
        ]);
        const fallbackVoice =
          params.speakerEdgeVoiceHint ||
          (femaleElevenIds.has(elId)
            ? "de-DE-SeraphinaMultilingualNeural"
            : params.edgeVoice || "de-DE-FlorianMultilingualNeural");
        const bytes = await synthesizeEdgeNeuralFast(
          cleaned,
          fallbackVoice,
          params.rate
        );
        return { buffer: bytes, contentType: "audio/mpeg", isFallback: true };
      }
    }

    const bytes = await synthesizeEdgeNeuralFast(
      cleaned,
      params.speakerEdgeVoiceHint || params.edgeVoice,
      params.rate
    );
    const clip = { buffer: bytes, contentType: "audio/mpeg" };
    setCache(cacheKey, clip);
    return clip;
  })();

  inFlight.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(cacheKey);
  }
}

/**
 * Called on the server the millisecond the LLM finishes generating `coachTextDe`.
 * Kicks off synthesis immediately so when the browser renders the text and requests `/api/tts`,
 * the audio stream is ALREADY ready in memory (`~0ms` gap between text & voice!).
 */
export async function prewarmCoachReplyTts(
  fullTextDe: string,
  aiConfig: AiConfig
): Promise<void> {
  const provider = aiConfig.ttsProvider ?? "edge_neural";
  if (provider === "browser" || !aiConfig.autoSpeak) return;

  const sentences = splitIntoGermanSentences(fullTextDe);
  if (sentences.length === 0) return;

  const baseParams: Omit<SynthesizeParams, "text"> = {
    provider,
    rate: aiConfig.voiceRate ?? 1.1,
    edgeVoice: aiConfig.edgeVoice || "de-DE-SeraphinaMultilingualNeural",
    geminiApiKey: aiConfig.geminiApiKey,
    geminiTtsVoice: aiConfig.geminiTtsVoice || "Kore",
    customUrl: aiConfig.customTtsUrl,
    customModel: aiConfig.customTtsModel,
    customVoice: aiConfig.customTtsVoice,
    customApiKey: aiConfig.customTtsApiKey,
  };

  const firstPromise = synthesizeClipWithCache({
    ...baseParams,
    text: sentences[0],
  }).catch(() => null);

  for (let i = 1; i < sentences.length; i++) {
    synthesizeClipWithCache({
      ...baseParams,
      text: sentences[i],
    }).catch(() => null);
  }

  await Promise.race([
    firstPromise,
    new Promise((resolve) => setTimeout(resolve, 120)),
  ]);
}
