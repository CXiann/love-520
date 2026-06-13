"use client";

type GalleryQuestHUDProps = {
  complete: boolean;
};

export function GalleryQuestHUD({ complete }: GalleryQuestHUDProps) {
  if (complete) return null;

  return (
    <p className="mt-3 text-sm text-muted" aria-live="polite">
      Swipe right on a photo to drop it · tap to look closer first
    </p>
  );
}
