"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Section, FadeIn } from "./Section";
import {
  DOLLS_QUEST_COMPLETE,
  VOICE_HEARTS_BOOST,
  type VoiceHeartsBoostDetail,
} from "@/lib/game-events";
import {
  HEARTS_520_PASSWORD_HINT,
  isHearts520HintUnlocked,
  unlockHearts520HintStorage,
} from "@/lib/secret-password";

const TARGET = 520;
const DOLLS_QUEST_HEARTS = 52;
const STORAGE_KEY = "love520_hearts";
const DOLLS_HEARTS_BONUS_KEY = "love520_dolls_hearts_bonus";

type FloatingHeart = {
  id: number;
  x: number;
  y: number;
};

export function HeartCollector() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [floating, setFloating] = useState<FloatingHeart[]>([]);
  const [completed, setCompleted] = useState(false);
  const [heartsHintUnlocked, setHeartsHintUnlocked] = useState(false);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const n = parseInt(saved, 10);
      if (!isNaN(n)) {
        setCount(n);
        if (n >= TARGET) {
          setCompleted(true);
          unlockHearts520HintStorage();
          setHeartsHintUnlocked(true);
        }
      }
    }
  }, []);

  const spawnFloatingHearts = useCallback(
    (amount: number, clientX?: number, clientY?: number) => {
      const burst = Math.min(amount, 12);
      for (let i = 0; i < burst; i++) {
        const id = nextId + i;
        const x =
          (clientX ?? window.innerWidth / 2) + (Math.random() - 0.5) * 120;
        const y =
          (clientY ?? window.innerHeight * 0.45) + (Math.random() - 0.5) * 80;
        setFloating((prev) => [...prev, { id, x, y }]);
        setTimeout(() => {
          setFloating((prev) => prev.filter((h) => h.id !== id));
        }, 1200);
      }
      setNextId((n) => n + burst);
    },
    [nextId]
  );

  const applyCount = useCallback(
    (newCount: number, opts?: { x?: number; y?: number; burst?: number }) => {
      const capped = Math.min(newCount, TARGET);
      setCount(capped);
      sessionStorage.setItem(STORAGE_KEY, String(capped));

      if (opts?.burst) {
        spawnFloatingHearts(opts.burst, opts.x, opts.y);
      }

      if (capped >= TARGET && !completed) {
        setCompleted(true);
        unlockHearts520HintStorage();
        setHeartsHintUnlocked(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#e8a0b4", "#f5f0eb", "#c4788e"],
        });
      }
    },
    [completed, spawnFloatingHearts]
  );

  const addHearts = useCallback(
    (amount: number, clientX?: number, clientY?: number) => {
      if (count >= TARGET) return;
      const newCount = Math.min(count + amount, TARGET);
      const added = newCount - count;
      applyCount(newCount, {
        x: clientX,
        y: clientY,
        burst: Math.min(added, 12),
      });
    },
    [count, applyCount]
  );

  const addHeart = useCallback(
    (clientX?: number, clientY?: number) => {
      addHearts(1, clientX, clientY);
    },
    [addHearts]
  );

  const applyDollsQuestBonus = useCallback(() => {
    if (sessionStorage.getItem(DOLLS_HEARTS_BONUS_KEY)) return;
    sessionStorage.setItem(DOLLS_HEARTS_BONUS_KEY, "1");
    addHearts(DOLLS_QUEST_HEARTS, window.innerWidth / 2, window.innerHeight * 0.45);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.55 },
      colors: ["#e8a0b4", "#f5f0eb", "#c4788e"],
    });
  }, [addHearts]);

  useEffect(() => {
    function onDollsQuestComplete() {
      applyDollsQuestBonus();
    }

    window.addEventListener(DOLLS_QUEST_COMPLETE, onDollsQuestComplete);
    return () =>
      window.removeEventListener(DOLLS_QUEST_COMPLETE, onDollsQuestComplete);
  }, [applyDollsQuestBonus]);

  useEffect(() => {
    function onVoiceHeartsBoost(e: Event) {
      const { amount } = (e as CustomEvent<VoiceHeartsBoostDetail>).detail;
      addHearts(
        amount,
        window.innerWidth / 2,
        window.innerHeight * 0.45
      );
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#e8a0b4", "#f5f0eb", "#c4788e"],
      });
    }

    window.addEventListener(VOICE_HEARTS_BOOST, onVoiceHeartsBoost);
    return () =>
      window.removeEventListener(VOICE_HEARTS_BOOST, onVoiceHeartsBoost);
  }, [addHearts]);

  useEffect(() => {
    setHeartsHintUnlocked(isHearts520HintUnlocked());
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("love520_dolls_quest");
      if (!raw) return;
      const { readIds } = JSON.parse(raw) as { readIds?: string[] };
      if (readIds && readIds.length >= 5) {
        applyDollsQuestBonus();
      }
    } catch {
      /* ignore */
    }
  }, [applyDollsQuestBonus]);

  const progress = (count / TARGET) * 100;

  return (
    <Section id="hearts" className="items-center text-center">
      <motion.div ref={sectionRef} className="w-full">
        <FadeIn>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-accent">
            Interactive
          </p>
          <h2 className="font-display text-4xl md:text-5xl">
            Collect 520 Hearts
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Tap anywhere — each heart is a little &ldquo;I love you.&rdquo;
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mt-12">
          <motion.div className="relative mx-auto h-40 w-40">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-surface-elevated"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-accent"
                strokeDasharray={`${2 * Math.PI * 45}`}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100),
                }}
                transition={{ type: "spring", stiffness: 50 }}
              />
            </svg>
            <motion.span
              key={count}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center font-display text-3xl text-accent"
            >
              {count}
            </motion.span>
          </motion.div>

          <button
            type="button"
            onClick={(e) => addHeart(e.clientX, e.clientY)}
            disabled={completed}
            className="mt-8 rounded-full border border-accent/40 bg-accent/10 px-8 py-3 text-accent transition hover:bg-accent/20 disabled:opacity-50"
          >
            {completed ? "520 hearts collected ♥" : "Tap for a heart ♥"}
          </button>

          <AnimatePresence>
            {completed && heartsHintUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-8 max-w-lg rounded-2xl border border-accent/30 bg-accent/10 px-8 py-6 text-center"
              >
                <p
                  className="font-mono text-xl tracking-[0.35em] text-foreground/90 md:text-2xl"
                  aria-label="Clue"
                >
                  {HEARTS_520_PASSWORD_HINT}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </FadeIn>

        <AnimatePresence>
          {floating.map((h) => (
            <motion.span
              key={h.id}
              initial={{ opacity: 1, x: h.x, y: h.y, scale: 1 }}
              animate={{ opacity: 0, y: h.y - 120, scale: 1.5 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed z-40 text-2xl text-accent"
            >
              ♥
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    </Section>
  );
}
