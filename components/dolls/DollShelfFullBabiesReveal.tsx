"use client";

import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { FULL_BABIES_IMAGE } from "@/lib/seed-images";
import { TicketLightbox } from "../secret/TicketLightbox";

export function DollShelfFullBabiesReveal() {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { once: true, amount: 0.2 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <motion.section
      ref={stageRef}
      className="relative mx-auto mt-16 w-full max-w-5xl px-4 pb-8 md:mt-20"
      aria-label="All babies together"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="flex w-full items-center gap-4">
        <motion.span
          className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.p
          className="shrink-0 text-xs uppercase tracking-[0.35em] text-accent"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.8 }}
        >
          Together
        </motion.p>
        <motion.span
          className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <motion.p
        className="mt-5 text-center font-display text-2xl text-foreground/95 md:text-3xl"
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        All of us, in one frame
      </motion.p>

      <motion.p
        className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Five little stories on the shelf — and this is the picture we keep when
        they&apos;re all awake.
      </motion.p>

      <div className="relative mx-auto mt-10 w-full overflow-hidden px-1 py-8 sm:px-4">
        {!reducedMotion && inView && (
          <>
            <motion.div
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 bg-gradient-to-r from-background via-background/95 to-transparent"
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              transition={{ delay: 0.35, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 bg-gradient-to-l from-background via-background/95 to-transparent"
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{ delay: 0.35, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
          </>
        )}

        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={inView ? { opacity: [0, 0.65, 0.4], scale: [0.6, 1.15, 1] } : {}}
          transition={{ delay: 0.55, duration: 2.2, ease: "easeOut" }}
          aria-hidden
        >
          <div className="h-64 w-64 rounded-full bg-accent/20 blur-3xl md:h-96 md:w-96" />
        </motion.div>

        <motion.div
          className="relative z-10"
          initial={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.88, y: 32 }
          }
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{
            delay: reducedMotion ? 0.1 : 0.95,
            duration: reducedMotion ? 0.35 : 1.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative mx-auto block w-full max-w-4xl overflow-hidden rounded-2xl border border-accent/35 bg-gradient-to-b from-surface-elevated/80 to-background p-2 shadow-[0_0_56px_rgba(232,160,180,0.28),0_20px_40px_rgba(0,0,0,0.35)] transition hover:border-accent/55 hover:shadow-[0_0_72px_rgba(232,160,180,0.38)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:p-3"
            aria-label="Open full babies photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FULL_BABIES_IMAGE}
              alt="All five babies together"
              className="mx-auto h-auto w-full rounded-xl object-contain"
              draggable={false}
            />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-accent/35 bg-background/90 px-4 py-1.5 text-xs text-accent opacity-90 transition group-hover:bg-accent/15 md:text-sm">
              Tap to see every detail
            </span>
          </button>

          <motion.p
            className="mt-6 text-center font-display text-lg text-accent/90 md:text-xl"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: reducedMotion ? 0.2 : 1.65, duration: 0.9 }}
          >
            Our little family — complete ♥
          </motion.p>
        </motion.div>
      </div>

      <TicketLightbox
        open={lightboxOpen}
        src={FULL_BABIES_IMAGE}
        alt="All five babies together"
        onClose={() => setLightboxOpen(false)}
      />
    </motion.section>
  );
}
