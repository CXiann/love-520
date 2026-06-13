"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { dollEase, dollSaveDelayMs, dollSaveUnlock } from "./doll-motion";
import type { MemoryDollData } from "./types";

const REVEAL_THRESHOLD = 0.55;
const BRUSH_RADIUS = 28;

type DollScratchRevealProps = {
  doll: MemoryDollData;
  layout?: "shelf" | "carousel";
  onRevealed: () => void;
  onSave: () => void;
  revealed: boolean;
  saved: boolean;
};

function storyTeaser(story: string): string {
  const lines = story.split("\n").filter(Boolean);
  if (lines.length === 0) return "";
  if (lines[0].length <= 200) return lines[0];
  return `${lines[0].slice(0, 200)}…`;
}

export function DollScratchReveal({
  doll,
  layout = "shelf",
  onRevealed,
  onSave,
  revealed,
  saved,
}: DollScratchRevealProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogRef = useRef<HTMLCanvasElement | null>(null);
  const scratchingRef = useRef(false);
  const revealedRef = useRef(revealed);
  const rafRef = useRef<number | null>(null);
  const [scratching, setScratching] = useState(!revealed && !reducedMotion);
  const [localRevealed, setLocalRevealed] = useState(
    revealed || !!reducedMotion
  );
  const [saving, setSaving] = useState(false);

  const isCarousel = layout === "carousel";
  const sizeClass = isCarousel
    ? "h-48 w-48 md:h-56 md:w-56"
    : "mx-auto aspect-square w-full max-w-[140px] md:max-w-[160px]";

  useEffect(() => {
    revealedRef.current = revealed || localRevealed;
  }, [revealed, localRevealed]);

  const checkRevealRatio = useCallback(() => {
    const fog = fogRef.current;
    if (!fog || revealedRef.current) return;
    const ctx = fog.getContext("2d");
    if (!ctx) return;
    const { width, height } = fog;
    const data = ctx.getImageData(0, 0, width, height).data;
    let transparent = 0;
    const step = 8;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < 128) transparent++;
      }
    }
    const samples = Math.ceil(width / step) * Math.ceil(height / step);
    if (transparent / samples >= REVEAL_THRESHOLD) {
      revealedRef.current = true;
      setLocalRevealed(true);
      setScratching(false);
      onRevealed();
    }
  }, [onRevealed]);

  const scratchAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      const fog = fogRef.current;
      if (!canvas || !fog || revealedRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * fog.width;
      const y = ((clientY - rect.top) / rect.height) * fog.height;
      const ctx = fog.getContext("2d");
      if (!ctx) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      const display = canvas.getContext("2d");
      if (display) {
        display.clearRect(0, 0, canvas.width, canvas.height);
        display.drawImage(fog, 0, 0, canvas.width, canvas.height);
      }
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          checkRevealRatio();
        });
      }
    },
    [checkRevealRatio]
  );

  const paintFog = useCallback(
    (fog: HTMLCanvasElement, displayCtx: CanvasRenderingContext2D) => {
      const fogCtx = fog.getContext("2d");
      if (!fogCtx) return;

      const drawSolidFog = () => {
        fogCtx.fillStyle = "rgba(18, 14, 16, 1)";
        fogCtx.fillRect(0, 0, fog.width, fog.height);
        fogCtx.fillStyle = "rgba(232, 160, 180, 0.18)";
        fogCtx.font = `${Math.floor(fog.width / 12)}px serif`;
        fogCtx.textAlign = "center";
        fogCtx.textBaseline = "middle";
        fogCtx.fillText("scratch", fog.width / 2, fog.height / 2);
        displayCtx.setTransform(1, 0, 0, 1, 0, 0);
        displayCtx.drawImage(fog, 0, 0, displayCtx.canvas.width, displayCtx.canvas.height);
      };

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        fogCtx.clearRect(0, 0, fog.width, fog.height);
        fogCtx.filter = "blur(16px)";
        fogCtx.drawImage(img, 0, 0, fog.width, fog.height);
        fogCtx.filter = "none";
        fogCtx.fillStyle = "rgba(18, 14, 16, 0.45)";
        fogCtx.fillRect(0, 0, fog.width, fog.height);
        fogCtx.fillStyle = "rgba(232, 160, 180, 0.2)";
        fogCtx.font = `${Math.floor(fog.width / 12)}px serif`;
        fogCtx.textAlign = "center";
        fogCtx.textBaseline = "middle";
        fogCtx.fillText("scratch", fog.width / 2, fog.height / 2);
        displayCtx.setTransform(1, 0, 0, 1, 0, 0);
        displayCtx.drawImage(fog, 0, 0, displayCtx.canvas.width, displayCtx.canvas.height);
      };
      img.onerror = drawSolidFog;
      img.src = doll.imageUrl;
    },
    [doll.imageUrl]
  );

  const initCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const fog = document.createElement("canvas");
    fog.width = canvas.width;
    fog.height = canvas.height;
    fogRef.current = fog;

    const displayCtx = canvas.getContext("2d");
    if (!displayCtx) return;

    paintFog(fog, displayCtx);

    if (reducedMotion && !revealed) {
      revealedRef.current = true;
      setLocalRevealed(true);
      onRevealed();
    }
  }, [onRevealed, reducedMotion, revealed, paintFog]);

  useEffect(() => {
    initCanvas();
    const ro = new ResizeObserver(() => initCanvas());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [initCanvas]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!scratching || localRevealed) return;
    scratchingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!scratchingRef.current) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    scratchingRef.current = false;
  };

  const showRevealPanel = localRevealed || revealed;
  const teaser = storyTeaser(doll.memoryStory);

  const handleSaveClick = () => {
    if (saving || saved) return;
    setSaving(true);
    window.setTimeout(() => {
      onSave();
    }, dollSaveDelayMs);
  };

  return (
    <div
      className={`flex w-full flex-col items-center ${
        isCarousel ? "" : "max-w-[150px]"
      }`}
      data-lenis-prevent
    >
      <motion.div
        ref={containerRef}
        className={`relative overflow-hidden rounded-sm border bg-surface-elevated shadow-lg ${sizeClass} ${
          saving
            ? "border-accent ring-2 ring-accent/50 ring-offset-2 ring-offset-background"
            : "border-accent/40"
        }`}
        animate={
          saving
            ? {
                scale: [1, 1.05, 1.02],
                boxShadow: [
                  "0 0 0 rgba(232, 160, 180, 0)",
                  "0 0 40px rgba(232, 160, 180, 0.55)",
                  "0 0 24px rgba(232, 160, 180, 0.35)",
                ],
              }
            : { scale: 1 }
        }
        transition={{ duration: 1.4, ease: dollEase }}
      >
        <Image
          src={doll.imageUrl}
          alt={doll.name}
          fill
          className="object-cover"
          sizes={isCarousel ? "280px" : "160px"}
        />
        <AnimatePresence>
          {scratching && !showRevealPanel && (
            <motion.canvas
              ref={canvasRef}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1.1, ease: dollEase } }}
              className="absolute inset-0 z-10 cursor-crosshair touch-none"
              style={{ touchAction: "none" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          )}
        </AnimatePresence>
        {showRevealPanel && !saved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: dollEase }}
            className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-background/40 via-transparent to-transparent"
          />
        )}
        <AnimatePresence>
          {saving && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: [1, 1.35, 1.1] }}
              exit={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 1.2, ease: dollEase }}
              className="pointer-events-none absolute right-2 top-2 z-20 text-2xl text-accent drop-shadow"
              aria-hidden
            >
              ♥
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="wait">
        {showRevealPanel && !saved && (
          <motion.div
            key="save-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={
              saving
                ? { opacity: [1, 0.85, 1], y: 0 }
                : { opacity: 1, y: 0 }
            }
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{
              duration: saving ? 1.3 : 1.15,
              ease: dollEase,
            }}
            className={`mt-4 w-full text-center ${isCarousel ? "max-w-xs px-2" : "max-w-[160px]"}`}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-accent">
              {doll.name}
            </p>
            <p className="mt-2 font-display text-sm leading-snug text-foreground md:text-base">
              {doll.memoryTitle}
            </p>
            {teaser && (
              <p className="mt-2 text-xs leading-relaxed text-muted">{teaser}</p>
            )}
            <motion.button
              type="button"
              onClick={handleSaveClick}
              disabled={saving}
              animate={saving ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 1.2, repeat: saving ? Infinity : 0 }}
              className="mt-4 rounded-full border border-accent/40 bg-accent/10 px-5 py-2 text-xs text-accent transition hover:bg-accent/20 disabled:opacity-70"
            >
              {saving ? "Saving memory…" : "Save this memory"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
