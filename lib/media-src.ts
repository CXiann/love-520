/** Bump when replacing a file at the same /uploads/ path so browsers fetch the new image. */
const UPLOAD_CACHE_VERSION = "3";

export function isLocalUpload(url: string | null | undefined): boolean {
  const trimmed = url?.trim();
  return Boolean(trimmed?.startsWith("/uploads/"));
}

/** Local upload URLs get a cache-busting query (same path, new file). */
export function mediaSrc(url: string | null | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  if (isLocalUpload(trimmed) && !trimmed.includes("?")) {
    return `${trimmed}?v=${UPLOAD_CACHE_VERSION}`;
  }
  return trimmed;
}
