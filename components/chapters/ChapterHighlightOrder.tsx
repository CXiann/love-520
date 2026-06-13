"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { FilmStripSlideWithId } from "@/lib/chapter-eggs";
import { slidesByIds } from "@/lib/chapter2-highlights";
import {
  ChapterHighlightSlideCard,
  DRAG_TYPE,
} from "./ChapterHighlightSlideCard";

type ChapterHighlightOrderProps = {
  slides: FilmStripSlideWithId[];
  pickedIds: string[];
  slotAssignments: (string | null)[];
  slotLabels: string[];
  orderPrompt: string;
  orderHint: string;
  onSlotAssignmentsChange: (next: (string | null)[]) => void;
};

export function ChapterHighlightOrder({
  slides,
  pickedIds,
  slotAssignments,
  slotLabels,
  orderPrompt,
  orderHint,
  onSlotAssignmentsChange,
}: ChapterHighlightOrderProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const pickedSlides = useMemo(
    () => slidesByIds(slides, pickedIds),
    [slides, pickedIds]
  );

  const poolIds = useMemo(() => {
    const inSlot = new Set(slotAssignments.filter(Boolean));
    return pickedIds.filter((id) => !inSlot.has(id));
  }, [pickedIds, slotAssignments]);

  const tryPlace = useCallback(
    (slotIndex: number, slideId: string) => {
      if (slotAssignments[slotIndex]) return;
      const next = [...slotAssignments];
      next[slotIndex] = slideId;
      onSlotAssignmentsChange(next);
      setSelectedCardId(null);
    },
    [slotAssignments, onSlotAssignmentsChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      e.preventDefault();
      const id = e.dataTransfer.getData(DRAG_TYPE) || dragIdRef.current || "";
      if (!id || !pickedIds.includes(id)) return;
      tryPlace(slotIndex, id);
      dragIdRef.current = null;
    },
    [pickedIds, tryPlace]
  );

  return (
    <div className="mt-8">
      <p className="text-center text-sm text-muted">{orderPrompt}</p>
      <p className="mt-1 text-center text-xs text-muted/80">{orderHint}</p>

      {poolIds.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {poolIds.map((id) => {
            const slide = pickedSlides.find((s) => s.id === id);
            if (!slide) return null;
            return (
              <ChapterHighlightSlideCard
                key={id}
                slide={slide}
                selected={selectedCardId === id}
                onSelect={() =>
                  setSelectedCardId((prev) => (prev === id ? null : id))
                }
                onDragStart={(e) => {
                  dragIdRef.current = id;
                  e.dataTransfer.setData(DRAG_TYPE, id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  dragIdRef.current = null;
                }}
              />
            );
          })}
        </div>
      )}

      <div
        className="mt-10 flex gap-2 overflow-x-auto pb-4 md:gap-3"
        data-lenis-prevent
      >
        {slotLabels.map((label, i) => {
          const placedId = slotAssignments[i];
          const placed = placedId
            ? pickedSlides.find((s) => s.id === placedId)
            : null;
          return (
            <div
              key={label}
              className="flex min-w-[110px] flex-1 flex-col items-center md:min-w-[130px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
            >
              <span className="mb-2 text-[10px] uppercase tracking-wider text-muted">
                {label}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedCardId) tryPlace(i, selectedCardId);
                }}
                className={`flex min-h-[160px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-2 transition ${
                  placed
                    ? "border-accent/40 bg-accent/5"
                    : selectedCardId
                      ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                      : "border-accent/20 bg-surface-elevated/50"
                }`}
              >
                {placed ? (
                  <ChapterHighlightSlideCard
                    slide={placed}
                    locked
                    layout="slot"
                  />
                ) : (
                  <span className="text-xs text-muted">Drop here</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
