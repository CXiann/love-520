export const CHAPTER1_MOMENT_COUNT = 5;

/** Evenly spaced: 20%, 40%, 60%, 80%, 100% of the film. */
export const CHAPTER1_MOMENT_RATIOS = [0.2, 0.4, 0.6, 0.8, 1] as const;

/** Evenly spaced through the video — e.g. 10 min → 2, 4, 6, 8, 10 min. */
export function buildChapter1MomentTimes(
  durationSeconds: number,
  count = CHAPTER1_MOMENT_COUNT
): number[] {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return [];
  }
  const step = durationSeconds / count;
  return Array.from({ length: count }, (_, i) => step * (i + 1));
}

export function formatVideoTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
