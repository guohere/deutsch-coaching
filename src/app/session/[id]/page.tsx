"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { VoiceSpeedControl } from "@/components/VoiceSpeedControl";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  HelpCircle,
  Keyboard,
  Languages,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Radio,
  Send,
  SlidersHorizontal,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  BrowserSpeechRecognition,
  createGermanSpeechRecognition,
  getGermanVoices,
  getPreferredRecordingMimeType,
  isIncompleteGermanClause,
  isIosDevice,
  speakGerman,
  stopSpeaking,
  unlockMobileAudio,
} from "@/lib/speech";
import {
  Bottleneck,
  LearnerProfile,
  SessionMessage,
  SessionPhase,
  SessionRecord,
  StudyModule,
  TtsProviderType,
} from "@/lib/types";

interface SessionPayload {
  session: SessionRecord;
  module: StudyModule | null;
  targetBottleneck: Bottleneck | null;
  profile: LearnerProfile;
  aiConfig: {
    provider: string;
    ttsProvider: TtsProviderType;
    edgeVoice: string;
    voiceRate: number;
    preferredVoiceName: string;
    autoSpeak: boolean;
    handsFreeDefault: boolean;
    blindListeningDefault: boolean;
    groqUseWhisper: boolean;
    hasGroqKey: boolean;
    hasGeminiKey?: boolean;
  };
}

const PHASES: Array<{ key: SessionPhase; label: string }> = [
  { key: "warmup", label: "1. Warm-up" },
  { key: "practice", label: "2. Guided Practice" },
  { key: "correction_drill", label: "3. Spoken Drill" },
  { key: "debrief", label: "4. Debrief" },
];

function getSpeakingExpectations(category: StudyModule["category"]): string[] {
  switch (category) {
    case "exam_teil1_planning":
      return [
        "Machen Sie konkrete Vorschläge zu allen 4 Leitpunkten (Wann, Wo, Was mitbringen, Kosten/Verkehr) im höflichen Konjunktiv II („Wir könnten...“, „Ich würde vorschlagen, dass...“).",
        "Fragen Sie Ihren Partner nach seiner Meinung („Was hältst du davon?“) und gehen Sie auf seinen Gegenvorschlag ein.",
        "Verhandeln Sie höflich, wenn ein Termin oder Vorschlag nicht passt — sagen Sie nicht nur „Ja“.",
        "Fassen Sie die gemeinsame Vereinbarung am Ende kurz zusammen und bestätigen Sie den Plan.",
      ];
    case "exam_teil2_presentation":
      return [
        "Stellen Sie das Thema kurz vor und berichten Sie zuerst über Ihre persönlichen Erfahrungen.",
        "Erklären Sie, wie die Situation zu diesem Thema in Ihrem Heimatland aussieht.",
        "Nennen Sie mindestens 2 Vorteile und 2 Nachteile mit klaren Konnektoren („Einerseits... andererseits...“, „Ein großer Vorteil ist, dass...“, „obwohl“, „weil“).",
        "Formulieren Sie Ihre persönliche Meinung als Fazit und beantworten Sie die Anschlussfragen.",
      ];
    case "exam_teil3_discussion":
      return [
        "Geben Sie Ihrem Partner zuerst eine freundliche Rückmeldung und loben Sie einen konkreten Punkt.",
        "Stellen Sie 1–2 offene Anschlussfragen zum Thema („Mich würde interessieren, ob...“).",
        "Antworten Sie spontan auf die Gegenfragen Ihres Partners und begründen Sie Ihre Meinung („weil / denn“).",
      ];
    case "bottleneck_drill":
      return [
        "Achten Sie besonders auf den korrekten Satzbau (z. B. Verb am Ende im Nebensatz mit „weil“, „dass“, „wenn“).",
        "Wenn der Coach eine Korrektur vorschlägt, wiederholen Sie den verbesserten Satz laut auf Deutsch.",
        "Sprechen Sie in vollständigen, verbundenen Sätzen statt nur mit einzelnen Wörtern.",
      ];
    case "listening_qa":
      return [
        "Nutzen Sie gern den Blind-Listening-Modus, um zuerst nur zuzuhören, bevor Sie den deutschen Text aufdecken.",
        "Reagieren Sie direkt, höflich und lösungsorientiert auf jede Alltagssituation.",
        "Fragen Sie auf Deutsch nach, falls Sie etwas nicht verstanden haben („Könnten Sie das bitte wiederholen?“).",
      ];
    default:
      return [
        "Bleiben Sie auf Deutsch und antworten Sie in 2–3 zusammenhängenden Sätzen pro Beitrag.",
        "Stellen Sie Ihrem Gesprächspartner 1–2 natürliche Anschlussfragen.",
        "Nutzen Sie jederzeit die Tipp-/Hinweis-Taste, falls Ihnen ein Wort fehlt.",
      ];
  }
}

