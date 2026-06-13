"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import confetti from "canvas-confetti";
import { SECRET_POTTERY_TICKET } from "@/lib/seed-images";
import { TicketLightbox } from "./TicketLightbox";

const CONFETTI_COLORS = ["#e8a0b4", "#f5f0eb", "#c4788e", "#ffd4e0", "#fff8f0"];

type PotteryTicketRevealProps = {
  embedded?: boolean;
};

function fireTicketConfetti() {
  confetti({
    particleCount: 100,
    spread: 120,
    origin: { y: 0.5 },
    colors: CONFETTI_COLORS,
    scalar: 1.1,
    ticks: 200,
  });
  window.setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 55,
      spread: 70,
      origin: { x: 0.15, y: 0.55 },
      colors: CONFETTI_COLORS,
    });
    confetti({
      particleCount: 60,
      angle: 125,
      spread: 70,
      origin: { x: 0.85, y: 0.55 },
      colors: CONFETTI_COLORS,
    });
  }, 350);
}

export function PotteryTicketReveal({ embedded = false }: PotteryTicketRevealProps) {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const confettiFired = useRef(false);
  const inView = useInView(stageRef, { once: true, amount: 0.25 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!inView || reducedMotion || confettiFired.current) return;
    confettiFired.current = true;
    const t = window.setTimeout(fireTicketConfetti, embedded ? 900 : 1400);
    return () => window.clearTimeout(t);
  }, [inView, reducedMotion, embedded]);

  return (
    <motion.section
      ref={stageRef}
      className={`relative w-full ${embedded ? "mt-14" : "mt-20"}`}
      aria-label="Pottery ticket reveal"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center px-2">
        <motion.div
          className="flex w-full items-center gap-4"
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <p className="shrink-0 text-xs uppercase tracking-[0.35em] text-accent">
            And then — this
          </p>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        </motion.div>

        <motion.p
          className={`mt-4 text-center font-display text-foreground/95 ${
            embedded ? "text-2xl" : "text-3xl md:text-4xl"
          }`}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          Your pottery ticket
        </motion.p>

        <motion.p
          className="mt-2 max-w-md text-center text-sm text-muted"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.45, duration: 0.8 }}
        >
          A day at the wheel — tap the ticket to read every detail.
        </motion.p>
      </div>

      <div
        className={`relative mx-auto mt-10 w-full max-w-5xl overflow-hidden px-3 sm:px-6 ${
          embedded ? "py-6" : "py-12"
        }`}
      >
        {!reducedMotion && inView && (
          <>
            <motion.div
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 bg-gradient-to-r from-background via-background/95 to-transparent"
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              transition={{ delay: 0.2, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 bg-gradient-to-l from-background via-background/95 to-transparent"
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{ delay: 0.2, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
          </>
        )}

        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={inView ? { opacity: [0, 0.7, 0.35], scale: [0.5, 1.2, 1] } : {}}
          transition={{ delay: 0.5, duration: 2, ease: "easeOut" }}
          aria-hidden
        >
          <div className="h-72 w-72 rounded-full bg-accent/25 blur-3xl md:h-[28rem] md:w-[28rem]" />
        </motion.div>

        <motion.div
          className="relative z-10 mx-auto w-full"
          initial={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.85, y: 40 }
          }
          animate={
            inView
              ? { opacity: 1, scale: 1, y: 0 }
              : {}
          }
          transition={{
            delay: reducedMotion ? 0.1 : 0.85,
            duration: reducedMotion ? 0.3 : 1.35,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative mx-auto block w-full max-w-4xl rounded-lg border-2 border-accent/40 bg-gradient-to-b from-surface-elevated to-background p-3 shadow-[0_0_60px_rgba(232,160,180,0.35),0_24px_48px_rgba(0,0,0,0.45)] transition hover:border-accent/60 hover:shadow-[0_0_80px_rgba(232,160,180,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:p-5"
            aria-label="Open pottery ticket full size"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SECRET_POTTERY_TICKET}
              alt="Pottery workshop ticket — tap to enlarge"
              className="mx-auto h-auto w-full max-w-full"
              draggable={false}
            />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-accent/40 bg-background/90 px-4 py-1.5 text-xs text-accent opacity-90 transition group-hover:bg-accent/15 md:text-sm">
              Tap to read full ticket
            </span>
          </button>

          <motion.p
            className="mt-6 text-center font-display text-lg text-accent md:text-xl"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: reducedMotion ? 0.2 : 1.6, duration: 0.8 }}
          >
            Pottery day — ours ♥
          </motion.p>
        </motion.div>
      </div>

      <TicketLightbox
        open={lightboxOpen}
        src={SECRET_POTTERY_TICKET}
        alt="Pottery workshop ticket"
        onClose={() => setLightboxOpen(false)}
      />
    </motion.section>
  );
}
