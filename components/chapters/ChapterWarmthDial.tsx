"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useEasterEgg } from "../easter-eggs/EasterEggProvider";
import { CH2_WARMTH_KEY } from "@/lib/chapter-eggs";

const WARMTH_LEVELS = [
  {
    className: "",
    toast: null,
  },
  {
    className: "text-accent/75 [&_button]:ring-accent/20",
    toast: "A little warmer.",
  },
  {
    className:
      "text-accent [&_button]:border-accent/35 [&_button]:bg-accent/15",
    toast: "Warmer still.",
  },
  {
    className:
      "text-accent [text-shadow:0_0_28px_rgba(232,160,180,0.45)] [&_button]:border-accent/50",
    toast: "Glowing.",
  },
] as const;

type ChapterWarmthDialProps = {
  children: React.ReactNode;
};

export function ChapterWarmthDial({ children }: ChapterWarmthDialProps) {
  const { showToast } = useEasterEgg();
  const [level, setLevel] = useState(0);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CH2_WARMTH_KEY);
      if (saved) {
        const n = Number(saved);
        if (!Number.isNaN(n)) setLevel(n % WARMTH_LEVELS.length);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function cycle() {
    const next = (level + 1) % WARMTH_LEVELS.length;
    sessionStorage.setItem(CH2_WARMTH_KEY, String(next));
    const msg = WARMTH_LEVELS[next].toast;
    if (msg) showToast(msg);
    setLevel(next);
  }

  const warmth = WARMTH_LEVELS[level];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={cycle}
        className="absolute -right-2 top-0 z-10 rounded-full border border-accent/40 bg-surface-elevated px-2.5 py-1.5 text-sm text-accent shadow-sm transition hover:bg-accent/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:right-0"
        aria-label={`Warmth level ${level + 1} of ${WARMTH_LEVELS.length}. Tap to shift tone.`}
        title="Warmth dial"
      >
        ◐
      </button>
      <motion.div
        key={level}
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`text-foreground/90 transition-colors duration-700 ${warmth.className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
