/** Base answer points before retry decay (first correct attempt earns full base). */
export const SCORE_BASE_ANSWER = 100;

/** Per extra attempt after the first, multiply prior step by this (geometric decay). */
export const RETRY_DECAY = 0.58;

/** Added to subtotal when evidence is required and correct on the winning attempt. */
export const EVIDENCE_BONUS = 25;

export type QuestionResolution = {
  questionKey: string;
  /** Successful attempts count when learner eventually got it right; `0` = revealed / skipped without a correct solve. */
  attemptsToCorrect: number;
  evidenceApplies: boolean;
  /** Meaningful only when `evidenceApplies` and learner succeeded (`attemptsToCorrect > 0`). */
  evidenceCorrect: boolean;
};

export type ReadingMetrics = {
  totalSecondsSpent: number;
  totalMinimumSeconds: number;
};

export type QuestionScoreComputation = {
  attempts_to_correct: number;
  answer_points: number;
  evidence_bonus: number;
  subtotal_before_reading: number;
  reading_ratio: number | null;
  reading_factor: number;
  final_points: number;
  breakdown: Record<string, unknown>;
};

/** Extremely rushed reading vs suggested minimum pace reduces quiz score multiplier. */
export function readingTimeMultiplier(spent: number, minimum: number): { factor: number; ratio: number } {
  if (!Number.isFinite(spent) || !Number.isFinite(minimum) || minimum <= 0) {
    return { factor: 1, ratio: 1 };
  }
  const ratio = spent / minimum;
  if (ratio < 0.32) return { factor: 0.42, ratio };
  if (ratio < 0.5) return { factor: 0.68, ratio };
  if (ratio < 0.72) return { factor: 0.85, ratio };
  return { factor: 1, ratio };
}

export function computeAnswerPoints(attemptsToCorrect: number): number {
  if (attemptsToCorrect <= 0) return 0;
  return Math.round(SCORE_BASE_ANSWER * RETRY_DECAY ** (attemptsToCorrect - 1));
}

export function computeEvidenceBonus(
  attemptsToCorrect: number,
  evidenceApplies: boolean,
  evidenceCorrect: boolean,
): number {
  if (attemptsToCorrect <= 0 || !evidenceApplies) return 0;
  return evidenceCorrect ? EVIDENCE_BONUS : 0;
}

export function computeQuestionScore(
  res: QuestionResolution | undefined,
  reading: ReadingMetrics | null,
): QuestionScoreComputation {
  const attempts = res?.attemptsToCorrect ?? 0;
  const evidenceApplies = res?.evidenceApplies ?? false;
  const evidenceCorrect = res?.evidenceCorrect ?? false;

  const answerPoints = computeAnswerPoints(attempts);
  const evidenceBonus = computeEvidenceBonus(attempts, evidenceApplies, evidenceCorrect);
  const subtotal = answerPoints + evidenceBonus;

  let readingFactor = 1;
  let readingRatio: number | null = null;
  if (reading && reading.totalMinimumSeconds > 0) {
    const m = readingTimeMultiplier(reading.totalSecondsSpent, reading.totalMinimumSeconds);
    readingFactor = m.factor;
    readingRatio = m.ratio;
  }

  const finalPoints = Math.round(subtotal * readingFactor);

  return {
    attempts_to_correct: attempts,
    answer_points: answerPoints,
    evidence_bonus: evidenceBonus,
    subtotal_before_reading: subtotal,
    reading_ratio: readingRatio,
    reading_factor: readingFactor,
    final_points: finalPoints,
    breakdown: {
      baseAnswer: SCORE_BASE_ANSWER,
      retryDecay: RETRY_DECAY,
      evidenceBonusConfigured: EVIDENCE_BONUS,
      firstAttemptSuccess: attempts === 1,
      hadSuccess: attempts > 0,
      readingSeconds: reading?.totalSecondsSpent ?? null,
      readingMinimumSeconds: reading?.totalMinimumSeconds ?? null,
    },
  };
}
