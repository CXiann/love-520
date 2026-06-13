import fs from "node:fs";
import path from "node:path";
import type { FilmStripSlide } from "./chapter-eggs";
import { FAVORITE_UPLOAD_PREFIX } from "./favorite-upload-path";

const FAVORITE_DIR = path.join(process.cwd(), "public/uploads/favorite");

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

/** Filenames in public/uploads/favorite (sorted 1, 2, 3 …) */
export function listFavoriteImageFiles(): string[] {
  if (!fs.existsSync(FAVORITE_DIR)) return [];
  return fs
    .readdirSync(FAVORITE_DIR)
    .filter((name) => IMAGE_EXT.test(name))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );
}

/** Public URLs for every image in uploads/favorite (server only) */
export function getFavoriteImageUrls(): string[] {
  return listFavoriteImageFiles().map(
    (name) => `${FAVORITE_UPLOAD_PREFIX}/${name}`
  );
}

/** Server-side: build slides from whatever files exist in uploads/favorite */
export function buildDefaultFavoriteGameSlides(): FilmStripSlide[] {
  const urls = getFavoriteImageUrls();
  if (urls.length === 0) {
    return [];
  }
  return urls.map((imageUrl, i) => {
    const base =
      imageUrl.split("/").pop()?.replace(/\.[^.]+$/, "") ?? String(i + 1);
    return {
      id: `favorite-${base}`,
      imageUrl,
      caption: `Moment ${i + 1}`,
    };
  });
}
