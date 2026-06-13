"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OpeningAmbience } from "../OpeningAmbience";
import { Section, FadeIn } from "../Section";
import { useStarEgg } from "../easter-eggs/useStarEgg";
import { useScrollToSection } from "../SmoothScroll";

type OpeningProps = {
  partnerName: string;
  starMessage: string;
};

export function Opening({ partnerName, starMessage }: OpeningProps) {
  const { scrollToSection } = useScrollToSection();
  const { onStarClick, showOverlay, message, remaining, showProgress } =
    useStarEgg(starMessage);

  function beginStory() {
    scrollToSection("chapter1");
  }

  return (
    <Section id="opening" className="items-center justify-center text-center">
      <OpeningAmbience interactive onHeartClick={onStarClick} />
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center bg-background/50 px-6 backdrop-blur-sm"
          >
            <motion.p
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md font-display text-xl text-accent md:text-2xl"
            >
              {message}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      {showProgress && (
        <p className="pointer-events-none absolute bottom-8 left-0 right-0 z-[15] text-center text-xs text-muted">
          {remaining} more heart{remaining === 1 ? "" : "s"}…
        </p>
      )}
      <div className="pointer-events-none relative z-10">
        <div
          className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[min(100vw,28rem)] w-[min(90vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,160,180,0.28)_0%,rgba(232,160,180,0.1)_42%,transparent_72%)] blur-[2px]"
          aria-hidden
        />
        <FadeIn>
          <motion.p
            className="mb-4 text-sm uppercase tracking-[0.4em] text-accent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            520 · Year Two · 2026
          </motion.p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <h1 className="font-display text-5xl leading-tight md:text-7xl lg:text-8xl">
            For {partnerName}
          </h1>
        </FadeIn>
        <FadeIn delay={0.4}>
          <p className="mx-auto mt-6 max-w-lg text-lg text-muted md:text-xl">
            A cinematic journey through our story — two years of love, one
            celebration at a time.
          </p>
        </FadeIn>
        <FadeIn delay={0.6}>
          <motion.button
            type="button"
            onClick={beginStory}
            className="pointer-events-auto mt-12 rounded-full border border-accent/50 bg-accent/10 px-10 py-4 text-accent transition hover:bg-accent/20"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Begin our story
          </motion.button>
        </FadeIn>
      </div>
    </Section>
  );
}
