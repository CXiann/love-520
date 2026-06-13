/** Bump when replacing a file at the same /uploads/ path so browsers fetch the new image. */
const UPLOAD_CACHE_VERSION = "3";

/** Local upload URLs get a cache-busting query (same path, new file). */
export function mediaSrc(url: string | null | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("/uploads/") && !trimmed.includes("?")) {
    return `${trimmed}?v=${UPLOAD_CACHE_VERSION}`;
  }
  return trimmed;
}
