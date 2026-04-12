import type { CombinedStoryData } from "@/lib/ai";
import { SAMPLE_STORIES_BY_GENRE } from "@/data/sampleStoriesData";
import { STORY_GENRES } from "@/lib/storyGenres";

/** Picks one of three bundled stories for the genre, avoiding the last title when possible. */
export function pickSampleStory(genreLabel: string, lastTitle: string | null): CombinedStoryData {
  const id = STORY_GENRES.find((g) => g.label === genreLabel)?.id ?? "adventure";
  const pool = SAMPLE_STORIES_BY_GENRE[id] ?? SAMPLE_STORIES_BY_GENRE.adventure;
  const filtered = lastTitle ? pool.filter((s) => s.title !== lastTitle) : [...pool];
  const choices = filtered.length > 0 ? filtered : [...pool];
  return choices[Math.floor(Math.random() * choices.length)]!;
}
