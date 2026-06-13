"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { FilmStripSlideWithId } from "@/lib/chapter-eggs";
import { ChapterHighlightSlideCard } from "./ChapterHighlightSlideCard";

type ChapterHighlightCurateProps = {
  slides: FilmStripSlideWithId[];
  poolOrder: string[];
  pickedIds: string[];
  pickCount: number;
  prompt: string;
  onTogglePick: (id: string) => void;
};

export function ChapterHighlightCurate({
  slides,
  poolOrder,
  pickedIds,
  pickCount,
  prompt,
  onTogglePick,
}: ChapterHighlightCurateProps) {
  const byId = useMemo(
    () => new Map(slides.map((s) => [s.id, s])),
    [slides]
  );

  const poolSlides = poolOrder
    .map((id) => byId.get(id))
    .filter(Boolean) as FilmStripSlideWithId[];

  const count = pickedIds.length;

  return (
    <div className="mt-8">
      <p className="text-center text-sm text-muted">{prompt}</p>
      <p className="mt-2 text-center font-display text-lg text-accent">
        {count} of {pickCount} moments saved
      </p>

      <motion.div
        layout
        className="mt-8 flex flex-wrap justify-center gap-4 px-1"
      >
        {poolSlides.map((slide) => (
          <ChapterHighlightSlideCard
            key={slide.id}
            slide={slide}
            layout="curate"
            picked={pickedIds.includes(slide.id)}
            onTogglePick={() => onTogglePick(slide.id)}
          />
        ))}
      </motion.div>
    </div>
  );
}
