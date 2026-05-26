import type { CombinedStoryData } from "@/lib/ai";

const STORAGE_KEY = "ela-guest-active-story-v1";

export interface GuestActiveStory {
  story: CombinedStoryData;
  round: number;
  completedActivities: Record<string, boolean>;
  readingFlowComplete: boolean;
  fromReadingHome: boolean;
}

function load(): GuestActiveStory | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestActiveStory;
  } catch {
    return null;
  }
}

function save(active: GuestActiveStory | null) {
  try {
    if (active === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    }
  } catch {
    /* ignore */
  }
}

export function getGuestActiveStory(): GuestActiveStory | null {
  return load();
}

export function saveGuestActiveStory(active: GuestActiveStory | null) {
  save(active);
}

export function clearGuestActiveStory() {
  save(null);
}
