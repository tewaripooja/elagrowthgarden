import { supabase } from "@/integrations/supabase/client";

export type ActivityType = "vocabulary" | "compare-contrast" | "fact-opinion" | "summaries" | "character-traits";

export interface VocabularyData {
  story: string;
  words: { word: string; options: string[]; correctIndex: number }[];
}

export interface CompareContrastData {
  story1: string;
  story2: string;
  question: string;
  sampleAnswer: string;
}

export interface FactOpinionData {
  story: string;
  statements: { text: string; type: "fact" | "opinion" }[];
}

export interface SummariesData {
  story: string;
  options: { text: string; correct: boolean }[];
}

export interface CharacterTraitsData {
  story: string;
  questions: { question: string; options: string[]; correctIndex: number }[];
}

export type ActivityData = VocabularyData | CompareContrastData | FactOpinionData | SummariesData | CharacterTraitsData;

export async function generateContent(activityType: ActivityType, gradeLevel: number): Promise<ActivityData> {
  const { data, error } = await supabase.functions.invoke("generate-story", {
    body: { activityType, gradeLevel },
  });

  if (error) throw new Error(error.message || "Failed to generate content");
  return data;
}
