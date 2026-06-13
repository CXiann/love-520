export const CHAPTER1_VIDEO_COMPLETE_KEY = "love520_chapter1_video_complete";
export const CHAPTER2_VOICE_READY_KEY = "love520_chapter2_voice_ready";
export const BABY_DUET_PART1_KEY = "love520_baby_duet_part1";
export const BABY_DUET_PART2_KEY = "love520_baby_duet_part2";
export const BABY_DUET_COMPLETE_KEY = "love520_baby_duet_complete";

export function isChapter1VoiceReadyFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(CHAPTER1_VIDEO_COMPLETE_KEY) === "1";
}

export function markChapter1VoiceReadyStorage() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHAPTER1_VIDEO_COMPLETE_KEY, "1");
}

export function isChapter2VoiceReadyFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(CHAPTER2_VOICE_READY_KEY) === "1";
}

export function markChapter2VoiceReadyStorage() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHAPTER2_VOICE_READY_KEY, "1");
}

export function isBabyDuetPart1Done(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(BABY_DUET_PART1_KEY) === "1";
}

export function markBabyDuetPart1Done() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BABY_DUET_PART1_KEY, "1");
}

export function isBabyDuetPart2Done(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(BABY_DUET_PART2_KEY) === "1";
}

export function markBabyDuetPart2Done() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BABY_DUET_PART2_KEY, "1");
  sessionStorage.setItem(BABY_DUET_COMPLETE_KEY, "1");
}

export function isBabyDuetCompleteFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(BABY_DUET_COMPLETE_KEY) === "1";
}
