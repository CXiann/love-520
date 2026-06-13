import type { FilmStripSlide } from "./chapter-eggs";
import { FAVORITE_UPLOAD_PREFIX } from "./favorite-upload-path";
import { parseChapter2FavoriteGame } from "./chapter2-favorite-game";

/** Matches public/uploads/favorite/1.jpeg … 15.jpeg */
const FAVORITE_IMAGE_COUNT = 15;

export const DEFAULT_CHAPTER2_HIGHLIGHT_SLIDES: FilmStripSlide[] = Array.from(
  { length: FAVORITE_IMAGE_COUNT },
  (_, i) => ({
    id: `favorite-${i + 1}`,
    imageUrl: `${FAVORITE_UPLOAD_PREFIX}/${i + 1}.jpeg`,
    caption: `Moment ${i + 1}`,
  })
);

/** @deprecated Use parseChapter2FavoriteGame */
export function resolveChapter2FilmSlides(
  json: string | null | undefined
): FilmStripSlide[] {
  return parseChapter2FavoriteGame(json).slides;
}
