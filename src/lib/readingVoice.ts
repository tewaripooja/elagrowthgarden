/**
 * Pick a Web Speech voice that reads closer to a lighter / clearer narrator than many OS defaults.
 * Browser voices vary; we score English voices heuristically.
 */

const FEMALE_OR_LIGHT_HINTS =
  /\b(female|woman|girl|samantha|karen|moira|victoria|tessa|zira|serena|fiona|kate|zoe|zoë|ivy|ava|allison|susan|vicki)\b/i;
const MALE_OR_DEEP_HINTS =
  /\b(male|man|\bfred\b|daniel|albert|bruce|thomas|\bdavid\b|tom\b|rishi)\b/i;

function englishVoices(voices: SpeechSynthesisVoice[]) {
  return voices.filter((v) => /^en(-|$)/i.test(v.lang));
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const blob = `${v.name} ${v.voiceURI}`;
  let s = 0;
  if (FEMALE_OR_LIGHT_HINTS.test(blob)) s += 60;
  if (MALE_OR_DEEP_HINTS.test(blob)) s -= 45;
  // Prefer US/UK widely-available kid-readable accents slightly over obscure locales
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
    if (sc > bestScore) {
      best = v;
      bestScore = sc;
    }
  }
  return bestScore > -100 ? best : candidates[0];
}

/** Apply chosen voice + slightly brighter defaults (still natural for read-aloud). */
export function applyReadingUtteranceVoice(utterance: SpeechSynthesisUtterance) {
  const voice = pickReadingVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }
  utterance.rate = 1;
  utterance.pitch = 1.09;
}

function stripWordEdges(token: string) {
  return token.replace(/^[^\w']+|[^\w']+$/g, "").trim();
}

/** Simple tap-to-hear on Reading preview (no mascot state). */
export function speakStandalonePreviewWord(rawToken: string) {
  const cleaned = stripWordEdges(rawToken) || rawToken.trim();
  if (!cleaned || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleaned);
  applyReadingUtteranceVoice(utterance);
  window.speechSynthesis.speak(utterance);
}
