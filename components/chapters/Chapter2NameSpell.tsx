"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEasterEgg } from "../easter-eggs/EasterEggProvider";
import {
  CHAPTER2_GAME_COMPLETE_KEY,
} from "@/lib/game-events";
import { isChapter2VoiceReadyFromStorage } from "@/lib/chapter-voice";
import {
  lettersFromPartnerName,
  lettersMatch,
  shuffleArray,
} from "@/lib/chapter2-name";

type Chip = { id: string; letter: string };

function buildChips(letters: string[]): Chip[] {
  return letters.map((letter, i) => ({
    id: `chip-${i}-${letter}`,
    letter,
  }));
}

function findSlotAtPoint(
  slotRefs: React.RefObject<(HTMLDivElement | null)[]>,
  clientX: number,
  clientY: number
): number | null {
  const refs = slotRefs.current;
  if (!refs) return null;
  for (let i = 0; i < refs.length; i++) {
    const el = refs[i];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return i;
    }
  }
  return null;
}

export function Chapter2NameSpell({
  partnerName,
  onVoiceReady,
}: {
  partnerName: string;
  onVoiceReady: () => void;
}) {
  const { showToast } = useEasterEgg();

  const targetLetters = useMemo(
    () => lettersFromPartnerName(partnerName),
    [partnerName]
  );

  const [done, setDone] = useState(false);
  const [chips, setChips] = useState<Chip[]>([]);
  const [slotChipIds, setSlotChipIds] = useState<(string | null)[]>([]);
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDone(
      isChapter2VoiceReadyFromStorage() ||
        sessionStorage.getItem(CHAPTER2_GAME_COMPLETE_KEY) === "1"
    );
  }, []);

  useEffect(() => {
    if (targetLetters.length === 0) return;
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem(CHAPTER2_GAME_COMPLETE_KEY) === "1"
    ) {
      return;
    }
    const built = buildChips(targetLetters);
    setChips(shuffleArray(built));
    setSlotChipIds(targetLetters.map(() => null));
    setSelectedChipId(null);
    setWon(false);
  }, [targetLetters]);

  const poolChipIds = useMemo(() => {
    const inSlots = new Set(slotChipIds.filter(Boolean) as string[]);
    return chips.filter((c) => !inSlots.has(c.id)).map((c) => c.id);
  }, [chips, slotChipIds]);

  const filledCount = slotChipIds.filter(Boolean).length;

  const getSpelledLetters = useCallback((): string[] => {
    return slotChipIds.map((chipId) => {
      if (!chipId) return "";
      const chip = chips.find((c) => c.id === chipId);
      return chip?.letter ?? "";
    });
  }, [slotChipIds, chips]);

  const assignChipToSlot = useCallback(
    (chipId: string, slotIndex: number) => {
      setSlotChipIds((prev) => {
        const next = [...prev];
        const existingSlot = next.findIndex((id) => id === chipId);
        if (existingSlot >= 0) next[existingSlot] = null;
        const displaced = next[slotIndex];
        if (displaced && displaced !== chipId) {
          /* displaced chip returns to pool via slot clear */
        }
        next[slotIndex] = chipId;
        return next;
      });
      setSelectedChipId(null);
    },
    []
  );

  const clearSlot = useCallback((slotIndex: number) => {
    setSlotChipIds((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  }, []);

  const handleWin = useCallback(() => {
    if (won || done) return;
    setWon(true);
    setDone(true);
    sessionStorage.setItem(CHAPTER2_GAME_COMPLETE_KEY, "1");
    showToast("Perfect — her name lights the way ♥");
    onVoiceReady();
  }, [won, done, showToast, onVoiceReady]);

  useEffect(() => {
    if (won || done || targetLetters.length === 0) return;
    if (filledCount !== targetLetters.length) return;
    const spelled = getSpelledLetters();
    if (lettersMatch(spelled, targetLetters)) {
      handleWin();
    }
  }, [
    slotChipIds,
    filledCount,
    targetLetters,
    won,
    done,
    getSpelledLetters,
    handleWin,
  ]);

  const onPoolChipClick = (chipId: string) => {
    if (done || won) return;
    setSelectedChipId((prev) => (prev === chipId ? null : chipId));
  };

  const onSlotClick = (slotIndex: number) => {
    if (done || won) return;
    const current = slotChipIds[slotIndex];
    if (selectedChipId) {
      assignChipToSlot(selectedChipId, slotIndex);
      return;
    }
    if (current) clearSlot(slotIndex);
  };

  const onDragEnd = (
    chipId: string,
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { point: { x: number; y: number } }
  ) => {
    if (done || won) return;
    const slotIndex = findSlotAtPoint(slotRefs, info.point.x, info.point.y);
    if (slotIndex !== null) {
      assignChipToSlot(chipId, slotIndex);
    }
  };

  if (targetLetters.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted">
        Set her name in admin to unlock this chapter&apos;s game.
      </p>
    );
  }

  if (done && !won) {
    return (
      <p className="mt-6 font-display text-lg text-accent/90">
        You spelled it ♥
      </p>
    );
  }

  return (
    <div
      ref={playAreaRef}
      className="mt-8"
      data-lenis-prevent
    >
      <p className="font-display text-xl text-accent md:text-2xl">
        Spell her name to unlock what&apos;s next
      </p>
      <p className="mt-2 text-sm text-muted">
        Drag letters into the slots — or tap a letter, then tap a slot.
      </p>

      {!won && (
        <p className="mt-3 text-xs uppercase tracking-widest text-muted/80">
          {filledCount} / {targetLetters.length} letters
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
        {targetLetters.map((_, i) => {
          const chipId = slotChipIds[i];
          const chip = chipId ? chips.find((c) => c.id === chipId) : null;
          return (
            <div
              key={`slot-${i}`}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              role="button"
              tabIndex={0}
              onClick={() => onSlotClick(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSlotClick(i);
                }
              }}
              className={`flex h-12 w-11 items-center justify-center rounded-lg border-2 border-dashed transition sm:h-14 sm:w-12 ${
                selectedChipId
                  ? "border-accent/60 bg-accent/5"
                  : "border-accent/25 bg-surface-elevated/50"
              }`}
              aria-label={`Slot ${i + 1}`}
            >
              {chip ? (
                <span className="font-display text-xl text-accent">
                  {chip.letter}
                </span>
              ) : (
                <span className="text-xs text-muted/40">{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex min-h-[72px] flex-wrap justify-center gap-2 sm:gap-3">
        {chips
          .filter((c) => poolChipIds.includes(c.id))
          .map((chip) => (
            <motion.button
              key={chip.id}
              type="button"
              drag
              dragConstraints={playAreaRef}
              dragElastic={0.12}
              dragMomentum={false}
              onDragEnd={(e, info) => onDragEnd(chip.id, e, info)}
              onClick={() => onPoolChipClick(chip.id)}
              whileDrag={{ scale: 1.08, zIndex: 20 }}
              className={`touch-none flex h-12 w-11 cursor-grab items-center justify-center rounded-lg border border-accent/30 bg-surface-elevated font-display text-xl text-foreground shadow-sm active:cursor-grabbing sm:h-14 sm:w-12 ${
                selectedChipId === chip.id
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                  : ""
              }`}
              style={{ touchAction: "none" }}
              aria-pressed={selectedChipId === chip.id}
            >
              {chip.letter}
            </motion.button>
          ))}
      </div>

      <AnimatePresence>
        {won && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 font-display text-lg text-accent"
          >
            Beautiful — follow the hearts below ♥
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
