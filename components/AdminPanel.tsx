"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { QuizQuestion } from "@/lib/secret-types";
import { normalizeMediaUrl } from "@/lib/normalize-media-url";
import { Chapter2HighlightsEditor } from "@/components/admin/Chapter2HighlightsEditor";

type Settings = {
  partnerName: string;
  yourName: string;
  relationshipStart: string;
  first520Date: string | null;
  chapter1ImageUrl: string | null;
  chapter1VideoUrl: string | null;
  chapter1VideoPosterUrl: string | null;
  chapter2ImageUrl: string | null;
  chapter2VideoUrl: string | null;
  chapter2VideoPosterUrl: string | null;
  chapter1Copy: string | null;
  chapter2Copy: string | null;
  musicUrl: string | null;
  easterEggStarMessage: string | null;
  chapter1HotspotsJson: string | null;
  chapter1PauseCaption: string | null;
  chapter2FilmStripJson: string | null;
  chapter2BonusRedact: string | null;
};

type SecretForm = {
  title: string;
  body: string;
  mediaUrl: string;
  envelopeTeaser: string;
  quiz: QuizQuestion[];
  passwordHints: string[];
};

type Milestone = {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
};

type GalleryItem = {
  id: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  isDecoy: boolean;
};

type MemoryDoll = {
  id: string;
  name: string;
  imageUrl: string;
  memoryTitle: string;
  memoryStory: string;
  memoryDate: string | null;
  sortOrder: number;
};

