"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type SecretEnvelopeProps = {
  teaser: string;
  onOpen: () => void;
};

export function SecretEnvelope({ teaser, onOpen }: SecretEnvelopeProps) {
  const reducedMotion = useReducedMotion();
  const [holding, setHolding] = useState(false);
  const [opened, setOpened] = useState(false);

  function handleOpen() {
    if (opened) return;
    setOpened(true);
    setTimeout(onOpen, reducedMotion ? 200 : 900);
  }

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="mb-8 max-w-md text-center text-lg text-muted">{teaser}</p>

      <motion.button
        type="button"
        className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onPointerDown={() => setHolding(true)}
        onPointerUp={() => setHolding(false)}
        onPointerLeave={() => setHolding(false)}
        onClick={handleOpen}
        aria-label="Open envelope"
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="relative h-44 w-72 rounded-sm border border-accent/40 bg-surface-elevated shadow-lg md:h-52 md:w-80"
          animate={
            holding && !opened
              ? { scale: 1.02, boxShadow: "0 0 40px rgba(232, 160, 180, 0.35)" }
              : { scale: 1 }
          }
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 origin-top border-b border-accent/20 bg-accent/10"
            animate={
              opened
                ? { rotateX: reducedMotion ? 0 : -160, opacity: 0 }
                : holding
                  ? { rotateX: -25 }
                  : { rotateX: 0 }
            }
            transition={{ duration: reducedMotion ? 0.2 : 0.7, ease: "easeInOut" }}
            style={{ transformPerspective: 600 }}
          />
          <motion.div
            className="absolute left-1/2 top-[38%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-accent bg-accent/30 text-2xl"
            animate={
              holding
                ? { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 0.8 } }
                : { scale: 1 }
            }
          >
            ♥
          </motion.div>
        </motion.div>
      </motion.button>

      <motion.p
        className="mt-8 text-sm text-muted"
        animate={{ opacity: holding ? 1 : 0.7 }}
      >
        {opened ? "Opening…" : "Tap to open — or press and hold"}
      </motion.p>
    </motion.div>
  );
}
