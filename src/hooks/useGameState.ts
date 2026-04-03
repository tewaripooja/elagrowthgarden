import { useState, useCallback } from "react";

export type PlantStage = "seed" | "sprout" | "leaves" | "bud" | "flower";
export type ActivityMode = "vocabulary" | "compare-contrast" | "fact-opinion" | "summaries" | "character-traits";

const STAGES: PlantStage[] = ["seed", "sprout", "leaves", "bud", "flower"];

export interface GameState {
  level: number; // grade level 2-5
  stars: number;
  currentStage: PlantStage;
  stageIndex: number;
  flowers: number; // completed flowers
  totalCorrect: number;
}

export function useGameState() {
  const [state, setState] = useState<GameState>({
    level: 2,
    stars: 0,
    currentStage: "seed",
    stageIndex: 0,
    flowers: 0,
    totalCorrect: 0,
  });

  const handleCorrectAnswer = useCallback((earnStar = false) => {
    setState((prev) => {
      const nextStageIndex = prev.stageIndex + 1;
      const flowerComplete = nextStageIndex >= STAGES.length;

      const newTotalCorrect = prev.totalCorrect + 1;
      // Level up every 10 correct answers, max grade 5
      const newLevel = Math.min(5, 2 + Math.floor(newTotalCorrect / 10));

      return {
        ...prev,
        stars: earnStar ? prev.stars + 1 : prev.stars,
        stageIndex: flowerComplete ? 0 : nextStageIndex,
        currentStage: flowerComplete ? "seed" : STAGES[nextStageIndex],
        flowers: flowerComplete ? prev.flowers + 1 : prev.flowers,
        totalCorrect: newTotalCorrect,
        level: newLevel,
      };
    });
  }, []);

  return { ...state, handleCorrectAnswer };
}
