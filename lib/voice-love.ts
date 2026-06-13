import { isLetterReadFromStorage } from "@/lib/game-events";
import { isGalleryQuestCompleteFromStorage } from "@/lib/gallery-quest";
import {
  isChapter1VoiceReadyFromStorage,
  isChapter2VoiceReadyFromStorage,
} from "@/lib/chapter-voice";

/** Web Speech API types (not in all TS libs) */
type SpeechRecognitionCtor = new () => SpeechRecognition;

export type VoicePhraseId = "forever" | "baby" | "everything" | "stillLove";

export const VOICE_PHRASE_EVERYTHING_LABEL = "You are my everything";
export const VOICE_PHRASE_STILL_LOVE_LABEL = "I will still love you";
export const VOICE_PHRASE_FOREVER_LABEL = "I love you forever";
export const VOICE_PHRASE_BABY_LABEL = "Baby love baby, baby love baby";
export const VOICE_PHRASE_BABY_CHUNK_LABEL = "Baby love baby";

export const VOICE_PHRASE_STORAGE_KEY = "love520_voice_phrases";

export function getSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function speechRecognitionLang(): string {
  return "en-US";
}

export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "I love you forever" */
function matchesForeverPhrase(normalized: string): boolean {
  if (!normalized) return false;
  if (normalized.includes("i love you forever")) return true;
  if (normalized.includes("love you forever")) return true;
  return (
    normalized.includes("forever") &&
    normalized.includes("love") &&
    (normalized.includes("you") || normalized.includes("u"))
  );
}

/** Single chunk for duet turns */
export function matchesBabyChunk(normalized: string): boolean {
  if (!normalized) return false;
  return normalized.includes("baby love baby");
}

/** "baby love baby, baby love baby" — both chunks required in one utterance */
function matchesBabyPhrase(normalized: string): boolean {
  if (!normalized) return false;

  const chunk = "baby love baby";
  // Adjacent repeat: "baby love baby baby love baby"
  if (normalized.includes(`${chunk} ${chunk}`)) return true;
  // With comma (or pause word) between the two phrases
  if (/baby love baby\s*,\s*baby love baby/.test(normalized)) return true;
  if (/baby love baby\s+(?:and|then|oh|yeah|uh)\s+baby love baby/.test(normalized)) {
    return true;
  }

  return false;
}

/** "I will still love you" */
function matchesStillLovePhrase(normalized: string): boolean {
  if (!normalized) return false;
  if (normalized.includes("i will still love you")) return true;
  if (normalized.includes("ill still love you")) return true;
  return (
    normalized.includes("still") &&
    normalized.includes("love") &&
    normalized.includes("you")
  );
}

/** "You are my everything" */
function matchesEverythingPhrase(normalized: string): boolean {
  if (!normalized) return false;
  if (normalized.includes("you are my everything")) return true;
  if (normalized.includes("youre my everything")) return true;
  if (normalized.includes("ur my everything")) return true;
  return (
    normalized.includes("everything") &&
    normalized.includes("my") &&
    (normalized.includes("you") || normalized.includes("u"))
  );
}

/** First unused phrase matched in text (skips already-redeemed phrases) */
export function matchVoicePhrase(
  text: string,
  used: ReadonlySet<VoicePhraseId> = new Set()
): VoicePhraseId | null {
  return matchAllVoicePhrases(text, used)[0] ?? null;
}

/** All unused phrases found in the same utterance */
export function matchAllVoicePhrases(
  text: string,
  used: ReadonlySet<VoicePhraseId> = new Set()
): VoicePhraseId[] {
  const n = normalizeSpeech(text);
  if (!n) return [];

  const found: VoicePhraseId[] = [];
  if (
    !used.has("forever") &&
    isChapter1VoiceReadyFromStorage() &&
    matchesForeverPhrase(n)
  ) {
    found.push("forever");
  }
  if (
    !used.has("baby") &&
    isChapter2VoiceReadyFromStorage() &&
    matchesBabyPhrase(n)
  ) {
    found.push("baby");
  }
  if (
    !used.has("everything") &&
    isLetterReadFromStorage() &&
    matchesEverythingPhrase(n)
  ) {
    found.push("everything");
  }
  if (
    !used.has("stillLove") &&
    isGalleryQuestCompleteFromStorage() &&
    matchesStillLovePhrase(n)
  ) {
    found.push("stillLove");
  }
  return found;
}

export function loadUsedVoicePhrases(): Set<VoicePhraseId> {
  if (typeof sessionStorage === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(VOICE_PHRASE_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(
      arr
        .map((id) => {
          if (id === "bibii" || id === "bebe") return "baby";
          return id;
        })
        .filter(
          (id): id is VoicePhraseId =>
            id === "forever" ||
            id === "baby" ||
            id === "everything" ||
            id === "stillLove"
        )
    );
  } catch {
    return new Set();
  }
}

export function saveUsedVoicePhrases(used: Set<VoicePhraseId>) {
  sessionStorage.setItem(
    VOICE_PHRASE_STORAGE_KEY,
    JSON.stringify([...used])
  );
}

export function collectTranscriptsFromEvent(
  event: SpeechRecognitionEvent
): string[] {
  const texts: string[] = [];
  for (let i = 0; i < event.results.length; i++) {
    const result = event.results[i];
    for (let j = 0; j < result.length; j++) {
      const t = result[j]?.transcript?.trim();
      if (t) texts.push(t);
    }
  }
  return texts;
}

/** Log speech-to-text to the browser console (DevTools → Console) */
export function logVoiceSpeech(
  label: string,
  detail: Record<string, unknown>
) {
  console.log(`[love520 voice] ${label}`, detail);
}

export function logTranscriptsFromEvent(event: SpeechRecognitionEvent) {
  const lines: Array<{
    index: number;
    isFinal: boolean;
    transcript: string;
    confidence?: number;
  }> = [];

  for (let i = 0; i < event.results.length; i++) {
    const result = event.results[i];
    const alt = result[0];
    if (!alt?.transcript?.trim()) continue;
    lines.push({
      index: i,
      isFinal: result.isFinal,
      transcript: alt.transcript.trim(),
      confidence: alt.confidence,
    });
  }

  if (lines.length > 0) {
    logVoiceSpeech("heard", { lines });
  }
}
