"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { DollScratchReveal } from "./DollScratchReveal";
import { dollEase, dollSaveUnlock } from "./doll-motion";
import type { MemoryDollData } from "./types";

export type DollPedestalQuestState =
  | "locked"
  | "scratchable"
  | "ready"
  | "complete";

type DollPedestalProps = {
  doll: MemoryDollData;
  questState: DollPedestalQuestState;
  isActive: boolean;
  /** Stronger blur on locked babies while the active one is being scratched */
  shelfScratching?: boolean;
  celebrateAll?: boolean;
  onSelect: () => void;
  onRevealed: () => void;
  onSave: () => void;
  layout?: "shelf" | "carousel";
};

export function DollPedestal({
  doll,
  questState,
  isActive,
  shelfScratching = false,
  celebrateAll = false,
  onSelect,
  onRevealed,
  onSave,
  layout = "shelf",
}: DollPedestalProps) {
  const isCarousel = layout === "carousel";
  const isLocked = questState === "locked";
  const isScratchable = questState === "scratchable";
  const isReady = questState === "ready";
  const isComplete = questState === "complete";

  const wrapperClass = isCarousel
    ? "w-[70vw] max-w-xs shrink-0 snap-center"
    : "w-full max-w-[150px]";

  if (isScratchable || isReady) {
    return (
      <div
        className={`flex flex-col items-center ${wrapperClass} ${
          isScratchable ? "relative z-20" : ""
        }`}
      >
        <DollScratchReveal
          doll={doll}
          layout={layout}
          revealed={isReady}
          saved={false}
          onRevealed={onRevealed}
          onSave={onSave}
        />
        <p
          className={`mt-3 font-display text-sm text-foreground/90 md:text-base ${
            isCarousel ? "max-w-[70vw]" : ""
          }`}
        >
          {doll.name}
        </p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        className={`flex flex-col items-center ${wrapperClass}`}
        initial={{ opacity: 0, scale: 0.88, y: 12 }}
        animate={{
          opacity: 1,
          scale: celebrateAll ? [1, 1.04, 1] : 1,
          y: 0,
        }}
        transition={
          celebrateAll
            ? {
                opacity: dollSaveUnlock,
                y: dollSaveUnlock,
                scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
              }
            : dollSaveUnlock
        }
      >
        <motion.div
          className={`relative overflow-hidden rounded-sm border border-accent/30 bg-surface-elevated shadow-lg ${
            isCarousel
              ? "h-48 w-48 md:h-56 md:w-56"
              : "mx-auto aspect-square w-full max-w-[140px] md:max-w-[160px]"
          }`}
          animate={
            celebrateAll
              ? {
                  boxShadow: [
                    "0 0 0 rgba(232, 160, 180, 0)",
                    "0 0 32px rgba(232, 160, 180, 0.45)",
                    "0 0 0 rgba(232, 160, 180, 0)",
                  ],
                }
              : undefined
          }
          transition={
            celebrateAll
              ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        >
          <Image
            src={doll.imageUrl}
            alt={doll.name}
            fill
            className="object-cover"
            sizes={isCarousel ? "280px" : "160px"}
          />
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.9, ease: dollEase }}
            className="absolute right-2 top-2 text-sm text-accent drop-shadow"
          >
            ♥
          </motion.span>
        </motion.div>
        <div
          className={`mt-3 h-2 w-[85%] rounded-full bg-gradient-to-r from-transparent via-accent/30 to-transparent ${
            isCarousel ? "max-w-xs" : ""
          }`}
          aria-hidden
        />
        <p
          className={`mt-3 font-display text-sm text-foreground/90 md:text-base ${
            isCarousel ? "max-w-[70vw]" : ""
          }`}
        >
          {doll.name}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={`${doll.name} — locked`}
      disabled={!isLocked}
      className={`group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${wrapperClass}`}
      animate={{
        opacity: isLocked ? 0.85 : 1,
        scale: isActive ? 1.02 : 1,
      }}
      whileTap={isLocked ? { x: [0, -4, 4, -3, 3, 0] } : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 120, damping: 24 }}
    >
      <div
        className={`relative overflow-hidden rounded-sm border border-accent/15 bg-surface-elevated shadow-lg ${
          isCarousel
            ? "h-48 w-48 md:h-56 md:w-56"
            : "mx-auto aspect-square w-full max-w-[140px] md:max-w-[160px]"
        }`}
      >
        <Image
          src={doll.imageUrl}
          alt=""
          fill
          className={`object-cover scale-110 saturate-50 ${
            shelfScratching
              ? "blur-[36px] brightness-[0.35]"
              : "blur-2xl brightness-50"
          }`}
          sizes={isCarousel ? "280px" : "160px"}
          aria-hidden
        />
        <div
          className={`absolute inset-0 backdrop-blur-xl ${
            shelfScratching ? "bg-background/70" : "bg-background/55"
          }`}
          aria-hidden
        />
        <span
          className="absolute inset-0 flex items-center justify-center text-2xl text-muted/80"
          aria-hidden
        >
          🔒
        </span>
      </div>
      <div
        className={`mt-3 h-2 w-[85%] rounded-full bg-gradient-to-r from-transparent via-accent/20 to-transparent ${
          isCarousel ? "max-w-xs" : ""
        }`}
        aria-hidden
      />
      <p
        className={`mt-3 font-display text-sm text-muted/70 md:text-base ${
          isCarousel ? "max-w-[70vw]" : ""
        }`}
      >
        {doll.name}
      </p>
    </motion.button>
  );
}
