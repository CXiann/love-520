"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Floater = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  kind: "heart" | "orb";
};

/** Edge positions so hearts stay tappable above the title block */
const CLICKABLE_HEARTS: Floater[] = [
  { id: 0, x: 8, y: 24, size: 18, delay: 0, duration: 5, kind: "heart" },
  { id: 1, x: 92, y: 20, size: 16, delay: 0.4, duration: 5.5, kind: "heart" },
  { id: 2, x: 10, y: 78, size: 17, delay: 0.8, duration: 6, kind: "heart" },
  { id: 3, x: 90, y: 74, size: 15, delay: 1.2, duration: 5.2, kind: "heart" },
  { id: 4, x: 50, y: 10, size: 14, delay: 0.2, duration: 4.8, kind: "heart" },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateDecorativeHearts(): Floater[] {
  return Array.from({ length: 9 }, (_, i) => ({
    id: i + 10,
    x: seededRandom(i * 1.7) * 100,
    y: seededRandom(i * 2.9) * 100,
    size: 10 + seededRandom(i * 4.3) * 12,
    delay: seededRandom(i * 5.1) * 2,
    duration: 4 + seededRandom(i * 6.7) * 4,
    kind: "heart" as const,
  }));
}

const ORBS: Floater[] = [
  { id: 100, x: 12, y: 18, size: 220, delay: 0, duration: 8, kind: "orb" },
  { id: 101, x: 78, y: 62, size: 280, delay: 1, duration: 10, kind: "orb" },
  { id: 102, x: 55, y: 85, size: 160, delay: 0.5, duration: 9, kind: "orb" },
];

type OpeningAmbienceProps = {
  interactive?: boolean;
  onHeartClick?: () => void;
  backdropClassName?: string;
  heartsClassName?: string;
};

export function OpeningAmbience({
  interactive = false,
  onHeartClick,
  backdropClassName = "z-0",
  heartsClassName = "z-30",
}: OpeningAmbienceProps) {
  const [ready, setReady] = useState(false);
  const decorative = useMemo(() => generateDecorativeHearts(), []);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden ${backdropClassName}`}
        aria-hidden
      >
        {ORBS.map((item) => (
          <motion.div
            key={item.id}
            className="absolute rounded-full bg-accent/[0.07] blur-3xl"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.size,
              height: item.size,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              opacity: [0.35, 0.65, 0.35],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {decorative.map((item) => (
          <motion.span
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-accent/25"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: item.size * 0.7,
            }}
            animate={{ opacity: [0.15, 0.45, 0.15], y: [0, -10, 0] }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ♥
          </motion.span>
        ))}

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_38%,rgba(232,160,180,0.14),transparent_72%)]" />
      </div>

      {interactive && (
        <div
          className={`pointer-events-none absolute inset-0 overflow-hidden ${heartsClassName}`}
        >
          {CLICKABLE_HEARTS.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              aria-label="Collect a heart"
              onClick={(e) => {
                e.stopPropagation();
                onHeartClick?.();
              }}
              className="pointer-events-auto absolute flex min-h-[48px] min-w-[48px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              whileTap={{ scale: 1.15 }}
            >
              <motion.span
                className="text-accent/80 drop-shadow-[0_0_12px_rgba(232,160,180,0.45)]"
                style={{ fontSize: item.size }}
                animate={{ opacity: [0.45, 1, 0.45], y: [0, -6, 0] }}
                transition={{
                  duration: item.duration,
                  delay: item.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ♥
              </motion.span>
            </motion.button>
          ))}
        </div>
      )}
    </>
  );
}
