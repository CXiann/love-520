"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildChapter1MomentTimes,
  CHAPTER1_MOMENT_COUNT,
  CHAPTER1_MOMENT_RATIOS,
  formatVideoTime,
} from "@/lib/chapter1-video-moments";
import {
  isChapter1VoiceReadyFromStorage,
  markChapter1VoiceReadyStorage,
} from "@/lib/chapter-voice";
import { mediaSrc } from "@/lib/media-src";
import {
  probeInfinityDuration,
  resolveVideoDuration,
} from "@/lib/video-duration";

type ChapterVideoPlayerProps = {
  videoUrl: string;
  posterUrl?: string | null;
  onProgress?: (ratio: number) => void;
  onEnded?: () => void;
  onPlayingChange?: (playing: boolean) => void;
  enableHeartMoments?: boolean;
  onHeartMomentsComplete?: () => void;
};

export function ChapterVideoPlayer({
  videoUrl,
  posterUrl,
  onProgress,
  onEnded,
  onPlayingChange,
  enableHeartMoments = false,
  onHeartMomentsComplete,
}: ChapterVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const probedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const playingRef = useRef(false);
  const maxSeenTimeRef = useRef(0);
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  const onPlayingChangeRef = useRef(onPlayingChange);
  const onHeartMomentsCompleteRef = useRef(onHeartMomentsComplete);

  useEffect(() => {
    onProgressRef.current = onProgress;
    onEndedRef.current = onEnded;
    onPlayingChangeRef.current = onPlayingChange;
    onHeartMomentsCompleteRef.current = onHeartMomentsComplete;
  });
  const [maxSeenTime, setMaxSeenTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [momentsDone, setMomentsDone] = useState(false);
  const [showIntroPlay, setShowIntroPlay] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);

  const useRatioTimeline = duration <= 0;

  const momentTimes = useMemo(
    () => buildChapter1MomentTimes(duration),
    [duration]
  );

  const progressRatio = useMemo(() => {
    if (duration > 0) return Math.min(1, currentTime / duration);
    if (maxSeenTime > 0) return Math.min(1, currentTime / maxSeenTime);
    return 0;
  }, [duration, currentTime, maxSeenTime]);

  useEffect(() => {
    probedRef.current = false;
    hasStartedRef.current = false;
    maxSeenTimeRef.current = 0;
    setMaxSeenTime(0);
    playingRef.current = false;
    setPlaying(false);
    setError(null);
    setReady(false);
    setDuration(0);
    setCurrentTime(0);
    setShowIntroPlay(true);
    setHasPlayed(false);
    onPlayingChangeRef.current?.(false);
  }, [videoUrl]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      /* ignore */
    }
  }, [videoUrl, posterUrl]);

  useEffect(() => {
    if (!enableHeartMoments) return;
    if (isChapter1VoiceReadyFromStorage()) {
      setMomentsDone(true);
      setTapped(new Set([0, 1, 2, 3, 4]));
    }
  }, [enableHeartMoments]);

  const applyDuration = useCallback((d: number) => {
    if (d > 0) setDuration(d);
  }, []);

  const refreshDuration = useCallback(
    async (v: HTMLVideoElement) => {
      let d = resolveVideoDuration(v);
      if (
        d <= 0 &&
        v.duration === Infinity &&
        !probedRef.current &&
        v.paused
      ) {
        probedRef.current = true;
        d = await probeInfinityDuration(v);
      }
      if (d > 0) applyDuration(d);
      return d;
    },
    [applyDuration]
  );

  const setPlayState = useCallback((next: boolean) => {
    playingRef.current = next;
    setPlaying(next);
    onPlayingChangeRef.current?.(next);
  }, []);

  const syncFromVideo = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    if (v.readyState >= 2) setReady(true);

    const t = v.currentTime;
    if (t > maxSeenTimeRef.current) {
      maxSeenTimeRef.current = t;
      setMaxSeenTime(t);
    }
    setCurrentTime(t);

    const playingNow = !v.paused && !v.ended;
    if (playingRef.current !== playingNow) {
      setPlayState(playingNow);
    }

    const d = resolveVideoDuration(v);
    if (d > 0) {
      applyDuration(d);
      onProgressRef.current?.(t / d);
    } else if (t > 0 && maxSeenTimeRef.current > 0) {
      onProgressRef.current?.(
        Math.min(1, t / maxSeenTimeRef.current)
      );
    }
  }, [applyDuration, setPlayState]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onMeta = () => {
      setReady(true);
      void refreshDuration(v);
      syncFromVideo();
    };

    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("durationchange", onMeta);
    v.addEventListener("loadeddata", onMeta);
    v.addEventListener("canplay", onMeta);

    if (v.readyState >= 1) onMeta();

    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("durationchange", onMeta);
      v.removeEventListener("loadeddata", onMeta);
      v.removeEventListener("canplay", onMeta);
    };
  }, [videoUrl, refreshDuration, syncFromVideo]);

  const tryPlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    setError(null);
    setReady(true);
    setShowIntroPlay(false);
    setHasPlayed(true);
    hasStartedRef.current = true;
    try {
      v.preload = "metadata";
      await v.play();
      setPlayState(true);
      if (duration <= 0) await refreshDuration(v);
      syncFromVideo();
    } catch {
      setPlayState(false);
      setError("Tap play to start the film.");
    }
  }, [setPlayState, refreshDuration, syncFromVideo, duration]);

  const togglePlay = useCallback(
    (e?: React.SyntheticEvent) => {
      e?.stopPropagation();
      const v = videoRef.current;
      if (!v) return;

      if (v.paused) {
        void tryPlay();
      } else {
        v.pause();
        setPlayState(false);
      }
    },
    [tryPlay, setPlayState]
  );

  const effectiveDuration =
    duration > 0 ? duration : maxSeenTime > 0 ? maxSeenTime : 0;

  const seekTo = useCallback(
    (ratio: number) => {
      const v = videoRef.current;
      if (!v) return;
      const d = resolveVideoDuration(v) || maxSeenTime;
      if (d <= 0) return;
      v.currentTime = ratio * d;
      syncFromVideo();
    },
    [syncFromVideo, maxSeenTime]
  );

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      seekTo(ratio);
    },
    [seekTo]
  );

  const isMomentUnlocked = useCallback(
    (index: number) => {
      if (useRatioTimeline) {
        const target = CHAPTER1_MOMENT_RATIOS[index];
        return progressRatio >= target - 0.02 || progressRatio >= 0.995;
      }
      const target = momentTimes[index];
      if (target === undefined) return false;
      return currentTime >= target - 0.35 || progressRatio >= 0.995;
    },
    [useRatioTimeline, momentTimes, currentTime, progressRatio]
  );

  const tapMoment = useCallback(
    (index: number) => {
      if (momentsDone || !enableHeartMoments || tapped.has(index)) return;
      if (!isMomentUnlocked(index)) return;
      setTapped((prev) => {
        const next = new Set([...prev, index]);
        if (next.size >= CHAPTER1_MOMENT_COUNT) {
          setMomentsDone(true);
          markChapter1VoiceReadyStorage();
          onHeartMomentsCompleteRef.current?.();
        }
        return next;
      });
    },
    [momentsDone, enableHeartMoments, tapped, isMomentUnlocked]
  );

  const showHeartsOnBar = enableHeartMoments && (duration > 0 || ready);
  const isMov = /\.mov($|\?)/i.test(videoUrl);
  const posterSrc = mediaSrc(posterUrl);
  const showPosterCover = Boolean(posterSrc && !hasPlayed);
  const mediaClass =
    "block h-[min(72vh,820px)] w-auto max-w-full object-contain";

  return (
    <div className="mx-auto w-full max-w-3xl" data-lenis-prevent>
      <div
        className="relative mx-auto w-fit max-w-full overflow-hidden rounded-lg border border-accent/25 bg-black/50 shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        onClick={() => {
          if (showIntroPlay) return;
          togglePlay();
        }}
      >
        <div className="relative">
          {showPosterCover && !error && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterSrc}
              alt=""
              className={`${mediaClass} relative z-[1]`}
            />
          )}
          <video
            key={`${videoUrl}::${posterSrc ?? ""}`}
            ref={videoRef}
            className={`${mediaClass} ${
              showPosterCover
                ? "pointer-events-none absolute inset-0 z-0 mx-auto h-full w-full opacity-0"
                : "relative z-[1]"
            }`}
            src={videoUrl}
            playsInline
            preload={hasPlayed ? "metadata" : "none"}
          onLoadedData={() => {
            setReady(true);
            syncFromVideo();
          }}
          onCanPlay={() => {
            setReady(true);
            const v = videoRef.current;
            if (v && duration <= 0) void refreshDuration(v);
          }}
          onPlay={() => {
            hasStartedRef.current = true;
            setHasPlayed(true);
            setShowIntroPlay(false);
            setPlayState(true);
            setError(null);
          }}
          onPause={() => setPlayState(false)}
          onTimeUpdate={syncFromVideo}
          onDurationChange={syncFromVideo}
          onEnded={() => {
            setPlayState(false);
            syncFromVideo();
            onEndedRef.current?.();
            onProgressRef.current?.(1);
          }}
          onError={() => {
            setReady(true);
            setPlayState(false);
            setError("This video couldn't load — try refreshing the page.");
          }}
        >
          <source
            src={videoUrl}
            type={isMov ? "video/quicktime" : "video/mp4"}
          />
          </video>
        </div>

        {showIntroPlay && !error && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void tryPlay();
            }}
            className="absolute inset-0 z-[2] flex items-center justify-center bg-gradient-to-t from-black/40 via-transparent to-transparent transition hover:from-black/50"
            aria-label="Play video"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/50 bg-background/75 text-2xl text-accent shadow-[0_0_32px_rgba(232,160,180,0.35)] backdrop-blur-sm">
              ▶
            </span>
          </button>
        )}

        {error && (
          <div className="absolute inset-x-0 bottom-14 z-[3] bg-background/90 px-4 py-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <div
          data-video-controls
          className="absolute inset-x-0 bottom-0 z-[4] bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 pb-3 pt-12"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={trackRef}
            role="slider"
            aria-label="Video progress"
            aria-valuemin={0}
            aria-valuemax={effectiveDuration || 100}
            aria-valuenow={currentTime}
            tabIndex={0}
            className="group relative h-8 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              seekFromClientX(e.clientX);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "ArrowRight")
                seekTo(Math.min(1, progressRatio + 0.02));
              if (e.key === "ArrowLeft")
                seekTo(Math.max(0, progressRatio - 0.02));
            }}
          >
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15" />
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent/80 transition-[width] duration-150"
              style={{ width: `${progressRatio * 100}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent shadow-md transition-[left] duration-150"
              style={{ left: `calc(${progressRatio * 100}% - 6px)` }}
            />

            {showHeartsOnBar &&
              CHAPTER1_MOMENT_RATIOS.map((ratio, index) => {
                const pct = ratio * 100;
                const unlocked = isMomentUnlocked(index);
                const collected = tapped.has(index);
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={momentsDone || collected || !unlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      tapMoment(index);
                    }}
                    className={`absolute top-1/2 z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-xs transition ${
                      collected
                        ? "border-accent/20 bg-accent/30 text-accent/50"
                        : unlocked
                          ? "border-accent bg-background/90 text-accent shadow-md hover:scale-110"
                          : "border-white/20 bg-black/40 text-white/35"
                    }`}
                    style={{ left: `${pct}%` }}
                    aria-label="Collect this moment"
                  >
                    ♥
                  </button>
                );
              })}
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 text-xs text-white/85">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm transition hover:border-accent/50 hover:bg-accent/20"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            {duration > 0 && (
              <span className="tabular-nums tracking-wide">
                {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
