export interface EdgeGermanVoice {
  id: string;
  label: string;
  gender: "Female" | "Male";
  region: string;
  style: string;
}

/**
 * Complete catalog of 20 official 100% Free Neural German voices (Germany, Austria, Switzerland).
 * Every single one of these works for free with zero paid plan or API key required.
 */
export const EDGE_GERMAN_VOICES: EdgeGermanVoice[] = [
  // --- FEMALE VOICES (11 Free Voices) ---
  {
    id: "de-DE-SeraphinaMultilingualNeural",
    label: "Seraphina (Warm & Modern Female · Recommended)",
    gender: "Female",
    region: "Germany",
    style: "Warm, modern, very human conversational tone",
  },
  {
    id: "de-DE-KatjaNeural",
    label: "Katja (Calm & Clear Hochdeutsch Female)",
    gender: "Female",
    region: "Germany",
    style: "Calm, crisp, clear pronunciation — ideal for Goethe exam listening",
  },
  {
    id: "de-DE-ElkeNeural",
    label: "Elke (Gentle, Mature & Relaxed Female)",
    gender: "Female",
    region: "Germany",
    style: "Soft, patient, non-intrusive tutor voice",
  },
  {
    id: "de-DE-KlarissaNeural",
    label: "Klarissa (Smooth & Articulate Female)",
    gender: "Female",
    region: "Germany",
    style: "Balanced, pleasant audiobook/podcast tone",
  },
  {
    id: "de-DE-LouisaNeural",
    label: "Louisa (Casual & Natural Everyday Female)",
    gender: "Female",
    region: "Germany",
    style: "Relaxed, natural everyday speaking partner",
  },
  {
    id: "de-DE-MajaNeural",
    label: "Maja (Warm Storyteller Female)",
    gender: "Female",
    region: "Germany",
    style: "Expressive yet calm narrative voice",
  },
  {
    id: "de-DE-TanjaNeural",
    label: "Tanja (Steady & Clear Tutor Female)",
    gender: "Female",
    region: "Germany",
    style: "Clear, measured pacing for A2/B1 learners",
  },
  {
    id: "de-DE-AmalaNeural",
    label: "Amala (Friendly & Expressive Female)",
    gender: "Female",
    region: "Germany",
    style: "Upbeat, friendly everyday conversation",
  },
  {
    id: "de-DE-GiselaNeural",
    label: "Gisela (Young & Bright Female)",
    gender: "Female",
    region: "Germany",
    style: "Light, youthful tone",
  },
  {
    id: "de-AT-IngridNeural",
    label: "Ingrid (Warm Austrian German Female)",
    gender: "Female",
    region: "Austria",
    style: "Soft Austrian Hochdeutsch — great for Goethe/ÖSD listening",
  },
  {
    id: "de-CH-LeniNeural",
    label: "Leni (Gentle Swiss Hochdeutsch Female)",
    gender: "Female",
    region: "Switzerland",
    style: "Calm Swiss Standard German",
  },

  // --- MALE VOICES (9 Free Voices) ---
  {
    id: "de-DE-FlorianMultilingualNeural",
    label: "Florian (Warm & Natural Male · Recommended)",
    gender: "Male",
    region: "Germany",
    style: "Warm, relaxed, natural everyday German male voice",
  },
  {
    id: "de-DE-ConradNeural",
    label: "Conrad (Calm & Deep Hochdeutsch Male)",
    gender: "Male",
    region: "Germany",
    style: "Calm, deep podcast/examiner German",
  },
  {
    id: "de-DE-ChristophNeural",
    label: "Christoph (Articulate & Friendly Male)",
    gender: "Male",
    region: "Germany",
    style: "Smooth, natural conversational male partner",
  },
  {
    id: "de-DE-BerndNeural",
    label: "Bernd (Steady & Mature Male)",
    gender: "Male",
    region: "Germany",
    style: "Grounded, calm baritone voice",
  },
  {
    id: "de-DE-KasperNeural",
    label: "Kasper (Relaxed Everyday Male)",
    gender: "Male",
    region: "Germany",
    style: "Casual, friendly speaking style",
  },
  {
    id: "de-DE-RalfNeural",
    label: "Ralf (Clear & Measured Male)",
    gender: "Male",
    region: "Germany",
    style: "Clear, steady news/examiner pronunciation",
  },
  {
    id: "de-DE-KillianNeural",
    label: "Killian (Young & Casual Male)",
    gender: "Male",
    region: "Germany",
    style: "Natural, younger conversational voice",
  },
  {
    id: "de-AT-JonasNeural",
    label: "Jonas (Natural Austrian German Male)",
    gender: "Male",
    region: "Austria",
    style: "Pleasant Austrian Hochdeutsch male voice",
  },
  {
    id: "de-CH-JanNeural",
    label: "Jan (Calm Swiss Hochdeutsch Male)",
    gender: "Male",
    region: "Switzerland",
    style: "Clear Swiss Standard German male voice",
  },
];

