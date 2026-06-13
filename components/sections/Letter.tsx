"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Section, FadeIn } from "../Section";
import { useScrollToSection } from "../SmoothScroll";
import { useVoiceLoveBoost } from "@/hooks/useVoiceLoveBoost";
import {
  dispatchLetterRead,
  dispatchVoiceHeartsBoost,
  isLetterReadFromStorage,
  markLetterReadStorage,
} from "@/lib/game-events";
import {
  loadUsedVoicePhrases,
  VOICE_PHRASE_EVERYTHING_LABEL,
  type VoicePhraseId,
} from "@/lib/voice-love";

const VOICE_BOOST = 100;

type LetterProps = {
  content: string;
  yourName: string;
};

export function Letter({ content, yourName }: LetterProps) {
  const { scrollToSection } = useScrollToSection();
  const reducedMotion = useReducedMotion();
  const [sealBroken, setSealBroken] = useState(false);
  const [letterRead, setLetterRead] = useState(false);
  const [everythingUsed, setEverythingUsed] = useState(false);

  const lines = content.split("\n").filter(Boolean);
  const lineDelay = sealBroken ? 0.02 : 0.05;

  useEffect(() => {
    if (isLetterReadFromStorage()) {
      setLetterRead(true);
      setSealBroken(true);
    }
    setEverythingUsed(loadUsedVoicePhrases().has("everything"));
  }, []);

  const openLetter = useCallback(() => {
    setSealBroken(true);
    setLetterRead(true);
    markLetterReadStorage();
    dispatchLetterRead();
  }, []);

  const handleVoiceBoost = useCallback(
    (phraseId: VoicePhraseId) => {
      if (phraseId !== "everything") return;
      setEverythingUsed(true);
      dispatchVoiceHeartsBoost(VOICE_BOOST, phraseId);
      window.setTimeout(() => scrollToSection("hearts"), 600);
    },
    [scrollToSection]
  );

  const micEnabled =
    letterRead && !everythingUsed && !loadUsedVoicePhrases().has("everything");

  const { activateFromGesture } = useVoiceLoveBoost(handleVoiceBoost, {
    enabled: micEnabled,
  });

  const showEverythingHint =
    letterRead && !everythingUsed && !loadUsedVoicePhrases().has("everything");

  return (
    <Section id="letter" fullHeight={false}>
      <FadeIn>
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          From my heart
        </p>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">A Letter</h2>
      </FadeIn>

      <div
        className="mx-auto mt-12 max-w-2xl"
        onPointerDown={letterRead ? activateFromGesture : undefined}
      >
        <motion.div
          className={`relative rounded-sm border bg-surface-elevated/80 p-8 backdrop-blur-sm md:p-12 ${
            sealBroken
              ? "border-accent/40 shadow-[0_0_40px_rgba(232,160,180,0.15)]"
              : "border-accent/20"
          }`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8 }}
        >
          {!sealBroken && (
            <motion.button
              type="button"
              onClick={openLetter}
              className="absolute -top-6 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-2 border-accent bg-accent/30 text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              whileHover={reducedMotion ? {} : { scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Break the wax seal"
            >
              ♥
            </motion.button>
          )}
          {sealBroken && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 text-center text-xs uppercase tracking-widest text-accent/70"
            >
              Seal broken — read on
            </motion.p>
          )}

          {(sealBroken ? lines : []).map((line, i) => (
            <motion.p
              key={i}
              className="mb-4 font-display text-lg leading-relaxed text-foreground/95 md:text-xl"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: i * lineDelay,
                duration: reducedMotion ? 0.1 : 0.4,
              }}
            >
              {line}
            </motion.p>
          ))}

          {!sealBroken && (
            <p className="py-8 text-center text-sm text-muted">
              Tap the seal to open the letter
            </p>
          )}

          {sealBroken && (
            <motion.p
              className="mt-8 text-right text-accent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: lines.length * lineDelay + 0.2 }}
            >
              — {yourName}
              <br />
              <span className="text-sm text-muted">May 20, 2026</span>
            </motion.p>
          )}
        </motion.div>

        <AnimatePresence>
          {showEverythingHint && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-8 max-w-lg rounded-2xl border border-accent/30 bg-accent/10 px-6 py-5 text-center"
            >
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                When you&apos;re ready, say it out loud:{" "}
                <span className="text-accent">{VOICE_PHRASE_EVERYTHING_LABEL}</span>
              </p>
              <p className="mt-2 text-xs text-muted">
                Tap here once if your browser asks for the microphone — then speak
                clearly.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
