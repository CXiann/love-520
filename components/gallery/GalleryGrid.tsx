"use client";

import { AnimatePresence } from "framer-motion";
import { GalleryTile } from "./GalleryTile";
import type { GalleryItemData } from "./useGalleryQuest";

type GalleryGridProps = {
  items: GalleryItemData[];
  swipeEnabled: boolean;
  onTrashDecoy: (id: string) => void;
  onKeeperReject: () => void;
  onOpenLightbox: (item: GalleryItemData) => void;
};

export function GalleryGrid({
  items,
  swipeEnabled,
  onTrashDecoy,
  onKeeperReject,
  onOpenLightbox,
}: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-muted">
        No photos here yet — add some from admin.
      </p>
    );
  }

  return (
    <div className="mx-auto columns-3 gap-3 sm:columns-4 md:columns-5 lg:max-w-4xl lg:columns-6">
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <GalleryTile
            key={item.id}
            item={item}
            index={i}
            swipeEnabled={swipeEnabled}
            onTrash={onTrashDecoy}
            onKeeperReject={onKeeperReject}
            onOpenLightbox={onOpenLightbox}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