export interface GeminiAudioVoice {
  id: string;
  label: string;
  gender: "Female" | "Male";
  style: string;
}

export const GEMINI_AUDIO_VOICES: GeminiAudioVoice[] = [
  // --- FEMALE ---
  {
    id: "Aoede",
    label: "Aoede (Warm & Expressive Female)",
    gender: "Female",
    style: "Warm, natural conversational female inflection (Recommended)",
  },
  {
    id: "Kore",
    label: "Kore (Calm & Clear Tutor Female)",
    gender: "Female",
    style: "Articulate, calm, patient German tutor tone",
  },
  {
    id: "Zephyr",
    label: "Zephyr (Gentle & Relaxed Female)",
    gender: "Female",
    style: "Soft, soothing, non-annoying conversational voice",
  },
  {
    id: "Callirrhoe",
    label: "Callirrhoe (Smooth & Articulate Female)",
    gender: "Female",
    style: "Balanced, clear podcast-host style",
  },
  {
    id: "Despina",
    label: "Despina (Casual Everyday Female)",
    gender: "Female",
    style: "Relaxed, natural dialogue partner",
  },
  {
    id: "Leda",
    label: "Leda (Friendly & Youthful Female)",
    gender: "Female",
    style: "Encouraging, upbeat conversation partner",
  },
  // --- MALE ---
  {
    id: "Puck",
    label: "Puck (Warm & Conversational Male)",
    gender: "Male",
    style: "Relaxed, spontaneous everyday German speaking partner",
  },
  {
    id: "Charon",
    label: "Charon (Deep & Calm Male)",
    gender: "Male",
    style: "Thoughtful, steady podcast/examiner tone",
  },
  {
    id: "Orus",
    label: "Orus (Smooth & Articulate Male)",
    gender: "Male",
    style: "Friendly, clear male tutor voice",
  },
  {
    id: "Enceladus",
    label: "Enceladus (Grounded & Steady Male)",
    gender: "Male",
    style: "Calm, mature baritone voice",
  },
  {
    id: "Fenrir",
    label: "Fenrir (Young & Casual Male)",
    gender: "Male",
    style: "Casual everyday speaking style",
  },
];

export interface ElevenLabsGermanVoice {
  id: string;
  name: string;
  label: string;
  gender: "Female" | "Male";
  style: string;
}

/**
 * All 16 official ElevenLabs DEFAULT ("premade") voices that work 100% FREE on the
 * ElevenLabs Free Tier API (no 402 "library voices require paid plan" error!).
 * Tip: Use with model `eleven_multilingual_v2` for authentic native German pronunciation.
 */
