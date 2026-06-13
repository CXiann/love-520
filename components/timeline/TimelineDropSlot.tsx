"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { TimelinePhotoCard } from "./TimelinePhotoCard";
import type { TimelineMilestoneData } from "./types";

type TimelineDropSlotProps = {
  slotIndex: number;
  expectedMilestone: TimelineMilestoneData | null;
  placed: TimelineMilestoneData | null;
  selectedCardId: string | null;
  onSlotTap: (slotIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropEvent: (e: React.DragEvent, slotIndex: number) => void;
};

export function TimelineDropSlot({
  slotIndex,
  expectedMilestone,
  placed,
  selectedCardId,
  onSlotTap,
  onDragOver,
  onDropEvent,
}: TimelineDropSlotProps) {
  const hintDate = expectedMilestone
    ? format(new Date(expectedMilestone.date), "MMM ''yy")
    : "";

  return (
    <div
      className="flex min-w-[132px] flex-1 flex-col items-center sm:min-w-[148px] md:min-w-[168px]"
      onDragOver={onDragOver}
      onDrop={(e) => onDropEvent(e, slotIndex)}
    >
      <span className="mb-2 text-[10px] uppercase tracking-wider text-muted/80">
        {slotIndex === 0 ? "Earliest" : hintDate}
      </span>
      <motion.button
        type="button"
        onClick={() => onSlotTap(slotIndex)}
        className={`flex min-h-[220px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-2 transition ${
          placed
            ? "border-accent/40 bg-accent/5"
            : selectedCardId
              ? "border-accent bg-accent/10 ring-2 ring-accent/30"
              : "border-accent/20 bg-surface-elevated/50 hover:border-accent/40"
        }`}
        aria-label={
          placed
            ? `Slot ${slotIndex + 1}: ${placed.title}`
            : `Empty slot ${slotIndex + 1}`
        }
      >
        {placed ? (
          <TimelinePhotoCard milestone={placed} locked layout="slot" />
        ) : (
          <span className="text-xs text-muted">Drop here</span>
        )}
      </motion.button>
    </div>
  );
}
