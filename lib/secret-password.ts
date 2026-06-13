import { differenceInDays } from "date-fns";

export function relationshipDayCount(start: Date): number {
  return Math.max(0, differenceInDays(new Date(), start));
}

export function buildDynamicSecretPassword(start: Date): string {
  return `${relationshipDayCount(start)}CXMS520`;
}

/** Clue from five babies (MS). */
export const DOLLS_PASSWORD_HINT = "_ _ _ _ _MS_ _ _";

export function buildSecretPasswordHint(_start: Date): string {
  return DOLLS_PASSWORD_HINT;
}

/** Clue unlocked after collecting 520 hearts (C X). */
export const HEARTS_520_PASSWORD_HINT = "_ _ _ C X _ _ _ _ _";

export const HEARTS_520_HINT_KEY = "love520_hearts_520_hint";

export function unlockHearts520HintStorage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(HEARTS_520_HINT_KEY, "1");
}

export function isHearts520HintUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(HEARTS_520_HINT_KEY) === "1";
}

export const DOLLS_QUEST_STORAGE_KEY = "love520_dolls_quest";
export const DOLLS_ALL_COMPLETE_KEY = "love520_dolls_all_complete";

export function isDollsQuestCompleteFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(DOLLS_ALL_COMPLETE_KEY) === "1") return true;
  try {
    const raw = sessionStorage.getItem(DOLLS_QUEST_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { readIds?: string[] };
    return (parsed.readIds?.length ?? 0) >= 5;
  } catch {
    return false;
  }
}
