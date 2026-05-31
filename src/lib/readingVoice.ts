/**
 * Expressive read-aloud for kids — splits text into sentences,
 * assigns per-sentence pitch / rate / volume based on punctuation
 * and emotional keywords, then chains utterances so the voice
 * rises for excitement, slows for mystery, and whispers for quiet moments.
 */

const FEMALE_OR_LIGHT_HINTS =
  /\b(female|woman|girl|child|junior|samantha|karen|moira|victoria|tessa|zira|serena|fiona|kate|zoe|zoë|ivy|ava|allison|susan|vicki|amelie|joana|nicky|sandy|shelley|susan|milena)\b/i;
const MALE_OR_DEEP_HINTS =
  /\b(male|man|\bfred\b|daniel|albert|bruce|thomas|\bdavid\b|tom\b|rishi|gordon|lee|ralph)\b/i;

function englishVoices(voices: SpeechSynthesisVoice[]) {
  return voices.filter((v) => /^en(-|$)/i.test(v.lang));
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const blob = `${v.name} ${v.voiceURI}`;
  let s = 0;
  if (FEMALE_OR_LIGHT_HINTS.test(blob)) s += 60;
  if (MALE_OR_DEEP_HINTS.test(blob)) s -= 45;
  if (/^en-US$/i.test(v.lang)) s += 12;
  if (/^en-GB$/i.test(v.lang)) s += 8;
  if (/premium|enhanced|natural|neural/i.test(blob)) s += 6;
  return s;
}

export function pickReadingVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const candidates = englishVoices(voices.length ? voices : []);
  if (!candidates.length) return null;
  let best = candidates[0];
  let bestScore = scoreVoice(best);
  for (let i = 1; i < candidates.length; i++) {
    const v = candidates[i];
    const sc = scoreVoice(v);
    if (sc > bestScore) { best = v; bestScore = sc; }
  }
  return bestScore > -100 ? best : candidates[0];
}

// ─── Expression rules ────────────────────────────────────────────────────────

type SpeechPart = {
  text: string;       // utterance text (trimStart applied)
  offset: number;     // absolute char position in the original full text
  rate: number;
  pitch: number;
  volume: number;
};

