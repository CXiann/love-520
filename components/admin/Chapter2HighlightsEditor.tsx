"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DEFAULT_CHAPTER2_HIGHLIGHT_SLIDES } from "@/lib/chapter2-default-highlights";
import {
  DEFAULT_CURATE_PROMPT,
  DEFAULT_HIGHLIGHT_PICK_COUNT,
  DEFAULT_ORDER_HINT,
  DEFAULT_ORDER_PROMPT,
  DEFAULT_SLOT_LABELS,
  newHighlightSlide,
  parseFavoriteGameForAdmin,
  serializeFavoriteGameConfig,
  type Chapter2FavoriteGameConfig,
} from "@/lib/chapter2-favorite-game";
import type { FilmStripSlide } from "@/lib/chapter-eggs";

type Chapter2HighlightsEditorProps = {
  json: string | null;
  onChange: (json: string) => void;
  onUpload: (file: File) => Promise<string>;
  uploading?: boolean;
  inputClass: string;
};

export function Chapter2HighlightsEditor({
  json,
  onChange,
  onUpload,
  uploading = false,
  inputClass,
}: Chapter2HighlightsEditorProps) {
  const [config, setConfig] = useState<Chapter2FavoriteGameConfig>(() =>
    parseFavoriteGameForAdmin(json)
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  useEffect(() => {
    setConfig(parseFavoriteGameForAdmin(json));
  }, [json]);

  useEffect(() => {
    fetch("/api/admin/favorite-images")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.urls) setGalleryUrls(data.urls as string[]);
      })
      .catch(() => {});
  }, []);

  function commit(next: Chapter2FavoriteGameConfig) {
    setConfig(next);
    onChange(serializeFavoriteGameConfig(next));
  }

  function patch(partial: Partial<Chapter2FavoriteGameConfig>) {
    commit({ ...config, ...partial });
  }

  function updateSlide(index: number, patchSlide: Partial<FilmStripSlide>) {
    const slides = config.slides.map((s, i) =>
      i === index ? { ...s, ...patchSlide } : s
    );
    commit({ ...config, slides });
  }

  function removeSlide(index: number) {
    commit({ ...config, slides: config.slides.filter((_, i) => i !== index) });
  }

  function moveSlide(index: number, direction: "up" | "down") {
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= config.slides.length) return;
    const slides = [...config.slides];
    [slides[index], slides[swap]] = [slides[swap], slides[index]];
    commit({ ...config, slides });
  }

  function addSlideFromUrl(url: string, caption = "") {
    const slides = [
      ...config.slides,
      {
        ...newHighlightSlide(config.slides.length + 1),
        imageUrl: url,
        caption,
      },
    ];
    commit({ ...config, slides });
  }

  function loadStarterSlides() {
    commit({
      ...config,
      slides: DEFAULT_CHAPTER2_HIGHLIGHT_SLIDES.map((s) => ({ ...s })),
    });
  }

  const slotFields = Array.from({ length: config.pickCount }, (_, i) => i);

  return (
    <div className="space-y-6 rounded-lg border border-accent/20 bg-surface-elevated/40 p-4">
      <div>
        <p className="font-display text-lg text-accent">
          Favorite moments game
        </p>
        <p className="mt-1 text-xs text-muted">
          Photos, how many she picks, prompts, and story-rail labels — all saved
          with site settings.
        </p>
      </div>

      <fieldset className="space-y-3 rounded-lg border border-accent/15 p-3">
        <legend className="px-1 text-sm font-medium text-accent">
          Game text
        </legend>
        <label className="block text-xs text-muted">
          How many favorites to pick (3–8)
          <input
            type="number"
            min={3}
            max={8}
            className={inputClass + " mt-1 w-24"}
            value={config.pickCount}
            onChange={(e) =>
              patch({ pickCount: Number(e.target.value) || DEFAULT_HIGHLIGHT_PICK_COUNT })
            }
          />
        </label>
        <label className="block text-xs text-muted">
          Pick phase prompt
          <input
            className={inputClass + " mt-1"}
            value={config.curatePrompt}
            onChange={(e) => patch({ curatePrompt: e.target.value })}
            placeholder={DEFAULT_CURATE_PROMPT}
          />
        </label>
        <label className="block text-xs text-muted">
          Order phase prompt
          <input
            className={inputClass + " mt-1"}
            value={config.orderPrompt}
            onChange={(e) => patch({ orderPrompt: e.target.value })}
            placeholder={DEFAULT_ORDER_PROMPT}
          />
        </label>
        <label className="block text-xs text-muted">
          Order phase hint (mobile)
          <input
            className={inputClass + " mt-1"}
            value={config.orderHint}
            onChange={(e) => patch({ orderHint: e.target.value })}
            placeholder={DEFAULT_ORDER_HINT}
          />
        </label>
        <div className="space-y-2">
          <p className="text-xs text-muted">Story rail slot labels</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {slotFields.map((i) => (
              <label key={i} className="block text-xs text-muted">
                Slot {i + 1}
                <input
                  className={inputClass + " mt-1"}
                  value={config.slotLabels[i] ?? ""}
                  onChange={(e) => {
                    const slotLabels = [...config.slotLabels];
                    slotLabels[i] = e.target.value;
                    patch({ slotLabels });
                  }}
                  placeholder={DEFAULT_SLOT_LABELS[i] ?? `Moment ${i + 1}`}
                />
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={loadStarterSlides}
          className="rounded-full border border-accent/40 px-3 py-1.5 text-xs text-accent hover:bg-accent/10"
        >
          Load starter photos
        </button>
        <button
          type="button"
          onClick={() =>
            commit({
              ...config,
              curatePrompt: DEFAULT_CURATE_PROMPT,
              orderPrompt: DEFAULT_ORDER_PROMPT,
              orderHint: DEFAULT_ORDER_HINT,
              pickCount: DEFAULT_HIGHLIGHT_PICK_COUNT,
              slotLabels: [...DEFAULT_SLOT_LABELS],
            })
          }
          className="rounded-full border border-accent/30 px-3 py-1.5 text-xs text-muted hover:border-accent/50"
        >
          Reset game text to defaults
        </button>
      </div>

      <div>
        <p className="text-sm text-accent">Photo pool</p>
        <p className="mt-1 text-xs text-muted">
          Add at least {config.pickCount} photos (6–8 recommended).{" "}
          {config.slides.filter((s) => s.imageUrl.trim()).length} with images.
        </p>
      </div>

      {galleryUrls.length > 0 && (
        <div className="rounded-lg border border-accent/10 p-3">
          <p className="mb-2 text-xs text-muted">
            Quick add from uploads/favorite
          </p>
          <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
            {galleryUrls.map((url) => {
              const used = config.slides.some((s) => s.imageUrl === url);
              return (
                <button
                  key={url}
                  type="button"
                  disabled={used}
                  onClick={() => addSlideFromUrl(url)}
                  className="relative h-14 w-14 overflow-hidden rounded border border-accent/20 disabled:opacity-40"
                  title={used ? "Already in pool" : "Add to pool"}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {config.slides.length === 0 && (
        <p className="text-sm text-muted">
          No photos yet — upload below or use starter / gallery shortcuts.
        </p>
      )}

      <ul className="space-y-4">
        {config.slides.map((slide, index) => (
          <li
            key={slide.id ?? index}
            className="flex flex-col gap-3 rounded-lg border border-accent/15 bg-background/50 p-3 sm:flex-row"
          >
            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-md bg-black/30 sm:h-24 sm:w-32">
              {slide.imageUrl ? (
                <Image
                  src={slide.imageUrl}
                  alt={slide.caption || `Highlight ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                  unoptimized={slide.imageUrl.startsWith("/uploads/")}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <label className="block text-xs text-muted">
                Image URL
                <input
                  className={inputClass + " mt-1"}
                  value={slide.imageUrl}
                  onChange={(e) =>
                    updateSlide(index, { imageUrl: e.target.value })
                  }
                  placeholder="/uploads/your-photo.jpeg"
                />
              </label>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                className="text-xs"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await onUpload(f);
                  updateSlide(index, { imageUrl: url });
                  e.target.value = "";
                }}
              />
              <label className="block text-xs text-muted">
                Caption (film strip / reel)
                <input
                  className={inputClass + " mt-1"}
                  value={slide.caption ?? ""}
                  onChange={(e) =>
                    updateSlide(index, { caption: e.target.value })
                  }
                />
              </label>
              <label className="block text-xs text-muted">
                Date label (optional)
                <input
                  className={inputClass + " mt-1"}
                  value={slide.date ?? ""}
                  onChange={(e) => updateSlide(index, { date: e.target.value })}
                />
              </label>
            </div>

            <div className="flex shrink-0 flex-row gap-1 sm:flex-col">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveSlide(index, "up")}
                className="rounded border border-accent/20 px-2 py-1 text-xs hover:border-accent/50 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === config.slides.length - 1}
                onClick={() => moveSlide(index, "down")}
                className="rounded border border-accent/20 px-2 py-1 text-xs hover:border-accent/50 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeSlide(index)}
                className="rounded border border-red-400/30 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() =>
          commit({
            ...config,
            slides: [...config.slides, newHighlightSlide(config.slides.length + 1)],
          })
        }
        className="rounded-full border border-accent/40 px-4 py-2 text-sm text-accent hover:bg-accent/10"
      >
        + Add highlight photo
      </button>
    </div>
  );
}
