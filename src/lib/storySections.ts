/** Fix common model glues like "yard,but" → "yard, but" so tokenization keeps word gaps. */
function softenDensePunctuation(text: string): string {
  return text
    .replace(/,(?!\s)/g, ", ")
    .replace(/\.(?=[A-Za-z])/g, ". ")
    .replace(/\?(?=[A-Za-z])/g, "? ")
    .replace(/!(?=[A-Za-z])/g, "! ")
    .replace(/\s+/g, " ")
    .trim();
}

/** When there are too few sentences, pack whole-story words into sections (avoids slicing mid-word). */
function splitByWordsIntoBuckets(text: string, n: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return splitByCharacters(text, n);
  if (words.length <= n) {
    const out = [...words];
    while (out.length < n) out.push("…");
    return out;
  }
  const buckets: string[][] = Array.from({ length: n }, () => []);
  const base = Math.floor(words.length / n);
  let extra = words.length % n;
  let wi = 0;
  for (let k = 0; k < n; k++) {
    const take = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    buckets[k] = words.slice(wi, wi + take);
    wi += take;
  }
  return buckets.map((b) => b.join(" "));
}

/** Split plain text on sentence boundaries (handles missing final punctuation). */
export function splitIntoSentences(text: string): string[] {
  if (text == null || typeof text !== "string") return [];
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const rough = normalized.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  return rough.length > 0 ? rough : [normalized];
}

function splitByCharacters(text: string, n: number): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return Array.from({ length: n }, () => "…");
  const len = t.length;
  const parts: string[] = [];
  for (let k = 0; k < n; k++) {
    const a = Math.floor((k * len) / n);
    const b = Math.floor(((k + 1) * len) / n);
    parts.push(t.slice(a, b).trim() || "…");
  }
  return parts;
}

/** Target 3–5 sections; slice sentences proportionally when there are enough sentences. */
export function splitStoryIntoSections(story: string): string[] {
  if (story == null || typeof story !== "string") {
    return splitByCharacters("", 3);
  }
  const repaired = softenDensePunctuation(story);
  const sentences = splitIntoSentences(repaired);
  const charLen = repaired.length;
  let n: number;
  if (sentences.length === 3) {
    n = 3;
  } else if (charLen < 420) {
    n = 3;
  } else if (charLen < 820) {
    n = 4;
  } else {
    n = 5;
  }
  n = Math.max(3, Math.min(5, n));

  if (sentences.length < 3) {
    return splitByWordsIntoBuckets(repaired, n);
  }

  n = Math.min(n, sentences.length);

  const chunks: string[] = [];
  let idx = 0;
  for (let k = 0; k < n; k++) {
    const nextIdx = Math.round(((k + 1) / n) * sentences.length);
    const sliceEnd = Math.min(sentences.length, Math.max(idx + 1, nextIdx));
    chunks.push(sentences.slice(idx, sliceEnd).join(" ").trim());
    idx = sliceEnd;
  }
  if (idx < sentences.length) {
    const last = chunks.length - 1;
    chunks[last] = `${chunks[last]} ${sentences.slice(idx).join(" ")}`.trim();
  }
  return chunks;
}

export type SectionCheckpoint = {
  question: string;
  options: string[];
  correctIndex: number;
};

/** One multiple-choice checkpoint: pick the sentence that belongs in this section. */
export function buildSectionCheckpoint(sections: string[], sectionIndex: number): SectionCheckpoint {
  const target = sections[sectionIndex] ?? "";
  const pool = splitIntoSentences(target).filter((s) => s.length > 12);
  const pickLongest = (arr: string[]) =>
    [...arr].sort((a, b) => b.length - a.length)[0] ?? target.slice(0, Math.min(120, target.length));

  const correct = pickLongest(pool.length > 0 ? pool : [target]);

  const wrongPool: string[] = [];
  sections.forEach((sec, i) => {
    if (i === sectionIndex) return;
    splitIntoSentences(sec)
      .filter((s) => s.length > 12 && !normalizeForCompare(s).startsWith(normalizeForCompare(correct).slice(0, 20)))
      .forEach((s) => wrongPool.push(s));
  });

  const shuffledWrong = [...wrongPool].sort(() => Math.random() - 0.5);
  const wrongPick: string[] = [];
  for (const w of shuffledWrong) {
    if (wrongPick.length >= 3) break;
    if (!wrongPick.some((x) => normalizeForCompare(x) === normalizeForCompare(w))) wrongPick.push(w);
  }
  while (wrongPick.length < 3) {
    wrongPick.push(`A detail that belongs in a different part of the story. (${wrongPick.length + 1})`);
  }

  const options = [correct, ...wrongPick.slice(0, 3)];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j]!, options[i]!];
  }
  const correctIndex = options.findIndex((o) => normalizeForCompare(o) === normalizeForCompare(correct));

  return {
    question: "Which detail belongs in this part of the story?",
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
}

function normalizeForCompare(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function vocabularyWordsInText(
  words: { word: string }[],
  sectionText: string,
): { word: string }[] {
  const lower = sectionText.toLowerCase();
  return (words ?? []).filter((w) => {
    const pat = new RegExp(`\\b${escapeRegExp(w.word)}\\b`, "i");
    return pat.test(lower);
  });
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Default assumed reading speed for minimum-time validation (words per minute). */
export const DEFAULT_READING_WPM = 150;

export function countWords(text: string): number {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

/**
 * Minimum seconds we suggest for reading `wordCount` words at `wpm`.
 * Clamped so very short sections still get a brief floor (~8s).
 */
export function minimumReadingSeconds(
  wordCount: number,
  wpm: number = DEFAULT_READING_WPM,
): number {
  if (wordCount <= 0) return 8;
  const seconds = Math.ceil((wordCount / wpm) * 60);
  return Math.max(8, seconds);
}
