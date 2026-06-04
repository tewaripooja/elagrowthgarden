// ─────────────────────────────────────────
// src/types/game.ts
// All TypeScript interfaces for the Frostbite
// game system. Import from here across all
// game components.
// ─────────────────────────────────────────

export type Grade = 1 | 2 | 3 | 4 | 5;

export type PipMood = 'idle' | 'attack' | 'hurt' | 'victory';

export type PlayerTitle =
  | 'Seed Keeper'
  | 'Sprout Guardian'
  | 'Bloom Warrior'
  | 'Garden Champion'
  | 'Grand Cultivator';

export type PowerType =
  | 'story_fire'
  | 'word_lightning'
  | 'truth_shield'
  | 'mind_whirl'
  | 'heart_heal'
  | 'vision_orb';

export type ActivityType =
  | 'reading'
  | 'vocabulary'
  | 'fact_opinion'
  | 'summary'
  | 'character_traits'
  | 'compare_contrast';

export type PipStage = 1 | 2 | 3 | 4 | 5;

// ── Plant ──────────────────────────────
export interface GardenPlant {
  id: string;
  type: 'sunflower' | 'tulip' | 'daisy' | 'sprout' | 'seed' | 'mushroom' | 'rose' | 'cactus';
  bloomed: boolean;
  frostLevel: number;   // 0 = healthy, 1 = light frost, 2 = frozen
  unlockedAtLevel: number;
  zone: 'forest' | 'ocean' | 'space' | 'dragon';
}

// ── Power ──────────────────────────────
export interface Power {
  type: PowerType;
  label: string;
  emoji: string;
  description: string;
  unlockedAtLevel: number;
  sourceActivity: ActivityType;
  frostbitEffect: string;   // description of what it does to Frostbite
}

// ── Player / Game State ────────────────
export interface GameState {
  // Identity
  playerName: string;
  grade: Grade;
  title: PlayerTitle;

  // Progression
  xp: number;
  level: number;           // 1–5, maps to PlayerTitle
  streak: number;          // days in a row
  lastPlayedDate: string;  // ISO date string

  // Powers
  powerCharges: PowerType[];        // max 3 at a time
  unlockedPowers: PowerType[];

  // Garden
  plants: GardenPlant[];
  frostbiteDefeatMeter: number;     // 0–100, overall campaign progress
  activitiesCompletedToday: number; // resets each day; boss triggers at 5

  // Boss
  bossEncountersWon: number;
  lastBossDate: string;

  // Session
  sessionStartTime: number;         // Date.now() when session began
}

// ── Supabase DB row shape ──────────────
// Mirrors your existing reading_progress table pattern.
// Add a new `game_progress` table with this shape.
export interface GameProgressRow {
  id: string;
  user_id: string;
  game_state: GameState;       // stored as JSONB
  updated_at: string;
}

// ── Parent Settings ────────────────────
export interface ParentSettings {
  childName: string;
  grade: Grade;
  dailySessionLimitMins: number;   // 0 = unlimited
  parentPinHash: string;           // simple 4-digit PIN, hashed
  dashboardEnabled: boolean;
}

// ── Boss Encounter ─────────────────────
export interface BossQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  activityType: ActivityType;
}

export interface BossEncounterState {
  phase: 'intro' | 'battle' | 'victory' | 'defeat';
  frostbiteHearts: number;        // starts at grade-based max
  maxHearts: number;
  currentQuestion: number;
  questions: BossQuestion[];
  playerHits: number;
  frostbiteHits: number;
  pipHearts: number;
  pipMaxHearts: number;
}

// ── Parent Dashboard ───────────────────
export interface DashboardStats {
  totalStoriesRead: number;
  totalActivitiesCompleted: number;
  averageScore: number;           // 0–100
  currentStreak: number;
  longestStreak: number;
  xpThisWeek: number;
  activitiesByType: Record<ActivityType, number>;
  sessionDurationsThisWeek: number[];   // minutes per day, last 7 days
  bossesDefeated: number;
  plantsUnlocked: number;
  grade: Grade;
  title: PlayerTitle;
  lastActive: string;
}

// ── Grade Config ───────────────────────
export interface GradeConfig {
  grade: Grade;
  title: PlayerTitle;
  readingLevel: string;
  storyMinSentences: number;
  storyMaxSentences: number;
  frostbiteHearts: number;
  bossQuestionTimeMs: number;   // time per question in boss battle
  vocabComplexity: 'simple' | 'moderate' | 'advanced';
  hasMinions: boolean;           // Grade 5 only
  unlockedZones: GardenPlant['zone'][];
}