/** Derive per-sentence expressive settings from punctuation + keywords. */
function expressParams(sentence: string): { rate: number; pitch: number; volume: number } {
  let rate   = 0.87;
  let pitch  = 1.18;
  let volume = 0.88;

  const last = sentence.trimEnd().slice(-1);

  // Sentence-ending character
  if (last === "!") {
    pitch  = 1.40; rate  = 0.93; volume = 0.96;   // excited / loud
  } else if (last === "?") {
    pitch  = 1.30; rate  = 0.89;                   // curious, rising
  }

  // Ellipsis → slow & quiet (mysterious / trailing off)
  if (/\.{2,}/.test(sentence)) {
    rate   = Math.min(rate,   0.72);
    pitch  = Math.min(pitch,  1.05);
    volume = Math.min(volume, 0.78);
  }

  // Quoted dialogue → slight character-voice shift
  if (/["""'']/.test(sentence)) {
    pitch += 0.10;
    rate  += 0.03;
  }

  // Happy / exciting keywords
  if (/\b(amazing|wonderful|fantastic|incredible|excited|joy|happy|love|great|yay|hooray|wow|beautiful|perfect|brilliant|celebrate|cheered|laughed)\b/i.test(sentence)) {
    pitch  = Math.min(pitch  + 0.12, 1.55);
    rate   = Math.min(rate   + 0.05, 1.00);
    volume = Math.min(volume + 0.05, 0.98);
  }

  // Scary / tense / sad keywords
  if (/\b(scary|fear|afraid|dark|danger|terrible|horrible|sad|alone|lost|trembled|shook|crept|shadows|silent|cold|empty|strange|mysterious)\b/i.test(sentence)) {
    rate   = Math.max(rate   - 0.11, 0.66);
    pitch  = Math.max(pitch  - 0.14, 0.90);
    volume = Math.max(volume - 0.07, 0.74);
  }

  // Whisper / quiet action
  if (/\b(whispered|softly|quietly|gentle|tiptoed|murmured|breathed|hushed)\b/i.test(sentence)) {
    volume = Math.min(volume, 0.70);
    rate   = Math.min(rate,   0.79);
    pitch  = Math.max(pitch  - 0.05, 0.95);
  }

  // Shouting / urgent action
  if (/\b(shouted|yelled|cried|screamed|called out|roared|bellowed|exclaimed)\b/i.test(sentence)) {
    pitch  = Math.min(pitch  + 0.18, 1.58);
    volume = Math.min(volume + 0.09, 1.00);
    rate   = Math.min(rate   + 0.05, 1.00);
  }

  // Slow / careful actions
  if (/\b(slowly|carefully|hesitated|paused|crept|tiptoed|cautiously)\b/i.test(sentence)) {
    rate   = Math.max(rate  - 0.07, 0.70);
  }

  // Fast / sudden actions
  if (/\b(suddenly|quickly|fast|rushed|burst|leaped|jumped|ran|dashed|bolted)\b/i.test(sentence)) {
    rate   = Math.min(rate  + 0.08, 1.02);
  }

  return { rate, pitch, volume };
}

/** Split text into sentence-level SpeechParts, each with its absolute offset. */
function buildExpressiveParts(fullText: string): SpeechPart[] {
  // Match sentence-like chunks (greedy up to punctuation) or newlines
  const regex = /[^.!?\n]+(?:[.!?]+|$)|\n+/g;
  const parts: SpeechPart[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(fullText)) !== null) {
    const raw    = match[0];
    const rawIdx = match.index;

    // Trim leading whitespace, keep its length to adjust offset
    const leadingWs = raw.length - raw.trimStart().length;
    const trimmed   = raw.trimStart().trimEnd();

    if (!trimmed) continue;

    const { rate, pitch, volume } = expressParams(trimmed);
    parts.push({ text: trimmed, offset: rawIdx + leadingWs, rate, pitch, volume });
  }

  // Fallback: whole text as one part
  if (!parts.length) {
    const { rate, pitch, volume } = expressParams(fullText);
    parts.push({ text: fullText, offset: 0, rate, pitch, volume });
  }

  return parts;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Speak `fullText` with per-sentence expression.
 *
 * - `onBoundary(start, end)` fires for each spoken word with its absolute
 *   character range in `fullText` (for karaoke highlighting).
 * - `onDone` fires when all parts have finished.
 * - `onFail` fires on a non-cancellation error.
 *
 * Returns a `cancel()` function — call it to stop mid-speech.
 */
export function speakExpressive(
  fullText: string,
  onBoundary: (start: number, end: number) => void,
  onDone: () => void,
  onFail: () => void,
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onDone();
    return () => {};
  }

  window.speechSynthesis.cancel();

  const parts   = buildExpressiveParts(fullText);
  const voice   = pickReadingVoice();
  let cancelled = false;
  let partIdx   = 0;

  const speakNext = () => {
    if (cancelled) return;
    if (partIdx >= parts.length) { onDone(); return; }

    const part = parts[partIdx++];
    if (!part.text.trim()) { speakNext(); return; }

    const utt = new SpeechSynthesisUtterance(part.text);
    if (voice) { utt.voice = voice; utt.lang = voice.lang; }
    else        { utt.lang  = "en-US"; }

    utt.rate   = part.rate;
    utt.pitch  = part.pitch;
    utt.volume = part.volume;

    utt.addEventListener("boundary", (e: SpeechSynthesisEvent) => {
      if (cancelled || e.name !== "word") return;
      const start = part.offset + e.charIndex;
      const len   =
        (e as SpeechSynthesisEvent & { charLength?: number }).charLength ||
        (() => { const ws = part.text.slice(e.charIndex).search(/\s/); return ws === -1 ? part.text.length - e.charIndex : ws; })();
      onBoundary(start, start + len);
    });

    utt.onend   = speakNext;
    utt.onerror = (err) => {
      if (err.error === "interrupted" || err.error === "canceled") return;
      onFail();
    };

    window.speechSynthesis.speak(utt);
  };

  speakNext();
  return () => { cancelled = true; window.speechSynthesis.cancel(); };
}

/** Standalone word tap — kept simple (no chaining needed). */
function stripWordEdges(token: string) {
  return token.replace(/^[^\w']+|[^\w']+$/g, "").trim();
}

export function speakStandalonePreviewWord(rawToken: string) {
  const cleaned = stripWordEdges(rawToken) || rawToken.trim();
  if (!cleaned || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(cleaned);
  const voice = pickReadingVoice();
  if (voice) { utt.voice = voice; utt.lang = voice.lang; } else { utt.lang = "en-US"; }
  utt.rate = 0.87; utt.pitch = 1.18; utt.volume = 0.88;
  window.speechSynthesis.speak(utt);
}

/** Legacy single-utterance apply — still used by word-tap in StoryReadingFlow. */
export function applyReadingUtteranceVoice(utterance: SpeechSynthesisUtterance) {
  const voice = pickReadingVoice();
  if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
  else        { utterance.lang  = "en-US"; }
  utterance.rate   = 0.87;
  utterance.pitch  = 1.18;
  utterance.volume = 0.88;
}
