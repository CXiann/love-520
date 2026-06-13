export function parseOptionalDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseRequiredDate(value: unknown, label: string): Date {
  const d = parseOptionalDate(value);
  if (!d) throw new Error(`${label} is invalid or missing`);
  return d;
}

export function emptyToNull(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}
