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

// ─── Boss Battle Sounds ───────────────────────────────────────────────────────

/** ❄️ Boss intro — ominous low rumble + rising ice shimmer */
export function playBossIntroSound() {
  const ac = ctx();
  if (!ac) return;
  // Low rumble
  [55, 73.4, 87.3].forEach((f, i) => tone(ac, f, i * 0.08, 1.2, 0.18, 'triangle'));
  // Rising ice shimmer
  [880, 1108, 1397, 1760, 2217].forEach((f, i) =>
    tone(ac, f, 0.3 + i * 0.12, 0.35, 0.09, 'sine'));
  setTimeout(() => { try { ac.close(); } catch { /**/ } }, 3000);
}

/** 💥 Frostbite takes a hit — sharp ice-crack + ascending snap */
export function playBossHitSound() {
  const ac = ctx();
  if (!ac) return;
  // Crack impact
  const buf = ac.createBuffer(1, ac.sampleRate * 0.15, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 800);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain(); g.gain.value = 0.5;
  const filt = ac.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = 2200;
  src.connect(filt); filt.connect(g); g.connect(ac.destination);
  src.start();
  // Ascending ping
  [1046.5, 1318.5, 1760].forEach((f, i) => tone(ac, f, 0.05 + i * 0.06, 0.2, 0.2, 'sine'));
  setTimeout(() => { try { ac.close(); } catch { /**/ } }, 1500);
}

/** 🌨️ Frostbite attacks Pip — cold swoosh + deep thud */
export function playBossAttackSound() {
  const ac = ctx();
  if (!ac) return;
  // Swoosh: filtered white noise descending
  const buf = ac.createBuffer(1, ac.sampleRate * 0.35, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 3000);
  const src = ac.createBufferSource(); src.buffer = buf;
  const filt = ac.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 600;
  const g = ac.createGain(); g.gain.setValueAtTime(0.35, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
  src.connect(filt); filt.connect(g); g.connect(ac.destination); src.start();
  // Deep thud
  tone(ac, 80, 0.1, 0.3, 0.3, 'sine');
  tone(ac, 60, 0.15, 0.25, 0.2, 'triangle');
  setTimeout(() => { try { ac.close(); } catch { /**/ } }, 1200);
}

/** 🏆 Frostbite defeated — triumphant fanfare */
export function playBossVictorySound() {
  const ac = ctx();
  if (!ac) return;
  const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
  melody.forEach((f, i) => {
    tone(ac, f,     i * 0.13, 0.4, 0.38, 'sine');
    tone(ac, f * 2, i * 0.13, 0.25, 0.12, 'triangle');
  });
  // Final chord
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone(ac, f, melody.length * 0.13 + 0.05, 0.8, 0.28 - i * 0.04, 'sine'));
  setTimeout(() => { try { ac.close(); } catch { /**/ } }, 3500);
}

/** 💔 Pip defeated — sad deflating sound */
export function playBossDefeatSound() {
  const ac = ctx();
  if (!ac) return;
  [440, 349.23, 293.66, 246.94].forEach((f, i) =>
    tone(ac, f, i * 0.18, 0.4, 0.3, 'sine'));
  tone(ac, 130.81, 0.75, 0.6, 0.2, 'triangle');
  setTimeout(() => { try { ac.close(); } catch { /**/ } }, 2500);
}

/** ⚡ Power earned pop — short magical ping */
export function playPowerEarnedSound() {
  const ac = ctx();
  if (!ac) return;
  tone(ac, 1318.5, 0,    0.15, 0.22, 'sine');
  tone(ac, 1760,   0.07, 0.18, 0.18, 'sine');
  tone(ac, 2349,   0.12, 0.20, 0.14, 'sine');
  setTimeout(() => { try { ac.close(); } catch { /**/ } }, 800);
}

// ─── Frostbite Voice (Web Speech API) ────────────────────────────────────────

let _currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Make Frostbite speak a line out loud using a deep, creepy voice.
 * Cancels any currently-speaking line first so new taunts interrupt old ones.
 */
export function speakFrostbite(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);

  // Pick the deepest available voice, preferring English
  const voices = window.speechSynthesis.getVoices();
  const deepVoice =
    voices.find(v => /daniel|thomas|fred|ralph/i.test(v.name)) ||   // known deep voices
    voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
    voices.find(v => v.lang.startsWith('en')) ||
    voices[0];

  if (deepVoice) utter.voice = deepVoice;

  utter.pitch = 0.55;   // low and ominous
  utter.rate  = 0.82;   // slow, menacing
  utter.volume = 0.88;

  _currentUtterance = utter;
  window.speechSynthesis.speak(utter);
}

/** Stop Frostbite mid-sentence (e.g. on phase change). */
export function stopFrostbiteVoice() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  _currentUtterance = null;
}
