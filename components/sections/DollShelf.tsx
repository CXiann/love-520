"use client";

import { useCallback } from "react";
import { Section, FadeIn } from "../Section";
import { DollCarouselMobile } from "../dolls/DollCarouselMobile";
import { DollShelfDesktop } from "../dolls/DollShelfDesktop";
import { DollQuestHUD } from "../dolls/DollQuestHUD";
import { DollShelfCelebration } from "../dolls/DollShelfCelebration";
import { DollShelfFullBabiesReveal } from "../dolls/DollShelfFullBabiesReveal";
import { useDollQuest } from "../dolls/useDollQuest";
import { useEasterEgg } from "../easter-eggs/EasterEggProvider";
import { buildSecretPasswordHint } from "@/lib/secret-password";
import type { MemoryDollData } from "../dolls/types";

type DollShelfProps = {
  dolls: MemoryDollData[];
  relationshipStart: string;
};

export function DollShelf({ dolls, relationshipStart }: DollShelfProps) {
  const { showToast } = useEasterEgg();
  const quest = useDollQuest(dolls);

  const hint = buildSecretPasswordHint(new Date(relationshipStart));

  const handlePedestalTap = useCallback(
    (doll: MemoryDollData) => {
      if (quest.getQuestState(doll.id) === "locked") {
        showToast("Not yet — wake the baby before this one.");
      }
    },
    [quest, showToast]
  );

  const handleRevealed = useCallback(
    (id: string) => {
      quest.markRevealed(id);
      showToast(`${quest.sorted.find((d) => d.id === id)?.name ?? "Baby"} is waking…`);
    },
    [quest, showToast]
  );

  const handleSave = useCallback(
    (id: string) => {
      quest.markMemoryRead(id);
      window.setTimeout(() => {
        showToast("Memory saved — a little safer in our story.");
      }, 400);
    },
    [quest, showToast]
  );

  if (dolls.length === 0 || !quest.hydrated) return null;

  const shelfScratching =
    !!quest.activeDoll &&
    quest.getQuestState(quest.activeDoll.id) === "scratchable";

  return (
    <Section id="dolls" fullHeight={false} className="overflow-hidden">
      <FadeIn delay={0.15}>
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          Little babies
        </p>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">
          Five Babies, Five Memories
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Scratch each baby awake — read their story, then save the memory.
        </p>
      </FadeIn>

      <DollQuestHUD
        readCount={quest.readCount}
        total={quest.total}
        activeIndex={quest.questStep}
        activeName={quest.activeDoll?.name}
      />

      <DollShelfDesktop
        allComplete={quest.allComplete}
        dolls={quest.sorted}
        activeDollId={quest.activeDoll?.id ?? null}
        shelfScratching={shelfScratching}
        getQuestState={quest.getQuestState}
        onPedestalTap={handlePedestalTap}
        onRevealed={handleRevealed}
        onSave={handleSave}
      />

      <DollCarouselMobile
        allComplete={quest.allComplete}
        dolls={quest.sorted}
        activeDollId={quest.activeDoll?.id ?? null}
        shelfScratching={shelfScratching}
        getQuestState={quest.getQuestState}
        onPedestalTap={handlePedestalTap}
        onRevealed={handleRevealed}
        onSave={handleSave}
      />

      {quest.allComplete && (
        <>
          <DollShelfCelebration hint={hint} />
          <DollShelfFullBabiesReveal />
        </>
      )}
    </Section>
  );
}
