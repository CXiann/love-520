"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 1.1) * 100,
    y: seededRandom(i * 2.3) * 100,
    size: seededRandom(i * 3.7) * 2 + 0.5,
    delay: seededRandom(i * 4.1) * 3,
    duration: 2 + seededRandom(i * 5.9) * 3,
  }));
}

type StarFieldProps = {
  count?: number;
  interactive?: boolean;
  onStarClick?: () => void;
  className?: string;
};

export function StarField({
  count = 60,
  interactive = false,
  onStarClick,
  className = "",
}: StarFieldProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(generateStars(count));
  }, [count]);

  if (stars.length === 0) return null;

  const clickable = new Set(stars.slice(0, 18).map((s) => s.id));

  return (
    <motion.div
      className={`absolute inset-0 overflow-hidden ${interactive ? "pointer-events-auto" : "pointer-events-none"} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      {stars.map((star) => {
        const isClickable = interactive && clickable.has(star.id);

        if (isClickable) {
          return (
            <motion.button
              key={star.id}
              type="button"
              aria-label="Collect a star"
              onClick={onStarClick}
              className="absolute flex min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
              whileTap={{ scale: 1.3 }}
            >
              <motion.span
                className="rounded-full bg-accent/80 shadow-[0_0_12px_rgba(232,160,180,0.5)]"
                style={{
                  width: Math.max(star.size * 3, 6),
                  height: Math.max(star.size * 3, 6),
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.button>
          );
        }

        return (
          <motion.span
            key={star.id}
            className="absolute rounded-full bg-accent/60"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </motion.div>
  );
}
