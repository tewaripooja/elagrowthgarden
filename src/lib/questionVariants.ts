import type { SummaryOption } from "@/lib/ai";

/** Shared MCQ slice before/after display shuffling */
export type McqSlice = { options: string[]; correctIndex: number };

/** Fisher–Yates shuffle of indices applied to options; updates correctIndex for the new order. */
export function shuffleMcqOptions(slice: McqSlice): McqSlice {
  const { options, correctIndex } = slice;
  const n = options.length;
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  const shuffled = order.map((i) => options[i]!);
  const newCorrect = order.indexOf(correctIndex);
  return { options: shuffled, correctIndex: newCorrect };
}

export type VocabularyWordInput =
  | { word: string; variants: McqSlice[] }
  | { word: string; options: string[]; correctIndex: number };

export function vocabularyConceptVariants(w: VocabularyWordInput): McqSlice[] {
  if ("variants" in w && Array.isArray(w.variants) && w.variants.length > 0) {
    return w.variants;
  }
  const legacy = w as { options: string[]; correctIndex: number };
  return [{ options: legacy.options, correctIndex: legacy.correctIndex }];
}

export type CharacterTraitQuestionInput =
  | { question: string; variants: McqSlice[] }
  | { question: string; options: string[]; correctIndex: number };

export function characterTraitConceptVariants(q: CharacterTraitQuestionInput): McqSlice[] {
  if ("variants" in q && Array.isArray(q.variants) && q.variants.length > 0) {
    return q.variants;
  }
  const legacy = q as { options: string[]; correctIndex: number };
  return [{ options: legacy.options, correctIndex: legacy.correctIndex }];
}

export function pickInitialMcqPresentation(variants: McqSlice[]): { slice: McqSlice; variantIdx: number } {
  const variantIdx = Math.floor(Math.random() * variants.length);
  const slice = shuffleMcqOptions(variants[variantIdx]!);
  return { slice, variantIdx };
}

/** Prefer a different variant than the last when multiple exist; always reshuffle option order. */
export function pickRetryMcqPresentation(
  variants: McqSlice[],
  prevVariantIdx: number,
): { slice: McqSlice; variantIdx: number } {
  let variantIdx = Math.floor(Math.random() * variants.length);
  if (variants.length > 1) {
    let guard = 0;
    while (variantIdx === prevVariantIdx && guard++ < 12) {
      variantIdx = Math.floor(Math.random() * variants.length);
    }
  }
  const slice = shuffleMcqOptions(variants[variantIdx]!);
  return { slice, variantIdx };
}

export function summariesConceptVariants(data: {
  options: SummaryOption[];
  summaryVariants?: SummaryOption[][];
}): SummaryOption[][] {
  const base = [data.options];
  if (data.summaryVariants && data.summaryVariants.length > 0) {
    return [...base, ...data.summaryVariants];
  }
  return base;
}

export function shuffleSummaryOptions(options: SummaryOption[]): SummaryOption[] {
  const n = options.length;
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order.map((i) => options[i]!);
}

export function pickInitialSummaryPresentation(sets: SummaryOption[][]): {
  variantIdx: number;
  displayOptions: SummaryOption[];
} {
  const variantIdx = Math.floor(Math.random() * sets.length);
  const displayOptions = shuffleSummaryOptions(sets[variantIdx]!);
  return { variantIdx, displayOptions };
}

export function pickRetrySummaryPresentation(
  sets: SummaryOption[][],
  prevVariantIdx: number,
): { variantIdx: number; displayOptions: SummaryOption[] } {
  let variantIdx = Math.floor(Math.random() * sets.length);
  if (sets.length > 1) {
    let guard = 0;
    while (variantIdx === prevVariantIdx && guard++ < 12) {
      variantIdx = Math.floor(Math.random() * sets.length);
    }
  }
  const displayOptions = shuffleSummaryOptions(sets[variantIdx]!);
  return { variantIdx, displayOptions };
}
