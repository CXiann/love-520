"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEasterEgg } from "../easter-eggs/EasterEggProvider";
import {
  CH1_CROSS_KEY,
  CH1_HOTSPOTS_KEY,
  type ChapterHotspot,
} from "@/lib/chapter-eggs";

type ChapterHotspotsProps = {
  hotspots: ChapterHotspot[];
};

export function ChapterHotspots({ hotspots }: ChapterHotspotsProps) {
  const { showToast } = useEasterEgg();
  const [found, setFound] = useState<Set<string>>(new Set());
  const [pulseId, setPulseId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CH1_HOTSPOTS_KEY);
      if (raw) setFound(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  const onFound = useCallback(
    (spot: ChapterHotspot) => {
      if (found.has(spot.id)) {
        showToast(spot.message);
        return;
      }
      const next = new Set(found);
      next.add(spot.id);
      setFound(next);
      sessionStorage.setItem(CH1_HOTSPOTS_KEY, JSON.stringify([...next]));
      setPulseId(spot.id);
      setTimeout(() => setPulseId(null), 600);

      if (spot.grantsKey) {
        sessionStorage.setItem(CH1_CROSS_KEY, "1");
      }

      showToast(spot.message);

      if (next.size >= hotspots.length) {
        setTimeout(
          () => showToast("You found every memory from that first celebration."),
          2800
        );
      }
    },
    [found, hotspots.length, showToast]
  );

  return (
    <motion.div className="absolute inset-0 z-[8]">
      {hotspots.map((spot) => {
        const discovered = found.has(spot.id);
        return (
          <motion.button
            key={spot.id}
            type="button"
            data-hotspot
            aria-label="Discover a memory"
            className="pointer-events-auto absolute z-[12] h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            onClick={() => onFound(spot)}
            animate={
              pulseId === spot.id
                ? { scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }
                : discovered
                  ? { opacity: [0.25, 0.45, 0.25] }
                  : { opacity: [0.15, 0.55, 0.15] }
            }
            transition={{
              duration: discovered ? 3 : 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span
              className={`block h-full w-full rounded-full border ${
                discovered
                  ? "border-accent/50 bg-accent/25"
                  : "border-accent/30 bg-accent/10"
              }`}
            />
          </motion.button>
        );
      })}
      <AnimatePresence>
        {found.size > 0 && found.size < hotspots.length && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute bottom-24 left-0 right-0 text-center text-xs text-muted"
          >
            {found.size} of {hotspots.length} memories found…
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
