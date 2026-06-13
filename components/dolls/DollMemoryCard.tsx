"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import type { MemoryDollData } from "./types";

type DollMemoryCardProps = {
  doll: MemoryDollData;
  onClose: () => void;
};

export function DollMemoryCard({ doll, onClose }: DollMemoryCardProps) {
  const lines = doll.memoryStory.split("\n").filter(Boolean);
  const dateLabel = doll.memoryDate
    ? format(new Date(doll.memoryDate), "MMMM d, yyyy")
    : null;

  return (
    <>
      <button
        type="button"
        aria-label="Close memory"
        className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="doll-memory-title"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-1/2 top-1/2 z-40 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-accent/25 bg-surface-elevated p-6 shadow-2xl md:p-8"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          {doll.name}
        </p>
        <h3
          id="doll-memory-title"
          className="mt-3 font-display text-2xl text-foreground md:text-3xl"
        >
          {doll.memoryTitle}
        </h3>
        {dateLabel && (
          <p className="mt-2 text-sm text-muted">{dateLabel}</p>
        )}
        <motion.div
          className="mt-6 space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {lines.map((line, i) => (
            <motion.p
              key={i}
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-base leading-relaxed text-foreground/90"
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 text-sm text-accent hover:underline"
        >
          Close
        </button>
      </motion.div>
    </>
  );
}
