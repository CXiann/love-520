"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";

const HEARTS = ["♥", "♡", "♥", "♡", "♥", "♡"];

type DollShelfCelebrationProps = {
  hint: string;
};

export function DollShelfCelebration({ hint }: DollShelfCelebrationProps) {
  const reducedMotion = useReducedMotion();
  const firedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion || firedRef.current) return;
    firedRef.current = true;

    const colors = ["#e8a0b4", "#f5f0eb", "#c4788e", "#ffd4e0"];

    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.55 },
      colors,
      scalar: 0.9,
    });

    window.setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.2, y: 0.5 },
        colors,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.8, y: 0.5 },
        colors,
      });
    }, 400);
  }, [reducedMotion]);

  return (
    <div className="relative mx-auto mt-10 w-full max-w-3xl px-4">
      <motion.div
        className="pointer-events-none absolute inset-x-0 -top-8 h-32 bg-gradient-to-b from-accent/25 via-accent/10 to-transparent blur-2xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.4, 0.75, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      {HEARTS.map((heart, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-accent/50"
          style={{
            left: `${12 + i * 14}%`,
            top: `${20 + (i % 3) * 12}%`,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 0.7, 0],
            y: [-8, -48],
          }}
          transition={{
            duration: 3.5,
            delay: 0.3 + i * 0.35,
            repeat: Infinity,
            ease: "easeOut",
          }}
          aria-hidden
        >
          {heart}
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-accent/40 bg-accent/10 px-8 py-8 text-center shadow-[0_0_48px_rgba(232,160,180,0.2)]"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-accent/15 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative font-display text-xl text-accent md:text-2xl"
        >
          All five babies are awake
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="relative mt-3 text-sm text-muted"
        >
          Our shelf is complete — a clue waits for you
        </motion.p>
        <motion.p
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 1.1 }}
          className="relative mt-6 font-mono text-xl tracking-[0.35em] text-foreground/90 md:text-2xl"
          aria-label="Clue"
        >
          {hint}
        </motion.p>
      </motion.div>
    </div>
  );
}
