"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SecretRewards } from "./SecretRewards";
import { SecretRewardsUnlock } from "./SecretRewardsUnlock";

type SecretRevealProps = {
  title: string;
  body: string;
  mediaUrl: string | null;
  /** When true, renders inside a home section instead of full-page secret route. */
  embedded?: boolean;
  /** Pottery ticket + chore orders — only after correct password this session. */
  showRewards?: boolean;
  onRewardsUnlocked?: () => void;
};

export function SecretReveal({
  title,
  body,
  mediaUrl,
  embedded = false,
  showRewards = false,
  onRewardsUnlocked,
}: SecretRevealProps) {
  const reducedMotion = useReducedMotion();
  const lines = useMemo(
    () => body.split("\n").filter((l) => l.trim().length > 0),
    [body]
  );

  const lineDelay = reducedMotion ? 0 : 0.4;

  return (
    <motion.div
      className={
        embedded
          ? "flex w-full flex-col items-center px-2 py-8"
          : "flex min-h-screen flex-col items-center px-6 py-20 pb-32"
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <article className="mx-auto w-full max-w-2xl text-center">
        <motion.p
          className="text-sm uppercase tracking-[0.3em] text-accent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          For your eyes only
        </motion.p>

        <motion.h1
          className="mt-4 font-display text-4xl md:text-5xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {title}
        </motion.h1>

        <motion.div
          className="mt-8 space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: lineDelay },
            },
          }}
        >
          {lines.map((line, i) => (
            <motion.p
              key={i}
              className="text-lg leading-relaxed text-foreground/90"
              variants={{
                hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: reducedMotion ? 0.1 : 0.5 },
                },
              }}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>

        {mediaUrl && (
          <motion.div
            className="mt-10 rotate-1 rounded-sm border-8 border-white/10 bg-surface-elevated p-2 shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: lines.length * lineDelay + 0.5 }}
            whileHover={reducedMotion ? {} : { rotate: 0, scale: 1.02 }}
          >
            {mediaUrl.includes("youtube.com") ||
            mediaUrl.includes("youtu.be") ? (
              <iframe
                src={mediaUrl.replace("watch?v=", "embed/")}
                className="mx-auto aspect-video w-full max-w-xl rounded-sm"
                allowFullScreen
                title="Secret video"
              />
            ) : mediaUrl.match(/\.(mp4|webm)$/i) ? (
              <video
                src={mediaUrl}
                controls
                className="mx-auto max-w-xl rounded-sm"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt="Secret"
                className="mx-auto max-w-md rounded-sm"
              />
            )}
          </motion.div>
        )}
      </article>

      <div className="mx-auto w-full max-w-6xl">
        {showRewards ? (
          <SecretRewards embedded={embedded} />
        ) : onRewardsUnlocked ? (
          <SecretRewardsUnlock
            embedded={embedded}
            onUnlocked={onRewardsUnlocked}
          />
        ) : null}
      </div>

      {!embedded && (
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: lines.length * lineDelay + 1 }}
        >
          <Link
            href="/"
            className="mt-12 inline-block text-sm text-muted hover:text-accent"
          >
            ← Back to our story
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
