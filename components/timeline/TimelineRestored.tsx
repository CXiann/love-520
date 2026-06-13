"use client";

import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import type { TimelineMilestoneData } from "./types";

export function TimelineRestored({
  milestones,
}: {
  milestones: TimelineMilestoneData[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-14"
    >
      <p className="text-center font-display text-xl text-accent md:text-2xl">
        Our story, in order ♥
      </p>
      <div
        className="mt-10 flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-thin"
        data-lenis-prevent
      >
        {milestones.map((m, i) => (
          <motion.article
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="snap-center w-[200px] shrink-0 sm:w-[220px] md:w-[240px]"
          >
            <div
              className="rounded-sm border border-accent/20 bg-surface-elevated p-4 shadow-xl"
              style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              {m.imageUrl ? (
                <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-sm bg-black/30">
                  <Image
                    src={m.imageUrl}
                    alt={m.title}
                    fill
                    className="object-contain"
                    sizes="240px"
                  />
                </div>
              ) : (
                <div className="mb-4 flex aspect-[3/4] items-center justify-center bg-accent/10">
                  <span className="text-4xl text-accent/50">♥</span>
                </div>
              )}
              <time className="text-xs uppercase tracking-wider text-accent">
                {format(new Date(m.date), "MMM d, yyyy")}
              </time>
              <h3 className="mt-2 font-display text-xl">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {m.description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
