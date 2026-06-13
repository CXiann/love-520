import {
  getChronologicalOrder,
  isQuestSolved,
  type TimelineMilestone,
} from "./timeline-quest-logic";

export const TIMELINE_QUEST_STORAGE_KEY = "love520_timeline_quest";
export const TIMELINE_QUEST_COMPLETE_KEY = "love520_timeline_quest_complete";

/** Shown only after every timeline photo is in the correct order */
export const TIMELINE_PASSWORD_HINT = "_ _ _ _ _ _ _ 5 2 0";

export type TimelineQuestPersist = {
  slotAssignments: (string | null)[];
  poolOrder: string[];
};

export function isTimelineQuestCompleteFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(TIMELINE_QUEST_COMPLETE_KEY) === "1";
}

export function markTimelineQuestCompleteStorage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TIMELINE_QUEST_COMPLETE_KEY, "1");
}

export function loadTimelineQuest(
  milestones: TimelineMilestone[],
  defaultPoolOrder: string[]
): TimelineQuestPersist {
  const ordered = getChronologicalOrder(milestones);
  const emptySlots = ordered.map(() => null as string | null);

  if (typeof window === "undefined") {
    return { slotAssignments: emptySlots, poolOrder: defaultPoolOrder };
  }

  if (isTimelineQuestCompleteFromStorage()) {
    return {
      slotAssignments: ordered.map((m) => m.id),
      poolOrder: [],
    };
  }

  try {
    const raw = sessionStorage.getItem(TIMELINE_QUEST_STORAGE_KEY);
    if (!raw) {
      return { slotAssignments: emptySlots, poolOrder: defaultPoolOrder };
    }
    const parsed = JSON.parse(raw) as TimelineQuestPersist;
    const validIds = new Set(milestones.map((m) => m.id));
    const slots = (parsed.slotAssignments ?? emptySlots).map((id) =>
      id && validIds.has(id) ? id : null
    );
    while (slots.length < ordered.length) slots.push(null);
    const trimmed = slots.slice(0, ordered.length);

    const poolOrder = (parsed.poolOrder ?? defaultPoolOrder).filter((id) =>
      validIds.has(id)
    );
    const inSlots = new Set(trimmed.filter(Boolean));
    const missing = defaultPoolOrder.filter(
      (id) => validIds.has(id) && !inSlots.has(id) && !poolOrder.includes(id)
    );

    return {
      slotAssignments: trimmed,
      poolOrder: [...poolOrder, ...missing],
    };
  } catch {
    return { slotAssignments: emptySlots, poolOrder: defaultPoolOrder };
  }
}

export function saveTimelineQuest(state: TimelineQuestPersist): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TIMELINE_QUEST_STORAGE_KEY, JSON.stringify(state));
}

export function hydrateCompletedQuest(
  milestones: TimelineMilestone[]
): TimelineQuestPersist {
  const ordered = getChronologicalOrder(milestones);
  return {
    slotAssignments: ordered.map((m) => m.id),
    poolOrder: [],
  };
}

export function checkAndMarkComplete(
  slotAssignments: (string | null)[],
  milestones: TimelineMilestone[]
): boolean {
  if (!isQuestSolved(slotAssignments, milestones)) return false;
  markTimelineQuestCompleteStorage();
  return true;
}
