import type {
  CharacterTraitQuestion,
  FactOpinionStatement,
  SummaryOption,
  VocabularyWord,
} from "@/lib/ai";

export function explainVocabularyCorrect(word: VocabularyWord, correctLabel: string): string {
  if ("whyCorrect" in word && word.whyCorrect) return word.whyCorrect;
  return `“${correctLabel}” fits how “${word.word}” is used in the passage — the other choices describe different ideas.`;
}

export function explainFactOpinionCorrect(statement: FactOpinionStatement): string {
  if (statement.whyCorrect) return statement.whyCorrect;
  return statement.type === "fact"
    ? "Facts can be checked against what happened in the story — characters, actions, or details that are stated."
    : "Opinions share what someone thinks, prefers, or believes — they aren’t proved only by story facts.";
}

export function explainSummaryCorrect(option: SummaryOption): string {
  if (option.whyCorrect) return option.whyCorrect;
  return "The best summary stays close to the main events without inventing scenes or leaving out the central problem.";
}

export function explainTraitCorrect(question: CharacterTraitQuestion, answerLabel: string): string {
  if ("whyCorrect" in question && question.whyCorrect) return question.whyCorrect;
  return `“${answerLabel}” fits what the character does and cares about across the story — look for repeated actions or reactions as clues.`;
}

export function explainCompareContrastReveal(custom?: string): string {
  return (
    custom ??
    "Strong answers name something similar in both stories and something clearly different, using real details instead of vague words."
  );
}
