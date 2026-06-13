"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { dollEase, dollEnter } from "../dolls/doll-motion";
import type { GalleryItemData } from "./useGalleryQuest";

const TRASH_ANIM_MS = 700;
const SWIPE_THROW_OFFSET = 56;
const SWIPE_THROW_VELOCITY = 280;

type GalleryTileProps = {
  item: GalleryItemData;
  index: number;
  swipeEnabled: boolean;
  onTrash: (id: string) => void;
  onKeeperReject: () => void;
  onOpenLightbox: (item: GalleryItemData) => void;
};

export function GalleryTile({
  item,
  index,
  swipeEnabled,
  onTrash,
  onKeeperReject,
  onOpenLightbox,
}: GalleryTileProps) {
  const reducedMotion = useReducedMotion();
  const [flying, setFlying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trashedRef = useRef(false);
  const draggedRef = useRef(false);

  const isDecoy = Boolean(item.isDecoy);
  const canDrag = swipeEnabled && !flying;

  const throwDecoy = useCallback(() => {
    if (flying || trashedRef.current || !isDecoy) return;
    trashedRef.current = true;
    setFlying(true);
    const delay = reducedMotion ? 0 : TRASH_ANIM_MS;
    window.setTimeout(() => {
      onTrash(item.id);
    }, delay);
  }, [flying, item.id, isDecoy, onTrash, reducedMotion]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      setDragging(false);
      const thrown =
        info.offset.x >= SWIPE_THROW_OFFSET ||
        info.velocity.x >= SWIPE_THROW_VELOCITY;

      if (!thrown) {
        window.setTimeout(() => {
          draggedRef.current = false;
        }, 50);
        return;
      }

      if (isDecoy) {
        throwDecoy();
      } else {
        onKeeperReject();
      }
      window.setTimeout(() => {
        draggedRef.current = false;
      }, 50);
    },
    [isDecoy, throwDecoy, onKeeperReject]
  );

  const handleTap = () => {
    if (flying || dragging || draggedRef.current) return;
    onOpenLightbox(item);
  };

  const photoInner = (
    <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-background/40 shadow-inner ring-1 ring-black/10">
      <Image
        src={item.imageUrl}
        alt="Photo from our camera roll"
        fill
        draggable={false}
        className="pointer-events-none object-cover transition duration-500 group-hover:scale-[1.03]"
        sizes="120px"
      />
    </div>
  );

  const frame = (
    <div className="rounded-sm bg-gradient-to-b from-[#fff8f4] via-[#faf3ef] to-[#f3e8e4] p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.14),0_0_0_1px_rgba(232,160,180,0.12)] ring-1 ring-accent/15">
      {photoInner}
      <div
        className="mt-1.5 h-0.5 w-full rounded-full bg-gradient-to-r from-transparent via-accent/25 to-transparent"
        aria-hidden
      />
    </div>
  );

  const interactiveClass = canDrag
    ? "cursor-grab active:cursor-grabbing"
    : "cursor-zoom-in";

  if (swipeEnabled) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        drag={canDrag ? "x" : false}
        dragConstraints={{ left: 0, right: 400 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => {
          draggedRef.current = false;
          setDragging(true);
        }}
        onDrag={() => {
          draggedRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        whileDrag={{ scale: 1.02, zIndex: 40 }}
        animate={
          flying
            ? {
                opacity: 0,
                scale: 0.9,
                rotate: 8,
                x: reducedMotion ? 120 : 320,
                y: reducedMotion ? 0 : -20,
              }
            : { opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }
        }
        exit={{ opacity: 0, scale: 0.92, marginBottom: 0 }}
        transition={
          flying
            ? {
                duration: reducedMotion ? 0.15 : dollEnter.duration,
                ease: dollEase,
              }
            : { delay: index * 0.05, duration: 0.4 }
        }
        className={`group relative mx-auto mb-3 block w-full max-w-[128px] break-inside-avoid select-none sm:max-w-[136px] ${interactiveClass} ${
          dragging || flying ? "z-30 overflow-visible" : ""
        }`}
        style={{ touchAction: canDrag ? "none" : "auto" }}
        data-lenis-prevent
        role="button"
        tabIndex={0}
        aria-label="Photo — swipe right to drop, tap to view"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleTap();
        }}
      >
        {frame}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.92, marginBottom: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`group relative mx-auto mb-3 block w-full max-w-[128px] break-inside-avoid sm:max-w-[136px] ${interactiveClass}`}
    >
      <button
        type="button"
        onClick={handleTap}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Photo — tap to view"
      >
        {frame}
      </button>
    </motion.div>
  );
}
