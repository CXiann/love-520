export const DOLLS_QUEST_COMPLETE = "love520:dolls-quest-complete";

export type DollsQuestCompleteDetail = {
  total: number;
};

export function dispatchDollsQuestComplete(total: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<DollsQuestCompleteDetail>(DOLLS_QUEST_COMPLETE, {
      detail: { total },
    })
  );
}

export const CHAPTER2_GAME_COMPLETE = "love520:chapter2-game-complete";

export const CHAPTER2_GAME_COMPLETE_KEY = "love520_ch2_game_complete";
export const CHAPTER2_VOICE_INVITE_DISMISSED_KEY =
  "love520_ch2_voice_invite_dismissed";

/** @deprecated Name-spell no longer triggers forever; use CHAPTER2_VOICE_READY */
export function dispatchChapter2GameComplete() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAPTER2_GAME_COMPLETE));
}

export const CHAPTER2_VOICE_READY = "love520:chapter2-voice-ready";

export function dispatchChapter2VoiceReady() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAPTER2_VOICE_READY));
}

export const LETTER_READ = "love520:letter-read";
export const LETTER_READ_KEY = "love520_letter_read";

export function markLetterReadStorage() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LETTER_READ_KEY, "1");
}

export function isLetterReadFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(LETTER_READ_KEY) === "1";
}

export function dispatchLetterRead() {
  if (typeof window === "undefined") return;
  markLetterReadStorage();
  window.dispatchEvent(new CustomEvent(LETTER_READ));
}

export const VOICE_HEARTS_BOOST = "love520:voice-hearts-boost";

export type VoiceHeartsBoostDetail = {
  amount: number;
  phraseId: string;
};

export const TIMELINE_QUEST_COMPLETE = "love520:timeline-quest-complete";

export function dispatchTimelineQuestComplete() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TIMELINE_QUEST_COMPLETE));
}

export const GALLERY_QUEST_COMPLETE = "love520:gallery-quest-complete";

export function dispatchGalleryQuestComplete() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GALLERY_QUEST_COMPLETE));
}

export function dispatchVoiceHeartsBoost(
  amount: number,
  phraseId: string
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<VoiceHeartsBoostDetail>(VOICE_HEARTS_BOOST, {
      detail: { amount, phraseId },
    })
  );
}
