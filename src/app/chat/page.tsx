"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VoiceSpeedControl } from "@/components/VoiceSpeedControl";
import {
  BookmarkPlus,
  Brain,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  HelpCircle,
  History,
  Keyboard,
  Languages,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Plus,
  Radio,
  Send,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { FreeChatTheme } from "@/lib/ai/free-chat";
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
  AlternativeSaying,
  FreeChatMessage,
  FreeChatRecord,
  TtsProviderType,
} from "@/lib/types";

interface FreeChatBootstrap {
  chats: FreeChatRecord[];
  themes: FreeChatTheme[];
  memoryContext: {
    activeBottlenecks: string[];
    recentExercises: string[];
    recentVocab: string[];
  };
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

export default function FreeChatPage() {
  const [boot, setBoot] = useState<FreeChatBootstrap | null>(null);
  const [activeChat, setActiveChat] = useState<FreeChatRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingThemeId, setStartingThemeId] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [sending, setSending] = useState(false);
  const [savingMemory, setSavingMemory] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showMemoryStrip, setShowMemoryStrip] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [isIos, setIsIos] = useState(false);

  // Voice & Patience controls
  const [handsFree, setHandsFree] = useState(true);
  const [silenceMs, setSilenceMs] = useState<number>(3000);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [midSentenceGrace, setMidSentenceGrace] = useState(false);
  const [blindListening, setBlindListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceRate, setVoiceRate] = useState(1.1);
  const [ttsProvider, setTtsProvider] = useState<TtsProviderType>("edge_neural");
  const [edgeVoice, setEdgeVoice] = useState("de-DE-SeraphinaMultilingualNeural");
  const [voiceName, setVoiceName] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcribingWhisper, setTranscribingWhisper] = useState(false);

  // Live transcript & UI toggles
  const [liveTranscript, setLiveTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [translatedIds, setTranslatedIds] = useState<Record<string, boolean>>({});
  const [expandedAltIds, setExpandedAltIds] = useState<Record<string, boolean>>(
    {}
  );
  const [savedPhraseMap, setSavedPhraseMap] = useState<Record<string, boolean>>(
    {}
  );

  // Refs for voice & VAD loop
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
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
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const handsFreeRef = useRef(handsFree);
  const silenceMsRef = useRef(silenceMs);
  const sendingRef = useRef(sending);
  const activeChatRef = useRef<FreeChatRecord | null>(activeChat);

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
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const loadBootstrap = useCallback(async () => {
    const res = await fetch("/api/free-chat");
    const data = (await res.json()) as FreeChatBootstrap;
    setBoot(data);
    setVoiceRate(data.aiConfig.voiceRate || 1.1);
    setTtsProvider(data.aiConfig.ttsProvider || "edge_neural");
    setEdgeVoice(
      data.aiConfig.edgeVoice || "de-DE-SeraphinaMultilingualNeural"
    );
    setVoiceName(data.aiConfig.preferredVoiceName || "");
    setAutoSpeak(data.aiConfig.autoSpeak);
    setHandsFree(data.aiConfig.handsFreeDefault);
    setBlindListening(data.aiConfig.blindListeningDefault);
    if (data.chats.length > 0 && !activeChatRef.current) {
      setActiveChat(data.chats[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsIos(isIosDevice());
      const saved = window.localStorage.getItem("sprachcoach_silence_ms_v2");
      if (saved !== null) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && [0, 2200, 3000, 5000, 8000].includes(parsed)) {
          setSilenceMs(parsed);
        }
      }
    }
    getGermanVoices();
    loadBootstrap();

    return () => {
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
  }, [loadBootstrap]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length, sending, liveTranscript]);

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

  const startBrowserRecognitionRef = useRef<(() => void) | null>(null);

  const speakCoachReply = useCallback(
    (textDe: string) => {
      if (!autoSpeak || !textDe) return;
      speakGerman(textDe, {
        rate: voiceRate,
        ttsProvider,
        edgeVoice,
        voiceName: voiceName || undefined,
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          if (
            !isIosDevice() &&
            handsFreeRef.current &&
            !(boot?.aiConfig.hasGroqKey && boot?.aiConfig.groqUseWhisper)
          ) {
            setTimeout(() => {
              startBrowserRecognitionRef.current?.();
            }, 350);
          }
        },
        onError: () => setIsSpeaking(false),
      });
    },
    [
      autoSpeak,
      boot?.aiConfig.groqUseWhisper,
      boot?.aiConfig.hasGroqKey,
      edgeVoice,
      ttsProvider,
      voiceName,
      voiceRate,
    ]
  );

  const submitUtterance = useCallback(
    async (rawText: string) => {
      const cleaned = rawText.trim();
      const current = activeChatRef.current;
      if (!cleaned || !current || sendingRef.current) return;

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
        const res = await fetch(`/api/free-chat/${current.id}/turn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ textDe: cleaned }),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error || "Could not send message");

        setActiveChat(out.chat);
        setBoot((prev) =>
          prev
            ? {
                ...prev,
                chats: prev.chats.map((c) =>
                  c.id === out.chat.id ? out.chat : c
                ),
              }
            : prev
        );

        // Auto-expand alternative sayings on the latest learner turn so they immediately see natural options!
        if (out.learnerMessage?.id && out.learnerMessage?.alternatives?.length) {
          setExpandedAltIds((prev) => ({
            ...prev,
            [out.learnerMessage.id]: true,
          }));
        }

        if (out.coachMessage?.textDe) {
          speakCoachReply(out.coachMessage.textDe);
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to reply");
      } finally {
        setSending(false);
      }
    },
    [speakCoachReply, stopListening]
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

      const isIncomplete = isIncompleteGermanClause(currentText);
      const effectiveDelayMs = isIncomplete ? baseDelayMs + 3000 : baseDelayMs;
      setMidSentenceGrace(isIncomplete);

      const deadline = Date.now() + effectiveDelayMs;
      countdownIntervalRef.current = setInterval(() => {
        const remaining = Math.ceil((deadline - Date.now()) / 1000);
        setCountdownSec(remaining > 0 ? remaining : null);
      }, 200);

      silenceTimerRef.current = setTimeout(() => {
        if (vadSpeakingRef.current) {
          scheduleAutoSendCountdown(baseDelayMs, undefined, allowSendAfterStop);
          return;
        }
        clearSilenceTimers();
        const captured = transcriptAccRef.current.trim();
        if (captured && (keepListeningRef.current || allowSendAfterStop)) {
          submitUtterance(captured);
        }
      }, effectiveDelayMs);
    },
    [clearSilenceTimers, submitUtterance]
  );

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
        if (rms > 0.025) {
          quietTicks = 0;
          if (!vadSpeakingRef.current) {
            vadSpeakingRef.current = true;
            setVoiceActive(true);
            clearSilenceTimers();
          }
        } else {
          quietTicks += 1;
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
      // fallback silently
    }
  }, [clearSilenceTimers, scheduleAutoSendCountdown, stopVadMonitor]);

  const launchRecognitionInstance = useCallback(() => {
    if (!keepListeningRef.current || sendingRef.current) return;
    const rec = createGermanSpeechRecognition();
    if (!rec) {
      keepListeningRef.current = false;
      stopVadMonitor();
      setShowTextInput(true);
      setErrorMsg("Browser speech recognition unavailable here — use Chrome/Edge or keyboard input.");
      return;
    }

    recognitionRef.current = rec;
    rec.onstart = () => setIsListening(true);
    rec.onspeechstart = () => {
      setVoiceActive(true);
      clearSilenceTimers();
    };
    rec.onsoundstart = () => {
      if (transcriptAccRef.current.trim().length > 0) clearSilenceTimers();
    };
    rec.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = 0; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalChunk += `${piece} `;
        else interimChunk += piece;
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

      if (interimChunk.trim().length > 0 || vadSpeakingRef.current) {
        clearSilenceTimers();
        scheduleAutoSendCountdown(silenceMsRef.current + 1200, combined);
      } else {
        scheduleAutoSendCountdown(silenceMsRef.current, combined);
      }
    };
    rec.onerror = (ev) => {
      if (ev.error === "not-allowed") {
        keepListeningRef.current = false;
        stopVadMonitor();
        setErrorMsg("Microphone permission denied.");
        setIsListening(false);
      }
    };
    rec.onend = () => {
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

      if (keepListeningRef.current && !sendingRef.current) {
        committedTranscriptRef.current = transcriptAccRef.current.trim();
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
    if (!isIosDevice()) {
      startVadMonitor();
    }
  }, [clearSilenceTimers, launchRecognitionInstance, startVadMonitor]);

  useEffect(() => {
    startBrowserRecognitionRef.current = startBrowserRecognition;
  }, [startBrowserRecognition]);

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

      // Single-stream VAD for automatic silence-based Auto-Send (no mic conflict on iOS!)
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
        // Fallback: manual Stop / Send works cleanly
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        cleanupRecorderVad();
        stream.getTracks().forEach((t) => t.stop());
        setIsListening(false);
        const actualMime = recorder.mimeType || preferred.mimeType || "audio/mp4";
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
          if (res.ok && out.text?.trim()) {
            await submitUtterance(out.text.trim());
          } else if (!res.ok) {
            setErrorMsg(out.error || "Audio transcription failed.");
          } else {
            setErrorMsg(
              "Didn't catch clear German speech — tap Speak German and try again."
            );
          }
        } finally {
          setTranscribingWhisper(false);
        }
      };
      recorder.start(250);
      setIsListening(true);
    } catch {
      setErrorMsg("Microphone access failed.");
    }
  }, [clearSilenceTimers, stopVadMonitor, submitUtterance]);

  const useWhisperMode = Boolean(
    (boot?.aiConfig.hasGroqKey && boot?.aiConfig.groqUseWhisper) ||
      (isIos && (boot?.aiConfig.hasGeminiKey || boot?.aiConfig.hasGroqKey))
  );

  function handleMicToggle() {
    unlockMobileAudio();
    if (isListening) {
      if (useWhisperMode) {
        mediaRecorderRef.current?.stop();
      } else {
        const captured = transcriptAccRef.current.trim();
        stopListening();
        if (captured) submitUtterance(captured);
      }
      return;
    }
    if (useWhisperMode) startWhisperRecording();
    else startBrowserRecognition();
  }

  async function handleStartNewChat(opts: {
    themeId?: string;
    customTopic?: string;
  }) {
    stopListening();
    stopSpeaking();
    setStartingThemeId(opts.themeId || "custom");
    setErrorMsg(null);
    setSavedNotice(null);
    try {
      const res = await fetch("/api/free-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Could not start free chat");
      setActiveChat(out.chat);
      setBoot((prev) =>
        prev ? { ...prev, chats: [out.chat, ...prev.chats] } : prev
      );
      setCustomTopic("");
      setShowHistory(false);
      if (out.coachMessage?.textDe) {
        speakCoachReply(out.coachMessage.textDe);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to start chat");
    } finally {
      setStartingThemeId(null);
    }
  }

  async function handleSwitchThemeMidChat(opts: {
    themeId?: string;
    customTopic?: string;
  }) {
    if (!activeChat) {
      handleStartNewChat(opts);
      return;
    }
    stopListening();
    stopSpeaking();
    setStartingThemeId(opts.themeId || "custom");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/free-chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChat.id,
          ...opts,
        }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Could not switch theme");
      setActiveChat(out.chat);
      setBoot((prev) =>
        prev
          ? {
              ...prev,
              chats: prev.chats.map((c) =>
                c.id === out.chat.id ? out.chat : c
              ),
            }
          : prev
      );
      setCustomTopic("");
      if (out.coachMessage?.textDe) {
        speakCoachReply(out.coachMessage.textDe);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to switch theme");
    } finally {
      setStartingThemeId(null);
    }
  }

  async function handleSaveToMemory() {
    if (!activeChat || activeChat.turnCount === 0) return;
    setSavingMemory(true);
    setSavedNotice(null);
    try {
      const res = await fetch(`/api/free-chat/${activeChat.id}/save-memory`, {
        method: "POST",
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Save failed");
      setSavedNotice(
        `Saved to Memory & Progress Monitor! ${out.insights?.praise ?? ""}`
      );
      setActiveChat((prev) =>
        prev ? { ...prev, savedToMemoryAt: out.savedAt } : prev
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not save insights");
    } finally {
      setSavingMemory(false);
    }
  }

  async function handleSaveAlternativePhrase(alt: AlternativeSaying) {
    const key = alt.german;
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "vocabulary",
        german: alt.german,
        meaning: `${alt.label}: ${alt.nuance}`,
        exampleDe: alt.german,
        topic: `Free Chat (${activeChat?.themeTitleDe ?? "Alltag"})`,
      }),
    });
    if (res.ok) {
      setSavedPhraseMap((prev) => ({ ...prev, [key]: true }));
    }
  }

  function handleReplay(msg: FreeChatMessage) {
    speakGerman(msg.textDe, {
      rate: voiceRate,
      ttsProvider,
      edgeVoice,
      voiceName: voiceName || undefined,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }

  if (loading || !boot) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
        <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
        <p className="text-sm font-medium">Loading German Free Chat Studio...</p>
      </div>
    );
  }

  const lastCoachMsg = activeChat
    ? [...activeChat.messages].reverse().find((m) => m.role === "coach")
    : undefined;

  // =========================================================================
  // THEME PICKER VIEW (when no active chat yet)
  // =========================================================================
  if (!activeChat) {
    return (
      <div className="space-y-6 pb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Open German Speaking · Memory-Aware</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-0.5">
            Free German Chat Mode (Freies Sprechen)
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Talk freely about anything in German — pick a theme for your AI
            partner to guide you deeper, practice your memory weak points
            naturally, and get native <strong>Alternative Sayings</strong> on
            every turn.
          </p>
        </div>

        {/* Custom Topic Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!customTopic.trim()) return;
            handleStartNewChat({ customTopic: customTopic.trim() });
          }}
          className="rounded-2xl bg-zinc-900 text-white p-5 sm:p-6 space-y-3"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Start Talking About Any Topic You Want</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Type any topic... e.g. 'My weekend plans', 'Renting an apartment in Berlin', 'AI in software jobs'..."
              className="flex-1 rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={startingThemeId !== null || !customTopic.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-5 py-3 text-sm transition cursor-pointer disabled:opacity-50"
            >
              {startingThemeId === "custom" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              <span>Start Free Chat</span>
            </button>
          </div>
        </form>

        {/* Curated Theme Cards */}
        <section className="space-y-3">
          <h2 className="font-bold text-base text-zinc-900">
            Or Pick a Guided Conversation Theme
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {boot.themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleStartNewChat({ themeId: t.id })}
                disabled={startingThemeId !== null}
                className="text-left rounded-2xl bg-white border border-zinc-200/80 hover:border-amber-400 p-4 sm:p-5 space-y-1.5 transition cursor-pointer disabled:opacity-60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-zinc-900">
                    {t.titleDe}
                  </span>
                  {startingThemeId === t.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  ) : (
                    <Mic className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div className="text-xs font-medium text-teal-700">
                  {t.title}
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {t.description}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // LIVE FREE CHAT VOICE STUDIO
  // =========================================================================
  return (
    <div className="fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-20 flex flex-col bg-[#f8f6f2] px-2.5 pt-2 pb-2 overflow-hidden overscroll-none md:static md:z-auto md:bg-transparent md:px-0 md:pt-0 md:pb-0 md:h-[calc(100dvh-3.5rem)] md:max-h-[920px]">
      {/* Top Bar: Theme Switcher, Memory Access Badge, Voice Controls */}
      <header className="rounded-2xl bg-white border border-zinc-200/80 p-3 sm:p-4 shadow-xs space-y-2.5 sm:space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                <MessageCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Free Chat</span>
                <span className="sm:hidden">Chat</span>
              </span>
              <h1 className="font-bold text-sm sm:text-base text-zinc-900 truncate">
                {activeChat.themeTitleDe}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <button
                onClick={() => setShowMemoryStrip((v) => !v)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 hover:underline cursor-pointer"
              >
                <Brain className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  Memory ({boot.memoryContext.activeBottlenecks.length} weak spots)
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mobile Voice Controls Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileControls((v) => !v)}
              className={`md:hidden inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg border cursor-pointer ${
                showMobileControls
                  ? "bg-amber-100 text-amber-950 border-amber-300"
                  : "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
              title="Voice speed & options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{voiceRate}×</span>
            </button>

            {/* Desktop Inline Controls */}
            <div className="hidden md:flex items-center gap-1.5">
              <VoiceSpeedControl value={voiceRate} onChange={setVoiceRate} />

              {!useWhisperMode && (
                <select
                  value={silenceMs}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSilenceMs(val);
                    if (val === 0) clearSilenceTimers();
                  }}
                  className="text-xs rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-medium text-zinc-700"
                >
                  <option value={0}>Wait: Manual</option>
                  <option value={8000}>Wait: 8s</option>
                  <option value={5000}>Wait: 5s</option>
                  <option value={3000}>Wait: 3s (Default)</option>
                  <option value={2200}>Wait: 2.2s</option>
                </select>
              )}

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
                <span>{handsFree ? "Always-Talk" : "Manual"}</span>
              </button>
            </div>

            <button
              onClick={handleSaveToMemory}
              disabled={savingMemory || activeChat.turnCount === 0}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer disabled:opacity-40"
              title="Analyze this chat and update Learner Memory & Progress"
            >
              {savingMemory ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden sm:inline">Save to Memory</span>
              <span className="sm:hidden">Save</span>
            </button>

            <button
              onClick={() => setShowHistory((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
              title="Past Free Chats"
            >
              <History className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                stopListening();
                stopSpeaking();
                setActiveChat(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 cursor-pointer"
              title="Start a brand new Free Chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Voice Options */}
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
              <span>{handsFree ? "Auto-Send" : "Manual"}</span>
            </button>
          </div>
        )}

        {/* Live Theme Switcher Bar (Horizontally scrollable single row on iPhone!) */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-zinc-100 overflow-x-auto no-scrollbar md:flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 mr-1 shrink-0">
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Steer Theme:</span>
          </span>
          {boot.themes.map((t) => {
            const isCurrent = activeChat.themeId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={startingThemeId !== null}
                onClick={() => {
                  unlockMobileAudio();
                  handleSwitchThemeMidChat({ themeId: t.id });
                }}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition cursor-pointer shrink-0 ${
                  isCurrent
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-amber-400 hover:bg-amber-50"
                }`}
              >
                {startingThemeId === t.id ? "Switching..." : t.title}
              </button>
            );
          })}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!customTopic.trim()) return;
              unlockMobileAudio();
              handleSwitchThemeMidChat({ customTopic: customTopic.trim() });
            }}
            className="inline-flex items-center gap-1 md:ml-auto shrink-0"
          >
            <input
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Custom theme..."
              className="w-32 sm:w-44 text-[11px] rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </form>
        </div>

        {/* Optional Expanded Memory Strip */}
        {showMemoryStrip && (
          <div className="rounded-xl bg-rose-50/60 border border-rose-200/80 p-3 text-xs space-y-1.5">
            <div className="font-bold text-rose-900">
              What Your Free Chat Coach Remembers Right Now:
            </div>
            {boot.memoryContext.activeBottlenecks.length > 0 && (
              <div className="text-zinc-700">
                <span className="font-semibold">Weak Points: </span>
                {boot.memoryContext.activeBottlenecks.join(" · ")}
              </div>
            )}
            {boot.memoryContext.recentExercises.length > 0 && (
              <div className="text-zinc-700">
                <span className="font-semibold">Recent Exercises: </span>
                {boot.memoryContext.recentExercises.slice(0, 3).join(" · ")}
              </div>
            )}
            {boot.memoryContext.recentVocab.length > 0 && (
              <div className="text-zinc-700">
                <span className="font-semibold">Saved Vocab to Reuse: </span>
                {boot.memoryContext.recentVocab.slice(0, 6).join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Optional Past Free Chats Switcher */}
        {showHistory && (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 space-y-2 max-h-44 overflow-y-auto">
            <div className="text-xs font-bold text-zinc-700">
              Your Past Free Chats ({boot.chats.length})
            </div>
            {boot.chats.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <button
                  onClick={() => {
                    stopListening();
                    stopSpeaking();
                    setActiveChat(c);
                    setShowHistory(false);
                  }}
                  className={`flex-1 text-left px-2.5 py-1.5 rounded-lg truncate cursor-pointer ${
                    c.id === activeChat.id
                      ? "bg-zinc-900 text-white font-semibold"
                      : "hover:bg-zinc-200 text-zinc-800"
                  }`}
                >
                  {c.themeTitleDe} ({c.turnCount} turns ·{" "}
                  {new Date(c.updatedAt).toLocaleDateString()})
                </button>
                <button
                  onClick={async () => {
                    await fetch(`/api/free-chat?id=${encodeURIComponent(c.id)}`, {
                      method: "DELETE",
                    });
                    const remaining = boot.chats.filter((x) => x.id !== c.id);
                    setBoot({ ...boot, chats: remaining });
                    if (c.id === activeChat.id) {
                      setActiveChat(remaining[0] ?? null);
                    }
                  }}
                  className="p-1 text-zinc-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </header>

      {savedNotice && (
        <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs text-emerald-900 font-medium">
          {savedNotice}
        </div>
      )}

      {errorMsg && (
        <div className="mt-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Conversation Stream (Only this inner pane scrolls on mobile!) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 sm:py-4 space-y-4 pr-1">
        {activeChat.messages.map((msg) => {
          const isCoach = msg.role === "coach";
          const isBlurred = isCoach && blindListening && !revealedIds[msg.id];
          const isTranslated = Boolean(translatedIds[msg.id]);
          const altExpanded = Boolean(expandedAltIds[msg.id]);

          if (isCoach) {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[88%] sm:max-w-[78%] rounded-2xl rounded-tl-sm bg-white border border-zinc-200/90 shadow-xs p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      SprachCoach
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReplay(msg)}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 cursor-pointer"
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
                          className="text-xs px-2 py-1 rounded-lg bg-zinc-100 text-zinc-700 cursor-pointer"
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
                          className={`p-1 rounded-lg cursor-pointer ${
                            isTranslated
                              ? "bg-amber-100 text-amber-900"
                              : "text-zinc-400 hover:bg-zinc-100"
                          }`}
                          title="Translate"
                        >
                          <Languages className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p
                    onClick={() => {
                      if (isBlurred)
                        setRevealedIds((p) => ({ ...p, [msg.id]: true }));
                    }}
                    className={`text-sm sm:text-base leading-relaxed text-zinc-900 ${
                      isBlurred ? "blur-sm select-none cursor-pointer" : ""
                    }`}
                  >
                    {msg.textDe}
                  </p>

                  {isTranslated && msg.translation && (
                    <p className="text-xs text-zinc-500 border-t border-zinc-100 pt-2">
                      {msg.translation}
                    </p>
                  )}

                  {msg.memoryBridgeNote && (
                    <div className="text-[11px] text-teal-800 bg-teal-50/80 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                      <Brain className="w-3 h-3 shrink-0" />
                      <span>{msg.memoryBridgeNote}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Learner message + Alternative Sayings & Gentle Grammar Fix
          const hasFeedback =
            Boolean(msg.correction) || (msg.alternatives?.length ?? 0) > 0;

          return (
            <div key={msg.id} className="flex flex-col items-end space-y-1.5">
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-zinc-900 text-white px-4 py-3 text-sm sm:text-base leading-relaxed shadow-xs">
                {msg.textDe}
              </div>

              {hasFeedback && (
                <div className="max-w-[90%] sm:max-w-[78%] w-full flex flex-col items-end">
                  <button
                    onClick={() =>
                      setExpandedAltIds((p) => ({
                        ...p,
                        [msg.id]: !p[msg.id],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-950 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>
                      {altExpanded
                        ? "Hide Alternative Sayings & Tips"
                        : `${
                            msg.alternatives?.length ?? 0
                          } Alternative Ways to Say This${
                            msg.correction ? " + Grammar Tip" : ""
                          }`}
                    </span>
                  </button>

                  {altExpanded && (
                    <div className="mt-1.5 w-full rounded-2xl bg-white border border-amber-200/90 p-3.5 text-xs space-y-2.5 shadow-xs">
                      {msg.correction && (
                        <div className="rounded-xl bg-rose-50/70 border border-rose-200/80 p-2.5 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-emerald-900">
                              ✓ Fix: {msg.correction.corrected}
                            </span>
                            <button
                              onClick={() =>
                                speakGerman(msg.correction!.corrected, {
                                  rate: voiceRate,
                                  ttsProvider,
                                  edgeVoice,
                                })
                              }
                              className="p-1 rounded hover:bg-white cursor-pointer shrink-0"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-zinc-700" />
                            </button>
                          </div>
                          <p className="text-zinc-600">
                            {msg.correction.explanation}
                          </p>
                        </div>
                      )}

                      {msg.alternatives && msg.alternatives.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                            Alternative Natural German Sayings
                          </div>
                          {msg.alternatives.map((alt, i) => {
                            const saved = Boolean(savedPhraseMap[alt.german]);
                            return (
                              <div
                                key={i}
                                className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-2.5 flex items-start justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <span
                                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                      alt.style === "exam_ready"
                                        ? "bg-teal-100 text-teal-900"
                                        : alt.style === "everyday"
                                        ? "bg-amber-100 text-amber-900"
                                        : "bg-indigo-100 text-indigo-900"
                                    }`}
                                  >
                                    {alt.label}
                                  </span>
                                  <div className="font-semibold text-zinc-900 text-xs sm:text-sm">
                                    „{alt.german}“
                                  </div>
                                  <div className="text-[11px] text-zinc-500">
                                    {alt.nuance}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() =>
                                      speakGerman(alt.german, {
                                        rate: voiceRate,
                                        ttsProvider,
                                        edgeVoice,
                                      })
                                    }
                                    title="Hear pronunciation"
                                    className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-amber-50 cursor-pointer"
                                  >
                                    <Volume2 className="w-3.5 h-3.5 text-zinc-700" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleSaveAlternativePhrase(alt)
                                    }
                                    disabled={saved}
                                    title="Save phrase to Vocabulary Bank"
                                    className={`p-1.5 rounded-lg border cursor-pointer ${
                                      saved
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "bg-white border-zinc-200 hover:bg-emerald-50 text-zinc-700"
                                    }`}
                                  >
                                    {saved ? (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <BookmarkPlus className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
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
        <div ref={bottomRef} />
      </div>

      {/* Hints Drawer */}
      {showHints && lastCoachMsg?.hints && lastCoachMsg.hints.length > 0 && (
        <div className="mb-2 rounded-2xl bg-amber-50 border border-amber-200 p-3 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
            <span>Ideas for What to Say Next in German</span>
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
                    })
                  }
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

      {/* Voice-First Control Dock (Pinned to bottom of chat frame) */}
      <footer className="rounded-2xl bg-white border border-zinc-200/90 p-2.5 sm:p-4 shadow-sm space-y-2.5 sm:space-y-3 shrink-0">
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
                      : "Recording German... tap Stop / Send when finished"
                    : silenceMs === 0 || !handsFree
                    ? "Listening patiently (tap Send when finished)"
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
                {liveTranscript || "Sprich einfach frei auf Deutsch los..."}
              </p>
            </div>
            {!useWhisperMode && liveTranscript && (
              <div className="flex items-center gap-1.5 shrink-0">
                {countdownSec !== null && (
                  <button
                    onClick={() => clearSilenceTimers()}
                    className="text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-950 px-2.5 py-1.5 rounded-lg cursor-pointer"
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
                  onClick={() => submitUtterance(liveTranscript)}
                  className="text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Send Now
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHints((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border cursor-pointer ${
                showHints
                  ? "bg-amber-100 border-amber-300 text-amber-900"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tipp</span>
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
                  <span>Stop / Send</span>
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

          <button
            onClick={() => setShowTextInput((v) => !v)}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border cursor-pointer ${
              showTextInput
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden sm:inline">Type</span>
          </button>
        </div>

        {showTextInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitUtterance(textInput);
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Schreib einfach frei auf Deutsch..."
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
