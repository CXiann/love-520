/** Unsplash IDs verified reachable (others in old seed return 404) */
function unsplash(photoId: string, width = 1920) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Memory babies on the shelf — files in public/uploads/ */
/** Shown after the secret is unlocked */
export const SECRET_POTTERY_TICKET = "/uploads/pottery-ticket.jpeg";

/** First celebration — public/uploads/video-2.mp4.mov */
export const TOPIC1_VIDEO = "/uploads/video-2.mp4.mov";

/** Poster shown before the First celebration video plays */
export const TOPIC1_VIDEO_POSTER = "/uploads/thumbnail.jpeg?v=3";

/** Shown after all five shelf babies are unlocked */
export const FULL_BABIES_IMAGE = "/uploads/full-babies.jpeg";

export const COMPANION_IMAGES = [
  "/uploads/companion-1.jpeg",
  "/uploads/companion-2.jpeg",
  "/uploads/companion-3.jpeg",
  "/uploads/companion-4.jpeg",
  "/uploads/companion-5.jpeg",
] as const;

export const SEED_IMAGES = {
  hero: unsplash("1492684223066-81342ee5ff30"),
  chapter1: unsplash("1500530855697-b586d89ba3ee"),
  chapter2: unsplash("1441974231531-c6227db76b6e"),
  companions: COMPANION_IMAGES,
  gallery: [
    unsplash("1492684223066-81342ee5ff30", 800),
    unsplash("1470225620780-dba8ba36b745", 800),
    unsplash("1500530855697-b586d89ba3ee", 800),
    unsplash("1441974231531-c6227db76b6e", 800),
    unsplash("1492684223066-81342ee5ff30", 800),
    unsplash("1470225620780-dba8ba36b745", 800),
  ],
} as const;
