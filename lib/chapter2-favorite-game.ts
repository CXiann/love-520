import {
  normalizeFilmStripSlides,
  parseFilmStripJson,
  type FilmStripSlide,
  type FilmStripSlideWithId,
} from "./chapter-eggs";
import { DEFAULT_CHAPTER2_HIGHLIGHT_SLIDES } from "./chapter2-default-highlights";

export const DEFAULT_HIGHLIGHT_PICK_COUNT = 5;

export const DEFAULT_CURATE_PROMPT =
  "Choose the frames that were our year.";
export const DEFAULT_ORDER_PROMPT =
  "Drag your five moments into order — one to five.";
export const DEFAULT_ORDER_HINT =
  "Tap a photo, then tap a slot on mobile.";
export const DEFAULT_SLOT_LABELS = [
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
] as const;

export type Chapter2FavoriteGameConfig = {
  pickCount: number;
  curatePrompt: string;
  orderPrompt: string;
  orderHint: string;
  slotLabels: string[];
  slides: FilmStripSlide[];
};

export type Chapter2FavoriteGameParsed = Omit<
  Chapter2FavoriteGameConfig,
  "slides"
> & {
  slides: FilmStripSlideWithId[];
};

function clampPickCount(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return DEFAULT_HIGHLIGHT_PICK_COUNT;
  return Math.min(8, Math.max(3, Math.round(v)));
}

export function resolveSlotLabels(
  labels: string[] | undefined,
  pickCount: number
): string[] {
  const cleaned = (labels ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  const base =
    cleaned.length > 0 ? [...cleaned] : [...DEFAULT_SLOT_LABELS];
  while (base.length < pickCount) {
    base.push(`Moment ${base.length + 1}`);
  }
  return base.slice(0, pickCount);
}

function withDefaults(
  partial: Partial<Chapter2FavoriteGameConfig>
): Chapter2FavoriteGameConfig {
  const pickCount = clampPickCount(partial.pickCount);
  return {
    pickCount,
    curatePrompt: partial.curatePrompt?.trim() || DEFAULT_CURATE_PROMPT,
    orderPrompt: partial.orderPrompt?.trim() || DEFAULT_ORDER_PROMPT,
    orderHint: partial.orderHint?.trim() || DEFAULT_ORDER_HINT,
    slotLabels: resolveSlotLabels(partial.slotLabels, pickCount),
    slides:
      partial.slides && partial.slides.length > 0
        ? partial.slides
        : [...DEFAULT_CHAPTER2_HIGHLIGHT_SLIDES],
  };
}

/** Parse admin JSON — legacy slide array or full game object. */
export function parseChapter2FavoriteGame(
  json: string | null | undefined,
  options?: { useDefaultSlides?: boolean }
): Chapter2FavoriteGameParsed {
  const useDefaultSlides = options?.useDefaultSlides !== false;

  if (!json?.trim()) {
    const base = withDefaults({
      slides: useDefaultSlides ? DEFAULT_CHAPTER2_HIGHLIGHT_SLIDES : [],
    });
    return { ...base, slides: normalizeFilmStripSlides(base.slides) };
  }

  try {
    const parsed = JSON.parse(json) as unknown;

    if (Array.isArray(parsed)) {
      const slides = parseFilmStripJson(json);
      const base = withDefaults({
        slides:
          slides.length > 0
            ? slides
            : useDefaultSlides
              ? DEFAULT_CHAPTER2_HIGHLIGHT_SLIDES
              : [],
      });
      return { ...base, slides: normalizeFilmStripSlides(base.slides) };
    }

    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;
      const rawSlides = Array.isArray(o.slides) ? (o.slides as FilmStripSlide[]) : [];
      const slides = rawSlides.filter((s) => s?.imageUrl?.trim());
      const base = withDefaults({
        pickCount: clampPickCount(o.pickCount),
        curatePrompt:
          typeof o.curatePrompt === "string" ? o.curatePrompt : undefined,
        orderPrompt:
          typeof o.orderPrompt === "string" ? o.orderPrompt : undefined,
        orderHint: typeof o.orderHint === "string" ? o.orderHint : undefined,
        slotLabels: Array.isArray(o.slotLabels)
          ? (o.slotLabels as string[])
          : undefined,
        slides:
          slides.length > 0
            ? slides
            : useDefaultSlides
              ? DEFAULT_CHAPTER2_HIGHLIGHT_SLIDES
              : [],
      });
      return { ...base, slides: normalizeFilmStripSlides(base.slides) };
    }
  } catch {
    /* fall through */
  }

  const base = withDefaults({
    slides: useDefaultSlides ? DEFAULT_CHAPTER2_HIGHLIGHT_SLIDES : [],
  });
  return { ...base, slides: normalizeFilmStripSlides(base.slides) };
}

