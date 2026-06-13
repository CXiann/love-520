"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  parsePasswordHints,
  parseQuizJson,
  SECRET_STAGE_KEY,
  type SecretStage,
} from "@/lib/secret-types";
import {
  buildSecretPasswordHint,
  HEARTS_520_PASSWORD_HINT,
  isDollsQuestCompleteFromStorage,
  isHearts520HintUnlocked,
} from "@/lib/secret-password";
import {
  TIMELINE_PASSWORD_HINT,
  isTimelineQuestCompleteFromStorage,
} from "@/lib/timeline-quest";
import { TIMELINE_QUEST_COMPLETE } from "@/lib/game-events";
import {
  isSecretRewardsUnlockedFromStorage,
  unlockSecretRewardsStorage,
} from "@/lib/secret-rewards";
import { SecretEnvelope } from "./secret/SecretEnvelope";
import { SecretQuiz } from "./secret/SecretQuiz";
import { SecretReveal } from "./secret/SecretReveal";

export type SecretContentData = {
  title: string;
  body: string;
  mediaUrl: string | null;
  envelopeTeaser: string | null;
  quizJson: string | null;
  passwordHints: string | null;
};

const DEFAULT_HINTS = [
  "Think of the number we celebrate today…",
  "It's our special day — two digits, twice.",
];

export function SecretClient({
  authenticated: initialAuth,
  content,
  relationshipStart,
}: {
  authenticated: boolean;
  content: SecretContentData | null;
  relationshipStart: string;
}) {
  const reducedMotion = useReducedMotion();
  const [authenticated, setAuthenticated] = useState(initialAuth);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [unlockFlash, setUnlockFlash] = useState(false);
  const [stage, setStage] = useState<SecretStage>("envelope");
  const [dollsHintReady, setDollsHintReady] = useState(false);
  const [heartsHintReady, setHeartsHintReady] = useState(false);
  const [timelineHintReady, setTimelineHintReady] = useState(false);
  const [rewardsUnlocked, setRewardsUnlocked] = useState(false);

  const passwordHints = parsePasswordHints(content?.passwordHints);
  const dollsPasswordHint = buildSecretPasswordHint(
    new Date(relationshipStart)
  );
  const hints = passwordHints.length ? passwordHints : DEFAULT_HINTS;
  const quiz = parseQuizJson(content?.quizJson);

  const persistStage = useCallback((s: SecretStage) => {
    setStage(s);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SECRET_STAGE_KEY, s);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const saved = sessionStorage.getItem(SECRET_STAGE_KEY) as SecretStage | null;
    if (saved === "envelope" || saved === "quiz" || saved === "reveal") {
      setStage(saved);
    }
  }, [authenticated]);

  useEffect(() => {
    setDollsHintReady(isDollsQuestCompleteFromStorage());
    setHeartsHintReady(isHearts520HintUnlocked());
    setTimelineHintReady(isTimelineQuestCompleteFromStorage());
    setRewardsUnlocked(isSecretRewardsUnlockedFromStorage());
  }, []);

  useEffect(() => {
    function onTimelineComplete() {
      setTimelineHintReady(true);
    }
    window.addEventListener(TIMELINE_QUEST_COMPLETE, onTimelineComplete);
    return () =>
      window.removeEventListener(TIMELINE_QUEST_COMPLETE, onTimelineComplete);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
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
        persistStage("envelope");
      }, reducedMotion ? 300 : 1200);
    } else {
      const data = await res.json();
      const attempt = failedAttempts + 1;
      setFailedAttempts(attempt);
      const hint = hints[(attempt - 1) % hints.length];
      setError(data.error ? `${data.error} — ${hint}` : hint);
    }
  }

  function advanceFromEnvelope() {
    if (quiz.length > 0) {
      persistStage("quiz");
    } else {
      persistStage("reveal");
    }
  }

  function advanceFromQuiz() {
    persistStage("reveal");
  }

  if (!authenticated) {
    return (
      <motion.div className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <AnimatePresence>
          {unlockFlash && (
            <motion.div
              className="pointer-events-none fixed inset-0 z-50 bg-accent/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.2 : 0.8 }}
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-accent">
            Secret
          </p>
          <h1 className="mt-4 font-display text-3xl">Enter the password</h1>
          <p className="mt-2 text-sm text-muted">
            Something only the two of us would know.
          </p>

          {(dollsHintReady || heartsHintReady || timelineHintReady) && (
            <div className="mt-6 space-y-3 rounded-xl border border-accent/25 bg-accent/10 px-6 py-5 text-center">
              {dollsHintReady && (
                <p className="font-mono text-lg tracking-[0.35em] text-foreground/90">
                  {dollsPasswordHint}
                </p>
              )}
              {heartsHintReady && (
                <p className="font-mono text-lg tracking-[0.35em] text-foreground/90">
                  {HEARTS_520_PASSWORD_HINT}
                </p>
              )}
              {timelineHintReady && (
                <p className="font-mono text-lg tracking-[0.35em] text-foreground/90">
                  {TIMELINE_PASSWORD_HINT}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-accent/30 bg-surface-elevated px-4 py-3 text-foreground focus:border-accent focus:outline-none"
              autoFocus
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

          <Link
            href="/"
            className="mt-8 inline-block text-sm text-muted hover:text-accent"
          >
            ← Back to our story
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  if (!content) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center"
      >
        <p className="text-muted">No secret content yet.</p>
      </motion.div>
    );
  }

  const teaser =
    content.envelopeTeaser ?? "Something I've been saving just for you…";

  if (stage === "envelope") {
    return <SecretEnvelope teaser={teaser} onOpen={advanceFromEnvelope} />;
  }

  if (stage === "quiz" && quiz.length > 0) {
    return <SecretQuiz questions={quiz} onComplete={advanceFromQuiz} />;
  }

  return (
    <SecretReveal
      title={content.title}
      body={content.body}
      mediaUrl={content.mediaUrl}
      showRewards={rewardsUnlocked}
      onRewardsUnlocked={() => setRewardsUnlocked(true)}
    />
  );
}
