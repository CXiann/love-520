"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { dispatchVoiceHeartsBoost } from "@/lib/game-events";
import { useScrollToSection } from "../SmoothScroll";
import {
  isBabyDuetPart1Done,
  isBabyDuetPart2Done,
  isBabyDuetCompleteFromStorage,
  isChapter2VoiceReadyFromStorage,
  markBabyDuetPart1Done,
  markBabyDuetPart2Done,
} from "@/lib/chapter-voice";
import {
  collectTranscriptsFromEvent,
  getSpeechRecognition,
  loadUsedVoicePhrases,
  matchAllVoicePhrases,
  matchesBabyChunk,
  normalizeSpeech,
  saveUsedVoicePhrases,
  speechRecognitionLang,
  VOICE_PHRASE_BABY_LABEL,
  type VoicePhraseId,
} from "@/lib/voice-love";

const VOICE_BOOST = 100;

/** Shown on cards only — mic still expects "Baby love baby" each turn */
const DUET_DISPLAY_FULL = "Bibii love baby, Baby love Bibii";
const DUET_DISPLAY_TURN1 = "Bibii love baby";
const DUET_DISPLAY_TURN2 = "Baby love Bibii";

type ChapterBabyDuetProps = {
  yourName: string;
  partnerName: string;
};

export function ChapterBabyDuet({ yourName, partnerName }: ChapterBabyDuetProps) {
  const { scrollToSection } = useScrollToSection();
  const [part1, setPart1] = useState(false);
  const [part2, setPart2] = useState(false);
  const [complete, setComplete] = useState(false);
  const gestureStartedRef = useRef(false);
  const runningRef = useRef(false);

  useEffect(() => {
    if (!isChapter2VoiceReadyFromStorage()) return;
    setPart1(isBabyDuetPart1Done());
    setPart2(isBabyDuetPart2Done());
    setComplete(
      isBabyDuetCompleteFromStorage() || loadUsedVoicePhrases().has("baby")
    );
  }, []);

  const activeTurn: 1 | 2 | null = complete
    ? null
    : part1
      ? 2
      : 1;

  const finishDuet = useCallback(() => {
    if (complete) return;
    setPart2(true);
    setComplete(true);
    markBabyDuetPart2Done();
    const used = loadUsedVoicePhrases();
    used.add("baby");
    saveUsedVoicePhrases(used);
    dispatchVoiceHeartsBoost(VOICE_BOOST, "baby");
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.55 },
      colors: ["#e8a0b4", "#f5f0eb", "#c4788e"],
    });
    window.setTimeout(() => scrollToSection("hearts"), 600);
  }, [complete, scrollToSection]);

  const processText = useCallback(
    (text: string) => {
      const n = normalizeSpeech(text);
      if (!n || complete) return;

      const used = loadUsedVoicePhrases();
      if (matchAllVoicePhrases(text, used).includes("baby")) {
        if (!part1) {
          markBabyDuetPart1Done();
          setPart1(true);
        }
        finishDuet();
        return;
      }

      if (activeTurn === 1 && matchesBabyChunk(n)) {
        markBabyDuetPart1Done();
        setPart1(true);
        return;
      }

      if (activeTurn === 2 && part1 && matchesBabyChunk(n)) {
        finishDuet();
      }
    },
    [activeTurn, part1, complete, finishDuet]
  );

  const micEnabled =
    isChapter2VoiceReadyFromStorage() &&
    !complete &&
    activeTurn !== null &&
    !loadUsedVoicePhrases().has("baby");

  useEffect(() => {
    const recognition = getSpeechRecognition();
    if (!recognition || !micEnabled) return;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechRecognitionLang();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const texts = collectTranscriptsFromEvent(event);
      for (const t of texts) processText(t);
      const combined = texts.join(" ");
      if (combined) processText(combined);
    };

    recognition.onend = () => {
      runningRef.current = false;
      if (micEnabled && gestureStartedRef.current) {
        try {
          recognition.start();
        } catch {
          /* ignore */
        }
      }
    };

    if (gestureStartedRef.current) {
      try {
        recognition.start();
        runningRef.current = true;
      } catch {
        /* ignore */
      }
    }

    return () => {
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
    };
  }, [micEnabled, processText]);

  const activateFromGesture = useCallback(() => {
    if (!micEnabled) return;
    gestureStartedRef.current = true;
    const recognition = getSpeechRecognition();
    if (!recognition || runningRef.current) return;
    try {
      recognition.start();
      runningRef.current = true;
    } catch {
      /* ignore */
    }
  }, [micEnabled]);

  if (!isChapter2VoiceReadyFromStorage()) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-10 w-full max-w-lg"
      aria-label="Baby love duet"
    >
      <p className="text-center text-xs uppercase tracking-[0.25em] text-accent/80">
        Your duet
      </p>
      <p className="mt-3 text-center text-sm text-muted">
        Take turns — each of you says your line. Together it becomes:{" "}
        <span className="text-foreground/90">{DUET_DISPLAY_FULL}</span>
      </p>

      <div className="mt-6 space-y-3">
        <DuetTurnCard
          turn={1}
          speaker={partnerName}
          line={DUET_DISPLAY_TURN1}
          state={part1 ? "done" : activeTurn === 1 ? "active" : "waiting"}
          onActivate={activateFromGesture}
        />
        <DuetTurnCard
          turn={2}
          speaker={yourName}
          line={DUET_DISPLAY_TURN2}
          state={
            complete || part2
              ? "done"
              : activeTurn === 2
                ? "active"
                : "waiting"
          }
          onActivate={activeTurn === 2 ? activateFromGesture : undefined}
        />
      </div>

      {complete && (
        <p className="mt-6 text-center text-sm text-accent">
          Duet complete — +{VOICE_BOOST} hearts ♥
        </p>
      )}
    </motion.section>
  );
}

function DuetTurnCard({
  turn,
  speaker,
  line,
  state,
  onActivate,
}: {
  turn: number;
  speaker: string;
  line: string;
  state: "waiting" | "active" | "done";
  onActivate?: () => void;
}) {
  const isActive = state === "active";

  return (
    <div
      role={isActive ? "button" : undefined}
      tabIndex={isActive ? 0 : undefined}
      onPointerDown={isActive ? onActivate : undefined}
      onKeyDown={
        isActive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onActivate?.();
            }
          : undefined
      }
      className={`rounded-xl border px-5 py-4 transition ${
        state === "done"
          ? "border-accent/40 bg-accent/15"
          : isActive
            ? "cursor-pointer border-accent bg-accent/10 shadow-[0_0_24px_rgba(232,160,180,0.2)]"
            : "border-accent/15 bg-surface-elevated/40 opacity-60"
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-muted">
        Turn {turn} — {speaker}
      </p>
      <p className="mt-2 font-display text-lg text-accent">{line}</p>
      {state === "done" && (
        <p className="mt-2 text-xs text-accent/80">Heard ♥</p>
      )}
      {isActive && (
        <p className="mt-2 text-xs text-muted">Tap here, then speak your line</p>
      )}
    </div>
  );
}
