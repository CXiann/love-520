export type TimelineMilestone = {
  id: string;
  date: Date | string;
  sortOrder?: number;
};

export function getChronologicalOrder<T extends TimelineMilestone>(
  milestones: T[]
): T[] {
  return [...milestones].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (da !== db) return da - db;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

export function isPlacementCorrect(
  slotIndex: number,
  milestoneId: string,
  milestones: TimelineMilestone[]
): boolean {
  const ordered = getChronologicalOrder(milestones);
  return ordered[slotIndex]?.id === milestoneId;
}

export function shuffleIds(ids: string[], seed?: string): string[] {
  const arr = [...ids];
  let s = 0;
  if (seed) {
    for (let i = 0; i < seed.length; i++) {
      s = (s + seed.charCodeAt(i)) | 0;
    }
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = seed
      ? Math.abs((s = (s * 1103515245 + 12345) | 0)) % (i + 1)
      : Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isQuestSolved(
  slotAssignments: (string | null)[],
  milestones: TimelineMilestone[]
): boolean {
  const ordered = getChronologicalOrder(milestones);
  if (ordered.length === 0) return false;
  if (slotAssignments.length !== ordered.length) return false;
  return slotAssignments.every(
    (id, i) => id !== null && isPlacementCorrect(i, id, milestones)
  );
}
