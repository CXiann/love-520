"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useEasterEgg } from "../easter-eggs/EasterEggProvider";
import { dispatchTimelineQuestComplete } from "@/lib/game-events";
import {
  checkAndMarkComplete,
  hydrateCompletedQuest,
  isTimelineQuestCompleteFromStorage,
  loadTimelineQuest,
  markTimelineQuestCompleteStorage,
  saveTimelineQuest,
} from "@/lib/timeline-quest";
import {
  getChronologicalOrder,
  isPlacementCorrect,
  shuffleIds,
} from "@/lib/timeline-quest-logic";
import { TimelineClueReveal } from "./TimelineClueReveal";
import { TimelineDropSlot } from "./TimelineDropSlot";
import { TimelinePhotoCard } from "./TimelinePhotoCard";
import { TimelineRestored } from "./TimelineRestored";
import type { TimelineMilestoneData } from "./types";

const DRAG_TYPE = "application/x-love520-milestone";

type TimelineQuestProps = {
  milestones: TimelineMilestoneData[];
};

export function TimelineQuest({ milestones }: TimelineQuestProps) {
  const { showToast } = useEasterEgg();
  const ordered = useMemo(
    () => getChronologicalOrder(milestones),
    [milestones]
  );

  const defaultPoolOrder = useMemo(
    () => shuffleIds(milestones.map((m) => m.id), "timeline-quest"),
    [milestones]
  );

  const [hydrated, setHydrated] = useState(false);
  const [complete, setComplete] = useState(false);
  const [slotAssignments, setSlotAssignments] = useState<(string | null)[]>(
    () => ordered.map(() => null)
  );
  const [poolOrder, setPoolOrder] = useState<string[]>(defaultPoolOrder);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const confettiFired = useRef(false);

  const byId = useMemo(() => {
    const map = new Map<string, TimelineMilestoneData>();
    for (const m of milestones) map.set(m.id, m);
    return map;
  }, [milestones]);

  useEffect(() => {
    if (milestones.length === 0) return;
    if (isTimelineQuestCompleteFromStorage()) {
      const done = hydrateCompletedQuest(milestones);
      setSlotAssignments(done.slotAssignments);
      setPoolOrder(done.poolOrder);
      setComplete(true);
    } else {
      const loaded = loadTimelineQuest(milestones, defaultPoolOrder);
      setSlotAssignments(loaded.slotAssignments);
      setPoolOrder(loaded.poolOrder);
      if (checkAndMarkComplete(loaded.slotAssignments, milestones)) {
        setComplete(true);
      }
    }
    setHydrated(true);
  }, [milestones, defaultPoolOrder]);

  const persist = useCallback(
    (slots: (string | null)[], pool: string[]) => {
      saveTimelineQuest({ slotAssignments: slots, poolOrder: pool });
    },
    []
  );

  const poolMilestones = useMemo(
    () => poolOrder.map((id) => byId.get(id)).filter(Boolean) as TimelineMilestoneData[],
    [poolOrder, byId]
  );

  const tryPlace = useCallback(
    (slotIndex: number, milestoneId: string) => {
      if (complete) return;
      if (slotAssignments[slotIndex]) return;

      if (!isPlacementCorrect(slotIndex, milestoneId, milestones)) {
        showToast("Not quite — check the dates.");
        setSelectedCardId(null);
        return;
      }

      const nextSlots = [...slotAssignments];
      nextSlots[slotIndex] = milestoneId;
      const nextPool = poolOrder.filter((id) => id !== milestoneId);

      setSlotAssignments(nextSlots);
      setPoolOrder(nextPool);
      setSelectedCardId(null);
      persist(nextSlots, nextPool);

      if (checkAndMarkComplete(nextSlots, milestones)) {
        markTimelineQuestCompleteStorage();
        setComplete(true);
        dispatchTimelineQuestComplete();
        if (!confettiFired.current) {
          confettiFired.current = true;
          const colors = ["#e8a0b4", "#f5f0eb", "#c4788e"];
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.5 },
            colors,
          });
        }
      }
    },
    [complete, slotAssignments, poolOrder, milestones, showToast, persist]
  );

  const handleSlotTap = useCallback(
    (slotIndex: number) => {
      if (complete || slotAssignments[slotIndex]) return;
      if (!selectedCardId) return;
      tryPlace(slotIndex, selectedCardId);
    },
    [complete, slotAssignments, selectedCardId, tryPlace]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, id: string) => {
      dragIdRef.current = id;
      e.dataTransfer.setData(DRAG_TYPE, id);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDropEvent = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      e.preventDefault();
      const id =
        e.dataTransfer.getData(DRAG_TYPE) || dragIdRef.current || "";
      if (!id) return;
      tryPlace(slotIndex, id);
      dragIdRef.current = null;
    },
    [tryPlace]
  );

  const toggleSelect = useCallback(
    (id: string) => {
      if (complete) return;
      setSelectedCardId((prev) => (prev === id ? null : id));
    },
    [complete]
  );

  if (!hydrated || milestones.length === 0) return null;

  return (
    <div className="mt-12 w-full">
      {!complete && (
        <>
          <p className="text-center text-sm text-muted">
            Drag each photo onto the timeline — earliest on the left. On mobile,
            tap a photo, then tap a slot.
          </p>
          <p className="mt-1 text-center text-xs text-muted/80">
            Earliest → latest
          </p>

          <div
            className="mt-8 flex flex-wrap justify-center gap-5 px-2"
            data-lenis-prevent
          >
            {poolMilestones.map((m) => (
              <TimelinePhotoCard
                key={m.id}
                milestone={m}
                selected={selectedCardId === m.id}
                onSelect={() => toggleSelect(m.id)}
                onDragStart={(e) => handleDragStart(e, m.id)}
                onDragEnd={() => {
                  dragIdRef.current = null;
                }}
              />
            ))}
          </div>

          <div
            className="mt-12 flex items-end gap-3 overflow-x-auto px-2 pb-4 md:gap-4"
            data-lenis-prevent
          >
            {ordered.map((expected, i) => {
              const placedId = slotAssignments[i];
              const placed = placedId ? byId.get(placedId) ?? null : null;
              return (
                <TimelineDropSlot
                  key={expected.id}
                  slotIndex={i}
                  expectedMilestone={expected}
                  placed={placed}
                  selectedCardId={selectedCardId}
                  onSlotTap={handleSlotTap}
                  onDragOver={handleDragOver}
                  onDropEvent={handleDropEvent}
                />
              );
            })}
          </div>
        </>
      )}

      {complete && (
        <>
          <TimelineClueReveal />
          <TimelineRestored milestones={ordered} />
        </>
      )}
    </div>
  );
}
