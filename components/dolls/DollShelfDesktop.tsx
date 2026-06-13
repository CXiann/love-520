"use client";

import { motion } from "framer-motion";
import { DollPedestal, type DollPedestalQuestState } from "./DollPedestal";
import { dollEnter, dollStagger } from "./doll-motion";
import type { MemoryDollData } from "./types";

type DollShelfDesktopProps = {
  dolls: MemoryDollData[];
  allComplete: boolean;
  activeDollId: string | null;
  shelfScratching: boolean;
  getQuestState: (id: string) => DollPedestalQuestState;
  onPedestalTap: (doll: MemoryDollData) => void;
  onRevealed: (id: string) => void;
  onSave: (id: string) => void;
};

export function DollShelfDesktop({
  dolls,
  allComplete,
  activeDollId,
  shelfScratching,
  getQuestState,
  onPedestalTap,
  onRevealed,
  onSave,
}: DollShelfDesktopProps) {
  return (
    <div className="relative mt-12 hidden md:block">
      <motion.div
        className="absolute inset-x-8 bottom-[4.5rem] h-3 rounded-full bg-accent/15 blur-sm"
        aria-hidden
      />
      <motion.div
        className="relative mx-auto grid max-w-5xl grid-cols-5 items-end gap-3 px-4 pb-6 pt-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={dollEnter}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-24 rounded-sm border border-accent/15 bg-gradient-to-t from-surface-elevated/90 to-transparent"
          aria-hidden
        />
        {dolls.map((doll, i) => {
          const questState = getQuestState(doll.id);
          return (
            <motion.div
              key={doll.id}
              className="relative z-10 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * dollStagger, ...dollEnter }}
            >
              <DollPedestal
                doll={doll}
                questState={questState}
                celebrateAll={allComplete}
                isActive={activeDollId === doll.id || questState === "scratchable"}
                shelfScratching={shelfScratching}
                onSelect={() => onPedestalTap(doll)}
                onRevealed={() => onRevealed(doll.id)}
                onSave={() => onSave(doll.id)}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
