"use client";

import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import type { TimelineMilestoneData } from "./types";

type TimelinePhotoCardProps = {
  milestone: TimelineMilestoneData;
  selected?: boolean;
  locked?: boolean;
  layout?: "pool" | "slot";
  onSelect?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
};

export function TimelinePhotoCard({
  milestone,
  selected = false,
  locked = false,
  layout = "pool",
  onSelect,
  onDragStart,
  onDragEnd,
}: TimelinePhotoCardProps) {
  const dateLabel = format(new Date(milestone.date), "MMM yyyy");
  const w =
    layout === "slot" ? "w-full max-w-[160px]" : "w-[128px] sm:w-[140px] md:w-[152px]";

  const cardClass = `shrink-0 ${w} rounded-sm border bg-surface-elevated p-2 shadow-lg transition ${
    locked
      ? "cursor-default border-accent/30"
      : selected
        ? "cursor-pointer border-accent ring-2 ring-accent/50"
        : "cursor-grab border-accent/25 hover:border-accent/50 active:cursor-grabbing"
  }`;

  const inner = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-black/30">
        {milestone.imageUrl ? (
          <Image
            src={milestone.imageUrl}
            alt={milestone.title}
            fill
            className="object-contain pointer-events-none"
            sizes="(max-width: 160px) 100vw"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-accent/40">
            ♥
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-[10px] uppercase tracking-wider text-accent">
        {dateLabel}
      </p>
      <p className="truncate font-display text-sm leading-tight">
        {milestone.title}
      </p>
    </>
  );

  if (locked || layout === "slot") {
    return <div className={cardClass}>{inner}</div>;
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      style={{ rotate: selected ? 0 : -2 }}
    >
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
          }
        }}
        role="button"
        tabIndex={0}
        className={cardClass}
      >
        {inner}
      </div>
    </motion.div>
  );
}
