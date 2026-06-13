"use client";

import { motion } from "framer-motion";
import { VOICE_PHRASE_STILL_LOVE_LABEL } from "@/lib/voice-love";

type GalleryVoiceInviteProps = {
  onActivate?: () => void;
};

export function GalleryVoiceInvite({ onActivate }: GalleryVoiceInviteProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-lg"
      aria-label="Voice moment"
    >
      <p className="text-center text-xs uppercase tracking-[0.25em] text-accent/80">
        One more thing
      </p>
      <div
        role="button"
        tabIndex={0}
        onPointerDown={onActivate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onActivate?.();
        }}
        className="mt-4 cursor-pointer rounded-2xl border border-accent/30 bg-accent/10 px-6 py-6 text-center shadow-[0_0_32px_rgba(232,160,180,0.12)] transition hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <p className="text-sm leading-relaxed text-foreground/90">
          When you&apos;re ready, say it out loud:{" "}
          <span className="text-accent">{VOICE_PHRASE_STILL_LOVE_LABEL}</span>
        </p>
      </div>
    </motion.section>
  );
}
