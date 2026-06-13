"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dispatchDollsQuestComplete } from "@/lib/game-events";
import { DOLLS_ALL_COMPLETE_KEY } from "@/lib/secret-password";
import type { MemoryDollData } from "./types";

const STORAGE_KEY = "love520_dolls_quest";
const LEGACY_VISITED_KEY = "love520_dolls_visited";

type QuestPersist = {
  questStep: number;
  placedIds: string[];
  readIds: string[];
};

function sortDolls(dolls: MemoryDollData[]) {
  return [...dolls].sort((a, b) => a.sortOrder - b.sortOrder);
}

function reconcileQuest(
  sorted: MemoryDollData[],
  readIds: string[],
  placedIds: string[]
): QuestPersist {
  const readSet = new Set(readIds);
  const firstIncomplete = sorted.findIndex((d) => !readSet.has(d.id));
  const questStep =
    firstIncomplete < 0 ? sorted.length : firstIncomplete;

  const uniquePlaced = [
    ...new Set(
      placedIds
        .filter((id) => sorted.some((d) => d.id === id))
        .concat(readIds)
    ),
  ];

  return {
    questStep,
    placedIds: uniquePlaced,
    readIds: readIds.filter((id) => sorted.some((d) => d.id === id)),
  };
}

function loadQuest(sorted: MemoryDollData[]): QuestPersist {
  const dollIds = sorted.map((d) => d.id);
  const empty: QuestPersist = { questStep: 0, placedIds: [], readIds: [] };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as QuestPersist;
      const readIds = (parsed.readIds ?? []).filter((id) => dollIds.includes(id));
      const placedIds = (parsed.placedIds ?? []).filter((id) =>
        dollIds.includes(id)
      );
      return reconcileQuest(sorted, readIds, placedIds);
    }
    const legacy = sessionStorage.getItem(LEGACY_VISITED_KEY);
    if (legacy) {
      const ids = (JSON.parse(legacy) as string[]).filter((id) =>
        dollIds.includes(id)
      );
      if (ids.length > 0) {
        return reconcileQuest(sorted, ids, ids);
      }
    }
  } catch {
    /* ignore */
  }
  return empty;
}

function saveQuest(state: QuestPersist) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useDollQuest(dolls: MemoryDollData[]) {
  const sorted = useMemo(() => sortDolls(dolls), [dolls]);
  const dollIds = useMemo(() => sorted.map((d) => d.id), [sorted]);

  const [questStep, setQuestStep] = useState(0);
  const [placedIds, setPlacedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [questCompleteDispatched, setQuestCompleteDispatched] = useState(false);

  useEffect(() => {
    const loaded = loadQuest(sorted);
    saveQuest(loaded);
    setQuestStep(loaded.questStep);
    setPlacedIds(new Set(loaded.placedIds));
    setReadIds(new Set(loaded.readIds));
    if (
      dollIds.length > 0 &&
      loaded.readIds.length >= dollIds.length
    ) {
      sessionStorage.setItem(DOLLS_ALL_COMPLETE_KEY, "1");
    }
    setHydrated(true);
  }, [sorted, dollIds.length]);

  const persist = useCallback((next: QuestPersist) => {
    setQuestStep(next.questStep);
    setPlacedIds(new Set(next.placedIds));
    setReadIds(new Set(next.readIds));
    saveQuest(next);
  }, []);

  const activeDoll = questStep < sorted.length ? sorted[questStep] : null;

  const allComplete =
    sorted.length > 0 && readIds.size >= sorted.length;

  const dollIndex = useCallback(
    (id: string) => sorted.findIndex((d) => d.id === id),
    [sorted]
  );

  const isComplete = useCallback((id: string) => readIds.has(id), [readIds]);

  const isRevealed = useCallback(
    (id: string) => placedIds.has(id) || readIds.has(id),
    [placedIds, readIds]
  );

  const canScratch = useCallback(
    (id: string) => {
      if (!activeDoll || activeDoll.id !== id) return false;
      return !placedIds.has(id) && !readIds.has(id);
    },
    [activeDoll, placedIds, readIds]
  );

  const isReady = useCallback(
    (id: string) => {
      if (!activeDoll || activeDoll.id !== id) return false;
      return placedIds.has(id) && !readIds.has(id);
    },
    [activeDoll, placedIds, readIds]
  );

  const isLocked = useCallback(
    (id: string) => {
      if (isComplete(id)) return false;
      if (isReady(id)) return false;
      if (canScratch(id)) return false;
      const idx = dollIndex(id);
      if (idx < 0) return true;
      return idx > questStep;
    },
    [isComplete, isReady, canScratch, dollIndex, questStep]
  );

  const markRevealed = useCallback(
    (id: string) => {
      if (placedIds.has(id) || readIds.has(id)) return;
      persist({
        questStep,
        placedIds: [...placedIds, id],
        readIds: [...readIds],
      });
    },
    [placedIds, readIds, questStep, persist]
  );

  const markMemoryRead = useCallback(
    (id: string) => {
      if (readIds.has(id)) return;
      const nextRead = [...readIds, id];
      const nextPlaced = placedIds.has(id)
        ? [...placedIds]
        : [...placedIds, id];
      const idx = dollIndex(id);
      const nextStep =
        idx === questStep && idx >= 0
          ? Math.min(questStep + 1, sorted.length)
          : questStep;
      persist({
        questStep: nextStep,
        placedIds: nextPlaced,
        readIds: nextRead,
      });
    },
    [readIds, placedIds, questStep, dollIndex, sorted.length, persist]
  );

  const getQuestState = useCallback(
    (id: string): "locked" | "ready" | "complete" | "scratchable" => {
      if (isComplete(id)) return "complete";
      if (isReady(id)) return "ready";
      if (canScratch(id)) return "scratchable";
      return "locked";
    },
    [isComplete, isReady, canScratch]
  );

  useEffect(() => {
    if (!hydrated || !allComplete || questCompleteDispatched) return;
    setQuestCompleteDispatched(true);
    sessionStorage.setItem(DOLLS_ALL_COMPLETE_KEY, "1");
    dispatchDollsQuestComplete(sorted.length);
  }, [hydrated, allComplete, questCompleteDispatched, sorted.length]);

  return {
    sorted,
    activeDoll,
    questStep,
    hydrated,
    allComplete,
    readCount: readIds.size,
    total: sorted.length,
    isComplete,
    isRevealed,
    canScratch,
    isReady,
    isLocked,
    getQuestState,
    markRevealed,
    markMemoryRead,
  };
}
