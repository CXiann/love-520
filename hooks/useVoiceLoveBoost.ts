"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  collectTranscriptsFromEvent,
  getSpeechRecognition,
  loadUsedVoicePhrases,
  logTranscriptsFromEvent,
  logVoiceSpeech,
  matchAllVoicePhrases,
  saveUsedVoicePhrases,
  speechRecognitionLang,
  type VoicePhraseId,
} from "@/lib/voice-love";

const RESTART_MS = 300;
const BUFFER_MAX = 400;
const ALL_PHRASES: VoicePhraseId[] = [
  "forever",
  "baby",
  "everything",
  "stillLove",
];

function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /safari/i.test(navigator.userAgent) &&
    !/chrome|chromium|android/i.test(navigator.userAgent)
  );
}

export function useVoiceLoveBoost(
  onBoost: (phraseId: VoicePhraseId) => void,
  options: { enabled: boolean }
) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onBoostRef = useRef(onBoost);
  const enabledRef = useRef(options.enabled);
  const usedPhrasesRef = useRef<Set<VoicePhraseId>>(new Set());
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufferRef = useRef("");
  const gestureStartedRef = useRef(false);
  const runningRef = useRef(false);
  const scheduleRestartRef = useRef<() => void>(() => {});

  useEffect(() => {
    onBoostRef.current = onBoost;
  }, [onBoost]);

  useEffect(() => {
    enabledRef.current = options.enabled;
  }, [options.enabled]);

  useEffect(() => {
    usedPhrasesRef.current = loadUsedVoicePhrases();
  }, []);

  const allPhrasesUsed = useCallback(() => {
    return ALL_PHRASES.every((id) => usedPhrasesRef.current.has(id));
  }, []);

  const startRecognition = useCallback((fromGesture = false) => {
    if (allPhrasesUsed() || !enabledRef.current) return false;

    const recognition = recognitionRef.current;
    if (!recognition) return false;

    if (fromGesture) gestureStartedRef.current = true;
    if (isSafari() && !gestureStartedRef.current) return false;

    try {
      recognition.start();
      runningRef.current = true;
      return true;
    } catch {
      runningRef.current = false;
      return false;
    }
  }, [allPhrasesUsed]);

  const scheduleRestart = useCallback(() => {
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => {
      runningRef.current = false;
      if (!allPhrasesUsed() && enabledRef.current) {
        startRecognition();
      }
    }, RESTART_MS);
  }, [allPhrasesUsed, startRecognition]);

  scheduleRestartRef.current = scheduleRestart;

  const stopListening = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    runningRef.current = false;
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
  }, []);

  const applyPhrase = useCallback(
    (phraseId: VoicePhraseId) => {
      if (usedPhrasesRef.current.has(phraseId)) return false;

      usedPhrasesRef.current.add(phraseId);
      saveUsedVoicePhrases(usedPhrasesRef.current);
      bufferRef.current = "";

      logVoiceSpeech("boost", {
        phraseId,
        used: [...usedPhrasesRef.current],
        remaining: ALL_PHRASES.filter((id) => !usedPhrasesRef.current.has(id)),
      });

      onBoostRef.current(phraseId);

      // Keep mic alive for the second phrase (browser often stops after a match)
      runningRef.current = false;
      if (!allPhrasesUsed()) {
        scheduleRestartRef.current();
      }

      return true;
    },
    [allPhrasesUsed]
  );

  const checkTexts = useCallback(
    (texts: string[], opts?: { finalsOnly?: boolean }) => {
      let matchedAny = false;
      const finalsOnly = opts?.finalsOnly ?? false;

      for (const text of texts) {
        if (!text.trim()) continue;
        const matches = matchAllVoicePhrases(text, usedPhrasesRef.current);
        logVoiceSpeech("check", { text, matches, finalsOnly });
        for (const id of matches) {
          if (applyPhrase(id)) matchedAny = true;
        }
      }

      if (finalsOnly) return matchedAny;

      const combined = texts.join(" ").trim();
      if (combined) {
        bufferRef.current = `${bufferRef.current} ${combined}`
          .trim()
          .slice(-BUFFER_MAX);

        const bufferMatches = matchAllVoicePhrases(
          bufferRef.current,
          usedPhrasesRef.current
        ).filter((id) => id !== "baby");

        if (bufferMatches.length > 0) {
          logVoiceSpeech("check buffer", {
            buffer: bufferRef.current,
            matches: bufferMatches,
          });
        }
        for (const id of bufferMatches) {
          if (applyPhrase(id)) matchedAny = true;
        }
      }

      return matchedAny;
    },
    [applyPhrase]
  );

  useEffect(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) return;

    const safari = isSafari();
    recognition.continuous = !safari;
    recognition.interimResults = true;
    recognition.lang = speechRecognitionLang();
    recognition.maxAlternatives = 5;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (allPhrasesUsed()) return;

      logTranscriptsFromEvent(event);

      const finalTexts: string[] = [];
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const slice: string[] = [];
          for (let k = Math.max(0, i - 4); k <= i; k++) {
            const t = event.results[k][0]?.transcript?.trim();
            if (t) slice.push(t);
          }
          finalTexts.push(...slice);
          checkTexts(slice, { finalsOnly: true });
          const joinedFinal = slice.join(" ").trim();
          if (joinedFinal) {
            checkTexts([joinedFinal], { finalsOnly: true });
          }
        }
      }

      const interimTexts = collectTranscriptsFromEvent(event).filter(
        (t) => !finalTexts.includes(t)
      );
      if (interimTexts.length > 0) {
        checkTexts(interimTexts, { finalsOnly: false });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      runningRef.current = false;
      logVoiceSpeech("error", { code: event.error, message: event.message });
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        stopListening();
        return;
      }
      if (enabledRef.current && !allPhrasesUsed()) {
        scheduleRestartRef.current();
      }
    };

    recognition.onstart = () => {
      runningRef.current = true;
      logVoiceSpeech("mic started", { lang: recognition.lang });
    };

    recognition.onend = () => {
      runningRef.current = false;
      logVoiceSpeech("mic paused", {
        willRestart: enabledRef.current && !allPhrasesUsed(),
        used: [...usedPhrasesRef.current],
      });
      if (enabledRef.current && !allPhrasesUsed()) {
        scheduleRestartRef.current();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      stopListening();
      recognitionRef.current = null;
    };
  }, [allPhrasesUsed, checkTexts, stopListening]);

  useEffect(() => {
    if (!options.enabled || allPhrasesUsed()) {
      stopListening();
      return;
    }

    if (isSafari() && !gestureStartedRef.current) return;

    startRecognition();
  }, [options.enabled, allPhrasesUsed, startRecognition, stopListening]);

  const activateFromGesture = useCallback(() => {
    if (allPhrasesUsed()) return;
    gestureStartedRef.current = true;
    runningRef.current = false;
    startRecognition(true);
  }, [allPhrasesUsed, startRecognition]);

  return { activateFromGesture };
}
