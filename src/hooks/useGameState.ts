// ─────────────────────────────────────────
// src/hooks/useGameState.ts
// Central game state hook. Syncs to Supabase
// (authenticated users) or localStorage (guests).
// Mirrors your existing reading_progress pattern.
// ─────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GameState, Grade, PowerType } from '@/types/game';
import {
  DEFAULT_PLANTS,
  getLevelFromXP,
  getXPForActivity,
  LEVEL_TITLES,
  POWER_CHARGE_MAX,
  FROSTBITE_OVERNIGHT_MESSAGES,
  XP_THRESHOLDS,
} from '@/data/frostbiteGameData';

const STORAGE_KEY = 'ela_game_state';
const QUERY_KEY = ['game_state'];

function createDefaultState(grade: Grade = 1): GameState {
  return {
    playerName: '',
    grade,
    title: 'Seed Keeper',
    xp: 0,
    level: 1,
    streak: 0,
    lastPlayedDate: '',
    powerCharges: [],
    unlockedPowers: ['story_fire'],
    plants: DEFAULT_PLANTS,
    frostbiteDefeatMeter: 0,
    activitiesCompletedToday: 0,
    bossEncountersWon: 0,
    lastBossDate: '',
    sessionStartTime: Date.now(),
  };
}

function applyOvernightFrost(state: GameState): { state: GameState; message: string | null } {
  const today = new Date().toISOString().split('T')[0];
  if (state.lastPlayedDate === today) return { state, message: null };

  const bloomedPlants = state.plants.filter(p => p.bloomed && p.frostLevel < 2);
  if (bloomedPlants.length === 0) return { state, message: null };

  const target = bloomedPlants[Math.floor(Math.random() * bloomedPlants.length)];
  const updatedPlants = state.plants.map(p =>
    p.id === target.id ? { ...p, frostLevel: p.frostLevel + 1 } : p
  );

  const message = FROSTBITE_OVERNIGHT_MESSAGES[
    Math.floor(Math.random() * FROSTBITE_OVERNIGHT_MESSAGES.length)
  ];

  return { state: { ...state, plants: updatedPlants }, message };
}

export function useGameState() {
  const queryClient = useQueryClient();
  const [gameState, setGameStateRaw] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [overnightMessage, setOvernightMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      let raw: GameState | null = null;

      if (user) {
        const { data, error } = await supabase
          .from('game_progress')
          .select('game_state')
          .eq('user_id', user.id)
          .single();
        if (!error && data?.game_state) {
          raw = data.game_state as GameState;
        }
      }

      if (!raw) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try { raw = JSON.parse(stored); } catch { raw = null; }
        }
      }

      if (!raw) raw = createDefaultState();

      const { state: frosted, message } = applyOvernightFrost(raw);
      setOvernightMessage(message);
      setGameStateRaw(frosted);
      setLoading(false);
    }
    load();
  }, []);

  const persist = useCallback(async (state: GameState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (userId) {
      await supabase
        .from('game_progress')
        .upsert(
          { user_id: userId, game_state: state as any, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    }
  }, [userId, queryClient]);

  const setGameState = useCallback((updater: (prev: GameState) => GameState) => {
    setGameStateRaw(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, [persist]);

  const recordAnswer = useCallback((
    activityType: string,
    correct: boolean,
    powerEarned?: PowerType
  ) => {
    setGameState(prev => {
      const xpGain = getXPForActivity(correct, activityType);
      const newXP = prev.xp + xpGain;
      const newLevel = getLevelFromXP(newXP);
      const newTitle = LEVEL_TITLES[newLevel];

      let newCharges = [...prev.powerCharges];
      if (correct && powerEarned && newCharges.length < POWER_CHARGE_MAX) {
        newCharges.push(powerEarned);
      }

      const newUnlocked = [...prev.unlockedPowers];
      const powersByLevel: Record<number, PowerType[]> = {
        2: ['word_lightning', 'truth_shield'],
        3: ['mind_whirl', 'heart_heal'],
        4: ['vision_orb'],
      };
      if (powersByLevel[newLevel]) {
        powersByLevel[newLevel].forEach(p => {
          if (!newUnlocked.includes(p)) newUnlocked.push(p);
        });
      }

      return { ...prev, xp: newXP, level: newLevel, title: newTitle, powerCharges: newCharges, unlockedPowers: newUnlocked };
    });
  }, [setGameState]);

  const recordActivityComplete = useCallback((activityType: string) => {
    setGameState(prev => {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = prev.lastPlayedDate !== today;
      return {
        ...prev,
        activitiesCompletedToday: isNewDay ? 1 : prev.activitiesCompletedToday + 1,
        streak: isNewDay ? prev.streak + 1 : prev.streak,
        lastPlayedDate: today,
        frostbiteDefeatMeter: Math.min(100, prev.frostbiteDefeatMeter + 4),
      };
    });
  }, [setGameState]);

  // Kept for compatibility but no longer used — boss is triggered directly
  // in Activity.tsx after a submit, not on page load.
  const shouldTriggerBoss = useCallback((): boolean => false, []);

  const recordBossWin = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      bossEncountersWon: prev.bossEncountersWon + 1,
      lastBossDate: new Date().toISOString().split('T')[0],
      frostbiteDefeatMeter: Math.min(100, prev.frostbiteDefeatMeter + 15),
      xp: prev.xp + 100,
    }));
  }, [setGameState]);

  const usePowerCharge = useCallback((powerType: PowerType) => {
    setGameState(prev => ({
      ...prev,
      powerCharges: prev.powerCharges.filter((_, i) => {
        const idx = prev.powerCharges.indexOf(powerType);
        return i !== idx;
      }),
    }));
  }, [setGameState]);

  const thawPlant = useCallback((plantId: string) => {
    setGameState(prev => ({
      ...prev,
      plants: prev.plants.map(p =>
        p.id === plantId ? { ...p, frostLevel: Math.max(0, p.frostLevel - 1) } : p
      ),
    }));
  }, [setGameState]);

  const bloomPlant = useCallback((plantId: string) => {
    setGameState(prev => ({
      ...prev,
      plants: prev.plants.map(p =>
        p.id === plantId ? { ...p, bloomed: true, frostLevel: 0 } : p
      ),
    }));
  }, [setGameState]);

  const updateGrade = useCallback((grade: Grade) => {
    setGameState(prev => ({ ...prev, grade }));
  }, [setGameState]);

  const updatePlayerName = useCallback((name: string) => {
    setGameState(prev => ({ ...prev, playerName: name }));
  }, [setGameState]);

  const xpProgress = gameState
    ? (() => {
        const lvl = gameState.level;
        const current = gameState.xp - (XP_THRESHOLDS[lvl] ?? 0);
        const needed = (XP_THRESHOLDS[lvl + 1] ?? XP_THRESHOLDS[5]) - (XP_THRESHOLDS[lvl] ?? 0);
        return Math.min(100, Math.round((current / needed) * 100));
      })()
    : 0;

  return {
    gameState,
    loading,
    overnightMessage,
    xpProgress,
    recordAnswer,
    recordActivityComplete,
    shouldTriggerBoss,
    recordBossWin,
    usePowerCharge,
    thawPlant,
    bloomPlant,
    updateGrade,
    updatePlayerName,
  };
}

// ── Legacy type exports (used by Garden.tsx / Progress.tsx) ──────────────
export type PlantStage = 'seed' | 'sprout' | 'leaves' | 'bud' | 'flower';
export const LEVEL_TO_STAGE: Record<number, PlantStage> = {
  1: 'seed', 2: 'sprout', 3: 'leaves', 4: 'bud', 5: 'flower',
};
