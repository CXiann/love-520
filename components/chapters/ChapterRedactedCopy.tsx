"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CH1_CROSS_KEY,
  CH2_REDACT_KEY,
  parseCopyWithRedactions,
  type RedactSegment,
} from "@/lib/chapter-eggs";

type ChapterRedactedCopyProps = {
  copy: string;
  bonusRedact?: string | null;
  className?: string;
};

function loadRevealed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(CH2_REDACT_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

export function ChapterRedactedCopy({
  copy,
  bonusRedact,
  className = "",
}: ChapterRedactedCopyProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [hasCrossKey, setHasCrossKey] = useState(false);
  const segments = parseCopyWithRedactions(copy);
  const bonusSegments = bonusRedact
    ? parseCopyWithRedactions(`[[redact:${bonusRedact}]]`)
    : [];

  useEffect(() => {
    setRevealed(loadRevealed());
    setHasCrossKey(sessionStorage.getItem(CH1_CROSS_KEY) === "1");
  }, []);

  useEffect(() => {
    function refresh() {
      setRevealed(loadRevealed());
    }
    window.addEventListener("love520:ch2-redact-reveal", refresh);
    return () =>
      window.removeEventListener("love520:ch2-redact-reveal", refresh);
  }, []);

  const reveal = useCallback((id: string) => {
    setRevealed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      sessionStorage.setItem(CH2_REDACT_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  function renderSegments(list: RedactSegment[], keyPrefix: string) {
    return list.map((seg, i) => {
      if (seg.type === "text") {
        return <span key={`${keyPrefix}-t-${i}`}>{seg.value}</span>;
      }
      const isRevealed = revealed.has(seg.id);
      return (
        <button
          key={`${keyPrefix}-r-${seg.id}`}
          type="button"
          onClick={() => reveal(seg.id)}
          className={`mx-0.5 inline rounded px-1 transition focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
            isRevealed
              ? "bg-accent/15 text-foreground"
              : "bg-foreground/10 text-transparent hover:bg-accent/20"
          }`}
          aria-label={isRevealed ? undefined : "Reveal hidden word"}
        >
          {isRevealed ? seg.value : "████"}
        </button>
      );
    });
  }

  return (
    <motion.p
      className={`text-lg leading-relaxed text-inherit md:text-xl ${className}`}
    >
      {renderSegments(segments, "main")}
      {hasCrossKey && bonusSegments.length > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 block text-accent/90"
        >
          {renderSegments(bonusSegments, "bonus")}
        </motion.span>
      )}
    </motion.p>
  );
}
