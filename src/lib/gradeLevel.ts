/** Grade level selection — stored once on first launch, drives story tier. */

export type GradeLevel = 1 | 2 | 3 | 4 | 5;
export type StoryTier  = 1 | 2 | 3;

const STORAGE_KEY = "ela-grade-level-v1";

export function getGradeLevel(): GradeLevel | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n   = Number(raw);
    if (n >= 1 && n <= 5) return n as GradeLevel;
  } catch {}
  return null;
}

export function setGradeLevel(grade: GradeLevel): void {
  try { localStorage.setItem(STORAGE_KEY, String(grade)); } catch {}
}

export function clearGradeLevel(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

/** Grade 1 → Tier 1 (simple) · Grades 2-3 → Tier 2 (standard) · Grades 4-5 → Tier 3 (chapter) */
export function getGradeTier(grade: GradeLevel): StoryTier {
  if (grade === 1)            return 1;
  if (grade === 2 || grade === 3) return 2;
  return 3;
}

/** Words-per-minute reading speed enforced per tier. */
export function getReadingWPM(tier: StoryTier): number {
  if (tier === 1) return 70;
  if (tier === 2) return 100;
  return 150;
}

export interface GradeMeta {
  label:   string;
  emoji:   string;
  tagline: string;
  color:   string;
  shadow:  string;
}

export const GRADE_META: Record<GradeLevel, GradeMeta> = {
  1: { label: "Grade 1", emoji: "🌱", tagline: "Just starting my reading journey!",  color: "linear-gradient(135deg,#A8F0C0,#5BBD4E)", shadow: "rgba(60,180,80,.30)" },
  2: { label: "Grade 2", emoji: "🌻", tagline: "I can read whole sentences!",          color: "linear-gradient(135deg,#FFD580,#FFB347)", shadow: "rgba(255,150,50,.32)" },
  3: { label: "Grade 3", emoji: "📖", tagline: "I love reading stories!",              color: "linear-gradient(135deg,#B8D8F8,#7EC8F8)", shadow: "rgba(60,160,240,.28)" },
  4: { label: "Grade 4", emoji: "🔍", tagline: "I can read chapter books!",            color: "linear-gradient(135deg,#E8B4F8,#C084FC)", shadow: "rgba(192,100,255,.30)" },
  5: { label: "Grade 5", emoji: "🏆", tagline: "I am a confident reader!",             color: "linear-gradient(135deg,#A0E8F8,#40C8E8)", shadow: "rgba(30,180,220,.28)" },
};
