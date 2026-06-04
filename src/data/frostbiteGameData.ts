// ─────────────────────────────────────────
// src/data/frostbiteGameData.ts
// Static config for the Frostbite game system.
// No API calls — all bundled at build time.
// ─────────────────────────────────────────

import type {
  Power, PowerType, GradeConfig, GardenPlant,
  PlayerTitle, Grade, BossQuestion
} from '@/types/game';

// ── Grade Config ───────────────────────────────────────────────────────────
export const GRADE_CONFIGS: Record<Grade, GradeConfig> = {
  1: {
    grade: 1,
    title: 'Seed Keeper',
    readingLevel: 'Kindergarten–Grade 1',
    storyMinSentences: 3,
    storyMaxSentences: 5,
    frostbiteHearts: 3,
    bossQuestionTimeMs: 12000,
    vocabComplexity: 'simple',
    hasMinions: false,
    unlockedZones: ['forest'],
  },
  2: {
    grade: 2,
    title: 'Sprout Guardian',
    readingLevel: 'Grade 2',
    storyMinSentences: 5,
    storyMaxSentences: 8,
    frostbiteHearts: 3,
    bossQuestionTimeMs: 10000,
    vocabComplexity: 'simple',
    hasMinions: false,
    unlockedZones: ['forest', 'ocean'],
  },
  3: {
    grade: 3,
    title: 'Bloom Warrior',
    readingLevel: 'Grade 3',
    storyMinSentences: 8,
    storyMaxSentences: 12,
    frostbiteHearts: 4,
    bossQuestionTimeMs: 9000,
    vocabComplexity: 'moderate',
    hasMinions: false,
    unlockedZones: ['forest', 'ocean', 'space'],
  },
  4: {
    grade: 4,
    title: 'Garden Champion',
    readingLevel: 'Grade 4',
    storyMinSentences: 12,
    storyMaxSentences: 18,
    frostbiteHearts: 5,
    bossQuestionTimeMs: 8000,
    vocabComplexity: 'moderate',
    hasMinions: false,
    unlockedZones: ['forest', 'ocean', 'space', 'dragon'],
  },
  5: {
    grade: 5,
    title: 'Grand Cultivator',
    readingLevel: 'Grade 5',
    storyMinSentences: 18,
    storyMaxSentences: 25,
    frostbiteHearts: 5,
    bossQuestionTimeMs: 7000,
    vocabComplexity: 'advanced',
    hasMinions: true,
    unlockedZones: ['forest', 'ocean', 'space', 'dragon'],
  },
};

// ── Player Titles by Level ─────────────────────────────────────────────────
export const LEVEL_TITLES: Record<number, PlayerTitle> = {
  1: 'Seed Keeper',
  2: 'Sprout Guardian',
  3: 'Bloom Warrior',
  4: 'Garden Champion',
  5: 'Grand Cultivator',
};

// XP required to reach each level
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 150,
  3: 400,
  4: 750,
  5: 1200,
};

export function getLevelFromXP(xp: number): number {
  if (xp >= XP_THRESHOLDS[5]) return 5;
  if (xp >= XP_THRESHOLDS[4]) return 4;
  if (xp >= XP_THRESHOLDS[3]) return 3;
  if (xp >= XP_THRESHOLDS[2]) return 2;
  return 1;
}

export function getXPForActivity(correct: boolean, activityType: string): number {
  if (!correct) return 5; // small XP even for trying
  const base: Record<string, number> = {
    reading: 30,
    vocabulary: 20,
    fact_opinion: 20,
    summary: 25,
    character_traits: 25,
    compare_contrast: 30,
  };
  return base[activityType] ?? 20;
}

// ── Powers ─────────────────────────────────────────────────────────────────
export const POWERS: Record<PowerType, Power> = {
  story_fire: {
    type: 'story_fire',
    label: 'Story Fire',
    emoji: '🔥',
    description: 'Melts frost patches with the power of stories!',
    unlockedAtLevel: 1,
    sourceActivity: 'reading',
    frostbitEffect: 'Frostbite yelps and a frost patch melts away!',
  },
  word_lightning: {
    type: 'word_lightning',
    label: 'Word Lightning',
    emoji: '⚡',
    description: 'Stuns Frostbite with a bolt of vocabulary power!',
    unlockedAtLevel: 2,
    sourceActivity: 'vocabulary',
    frostbitEffect: 'Frostbite spins in circles, stunned by your words!',
  },
  truth_shield: {
    type: 'truth_shield',
    label: 'Truth Shield',
    emoji: '🛡️',
    description: 'Blocks Frostbite\'s next freeze attack!',
    unlockedAtLevel: 2,
    sourceActivity: 'fact_opinion',
    frostbitEffect: 'Frostbite\'s ice blast bounces right back at him!',
  },
  mind_whirl: {
    type: 'mind_whirl',
    label: 'Mind Whirl',
    emoji: '🌪️',
    description: 'Clears a whole frost zone with the power of summaries!',
    unlockedAtLevel: 3,
    sourceActivity: 'summary',
    frostbitEffect: 'A whirlwind sweeps away the frost — Frostbite stumbles!',
  },
  heart_heal: {
    type: 'heart_heal',
    label: 'Heart Heal',
    emoji: '💚',
    description: 'Revives wilted plants AND heals Pip!',
    unlockedAtLevel: 3,
    sourceActivity: 'character_traits',
    frostbitEffect: 'Warmth fills the garden — Frostbite backs away grumbling!',
  },
  vision_orb: {
    type: 'vision_orb',
    label: 'Vision Orb',
    emoji: '🔮',
    description: 'Reveals a hidden part of the garden!',
    unlockedAtLevel: 4,
    sourceActivity: 'compare_contrast',
    frostbitEffect: 'A glowing orb reveals Frostbite\'s weakness!',
  },
};

