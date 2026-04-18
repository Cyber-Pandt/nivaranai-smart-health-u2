// Lightweight Web Speech API wrapper. Falls back gracefully where unsupported.
// Improvements:
//  - Only emits FINAL transcripts (interim shown separately, never persisted)
//  - Dedupes immediate word repeats ("fever fever fever" -> "fever")
//  - Collapses repeated short phrases (n-gram dedupe up to 4 words)

export type VoiceLang = "en-IN" | "hi-IN";

interface MinimalRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

export function getRecognitionCtor(): (new () => MinimalRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isVoiceSupported() {
  return getRecognitionCtor() !== null;
}

/** Remove repeated adjacent words and short phrase repeats. */
export function cleanTranscript(text: string): string {
  if (!text) return "";
  let t = text.replace(/\s+/g, " ").trim();
  // collapse repeated single words: "fever fever fever" -> "fever"
  t = t.replace(/\b(\w+)(?:\s+\1\b)+/gi, "$1");
  // collapse repeated 2-4 word phrases
  for (let n = 4; n >= 2; n--) {
    const re = new RegExp(`\\b((?:\\w+\\s+){${n - 1}}\\w+)(?:\\s+\\1\\b)+`, "gi");
    t = t.replace(re, "$1");
  }
  return t.trim();
}

export interface VoiceSession {
  stop: () => void;
}

export function startVoice(opts: {
  lang: VoiceLang;
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (msg: string) => void;
  onEnd: () => void;
}): VoiceSession | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    opts.onError("Voice input not supported on this browser. Please type instead.");
    return null;
  }
  const rec = new Ctor();
  rec.lang = opts.lang;
  rec.interimResults = true;
  rec.continuous = true;

  // Track which result indices we've already finalized to prevent
  // some browsers from re-emitting the same final result twice.
  const seenFinalIdx = new Set<number>();

  rec.onresult = (e: any) => {
    let interim = "";
    let final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      const txt = r[0]?.transcript ?? "";
      if (r.isFinal) {
        if (seenFinalIdx.has(i)) continue;
        seenFinalIdx.add(i);
        final += txt + " ";
      } else {
        interim += txt;
      }
    }
    if (final.trim()) opts.onFinal(cleanTranscript(final));
    if (interim.trim()) opts.onInterim(cleanTranscript(interim));
  };
  rec.onerror = (e: any) => {
    const msg =
      e?.error === "not-allowed"
        ? "Microphone permission denied."
        : `Voice error: ${e?.error ?? "unknown"}`;
    opts.onError(msg);
  };
  rec.onend = () => opts.onEnd();

  try {
    rec.start();
  } catch {
    opts.onError("Could not start mic.");
    return null;
  }
  return { stop: () => rec.stop() };
}
