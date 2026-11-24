import { TtsProviderType } from "./types";

export interface AudioTrackProgress {
  currentSec: number;
  totalSec: number;
  clipIndex: number;
  totalClips: number;
  segmentId?: string;
  isPaused: boolean;
  isEstimatedTotal: boolean;
}

export interface SpeechOptions {
  rate?: number;
  voiceName?: string;
  ttsProvider?: TtsProviderType;
  edgeVoice?: string;
  speakerEdgeVoiceHint?: string;
  geminiTtsVoice?: string;
  customTtsUrl?: string;
  customTtsModel?: string;
  customTtsVoice?: string;
  customTtsApiKey?: string;
  disableBrowserFallback?: boolean;
  startAtSec?: number;
  onStart?: () => void;
  onProgress?: (progress: AudioTrackProgress) => void;
  onEnd?: () => void;
  onError?: (err?: string) => void;
}

interface ActiveTrackController {
  pause: () => boolean;
  resume: () => boolean;
  seek: (targetSec: number) => void;
  isPaused: () => boolean;
}

let activeAudio: HTMLAudioElement | null = null;
let sharedAudioEl: HTMLAudioElement | null = null;
let mobileAudioUnlocked = false;
let unlockListenerInstalled = false;
let activeAudioUrl: string | null = null;
let activeAbortController: AbortController | null = null;
let activeTrackController: ActiveTrackController | null = null;
let speakGeneration = 0;

// Tiny valid silent WAV (44 bytes) used to unlock iOS Safari's HTMLAudioElement on first user tap
const SILENT_WAV_DATA_URI =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

export function isIosDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function getPreferredRecordingMimeType(): {
  mimeType: string;
  extension: string;
} {
  if (typeof window !== "undefined" && typeof MediaRecorder !== "undefined") {
    const candidates: Array<{ mimeType: string; extension: string }> = [
      { mimeType: "audio/webm;codecs=opus", extension: "webm" },
      { mimeType: "audio/webm", extension: "webm" },
      { mimeType: "audio/mp4", extension: "mp4" },
      { mimeType: "audio/mp4;codecs=mp4a.40.2", extension: "mp4" },
      { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
    ];
    for (const c of candidates) {
      try {
        if (
          typeof MediaRecorder.isTypeSupported === "function" &&
          MediaRecorder.isTypeSupported(c.mimeType)
        ) {
          return c;
        }
      } catch {
        // continue checking
      }
    }
  }
  return isIosDevice()
    ? { mimeType: "audio/mp4", extension: "mp4" }
    : { mimeType: "audio/webm", extension: "webm" };
}

function getOrCreateSharedAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    return null;
  }
  if (!sharedAudioEl) {
    const el = new Audio();
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");
    el.preload = "auto";
    sharedAudioEl = el;
  }
  return sharedAudioEl;
}

/**
 * Unlocks iOS Safari / mobile audio playback inside a user gesture (tap / click)
 * so subsequent async TTS clips (after LLM fetch or Lesezeit countdown) play cleanly.
 */
export function unlockMobileAudio(): void {
  if (typeof window === "undefined") return;
  // Desktop browsers do not require silent-WAV priming on a shared audio element;
  // running it right before speakGerman() can race with and interrupt real playback.
  if (!isIosDevice()) {
    mobileAudioUnlocked = true;
    return;
  }
  const el = getOrCreateSharedAudio();
  if (!el || mobileAudioUnlocked) return;

  try {
    // Only prime when idle (never interrupt active playback)
    if (!activeAudio) {
      el.src = SILENT_WAV_DATA_URI;
      el.volume = 0.01;
      const playPromise = el.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            if (el.src === SILENT_WAV_DATA_URI && !activeAudio) {
              el.pause();
              el.currentTime = 0;
            }
            el.volume = 1;
            mobileAudioUnlocked = true;
          })
          .catch(() => {
            el.volume = 1;
          });
      } else {
        el.volume = 1;
        mobileAudioUnlocked = true;
      }
    }
  } catch {
    el.volume = 1;
  }
}

export function installMobileAudioUnlockListener(): void {
  if (typeof window === "undefined" || unlockListenerInstalled) return;
  unlockListenerInstalled = true;

  const handler = () => {
    unlockMobileAudio();
    if (mobileAudioUnlocked) {
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("click", handler);
    }
  };

  window.addEventListener("touchstart", handler, { passive: true });
  window.addEventListener("pointerdown", handler, { passive: true });
  window.addEventListener("click", handler, { passive: true });
}

