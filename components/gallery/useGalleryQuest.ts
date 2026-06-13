"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dispatchGalleryQuestComplete } from "@/lib/game-events";
import {
  isGalleryQuestCompleteFromStorage,
  loadGalleryQuest,
  markGalleryQuestCompleteStorage,
  saveGalleryQuest,
} from "@/lib/gallery-quest";

export type GalleryItemData = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  isDecoy: boolean;
};

export function useGalleryQuest(items: GalleryItemData[]) {
  const decoyIds = useMemo(
    () => items.filter((i) => Boolean(i.isDecoy)).map((i) => i.id),
    [items]
  );
  const totalDecoys = decoyIds.length;

  const [trashedIds, setTrashedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [completeDispatched, setCompleteDispatched] = useState(false);

  useEffect(() => {
    const loaded = loadGalleryQuest(decoyIds);
    setTrashedIds(new Set(loaded.trashedDecoyIds));
    setHydrated(true);
  }, [decoyIds.join(",")]);

  const trashedCount = useMemo(
    () => decoyIds.filter((id) => trashedIds.has(id)).length,
    [decoyIds, trashedIds]
  );

  const allDecoysTrashed =
    totalDecoys > 0 && trashedCount >= totalDecoys;

  useEffect(() => {
    if (!hydrated || !allDecoysTrashed || completeDispatched) return;
    if (!isGalleryQuestCompleteFromStorage()) {
      markGalleryQuestCompleteStorage();
      dispatchGalleryQuestComplete();
    }
    setCompleteDispatched(true);
  }, [hydrated, allDecoysTrashed, completeDispatched]);

  const trashDecoy = useCallback(
    (id: string) => {
      if (!decoyIds.includes(id)) return false;
      setTrashedIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        saveGalleryQuest({ trashedDecoyIds: [...next] });
        return next;
      });
      return true;
    },
    [decoyIds]
  );

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (Boolean(item.isDecoy) && trashedIds.has(item.id)) return false;
        return true;
      }),
    [items, trashedIds]
  );

  const questComplete =
    isGalleryQuestCompleteFromStorage() || allDecoysTrashed;

  return {
    hydrated,
    totalDecoys,
    trashedCount,
    allDecoysTrashed,
    questComplete,
    trashedIds,
    trashDecoy,
    visibleItems,
  };
}
