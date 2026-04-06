import { useState, useCallback } from "react";

export type PlantStage = "seed" | "sprout" | "leaves" | "bud" | "flower";
export type ActivityMode = "vocabulary" | "compare-contrast" | "fact-opinion" | "summaries" | "character-traits";

const STAGES: PlantStage[] = ["seed", "sprout", "leaves", "bud", "flower"];
const STORAGE_KEY = "ela-garden-state";
const PERFECT_DAYS_TO_LEVEL_UP = 7;

const ALL_ACTIVITIES: ActivityMode[] = ["vocabulary", "compare-contrast", "fact-opinion", "summaries", "character-traits"];

export interface StoryRecord {
  activityType: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  perfect: boolean;
  level: number;
}

export interface ActivityProgress {
  level: number;
  perfectStreak: number; // consecutive days with 100% accuracy
  lastPerfectDate: string | null; // ISO date string (YYYY-MM-DD) of last perfect day
}

export interface GameState {
  level: number; // kept for backward compat / overall display
  stars: number;
  currentStage: PlantStage;
  stageIndex: number;
  flowers: number;
  totalCorrect: number;
  perfectStreak: number;
  storyHistory: StoryRecord[];
  activityLevels: Record<string, ActivityProgress>;
}

function defaultActivityLevels(baseLevel: number): Record<string, ActivityProgress> {
  const levels: Record<string, ActivityProgress> = {};
  ALL_ACTIVITIES.forEach((a) => {
    levels[a] = { level: baseLevel, perfectStreak: 0, lastPerfectDate: null };
  });
  return levels;
}

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate: if no activityLevels, create from global level
      if (!parsed.activityLevels) {
        parsed.activityLevels = defaultActivityLevels(parsed.level || 2);
      }
      return parsed;
    }
  } catch {}
  return {
    level: 2,
    stars: 0,
    currentStage: "seed",
    stageIndex: 0,
    flowers: 0,
    totalCorrect: 0,
    perfectStreak: 0,
    storyHistory: [],
    activityLevels: defaultActivityLevels(2),
  };
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  const handleCorrectAnswer = useCallback((earnStar = false) => {
    setState((prev) => {
      const nextStageIndex = prev.stageIndex + 1;
      const flowerComplete = nextStageIndex >= STAGES.length;

      const next: GameState = {
        ...prev,
        stars: earnStar ? prev.stars + 1 : prev.stars,
        stageIndex: flowerComplete ? 0 : nextStageIndex,
        currentStage: flowerComplete ? "seed" : STAGES[nextStageIndex],
        flowers: flowerComplete ? prev.flowers + 1 : prev.flowers,
        totalCorrect: prev.totalCorrect + 1,
      };
      saveState(next);
      return next;
    });
  }, []);

  const completeStory = useCallback((activityType: string, totalQuestions: number, correctAnswers: number) => {
    setState((prev) => {
      const perfect = correctAnswers === totalQuestions;
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const activityLevels = { ...prev.activityLevels };
      const current = activityLevels[activityType] || { level: 2, perfectStreak: 0, lastPerfectDate: null };

      let newStreak = current.perfectStreak;
      let lastDate = current.lastPerfectDate;

      if (perfect) {
        if (lastDate === today) {
          // Already counted today — streak stays the same
        } else if (lastDate && isConsecutiveDay(lastDate, today)) {
          // New consecutive day
          newStreak = current.perfectStreak + 1;
          lastDate = today;
        } else {
          // First day or streak broken (gap > 1 day)
          newStreak = 1;
          lastDate = today;
        }
      } else {
        // Not perfect — reset streak
        newStreak = 0;
        lastDate = null;
      }

      const shouldLevelUp = newStreak >= PERFECT_DAYS_TO_LEVEL_UP && current.level < 5;

      activityLevels[activityType] = {
        level: shouldLevelUp ? current.level + 1 : current.level,
        perfectStreak: shouldLevelUp ? 0 : newStreak,
        lastPerfectDate: shouldLevelUp ? null : lastDate,
      };

      // Global level = minimum across all activities (or you could use max; using min keeps overall conservative)
      const allLevels = ALL_ACTIVITIES.map((a) => activityLevels[a]?.level || 2);
      const globalLevel = Math.min(...allLevels);

      const record: StoryRecord = {
        activityType,
        date: new Date().toISOString(),
        totalQuestions,
        correctAnswers,
        perfect,
        level: activityLevels[activityType].level,
      };

      // Also update legacy perfectStreak for backward compat
      const globalStreak = perfect ? prev.perfectStreak + 1 : 0;

      const next: GameState = {
        ...prev,
        perfectStreak: globalStreak,
        level: globalLevel,
        activityLevels,
        storyHistory: [...prev.storyHistory, record],
      };
      saveState(next);
      return next;
    });
  }, []);

  const getActivityLevel = useCallback((activityType: string): ActivityProgress => {
    return state.activityLevels?.[activityType] || { level: 2, perfectStreak: 0, lastPerfectDate: null };
  }, [state.activityLevels]);

  return { ...state, handleCorrectAnswer, completeStory, getActivityLevel };
}
