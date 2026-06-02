import type { CombinedStoryData } from "@/lib/ai";
import { SAMPLE_STORIES_BY_GENRE } from "@/data/sampleStoriesData";
import { SAMPLE_STORIES_TIER1 } from "@/data/tier1StoriesData";
import { SAMPLE_STORIES_TIER3 } from "@/data/tier3StoriesData";
import { STORY_GENRES } from "@/lib/storyGenres";
import type { StoryTier } from "@/lib/gradeLevel";

/** Picks one bundled story for the genre, supporting exclusions and fallback signaling. */
export function pickSampleStory(
  genreLabel: string,
  lastTitle: string | null,
  excludedTitles: Set<string> = new Set(),
  tier: StoryTier = 2,
): CombinedStoryData | null {
  const id = STORY_GENRES.find((g) => g.label === genreLabel)?.id ?? "adventure";
  const byTier = tier === 1 ? SAMPLE_STORIES_TIER1 : tier === 3 ? SAMPLE_STORIES_TIER3 : SAMPLE_STORIES_BY_GENRE;
  const pool = (byTier[id] ?? byTier.adventure) as CombinedStoryData[];
  const filtered = pool.filter((s) => {
    if (excludedTitles.has(s.title)) return false;
    if (lastTitle && s.title === lastTitle) return false;
    return true;
  });
  const choices = filtered.length > 0 ? filtered : [...pool];
  if (choices.length === 0) return null;
  return choices[Math.floor(Math.random() * choices.length)] ?? null;
}

/** Reload a bundled story when restoring the learner’s daily session (exact title match). Searches all tiers. */
export function findBundledStoryByTitle(genreLabel: string, title: string): CombinedStoryData | null {
  const id = STORY_GENRES.find((g) => g.label === genreLabel)?.id ?? "adventure";
  for (const byTier of [SAMPLE_STORIES_BY_GENRE, SAMPLE_STORIES_TIER1, SAMPLE_STORIES_TIER3]) {
    const pool = (byTier[id] ?? byTier.adventure) as CombinedStoryData[];
    const found = pool.find((s) => s.title === title);
    if (found) return found;
  }
  return null;
}
