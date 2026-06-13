"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveMusicEmbed } from "@/lib/music-url";

type MusicToggleProps = {
  musicUrl?: string | null;
};

type PlayerView = "closed" | "mini" | "player";

export function MusicToggle({ musicUrl }: MusicToggleProps) {
  const [view, setView] = useState<PlayerView>("closed");
  const [prompted, setPrompted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const embed = useMemo(
    () => (musicUrl ? resolveMusicEmbed(musicUrl) : null),
    [musicUrl]
  );

  const stopAudio = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setAudioPlaying(false);
  }, []);

  const closeAll = useCallback(() => {
    stopAudio();
    setView("closed");
  }, [stopAudio]);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  if (!embed) return null;

  const isAudio = embed.kind === "audio";
  const panelOpen = view === "player";
  const miniOpen = view === "mini";

  async function toggleMainButton() {
    setPrompted(true);

    if (isAudio) {
      const el = audioRef.current;
      if (!el) return;

      if (audioPlaying) {
        stopAudio();
        setView("closed");
        return;
      }

      try {
        await el.play();
        setAudioPlaying(true);
        setView("mini");
      } catch {
        setView("player");
      }
      return;
    }

    if (view === "player") {
      setView("mini");
    } else if (view === "mini") {
      setView("player");
    } else {
      setView("player");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5 }}
      className="fixed bottom-4 right-4 z-50 flex max-w-[min(100vw-2rem,280px)] flex-col items-end gap-2 sm:bottom-6 sm:right-6"
    >
      {isAudio && (
        <audio
          ref={audioRef}
          src={embed.embedUrl}
          preload="metadata"
          className="hidden"
          onPlay={() => setAudioPlaying(true)}
          onPause={() => setAudioPlaying(false)}
        />
      )}

      <AnimatePresence mode="wait">
        {miniOpen && (
          <motion.div
            key="mini"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="flex items-center gap-2 rounded-full border border-accent/25 bg-surface-elevated/95 py-1.5 pl-3 pr-1.5 text-xs shadow-lg backdrop-blur-md"
          >
            <span className="text-accent">
              {isAudio && audioPlaying ? "♪ Playing" : "♫ Our song"}
            </span>
            {!isAudio && (
              <button
                type="button"
                onClick={() => setView("player")}
                className="rounded-full px-2 py-1 text-muted transition hover:text-accent"
              >
                Show
              </button>
            )}
            {isAudio && (
              <button
                type="button"
                onClick={() => setView("player")}
                className="rounded-full px-2 py-1 text-muted transition hover:text-accent"
              >
                Controls
              </button>
            )}
            <button
              type="button"
              onClick={closeAll}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-accent/10 hover:text-accent"
              aria-label="Stop music"
            >
              ×
            </button>
          </motion.div>
        )}

        {panelOpen && (
          <motion.div
            key="player"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="w-[min(100vw-2rem,260px)] overflow-hidden rounded-xl border border-accent/20 bg-surface-elevated/95 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-accent/10 px-3 py-2">
              <span className="text-xs uppercase tracking-wider text-muted">
                Our song
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setView("mini")}
                  className="rounded px-2 py-0.5 text-xs text-muted transition hover:text-accent"
                >
                  Minimize
                </button>
                <button
                  type="button"
                  onClick={closeAll}
                  className="rounded px-2 py-0.5 text-xs text-muted transition hover:text-accent"
                  aria-label="Close player"
                >
                  ×
                </button>
              </div>
            </div>

            {embed.kind === "spotify" && (
              <iframe
                src={embed.embedUrl}
                width="260"
                height="80"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Our song"
                className="block w-full border-0"
              />
            )}
            {embed.kind === "youtube" && (
              <div className="relative aspect-video w-full bg-black/40">
                <iframe
                  src={embed.embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  title="Our song"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            )}
            {embed.kind === "audio" && (
              <motion.div className="space-y-2 p-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void audioRef.current?.play()}
                    className="flex-1 rounded-full border border-accent/30 py-2 text-xs text-accent hover:bg-accent/10"
                  >
                    Play
                  </button>
                  <button
                    type="button"
                    onClick={() => audioRef.current?.pause()}
                    className="flex-1 rounded-full border border-accent/30 py-2 text-xs text-accent hover:bg-accent/10"
                  >
                    Pause
                  </button>
                </div>
                <p className="text-[10px] leading-snug text-muted">
                  Tap Minimize to keep listening while you scroll.
                </p>
              </motion.div>
            )}
            {embed.kind === "youtube" && (
              <p className="px-3 pb-2 text-[10px] leading-snug text-muted">
                YouTube must stay visible while playing. Use an MP3 in admin for
                background audio.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggleMainButton}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition hover:scale-105 ${
          audioPlaying || view === "player"
            ? "border-accent bg-accent/20 text-accent"
            : "border-accent/30 bg-surface-elevated/90 text-accent hover:border-accent"
        }`}
        aria-label={
          isAudio
            ? audioPlaying
              ? "Pause our song"
              : "Play our song in background"
            : view === "player"
              ? "Minimize music player"
              : "Open music player"
        }
      >
        {isAudio && audioPlaying ? "♪" : view === "player" ? "▾" : "♫"}
      </button>

      {!prompted && view === "closed" && (
        <span className="pointer-events-none absolute -top-7 right-0 whitespace-nowrap text-xs text-muted">
          Our song
        </span>
      )}
    </motion.div>
  );
}
