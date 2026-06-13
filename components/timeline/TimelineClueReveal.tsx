"use client";

import { motion } from "framer-motion";
import { TIMELINE_PASSWORD_HINT } from "@/lib/timeline-quest";

export function TimelineClueReveal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-10 max-w-lg rounded-2xl border border-accent/40 bg-accent/10 px-8 py-6 text-center shadow-[0_0_48px_rgba(232,160,180,0.2)]"
      aria-label="Password clue"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-accent/80">
        A clue for the secret
      </p>
      <motion.p
        initial={{ opacity: 0.6, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mt-4 font-mono text-xl tracking-[0.35em] text-foreground/90 md:text-2xl"
      >
        {TIMELINE_PASSWORD_HINT}
      </motion.p>
      <p className="mt-3 text-sm text-muted">
        Save this — it completes the password with 520.
      </p>
    </motion.div>
  );
}
