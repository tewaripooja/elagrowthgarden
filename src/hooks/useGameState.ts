import { useState, useCallback } from "react";

export type PlantStage = "seed" | "sprout" | "leaves" | "bud" | "flower";
export type ActivityMode = "vocabulary" | "compare-contrast" | "fact-opinion" | "summaries" | "character-traits";

const STAGES: PlantStage[] = ["seed", "sprout", "leaves", "bud", "flower"];
const STORAGE_KEY = "ela-garden-state";
const PERFECT_STORIES_TO_LEVEL_UP = 5;

export interface StoryRecord {
  activityType: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  perfect: boolean;
  level: number;
}

export interface GameState {
  level: number;
  stars: number;
  currentStage: PlantStage;
  stageIndex: number;
  flowers: number;
  totalCorrect: number;
  perfectStreak: number; // consecutive perfect stories at current level
  storyHistory: StoryRecord[];
}

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
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
      const newStreak = perfect ? prev.perfectStreak + 1 : 0;
      const shouldLevelUp = newStreak >= PERFECT_STORIES_TO_LEVEL_UP && prev.level < 5;

      const record: StoryRecord = {
        activityType,
        date: new Date().toISOString(),
        totalQuestions,
        correctAnswers,
        perfect,
        level: prev.level,
      };

      const next: GameState = {
        ...prev,
        perfectStreak: shouldLevelUp ? 0 : newStreak,
        level: shouldLevelUp ? prev.level + 1 : prev.level,
        storyHistory: [...prev.storyHistory, record],
      };
      saveState(next);
      return next;
    });
  }, []);

  return { ...state, handleCorrectAnswer, completeStory };
}