export function getGermanVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const all = window.speechSynthesis.getVoices();
  const german = all.filter((v) => v.lang.toLowerCase().startsWith("de"));

  const scoreVoice = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    let score = 0;
    if (v.lang.toLowerCase() === "de-de") score += 20;
    if (name.includes("natural") || name.includes("online")) score += 50;
    if (
      name.includes("katja") ||
      name.includes("conrad") ||
      name.includes("amala") ||
      name.includes("seraphina")
    )
      score += 40;
    if (name.includes("google")) score += 30;
    if (name.includes("anna") || name.includes("helena") || name.includes("hedda"))
      score += 15;
    return score;
  };

  return [...german].sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

export function pauseSpeaking(): boolean {
  if (activeTrackController) {
    return activeTrackController.pause();
  }
  if (activeAudio && !activeAudio.paused) {
    try {
      activeAudio.pause();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function resumeSpeaking(): boolean {
  if (activeTrackController) {
    return activeTrackController.resume();
  }
  if (activeAudio && activeAudio.paused) {
    try {
      void activeAudio.play();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function seekSpeaking(targetSec: number): void {
  if (activeTrackController) {
    activeTrackController.seek(Math.max(0, targetSec));
  }
}

export function estimateGermanClipDurationSec(
  text: string,
  rate = 1.0
): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const safeRate = Math.max(0.5, Math.min(2.0, rate || 1.0));
  // Natural German speech is ~2.35 words/sec at 1.0x
  return Math.max(1.5, Math.round((words / (2.35 * safeRate)) * 10) / 10);
}

export function estimateGermanTrackTimeline(
  items: Array<{ id?: string; label?: string; textDe: string }>,
  rate = 1.0
): {
  totalSec: number;
  markers: Array<{
    id?: string;
    label: string;
    startSec: number;
    durationSec: number;
  }>;
} {
  let offset = 0;
  const markers: Array<{
    id?: string;
    label: string;
    startSec: number;
    durationSec: number;
  }> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const clips = splitClientGermanSentences(item.textDe);
    const dur = clips.reduce(
      (sum, c) => sum + estimateGermanClipDurationSec(c, rate),
      0
    );
    markers.push({
      id: item.id,
      label: item.label || `Teil ${i + 1}`,
      startSec: Math.round(offset * 10) / 10,
      durationSec: Math.round(dur * 10) / 10,
    });
    offset += dur;
  }

  return {
    totalSec: Math.max(2, Math.round(offset * 10) / 10),
    markers,
  };
}

export function stopSpeaking(): void {
  speakGeneration += 1;
  activeTrackController = null;

  if (activeAbortController) {
    try {
      activeAbortController.abort("stopped");
    } catch {
      // ignore
    }
    activeAbortController = null;
  }

  if (activeAudio) {
    try {
      activeAudio.onended = null;
      activeAudio.onerror = null;
      activeAudio.ontimeupdate = null;
      activeAudio.onloadedmetadata = null;
      activeAudio.pause();
      activeAudio.currentTime = 0;
      if (activeAudio !== sharedAudioEl) {
        activeAudio.src = "";
      } else {
        activeAudio.removeAttribute("src");
        activeAudio.load();
      }
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  if (activeAudioUrl) {
    URL.revokeObjectURL(activeAudioUrl);
    activeAudioUrl = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speakWithBrowserFallback(text: string, options: SpeechOptions): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = options.rate ?? 1.1;

  const voices = getGermanVoices();
  if (options.voiceName) {
    const match = voices.find((v) => v.name === options.voiceName);
    if (match) utterance.voice = match;
  } else if (voices[0]) {
    utterance.voice = voices[0];
  }

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onError?.();

  window.speechSynthesis.speak(utterance);
}

/**
 * Groups sentences into natural conversational passages (~900 chars) matching the server.
 * Keeping a full coach turn or an entire Hören short text / dialogue turn together as ONE
 * audio stream preserves natural human cross-sentence intonation, breathing, and avoids rate limits.
 */
function splitClientGermanSentences(text: string): string[] {
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

interface SequenceClipItem {
  segmentId?: string;
  sentence: string;
  speakerEdgeVoiceHint?: string;
}

function playClipSequence(
  clips: SequenceClipItem[],
  fallbackText: string,
  options: SpeechOptions & { onSegmentChange?: (id?: string) => void } = {}
): void {
  if (typeof window === "undefined") {
    options.onEnd?.();
    return;
  }

  if (clips.length === 0) {
    options.onEnd?.();
    return;
  }

  stopSpeaking();
  const myGen = speakGeneration;
  const provider = options.ttsProvider;
  const rate = options.rate ?? 1.1;

  if (provider === "browser") {
    speakWithBrowserFallback(fallbackText, options);
    return;
  }

  const controller = new AbortController();
  activeAbortController = controller;
  options.onStart?.();

  // Estimated durations per clip; refined with exact audio.duration as each clip loads
  const clipDurations = clips.map((c) =>
    estimateGermanClipDurationSec(c.sentence, rate)
  );
  const clipExactLoaded = clips.map(() => false);

  const getTotalDuration = () =>
    clipDurations.reduce((sum, d) => sum + d, 0);

  const getClipStartOffset = (idx: number) => {
    let acc = 0;
    for (let k = 0; k < idx; k++) acc += clipDurations[k];
    return acc;
  };

  const resolvePositionForSec = (
    targetSec: number
  ): { clipIndex: number; localOffsetSec: number } => {
    const clamped = Math.max(0, targetSec);
    let acc = 0;
    for (let k = 0; k < clipDurations.length; k++) {
      const dur = clipDurations[k];
      if (clamped < acc + dur || k === clipDurations.length - 1) {
        return {
          clipIndex: k,
          localOffsetSec: Math.max(0, Math.min(Math.max(0, dur - 0.15), clamped - acc)),
        };
      }
      acc += dur;
    }
    return { clipIndex: 0, localOffsetSec: 0 };
  };

  let currentClipIdx = 0;
  let pausedState = false;
  const seekState: {
    pending: { clipIndex: number; localOffsetSec: number } | null;
  } = { pending: null };
  const consumePendingSeek = (): {
    clipIndex: number;
    localOffsetSec: number;
  } | null => {
    const next = seekState.pending;
    seekState.pending = null;
    return next;
  };
  let interruptCurrentClip: (() => void) | null = null;

  const emitProgress = (localSec: number) => {
    if (myGen !== speakGeneration) return;
    const totalSec = Math.max(1, getTotalDuration());
    const currentSec = Math.min(
      totalSec,
      Math.max(0, getClipStartOffset(currentClipIdx) + Math.max(0, localSec))
    );
    options.onProgress?.({
      currentSec,
      totalSec,
      clipIndex: currentClipIdx,
      totalClips: clips.length,
      segmentId: clips[currentClipIdx]?.segmentId,
      isPaused: pausedState,
      isEstimatedTotal: clipExactLoaded.some((v) => !v),
    });
  };

  activeTrackController = {
    pause: () => {
      if (myGen !== speakGeneration) return false;
      pausedState = true;
      if (activeAudio && !activeAudio.paused) {
        try {
          activeAudio.pause();
        } catch {
          // ignore
        }
      }
      emitProgress(activeAudio?.currentTime ?? 0);
      return true;
    },
    resume: () => {
      if (myGen !== speakGeneration) return false;
      pausedState = false;
      if (activeAudio) {
        try {
          void activeAudio.play();
        } catch {
          // ignore
        }
      }
      emitProgress(activeAudio?.currentTime ?? 0);
      return true;
    },
    seek: (targetSec: number) => {
      if (myGen !== speakGeneration) return;
      const target = resolvePositionForSec(targetSec);

      // Instant in-clip seek if we are already on that clip and audio is ready
      if (
        target.clipIndex === currentClipIdx &&
        activeAudio &&
        activeAudio.readyState >= 1
      ) {
        const maxLocal =
          Number.isFinite(activeAudio.duration) && activeAudio.duration > 0
            ? Math.max(0, activeAudio.duration - 0.15)
            : target.localOffsetSec;
        const clampedLocal = Math.max(0, Math.min(maxLocal, target.localOffsetSec));
        try {
          activeAudio.currentTime = clampedLocal;
        } catch {
          // ignore
        }
        emitProgress(clampedLocal);
        return;
      }

      // Cross-clip seek: jump playback loop cleanly without aborting the session
      seekState.pending = target;
      currentClipIdx = target.clipIndex;
      emitProgress(target.localOffsetSec);
      if (interruptCurrentClip) {
        interruptCurrentClip();
      }
    },
    isPaused: () => pausedState,
  };

  const fetchClipBlob = async (
    clip: SequenceClipItem,
    overrideProvider?: TtsProviderType
  ): Promise<Blob | null> => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          text: clip.sentence,
          rate,
          ttsProvider: overrideProvider ?? provider,
          edgeVoice: options.edgeVoice,
          speakerEdgeVoiceHint: clip.speakerEdgeVoiceHint,
          geminiTtsVoice: options.geminiTtsVoice,
          customTtsUrl: options.customTtsUrl,
          customTtsModel: options.customTtsModel,
          customTtsVoice: options.customTtsVoice,
          customTtsApiKey: options.customTtsApiKey,
          allowNeuralFallback: !options.disableBrowserFallback,
        }),
      });
      if (!res.ok) {
        if (
          !overrideProvider &&
          provider &&
          provider !== "edge_neural" &&
          !options.disableBrowserFallback
        ) {
          return await fetchClipBlob(clip, "edge_neural");
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `TTS HTTP ${res.status}`);
      }
      return await res.blob();
    } catch (err) {
      if (
        controller.signal.aborted ||
        myGen !== speakGeneration ||
        (err instanceof Error && err.name === "AbortError")
      ) {
        return null;
      }
      throw err;
    }
  };

  const playBlobOnce = async (
    blob: Blob,
    clipIdx: number,
    initialLocalOffset: number,
    useFreshAudio: boolean
  ): Promise<void> => {
    const url = URL.createObjectURL(blob);
    activeAudioUrl = url;
    const audio = useFreshAudio
      ? new Audio()
      : getOrCreateSharedAudio() ?? new Audio();
    audio.volume = 1;
    audio.src = url;
    activeAudio = audio;

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        audio.onended = null;
        audio.onerror = null;
        audio.ontimeupdate = null;
        audio.onloadedmetadata = null;
        if (activeAudioUrl === url) {
          URL.revokeObjectURL(url);
          activeAudioUrl = null;
        }
        if (activeAudio === audio) {
          activeAudio = null;
        }
        interruptCurrentClip = null;
      };

      const finish = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };

      const fail = (err: Error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(err);
      };

      interruptCurrentClip = () => {
        try {
          audio.pause();
        } catch {
          // ignore
        }
        finish();
      };

      let appliedOffset = false;
      const applyInitialOffset = () => {
        if (appliedOffset) return;
        appliedOffset = true;
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          clipDurations[clipIdx] = audio.duration;
          clipExactLoaded[clipIdx] = true;
        }
        if (initialLocalOffset > 0.05) {
          const maxSafe =
            Number.isFinite(audio.duration) && audio.duration > 0
              ? Math.max(0, audio.duration - 0.15)
              : initialLocalOffset;
          try {
            audio.currentTime = Math.min(maxSafe, initialLocalOffset);
          } catch {
            // ignore
          }
        }
        emitProgress(audio.currentTime || initialLocalOffset);
      };

      audio.onloadedmetadata = () => {
        applyInitialOffset();
      };

      audio.ontimeupdate = () => {
        emitProgress(audio.currentTime);
      };

      audio.onended = () => {
        emitProgress(clipDurations[clipIdx]);
        finish();
      };

      audio.onerror = () => {
        fail(new Error("Audio playback error"));
      };

      if (pausedState) {
        // Stay paused at the sought position until user hits Resume
        audio.load();
        return;
      }

      audio
        .play()
        .then(() => {
          applyInitialOffset();
        })
        .catch((err) => {
          fail(err instanceof Error ? err : new Error("Audio playback failed"));
        });
    });
  };

  (async () => {
    try {
      const cache = new Map<number, Promise<Blob | null>>();
      const getClipBlob = (idx: number): Promise<Blob | null> => {
        if (!cache.has(idx)) {
          cache.set(idx, fetchClipBlob(clips[idx]));
        }
        return cache.get(idx)!;
      };

      const startPos =
        options.startAtSec && options.startAtSec > 0
          ? resolvePositionForSec(options.startAtSec)
          : { clipIndex: 0, localOffsetSec: 0 };

      let i = startPos.clipIndex;
      let nextLocalOffset = startPos.localOffsetSec;
      currentClipIdx = i;
      emitProgress(nextLocalOffset);

      void getClipBlob(i);

      let currentSegId: string | undefined = undefined;

      while (i < clips.length) {
        if (myGen !== speakGeneration) return;
        currentClipIdx = i;

        if (i + 1 < clips.length) {
          void getClipBlob(i + 1);
        }

        const blob = await getClipBlob(i);
        if (!blob || myGen !== speakGeneration) return;

        // If user dragged the slider to another clip while this one was loading, jump immediately
        const prePlaySeek = consumePendingSeek();
        if (prePlaySeek) {
          i = prePlaySeek.clipIndex;
          nextLocalOffset = prePlaySeek.localOffsetSec;
          continue;
        }

        if (clips[i].segmentId !== currentSegId) {
          currentSegId = clips[i].segmentId;
          options.onSegmentChange?.(currentSegId);
        }

        const localOffsetForClip = nextLocalOffset;
        nextLocalOffset = 0;

        try {
          await playBlobOnce(blob, i, localOffsetForClip, false);
        } catch (playErr) {
          if (myGen !== speakGeneration || controller.signal.aborted) return;
          if (!seekState.pending) {
            try {
              await playBlobOnce(blob, i, localOffsetForClip, true);
            } catch {
              throw playErr;
            }
          }
        }

        if (myGen !== speakGeneration) return;

        const postPlaySeek = consumePendingSeek();
        if (postPlaySeek) {
          i = postPlaySeek.clipIndex;
          nextLocalOffset = postPlaySeek.localOffsetSec;
          continue;
        }

        i += 1;
      }

      if (myGen === speakGeneration) {
        activeTrackController = null;
        options.onSegmentChange?.(undefined);
        options.onEnd?.();
      }
    } catch (err) {
      if (myGen !== speakGeneration || controller.signal.aborted) return;
      if (err instanceof Error && err.name === "AbortError") return;
      activeTrackController = null;
      options.onSegmentChange?.(undefined);
      if (options.disableBrowserFallback) {
        options.onError?.(
          err instanceof Error ? err.message : "Voice synthesis failed"
        );
        return;
      }
      speakWithBrowserFallback(fallbackText, options);
    }
  })();
}