export const POWER_CHARGE_MAX = 3;

// ── Default Garden Plants ──────────────────────────────────────────────────
export const DEFAULT_PLANTS: GardenPlant[] = [
  { id: 'p1', type: 'sunflower', bloomed: true,  frostLevel: 0, unlockedAtLevel: 1, zone: 'forest' },
  { id: 'p2', type: 'tulip',     bloomed: true,  frostLevel: 0, unlockedAtLevel: 1, zone: 'forest' },
  { id: 'p3', type: 'daisy',     bloomed: true,  frostLevel: 0, unlockedAtLevel: 1, zone: 'forest' },
  { id: 'p4', type: 'sprout',    bloomed: false, frostLevel: 0, unlockedAtLevel: 1, zone: 'forest' },
  { id: 'p5', type: 'seed',      bloomed: false, frostLevel: 0, unlockedAtLevel: 1, zone: 'forest' },
  { id: 'p6', type: 'mushroom',  bloomed: false, frostLevel: 0, unlockedAtLevel: 2, zone: 'ocean'  },
  { id: 'p7', type: 'rose',      bloomed: false, frostLevel: 0, unlockedAtLevel: 3, zone: 'space'  },
  { id: 'p8', type: 'cactus',    bloomed: false, frostLevel: 0, unlockedAtLevel: 4, zone: 'dragon' },
];

// ── Frostbite Dialogue ─────────────────────────────────────────────────────
export const FROSTBITE_TAUNTS = [
  "Bah! Lucky guess!",
  "You won't get the next one!",
  "My frost will cover everything! Mwahaha!",
  "Words are useless against the cold!",
  "I've been freezing gardens for 300 years!",
  "Hmph... that was just a warm-up!",
];

export const FROSTBITE_HURT_REACTIONS = [
  "Ow! That... that actually stung!",
  "Impossible! No one has ever— OW!",
  "Bah! A fluke! Just a fluke!",
  "How do you KNOW all these words?!",
  "Stop it! Stop knowing things!",
];

export const FROSTBITE_DEFEAT_LINES = [
  "I... I don't understand. How?",
  "You used... words. Just words. And you beat me.",
  "Maybe... maybe reading isn't so bad after all.",
  "Bah. Don't think this is over. I'll be back tomorrow night.",
];

export const FROSTBITE_OVERNIGHT_MESSAGES = [
  "Frostbite visited while you were away! He froze your sunflower. 🥶",
  "Frostbite snuck in last night! A frost patch appeared on the tulip. 🌨️",
  "Uh oh! Frostbite left ice crystals on the daisy overnight! ❄️",
];

