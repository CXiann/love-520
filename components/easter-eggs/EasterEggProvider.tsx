"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const STORAGE_520 = "love520_egg_520";
const SEQUENCE = ["5", "2", "0"];

type EasterEggContextValue = {
  showToast: (message: string) => void;
  trigger520: () => void;
};

const EasterEggContext = createContext<EasterEggContextValue | null>(null);

export function useEasterEgg() {
  const ctx = useContext(EasterEggContext);
  if (!ctx) {
    return {
      showToast: () => {},
      trigger520: () => {},
    };
  }
  return ctx;
}

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);
  const [keyIndex, setKeyIndex] = useState(0);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  }, []);

  const trigger520 = useCallback(() => {
    if (sessionStorage.getItem(STORAGE_520)) {
      showToast("You already found our number ♥");
      return;
    }
    sessionStorage.setItem(STORAGE_520, "1");
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.35 },
      colors: ["#e8a0b4", "#f5f0eb", "#c4788e"],
    });
    showToast("You know our number ♥");
  }, [showToast]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const key = e.key;
      if (key === SEQUENCE[keyIndex]) {
        const next = keyIndex + 1;
        if (next === SEQUENCE.length) {
          setKeyIndex(0);
          trigger520();
        } else {
          setKeyIndex(next);
        }
      } else {
        setKeyIndex(key === SEQUENCE[0] ? 1 : 0);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyIndex, trigger520]);

  return (
    <EasterEggContext.Provider value={{ showToast, trigger520 }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-accent/40 bg-surface-elevated/95 px-6 py-3 text-sm text-accent shadow-lg backdrop-blur-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </EasterEggContext.Provider>
  );
}
