"use client";

import { differenceInDays, format } from "date-fns";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Section, FadeIn } from "../Section";
import {
  isSecretRewardsUnlockedFromStorage,
  unlockSecretRewardsStorage,
} from "@/lib/secret-rewards";
import { SecretReveal } from "../secret/SecretReveal";

export type FinaleSecretContent = {
  title: string;
  body: string;
  mediaUrl: string | null;
};

type FinaleProps = {
  relationshipStart: Date | string;
  first520Date: Date | string | null;
  partnerName: string;
  secretContent: FinaleSecretContent | null;
  secretAuthenticated: boolean;
};

export function Finale({
  relationshipStart,
  first520Date,
  partnerName,
  secretContent,
  secretAuthenticated: initialAuth,
}: FinaleProps) {
  const reducedMotion = useReducedMotion();
  const days = differenceInDays(new Date(), new Date(relationshipStart));
  const [showPopover, setShowPopover] = useState(false);
  const [authenticated, setAuthenticated] = useState(initialAuth);
  const [rewardsUnlocked, setRewardsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlockFlash, setUnlockFlash] = useState(false);
  const clickTimes = useRef<number[]>([]);

  useEffect(() => {
    setRewardsUnlocked(isSecretRewardsUnlockedFromStorage());
  }, []);

  function handleDaysClick() {
    const now = Date.now();
    clickTimes.current = [...clickTimes.current, now].filter(
      (t) => now - t < 600
    );
    if (clickTimes.current.length >= 3) {
      clickTimes.current = [];
      setShowPopover((v) => !v);
    }
  }

  const popoverDate = first520Date
    ? new Date(first520Date)
    : new Date(relationshipStart);

  async function handleSecretSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/secret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      unlockSecretRewardsStorage();
      setRewardsUnlocked(true);
      setUnlockFlash(true);
      setTimeout(() => {
        setUnlockFlash(false);
        setAuthenticated(true);
      }, reducedMotion ? 300 : 900);
    } else {
      const data = await res.json();
      setError(data.error ?? "Wrong password");
    }
  }

  return (
    <Section id="finale" className="items-center text-center">
      <AnimatePresence>
        {unlockFlash && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50 bg-accent/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.2 : 0.6 }}
          />
        )}
      </AnimatePresence>

      <FadeIn>
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          Together
        </p>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">
          Every Day With You
        </h2>
      </FadeIn>

      <FadeIn delay={0.2} className="relative mt-12">
        <p className="text-muted">Days together</p>
        <motion.button
          type="button"
          onClick={handleDaysClick}
          className="font-display text-6xl text-accent md:text-8xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Days together — triple tap for a secret"
        >
          {days.toLocaleString()}
        </motion.button>
        <AnimatePresence>
          {showPopover && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute left-1/2 top-full z-20 mt-4 w-72 -translate-x-1/2 rounded-lg border border-accent/30 bg-surface-elevated px-4 py-3 text-sm shadow-lg"
            >
              <p className="text-accent">Our story began</p>
              <p className="mt-1 text-foreground">
                {format(popoverDate, "MMMM d, yyyy")}
              </p>
              <p className="mt-2 text-xs text-muted">
                Every day since has been worth it, {partnerName}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-4 text-lg text-muted">
          and counting, {partnerName} ♥
        </p>
      </FadeIn>

      <FadeIn
        delay={0.4}
        className={`mt-16 w-full px-4 ${
          authenticated && secretContent ? "max-w-6xl" : "max-w-md"
        }`}
      >
        {authenticated && secretContent ? (
          <SecretReveal
            embedded
            title={secretContent.title}
            body={secretContent.body}
            mediaUrl={secretContent.mediaUrl}
            showRewards={rewardsUnlocked}
            onRewardsUnlocked={() => setRewardsUnlocked(true)}
          />
        ) : (
          <div className="mx-auto w-full max-w-sm">
            <p className="font-display text-2xl text-accent md:text-3xl">
              One more surprise
            </p>
            <p className="mt-3 text-sm text-muted">
              When the clues come together, say the word.
            </p>
            <form onSubmit={handleSecretSubmit} className="mt-8 space-y-4">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-accent/30 bg-surface-elevated px-4 py-3 text-foreground focus:border-accent focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading || unlockFlash}
                className="w-full rounded-full border border-accent bg-accent/20 py-3 text-accent transition hover:bg-accent/30 disabled:opacity-50"
              >
                {loading ? "Checking…" : unlockFlash ? "Unlocked ♥" : "Unlock"}
              </button>
            </form>
          </div>
        )}
      </FadeIn>

      <FadeIn delay={0.5} className="mt-20">
        <p className="text-sm text-muted">520 · I love you · Year Two</p>
      </FadeIn>
    </Section>
  );
}
