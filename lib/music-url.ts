export type MusicEmbedKind = "spotify" | "youtube" | "audio";

export type MusicEmbed = {
  kind: MusicEmbedKind;
  embedUrl: string;
  youtubeId?: string;
};

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const shorts = parsed.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts) return shorts[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

/** Normalize admin paste (watch, youtu.be, embed, Spotify, or MP3) for the player. */
export function resolveMusicEmbed(musicUrl: string): MusicEmbed | null {
  const trimmed = musicUrl.trim();
  if (!trimmed) return null;

  if (trimmed.includes("spotify.com")) {
    const embed = trimmed.includes("/embed/")
      ? trimmed
      : trimmed.replace(
          "open.spotify.com/track/",
          "open.spotify.com/embed/track/"
        );
    return { kind: "spotify", embedUrl: embed };
  }

  const youtubeId = extractYouTubeId(trimmed);
  if (youtubeId) {
    return {
      kind: "youtube",
      embedUrl: buildYouTubeEmbedUrl(youtubeId),
      youtubeId,
    };
  }

  if (/\.(mp3|ogg|wav|m4a)(\?|$)/i.test(trimmed) || trimmed.startsWith("/")) {
    return { kind: "audio", embedUrl: trimmed };
  }

  if (trimmed.startsWith("http")) {
    return { kind: "audio", embedUrl: trimmed };
  }

  return null;
}
