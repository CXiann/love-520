"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { FilmStripSlide } from "@/lib/chapter-eggs";

type ChapterFilmStripProps = {
  slides: FilmStripSlide[];
};

export function ChapterFilmStrip({ slides }: ChapterFilmStripProps) {
  if (slides.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-10 -mx-2 md:mx-0"
    >
      <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted">
        Moments this year
      </p>
      <div
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin"
        data-lenis-prevent
      >
        {slides.map((slide, i) => (
          <motion.figure
            key={slide.imageUrl + i}
            className="w-[72vw] max-w-xs shrink-0 snap-center overflow-hidden rounded-sm border border-accent/20 bg-surface-elevated/80"
            whileHover={{ y: -4 }}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={slide.imageUrl}
                alt={slide.caption ?? "Memory"}
                fill
                className="object-cover"
                sizes="320px"
              />
            </div>
            {slide.caption && (
              <figcaption className="p-3 text-sm text-muted">
                {slide.caption}
              </figcaption>
            )}
          </motion.figure>
        ))}
      </div>
    </motion.div>
  );
}
