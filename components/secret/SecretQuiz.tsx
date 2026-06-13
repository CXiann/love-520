"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import type { QuizQuestion } from "@/lib/secret-types";

type SecretQuizProps = {
  questions: QuizQuestion[];
  onComplete: () => void;
};

export function SecretQuiz({ questions, onComplete }: SecretQuizProps) {
  const [index, setIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const current = questions[index];
  const isLast = index >= questions.length - 1;

  if (questions.length === 0) {
    return null;
  }

  function handleAnswer(optionIndex: number) {
    if (feedback || !current) return;

    if (optionIndex === current.answerIndex) {
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        if (isLast) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.5 },
            colors: ["#e8a0b4", "#f5f0eb", "#c4788e"],
          });
          setTimeout(onComplete, 600);
        } else {
          setIndex((i) => i + 1);
        }
      }, 500);
    } else {
      const nextWrong = wrongCount + 1;
      setWrongCount(nextWrong);
      setFeedback(current.wrongReply || "Not quite — try again!");
      if (nextWrong >= 2) setShowHint(true);
      setTimeout(() => setFeedback(null), 2200);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <p className="text-center text-sm uppercase tracking-[0.3em] text-accent">
          Question {index + 1} of {questions.length}
        </p>
        <h2 className="mt-4 text-center font-display text-2xl md:text-3xl">
          {current.question}
        </h2>

        <div className="mt-10 space-y-3">
          {current.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(i)}
              disabled={!!feedback}
              className="w-full rounded-lg border border-accent/30 bg-surface-elevated px-4 py-3 text-left transition hover:border-accent hover:bg-accent/10 disabled:opacity-60"
            >
              {opt}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {feedback && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-6 text-center text-sm ${
                feedback === "correct" ? "text-accent" : "text-muted"
              }`}
            >
              {feedback === "correct" ? "That's us ♥" : feedback}
            </motion.p>
          )}
        </AnimatePresence>

        {showHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-xs text-accent/80"
          >
            Hint: pick the answer that sounds most like us.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
