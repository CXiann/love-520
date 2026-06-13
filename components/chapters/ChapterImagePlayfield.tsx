"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Spark = { id: number; x: number; y: number };

type ChapterImagePlayfieldProps = {
  kenPaused: boolean;
  onTogglePause: () => void;
};

export function ChapterImagePlayfield({
  kenPaused,
  onTogglePause,
}: ChapterImagePlayfieldProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [nextId, setNextId] = useState(0);

  const spawnFireflies = useCallback(
    (clientX: number, clientY: number, el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const batch: Spark[] = [];
      for (let i = 0; i < 3; i++) {
        const id = nextId + i;
        batch.push({
          id,
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
        });
        setTimeout(() => {
          setSparks((prev) => prev.filter((s) => s.id !== id));
        }, 1400);
      }
      setSparks((prev) => [...prev, ...batch]);
      setNextId((n) => n + 3);
    },
    [nextId]
  );

  return (
    <>
      <div
        className="absolute inset-0 z-[7]"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          spawnFireflies(e.clientX, e.clientY, e.currentTarget);
        }}
        role="presentation"
        aria-hidden
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePause();
        }}
        className="absolute bottom-20 left-1/2 z-[11] -translate-x-1/2 rounded-full border border-accent/40 bg-background/70 px-4 py-2 text-xs text-accent shadow-md backdrop-blur-sm transition hover:bg-accent/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {kenPaused ? "Resume photo" : "Pause this moment"}
      </button>

      <AnimatePresence>
        {sparks.map((s) => (
          <motion.span
            key={s.id}
            initial={{ opacity: 0.9, scale: 0.5, left: s.x, top: s.y }}
            animate={{ opacity: 0, scale: 1.8, top: s.y - 50 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute z-[7] text-lg text-accent"
          >
            ✦
          </motion.span>
        ))}
      </AnimatePresence>
    </>
  );
}