// ── Boss Questions per Grade ───────────────────────────────────────────────
// These are rapid-fire — shorter and snappier than regular activity questions.
export const BOSS_QUESTIONS: Record<Grade, BossQuestion[]> = {
  1: [
    { question: "What does 'happy' mean?", options: ["Sad", "Joyful", "Angry", "Tired"], correctIndex: 1, activityType: 'vocabulary' },
    { question: "Is this a fact? 'Dogs have four legs.'", options: ["Fact", "Opinion"], correctIndex: 0, activityType: 'fact_opinion' },
    { question: "Which word means 'very big'?", options: ["Tiny", "Huge", "Soft", "Cold"], correctIndex: 1, activityType: 'vocabulary' },
    { question: "Is this an opinion? 'Pizza is the best food.'", options: ["Fact", "Opinion"], correctIndex: 1, activityType: 'fact_opinion' },
    { question: "What is a character trait?", options: ["What they wear", "How they act and feel", "Where they live", "Their favourite colour"], correctIndex: 1, activityType: 'character_traits' },
  ],
  2: [
    { question: "What does 'curious' mean?", options: ["Bored", "Sleepy", "Wanting to learn", "Very cold"], correctIndex: 2, activityType: 'vocabulary' },
    { question: "Is this a fact? 'Cats are better than dogs.'", options: ["Fact", "Opinion"], correctIndex: 1, activityType: 'fact_opinion' },
    { question: "What does a summary include?", options: ["Every single detail", "The main idea", "Only the ending", "The character's name only"], correctIndex: 1, activityType: 'summary' },
    { question: "'Brave' means the same as...?", options: ["Scared", "Courageous", "Lazy", "Tiny"], correctIndex: 1, activityType: 'vocabulary' },
    { question: "Is this a fact? 'Water freezes at 0°C.'", options: ["Fact", "Opinion"], correctIndex: 0, activityType: 'fact_opinion' },
  ],
  3: [
    { question: "What does 'determined' mean?", options: ["Giving up easily", "Not trying", "Refusing to quit", "Being very loud"], correctIndex: 2, activityType: 'vocabulary' },
    { question: "A good summary should be...", options: ["Very long", "Short and capture main idea", "List every event", "Include your opinion"], correctIndex: 1, activityType: 'summary' },
    { question: "Is this a fact? 'Summer is the best season.'", options: ["Fact", "Opinion"], correctIndex: 1, activityType: 'fact_opinion' },
    { question: "If a character shares their lunch, they show...", options: ["Greed", "Generosity", "Anger", "Laziness"], correctIndex: 1, activityType: 'character_traits' },
    { question: "What does 'compare' mean?", options: ["Find differences only", "Find similarities and differences", "Describe one thing", "Ignore both things"], correctIndex: 1, activityType: 'compare_contrast' },
  ],
  4: [
    { question: "What does 'resilient' mean?", options: ["Easily broken", "Recovering quickly from difficulty", "Very fragile", "Extremely loud"], correctIndex: 1, activityType: 'vocabulary' },
    { question: "Which is an opinion?", options: ["The Earth orbits the Sun", "Maths is harder than reading", "Whales are mammals", "Ice melts when heated"], correctIndex: 1, activityType: 'fact_opinion' },
    { question: "A theme in a story is...", options: ["The main character's name", "The setting of the story", "The central message or lesson", "The first thing that happens"], correctIndex: 2, activityType: 'reading' },
    { question: "What does 'contrast' mean?", options: ["Show similarities", "Show differences", "Describe appearance", "List events in order"], correctIndex: 1, activityType: 'compare_contrast' },
    { question: "Which word is a synonym for 'brave'?", options: ["Timid", "Fearful", "Valiant", "Careless"], correctIndex: 2, activityType: 'vocabulary' },
  ],
  5: [
    { question: "What does 'infer' mean?", options: ["To state a fact", "To use clues to figure something out", "To memorise information", "To copy an answer"], correctIndex: 1, activityType: 'reading' },
    { question: "An author's purpose can be to...", options: ["Confuse the reader", "Persuade, inform, or entertain", "Make the story longer", "Use big words"], correctIndex: 1, activityType: 'reading' },
    { question: "What does 'ambiguous' mean?", options: ["Very clear and obvious", "Open to more than one meaning", "Extremely long", "Completely false"], correctIndex: 1, activityType: 'vocabulary' },
    { question: "Which best describes a character foil?", options: ["A character who is always funny", "A character who contrasts the main character", "The villain of the story", "A character who disappears"], correctIndex: 1, activityType: 'character_traits' },
    { question: "What is a 'point of view' in a story?", options: ["The genre of the book", "Who is telling the story and how they see it", "The setting of the story", "The most exciting part"], correctIndex: 1, activityType: 'reading' },
  ],
};

// ── Pip Evolution Stages ───────────────────────────────────────────────────
export const PIP_STAGES = {
  1: { label: 'Tiny Pip',        glowColor: '#A8E6CF', wingColor: '#5BBD4E', hasCrown: false, hasAura: false },
  2: { label: 'Glowing Pip',     glowColor: '#7BDFB0', wingColor: '#4aa83d', hasCrown: false, hasAura: false },
  3: { label: 'Flower Crown Pip',glowColor: '#FFB6C1', wingColor: '#FF6B8A', hasCrown: true,  hasAura: false },
  4: { label: 'Golden Pip',      glowColor: '#FFD700', wingColor: '#FFA500', hasCrown: true,  hasAura: false },
  5: { label: 'Rainbow Pip',     glowColor: '#FF69B4', wingColor: '#9B59B6', hasCrown: true,  hasAura: true  },
};

// ── Activity → Power mapping (used in BossEncounter + BattleArena) ─────────
export const ACTIVITY_TO_POWER: Record<string, PowerType> = {
  reading:          'story_fire',
  vocabulary:       'word_lightning',
  fact_opinion:     'truth_shield',
  summary:          'mind_whirl',
  character_traits: 'heart_heal',
  compare_contrast: 'vision_orb',
};
