// ─────────────────────────────────────────
// src/components/dashboard/ParentDashboard.tsx
// Parent-facing progress dashboard.
// PIN-protected. Uses shadcn/ui Tabs + your
// garden Tailwind theme.
// ─────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParentSettings } from '@/hooks/useParentSettings';
import { useGameState } from '@/hooks/useGameState';
import { GRADE_CONFIGS } from '@/data/frostbiteGameData';
import type { Grade } from '@/types/game';

interface Props {
  onClose: () => void;
}

export const ParentDashboard: React.FC<Props> = ({ onClose }) => {
  const {
    settings, pinVerified, pinError, pinIsSet,
    setPin, verifyPin, lockDashboard,
    updateGrade, updateChildName, updateSessionLimit,
  } = useParentSettings();

  const { gameState } = useGameState();
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSetError, setPinSetError] = useState('');

  // ── PIN Setup ─────────────────────────────────────────────────────────────
  if (!pinIsSet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-garden-green p-6">
        <div className="clay-card w-full max-w-sm p-6 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-xl font-black text-garden-green mb-1" style={{ fontFamily: 'Nunito' }}>
            Set a Parent PIN
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Create a 4-digit PIN so only you can access parent settings.
          </p>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="New 4-digit PIN"
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="mb-3 text-center text-xl tracking-widest font-black"
          />
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="Confirm PIN"
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="mb-3 text-center text-xl tracking-widest font-black"
          />
          {pinSetError && <p className="text-red-500 text-sm mb-3">{pinSetError}</p>}
          <Button
            className="clay-button w-full bg-garden-green text-white font-black"
            onClick={async () => {
              if (newPin !== confirmPin) { setPinSetError("PINs don't match."); return; }
              await setPin(newPin);
            }}
          >
            Set PIN & Open Dashboard
          </Button>
          <button
            onClick={onClose}
            className="mt-3 text-sm text-gray-400 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── PIN Verify ────────────────────────────────────────────────────────────
  if (!pinVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-garden-green p-6">
        <div className="clay-card w-full max-w-sm p-6 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-xl font-black text-garden-green mb-1" style={{ fontFamily: 'Nunito' }}>
            Parent Area
          </h2>
          <p className="text-sm text-gray-500 mb-4">Enter your 4-digit PIN to continue.</p>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="• • • •"
            value={pinInput}
            onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={e => { if (e.key === 'Enter') verifyPin(pinInput); }}
            className="mb-3 text-center text-2xl tracking-widest font-black"
            autoFocus
          />
          {pinError && <p className="text-red-500 text-sm mb-3">{pinError}</p>}
          <Button
            className="clay-button w-full bg-garden-green text-white font-black mb-2"
            onClick={() => { verifyPin(pinInput); }}
          >
            Unlock Dashboard
          </Button>
          <button onClick={onClose} className="text-sm text-gray-400 underline">
            Back to Garden
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const gradeOptions: Grade[] = [1, 2, 3, 4, 5];

  // Build simple stats from gameState
  const stats = useMemo(() => {
    if (!gameState) return null;
    const bloomedPlants = gameState.plants.filter(p => p.bloomed).length;
    const totalPlants = gameState.plants.length;
    return {
      level: gameState.level,
      title: gameState.title,
      xp: gameState.xp,
      streak: gameState.streak,
      bossesDefeated: gameState.bossEncountersWon,
      activitiesToday: gameState.activitiesCompletedToday,
      frostbiteMeter: gameState.frostbiteDefeatMeter,
      bloomedPlants,
      totalPlants,
      lastPlayed: gameState.lastPlayedDate || 'Not yet',
    };
  }, [gameState]);

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-50"
      style={{ fontFamily: 'Nunito' }}
    >
      {/* ── Header ── */}
      <div className="bg-garden-green text-white p-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-xl">🌱 Parent Dashboard</h1>
          <p className="text-green-100 text-sm font-bold">{settings.childName || 'Your Child'}'s Progress</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white bg-transparent hover:bg-green-700 text-xs font-bold"
            onClick={() => { lockDashboard(); onClose(); }}
          >
            🔒 Lock
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white bg-transparent hover:bg-green-700 text-xs font-bold"
            onClick={onClose}
          >
            ✕ Close
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="progress">
          <TabsList className="w-full mb-4 bg-white border border-gray-200">
            <TabsTrigger value="progress" className="flex-1 text-xs font-bold">📊 Progress</TabsTrigger>
            <TabsTrigger value="garden"   className="flex-1 text-xs font-bold">🌻 Garden</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 text-xs font-bold">⚙️ Settings</TabsTrigger>
          </TabsList>

          {/* ── Progress Tab ── */}
          <TabsContent value="progress">
            {stats ? (
              <div className="space-y-3">
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Current Level', value: `${stats.level} — ${stats.title}`, emoji: '🏅' },
                    { label: 'Total XP',       value: stats.xp,                          emoji: '⭐' },
                    { label: 'Day Streak',     value: `${stats.streak} days`,            emoji: '🔥' },
                    { label: 'Bosses Defeated',value: stats.bossesDefeated,              emoji: '🧊' },
                  ].map(({ label, value, emoji }) => (
                    <div key={label} className="clay-card p-3 text-center">
                      <div className="text-2xl mb-1">{emoji}</div>
                      <div className="font-black text-garden-green text-lg leading-none">{value}</div>
                      <div className="text-xs text-gray-500 font-bold mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Frostbite defeat meter */}
                <div className="clay-card p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-sm text-blue-700">❄️ Frostbite Defeat Meter</span>
                    <span className="font-black text-sm text-blue-700">{stats.frostbiteMeter}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${stats.frostbiteMeter}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-bold">Overall campaign progress</p>
                </div>

                {/* Activities today */}
                <div className="clay-card p-4">
                  <p className="font-black text-sm text-garden-green mb-2">📚 Today's Activity</p>
                  <p className="text-2xl font-black text-center">{stats.activitiesToday}</p>
                  <p className="text-xs text-gray-400 text-center font-bold">activities completed today</p>
                </div>

                <div className="clay-card p-3 text-xs text-gray-400 font-bold text-center">
                  Last played: {stats.lastPlayed}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400 font-bold py-8">No game data yet — play a session first!</p>
            )}
          </TabsContent>

          {/* ── Garden Tab ── */}
          <TabsContent value="garden">
            {stats ? (
              <div className="space-y-3">
                <div className="clay-card p-4 text-center">
                  <div className="text-4xl mb-2">🌻</div>
                  <p className="font-black text-garden-green text-2xl">{stats.bloomedPlants} / {stats.totalPlants}</p>
                  <p className="text-sm text-gray-500 font-bold">Plants Bloomed</p>
                </div>
                <div className="clay-card p-4">
                  <p className="font-black text-sm text-garden-green mb-3">Plant Status</p>
                  <div className="space-y-2">
                    {gameState?.plants.map(plant => (
                      <div key={plant.id} className="flex items-center justify-between">
                        <span className="text-sm font-bold capitalize">{plant.type}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-full"
                          style={{
                            background: plant.frostLevel > 0 ? '#dbeafe' : plant.bloomed ? '#dcfce7' : '#fef9c3',
                            color: plant.frostLevel > 0 ? '#1d4ed8' : plant.bloomed ? '#166534' : '#854d0e',
                          }}>
                          {plant.frostLevel > 0 ? '❄️ Frozen' : plant.bloomed ? '✅ Bloomed' : '🌱 Growing'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400 font-bold py-8">Start a session to see garden data!</p>
            )}
          </TabsContent>

          {/* ── Settings Tab ── */}
          <TabsContent value="settings">
            <div className="space-y-4">
              {/* Child name */}
              <div className="clay-card p-4">
                <label className="font-black text-sm text-garden-green block mb-2">Child's Name</label>
                <Input
                  value={settings.childName}
                  onChange={e => updateChildName(e.target.value)}
                  placeholder="e.g. Emma"
                  className="font-bold"
                />
              </div>

              {/* Grade selector */}
              <div className="clay-card p-4">
                <label className="font-black text-sm text-garden-green block mb-2">
                  Grade Level
                </label>
                <p className="text-xs text-gray-400 font-bold mb-3">
                  This controls story difficulty and Frostbite challenge level.
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {gradeOptions.map(g => (
                    <button
                      key={g}
                      onClick={() => updateGrade(g)}
                      className={`py-2 rounded-xl font-black text-sm border-2 transition-all
                        ${settings.grade === g
                          ? 'bg-garden-green text-white border-garden-green'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-garden-green'
                        }`}
                    >
                      {g}
                      <div className="text-xs opacity-75">{GRADE_CONFIGS[g].title.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 font-bold mt-2">
                  Currently: Grade {settings.grade} — {GRADE_CONFIGS[settings.grade].title}
                </p>
              </div>

              {/* Daily time limit */}
              <div className="clay-card p-4">
                <label className="font-black text-sm text-garden-green block mb-2">
                  Daily Session Limit
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 0].map(mins => (
                    <button
                      key={mins}
                      onClick={() => updateSessionLimit(mins)}
                      className={`py-2 rounded-xl font-black text-xs border-2 transition-all
                        ${settings.dailySessionLimitMins === mins
                          ? 'bg-garden-yellow text-black border-garden-yellow'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-garden-yellow'
                        }`}
                    >
                      {mins === 0 ? '∞' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center font-bold">
                Changes save automatically ✓
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;
