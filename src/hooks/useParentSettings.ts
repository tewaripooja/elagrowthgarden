// ─────────────────────────────────────────
// src/hooks/useParentSettings.ts
// Parent PIN, grade selector, dashboard access.
// PIN is a 4-digit code hashed with SHA-256 (WebCrypto) before storage.
// ─────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ParentSettings, Grade } from '@/types/game';

const SETTINGS_KEY = 'ela_parent_settings';

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

  /** Set a new 4-digit PIN. Returns true on success. */
  const setPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!/^\d{4}$/.test(pin)) {
      setPinError('PIN must be exactly 4 digits.');
      return false;
    }
    const hash = await hashPin(pin);
    setSettings(prev => ({ ...prev, parentPinHash: hash }));
    setPinVerified(true);
    setPinError('');
    return true;
  }, [setSettings]);

  /** Verify entered PIN against stored hash. Returns true if correct. */
  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    const hash = await hashPin(pin);
    const correct = hash === settings.parentPinHash;
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
