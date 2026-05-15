import type { CombinedStoryData } from "@/lib/ai";

const STORAGE_KEY = "ela-guest-trial-v1";

export interface GuestActiveStory {
  story: CombinedStoryData;
  round: number;
  completedActivities: Record<string, boolean>;
  readingFlowComplete: boolean;
  fromReadingHome: boolean;
}

interface GuestTrialState {
  storiesStarted: number;
  activeStory: GuestActiveStory | null;
}

function load(): GuestTrialState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GuestTrialState;
      return {
        storiesStarted: parsed.storiesStarted ?? 0,
        activeStory: parsed.activeStory ?? null,
      };
    }
  } catch {
    /* ignore */
  }
  return { storiesStarted: 0, activeStory: null };
}

function save(state: GuestTrialState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/** Guest may still start their one free story. */
export function canStartGuestStory(): boolean {
  return load().storiesStarted < 1;
}

export function hasUsedGuestTrial(): boolean {
  return load().storiesStarted >= 1;
}

export function markGuestStoryStarted() {
  const state = load();
  if (state.storiesStarted < 1) {
    save({ ...state, storiesStarted: 1 });
  }
}

export function getGuestActiveStory(): GuestActiveStory | null {
  return load().activeStory;
}

export function saveGuestActiveStory(active: GuestActiveStory | null) {
  const state = load();
  save({ ...state, activeStory: active });
}

export function clearGuestActiveStory() {
  const state = load();
  save({ ...state, activeStory: null });
}
