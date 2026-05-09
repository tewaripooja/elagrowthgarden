import { splitIntoSentences } from "@/lib/storySections";

function tokenize(s: string): string[] {
  const m = s.toLowerCase().match(/\b[a-z]{3,}\b/gi);
  return m ?? [];
}

function overlapScore(sentence: string, reference: string): number {
  const refWords = new Set(tokenize(reference));
  if (refWords.size === 0) return 0;
  let n = 0;
  for (const w of tokenize(sentence)) {
    if (refWords.has(w)) n += 1;
  }
  return n;
}

/**
 * True if the chosen sentence has the strongest overlap with `referenceText`
 * among all sentences in the story (ties count as valid).
 * Used to validate that the student picked supporting evidence for their answer.
 */
export function isEvidenceAcceptable(
  story: string,
  selectedSentenceIndex: number,
  referenceText: string,
): boolean {
  const sentences = splitIntoSentences(story ?? "");
  if (selectedSentenceIndex < 0 || selectedSentenceIndex >= sentences.length) return false;
  const ref = referenceText.trim();
  if (!ref) return false;

  const scores = sentences.map((s) => overlapScore(s, ref));
  const best = Math.max(0, ...scores);
  const chosen = scores[selectedSentenceIndex] ?? 0;

  if (best >= 2) {
    return chosen === best;
  }
  if (best === 1) {
    return chosen === 1;
  }
  // Weak signals: allow if the sentence shares a long substring with reference (names, quotes)
  const words = tokenize(ref);
  const picked = sentences[selectedSentenceIndex]!.toLowerCase();
  for (const w of words) {
    if (w.length >= 5 && picked.includes(w)) return true;
  }
  return false;
}
