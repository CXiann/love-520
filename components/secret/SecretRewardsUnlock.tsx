"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { unlockSecretRewardsStorage } from "@/lib/secret-rewards";

const WRONG_TOASTS = [
  "Not quite — our word is sneakier than that ♥",
  "Hmm, that's not it — follow the clues?",
  "Almost… but my heart says try again.",
  "Nope — you'll know when it's right.",
  "Wrong key — the real one has our story in it.",
];

type SecretRewardsUnlockProps = {
  onUnlocked: () => void;
  embedded?: boolean;
};

export function SecretRewardsUnlock({
  onUnlocked,
  embedded = false,
}: SecretRewardsUnlockProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const toastIndex = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const tryUnlock = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || loading) return;

      setLoading(true);
      const res = await fetch("/api/auth/secret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: trimmed }),
      });
      setLoading(false);

      if (res.ok) {
        unlockSecretRewardsStorage();
        onUnlocked();
        return;
      }

      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      const msg = WRONG_TOASTS[toastIndex.current % WRONG_TOASTS.length];
      toastIndex.current += 1;
      showToast(msg);
      inputRef.current?.focus();
      inputRef.current?.select();
    },
    [loading, onUnlocked, showToast]
  );

  return (
    <>
      <motion.section
        className={`mx-auto w-full ${
          embedded ? "mt-12 max-w-xs px-2" : "mt-16 max-w-xs"
        }`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.input
          ref={inputRef}
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void tryUnlock(password);
            }
          }}
          placeholder="Say the word…"
          aria-label="Secret password"
          animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-lg border border-accent/30 bg-surface-elevated px-4 py-3 text-center text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none disabled:opacity-60"
        />
      </motion.section>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="fixed bottom-24 left-1/2 z-50 max-w-[min(90vw,20rem)] -translate-x-1/2 rounded-full border border-accent/40 bg-surface-elevated/95 px-6 py-3 text-center text-sm text-accent shadow-lg backdrop-blur-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
