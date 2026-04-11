import { supabase } from "@/integrations/supabase/client";

export type ActivityType = "vocabulary" | "compare-contrast" | "fact-opinion" | "summaries" | "character-traits";

export interface VocabularyData {
  words: { word: string; options: string[]; correctIndex: number }[];
}

export interface CompareContrastData {
  story2: string;
  question: string;
  sampleAnswer: string;
}

export interface FactOpinionData {
  statements: { text: string; type: "fact" | "opinion" }[];
}

export interface SummariesData {
  options: { text: string; correct: boolean }[];
}

export interface CharacterTraitsData {
  questions: { question: string; options: string[]; correctIndex: number }[];
}

export type ActivityData = VocabularyData | CompareContrastData | FactOpinionData | SummariesData | CharacterTraitsData;

export interface CombinedStoryData {
  title: string;
  genre: string;
  story: string;
  vocabulary: VocabularyData;
  factOpinion: FactOpinionData;
  summaries: SummariesData;
  characterTraits: CharacterTraitsData;
  compareContrast: CompareContrastData;
}

export async function generateCombinedStory(gradeLevel: number): Promise<CombinedStoryData> {
  const { data, error } = await supabase.functions.invoke("generate-story", {
    body: { gradeLevel },
  });

  if (error) throw new Error(error.message || "Failed to generate content");
  return data;
}
