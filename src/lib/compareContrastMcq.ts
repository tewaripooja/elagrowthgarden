/**
 * Derives two MCQ questions from compare/contrast data without needing AI.
 *
 * Q1 — "What do both stories have in common?"
 * Q2 — "What is the main difference between the stories?"
 *
 * Correct answers come from the AI-generated sampleAnswer (split on transition
 * words). Wrong options come from story sentences so they're grounded in the
 * actual text but clearly don't describe a valid comparison.
 */

import { splitIntoSentences } from '@/lib/storySections';

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function cap(s: string, max = 110): string {
  const trimmed = s.trim().replace(/[,\s]+$/, '');
  return trimmed.length <= max ? trimmed : trimmed.slice(0, max - 1) + '…';
}

/** Split sampleAnswer into a similarity clause and a difference clause. */
function splitAnswer(ans: string): { similarity: string; difference: string } {
  // Try to split on common contrast transition words
  const transitionRe = /\b(however|but|while|whereas|in contrast|on the other hand|differs?|unlike|although|though|yet|still,)\b/i;
  const idx = ans.search(transitionRe);

  if (idx > 20) {
    const similarity = ans.slice(0, idx).trim().replace(/[,.\s]+$/, '');
    const difference = ans.slice(idx).trim();
    if (similarity.length > 10 && difference.length > 10) {
      return { similarity, difference };
    }
  }

  // Fallback: split on sentence boundary
  const sentences = ans.match(/[^.!?]+[.!?]+/g) ?? [];
  if (sentences.length >= 2) {
    return {
      similarity: sentences[0]!.trim(),
      difference: sentences.slice(1).join(' ').trim(),
    };
  }

  return { similarity: ans, difference: ans };
}

export interface CompareMcqQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export function deriveCompareMcqs(
  story1: string,
  story2: string,
  sampleAnswer: string,
): [CompareMcqQuestion, CompareMcqQuestion] {
  const { similarity, difference } = splitAnswer(sampleAnswer);

  // Pick concrete sentences from each story to use as distractors.
  // We take sentences from the middle/end (they tend to be specific events
  // rather than generic scene-setters) so they clearly don't sound like
  // valid comparison answers.
  const s1 = splitIntoSentences(story1).filter(s => s.trim().length > 20);
  const s2 = splitIntoSentences(story2).filter(s => s.trim().length > 20);

  const s1Pick = s1[Math.floor(s1.length * 0.6)] ?? s1[0] ?? '';
  const s2Pick = s2[Math.floor(s2.length * 0.6)] ?? s2[0] ?? '';
  const s1Alt  = s1[Math.floor(s1.length * 0.3)] ?? s1[s1.length - 1] ?? '';
  const s2Alt  = s2[Math.floor(s2.length * 0.3)] ?? s2[s2.length - 1] ?? '';

  // ── Q1: Similarity ────────────────────────────────────────────────────────
  const simCorrect = cap(similarity);
  const simWrongs  = shuffled([
    cap(s1Pick),                 // specific story-1 event — not a shared trait
    cap(s2Pick),                 // specific story-2 event — not a shared trait
    cap(difference),             // the difference clause disguised as a similarity
  ]);
  const simOptions = shuffled([simCorrect, ...simWrongs.slice(0, 3)]);
  const simCorrectIdx = simOptions.indexOf(simCorrect);

  // ── Q2: Difference ────────────────────────────────────────────────────────
  const diffCorrect = cap(difference === sampleAnswer ? sampleAnswer : difference);
  const diffWrongs  = shuffled([
    cap(similarity),             // the similarity clause disguised as a difference
    cap(s1Alt),                  // out-of-context story-1 sentence
    cap(s2Alt),                  // out-of-context story-2 sentence
  ]);
  const diffOptions = shuffled([diffCorrect, ...diffWrongs.slice(0, 3)]);
  const diffCorrectIdx = diffOptions.indexOf(diffCorrect);

  return [
    {
      question: 'What do both stories have in common?',
      options: simOptions,
      correctIndex: simCorrectIdx,
    },
    {
      question: 'What is the main difference between the two stories?',
      options: diffOptions,
      correctIndex: diffCorrectIdx,
    },
  ];
}
