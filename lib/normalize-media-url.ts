/** Turn admin paste paths into site-relative URLs the browser can load. */
export function normalizeMediaUrl(value: unknown): string | null {
  if (value == null) return null;
  let s = String(value).trim();
  if (!s) return null;

  const publicMatch = s.match(/\/public(\/uploads\/.+)$/i);
  if (publicMatch) {
    s = publicMatch[1];
  }

  if (s.startsWith("uploads/")) {
    s = `/${s}`;
  }

  if (!s.startsWith("/") && !s.startsWith("http")) {
    s = `/uploads/${s.replace(/^\/+/, "")}`;
  }

  return s;
}
