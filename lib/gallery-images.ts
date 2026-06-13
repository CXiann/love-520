import fs from "node:fs";
import path from "node:path";

const GALLERY_DIR = path.join(
  process.cwd(),
  "public/uploads/gallery-images"
);

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

/** Filenames in public/uploads/gallery-images (sorted 1, 2, 3 … 10, 12 …) */
export function listGalleryImageFiles(): string[] {
  if (!fs.existsSync(GALLERY_DIR)) return [];
  return fs
    .readdirSync(GALLERY_DIR)
    .filter((name) => IMAGE_EXT.test(name))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
    );
}

/** Public URLs for every image in gallery-images */
export function getGalleryImageUrls(): string[] {
  return listGalleryImageFiles().map(
    (name) => `/uploads/gallery-images/${name}`
  );
}
