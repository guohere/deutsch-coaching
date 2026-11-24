"use client";

import { useEffect, useState } from "react";
import { VoiceSpeedControl } from "@/components/VoiceSpeedControl";
import {
  CheckCircle2,
  Cpu,
  KeyRound,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Volume2,
  XCircle,
} from "lucide-react";
import { getGermanVoices, speakGerman } from "@/lib/speech";
import {
  CUSTOM_TTS_PRESETS,
  EDGE_GERMAN_VOICES,
  ELEVENLABS_GERMAN_VOICES,
  ElevenLabsGermanVoice,
  GEMINI_AUDIO_VOICES,
} from "@/lib/tts-voices";
import {
  AiConfig,
  AiProviderType,
  CefrLevel,
  CoachStyle,
  DatabaseSchema,
  LearnerProfile,
  TtsProviderType,
} from "@/lib/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [aiConfig, setAiConfig] = useState<AiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [testing, setTesting] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    models?: string[];
    recommendedModel?: string;
  } | null>(null);

  const [germanVoices, setGermanVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [previewingVoice, setPreviewingVoice] = useState(false);
  const [voicePreviewError, setVoicePreviewError] = useState<string | null>(
    null
  );
  const [elevenVoices, setElevenVoices] = useState<ElevenLabsGermanVoice[]>(
    ELEVENLABS_GERMAN_VOICES
  );
  const [fetchingElevenVoices, setFetchingElevenVoices] = useState(false);

  async function handleFetchElevenLabsVoices() {
    if (!aiConfig) return;
    setFetchingElevenVoices(true);
    setVoicePreviewError(null);
    try {
      const res = await fetch("/api/tts/elevenlabs-voices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: aiConfig.customTtsApiKey }),
      });
      const data = await res.json();
      if (Array.isArray(data.voices) && data.voices.length > 0) {
        setElevenVoices(data.voices);
        setSavedNotice(
          `✓ Loaded ${data.voices.length} Free-Tier Default voices from your ElevenLabs account!`
        );
        setTimeout(() => setSavedNotice(null), 4000);
      }
      if (data.error) {
        setVoicePreviewError(data.error);
      }
    } catch {
      // ignore
    } finally {
      setFetchingElevenVoices(false);
    }
  }

  async function autoSaveVoicePatch(patch: Partial<AiConfig>) {
    if (!aiConfig) return;
    const nextCfg = { ...aiConfig, ...patch };
    setAiConfig(nextCfg);
    setVoicePreviewError(null);
    try {
      const res = await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, aiConfig: nextCfg }),
      });
      if (res.ok) {
        setSavedNotice(
          "✓ Voice saved and active across all pages (Hören, Sprechen, Chat & Schreiben)!"
        );
        setTimeout(() => setSavedNotice(null), 3500);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((data: DatabaseSchema) => {
        setProfile(data.profile);
        setAiConfig(data.aiConfig);
        setLoading(false);
      });

    const loadVoices = () => setGermanVoices(getGermanVoices());
    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  async function handleSave() {
    if (!profile || !aiConfig) return;
    setSaving(true);
    try {
      const res = await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, aiConfig }),
      });
      if (res.ok) {
        setSavedNotice("Settings saved locally to data/sprachcoach-db.json!");
        setTimeout(() => setSavedNotice(null), 3500);
      }
    } finally {
      setSaving(false);
    }
  }

  function selectModelForCurrentProvider(modelId: string) {
    setAiConfig((prev) => {
      if (!prev) return prev;
      if (prev.provider === "gemini") return { ...prev, geminiModel: modelId };
      if (prev.provider === "groq") return { ...prev, groqModel: modelId };
      if (prev.provider === "ollama") return { ...prev, ollamaModel: modelId };
      return prev;
    });
  }

  function getActiveModelId(cfg: AiConfig): string {
    if (cfg.provider === "gemini") return cfg.geminiModel;
    if (cfg.provider === "groq") return cfg.groqModel;
    if (cfg.provider === "ollama") return cfg.ollamaModel;
    return "";
  }

  async function handleFetchModels() {
    if (!aiConfig) return;
    setFetchingModels(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiConfig }),
        signal: AbortSignal.timeout(20000),
      });
      const out = await res.json();
      const models: string[] = Array.isArray(out.models) ? out.models : [];
      setAvailableModels(models);

      // Auto-pick the fastest recommended model if current model isn't in the list or is a preview/experimental model
      const current = getActiveModelId(aiConfig);
      if (
        models.length > 0 &&
        (!models.includes(current) ||
          current.includes("hydrogen") ||
          current.includes("preview") ||
          current.includes("image"))
      ) {
        selectModelForCurrentProvider(out.recommended || models[0]);
      }

      setTestResult({
        ok: Boolean(out.ok),
        message: out.message || "Fetched available models.",
        models,
        recommendedModel: out.recommended,
      });
    } catch (err) {
      setTestResult({
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : "Could not reach local server to fetch models.",
      });
    } finally {
      setFetchingModels(false);
    }
  }

  async function handleTestProvider() {
    if (!aiConfig) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiConfig }),
        signal: AbortSignal.timeout(22000),
      });
      const out = await res.json();
      if (Array.isArray(out.models) && out.models.length > 0) {
        setAvailableModels(out.models);
      }
      setTestResult(out);
    } catch (err) {
      setTestResult({
        ok: false,
        message:
          err instanceof Error && err.name === "TimeoutError"
            ? "Connection test timed out after 22s. Try selecting 'gemini-flash-latest' or 'gemini-2.5-flash' for fast voice coaching."
            : err instanceof Error
            ? err.message
            : "Connection test failed.",
      });
    } finally {
      setTesting(false);
    }
  }

  async function handleResetAll() {
    if (
      !window.confirm(
        "Reset all plans, sessions, and learner memory back to fresh A2 -> Goethe B1 defaults?"
      )
    ) {
      return;
    }
    const res = await fetch("/api/state", { method: "DELETE" });
    const fresh = (await res.json()) as DatabaseSchema;
    setProfile(fresh.profile);
    setAiConfig(fresh.aiConfig);
    setSavedNotice("Workspace data reset to clean defaults.");
    setTimeout(() => setSavedNotice(null), 3500);
  }

  if (loading || !profile || !aiConfig) {
    return <div className="h-64 animate-pulse bg-zinc-200 rounded-2xl" />;
  }

  const providers: Array<{
    id: AiProviderType;
    name: string;
    cost: string;
    desc: string;
  }> = [
    {
      id: "gemini",
      name: "Google Gemini API",
      cost: "Free Tier",
      desc: "Best all-round German fluency + live Google Search for latest Goethe exam topics.",
    },
    {
      id: "groq",
      name: "Groq Cloud API",
      cost: "Free Tier",
      desc: "Ultra-fast Llama 3.3 responses + optional Whisper v3 Turbo German speech recognition.",
    },
    {
      id: "ollama",
      name: "Local AI (Ollama)",
      cost: "100% Local & Private",
      desc: "Run qwen2.5:7b or gemma3:12b directly on your PC with zero cloud calls.",
    },
    {
      id: "demo",
      name: "Offline Demo Coach",
      cost: "No Setup",
      desc: "Built-in scripted German coach for testing the UI before adding a key or Ollama.",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Configuration
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-0.5">
            AI Engine, Voice & Learner Settings
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Switch seamlessly between Free Cloud AI (Gemini / Groq) and Local AI
            (Ollama). Your keys and memory stay strictly on your own machine.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-2.5 shadow-sm transition cursor-pointer disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-amber-400" />
          )}
          <span>Save Settings</span>
        </button>
      </div>

      {savedNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900 font-medium">
          {savedNotice}
        </div>
      )}

      {/* 1. AI Engine Selection */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-600" />
            1. AI Coaching Backend
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Choose which AI powers your topic research, editable plans, spoken German
            coaching, and memory updates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {providers.map((p) => {
            const active = aiConfig.provider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setAiConfig({ ...aiConfig, provider: p.id });
                  setTestResult(null);
                  setAvailableModels([]);
                }}
                className={`text-left rounded-2xl border p-4 transition cursor-pointer ${
                  active
                    ? "border-zinc-900 bg-amber-50/60 ring-1 ring-zinc-900"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-zinc-900">
                    {p.name}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                    {p.cost}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Provider-specific fields */}
        {aiConfig.provider === "gemini" && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Google Gemini Configuration (Free at aistudio.google.com)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={aiConfig.geminiApiKey}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, geminiApiKey: e.target.value })
                  }
                  placeholder="AIza..."
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Model ID (pick below or type any)
                </label>
                <input
                  list="gemini-model-options"
                  value={aiConfig.geminiModel}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, geminiModel: e.target.value })
                  }
                  placeholder="gemini-3.5-flash-lite"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
                <datalist id="gemini-model-options">
                  {(availableModels.length > 0
                    ? availableModels
                    : [
                        "gemini-3.5-flash-lite",
                        "gemini-3.5-flash",
                        "gemini-2.5-flash",
                      ]
                  ).map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        )}

        {aiConfig.provider === "groq" && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
              <KeyRound className="w-4 h-4 text-teal-600" />
              <span>Groq Configuration (Free at console.groq.com)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Groq API Key
                </label>
                <input
                  type="password"
                  value={aiConfig.groqApiKey}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, groqApiKey: e.target.value })
                  }
                  placeholder="gsk_..."
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Model ID (pick below or type any)
                </label>
                <input
                  list="groq-model-options"
                  value={aiConfig.groqModel}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, groqModel: e.target.value })
                  }
                  placeholder="llama-3.3-70b-versatile"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
                <datalist id="groq-model-options">
                  {(availableModels.length > 0
                    ? availableModels
                    : ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
                  ).map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-zinc-700 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={aiConfig.groqUseWhisper}
                onChange={(e) =>
                  setAiConfig({ ...aiConfig, groqUseWhisper: e.target.checked })
                }
                className="rounded"
              />
              <span>
                Use <strong>Groq Whisper (whisper-large-v3-turbo)</strong> for
                high-accuracy German voice transcription (works in every browser)
              </span>
            </label>
          </div>
        )}

        {aiConfig.provider === "ollama" && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3">
            <div className="text-xs text-zinc-700">
              Install Ollama and pull a German-strong model such as{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-200 font-mono">
                ollama pull qwen2.5:7b
              </code>{" "}
              or{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-200 font-mono">
                ollama pull gemma3:12b
              </code>
              .
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Ollama Base URL
                </label>
                <input
                  value={aiConfig.ollamaBaseUrl}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, ollamaBaseUrl: e.target.value })
                  }
                  placeholder="http://localhost:11434"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Model Name
                </label>
                <input
                  value={aiConfig.ollamaModel}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, ollamaModel: e.target.value })
                  }
                  placeholder="qwen2.5:7b"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Available Models Picker (Works for Gemini, Groq, AND Ollama!) */}
        {aiConfig.provider !== "demo" && availableModels.length > 0 && (
          <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 space-y-2">
            <div className="text-xs font-semibold text-amber-950">
              Models available for your{" "}
              {aiConfig.provider === "gemini"
                ? "Gemini API key"
                : aiConfig.provider === "groq"
                ? "Groq API key"
                : "Local Ollama"}{" "}
              (click one to select):
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {availableModels.map((m) => {
                const selected = getActiveModelId(aiConfig) === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectModelForCurrentProvider(m)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
                      selected
                        ? "bg-zinc-900 text-white border-zinc-900 font-semibold"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-amber-400 hover:bg-amber-50"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fetch Available Models + Test Connection Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {aiConfig.provider !== "demo" && (
            <button
              type="button"
              onClick={handleFetchModels}
              disabled={fetchingModels}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-semibold px-4 py-2.5 transition cursor-pointer disabled:opacity-60"
            >
              {fetchingModels ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>
                {fetchingModels
                  ? "Checking Your Account..."
                  : "Fetch My Available Models"}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleTestProvider}
            disabled={testing}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold px-4 py-2.5 transition cursor-pointer disabled:opacity-60"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Test AI Connection</span>
          </button>

          {testResult && (
            <div
              className={`inline-flex items-start gap-1.5 text-xs font-medium px-3 py-2 rounded-xl ${
                testResult.ok
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. High-Quality Voice & Listening Preferences */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-teal-600" />
            2. Human German Voice Engine & Hands-Free Defaults
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Upgrade from robotic browser speech to studio-quality Neural German
            voices (free!) or connect any open-source local TTS repo (Kokoro,
            Piper, Chatterbox, OpenAI TTS).
          </p>
        </div>

        {/* Voice Engine Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            [
              {
                id: "edge_neural" as TtsProviderType,
                title: "Neural Human German",
                badge: "Free · Instant",
                desc: "96 kbps Studio Neural voices (Seraphina, Florian, Katja, Conrad) with full-turn breath prosody.",
              },
              {
                id: "gemini_tts" as TtsProviderType,
                title: "Gemini Native Audio",
                badge: "Expressive AI",
                desc: "Uses your Gemini API key (gemini-2.5-flash-preview-tts) for expressive human breathing & tone.",
              },
              {
                id: "openai_compat" as TtsProviderType,
                title: "ElevenLabs / Local TTS",
                badge: "Cloud or Local",
                desc: "Connect ElevenLabs, OpenAI gpt-4o-mini-tts, or local AllTalk, Chatterbox, Kokoro, Piper.",
              },
              {
                id: "browser" as TtsProviderType,
                title: "Browser Built-in TTS",
                badge: "Offline Fallback",
                desc: "Uses your OS system voice offline (faster, but more robotic).",
              },
            ] as const
          ).map((eng) => {
            const active = (aiConfig.ttsProvider ?? "edge_neural") === eng.id;
            return (
              <button
                key={eng.id}
                type="button"
                onClick={() => autoSaveVoicePatch({ ttsProvider: eng.id })}
                className={`text-left rounded-2xl border p-3.5 transition cursor-pointer ${
                  active
                    ? "border-teal-700 bg-teal-50/60 ring-1 ring-teal-700"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs sm:text-sm text-zinc-900">
                    {eng.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 shrink-0">
                    {eng.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                  {eng.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Edge Neural Human Voices */}
        {(aiConfig.ttsProvider ?? "edge_neural") === "edge_neural" && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Neural German Coach Voice (96 kbps Studio Audio)
                </label>
                <select
                  value={
                    aiConfig.edgeVoice || "de-DE-SeraphinaMultilingualNeural"
                  }
                  onChange={(e) =>
                    autoSaveVoicePatch({ edgeVoice: e.target.value })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                >
                  {EDGE_GERMAN_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} — {v.region}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={previewingVoice}
                onClick={() => {
                  setPreviewingVoice(true);
                  setVoicePreviewError(null);
                  speakGerman(
                    "Ach, hallo! Schön, dass du da bist. Ehrlich gesagt freue ich mich schon richtig auf unser Gespräch heute. Wollen wir direkt loslegen?",
                    {
                      rate: aiConfig.voiceRate,
                      ttsProvider: "edge_neural",
                      edgeVoice:
                        aiConfig.edgeVoice ||
                        "de-DE-SeraphinaMultilingualNeural",
                      onEnd: () => setPreviewingVoice(false),
                      onError: () => setPreviewingVoice(false),
                    }
                  );
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-60"
              >
                {previewingVoice ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>{previewingVoice ? "Speaking..." : "Preview Human Voice"}</span>
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              {EDGE_GERMAN_VOICES.find(
                (v) =>
                  v.id ===
                  (aiConfig.edgeVoice || "de-DE-SeraphinaMultilingualNeural")
              )?.style ?? "Natural neural German voice."}
            </p>
          </div>
        )}

        {/* Gemini Native Audio TTS Voices */}
        {aiConfig.ttsProvider === "gemini_tts" && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Gemini Native Audio Voice (Applied System-Wide to Hören, Sprechen &amp; Chat)
                </label>
                <select
                  value={aiConfig.geminiTtsVoice || "Kore"}
                  onChange={(e) =>
                    autoSaveVoicePatch({
                      geminiTtsVoice: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                >
                  {GEMINI_AUDIO_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} — {v.gender}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={previewingVoice}
                onClick={() => {
                  setPreviewingVoice(true);
                  setVoicePreviewError(null);
                  speakGerman(
                    "Ach, hallo! Schön, dass du da bist. Ehrlich gesagt freue ich mich schon richtig auf unser Gespräch heute. Wollen wir direkt loslegen?",
                    {
                      rate: aiConfig.voiceRate,
                      ttsProvider: "gemini_tts",
                      geminiTtsVoice: aiConfig.geminiTtsVoice || "Kore",
                      edgeVoice:
                        aiConfig.edgeVoice ||
                        "de-DE-SeraphinaMultilingualNeural",
                      onEnd: () => setPreviewingVoice(false),
                      onError: () => setPreviewingVoice(false),
                    }
                  );
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-60"
              >
                {previewingVoice ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {previewingVoice ? "Speaking..." : "Preview Gemini Audio"}
                </span>
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              {GEMINI_AUDIO_VOICES.find(
                (v) => v.id === (aiConfig.geminiTtsVoice || "Kore")
              )?.style ??
                "Expressive Gemini Native Audio voice with natural human breathing."}
            </p>
          </div>
        )}

        {/* Open-Source / Custom OpenAI-Compatible TTS Server */}
        {aiConfig.ttsProvider === "openai_compat" && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3">
            {/* 1-Click ElevenLabs Human Voice Picker */}
            <div className="rounded-xl bg-white border border-teal-200 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-teal-900">
                  1-Click ElevenLabs Free-Tier Voice Setup (16 Free Voices · No Paid Plan Needed!)
                </div>
                <button
                  type="button"
                  disabled={fetchingElevenVoices}
                  onClick={handleFetchElevenLabsVoices}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 cursor-pointer disabled:opacity-50"
                >
                  {fetchingElevenVoices ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  <span>Sync My Free Account Voices ({elevenVoices.length})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">
                    ElevenLabs Free-Tier Default Voice (8 Female &amp; 8 Male)
                  </label>
                  <select
                    value={
                      elevenVoices.some((v) => v.id === aiConfig.customTtsVoice)
                        ? aiConfig.customTtsVoice
                        : "Xb7hH8MSUJpSbSDYk0k2"
                    }
                    onChange={(e) => {
                      const vid = e.target.value;
                      autoSaveVoicePatch({
                        customTtsUrl: `https://api.elevenlabs.io/v1/text-to-speech/${vid}`,
                        customTtsModel:
                          aiConfig.customTtsModel?.startsWith("eleven_")
                            ? aiConfig.customTtsModel
                            : "eleven_multilingual_v2",
                        customTtsVoice: vid,
                      });
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
                  >
                    {elevenVoices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label} — {v.gender}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">
                    ElevenLabs Model (Use Multilingual v2 for Native German!)
                  </label>
                  <select
                    value={
                      aiConfig.customTtsModel?.startsWith("eleven_")
                        ? aiConfig.customTtsModel
                        : "eleven_multilingual_v2"
                    }
                    onChange={(e) => {
                      const vid = elevenVoices.some(
                        (v) => v.id === aiConfig.customTtsVoice
                      )
                        ? aiConfig.customTtsVoice
                        : "Xb7hH8MSUJpSbSDYk0k2";
                      autoSaveVoicePatch({
                        customTtsUrl: `https://api.elevenlabs.io/v1/text-to-speech/${vid}`,
                        customTtsModel: e.target.value,
                        customTtsVoice: vid,
                      });
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
                  >
                    <option value="eleven_multilingual_v2">
                      Eleven Multilingual v2 (Best Native German Accent &amp; Calm Tone · Recommended)
                    </option>
                    <option value="eleven_flash_v2_5">
                      Eleven Flash v2.5 (Fast, but more English-accented in German)
                    </option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-teal-900 bg-teal-50/70 border border-teal-100 rounded-lg px-2.5 py-1.5">
                💡 <strong>Why did it sound annoying or give a 402 error before?</strong>{" "}
                1) ElevenLabs blocks &ldquo;Community Library&rdquo; voices (like Aria) on free accounts, but gives you{" "}
                <strong>16 Free Default Voices</strong> (try <strong>Alice</strong>, <strong>Matilda</strong>, <strong>Lily</strong>, <strong>Jessica</strong>, <strong>George</strong>, or <strong>Daniel</strong> above!).{" "}
                2) Switch the model to <strong>Eleven Multilingual v2</strong> — it speaks warm, authentic native Hochdeutsch instead of Flash v2.5&apos;s nasal English accent!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-zinc-600">
                Or pick a preset:
              </span>
              {CUSTOM_TTS_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    autoSaveVoicePatch({
                      customTtsUrl: preset.url,
                      customTtsModel: preset.model,
                      customTtsVoice: preset.voice,
                    });
                  }}
                  className="text-xs px-2.5 py-1 rounded-full bg-white border border-zinc-200 hover:border-teal-500 text-zinc-700 cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  TTS Endpoint URL (OpenAI `/v1/audio/speech` or ElevenLabs URL)
                </label>
                <input
                  value={aiConfig.customTtsUrl ?? ""}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, customTtsUrl: e.target.value })
                  }
                  placeholder="http://localhost:8880/v1/audio/speech"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Model
                </label>
                <input
                  value={aiConfig.customTtsModel ?? ""}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, customTtsModel: e.target.value })
                  }
                  placeholder="eleven_multilingual_v2 / kokoro / tts-1"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  Voice Name / ID
                </label>
                <input
                  value={aiConfig.customTtsVoice ?? ""}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, customTtsVoice: e.target.value })
                  }
                  placeholder="Rachel / af_bella / de_DE-thorsten-high"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-600 mb-1">
                    API Key (required for ElevenLabs / OpenAI; leave blank for local servers)
                  </label>
                  <input
                    type="password"
                    value={aiConfig.customTtsApiKey ?? ""}
                    onChange={(e) =>
                      setAiConfig({
                        ...aiConfig,
                        customTtsApiKey: e.target.value,
                      })
                    }
                    placeholder="xi-... (ElevenLabs) or sk-... (OpenAI)"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={previewingVoice}
                  onClick={() => {
                    setPreviewingVoice(true);
                    setVoicePreviewError(null);

                    const keyTrim = (aiConfig.customTtsApiKey ?? "").trim();
                    const isElevenKey =
                      keyTrim.startsWith("sk_") || keyTrim.startsWith("xi-");
                    const activeVoice =
                      isElevenKey &&
                      !elevenVoices.some(
                        (v) => v.id === aiConfig.customTtsVoice
                      )
                        ? "Xb7hH8MSUJpSbSDYk0k2"
                        : aiConfig.customTtsVoice || "Xb7hH8MSUJpSbSDYk0k2";
                    const activeUrl =
                      isElevenKey &&
                      !(aiConfig.customTtsUrl ?? "").includes(
                        "api.elevenlabs.io"
                      )
                        ? `https://api.elevenlabs.io/v1/text-to-speech/${activeVoice}`
                        : aiConfig.customTtsUrl;
                    const activeModel =
                      isElevenKey &&
                      !(aiConfig.customTtsModel ?? "").startsWith("eleven_")
                        ? "eleven_multilingual_v2"
                        : aiConfig.customTtsModel;

                    void autoSaveVoicePatch({
                      ttsProvider: "openai_compat",
                      customTtsUrl: activeUrl,
                      customTtsModel: activeModel,
                      customTtsVoice: activeVoice,
                      customTtsApiKey: keyTrim,
                    });

                    speakGerman(
                      "Ach, hallo! Schön, dass du da bist. Ich spreche jetzt mit deiner neuen menschlichen Stimme von ElevenLabs auf Deutsch!",
                      {
                        rate: aiConfig.voiceRate,
                        ttsProvider: "openai_compat",
                        customTtsUrl: activeUrl,
                        customTtsModel: activeModel,
                        customTtsVoice: activeVoice,
                        customTtsApiKey: keyTrim,
                        disableBrowserFallback: true,
                        onEnd: () => setPreviewingVoice(false),
                        onError: (errMsg) => {
                          setPreviewingVoice(false);
                          setVoicePreviewError(
                            errMsg ||
                              "Could not connect to custom TTS server. Paste your ElevenLabs API key (sk_...) above or switch to 'Gemini Native Audio' / 'Neural Human German'!"
                          );
                        },
                      }
                    );
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-60"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Save &amp; Preview Voice</span>
                </button>
              </div>
            </div>

            {voicePreviewError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-900 flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{voicePreviewError}</span>
              </div>
            )}
          </div>
        )}

        {/* Browser Offline Fallback Voices */}
        {aiConfig.ttsProvider === "browser" && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                System / Browser German Voice
              </label>
              <select
                value={aiConfig.preferredVoiceName}
                onChange={(e) =>
                  setAiConfig({
                    ...aiConfig,
                    preferredVoiceName: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Auto-select best browser German voice</option>
                {germanVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() =>
                speakGerman(
                  "Hallo! Ich bin dein deutscher Sprachcoach. Lass uns heute zusammen üben!",
                  {
                    rate: aiConfig.voiceRate,
                    ttsProvider: "browser",
                    voiceName: aiConfig.preferredVoiceName || undefined,
                  }
                )
              }
              className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-xs font-semibold text-zinc-800 cursor-pointer shrink-0"
            >
              Preview
            </button>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-600">
            Default Speaking Speed ({aiConfig.voiceRate}× — choose preset or type any custom number 0.5× to 2.0×)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <VoiceSpeedControl
              value={aiConfig.voiceRate}
              onChange={(nextSpeed) =>
                autoSaveVoicePatch({ voiceRate: nextSpeed })
              }
            />
            <input
              type="range"
              min={0.5}
              max={1.6}
              step={0.05}
              value={aiConfig.voiceRate}
              onChange={(e) =>
                autoSaveVoicePatch({ voiceRate: Number(e.target.value) })
              }
              className="w-48 sm:w-64 accent-zinc-900"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-5 pt-1 text-xs text-zinc-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={aiConfig.autoSpeak}
              onChange={(e) =>
                setAiConfig({ ...aiConfig, autoSpeak: e.target.checked })
              }
            />
            <span>Auto-speak coach replies aloud in German</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={aiConfig.handsFreeDefault}
              onChange={(e) =>
                setAiConfig({ ...aiConfig, handsFreeDefault: e.target.checked })
              }
            />
            <span>Enable Hands-Free Always-Talk Loop by default</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={aiConfig.blindListeningDefault}
              onChange={(e) =>
                setAiConfig({
                  ...aiConfig,
                  blindListeningDefault: e.target.checked,
                })
              }
            />
            <span>Start sessions in Blind Listening Mode (blur German text)</span>
          </label>
        </div>
      </section>

      {/* 3. Learner Profile */}
      <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 space-y-4">
        <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          3. Learner Profile & Coaching Style
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Name
            </label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Current Level
            </label>
            <select
              value={profile.currentLevel}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  currentLevel: e.target.value as CefrLevel,
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            >
              {(["A1", "A2", "B1", "B2", "C1"] as CefrLevel[]).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Target Level
            </label>
            <select
              value={profile.targetLevel}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  targetLevel: e.target.value as CefrLevel,
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            >
              {(["A1", "A2", "B1", "B2", "C1"] as CefrLevel[]).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Support Language (Explanations & Hints)
            </label>
            <input
              value={profile.nativeLanguage}
              onChange={(e) =>
                setProfile({ ...profile, nativeLanguage: e.target.value })
              }
              placeholder="English / Chinese / Spanish..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Daily Target (minutes)
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={profile.dailyMinutes}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  dailyMinutes: Number(e.target.value) || 15,
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Coaching Style
            </label>
            <select
              value={profile.coachStyle}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  coachStyle: e.target.value as CoachStyle,
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            >
              <option value="encouraging">Encouraging & Gentle</option>
              <option value="balanced">Balanced Personal Coach</option>
              <option value="exam_strict">Strict Goethe Examiner</option>
            </select>
          </div>
        </div>
      </section>

      {/* Reset Local Data */}
      <section className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-rose-900">
            Reset Local Progress & Memory
          </h3>
          <p className="text-xs text-rose-800/80">
            Clears your local study plan, session transcripts, and memory back to
            initial defaults.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetAll}
          className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Local Data</span>
        </button>
      </section>
    </div>
  );
}
