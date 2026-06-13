"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { FilmStripSlideWithId } from "@/lib/chapter-eggs";
import { slidesByIds } from "@/lib/chapter2-highlights";

type ChapterHighlightReelProps = {
  slides: FilmStripSlideWithId[];
  orderedIds: string[];
};

export function ChapterHighlightReel({
  slides,
  orderedIds,
}: ChapterHighlightReelProps) {
  const ordered = slidesByIds(slides, orderedIds);
  if (ordered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-14"
    >
      <p className="text-center font-display text-xl text-accent md:text-2xl">
        Our year, in the order you chose ♥
      </p>
      <div
        className="mt-10 flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-thin"
        data-lenis-prevent
      >
        {ordered.map((slide, i) => (
          <motion.figure
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="w-[72vw] max-w-xs shrink-0 snap-center overflow-hidden rounded-sm border border-accent/25 bg-surface-elevated/90 shadow-xl"
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={slide.imageUrl}
                alt={slide.caption ?? "Highlight"}
                fill
                className="object-cover"
                sizes="320px"
              />
            </div>
            {slide.caption && (
              <figcaption className="p-4 text-sm leading-relaxed text-foreground/90">
                {slide.caption}
              </figcaption>
            )}
          </motion.figure>
        ))}
      </div>
    </motion.div>
  );
}
