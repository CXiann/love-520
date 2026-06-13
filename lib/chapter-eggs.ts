export const CH1_HOTSPOTS_KEY = "love520_ch1_hotspots";
export const CH1_CROSS_KEY = "love520_ch1_key";
export const CH2_REDACT_KEY = "love520_ch2_redact";
export const CH2_WARMTH_KEY = "love520_ch2_warmth";

export type ChapterHotspot = {
  id: string;
  x: number;
  y: number;
  message: string;
  grantsKey?: boolean;
};

export type FilmStripSlide = {
  id?: string;
  imageUrl: string;
  caption?: string;
  date?: string;
};

export type FilmStripSlideWithId = FilmStripSlide & { id: string };

export type RedactSegment =
  | { type: "text"; value: string }
  | { type: "redact"; value: string; id: string };

const REDACT_RE = /\[\[redact:([^\]]+)\]\]/g;

export function parseCopyWithRedactions(copy: string): RedactSegment[] {
  const segments: RedactSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let redactIndex = 0;

  const re = new RegExp(REDACT_RE.source, "g");
  while ((match = re.exec(copy)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: copy.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: "redact",
      value: match[1],
      id: `r${redactIndex++}`,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < copy.length) {
    segments.push({ type: "text", value: copy.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: copy }];
}

export const DEFAULT_CH1_HOTSPOTS: ChapterHotspot[] = [
  {
    id: "h1",
    x: 18,
    y: 28,
    message: "The nervous smile before our first photo together.",
  },
  {
    id: "h2",
    x: 78,
    y: 38,
    message: "You said yes to one more hour — we stayed until the lights came on.",
  },
  {
    id: "h3",
    x: 48,
    y: 72,
    message: "That was the night I knew we'd keep choosing each other.",
    grantsKey: true,
  },
];

export function parseHotspotsJson(json: string | null | undefined): ChapterHotspot[] {
  if (!json?.trim()) return DEFAULT_CH1_HOTSPOTS;
  try {
    const parsed = JSON.parse(json) as ChapterHotspot[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* ignore */
  }
  return DEFAULT_CH1_HOTSPOTS;
}

export function parseFilmStripJson(
  json: string | null | undefined
): FilmStripSlide[] {
  if (!json?.trim()) return [];
  try {
    const parsed = JSON.parse(json) as FilmStripSlide[];
    return Array.isArray(parsed) ? parsed.filter((s) => s.imageUrl) : [];
  } catch {
    return [];
  }
}

export function normalizeFilmStripSlides(
  slides: FilmStripSlide[]
): FilmStripSlideWithId[] {
  return slides.map((s, i) => ({
    ...s,
    id: s.id?.trim() || `slide-${i}-${s.imageUrl}`,
  }));
}

export function getRedactIdsFromCopy(copy: string): string[] {
  return parseCopyWithRedactions(copy)
    .filter((s) => s.type === "redact")
    .map((s) => s.id);
}

export function loadChapter2RevealedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(CH2_REDACT_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

export function revealChapter2RedactIds(ids: string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;
  const prev = loadChapter2RevealedIds();
  for (const id of ids) prev.add(id);
  sessionStorage.setItem(CH2_REDACT_KEY, JSON.stringify([...prev]));
  window.dispatchEvent(new CustomEvent("love520:ch2-redact-reveal"));
}
