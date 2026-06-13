"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/** Fragment spawn positions per quest step (desktop shelf). */
const DESKTOP_POSITIONS: Array<{ top: string; left: string }> = [
  { top: "8%", left: "6%" },
  { top: "18%", left: "88%" },
  { top: "4%", left: "48%" },
  { top: "22%", left: "12%" },
  { top: "12%", left: "78%" },
];

const MOBILE_POSITIONS: Array<{ top: string; left: string }> = [
  { top: "-2rem", left: "12%" },
  { top: "-2.5rem", left: "72%" },
  { top: "-3rem", left: "42%" },
  { top: "-2rem", left: "8%" },
  { top: "-2.5rem", left: "80%" },
];

type DollQuestFragmentProps = {
  questStep: number;
  visible: boolean;
  layout: "desktop" | "mobile";
  targetRef?: React.RefObject<HTMLElement | null>;
  onCollect: () => void;
};

export function DollQuestFragment({
  questStep,
  visible,
  layout,
  onCollect,
}: DollQuestFragmentProps) {
  const [flying, setFlying] = useState(false);
  const positions =
    layout === "mobile" ? MOBILE_POSITIONS : DESKTOP_POSITIONS;
  const pos = positions[questStep % positions.length];

  if (!visible) return null;

  function handleTap() {
    if (flying) return;
    setFlying(true);
    setTimeout(() => {
      onCollect();
      setFlying(false);
    }, 650);
  }

  return (
    <motion.button
      type="button"
      aria-label="Collect memory fragment"
      onClick={handleTap}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={
        flying
          ? { opacity: 0, scale: 0.2, y: 80 }
          : { opacity: 1, scale: 1, y: [0, -6, 0] }
      }
      transition={
        flying
          ? { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
          : { y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" } }
      }
      className="absolute z-20 flex h-12 w-12 items-center justify-center rounded-full border border-accent/50 bg-accent/20 shadow-lg shadow-accent/20 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{ top: pos.top, left: pos.left }}
    >
      <span className="text-lg text-accent" aria-hidden>
        ✦
      </span>
      <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
    </motion.button>
  );
}
