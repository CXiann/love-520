/** Read a usable duration from HTMLVideoElement (handles MOV/Infinity quirks). */
export function resolveVideoDuration(video: HTMLVideoElement): number {
  const d = video.duration;
  if (Number.isFinite(d) && d > 0) return d;

  if (video.seekable.length > 0) {
    const end = video.seekable.end(video.seekable.length - 1);
    if (Number.isFinite(end) && end > 0) return end;
  }

  if (video.buffered.length > 0) {
    const end = video.buffered.end(video.buffered.length - 1);
    if (Number.isFinite(end) && end > 0) return end;
  }

  return 0;
}

/** Safari/Chrome sometimes report Infinity until we seek to the end. */
export function probeInfinityDuration(
  video: HTMLVideoElement
): Promise<number> {
  if (video.duration !== Infinity) {
    return Promise.resolve(resolveVideoDuration(video));
  }

  return new Promise((resolve) => {
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onFail);
    };

    const onFail = () => {
      cleanup();
      resolve(resolveVideoDuration(video));
    };

    const savedTime = video.currentTime;

    const onSeeked = () => {
      const d = resolveVideoDuration(video);
      try {
        video.currentTime = savedTime;
      } catch {
        /* ignore restore errors */
      }
      cleanup();
      resolve(d);
    };

    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onFail, { once: true });

    try {
      video.currentTime = 1e10;
    } catch {
      cleanup();
      resolve(0);
    }
  });
}
