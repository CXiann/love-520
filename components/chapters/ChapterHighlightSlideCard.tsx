"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { FilmStripSlideWithId } from "@/lib/chapter-eggs";

const DRAG_TYPE = "application/x-love520-highlight";

export { DRAG_TYPE };

type ChapterHighlightSlideCardProps = {
  slide: FilmStripSlideWithId;
  picked?: boolean;
  locked?: boolean;
  layout?: "pool" | "slot" | "curate";
  onTogglePick?: () => void;
  onSelect?: () => void;
  selected?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
};

export function ChapterHighlightSlideCard({
  slide,
  picked = false,
  locked = false,
  layout = "pool",
  onTogglePick,
  onSelect,
  selected = false,
  onDragStart,
  onDragEnd,
}: ChapterHighlightSlideCardProps) {
  const w =
    layout === "slot"
      ? "w-full"
      : layout === "curate"
        ? "w-[140px] md:w-[44%] md:max-w-[200px]"
        : "w-[130px] md:w-[150px]";

  const cardClass = `relative shrink-0 ${w} rounded-sm border bg-surface-elevated p-2 shadow-lg transition ${
    locked
      ? "border-accent/30"
      : picked
        ? "border-accent ring-2 ring-accent/40"
        : selected
          ? "border-accent ring-2 ring-accent/50"
          : "border-accent/25 hover:border-accent/50"
  }`;

  const inner = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-accent/10">
        <Image
          src={slide.imageUrl}
          alt={slide.caption ?? "Highlight"}
          fill
          className="object-cover pointer-events-none"
          sizes="200px"
          draggable={false}
        />
        {layout === "curate" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePick?.();
            }}
            className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border text-lg transition ${
              picked
                ? "border-accent bg-accent text-background"
                : "border-accent/40 bg-background/80 text-accent hover:bg-accent/20"
            }`}
            aria-label={picked ? "Remove from highlights" : "Save this moment"}
          >
            {picked ? "♥" : "♡"}
          </button>
        )}
      </div>
      {slide.caption && (
        <p className="mt-2 line-clamp-2 text-xs leading-snug text-muted">
          {slide.caption}
        </p>
      )}
    </>
  );

  if (locked || layout === "slot") {
    return <div className={cardClass}>{inner}</div>;
  }

  if (layout === "curate") {
    return (
      <motion.div layout className={cardClass} style={{ rotate: picked ? 0 : -2 }}>
        {inner}
      </motion.div>
    );
  }

  return (
    <motion.div layout whileHover={{ scale: 1.03 }} style={{ rotate: selected ? 0 : -2 }}>
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
        className={`${cardClass} cursor-grab active:cursor-grabbing`}
      >
        {inner}
      </div>
    </motion.div>
  );
}