export function speakGerman(text: string, options: SpeechOptions = {}): void {
  const cleaned = text.trim();
  if (!cleaned) {
    options.onEnd?.();
    return;
  }

  const sentences = splitClientGermanSentences(cleaned);
  playClipSequence(
    sentences.map((sentence) => ({
      sentence,
      speakerEdgeVoiceHint: options.speakerEdgeVoiceHint,
    })),
    cleaned,
    options
  );
}

export interface MultiVoiceSegment {
  id?: string;
  textDe: string;
  edgeVoice?: string;
}

export function speakGermanSegments(
  segments: MultiVoiceSegment[],
  options: SpeechOptions & { onSegmentChange?: (id?: string) => void } = {}
): void {
  const valid = segments.filter((s) => s.textDe && s.textDe.trim().length > 0);
  if (valid.length === 0) {
    options.onEnd?.();
    return;
  }

  const combinedText = valid.map((s) => s.textDe.trim()).join(" ");
  const distinctSpeakerVoices = new Set(
    valid.map((s) => s.edgeVoice).filter(Boolean)
  );
  const isMultiSpeakerDialogue = distinctSpeakerVoices.size > 1;

  const clips: SequenceClipItem[] = [];
  for (const seg of valid) {
    const sentences = splitClientGermanSentences(seg.textDe);
    for (const sentence of sentences) {
      clips.push({
        segmentId: seg.id,
        sentence,
        speakerEdgeVoiceHint: isMultiSpeakerDialogue
          ? seg.edgeVoice
          : undefined,
      });
    }
  }

  playClipSequence(clips, combinedText, options);
}

export interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: {
        transcript: string;
      };
    };
  };
}

export interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
}

const INCOMPLETE_GERMAN_ENDINGS = new Set([
  "und",
  "oder",
  "aber",
  "denn",
  "weil",
  "dass",
  "das",
  "obwohl",
  "wenn",
  "damit",
  "bevor",
  "nachdem",
  "während",
  "als",
  "ob",
  "ohne",
  "mit",
  "für",
  "über",
  "unter",
  "auf",
  "in",
  "an",
  "zu",
  "zum",
  "zur",
  "von",
  "vom",
  "bei",
  "beim",
  "nach",
  "aus",
  "durch",
  "gegen",
  "um",
  "der",
  "die",
  "den",
  "dem",
  "des",
  "ein",
  "eine",
  "einen",
  "einem",
  "einer",
  "kein",
  "keine",
  "keinen",
  "mein",
  "meine",
  "dein",
  "deine",
  "ich",
  "du",
  "er",
  "sie",
  "es",
  "wir",
  "ihr",
  "man",
  "nicht",
  "sehr",
  "also",
  "vielleicht",
  "äh",
  "ähm",
]);

/**
 * Detects when a German learner pauses right after a dangling connector,
 * preposition, article, or pronoun (e.g. "... flexible Arbeitszeit und ohne")
 * so the coach gives extra patience instead of cutting off mid-sentence.
 */
export function isIncompleteGermanClause(text: string): boolean {
  const cleaned = text
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:„“"']+$/g, "");
  if (!cleaned) return false;
  const parts = cleaned.split(/\s+/);
  const lastWord = parts[parts.length - 1] ?? "";
  return INCOMPLETE_GERMAN_ENDINGS.has(lastWord);
}

export function createGermanSpeechRecognition(): BrowserSpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = "de-DE";
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  return rec;
}
