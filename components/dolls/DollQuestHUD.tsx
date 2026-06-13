"use client";

import { motion } from "framer-motion";
import { dollSpringSlow } from "./doll-motion";

type DollQuestHUDProps = {
  readCount: number;
  total: number;
  activeIndex: number;
  activeName?: string;
};

export function DollQuestHUD({
  readCount,
  total,
  activeIndex,
  activeName,
}: DollQuestHUDProps) {
  const progress = total > 0 ? (readCount / total) * 100 : 0;
  const current = activeIndex >= 0 ? activeIndex + 1 : Math.min(readCount + 1, total);

  return (
    <div className="mt-6 space-y-2 px-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="uppercase tracking-[0.2em]">Shelf quest</span>
        <span>
          Saved {readCount} of {total}
          {readCount < total && ` · baby ${current}`}
        </span>
      </div>
      <div className="mx-auto h-1 max-w-md overflow-hidden rounded-full bg-accent/15">
        <motion.div
          className="h-full bg-accent"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={dollSpringSlow}
        />
      </div>
      {readCount < total && activeName && (
        <p className="text-center text-xs text-accent/80">
          Scratch{" "}
          <span className="text-foreground/90">{activeName}</span> awake — then
          save this baby&apos;s memory.
        </p>
      )}
    </div>
  );
}
