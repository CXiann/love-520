export const GALLERY_QUEST_STORAGE_KEY = "love520_gallery_quest";
export const GALLERY_QUEST_COMPLETE_KEY = "love520_gallery_quest_complete";

export type GalleryQuestPersist = {
  trashedDecoyIds: string[];
};

export function isGalleryQuestCompleteFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(GALLERY_QUEST_COMPLETE_KEY) === "1";
}

export function markGalleryQuestCompleteStorage() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GALLERY_QUEST_COMPLETE_KEY, "1");
}

export function loadGalleryQuest(trashedIds: string[]): GalleryQuestPersist {
  const empty: GalleryQuestPersist = { trashedDecoyIds: [] };
  try {
    const raw = sessionStorage.getItem(GALLERY_QUEST_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as GalleryQuestPersist;
    return {
      trashedDecoyIds: (parsed.trashedDecoyIds ?? []).filter((id) =>
        trashedIds.includes(id)
      ),
    };
  } catch {
    return empty;
  }
}

export function saveGalleryQuest(state: GalleryQuestPersist) {
  sessionStorage.setItem(GALLERY_QUEST_STORAGE_KEY, JSON.stringify(state));
}