function adminConfigFromPartial(
  partial: Partial<Chapter2FavoriteGameConfig>
): Chapter2FavoriteGameConfig {
  const pickCount = clampPickCount(partial.pickCount);
  return {
    pickCount,
    curatePrompt: partial.curatePrompt?.trim() || DEFAULT_CURATE_PROMPT,
    orderPrompt: partial.orderPrompt?.trim() || DEFAULT_ORDER_PROMPT,
    orderHint: partial.orderHint?.trim() || DEFAULT_ORDER_HINT,
    slotLabels: resolveSlotLabels(partial.slotLabels, pickCount),
    slides: partial.slides ?? [],
  };
}

export function parseFavoriteGameForAdmin(
  json: string | null | undefined
): Chapter2FavoriteGameConfig {
  if (!json?.trim()) {
    return adminConfigFromPartial({ slides: [] });
  }

  try {
    const parsed = JSON.parse(json) as unknown;
    if (Array.isArray(parsed)) {
      const slides = parseFilmStripJson(json).map((s, i) => ({
        id: s.id?.trim() || `highlight-${i + 1}`,
        imageUrl: s.imageUrl ?? "",
        caption: s.caption ?? "",
        date: s.date ?? "",
      }));
      return adminConfigFromPartial({ slides });
    }
    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;
      const rawSlides = Array.isArray(o.slides) ? (o.slides as FilmStripSlide[]) : [];
      const slides = rawSlides.map((s, i) => ({
        id: s.id?.trim() || `highlight-${i + 1}`,
        imageUrl: s.imageUrl?.trim() ?? "",
        caption: s.caption?.trim() ?? "",
        date: s.date?.trim() ?? "",
      }));
      return adminConfigFromPartial({
        pickCount: clampPickCount(o.pickCount),
        curatePrompt:
          typeof o.curatePrompt === "string" ? o.curatePrompt : undefined,
        orderPrompt:
          typeof o.orderPrompt === "string" ? o.orderPrompt : undefined,
        orderHint: typeof o.orderHint === "string" ? o.orderHint : undefined,
        slotLabels: Array.isArray(o.slotLabels)
          ? (o.slotLabels as string[])
          : undefined,
        slides,
      });
    }
  } catch {
    /* ignore */
  }

  return adminConfigFromPartial({ slides: [] });
}

export function serializeFavoriteGameConfig(
  config: Chapter2FavoriteGameConfig
): string {
  const pickCount = clampPickCount(config.pickCount);
  const slides = config.slides
    .filter((s) => s.imageUrl?.trim())
    .map((s, i) => {
      const row: FilmStripSlide = {
        id: s.id?.trim() || `highlight-${i + 1}`,
        imageUrl: s.imageUrl.trim(),
      };
      if (s.caption?.trim()) row.caption = s.caption.trim();
      if (s.date?.trim()) row.date = s.date.trim();
      return row;
    });

  return JSON.stringify(
    {
      pickCount,
      curatePrompt: config.curatePrompt.trim() || DEFAULT_CURATE_PROMPT,
      orderPrompt: config.orderPrompt.trim() || DEFAULT_ORDER_PROMPT,
      orderHint: config.orderHint.trim() || DEFAULT_ORDER_HINT,
      slotLabels: resolveSlotLabels(config.slotLabels, pickCount),
      slides,
    },
    null,
    2
  );
}

export function newHighlightSlide(index: number): FilmStripSlide {
  return {
    id: `highlight-${index}`,
    imageUrl: "",
    caption: "",
    date: "",
  };
}
