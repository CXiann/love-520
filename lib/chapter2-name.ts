/** Strip spaces, hyphens, underscores for spelling tiles */
export function lettersFromPartnerName(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return [];

  const stripped = trimmed.replace(/[\s\-_.]/g, "");
  if (!stripped) return [];

  return [...stripped];
}

export function lettersMatch(spelled: string[], target: string[]): boolean {
  if (spelled.length !== target.length) return false;
  return spelled.every((ch, i) => {
    const t = target[i];
    if (/[a-zA-Z]/.test(ch) && /[a-zA-Z]/.test(t)) {
      return ch.toLowerCase() === t.toLowerCase();
    }
    return ch === t;
  });
}

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
