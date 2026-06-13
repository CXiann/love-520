"use client";

import { useState } from "react";
import { FadeIn } from "../Section";
import {
  isChapter1VoiceReadyFromStorage,
  markChapter1VoiceReadyStorage,
} from "@/lib/chapter-voice";
import { TOPIC1_VIDEO, TOPIC1_VIDEO_POSTER } from "@/lib/seed-images";
import { mediaSrc } from "@/lib/media-src";
import { ChapterVideoPlayer } from "./ChapterVideoPlayer";
import { ChapterForeverVoiceInvite } from "./ChapterForeverVoiceInvite";

type ChapterTopic1Props = {
  topicLabel: string;
  title: string;
  copy: string;
  videoUrl?: string | null;
  posterUrl?: string | null;
};

export function ChapterTopic1({
  topicLabel,
  title,
  copy,
  videoUrl,
  posterUrl,
}: ChapterTopic1Props) {
  const [voiceReady, setVoiceReady] = useState(false);

  const src = videoUrl?.trim() || TOPIC1_VIDEO;
  const poster =
    mediaSrc(posterUrl?.trim()) ?? mediaSrc(TOPIC1_VIDEO_POSTER);

  const handleMomentsComplete = () => {
    markChapter1VoiceReadyStorage();
    setVoiceReady(true);
  };

  const ready = voiceReady || isChapter1VoiceReadyFromStorage();

  return (
    <div className="relative min-h-screen bg-background px-6 py-24 md:px-12">
      <FadeIn className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          {topicLabel}
        </p>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">{title}</h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/90">
          {copy}
        </p>

        <div className="mt-10">
          <ChapterVideoPlayer
            videoUrl={src}
            posterUrl={poster}
            enableHeartMoments
            onHeartMomentsComplete={handleMomentsComplete}
          />
        </div>

        <ChapterForeverVoiceInvite visible={ready} />
      </FadeIn>
    </div>
  );
}
