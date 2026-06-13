"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useVoiceLoveBoost } from "@/hooks/useVoiceLoveBoost";
import { dispatchVoiceHeartsBoost } from "@/lib/game-events";
import { useScrollToSection } from "../SmoothScroll";
import {
  loadUsedVoicePhrases,
  VOICE_PHRASE_FOREVER_LABEL,
  type VoicePhraseId,
} from "@/lib/voice-love";

const VOICE_BOOST = 100;

type ChapterForeverVoiceInviteProps = {
  visible: boolean;
};

export function ChapterForeverVoiceInvite({ visible }: ChapterForeverVoiceInviteProps) {
  const { scrollToSection } = useScrollToSection();
  const [used, setUsed] = useState(false);

  useEffect(() => {
    setUsed(loadUsedVoicePhrases().has("forever"));
  }, [visible]);

  const handleVoiceBoost = useCallback(
    (phraseId: VoicePhraseId) => {
      if (phraseId !== "forever") return;
      setUsed(true);
      dispatchVoiceHeartsBoost(VOICE_BOOST, phraseId);
      window.setTimeout(() => scrollToSection("hearts"), 600);
    },
    [scrollToSection]
  );

  const micEnabled = visible && !used && !loadUsedVoicePhrases().has("forever");

  const { activateFromGesture } = useVoiceLoveBoost(handleVoiceBoost, {
    enabled: micEnabled,
  });

  if (!visible || used) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-10 w-full max-w-lg"
      aria-label="Say it out loud"
    >
      <p className="text-center text-xs uppercase tracking-[0.25em] text-accent/80">
        Say it together
      </p>
      <div
        role="button"
        tabIndex={0}
        onPointerDown={activateFromGesture}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") activateFromGesture();
        }}
        className="mt-4 cursor-pointer rounded-2xl border border-accent/30 bg-accent/10 px-6 py-6 text-center shadow-[0_0_32px_rgba(232,160,180,0.12)] transition hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <p className="text-sm leading-relaxed text-foreground/90">
          When you&apos;re ready, say it out loud:{" "}
          <span className="text-accent">{VOICE_PHRASE_FOREVER_LABEL}</span>
        </p>
      </div>
    </motion.section>
  );
}