export const ELEVENLABS_GERMAN_VOICES: ElevenLabsGermanVoice[] = [
  // --- FREE-TIER FEMALE VOICES (8 Voices) ---
  {
    id: "Xb7hH8MSUJpSbSDYk0k2",
    name: "Alice",
    label: "Alice (Calm & Clear European Female · Free Tier)",
    gender: "Female",
    style: "Calm, natural European voice — speaks clean, pleasant German with Multilingual v2",
  },
  {
    id: "XrExE9yKIg1WjnnlVkGX",
    name: "Matilda",
    label: "Matilda (Warm & Friendly Storyteller Female · Free Tier)",
    gender: "Female",
    style: "Warm, gentle, very natural human cadence",
  },
  {
    id: "pFZP5JQG7iQjIQuC4Bku",
    name: "Lily",
    label: "Lily (Soft, Calm & Velvety Female · Free Tier)",
    gender: "Female",
    style: "Relaxed, mellow European tone — never harsh or shrill",
  },
  {
    id: "cgSgspJ2msm6clMCkdW9",
    name: "Jessica",
    label: "Jessica (Expressive Conversational Female · Free Tier)",
    gender: "Female",
    style: "Natural, friendly everyday conversation partner",
  },
  {
    id: "FGY2WhTYpPnrIDTdsKH5",
    name: "Laura",
    label: "Laura (Upbeat & Friendly Female · Free Tier)",
    gender: "Female",
    style: "Clear, encouraging conversational voice",
  },
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    label: "Rachel (Calm & Articulate Female · Free Tier)",
    gender: "Female",
    style: "Classic calm studio voice",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    label: "Sarah (Soft Conversational Female · Free Tier)",
    gender: "Female",
    style: "Soft-spoken conversational voice",
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld",
    name: "Domi",
    label: "Domi (Clear & Confident Female · Free Tier)",
    gender: "Female",
    style: "Crisp, clear pronunciation",
  },

  // --- FREE-TIER MALE VOICES (8 Voices) ---
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    label: "George (Warm & Calm European Male · Free Tier)",
    gender: "Male",
    style: "Warm, natural European male voice — great German pronunciation with Multilingual v2",
  },
  {
    id: "onwK4e9ZLuTAKqWW03F9",
    name: "Daniel",
    label: "Daniel (Clear European Broadcast Male · Free Tier)",
    gender: "Male",
    style: "Crisp, authoritative European pronunciation — ideal for Hören exams",
  },
  {
    id: "cjVigY5qzO86Huf0OWal",
    name: "Eric",
    label: "Eric (Smooth & Friendly Conversational Male · Free Tier)",
    gender: "Male",
    style: "Relaxed, natural everyday male voice",
  },
  {
    id: "IKne3meq5aSn9XLyUdCD",
    name: "Charlie",
    label: "Charlie (Relaxed & Natural Male · Free Tier)",
    gender: "Male",
    style: "Casual, human-sounding dialogue partner",
  },
  {
    id: "N2lVS1w4EtoT3dr4eOWO",
    name: "Callum",
    label: "Callum (Deep & Smooth Male · Free Tier)",
    gender: "Male",
    style: "Calm, deeper male voice",
  },
  {
    id: "bIHbv24MWmeRgasZH58o",
    name: "Will",
    label: "Will (Friendly & Laid-Back Male · Free Tier)",
    gender: "Male",
    style: "Warm, approachable young male voice",
  },
  {
    id: "nPczCjzI2devNBz1zQrb",
    name: "Brian",
    label: "Brian (Deep & Resonant Male · Free Tier)",
    gender: "Male",
    style: "Calm, steady baritone voice",
  },
  {
    id: "TX3LPaxmHKxFdv7VOQHJ",
    name: "Liam",
    label: "Liam (Articulate Young Male · Free Tier)",
    gender: "Male",
    style: "Clear conversational male voice",
  },
];

export const CUSTOM_TTS_PRESETS = [
  {
    name: "ElevenLabs (Multilingual v2 · Native German Accent)",
    url: "https://api.elevenlabs.io/v1/text-to-speech/Xb7hH8MSUJpSbSDYk0k2",
    model: "eleven_multilingual_v2",
    voice: "Xb7hH8MSUJpSbSDYk0k2",
    note: "Best German accent & warmth on ElevenLabs (uses Alice · Free-Tier Default Voice)",
  },
  {
    name: "Kokoro-FastAPI (Local GitHub Repo)",
    url: "http://localhost:8880/v1/audio/speech",
    model: "kokoro",
    voice: "af_bella",
    note: "Runs locally via remsky/Kokoro-FastAPI (Docker or Python)",
  },
  {
    name: "AllTalk TTS / Chatterbox / Piper (Local)",
    url: "http://localhost:7851/v1/audio/speech",
    model: "tts-1",
    voice: "de_DE-thorsten-high",
    note: "Local AllTalk / Chatterbox / Piper server exposing /v1/audio/speech",
  },
  {
    name: "OpenAI TTS (gpt-4o-mini-tts)",
    url: "https://api.openai.com/v1/audio/speech",
    model: "gpt-4o-mini-tts",
    voice: "coral",
    note: "Official OpenAI human-quality TTS (requires OpenAI API key)",
  },
];
