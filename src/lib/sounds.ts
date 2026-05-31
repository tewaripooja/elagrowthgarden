/**
 * Kid-friendly sound effects synthesised entirely with the Web Audio API —
 * no external files, no network requests.
 */

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
  } catch {
    return null;
  }
}

/** Schedules a single tone and releases it automatically. */
function tone(
  ac: AudioContext,
  freq: number,
  startSec: number,
  durSec: number,
  peakVol: number,
  type: OscillatorType = "sine",
) {
  const osc  = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startSec;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peakVol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec);
  osc.start(t0);
  osc.stop(t0 + durSec + 0.02);
}

/**
 * 🎉 Correct answer — cheerful C-major ascending arpeggio with sparkle harmonics.
 * C5 → E5 → G5 → C6, each note 100 ms apart.
 */
export function playCorrectSound() {
  const ac = ctx();
  if (!ac) return;

  // Main arpeggio (sine — warm bell-like)
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    tone(ac, freq,        i * 0.10, 0.30, 0.38, "sine");
    tone(ac, freq * 2,   i * 0.10, 0.18, 0.10, "triangle"); // shimmer octave
  });

  // Tiny "sparkle" — random high pings after the arpeggio
  [1318.5, 1567.98, 2093].forEach((freq, i) => {
    tone(ac, freq, 0.48 + i * 0.07, 0.18, 0.08, "sine");
  });

  setTimeout(() => { try { ac.close(); } catch { /* ignore */ } }, 2200);
}

/**
 * 🌟 Star earned — a longer magical shimmer rising through two octaves.
 */
export function playStarSound() {
  const ac = ctx();
  if (!ac) return;

  const scale = [392, 493.88, 523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
  scale.forEach((freq, i) => {
    tone(ac, freq,     i * 0.07, 0.45, 0.36, "sine");
    tone(ac, freq * 2, i * 0.07, 0.25, 0.09, "triangle");
  });

  setTimeout(() => { try { ac.close(); } catch { /* ignore */ } }, 3000);
}

/**
 * 💔 Wrong answer — a soft, gentle descending "whomp".
 * Kept short and quiet so it's not discouraging.
 */
export function playWrongSound() {
  const ac = ctx();
  if (!ac) return;

  const osc  = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(340, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.32);
  gain.gain.setValueAtTime(0.25, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.38);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.40);

  setTimeout(() => { try { ac.close(); } catch { /* ignore */ } }, 1000);
}
