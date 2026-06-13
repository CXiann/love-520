"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Section, FadeIn } from "../Section";
import { ChapterHighlightQuest } from "./ChapterHighlightQuest";
import { ChapterBabyDuet } from "./ChapterBabyDuet";
import { ChapterTopic1 } from "./ChapterTopic1";
import { parseChapter2FavoriteGame } from "@/lib/chapter2-favorite-game";
import {
  CHAPTER2_VOICE_READY,
  dispatchChapter2VoiceReady,
} from "@/lib/game-events";
import {
  isChapter2VoiceReadyFromStorage,
  markChapter2VoiceReadyStorage,
} from "@/lib/chapter-voice";

export type ChapterSectionProps = {
  id: "chapter1" | "chapter2";
  topicLabel: string;
  title: string;
  copy: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  warm?: boolean;
  chapter2FilmStripJson?: string | null;
  partnerName?: string;
  yourName?: string;
};

export function ChapterSection({
  id,
  topicLabel,
  title,
  copy,
  imageUrl,
  videoUrl,
  videoPosterUrl,
  warm = false,
  chapter2FilmStripJson,
  partnerName = "",
  yourName = "",
}: ChapterSectionProps) {
  const [duetReady, setDuetReady] = useState(false);

  useEffect(() => {
    setDuetReady(isChapter2VoiceReadyFromStorage());
  }, []);

  useEffect(() => {
    function onReady() {
      markChapter2VoiceReadyStorage();
      setDuetReady(true);
    }
    window.addEventListener(CHAPTER2_VOICE_READY, onReady);
    return () => window.removeEventListener(CHAPTER2_VOICE_READY, onReady);
  }, []);

  const handleHighlightsReady = () => {
    markChapter2VoiceReadyStorage();
    setDuetReady(true);
    dispatchChapter2VoiceReady();
  };

  if (id === "chapter1") {
    return (
      <Section id={id} className="overflow-hidden p-0">
        <ChapterTopic1
          topicLabel={topicLabel}
          title={title}
          copy={copy}
          videoUrl={videoUrl}
          posterUrl={videoPosterUrl}
        />
      </Section>
    );
  }

  return (
    <ChapterTopic2
      id={id}
      topicLabel={topicLabel}
      title={title}
      imageUrl={imageUrl}
      warm={warm}
      chapter2FilmStripJson={chapter2FilmStripJson}
      videoUrl={videoUrl}
      videoPosterUrl={videoPosterUrl}
      partnerName={partnerName}
      yourName={yourName}
      duetReady={duetReady}
      onHighlightsReady={handleHighlightsReady}
    />
  );
}

function ChapterTopic2({
  id,
  topicLabel,
  title,
  imageUrl,
  videoUrl,
  videoPosterUrl,
  warm,
  chapter2FilmStripJson,
  partnerName,
  yourName,
  duetReady,
  onHighlightsReady,
}: {
  id: string;
  topicLabel: string;
  title: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  warm?: boolean;
  chapter2FilmStripJson?: string | null;
  partnerName: string;
  yourName: string;
  duetReady: boolean;
  onHighlightsReady: () => void;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const textY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const favoriteGame = parseChapter2FavoriteGame(chapter2FilmStripJson);

  return (
    <Section
      id={id}
      className={`overflow-hidden p-0 ${warm ? "bg-surface/50" : ""}`}
    >
      <motion.div ref={ref} className="relative min-h-screen">
        {imageUrl && (
          <motion.div style={{ y: imageY }} className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover ken-burns opacity-40"
              sizes="100vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          </motion.div>
        )}

        <motion.div
          style={{ y: textY }}
          className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-28 md:px-16"
        >
          <FadeIn className="pointer-events-auto mx-auto w-full max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-accent">
              {topicLabel}
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl">{title}</h2>

            <div className="mt-8 max-w-2xl">
              <ChapterHighlightQuest
                game={favoriteGame}
                onVoiceReady={onHighlightsReady}
              />
              {duetReady && (
                <ChapterBabyDuet
                  yourName={yourName}
                  partnerName={partnerName}
                />
              )}
            </div>
          </FadeIn>
        </motion.div>
      </motion.div>
    </Section>
  );
}