export default function SessionStudioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params.id;

  const [data, setData] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Voice & Listening controls
  const [handsFree, setHandsFree] = useState(true);
  const [silenceMs, setSilenceMs] = useState<number>(3000); // 0 = Manual (never cut off), 3000 = 3s Default
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [midSentenceGrace, setMidSentenceGrace] = useState(false);
  const [blindListening, setBlindListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceRate, setVoiceRate] = useState(1.1);
  const [voiceName, setVoiceName] = useState("");
  const [ttsProvider, setTtsProvider] = useState<TtsProviderType>("edge_neural");
  const [edgeVoice, setEdgeVoice] = useState("de-DE-SeraphinaMultilingualNeural");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribingWhisper, setTranscribingWhisper] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);

  // Live transcript & typing fallback
  const [liveTranscript, setLiveTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showGuideline, setShowGuideline] = useState(true);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [sampleDialogue, setSampleDialogue] = useState<{
    summary: string;
    exchanges: Array<{
      speaker: "Partner" | "You (Example)";
      german: string;
      translation: string;
    }>;
  } | null>(null);

  // Message UI toggles
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [translatedIds, setTranslatedIds] = useState<Record<string, boolean>>({});
  const [expandedCorrIds, setExpandedCorrIds] = useState<Record<string, boolean>>(
    {}
  );

  // Refs for voice loop
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepListeningRef = useRef(false);
  const committedTranscriptRef = useRef("");
  const transcriptAccRef = useRef("");
  const vadStreamRef = useRef<MediaStream | null>(null);
  const vadAudioCtxRef = useRef<AudioContext | null>(null);
  const vadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vadSpeakingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const spokenInitialRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const handsFreeRef = useRef(handsFree);
  const silenceMsRef = useRef(silenceMs);
  const sendingRef = useRef(sending);

  useEffect(() => {
    handsFreeRef.current = handsFree;
  }, [handsFree]);

  useEffect(() => {
    silenceMsRef.current = silenceMs;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sprachcoach_silence_ms_v2", String(silenceMs));
    }
  }, [silenceMs]);

  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsIos(isIosDevice());
      // Auto-collapse the guideline card on phones so the chat & mic are immediately visible
      if (window.innerWidth < 768) {
        setShowGuideline(false);
      }
      const saved = window.localStorage.getItem("sprachcoach_silence_ms_v2");
      if (saved !== null) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && [0, 2200, 3000, 5000, 8000].includes(parsed)) {
          setSilenceMs(parsed);
        }
      }
    }
  }, []);

  // Load session data
  useEffect(() => {
    let active = true;
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Session not found");
        return r.json();
      })
      .then((payload: SessionPayload) => {
        if (!active) return;
        setData(payload);
        setVoiceRate(payload.aiConfig.voiceRate || 1.1);
        setVoiceName(payload.aiConfig.preferredVoiceName || "");
        setTtsProvider(payload.aiConfig.ttsProvider || "edge_neural");
        setEdgeVoice(
          payload.aiConfig.edgeVoice || "de-DE-SeraphinaMultilingualNeural"
        );
        setAutoSpeak(payload.aiConfig.autoSpeak);
        setHandsFree(payload.aiConfig.handsFreeDefault);
        setBlindListening(payload.aiConfig.blindListeningDefault);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setErrorMsg(e.message);
        setLoading(false);
      });

    // Ensure German voices are populated in Chrome/Edge
    getGermanVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        getGermanVoices();
      };
    }

    const testRec = createGermanSpeechRecognition();
    setSttSupported(Boolean(testRec));

    return () => {
      active = false;
      keepListeningRef.current = false;
      stopSpeaking();
      recognitionRef.current?.abort();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
      vadStreamRef.current?.getTracks().forEach((t) => t.stop());
      vadAudioCtxRef.current?.close().catch(() => {});
    };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.session.messages.length, sending, liveTranscript]);

  const clearSilenceTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownSec(null);
    setMidSentenceGrace(false);
  }, []);

  const stopVadMonitor = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (vadStreamRef.current) {
      vadStreamRef.current.getTracks().forEach((t) => t.stop());
      vadStreamRef.current = null;
    }
    if (vadAudioCtxRef.current) {
      vadAudioCtxRef.current.close().catch(() => {});
      vadAudioCtxRef.current = null;
    }
    vadSpeakingRef.current = false;
    setVoiceActive(false);
  }, []);

  const stopListening = useCallback(() => {
    keepListeningRef.current = false;
    clearSilenceTimers();
    stopVadMonitor();
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, [clearSilenceTimers, stopVadMonitor]);

  const submitLearnerUtterance = useCallback(
    async (rawText: string) => {
      const cleaned = rawText.trim();
      if (!cleaned || sendingRef.current) return;

      unlockMobileAudio();
      stopListening();
      stopSpeaking();
      committedTranscriptRef.current = "";
      transcriptAccRef.current = "";
      setSending(true);
      setLiveTranscript("");
      setTextInput("");
      setShowHints(false);
      setErrorMsg(null);

      try {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        const res = await fetch(`/api/sessions/${sessionId}/turn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            textDe: cleaned,
            durationSeconds: elapsed,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "Could not get coach response");
        }

        setData((prev) =>
          prev
            ? {
                ...prev,
                session: result.session,
              }
            : prev
        );

        // Proactively speak the coach's German reply!
        if (autoSpeak && result.coachMessage?.textDe) {
          if (typeof window !== "undefined" && result.coachMessage?.id) {
            window.sessionStorage.setItem(
              `sprachcoach_last_spoken_${sessionId}`,
              result.coachMessage.id
            );
          }
          speakGerman(result.coachMessage.textDe, {
            rate: voiceRate,
            voiceName: voiceName || undefined,
            ttsProvider,
            edgeVoice,
            onStart: () => setIsSpeaking(true),
            onEnd: () => {
              setIsSpeaking(false);
              // Hands-free loop: automatically reopen mic if session isn't finished (desktop/Android; iOS requires user tap)
              if (
                !isIosDevice() &&
                handsFreeRef.current &&
                !result.shouldOfferDebrief &&
                !(data?.aiConfig.hasGroqKey && data?.aiConfig.groqUseWhisper)
              ) {
                setTimeout(() => {
                  startBrowserRecognitionRef.current?.();
                }, 350);
              }
            },
            onError: () => setIsSpeaking(false),
          });
        }
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to send response"
        );
      } finally {
        setSending(false);
      }
    },
    [
      autoSpeak,
      data?.aiConfig.groqUseWhisper,
      data?.aiConfig.hasGroqKey,
      edgeVoice,
      sessionId,
      stopListening,
      ttsProvider,
      voiceName,
      voiceRate,
    ]
  );

  const scheduleAutoSendCountdown = useCallback(
    (
      baseDelayMs: number,
      textSnapshot?: string,
      allowSendAfterStop = false
    ) => {
      clearSilenceTimers();
      if (!handsFreeRef.current || baseDelayMs <= 0) return;

      const currentText = (textSnapshot ?? transcriptAccRef.current).trim();
      if (!currentText) return;

      // Dynamic patience: if learner paused mid-sentence on a dangling word
      // like "und", "ohne", "weil", "dass", add +3s extra grace automatically!
      const isIncomplete = isIncompleteGermanClause(currentText);
      const effectiveDelayMs = isIncomplete ? baseDelayMs + 3000 : baseDelayMs;
      setMidSentenceGrace(isIncomplete);

      const deadline = Date.now() + effectiveDelayMs;
      countdownIntervalRef.current = setInterval(() => {
        const remaining = Math.ceil((deadline - Date.now()) / 1000);
        if (remaining > 0) {
          setCountdownSec(remaining);
        } else {
          setCountdownSec(null);
        }
      }, 200);

      silenceTimerRef.current = setTimeout(() => {
        // Double-check the learner didn't just resume speaking via VAD!
        if (vadSpeakingRef.current) {
          scheduleAutoSendCountdown(baseDelayMs, undefined, allowSendAfterStop);
          return;
        }
        clearSilenceTimers();
        const captured = transcriptAccRef.current.trim();
        if (captured && (keepListeningRef.current || allowSendAfterStop)) {
          submitLearnerUtterance(captured);
        }
      }, effectiveDelayMs);
    },
    [clearSilenceTimers, submitLearnerUtterance]
  );

  // Real-time microphone Voice Activity Detection (100ms):
  // Immediately cancels & refreshes the silence countdown the moment you start
  // speaking again after a pause — without waiting for Google STT's 1s decode lag!
  const startVadMonitor = useCallback(async () => {
    stopVadMonitor();
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof AudioContext === "undefined"
    ) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!keepListeningRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      vadStreamRef.current = stream;
      vadAudioCtxRef.current = audioCtx;

      const dataArray = new Uint8Array(analyser.fftSize);
      let quietTicks = 0;

      vadIntervalRef.current = setInterval(() => {
        if (!keepListeningRef.current || sendingRef.current) return;
        analyser.getByteTimeDomainData(dataArray);

        let sumSq = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / dataArray.length);
        const speakingNow = rms > 0.025;

        if (speakingNow) {
          quietTicks = 0;
          if (!vadSpeakingRef.current) {
            vadSpeakingRef.current = true;
            setVoiceActive(true);
            // Learner resumed speaking! Immediately cancel any active countdown so it refreshes fully
            clearSilenceTimers();
          }
        } else {
          quietTicks += 1;
          // After ~400ms of actual silence following voice activity, start a FRESH full countdown!
          if (vadSpeakingRef.current && quietTicks >= 4) {
            vadSpeakingRef.current = false;
            setVoiceActive(false);
            if (
              transcriptAccRef.current.trim().length > 0 &&
              handsFreeRef.current &&
              silenceMsRef.current > 0
            ) {
              scheduleAutoSendCountdown(silenceMsRef.current);
            }
          }
        }
      }, 100);
    } catch {
      // Silently ignore if mic stream cannot be shared; SpeechRecognition events still work
    }
  }, [clearSilenceTimers, scheduleAutoSendCountdown, stopVadMonitor]);

  // Ref wrapper so TTS onEnd can trigger browser STT without circular dependency
  const startBrowserRecognitionRef = useRef<(() => void) | null>(null);

  const launchRecognitionInstance = useCallback(() => {
    if (!keepListeningRef.current || sendingRef.current) return;

    const rec = createGermanSpeechRecognition();
    if (!rec) {
      keepListeningRef.current = false;
      stopVadMonitor();
      setSttSupported(false);
      setShowTextInput(true);
      setErrorMsg(
        "Live browser speech recognition isn't available in this browser (use Chrome/Edge, add a free Groq key for Whisper, or type below)."
      );
      return;
    }

    recognitionRef.current = rec;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onspeechstart = () => {
      setVoiceActive(true);
      clearSilenceTimers();
    };

    rec.onsoundstart = () => {
      if (transcriptAccRef.current.trim().length > 0) {
        clearSilenceTimers();
      }
    };

    rec.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = 0; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalChunk += `${piece} `;
        } else {
          interimChunk += piece;
        }
      }

      const prefix = committedTranscriptRef.current.trim();
      const currentPart = `${finalChunk}${interimChunk}`.trim();
      const combined = [prefix, currentPart].filter(Boolean).join(" ").trim();

      transcriptAccRef.current = combined;
      setLiveTranscript(combined);

      if (!combined || !handsFreeRef.current || silenceMsRef.current <= 0) {
        clearSilenceTimers();
        return;
      }

      // If learner is actively mid-word (interim text changing) or VAD hears voice,
      // cancel the visible countdown and give a generous refreshed window!
      if (interimChunk.trim().length > 0 || vadSpeakingRef.current) {
        clearSilenceTimers();
        // Keep a refreshed safety timer only in case browser never emits isFinal
        const base = silenceMsRef.current + 1200;
        scheduleAutoSendCountdown(base, combined);
      } else {
        // Phrase finalized: start a fresh dynamic patience countdown from full duration
        scheduleAutoSendCountdown(silenceMsRef.current, combined);
      }
    };

    rec.onerror = (ev) => {
      if (ev.error === "not-allowed") {
        keepListeningRef.current = false;
        stopVadMonitor();
        setErrorMsg(
          "Microphone permission was denied. Allow mic access in your browser bar or use text input."
        );
        setIsListening(false);
      } else if (ev.error !== "no-speech" && ev.error !== "aborted") {
        setIsListening(false);
      }
    };

    rec.onend = () => {
      // On iOS Safari/Chrome, if recognition ended with captured German text and Auto-Send is ON,
      // auto-send cleanly after a short countdown so the user doesn't have to tap Send Now manually.
      if (isIosDevice()) {
        keepListeningRef.current = false;
        stopVadMonitor();
        setIsListening(false);
        const captured = transcriptAccRef.current.trim();
        if (
          captured &&
          handsFreeRef.current &&
          silenceMsRef.current > 0 &&
          !sendingRef.current
        ) {
          scheduleAutoSendCountdown(
            Math.min(1500, silenceMsRef.current),
            captured,
            true
          );
        }
        return;
      }

      // Chrome/Edge sometimes drops SpeechRecognition during a thoughtful pause.
      // Never cut the learner off! Save what they already said and silently keep listening.
      if (keepListeningRef.current && !sendingRef.current) {
        committedTranscriptRef.current = transcriptAccRef.current.trim();
        // Give a brief refresh buffer while browser reconnects mic so restart never cuts you off
        if (
          silenceTimerRef.current &&
          committedTranscriptRef.current.length > 0 &&
          handsFreeRef.current &&
          silenceMsRef.current > 0
        ) {
          scheduleAutoSendCountdown(
            Math.max(2000, silenceMsRef.current),
            committedTranscriptRef.current
          );
        }
        restartTimerRef.current = setTimeout(() => {
          if (keepListeningRef.current && !sendingRef.current) {
            launchRecognitionInstance();
          }
        }, 120);
        return;
      }
      setIsListening(false);
    };

    try {
      rec.start();
    } catch {
      setIsListening(false);
    }
  }, [clearSilenceTimers, scheduleAutoSendCountdown, stopVadMonitor]);

  const startBrowserRecognition = useCallback(() => {
    if (sendingRef.current) return;
    stopSpeaking();
    setIsSpeaking(false);
    setErrorMsg(null);
    clearSilenceTimers();

    committedTranscriptRef.current = "";
    transcriptAccRef.current = "";
    setLiveTranscript("");
    keepListeningRef.current = true;
    launchRecognitionInstance();
    // On iOS WebKit, calling getUserMedia concurrently steals the mic session from SpeechRecognition!
    if (!isIosDevice()) {
      startVadMonitor();
    }
  }, [clearSilenceTimers, launchRecognitionInstance, startVadMonitor]);

  useEffect(() => {
    startBrowserRecognitionRef.current = startBrowserRecognition;
  }, [startBrowserRecognition]);

  // Studio Audio Recording path (Groq Whisper OR Gemini Audio — never cuts off mid-sentence on iPhone!)
  // Includes single-stream VAD so Auto-Send works automatically after your Wait (3s) silence!
  const startWhisperRecording = useCallback(async () => {
    unlockMobileAudio();
    stopSpeaking();
    clearSilenceTimers();
    stopVadMonitor();
    setIsSpeaking(false);
    setErrorMsg(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = getPreferredRecordingMimeType();
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType: preferred.mimeType,
          audioBitsPerSecond: 32000,
        });
      } catch {
        recorder = new MediaRecorder(stream);
      }
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      // Attach single-stream VAD (zero mic conflict on iOS!) for automatic silence detection
      let heardSpeech = false;
      let silenceStartedAt: number | null = null;
      let recVadInterval: ReturnType<typeof setInterval> | null = null;
      let recAudioCtx: AudioContext | null = null;

      const cleanupRecorderVad = () => {
        if (recVadInterval) {
          clearInterval(recVadInterval);
          recVadInterval = null;
        }
        if (recAudioCtx) {
          recAudioCtx.close().catch(() => {});
          recAudioCtx = null;
        }
        vadSpeakingRef.current = false;
        setVoiceActive(false);
        setCountdownSec(null);
      };

      try {
        const AudioCtxCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtxCtor) {
          recAudioCtx = new AudioCtxCtor();
          const source = recAudioCtx.createMediaStreamSource(stream);
          const analyser = recAudioCtx.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.fftSize);

          recVadInterval = setInterval(() => {
            if (recorder.state !== "recording") return;
            analyser.getByteTimeDomainData(dataArray);
            let sumSq = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const v = (dataArray[i] - 128) / 128;
              sumSq += v * v;
            }
            const rms = Math.sqrt(sumSq / dataArray.length);
            const speakingNow = rms > 0.022;

            if (speakingNow) {
              heardSpeech = true;
              silenceStartedAt = null;
              vadSpeakingRef.current = true;
              setVoiceActive(true);
              setCountdownSec(null);
            } else {
              vadSpeakingRef.current = false;
              setVoiceActive(false);
              if (
                heardSpeech &&
                handsFreeRef.current &&
                silenceMsRef.current > 0
              ) {
                if (silenceStartedAt === null) {
                  silenceStartedAt = Date.now();
                }
                const elapsed = Date.now() - silenceStartedAt;
                const remainingMs = silenceMsRef.current - elapsed;
                if (remainingMs <= 0) {
                  cleanupRecorderVad();
                  if (recorder.state === "recording") {
                    recorder.stop();
                  }
                } else {
                  setCountdownSec(Math.ceil(remainingMs / 1000));
                }
              } else {
                silenceStartedAt = null;
                setCountdownSec(null);
              }
            }
          }, 120);
        }
      } catch {
        // Fallback: manual Stop & Send still works cleanly if AudioContext is unavailable
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        cleanupRecorderVad();
        stream.getTracks().forEach((t) => t.stop());
        setIsListening(false);
        const actualMime =
          recorder.mimeType || preferred.mimeType || "audio/mp4";
        const ext =
          actualMime.includes("mp4") || actualMime.includes("aac")
            ? "mp4"
            : actualMime.includes("ogg")
            ? "ogg"
            : "webm";
        const blob = new Blob(audioChunksRef.current, { type: actualMime });
        if (blob.size < 400) return;

        setTranscribingWhisper(true);
        try {
          const form = new FormData();
          form.append("audio", blob, `speech.${ext}`);
          const res = await fetch("/api/ai/transcribe", {
            method: "POST",
            body: form,
          });
          const out = await res.json();
          if (!res.ok) throw new Error(out.error || "Transcription failed");
          if (out.text?.trim()) {
            await submitLearnerUtterance(out.text.trim());
          } else {
            setErrorMsg(
              "Didn't catch clear German speech — tap Speak German and try again."
            );
          }
        } catch (err) {
          setErrorMsg(
            err instanceof Error ? err.message : "Audio transcription failed"
          );
        } finally {
          setTranscribingWhisper(false);
        }
      };

      recorder.start(250);
      setIsListening(true);
    } catch {
      setErrorMsg(
        "Could not access microphone. Please grant microphone permission or use keyboard input."
      );
    }
  }, [clearSilenceTimers, stopVadMonitor, submitLearnerUtterance]);

  const useWhisperMode = Boolean(
    (data?.aiConfig.hasGroqKey && data?.aiConfig.groqUseWhisper) ||
      (isIos && (data?.aiConfig.hasGeminiKey || data?.aiConfig.hasGroqKey))
  );

  function handleMicToggle() {
    unlockMobileAudio();
    if (isListening) {
      if (useWhisperMode) {
        mediaRecorderRef.current?.stop();
      } else {
        const captured = transcriptAccRef.current.trim();
        stopListening();
        if (captured) {
          submitLearnerUtterance(captured);
        }
      }
      return;
    }

    if (useWhisperMode) {
      startWhisperRecording();
    } else {
      startBrowserRecognition();
    }
  }

  // Only auto-speak the opening German greeting on a brand-new session (never replay from message #0 on page refresh!)
  useEffect(() => {
    if (!data || spokenInitialRef.current || data.session.completedAt) return;
    spokenInitialRef.current = true;

    const storageKey = `sprachcoach_last_spoken_${sessionId}`;
    const lastSpokenId =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(storageKey)
        : null;

    // Only auto-speak if this is a brand-new session (1 message) and we haven't already spoken it
    if (data.session.messages.length === 1) {
      const openingCoach = data.session.messages[0];
      if (
        openingCoach &&
        openingCoach.role === "coach" &&
        lastSpokenId !== openingCoach.id &&
        data.aiConfig.autoSpeak
      ) {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(storageKey, openingCoach.id);
        }
        const timer = setTimeout(() => {
          speakGerman(openingCoach.textDe, {
            rate: data.aiConfig.voiceRate || 1.1,
            voiceName: data.aiConfig.preferredVoiceName || undefined,
            ttsProvider: data.aiConfig.ttsProvider || "edge_neural",
            edgeVoice:
              data.aiConfig.edgeVoice || "de-DE-SeraphinaMultilingualNeural",
            onStart: () => setIsSpeaking(true),
            onEnd: () => {
              setIsSpeaking(false);
              if (
                !isIosDevice() &&
                data.aiConfig.handsFreeDefault &&
                !(data.aiConfig.hasGroqKey && data.aiConfig.groqUseWhisper)
              ) {
                setTimeout(() => {
                  startBrowserRecognitionRef.current?.();
                }, 400);
              }
            },
            onError: () => setIsSpeaking(false),
          });
        }, 40);
        return () => clearTimeout(timer);
      }
    }
  }, [data, sessionId]);

  function handleReplayMessage(msg: SessionMessage) {
    speakGerman(msg.textDe, {
      rate: voiceRate,
      voiceName: voiceName || undefined,
      ttsProvider,
      edgeVoice,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }

  async function handleCompleteSession() {
    stopListening();
    stopSpeaking();
    setCompleting(true);
    setErrorMsg(null);
    try {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const res = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds: elapsed }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not finish session");
      setData((prev) =>
        prev
          ? {
              ...prev,
              session: result.session,
            }
          : prev
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to complete session"
      );
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
        <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
        <p className="text-sm font-medium">Opening your German Speaking Studio...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-white border border-zinc-200 p-8 text-center space-y-3">
        <p className="text-zinc-800 font-semibold">
          {errorMsg || "Session not found."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-amber-700 font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { session, module: mod, targetBottleneck } = data;
  const phaseIdx = PHASES.findIndex((p) => p.key === session.currentPhase);
  const lastCoachMsg = [...session.messages]
    .reverse()
    .find((m) => m.role === "coach");

  // =========================================================================
  // COMPLETED SESSION DEBRIEF VIEW
  // =========================================================================
  if (session.completedAt && session.debrief) {
    const d = session.debrief;
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Today</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved to Learner Memory
          </span>
        </div>

        {/* Scorecard Hero */}
        <section className="rounded-3xl bg-zinc-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Award className="w-4 h-4" />
              Session Complete · {session.moduleTitle}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold">{d.praise}</h1>
            <p className="text-sm text-zinc-300 leading-relaxed">{d.summary}</p>
          </div>

          <div className="shrink-0 w-28 h-28 rounded-full border-4 border-amber-400 flex flex-col items-center justify-center bg-white/5">
            <span className="text-3xl font-bold text-amber-300">
              {d.overallScore}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-zinc-400">
              / 100
            </span>
          </div>
        </section>

        {/* Subscores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              ["Fluency", d.scores.fluency],
              ["Grammar", d.scores.grammar],
              ["Vocabulary", d.scores.vocabulary],
              ["Exam Task", d.scores.taskCompletion],
            ] as const
          ).map(([label, score]) => (
            <div
              key={label}
              className="rounded-2xl bg-white border border-zinc-200/80 p-4"
            >
              <div className="text-xs text-zinc-500 font-medium">{label}</div>
              <div className="text-2xl font-bold text-zinc-900 mt-1">
                {score}%
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Key Corrections */}
        {d.keyCorrections.length > 0 && (
          <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3">
            <h2 className="font-bold text-zinc-900">
              High-Impact German Upgrades (Say These Aloud!)
            </h2>
            <div className="space-y-3">
              {d.keyCorrections.map((c, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-zinc-50 border border-zinc-200/70 p-4 space-y-2"
                >
                  <div className="text-xs text-rose-700 line-through">
                    {c.original}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-emerald-900">
                      ✓ {c.corrected}
                    </div>
                    <button
                      onClick={() =>
                        speakGerman(c.corrected, {
                          rate: voiceRate,
                          ttsProvider,
                          edgeVoice,
                          voiceName: voiceName || undefined,
                        })
                      }
                      className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 cursor-pointer shrink-0"
                      title="Listen in German"
                    >
                      <Volume2 className="w-4 h-4 text-zinc-700" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600">{c.explanation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Memory Updates + Saved Vocabulary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3">
            <h2 className="font-bold text-zinc-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-rose-500" />
              Memory & Bottlenecks Updated
            </h2>
            {d.newBottlenecks.length > 0 ? (
              <div className="space-y-2.5">
                {d.newBottlenecks.map((bn, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-rose-50/70 border border-rose-200 p-3 text-xs space-y-1"
                  >
                    <div className="font-bold text-rose-900">{bn.title}</div>
                    <p className="text-zinc-700">{bn.description}</p>
                    <div className="text-emerald-800 font-medium">
                      Target: {bn.betterGerman}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600">
                No new bottlenecks flagged this session — great consistency!
              </p>
            )}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-950">
              <span className="font-bold">Next Step: </span>
              {d.nextStepRecommendation}
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-zinc-200/80 p-5 space-y-3">
            <h2 className="font-bold text-zinc-900">
              Saved Phrases Added to Vocabulary Bank
            </h2>
            <div className="space-y-2">
              {d.newVocabulary.map((v, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-zinc-50 border border-zinc-200/70 p-3 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold text-sm text-zinc-900">
                      {v.german}
                    </div>
                    <div className="text-xs text-zinc-600">{v.meaning}</div>
                    <div className="text-xs text-teal-800 mt-1 italic">
                      „{v.exampleDe}“
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      speakGerman(v.exampleDe, {
                        rate: voiceRate,
                        ttsProvider,
                        edgeVoice,
                        voiceName: voiceName || undefined,
                      })
                    }
                    className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 cursor-pointer shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-zinc-700" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={async () => {
              const res = await fetch("/api/sessions/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
              });
              const out = await res.json();
              if (out?.session?.id) router.push(`/session/${out.session.id}`);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-3 transition cursor-pointer"
          >
            <span>Start Next Module</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/memory"
            className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 text-sm font-medium px-4 py-3"
          >
            <Brain className="w-4 h-4" />
            <span>Inspect Learner Memory</span>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LIVE GUIDED VOICE CONVERSATION STUDIO
  // =========================================================================
  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-[#f8f6f2] px-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] overflow-hidden overscroll-none md:static md:z-auto md:bg-transparent md:px-0 md:pt-0 md:pb-0 md:h-[calc(100dvh-2.5rem)] md:max-h-[920px]">
      {/* Studio Top Bar */}
      <header className="rounded-2xl bg-white border border-zinc-200/80 p-3 sm:p-4 shadow-xs space-y-2.5 sm:space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link
              href="/"
              onClick={() => {
                stopListening();
                stopSpeaking();
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 shrink-0"
              title="Leave session"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-sm sm:text-base text-zinc-900 truncate">
                {session.moduleTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {mod?.titleDe && (
                  <span className="text-amber-800 font-medium truncate">
                    {mod.titleDe}
                  </span>
                )}
                {targetBottleneck && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-medium">
                    <Brain className="w-3 h-3" />
                    Focus: {targetBottleneck.title}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Voice Controls Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileControls((v) => !v)}
              title="Voice speed, wait time & listening options"
              className={`md:hidden inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                showMobileControls
                  ? "bg-amber-100 text-amber-950 border-amber-300"
                  : "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{voiceRate}×</span>
            </button>

            {/* Desktop Inline Controls */}
            <div className="hidden md:flex items-center gap-2">
              <VoiceSpeedControl value={voiceRate} onChange={setVoiceRate} />

              {!useWhisperMode && (
                <select
                  value={silenceMs}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSilenceMs(val);
                    if (val === 0) clearSilenceTimers();
                  }}
                  title="How long the coach waits during your pauses before sending"
                  className="text-xs rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-medium text-zinc-700"
                >
                  <option value={0}>Wait: Manual (No Cut-off)</option>
                  <option value={8000}>Wait: 8s (Extra Patient)</option>
                  <option value={5000}>Wait: 5s (Patient)</option>
                  <option value={3000}>Wait: 3s (Default)</option>
                  <option value={2200}>Wait: 2.2s (Quick)</option>
                </select>
              )}

              <button
                onClick={() => setBlindListening((v) => !v)}
                title="Hide German coach text to train pure listening"
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                  blindListening
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {blindListening ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                <span>Blind Listen</span>
              </button>

              <button
                onClick={() => setHandsFree((v) => !v)}
                title="Always-Talk Hands-Free Loop: Coach speaks → Mic auto-opens"
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                  handsFree
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{handsFree ? "Always-Talk ON" : "Manual Mic"}</span>
              </button>
            </div>

            {/* Finish & Save */}
            <button
              onClick={handleCompleteSession}
              disabled={completing || session.turnCount === 0}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition cursor-pointer disabled:opacity-40"
            >
              {completing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden sm:inline">Finish &amp; Save</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Voice Options Drawer */}
        {showMobileControls && (
          <div className="md:hidden pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-2">
            <VoiceSpeedControl value={voiceRate} onChange={setVoiceRate} />

            <select
              value={silenceMs}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSilenceMs(val);
                if (val === 0) clearSilenceTimers();
              }}
              className="text-xs rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-medium text-zinc-700"
            >
              <option value={0}>Wait: Manual</option>
              <option value={8000}>Wait: 8s</option>
              <option value={5000}>Wait: 5s</option>
              <option value={3000}>Wait: 3s (Default)</option>
              <option value={2200}>Wait: 2.2s</option>
            </select>

            <button
              onClick={() => setBlindListening((v) => !v)}
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                blindListening
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
            >
              {blindListening ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              <span>Blind</span>
            </button>

            <button
              onClick={() => setHandsFree((v) => !v)}
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                handsFree
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-zinc-50 text-zinc-600 border-zinc-200"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{handsFree ? "Auto-Send ON" : "Manual"}</span>
            </button>

            {isIos && !useWhisperMode && (
              <p className="w-full text-[11px] text-zinc-500">
                iPhone tip: Tap the mic to speak each turn, or enable Groq Whisper in Settings for longer recordings.
              </p>
            )}
          </div>
        )}

        {/* 4-Phase Proactive Stepper */}
        <div className="grid grid-cols-4 gap-1.5">
          {PHASES.map((p, idx) => {
            const active = idx === phaseIdx;
            const done = idx < phaseIdx;
            return (
              <div
                key={p.key}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold text-center truncate transition ${
                  active
                    ? "bg-amber-400/25 text-amber-950 border border-amber-400/60"
                    : done
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {p.label}
              </div>
            );
          })}
        </div>
      </header>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mt-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Conversation Stream (Only this inner pane scrolls on mobile!) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 sm:py-4 space-y-4 pr-1">
        {mod && (
          <section className="rounded-2xl bg-amber-50/75 border border-amber-200/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowGuideline((v) => !v)}
              className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-amber-100/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Aufgabenstellung &amp; Gesprächsleitfaden
                </span>
                {!showGuideline && (
                  <span className="text-xs text-zinc-600 truncate hidden sm:inline">
                    — {mod.learnerGoal}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs font-medium text-amber-900">
                <span className="hidden sm:inline text-[11px] text-amber-800">
                  {useWhisperMode
                    ? "Mikrofon: Groq Whisper (DE)"
                    : sttSupported
                    ? "Mikrofon: Deutsch (Live)"
                    : "Textmodus"}
                </span>
                {showGuideline ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showGuideline && (
              <div className="px-4 pb-4 pt-1 border-t border-amber-200/60 space-y-3 text-xs text-zinc-800">
                {/* 1. Situation & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl bg-white/90 border border-amber-200/70 p-3 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      1. Die Situation (Aufgabenkarte)
                    </div>
                    <p className="text-zinc-700 leading-relaxed">
                      {mod.scenarioPrompt}
                    </p>
                    <p className="text-[11px] text-zinc-500 pt-1">
                      <span className="font-semibold text-zinc-700">
                        Rolle des Gesprächspartners:
                      </span>{" "}
                      {mod.coachRole}
                    </p>
                  </div>

                  {/* 2. What's Expected */}
                  <div className="rounded-xl bg-white/90 border border-amber-200/70 p-3 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                      2. Was von Ihnen erwartet wird
                    </div>
                    <p className="font-semibold text-zinc-900">
                      Ihr Ziel: {mod.learnerGoal}
                    </p>
                    <ul className="space-y-1 text-[11px] text-zinc-700">
                      {getSpeakingExpectations(mod.category).map((step, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold text-teal-700">
                            {i + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3. Grammar & Playable Starter Phrases */}
                {(mod.grammarFocus.length > 0 ||
                  mod.keyVocabulary.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {mod.grammarFocus.map((g, i) => (
                      <span
                        key={`gf-${i}`}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-700"
                      >
                        Grammatik: {g}
                      </span>
                    ))}
                    {mod.keyVocabulary.map((phrase, i) => (
                      <button
                        key={`kv-${i}`}
                        type="button"
                        onClick={() =>
                          speakGerman(phrase, {
                            rate: voiceRate,
                            ttsProvider,
                            edgeVoice,
                            voiceName: voiceName || undefined,
                          })
                        }
                        title="Klicken zum Anhören"
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 text-amber-700" />
                        <span>„{phrase}“</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 4. Optional Sample Dialogue Generator */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    disabled={loadingSample}
                    onClick={async () => {
                      if (sampleDialogue) {
                        setSampleDialogue(null);
                        return;
                      }
                      setLoadingSample(true);
                      try {
                        const res = await fetch("/api/drills/assist", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            mode: "speaking_example",
                            module: mod,
                          }),
                        });
                        const out = await res.json();
                        if (out.sample) setSampleDialogue(out.sample);
                      } finally {
                        setLoadingSample(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-900 hover:text-white border border-amber-300 text-amber-950 transition cursor-pointer disabled:opacity-50"
                  >
                    {loadingSample ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>
                      {sampleDialogue
                        ? "Beispiel-Dialog ausblenden"
                        : `Beispiel-Dialog (${mod.targetLevel}) anzeigen`}
                    </span>
                  </button>

                  <span className="text-[11px] text-zinc-500">
                    Klicken Sie oben auf die Leiste, um den Leitfaden ein- oder auszublenden.
                  </span>
                </div>

                {sampleDialogue && (
                  <div className="rounded-xl bg-white border border-teal-200 p-3.5 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                      Example Conversation ({mod.targetLevel})
                    </div>
                    <p className="text-xs text-zinc-600">
                      {sampleDialogue.summary}
                    </p>
                    <div className="space-y-2 pt-1">
                      {sampleDialogue.exchanges.map((ex, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-zinc-50 border border-zinc-200/70 p-2.5 flex items-start justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                ex.speaker === "Partner"
                                  ? "text-teal-700"
                                  : "text-amber-800"
                              }`}
                            >
                              {ex.speaker}
                            </span>
                            <div className="text-xs font-medium text-zinc-900">
                              {ex.german}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {ex.translation}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              speakGerman(ex.german, {
                                rate: voiceRate,
                                ttsProvider,
                                edgeVoice,
                                voiceName: voiceName || undefined,
                              })
                            }
                            className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 cursor-pointer shrink-0"
                            title="Listen in German"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-zinc-700" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {session.messages.map((msg) => {
          const isCoach = msg.role === "coach";
          const isBlurred = isCoach && blindListening && !revealedIds[msg.id];
          const isTranslated = Boolean(translatedIds[msg.id]);
          const corrExpanded = Boolean(expandedCorrIds[msg.id]);

          if (isCoach) {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[88%] sm:max-w-[78%] space-y-1.5">
                  <div className="rounded-2xl rounded-tl-sm bg-white border border-zinc-200/90 shadow-xs p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        SprachCoach
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReplayMessage(msg)}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 transition cursor-pointer"
                          title="Listen again"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
                        {blindListening && (
                          <button
                            onClick={() =>
                              setRevealedIds((p) => ({
                                ...p,
                                [msg.id]: !p[msg.id],
                              }))
                            }
                            className="text-xs px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                          >
                            {isBlurred ? "Reveal" : "Hide"}
                          </button>
                        )}
                        {msg.translation && (
                          <button
                            onClick={() =>
                              setTranslatedIds((p) => ({
                                ...p,
                                [msg.id]: !p[msg.id],
                              }))
                            }
                            className={`p-1 rounded-lg transition cursor-pointer ${
                              isTranslated
                                ? "bg-amber-100 text-amber-900"
                                : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            }`}
                            title="Show translation"
                          >
                            <Languages className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p
                      onClick={() => {
                        if (isBlurred) {
                          setRevealedIds((p) => ({ ...p, [msg.id]: true }));
                        }
                      }}
                      className={`text-sm sm:text-base leading-relaxed text-zinc-900 transition ${
                        isBlurred
                          ? "blur-sm select-none cursor-pointer hover:blur-[2px]"
                          : ""
                      }`}
                    >
                      {msg.textDe}
                    </p>

                    {isTranslated && msg.translation && (
                      <p className="text-xs text-zinc-500 border-t border-zinc-100 pt-2">
                        {msg.translation}
                      </p>
                    )}

                    {msg.coachNote && (
                      <div className="text-[11px] text-teal-800 bg-teal-50/80 rounded-lg px-2.5 py-1.5">
                        {msg.coachNote}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Learner message + gentle inline upgrade badge
          return (
            <div key={msg.id} className="flex flex-col items-end space-y-1.5">
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-zinc-900 text-white px-4 py-3 text-sm sm:text-base leading-relaxed shadow-xs">
                {msg.textDe}
              </div>

              {msg.correction && (
                <div className="max-w-[85%] sm:max-w-[75%]">
                  <button
                    onClick={() =>
                      setExpandedCorrIds((p) => ({
                        ...p,
                        [msg.id]: !p[msg.id],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>
                      {corrExpanded
                        ? "Hide phrasing upgrade"
                        : `Natural German tip${
                            msg.correction.bottleneckTag
                              ? ` · ${msg.correction.bottleneckTag}`
                              : ""
                          }`}
                    </span>
                  </button>

                  {corrExpanded && (
                    <div className="mt-1.5 rounded-xl bg-white border border-amber-200 p-3 text-xs space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-emerald-800">
                          ✓ {msg.correction.corrected}
                        </span>
                        <button
                          onClick={() =>
                            speakGerman(msg.correction!.corrected, {
                              rate: voiceRate,
                              ttsProvider,
                              edgeVoice,
                              voiceName: voiceName || undefined,
                            })
                          }
                          className="p-1 rounded hover:bg-zinc-100 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-zinc-600" />
                        </button>
                      </div>
                      <p className="text-zinc-600">{msg.correction.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white border border-zinc-200 px-4 py-3 flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>Coach is thinking in German...</span>
            </div>
          </div>
        )}

        {session.currentPhase === "debrief" && !session.completedAt && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-emerald-950">
                Guided session complete!
              </div>
              <p className="text-xs text-emerald-800">
                Generate your scorecard and automatically save your bottlenecks &
                new vocabulary to Memory.
              </p>
            </div>
            <button
              onClick={handleCompleteSession}
              disabled={completing}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 cursor-pointer shrink-0"
            >
              {completing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              <span>Finish & Save to Memory</span>
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Live Hints Drawer ("Ich brauche einen Tipp") */}
      {showHints && lastCoachMsg?.hints && lastCoachMsg.hints.length > 0 && (
        <div className="mb-2 rounded-2xl bg-amber-50 border border-amber-200 p-3 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
            <span>German Starter Phrases (click to speak or copy to draft)</span>
            <button
              onClick={() => setShowHints(false)}
              className="text-amber-700 hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {lastCoachMsg.hints.map((hint, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-amber-200 px-3 py-1.5 text-xs text-zinc-800"
              >
                <button
                  onClick={() =>
                    speakGerman(hint, {
                      rate: voiceRate,
                      ttsProvider,
                      edgeVoice,
                      voiceName: voiceName || undefined,
                    })
                  }
                  title="Hear pronunciation"
                  className="text-amber-700 hover:text-amber-900 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setTextInput(hint);
                    setShowTextInput(true);
                  }}
                  className="hover:underline text-left cursor-pointer"
                >
                  {hint}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Voice-First Control Dock (Pinned to bottom of studio frame) */}
      <footer className="rounded-2xl bg-white border border-zinc-200/90 p-2.5 sm:p-4 shadow-sm space-y-2.5 sm:space-y-3 shrink-0">
        {/* Live transcript preview while speaking */}
        {(isListening || transcribingWhisper || liveTranscript) && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {transcribingWhisper
                    ? "Transcribing your German audio..."
                    : useWhisperMode
                    ? silenceMs > 0 && handsFree
                      ? "Recording German (auto-sends after pause, or tap Stop)..."
                      : "Recording German... tap Stop & Send when finished"
                    : silenceMs === 0 || !handsFree
                    ? "Listening patiently (tap Done & Send when finished)"
                    : "Listening in German..."}
                </span>
                {voiceActive ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 normal-case font-semibold">
                    Voice detected — timer refreshed
                  </span>
                ) : (
                  countdownSec !== null && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 normal-case font-semibold">
                      {midSentenceGrace
                        ? `Mid-sentence pause · Sending in ${countdownSec}s…`
                        : `Sending in ${countdownSec}s…`}
                    </span>
                  )
                )}
              </div>
              <p className="text-sm text-zinc-900 mt-1 leading-relaxed break-words">
                {liveTranscript || "Sprich einfach los auf Deutsch — nimm dir ruhig Zeit..."}
              </p>
            </div>
            {!useWhisperMode && liveTranscript && (
              <div className="flex items-center gap-1.5 shrink-0">
                {countdownSec !== null && (
                  <button
                    onClick={() => {
                      clearSilenceTimers();
                    }}
                    className="text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-950 px-2.5 py-1.5 rounded-lg cursor-pointer"
                    title="Pause auto-send so you can keep thinking"
                  >
                    Hold On
                  </button>
                )}
                <button
                  onClick={() => {
                    clearSilenceTimers();
                    committedTranscriptRef.current = "";
                    transcriptAccRef.current = "";
                    setLiveTranscript("");
                  }}
                  className="text-xs font-medium bg-zinc-200/80 hover:bg-zinc-300 text-zinc-700 px-2.5 py-1.5 rounded-lg cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={() => submitLearnerUtterance(liveTranscript)}
                  className="text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Send Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Voice Controls Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Hint + Mute Coach */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHints((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition cursor-pointer ${
                showHints
                  ? "bg-amber-100 border-amber-300 text-amber-900"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tipp / Hint</span>
            </button>

            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                  setIsSpeaking(false);
                } else {
                  setAutoSpeak((v) => !v);
                }
              }}
              title={isSpeaking ? "Stop coach audio" : "Toggle auto-speak"}
              className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
            >
              {isSpeaking ? (
                <Square className="w-4 h-4 text-rose-600 fill-current" />
              ) : autoSpeak ? (
                <Volume2 className="w-4 h-4 text-teal-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>

          {/* Center: Big Primary Speak Button */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-rose-500 animate-voice-pulse pointer-events-none" />
            )}
            <button
              onClick={handleMicToggle}
              disabled={sending || transcribingWhisper}
              className={`relative z-10 inline-flex items-center gap-2 rounded-full px-5 sm:px-6 py-3 sm:py-3.5 font-bold text-sm shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                isListening
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : isSpeaking
                  ? "bg-teal-700 hover:bg-teal-800 text-white"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>{useWhisperMode ? "Stop & Send" : "Stop / Send"}</span>
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span className="hidden sm:inline">Coach Speaking... (Tap to Interrupt)</span>
                  <span className="sm:hidden">Speaking… (Interrupt)</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-amber-400" />
                  <span className="hidden sm:inline">Tap to Speak German</span>
                  <span className="sm:hidden">Speak German</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Keyboard Toggle */}
          <button
            onClick={() => setShowTextInput((v) => !v)}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition cursor-pointer ${
              showTextInput
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden sm:inline">Type</span>
          </button>
        </div>

        {/* Optional Text Fallback Input */}
        {showTextInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitLearnerUtterance(textInput);
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Antworte auf Deutsch... (e.g. Ich schlage vor, dass wir...)"
              className="flex-1 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={sending || !textInput.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 text-sm font-medium cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        )}
      </footer>
    </div>
  );
}
