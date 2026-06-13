import type { FilmStripSlideWithId } from "./chapter-eggs";
import { normalizeFilmStripSlides, type FilmStripSlide } from "./chapter-eggs";
import { DEFAULT_HIGHLIGHT_PICK_COUNT } from "./chapter2-favorite-game";
import { isChapter2VoiceReadyFromStorage } from "./chapter-voice";

/** @deprecated Use pickCount from favorite game config */
export const HIGHLIGHT_PICK_COUNT = DEFAULT_HIGHLIGHT_PICK_COUNT;

export const CHAPTER2_HIGHLIGHTS_STORAGE_KEY = "love520_chapter2_highlights";
export const CHAPTER2_HIGHLIGHTS_COMPLETE_KEY = "love520_chapter2_highlights_complete";

export type HighlightPhase = "curate" | "order" | "complete";

export type HighlightsPersist = {
  phase: HighlightPhase;
  pickedIds: string[];
  orderedIds: string[];
  poolOrder: string[];
};

export function isHighlightsQuestCompleteFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return (
    sessionStorage.getItem(CHAPTER2_HIGHLIGHTS_COMPLETE_KEY) === "1" ||
    isChapter2VoiceReadyFromStorage()
  );
}

export function markHighlightsQuestCompleteStorage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHAPTER2_HIGHLIGHTS_COMPLETE_KEY, "1");
}

export function shuffleSlideIds(ids: string[], seed = "highlights"): string[] {
  const arr = [...ids];
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = (s + seed.charCodeAt(i)) | 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.abs((s = (s * 1103515245 + 12345) | 0)) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function loadHighlightsQuest(
  slides: FilmStripSlide[],
  defaultPoolOrder: string[],
  pickCount: number = DEFAULT_HIGHLIGHT_PICK_COUNT
): HighlightsPersist {
  const normalized = normalizeFilmStripSlides(slides);
  const allIds = normalized.map((s) => s.id);
  const empty: HighlightsPersist = {
    phase: "curate",
    pickedIds: [],
    orderedIds: [],
    poolOrder: defaultPoolOrder,
  };

  if (typeof window === "undefined") return empty;

  if (isHighlightsQuestCompleteFromStorage()) {
    try {
      const raw = sessionStorage.getItem(CHAPTER2_HIGHLIGHTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HighlightsPersist;
        const pickedIds = (parsed.pickedIds ?? []).filter((id) =>
          allIds.includes(id)
        );
        const orderedIds = (parsed.orderedIds ?? []).filter((id) =>
          allIds.includes(id)
        );
        if (orderedIds.length >= pickCount) {
          return {
            phase: "complete",
            pickedIds,
            orderedIds,
            poolOrder: [],
          };
        }
      }
    } catch {
      /* ignore */
    }
    const picked =
      normalized.length <= pickCount
        ? allIds
        : allIds.slice(0, pickCount);
    return {
      phase: "complete",
      pickedIds: picked,
      orderedIds: picked,
      poolOrder: [],
    };
  }

  try {
    const raw = sessionStorage.getItem(CHAPTER2_HIGHLIGHTS_STORAGE_KEY);
    if (!raw) {
      if (normalized.length <= pickCount) {
        return {
          phase: "order",
          pickedIds: allIds,
          orderedIds: [],
          poolOrder: [],
        };
      }
      return empty;
    }
    const parsed = JSON.parse(raw) as HighlightsPersist;
    const valid = new Set(allIds);
    const pickedIds = (parsed.pickedIds ?? []).filter((id) => valid.has(id));
    const orderedIds = (parsed.orderedIds ?? []).filter((id) => valid.has(id));
    const poolOrder = (parsed.poolOrder ?? defaultPoolOrder).filter((id) =>
      valid.has(id)
    );
    const phase =
      parsed.phase === "order" || parsed.phase === "complete"
        ? parsed.phase
        : "curate";

    return { phase, pickedIds, orderedIds, poolOrder };
  } catch {
    return empty;
  }
}

export function saveHighlightsQuest(state: HighlightsPersist): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHAPTER2_HIGHLIGHTS_STORAGE_KEY, JSON.stringify(state));
}

export function slidesByIds(
  normalized: FilmStripSlideWithId[],
  ids: string[]
): FilmStripSlideWithId[] {
  const map = new Map(normalized.map((s) => [s.id, s]));
  return ids.map((id) => map.get(id)).filter(Boolean) as FilmStripSlideWithId[];
}

export function isOrderPhaseComplete(
  orderedIds: string[],
  pickCount: number = DEFAULT_HIGHLIGHT_PICK_COUNT
): boolean {
  return orderedIds.length >= pickCount;
}
