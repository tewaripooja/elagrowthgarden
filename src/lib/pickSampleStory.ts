import type { CombinedStoryData } from "@/lib/ai";
import { SAMPLE_STORIES_BY_GENRE } from "@/data/sampleStoriesData";
import { STORY_GENRES } from "@/lib/storyGenres";

/** Picks one bundled story for the genre, supporting exclusions and fallback signaling. */
export function pickSampleStory(
  genreLabel: string,
  lastTitle: string | null,
  excludedTitles: Set<string> = new Set(),
): CombinedStoryData | null {
  const id = STORY_GENRES.find((g) => g.label === genreLabel)?.id ?? "adventure";
  const pool = SAMPLE_STORIES_BY_GENRE[id] ?? SAMPLE_STORIES_BY_GENRE.adventure;
  const filtered = pool.filter((s) => {
    if (excludedTitles.has(s.title)) return false;
    if (lastTitle && s.title === lastTitle) return false;
    return true;
  });
  const choices = filtered.length > 0 ? filtered : [...pool];
  if (choices.length === 0) return null;
  return choices[Math.floor(Math.random() * choices.length)] ?? null;
}

/** Reload a bundled story when restoring the learner’s daily session (exact title match). */
export function findBundledStoryByTitle(genreLabel: string, title: string): CombinedStoryData | null {
  const id = STORY_GENRES.find((g) => g.label === genreLabel)?.id ?? "adventure";
  const pool = SAMPLE_STORIES_BY_GENRE[id] ?? SAMPLE_STORIES_BY_GENRE.adventure;
  return pool.find((s) => s.title === title) ?? null;
}
