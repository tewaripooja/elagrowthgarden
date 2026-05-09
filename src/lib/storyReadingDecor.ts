export type ReadingDecorChunk = { type: "phrase" | "plain"; text: string };

/** Split text into alternating plain / phrase spans for highlighting (longest phrase wins at each offset). */
export function buildReadingChunks(text: string, phrases: string[]): ReadingDecorChunk[] {
  const sorted = [...new Set(phrases.map((p) => p.trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!sorted.length || !text) return [{ type: "plain", text }];

  const out: ReadingDecorChunk[] = [];
  let pos = 0;
  while (pos < text.length) {
    let matchLen = 0;
    for (const phrase of sorted) {
      if (!phrase.length) continue;
      const slice = text.slice(pos, pos + phrase.length);
      if (slice.toLowerCase() === phrase.toLowerCase()) {
        matchLen = Math.max(matchLen, phrase.length);
      }
    }
    if (matchLen > 0) {
      out.push({ type: "phrase", text: text.slice(pos, pos + matchLen) });
      pos += matchLen;
      continue;
    }
    let next = text.length;
    for (const phrase of sorted) {
      const idx = text.toLowerCase().indexOf(phrase.toLowerCase(), pos + 1);
      if (idx !== -1) next = Math.min(next, idx);
    }
    out.push({ type: "plain", text: text.slice(pos, next) });
    pos = next;
  }
  return out;
}

/** First sentence-like chunk for gentle emphasis (length capped). */
export function openingSentenceForHighlight(text: string): string | null {
  const t = text.trim();
  if (t.length < 24) return null;
  const m = t.match(/^[\s\S]{12,180}?[.!?](?=\s|$)/);
  const hit = m?.[0]?.trim();
  if (!hit || hit.length < 20 || hit.length > 200) return null;
  return hit;
}
