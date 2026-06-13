"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import type { Chapter2FavoriteGameParsed } from "@/lib/chapter2-favorite-game";
import {
  isOrderPhaseComplete,
  loadHighlightsQuest,
  markHighlightsQuestCompleteStorage,
  saveHighlightsQuest,
  shuffleSlideIds,
} from "@/lib/chapter2-highlights";
import { isChapter2VoiceReadyFromStorage } from "@/lib/chapter-voice";
import { ChapterHighlightCurate } from "./ChapterHighlightCurate";
import { ChapterHighlightOrder } from "./ChapterHighlightOrder";
import { ChapterHighlightReel } from "./ChapterHighlightReel";

type ChapterHighlightQuestProps = {
  game: Chapter2FavoriteGameParsed;
  onVoiceReady: () => void;
};

export function ChapterHighlightQuest({
  game,
  onVoiceReady,
}: ChapterHighlightQuestProps) {
  const {
    slides: normalized,
    pickCount,
    curatePrompt,
    orderPrompt,
    orderHint,
    slotLabels,
  } = game;

  const allIds = useMemo(() => normalized.map((s) => s.id), [normalized]);
  const defaultPoolOrder = useMemo(
    () => shuffleSlideIds(allIds),
    [allIds]
  );
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<"curate" | "order" | "complete">("curate");
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [poolOrder, setPoolOrder] = useState<string[]>(defaultPoolOrder);
  const [slotAssignments, setSlotAssignments] = useState<(string | null)[]>(() =>
    Array(pickCount).fill(null)
  );
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const confettiFired = useRef(false);

  useEffect(() => {
    setSlotAssignments(Array(pickCount).fill(null));
  }, [pickCount]);

  useEffect(() => {
    if (normalized.length === 0) {
      setHydrated(true);
      return;
    }
    const loaded = loadHighlightsQuest(normalized, defaultPoolOrder, pickCount);
    setPhase(loaded.phase);
    setPickedIds(loaded.pickedIds);
    setPoolOrder(loaded.poolOrder);
    if (loaded.orderedIds.length >= pickCount) {
      setOrderedIds(loaded.orderedIds);
      const slots = Array(pickCount)
        .fill(null)
        .map((_, i) => loaded.orderedIds[i] ?? null);
      setSlotAssignments(slots);
    } else if (loaded.phase === "order") {
      setSlotAssignments((prev) => {
        const next = Array(pickCount).fill(null) as (string | null)[];
        loaded.orderedIds.forEach((id, i) => {
          if (i < next.length) next[i] = id;
        });
        return next;
      });
    }
    setHydrated(true);
  }, [normalized, defaultPoolOrder, pickCount]);

  const persist = useCallback(
    (
      nextPhase: typeof phase,
      picked: string[],
      pool: string[],
      ordered: string[]
    ) => {
      saveHighlightsQuest({
        phase: nextPhase,
        pickedIds: picked,
        orderedIds: ordered,
        poolOrder: pool,
      });
    },
    []
  );

  const finishQuest = useCallback(
    (finalOrdered: string[]) => {
      markHighlightsQuestCompleteStorage();
      setOrderedIds(finalOrdered);
      setPhase("complete");
      persist("complete", pickedIds, [], finalOrdered);
      if (!isChapter2VoiceReadyFromStorage()) {
        onVoiceReady();
      }
      if (!confettiFired.current) {
        confettiFired.current = true;
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.55 },
          colors: ["#e8a0b4", "#f5f0eb", "#c4788e"],
        });
      }
    },
    [pickedIds, persist, onVoiceReady]
  );

  const handleTogglePick = useCallback(
    (id: string) => {
      if (phase !== "curate") return;

      setPickedIds((prev) => {
        const has = prev.includes(id);
        if (has) {
          const next = prev.filter((x) => x !== id);
          setPoolOrder((pool) => {
            const p = [...pool, id];
            persist("curate", next, p, []);
            return p;
          });
          return next;
        }
        if (prev.length >= pickCount) return prev;

        const next = [...prev, id];
        const advancing = next.length >= pickCount;
        setPoolOrder((pool) => {
          const p = pool.filter((x) => x !== id);
          persist(advancing ? "order" : "curate", next, p, []);
          return p;
        });
        if (advancing) {
          window.setTimeout(() => setPhase("order"), 400);
        }
        return next;
      });
    },
    [phase, pickCount, persist]
  );

  useEffect(() => {
    if (!hydrated || normalized.length === 0) return;
    if (
      normalized.length <= pickCount &&
      phase === "curate" &&
      pickedIds.length === 0
    ) {
      const all = allIds;
      setPickedIds(all);
      setPhase("order");
      persist("order", all, [], []);
    }
  }, [
    hydrated,
    normalized.length,
    pickCount,
    phase,
    pickedIds.length,
    allIds,
    persist,
  ]);

  const handleSlotChange = useCallback(
    (next: (string | null)[]) => {
      setSlotAssignments(next);
      const ordered = next.filter((id): id is string => id !== null);
      persist("order", pickedIds, [], ordered);
      if (isOrderPhaseComplete(ordered, pickCount)) {
        finishQuest(ordered);
      }
    },
    [pickedIds, persist, finishQuest, pickCount]
  );

  if (!hydrated) return null;

  if (normalized.length === 0) {
    return (
      <p className="mt-8 text-sm text-muted">
        Add highlight photos in admin under{" "}
        <span className="text-accent">Favorite moments game</span>, then save
        settings.
      </p>
    );
  }

  return (
    <div className="w-full">
      {phase === "curate" && (
        <ChapterHighlightCurate
          slides={normalized}
          poolOrder={poolOrder}
          pickedIds={pickedIds}
          pickCount={pickCount}
          prompt={curatePrompt}
          onTogglePick={handleTogglePick}
        />
      )}

      {phase === "order" && (
        <ChapterHighlightOrder
          slides={normalized}
          pickedIds={pickedIds}
          slotAssignments={slotAssignments}
          slotLabels={slotLabels}
          orderPrompt={orderPrompt}
          orderHint={orderHint}
          onSlotAssignmentsChange={handleSlotChange}
        />
      )}

      {phase === "complete" && (
        <ChapterHighlightReel slides={normalized} orderedIds={orderedIds} />
      )}
    </div>
  );
}
