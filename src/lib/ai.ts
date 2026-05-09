import { supabase } from "@/integrations/supabase/client";

export type ActivityType = "vocabulary" | "compare-contrast" | "fact-opinion" | "summaries" | "character-traits";

/** One MCQ form of a vocab item; same difficulty, different distractors. */
export type VocabularyWordVariant = { options: string[]; correctIndex: number };

export type VocabularyWord =
  | { word: string; whyCorrect?: string; variants: VocabularyWordVariant[] }
  | { word: string; whyCorrect?: string; options: string[]; correctIndex: number };

export interface VocabularyData {
  words: VocabularyWord[];
}

export interface CompareContrastData {
  story2: string;
  question: string;
  sampleAnswer: string;
  /** Shown after max wrong tries with the sample answer */
  sampleWhyCorrect?: string;
}

export type FactOpinionStatement = { text: string; type: "fact" | "opinion"; whyCorrect?: string };

export interface FactOpinionData {
  statements: FactOpinionStatement[];
}

export type SummaryOption = { text: string; correct: boolean; whyCorrect?: string };

export interface SummariesData {
  options: SummaryOption[];
  /** Extra summary triples (beyond `options`) with the same difficulty pattern; UI rotates among options + these. */
  summaryVariants?: SummaryOption[][];
}

export type CharacterTraitVariant = { options: string[]; correctIndex: number };

export type CharacterTraitQuestion =
  | { question: string; whyCorrect?: string; variants: CharacterTraitVariant[] }
  | { question: string; whyCorrect?: string; options: string[]; correctIndex: number };

export interface CharacterTraitsData {
  questions: CharacterTraitQuestion[];
}

export type ActivityData = VocabularyData | CompareContrastData | FactOpinionData | SummariesData | CharacterTraitsData;

/** Optional emphasis for Reading / StoryReadingFlow (bundled + AI stories may omit). */
export interface StoryReadingExtras {
  /** Important phrases to spotlight (opening sentence is auto-added when suitable). */
  keyPhrases?: string[];
}

export interface CombinedStoryData {
  title: string;
  genre: string;
  story: string;
  vocabulary: VocabularyData;
  factOpinion: FactOpinionData;
  summaries: SummariesData;
  characterTraits: CharacterTraitsData;
  compareContrast: CompareContrastData;
  readingExtras?: StoryReadingExtras;
}

export async function generateCombinedStory(
  gradeLevel: number,
  genre: string
): Promise<CombinedStoryData> {
  const { data, error } = await supabase.functions.invoke("generate-story", {
    body: { gradeLevel, genre },
  });

  if (error) throw new Error(error.message || "Failed to generate content");
  return data;
}
