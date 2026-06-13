"use client";

import { useEffect, useState } from "react";
import { DollPedestal, type DollPedestalQuestState } from "./DollPedestal";
import type { MemoryDollData } from "./types";

type DollCarouselMobileProps = {
  dolls: MemoryDollData[];
  allComplete: boolean;
  activeDollId: string | null;
  shelfScratching: boolean;
  getQuestState: (id: string) => DollPedestalQuestState;
  onPedestalTap: (doll: MemoryDollData) => void;
  onRevealed: (id: string) => void;
  onSave: (id: string) => void;
};

export function DollCarouselMobile({
  dolls,
  allComplete,
  activeDollId,
  shelfScratching,
  getQuestState,
  onPedestalTap,
  onRevealed,
  onSave,
}: DollCarouselMobileProps) {
  const [focusedId, setFocusedId] = useState(
    activeDollId ?? dolls[0]?.id ?? null
  );

  useEffect(() => {
    if (activeDollId) setFocusedId(activeDollId);
  }, [activeDollId]);

  if (dolls.length === 0) return null;

  return (
    <div className="relative mt-10 md:hidden">
      <div
        className="flex gap-6 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-thin"
        data-lenis-prevent
      >
        {dolls.map((doll) => {
          const questState = getQuestState(doll.id);
          return (
            <DollPedestal
              key={doll.id}
              doll={doll}
              layout="carousel"
              questState={questState}
              celebrateAll={allComplete}
              isActive={
                focusedId === doll.id ||
                activeDollId === doll.id ||
                questState === "scratchable"
              }
              shelfScratching={shelfScratching}
              onSelect={() => {
                setFocusedId(doll.id);
                onPedestalTap(doll);
              }}
              onRevealed={() => onRevealed(doll.id)}
              onSave={() => onSave(doll.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
