"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, FadeIn } from "../Section";
import { useScrollToSection } from "../SmoothScroll";
import { useEasterEgg } from "../easter-eggs/EasterEggProvider";
import { useGalleryQuest, type GalleryItemData } from "../gallery/useGalleryQuest";
import { GalleryQuestHUD } from "../gallery/GalleryQuestHUD";
import { GalleryGrid } from "../gallery/GalleryGrid";
import { GalleryVoiceInvite } from "../gallery/GalleryVoiceInvite";
import { useVoiceLoveBoost } from "@/hooks/useVoiceLoveBoost";
import { dispatchVoiceHeartsBoost } from "@/lib/game-events";
import {
  loadUsedVoicePhrases,
  type VoicePhraseId,
} from "@/lib/voice-love";

const VOICE_BOOST = 100;

type GalleryProps = {
  items: GalleryItemData[];
};

function gallerySubtitle(
  questComplete: boolean,
  stillLoveUsed: boolean
): string {
  if (stillLoveUsed) {
    return "These are the ones we keep — the roll is clean.";
  }
  if (questComplete) {
    return "You chose what stays. Only those photos remain.";
  }
  return "Our camera roll is full — swipe right on any photo you don't want to keep. Trust your eye.";
}

export function Gallery({ items }: GalleryProps) {
  const { scrollToSection } = useScrollToSection();
  const { showToast } = useEasterEgg();
  const quest = useGalleryQuest(items);
  const [lightbox, setLightbox] = useState<GalleryItemData | null>(null);
  const [stillLoveUsed, setStillLoveUsed] = useState(false);

  useEffect(() => {
    setStillLoveUsed(loadUsedVoicePhrases().has("stillLove"));
  }, []);

  const handleVoiceBoost = useCallback(
    (phraseId: VoicePhraseId) => {
      if (phraseId !== "stillLove") return;
      setStillLoveUsed(true);
      dispatchVoiceHeartsBoost(VOICE_BOOST, phraseId);
      window.setTimeout(() => scrollToSection("hearts"), 600);
    },
    [scrollToSection]
  );

  const micEnabled =
    quest.questComplete &&
    !stillLoveUsed &&
    !loadUsedVoicePhrases().has("stillLove");

  const { activateFromGesture } = useVoiceLoveBoost(handleVoiceBoost, {
    enabled: micEnabled,
  });

  const showVoiceHint =
    quest.questComplete &&
    !stillLoveUsed &&
    !loadUsedVoicePhrases().has("stillLove");

  const handleKeeperReject = useCallback(() => {
    showToast("That one's staying with us.");
  }, [showToast]);

  const inCleanupPhase = !quest.questComplete;

  return (
    <Section id="gallery" fullHeight={false}>
      <FadeIn>
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          Memories
        </p>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">Gallery</h2>
        <p className="mt-3 max-w-xl text-sm text-muted">
          {gallerySubtitle(quest.questComplete, stillLoveUsed)}
        </p>
        {inCleanupPhase && (
          <GalleryQuestHUD complete={false} />
        )}
      </FadeIn>

      <div className="mt-12 space-y-12">
        {quest.hydrated && (
          <GalleryGrid
            items={quest.visibleItems}
            swipeEnabled={inCleanupPhase}
            onTrashDecoy={quest.trashDecoy}
            onKeeperReject={handleKeeperReject}
            onOpenLightbox={setLightbox}
          />
        )}

        <AnimatePresence>
          {showVoiceHint && (
            <motion.div
              key="voice-invite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-t border-accent/15 pt-10"
            >
              <GalleryVoiceInvite onActivate={activateFromGesture} />
            </motion.div>
          )}
        </AnimatePresence>

        {quest.questComplete && stillLoveUsed && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-accent/15 pt-8 text-center text-sm text-accent/90"
          >
            You said it — +{VOICE_BOOST} hearts ♥
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-6 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[85vh] max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.imageUrl}
                alt={lightbox.caption ?? "Memory"}
                width={1200}
                height={900}
                className="max-h-[85vh] w-auto rounded-sm object-contain"
              />
              {lightbox.caption && (
                <p className="mt-4 text-center text-muted">{lightbox.caption}</p>
              )}
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute -top-12 right-0 text-muted hover:text-foreground"
              >
                Close ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
