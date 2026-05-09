/** Max incorrect tries per question before locking and revealing the answer (anti brute-force). */
export const MAX_ACTIVITY_ATTEMPTS = 2;

/**
 * After a failed try, how many tries remain before the answer is revealed.
 * `failedSoFar` is the count of failed submissions/selections including this one.
 */
export function attemptsLeftBeforeReveal(failedSoFar: number): number {
  return Math.max(0, MAX_ACTIVITY_ATTEMPTS - failedSoFar);
}

export function remainingAttemptsHint(failedSoFar: number): string | null {
  const left = attemptsLeftBeforeReveal(failedSoFar);
  if (left <= 0) return null;
  if (left === 1) {
    return "One more thoughtful try — after that we'll show the answer so you can learn from it.";
  }
  return `${left} tries left — then we'll show the answer to help you learn.`;
}

/** Story shown above activity tabs — reuse after a question locks. */
export const PASSAGE_ABOVE_HINT =
  "Tip: Scroll up to the full story and skim that part again — revisiting the passage usually helps.";

/** Activities using EvidenceSentencePicker — passage is inline in the activity card. */
export const PASSAGE_INLINE_HINT =
  "Tip: Skim the numbered sentences right above — notice how one lines up with the answer we're showing.";
