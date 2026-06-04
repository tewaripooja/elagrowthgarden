// ─────────────────────────────────────────
// src/hooks/useParentSettings.ts
// Parent PIN, grade selector, dashboard access.
// PIN is a simple 4-digit code stored hashed
// in localStorage + Supabase user metadata.
// ─────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ParentSettings, Grade } from '@/types/game';

const SETTINGS_KEY = 'ela_parent_settings';

// Simple hash — not cryptographic, just obfuscation for a kids app PIN
function hashPin(pin: string): string {
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) - h) + pin.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function defaultSettings(): ParentSettings {
  return {
    childName: '',
    grade: 1,
    dailySessionLimitMins: 15,
    parentPinHash: '',
    dashboardEnabled: true,
  };
}

export function useParentSettings() {
  const [settings, setSettingsRaw] = useState<ParentSettings>(defaultSettings());
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { setSettingsRaw(JSON.parse(stored)); } catch { /* use default */ }
    }
  }, []);

  // ── Persist ───────────────────────────────────────────────────────────────
  const persist = useCallback(async (s: ParentSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

    // Also store grade in Supabase user metadata if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: { child_grade: s.grade, child_name: s.childName },
      });
    }
  }, []);

  const setSettings = useCallback((updater: (prev: ParentSettings) => ParentSettings) => {
    setSettingsRaw(prev => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, [persist]);

  // ── PIN management ────────────────────────────────────────────────────────

  /** Set a new 4-digit PIN. Call on first setup. */
  const setPin = useCallback((pin: string): boolean => {
    if (!/^\d{4}$/.test(pin)) {
      setPinError('PIN must be exactly 4 digits.');
      return false;
    }
    setSettings(prev => ({ ...prev, parentPinHash: hashPin(pin) }));
    setPinVerified(true);
    setPinError('');
    return true;
  }, [setSettings]);

  /** Verify entered PIN against stored hash. Returns true if correct. */
  const verifyPin = useCallback((pin: string): boolean => {
    const correct = hashPin(pin) === settings.parentPinHash;
    if (correct) {
      setPinVerified(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Please try again.');
    }
    return correct;
  }, [settings.parentPinHash]);

  const lockDashboard = useCallback(() => setPinVerified(false), []);

  const pinIsSet = settings.parentPinHash !== '';

  // ── Settings updaters ─────────────────────────────────────────────────────

  const updateGrade = useCallback((grade: Grade) => {
    setSettings(prev => ({ ...prev, grade }));
  }, [setSettings]);

  const updateChildName = useCallback((name: string) => {
    setSettings(prev => ({ ...prev, childName: name }));
  }, [setSettings]);

  const updateSessionLimit = useCallback((mins: number) => {
    setSettings(prev => ({ ...prev, dailySessionLimitMins: mins }));
  }, [setSettings]);

  const toggleDashboard = useCallback(() => {
    setSettings(prev => ({ ...prev, dashboardEnabled: !prev.dashboardEnabled }));
  }, [setSettings]);

  return {
    settings,
    pinVerified,
    pinError,
    pinIsSet,
    // Actions
    setPin,
    verifyPin,
    lockDashboard,
    updateGrade,
    updateChildName,
    updateSessionLimit,
    toggleDashboard,
  };
}
