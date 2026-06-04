/**
 * Derives up to 10 BossQuestion items from the story the kid just read.
 * Falls back gracefully if a section is missing or has no usable MCQ data.
 */

import type { CombinedStoryData, VocabularyWord, CharacterTraitQuestion } from '@/lib/ai';
import type { BossQuestion } from '@/types/game';

// ── helpers ───────────────────────────────────────────────────────────────────

function getVocabOptions(w: VocabularyWord): { options: string[]; correctIndex: number } | null {
  if ('variants' in w && w.variants.length > 0) {
    const v = w.variants[0];
    return { options: v.options, correctIndex: v.correctIndex };
  }
  if ('options' in w) {
    return { options: (w as { options: string[]; correctIndex: number }).options,
             correctIndex: (w as { options: string[]; correctIndex: number }).correctIndex };
  }
  return null;
}

function getTraitOptions(q: CharacterTraitQuestion): { options: string[]; correctIndex: number } | null {
  if ('variants' in q && q.variants.length > 0) {
    const v = q.variants[0];
    return { options: v.options, correctIndex: v.correctIndex };
  }
  if ('options' in q) {
    return { options: (q as { options: string[]; correctIndex: number }).options,
             correctIndex: (q as { options: string[]; correctIndex: number }).correctIndex };
  }
  return null;
}

// ── main export ───────────────────────────────────────────────────────────────

export function deriveQuestionsFromStory(story: CombinedStoryData): BossQuestion[] {
  const questions: BossQuestion[] = [];

  // ── Vocabulary (up to 3) ──────────────────────────────────────────────────
  const words = story.vocabulary?.words ?? [];
  for (const w of words.slice(0, 3)) {
    const mcq = getVocabOptions(w);
    if (!mcq || mcq.options.length < 2) continue;
    questions.push({
      question: `What does "${w.word}" mean?`,
      options: mcq.options,
      correctIndex: mcq.correctIndex,
      activityType: 'vocabulary',
    });
  }

  // ── Fact / Opinion (up to 3) ──────────────────────────────────────────────
  const statements = story.factOpinion?.statements ?? [];
  for (const s of statements.slice(0, 3)) {
    questions.push({
      question: `Is this a fact or opinion?\n"${s.text}"`,
      options: ['Fact', 'Opinion'],
      correctIndex: s.type === 'fact' ? 0 : 1,
      activityType: 'fact_opinion',
    });
  }

  // ── Character Traits (up to 2) ────────────────────────────────────────────
  const traitQs = story.characterTraits?.questions ?? [];
  for (const q of traitQs.slice(0, 2)) {
    const mcq = getTraitOptions(q);
    if (!mcq || mcq.options.length < 2) continue;
    questions.push({
      question: q.question,
      options: mcq.options,
      correctIndex: mcq.correctIndex,
      activityType: 'character_traits',
    });
  }

  // ── Summary (up to 2) ─────────────────────────────────────────────────────
  // Build a 4-option MCQ from the summary options list
  const summaryOptions = story.summaries?.options ?? [];
  const correctSummaries = summaryOptions.filter(o => o.correct);
  const wrongSummaries   = summaryOptions.filter(o => !o.correct);

  if (correctSummaries.length > 0 && wrongSummaries.length >= 1) {
    const correct = correctSummaries[0];
    // Pick up to 3 wrong ones to fill a 4-option button set
    const wrongs = wrongSummaries.slice(0, 3);
    // Insert correct at a random position
    const allOpts = [...wrongs];
    const insertAt = Math.floor(Math.random() * (allOpts.length + 1));
    allOpts.splice(insertAt, 0, correct);
    questions.push({
      question: 'Which is the BEST summary of the story?',
      options: allOpts.map(o => o.text),
      correctIndex: insertAt,
      activityType: 'summary',
    });
  }

  // Also use summaryVariants if available
  const variants = story.summaries?.summaryVariants ?? [];
  if (variants.length > 0) {
    const variant = variants[0];
    const correctV = variant.find(o => o.correct);
    const wrongsV  = variant.filter(o => !o.correct);
    if (correctV && wrongsV.length >= 1) {
      const allOpts = wrongsV.slice(0, 3);
      const insertAt = Math.floor(Math.random() * (allOpts.length + 1));
      allOpts.splice(insertAt, 0, correctV);
      questions.push({
        question: 'Which summary best captures the main idea?',
        options: allOpts.map(o => o.text),
        correctIndex: insertAt,
        activityType: 'summary',
      });
    }
  }

  return questions;
}

/** Shuffle an array in-place (Fisher-Yates) and return it. */
export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` random questions from the story-derived pool.
 * If the pool is too small, pad with fallback static questions (deduplicated).
 */
export function pickBossQuestions(
  storyQuestions: BossQuestion[],
  fallback: BossQuestion[],
  count = 5,
): BossQuestion[] {
  const pool = shuffled(storyQuestions);
  if (pool.length >= count) return pool.slice(0, count);

  // Pad with shuffled fallback questions not already in pool
  const storyTexts = new Set(pool.map(q => q.question));
  const extra = shuffled(fallback).filter(q => !storyTexts.has(q.question));
  return [...pool, ...extra].slice(0, count);
}