export function AdminPanel() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [dolls, setDolls] = useState<MemoryDoll[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [letter, setLetter] = useState("");
  const [secret, setSecret] = useState<SecretForm>({
    title: "",
    body: "",
    mediaUrl: "",
    envelopeTeaser: "",
    quiz: [],
    passwordHints: [],
  });
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [settingsSave, setSettingsSave] = useState<{
    kind: "idle" | "saving" | "success" | "error";
    message: string;
  }>({ kind: "idle", message: "" });
  const settingsSaveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settingsSave.kind !== "success") return;
    const t = window.setTimeout(() => {
      setSettingsSave({ kind: "idle", message: "" });
    }, 5000);
    return () => window.clearTimeout(t);
  }, [settingsSave.kind]);

  useEffect(() => {
    if (settingsSave.kind === "idle") return;
    settingsSaveRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [settingsSave.kind, settingsSave.message]);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/milestones").then((r) => r.json()),
      fetch("/api/gallery").then((r) => r.json()),
      fetch("/api/dolls").then((r) => r.json()),
      fetch("/api/letter").then((r) => r.json()),
      fetch("/api/secret").then((r) => r.json()),
    ]).then(([s, m, g, d, l, sec]) => {
      if (s) {
        setSettings({
          partnerName: s.partnerName ?? "",
          yourName: s.yourName ?? "",
          relationshipStart: s.relationshipStart?.slice(0, 10) ?? "",
          first520Date: s.first520Date?.slice(0, 10) ?? null,
          chapter1ImageUrl: s.chapter1ImageUrl ?? null,
          chapter1VideoUrl: s.chapter1VideoUrl ?? null,
          chapter1VideoPosterUrl: s.chapter1VideoPosterUrl ?? null,
          chapter2ImageUrl: s.chapter2ImageUrl ?? null,
          chapter2VideoUrl: s.chapter2VideoUrl ?? null,
          chapter2VideoPosterUrl: s.chapter2VideoPosterUrl ?? null,
          chapter1Copy: s.chapter1Copy ?? null,
          chapter2Copy: s.chapter2Copy ?? null,
          musicUrl: s.musicUrl ?? null,
          easterEggStarMessage: s.easterEggStarMessage ?? null,
          chapter1HotspotsJson: s.chapter1HotspotsJson ?? null,
          chapter1PauseCaption: s.chapter1PauseCaption ?? null,
          chapter2FilmStripJson: s.chapter2FilmStripJson ?? null,
          chapter2BonusRedact: s.chapter2BonusRedact ?? null,
        });
      }
      setMilestones(
        m.map((x: Milestone & { date: string }) => ({
          ...x,
          date: x.date.slice(0, 10),
        }))
      );
      setGallery(g);
      setDolls(
        d.map((x: MemoryDoll & { memoryDate?: string | null }) => ({
          ...x,
          memoryDate: x.memoryDate?.slice(0, 10) ?? null,
        }))
      );
      setLetter(l?.content ?? "");
      if (sec) {
        let quiz: QuizQuestion[] = [];
        let passwordHints: string[] = [];
        try {
          if (sec.quizJson) quiz = JSON.parse(sec.quizJson);
        } catch {
          /* ignore */
        }
        try {
          if (sec.passwordHints) passwordHints = JSON.parse(sec.passwordHints);
        } catch {
          /* ignore */
        }
        setSecret({
          title: sec.title,
          body: sec.body,
          mediaUrl: sec.mediaUrl ?? "",
          envelopeTeaser: sec.envelopeTeaser ?? "",
          quiz,
          passwordHints,
        });
      }
    });
  }, []);

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url;
  }

  async function saveSettings() {
    if (!settings) return;
    setSettingsSave({ kind: "saving", message: "Saving settings…" });
    setStatus("Saving settings…");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          partnerName: settings.partnerName,
          yourName: settings.yourName,
          relationshipStart: settings.relationshipStart,
          first520Date: settings.first520Date,
          chapter1ImageUrl: settings.chapter1ImageUrl,
          chapter1VideoUrl: settings.chapter1VideoUrl,
          chapter1VideoPosterUrl: settings.chapter1VideoPosterUrl,
          chapter2ImageUrl: settings.chapter2ImageUrl,
          chapter2VideoUrl: settings.chapter2VideoUrl,
          chapter2VideoPosterUrl: settings.chapter2VideoPosterUrl,
          chapter1Copy: settings.chapter1Copy,
          chapter2Copy: settings.chapter2Copy,
          musicUrl: settings.musicUrl,
          easterEggStarMessage: settings.easterEggStarMessage,
          chapter1HotspotsJson: settings.chapter1HotspotsJson,
          chapter1PauseCaption: settings.chapter1PauseCaption,
          chapter2FilmStripJson: settings.chapter2FilmStripJson,
          chapter2BonusRedact: settings.chapter2BonusRedact,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        relationshipStart?: string;
        first520Date?: string | null;
      };

      if (!res.ok) {
        const msg = data.error ?? `Save failed (${res.status})`;
        setSettingsSave({ kind: "error", message: msg });
        setStatus(msg);
        return;
      }

      const saved = data as Settings & {
        relationshipStart: string;
        first520Date: string | null;
      };
      setSettings({
        partnerName: saved.partnerName,
        yourName: saved.yourName,
        relationshipStart: saved.relationshipStart?.slice(0, 10) ?? "",
        first520Date: saved.first520Date?.slice(0, 10) ?? null,
        chapter1ImageUrl: saved.chapter1ImageUrl ?? null,
        chapter1VideoUrl: saved.chapter1VideoUrl ?? null,
        chapter1VideoPosterUrl: saved.chapter1VideoPosterUrl ?? null,
        chapter2ImageUrl: saved.chapter2ImageUrl ?? null,
        chapter2VideoUrl: saved.chapter2VideoUrl ?? null,
        chapter2VideoPosterUrl: saved.chapter2VideoPosterUrl ?? null,
        chapter1Copy: saved.chapter1Copy ?? null,
        chapter2Copy: saved.chapter2Copy ?? null,
        musicUrl: saved.musicUrl ?? null,
        easterEggStarMessage: saved.easterEggStarMessage ?? null,
        chapter1HotspotsJson: saved.chapter1HotspotsJson ?? null,
        chapter1PauseCaption: saved.chapter1PauseCaption ?? null,
        chapter2FilmStripJson: saved.chapter2FilmStripJson ?? null,
        chapter2BonusRedact: saved.chapter2BonusRedact ?? null,
      });

      const successMsg = "Settings saved successfully";
      setSettingsSave({ kind: "success", message: successMsg });
      setStatus(successMsg);
    } catch {
      const msg = "Could not reach the server. Check your connection and try again.";
      setSettingsSave({ kind: "error", message: msg });
      setStatus(msg);
    }
  }

  async function saveLetter() {
    await fetch("/api/letter", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: letter }),
    });
    setStatus("Letter saved");
  }

  async function saveSecret() {
    await fetch("/api/secret", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: secret.title,
        body: secret.body,
        mediaUrl: secret.mediaUrl || null,
        envelopeTeaser: secret.envelopeTeaser || null,
        quizJson: secret.quiz.length ? JSON.stringify(secret.quiz) : null,
        passwordHints: secret.passwordHints.length
          ? JSON.stringify(secret.passwordHints.filter(Boolean))
          : null,
      }),
    });
    setStatus("Secret content saved");
  }

  function updateQuizItem(index: number, patch: Partial<QuizQuestion>) {
    setSecret((prev) => ({
      ...prev,
      quiz: prev.quiz.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  }

  function addQuizItem() {
    setSecret((prev) => ({
      ...prev,
      quiz: [
        ...prev.quiz,
        {
          question: "",
          options: ["", "", ""],
          answerIndex: 0,
          wrongReply: "",
        },
      ],
    }));
  }

  async function addMilestone() {
    const res = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        title: "New milestone",
        description: "Description",
      }),
    });
    const m = await res.json();
    setMilestones((prev) => [...prev, { ...m, date: m.date.slice(0, 10) }]);
  }

  async function updateMilestone(m: Milestone) {
    await fetch(`/api/milestones/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(m),
    });
    setStatus("Milestone updated");
  }

  async function deleteMilestone(id: string) {
    await fetch(`/api/milestones/${id}`, { method: "DELETE" });
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  async function addGallery(imageUrl: string, caption?: string) {
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, caption }),
    });
    const item = await res.json();
    setGallery((prev) => [...prev, item]);
  }

  async function deleteGallery(id: string) {
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    setGallery((prev) => prev.filter((g) => g.id !== id));
  }

  async function updateGalleryDecoy(id: string, isDecoy: boolean) {
    const res = await fetch(`/api/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDecoy }),
    });
    if (!res.ok) return;
    const item = (await res.json()) as GalleryItem;
    setGallery((prev) => prev.map((g) => (g.id === id ? item : g)));
    setStatus(
      isDecoy
        ? "Will drop if she swipes it"
        : "Stays — she can't swipe this one away"
    );
  }

  async function updateDoll(d: MemoryDoll) {
    await fetch(`/api/dolls/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...d,
        memoryDate: d.memoryDate || null,
      }),
    });
    setStatus("Baby saved");
  }

  async function addDoll(imageUrl: string) {
    const res = await fetch("/api/dolls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New baby",
        imageUrl,
        memoryTitle: "A memory",
        memoryStory: "Write your story here…",
        sortOrder: dolls.length,
      }),
    });
    const doll = await res.json();
    setDolls((prev) => [
      ...prev,
      {
        ...doll,
        memoryDate: doll.memoryDate?.slice(0, 10) ?? null,
      },
    ]);
  }

  async function deleteDoll(id: string) {
    await fetch(`/api/dolls/${id}`, { method: "DELETE" });
    setDolls((prev) => prev.filter((d) => d.id !== id));
  }

  async function moveDoll(id: string, direction: "up" | "down") {
    const index = dolls.findIndex((d) => d.id === id);
    if (index < 0) return;
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= dolls.length) return;

    const reordered = [...dolls];
    [reordered[index], reordered[swap]] = [reordered[swap], reordered[index]];
    const withOrder = reordered.map((d, i) => ({ ...d, sortOrder: i }));
    setDolls(withOrder);
    await Promise.all(withOrder.map((d) => updateDoll(d)));
    setStatus("Order updated");
  }

  if (!settings) {
    return <p className="p-8 text-muted">Loading…</p>;
  }

  const inputClass =
    "w-full rounded border border-accent/20 bg-surface-elevated px-3 py-2 text-sm focus:border-accent focus:outline-none";

  const statusIsError =
    status.includes("failed") ||
    status.includes("invalid") ||
    status.includes("Not signed") ||
    status.includes("Wrong") ||
    status.includes("Could not");

  return (
    <div className="mx-auto max-w-3xl space-y-12 p-6 pb-28 md:p-10">
      <div className="sticky top-0 z-30 -mx-2 border-b border-accent/15 bg-background/95 px-2 py-3 backdrop-blur-md md:-mx-4 md:px-4">
        {status ? (
          <p
            className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
              statusIsError
                ? "border border-red-400/30 bg-red-500/10 text-red-400"
                : "border border-accent/30 bg-accent/10 text-accent"
            }`}
            role="status"
            aria-live="polite"
          >
            {status}
          </p>
        ) : (
          <p className="text-xs text-muted">Changes to other sections show here too.</p>
        )}
      </div>

      <AnimatePresence>
        {settingsSave.kind !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-[min(100vw-2rem,24rem)] -translate-x-1/2"
            role="status"
            aria-live="assertive"
          >
            <p
              className={`rounded-full border px-5 py-3 text-center text-sm font-medium shadow-lg ${
                settingsSave.kind === "error"
                  ? "border-red-400/40 bg-background text-red-400"
                  : settingsSave.kind === "saving"
                    ? "border-accent/30 bg-background text-muted"
                    : "border-accent/40 bg-background text-accent"
              }`}
            >
              {settingsSave.kind === "saving" && (
                <span className="mr-2 inline-block animate-pulse">●</span>
              )}
              {settingsSave.kind === "success" && (
                <span className="mr-2 text-accent">✓</span>
              )}
              {settingsSave.kind === "error" && (
                <span className="mr-2 text-red-400">✕</span>
              )}
              {settingsSave.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-accent">Site settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            Partner name
            <input
              className={inputClass + " mt-1"}
              value={settings.partnerName}
              onChange={(e) =>
                setSettings({ ...settings, partnerName: e.target.value })
              }
            />
          </label>
          <label className="block text-sm">
            Your name
            <input
              className={inputClass + " mt-1"}
              value={settings.yourName}
              onChange={(e) =>
                setSettings({ ...settings, yourName: e.target.value })
              }
            />
          </label>
          <label className="block text-sm">
            Relationship start
            <input
              type="date"
              className={inputClass + " mt-1"}
              value={settings.relationshipStart}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  relationshipStart: e.target.value,
                })
              }
            />
          </label>
          <label className="block text-sm">
            Music URL (YouTube, Spotify embed, or MP3)
            <input
              className={inputClass + " mt-1"}
              value={settings.musicUrl ?? ""}
              onChange={(e) =>
                setSettings({ ...settings, musicUrl: e.target.value })
              }
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <span className="mt-1 block text-xs text-muted">
              Paste a YouTube watch link, Spotify embed URL, or direct .mp3 path
            </span>
          </label>
        </div>
        <label className="block text-sm">
          Topic 1 copy
          <textarea
            className={inputClass + " mt-1 min-h-[80px]"}
            value={settings.chapter1Copy ?? ""}
            onChange={(e) =>
              setSettings({ ...settings, chapter1Copy: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          First celebration — video URL (plays in Topic 1 section)
          <input
            className={inputClass + " mt-1"}
            value={settings.chapter1VideoUrl ?? ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                chapter1VideoUrl: e.target.value,
              })
            }
            onBlur={(e) => {
              const n = normalizeMediaUrl(e.target.value);
              if (n && n !== e.target.value) {
                setSettings((s) =>
                  s ? { ...s, chapter1VideoUrl: n } : s
                );
              }
            }}
            placeholder="/uploads/video-2.mp4.mov"
          />
          <span className="mt-1 block text-xs text-muted">
            Use <code className="text-accent">/uploads/video-2.mp4.mov</code> (file
            in public/uploads/). Not your Mac folder path.
          </span>
          <input
            type="file"
            accept="video/mp4,video/*"
            disabled={uploading}
            className="mt-2 text-xs"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = await uploadFile(f);
              setSettings((s) =>
                s ? { ...s, chapter1VideoUrl: url } : s
              );
              setStatus("Video uploaded for First celebration — click Save settings");
              e.target.value = "";
            }}
          />
        </label>
        <label className="block text-sm">
          First celebration — video thumbnail (poster before play)
          <input
            className={inputClass + " mt-1"}
            value={settings.chapter1VideoPosterUrl ?? ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                chapter1VideoPosterUrl: e.target.value,
              })
            }
            onBlur={(e) => {
              const n = normalizeMediaUrl(e.target.value);
              if (n && n !== e.target.value) {
                setSettings((s) =>
                  s ? { ...s, chapter1VideoPosterUrl: n } : s
                );
              }
            }}
            placeholder="/uploads/thumbnail.jpeg"
          />
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            className="mt-2 text-xs"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = await uploadFile(f);
              setSettings((s) =>
                s ? { ...s, chapter1VideoPosterUrl: url } : s
              );
              setStatus("Thumbnail uploaded — click Save settings");
              e.target.value = "";
            }}
          />
        </label>
        <label className="block text-sm">
          Topic 1 — Ken Burns pause caption (legacy)
          <input
            className={inputClass + " mt-1"}
            value={settings.chapter1PauseCaption ?? ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                chapter1PauseCaption: e.target.value,
              })
            }
          />
        </label>
        <label className="block text-sm">
          Topic 1 — Hotspots JSON (optional, legacy)
          <textarea
            className={inputClass + " mt-1 min-h-[100px] font-mono text-xs"}
            value={settings.chapter1HotspotsJson ?? ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                chapter1HotspotsJson: e.target.value,
              })
            }
            placeholder='[{"id":"h1","x":18,"y":28,"message":"...","grantsKey":false}]'
          />
        </label>
        <section className="space-y-4 rounded-lg border border-accent/25 bg-accent/5 p-4 md:p-6">
          <h2 className="font-display text-xl text-accent">This Year</h2>
          <p className="text-xs text-muted">
            Topic 2 — background image and the favorite-moments game (photos,
            prompts, how many to pick).
          </p>

          <label className="block text-sm">
            Background image (optional atmosphere behind the section)
            <input
              className={inputClass + " mt-1"}
              value={settings.chapter2ImageUrl ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  chapter2ImageUrl: e.target.value,
                })
              }
              onBlur={(e) => {
                const n = normalizeMediaUrl(e.target.value);
                if (n && n !== e.target.value) {
                  setSettings((s) =>
                    s ? { ...s, chapter2ImageUrl: n } : s
                  );
                }
              }}
              placeholder="/uploads/chapter2-bg.jpeg"
            />
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              className="mt-2 text-xs"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadFile(f);
                setSettings((s) =>
                  s ? { ...s, chapter2ImageUrl: url } : s
                );
                setStatus("Background uploaded — click Save settings");
                e.target.value = "";
              }}
            />
          </label>

          <Chapter2HighlightsEditor
            json={settings.chapter2FilmStripJson}
            onChange={(chapter2FilmStripJson) =>
              setSettings((s) => (s ? { ...s, chapter2FilmStripJson } : s))
            }
            onUpload={uploadFile}
            uploading={uploading}
            inputClass={inputClass}
          />

        </section>
        <label className="block text-sm">
          Star easter egg message (shown after 5 star clicks on opening)
          <textarea
            className={inputClass + " mt-1 min-h-[60px]"}
            value={settings.easterEggStarMessage ?? ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                easterEggStarMessage: e.target.value,
              })
            }
          />
        </label>
        <div className="flex flex-wrap gap-4">
          {([["chapter1ImageUrl", "Topic 1 image (poster fallback)"]] as const).map(
            ([key, label]) => (
            <label key={key} className="block text-sm">
              {label}
              <input
                className={inputClass + " mt-1 w-64"}
                value={settings[key] ?? ""}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: e.target.value })
                }
              />
              <input
                type="file"
                accept="image/*"
                className="mt-1 text-xs"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadFile(f);
                  setSettings({ ...settings, [key]: url });
                }}
              />
            </label>
          )
          )}
        </div>
        <div ref={settingsSaveRef} className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveSettings}
              disabled={settingsSave.kind === "saving"}
              className="rounded-full border border-accent bg-accent/15 px-8 py-2.5 font-medium text-accent transition hover:bg-accent/25 disabled:cursor-wait disabled:opacity-70"
            >
              {settingsSave.kind === "saving"
                ? "Saving…"
                : "Save settings"}
            </button>
            {settingsSave.kind === "success" && (
              <span className="text-sm font-medium text-accent">
                Saved ✓
              </span>
            )}
          </div>
          {settingsSave.kind === "error" && (
            <p
              className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              role="alert"
            >
              {settingsSave.message}
            </p>
          )}
          {settingsSave.kind === "saving" && (
            <p className="text-sm text-muted">Please wait…</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-accent">Love letter</h2>
        <textarea
          className={inputClass + " min-h-[200px] font-display"}
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
        />
        <button
          type="button"
          onClick={saveLetter}
          className="rounded-full border border-accent px-6 py-2 text-accent hover:bg-accent/10"
        >
          Save letter
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-accent">Timeline</h2>
          <button
            type="button"
            onClick={addMilestone}
            className="text-sm text-accent hover:underline"
          >
            + Add milestone
          </button>
        </div>
        <p className="text-xs text-muted">
          Photos are used in the timeline ordering game — set each milestone date
          in true chronological order so the drag-and-drop puzzle is fair.
        </p>
        <label className="block text-sm">
          Upload photo (adds a new milestone)
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            className="mt-1"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = await uploadFile(f);
              const res = await fetch("/api/milestones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  date: new Date().toISOString().slice(0, 10),
                  title: "New moment",
                  description: "A moment from our year.",
                  imageUrl: url,
                }),
              });
              const m = await res.json();
              setMilestones((prev) => [
                ...prev,
                { ...m, date: m.date.slice(0, 10) },
              ]);
              setStatus("Timeline photo added");
              e.target.value = "";
            }}
          />
        </label>
        {milestones.map((m) => (
          <div key={m.id} className="space-y-2 rounded border border-accent/10 p-4">
            <div className="flex gap-4">
              {m.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={m.imageUrl}
                  alt=""
                  className="h-24 w-32 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded border border-dashed border-accent/30 bg-accent/5 text-xs text-muted">
                  No photo
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              type="date"
              className={inputClass}
              value={m.date}
              onChange={(e) =>
                setMilestones((prev) =>
                  prev.map((x) =>
                    x.id === m.id ? { ...x, date: e.target.value } : x
                  )
                )
              }
            />
            <input
              className={inputClass}
              value={m.title}
              onChange={(e) =>
                setMilestones((prev) =>
                  prev.map((x) =>
                    x.id === m.id ? { ...x, title: e.target.value } : x
                  )
                )
              }
            />
            <textarea
              className={inputClass}
              value={m.description}
              onChange={(e) =>
                setMilestones((prev) =>
                  prev.map((x) =>
                    x.id === m.id
                      ? { ...x, description: e.target.value }
                      : x
                  )
                )
              }
            />
            <label className="block text-sm">
              Photo URL
              <input
                className={inputClass + " mt-1"}
                value={m.imageUrl ?? ""}
                placeholder="/uploads/..."
                onChange={(e) =>
                  setMilestones((prev) =>
                    prev.map((x) =>
                      x.id === m.id
                        ? { ...x, imageUrl: e.target.value || null }
                        : x
                    )
                  )
                }
              />
            </label>
            <label className="block text-sm">
              Upload / replace photo
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                className="mt-1 text-xs"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadFile(f);
                  setMilestones((prev) =>
                    prev.map((x) =>
                      x.id === m.id ? { ...x, imageUrl: url } : x
                    )
                  );
                  e.target.value = "";
                }}
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateMilestone(m)}
                className="text-sm text-accent"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => deleteMilestone(m.id)}
                className="text-sm text-red-400"
              >
                Delete
              </button>
            </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-accent">Memory babies</h2>
          <label className="cursor-pointer text-sm text-accent hover:underline">
            + Upload baby photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadFile(f);
                await addDoll(url);
                setStatus("Baby added");
              }}
            />
          </label>
        </div>
        {dolls.map((d, i) => (
          <div
            key={d.id}
            className="space-y-2 rounded border border-accent/10 p-4"
          >
            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.imageUrl}
                alt=""
                className="h-24 w-24 shrink-0 rounded object-cover"
              />
              <div className="flex flex-1 flex-col gap-2">
                <input
                  className={inputClass}
                  placeholder="Name"
                  value={d.name}
                  onChange={(e) =>
                    setDolls((prev) =>
                      prev.map((x) =>
                        x.id === d.id ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Memory title"
                  value={d.memoryTitle}
                  onChange={(e) =>
                    setDolls((prev) =>
                      prev.map((x) =>
                        x.id === d.id
                          ? { ...x, memoryTitle: e.target.value }
                          : x
                      )
                    )
                  }
                />
              </div>
            </div>
            <textarea
              className={inputClass + " min-h-[100px]"}
              placeholder="Memory story"
              value={d.memoryStory}
              onChange={(e) =>
                setDolls((prev) =>
                  prev.map((x) =>
                    x.id === d.id ? { ...x, memoryStory: e.target.value } : x
                  )
                )
              }
            />
            <label className="block text-sm">
              Memory date (optional)
              <input
                type="date"
                className={inputClass + " mt-1"}
                value={d.memoryDate ?? ""}
                onChange={(e) =>
                  setDolls((prev) =>
                    prev.map((x) =>
                      x.id === d.id
                        ? { ...x, memoryDate: e.target.value || null }
                        : x
                    )
                  )
                }
              />
            </label>
            <label className="block text-sm">
              Replace photo
              <input
                type="file"
                accept="image/*"
                className="mt-1 text-xs"
                disabled={uploading}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadFile(f);
                  setDolls((prev) =>
                    prev.map((x) =>
                      x.id === d.id ? { ...x, imageUrl: url } : x
                    )
                  );
                }}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateDoll(d)}
                className="text-sm text-accent"
              >
                Save
              </button>
              <button
                type="button"
                disabled={i === 0}
                onClick={() => moveDoll(d.id, "up")}
                className="text-sm text-muted disabled:opacity-40"
              >
                Move up
              </button>
              <button
                type="button"
                disabled={i === dolls.length - 1}
                onClick={() => moveDoll(d.id, "down")}
                className="text-sm text-muted disabled:opacity-40"
              >
                Move down
              </button>
              <button
                type="button"
                onClick={() => deleteDoll(d.id)}
                className="text-sm text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-accent">Gallery</h2>
        <p className="text-xs text-muted">
          All photos look the same to her. Check &quot;Drop if swiped&quot; on shots
          you want removed when she swipes right; leave unchecked for photos that
          must stay (she gets a gentle no if she swipes those).
        </p>
        <label className="block text-sm">
          Upload photo
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            className="mt-1"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = await uploadFile(f);
              await addGallery(url, "");
              setStatus("Photo added");
            }}
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          {gallery.map((g) => (
            <div key={g.id} className="relative space-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.imageUrl}
                alt=""
                className={`aspect-square rounded object-cover ${
                  g.isDecoy ? "opacity-70 saturate-50" : ""
                }`}
              />
              <label className="flex items-center gap-1 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={g.isDecoy}
                  onChange={(e) =>
                    updateGalleryDecoy(g.id, e.target.checked)
                  }
                />
                Drop if swiped (hidden from her)
              </label>
              <button
                type="button"
                onClick={() => deleteGallery(g.id)}
                className="absolute right-1 top-1 rounded bg-background/80 px-2 text-xs text-red-400"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-accent">Secret page</h2>
        <label className="block text-sm">
          Envelope teaser (before quiz)
          <input
            className={inputClass + " mt-1"}
            value={secret.envelopeTeaser}
            onChange={(e) =>
              setSecret({ ...secret, envelopeTeaser: e.target.value })
            }
          />
        </label>
        <input
          className={inputClass}
          placeholder="Reveal title"
          value={secret.title}
          onChange={(e) => setSecret({ ...secret, title: e.target.value })}
        />
        <textarea
          className={inputClass + " min-h-[120px]"}
          placeholder="Reveal body"
          value={secret.body}
          onChange={(e) => setSecret({ ...secret, body: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Media URL (optional)"
          value={secret.mediaUrl}
          onChange={(e) => setSecret({ ...secret, mediaUrl: e.target.value })}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-accent">Couples quiz</h3>
            <button
              type="button"
              onClick={addQuizItem}
              className="text-sm text-accent hover:underline"
            >
              + Add question
            </button>
          </div>
          {secret.quiz.map((q, qi) => (
            <div
              key={qi}
              className="space-y-2 rounded border border-accent/10 p-4"
            >
              <input
                className={inputClass}
                placeholder="Question"
                value={q.question}
                onChange={(e) =>
                  updateQuizItem(qi, { question: e.target.value })
                }
              />
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.answerIndex === oi}
                    onChange={() => updateQuizItem(qi, { answerIndex: oi })}
                  />
                  <input
                    className={inputClass + " flex-1"}
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const options = [...q.options];
                      options[oi] = e.target.value;
                      updateQuizItem(qi, { options });
                    }}
                  />
                </div>
              ))}
              <input
                className={inputClass}
                placeholder="Wrong answer reply"
                value={q.wrongReply}
                onChange={(e) =>
                  updateQuizItem(qi, { wrongReply: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() =>
                  setSecret((prev) => ({
                    ...prev,
                    quiz: prev.quiz.filter((_, i) => i !== qi),
                  }))
                }
                className="text-sm text-red-400"
              >
                Remove question
              </button>
            </div>
          ))}
        </div>

        <label className="block text-sm">
          Password hints (one per line, shown after wrong attempts)
          <textarea
            className={inputClass + " mt-1 min-h-[80px]"}
            value={secret.passwordHints.join("\n")}
            onChange={(e) =>
              setSecret({
                ...secret,
                passwordHints: e.target.value.split("\n"),
              })
            }
          />
        </label>

        <button
          type="button"
          onClick={saveSecret}
          className="rounded-full border border-accent px-6 py-2 text-accent hover:bg-accent/10"
        >
          Save secret
        </button>
      </section>

      {uploading && (
        <p className="fixed bottom-4 right-4 rounded bg-surface-elevated px-4 py-2 text-sm">
          Uploading…
        </p>
      )}
    </div>
  );
}
