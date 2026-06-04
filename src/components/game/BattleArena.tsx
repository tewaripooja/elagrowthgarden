// src/components/game/BattleArena.tsx

import React from 'react';
import { FrostbiteCharacter, type FrostbiteMood } from './FrostbiteCharacter';
import { PipBattleCharacter } from './PipBattleCharacter';
import { POWERS } from '@/data/frostbiteGameData';
import type { BossEncounterState, PipMood, PowerType, PipStage, Grade } from '@/types/game';

const font = "'Nunito',sans-serif";

// ── Arena themes per grade ────────────────────────────────────────────────────

interface ArenaTheme {
  name: string;
  bg: string;             // CSS gradient for full background
  groundColor: string;    // arena floor strip color
  groundBorder: string;
  particles: { emoji: string; count: number; animBase: string }[];
  accentColor: string;    // used for borders / glows
}

const ARENA_THEMES: Record<Grade, ArenaTheme> = {
  1: {
    name: '🌿 Forest Clearing',
    bg: 'linear-gradient(180deg, #0d2b0d 0%, #1b4d20 35%, #2d7a3a 65%, #1a3d1f 100%)',
    groundColor: 'rgba(80,180,90,.18)',
    groundBorder: 'rgba(100,220,110,.3)',
    accentColor: '#5BBD4E',
    particles: [
      { emoji: '🍃', count: 6, animBase: 'leafDrift' },
      { emoji: '✨', count: 3, animBase: 'sparkFloat' },
    ],
  },
  2: {
    name: '🌊 Ocean Shore',
    bg: 'linear-gradient(180deg, #00214d 0%, #0a4a7a 40%, #0d7aad 70%, #0a3d5c 100%)',
    groundColor: 'rgba(0,180,220,.15)',
    groundBorder: 'rgba(60,200,240,.35)',
    accentColor: '#00b4d8',
    particles: [
      { emoji: '🫧', count: 6, animBase: 'bubbleRise' },
      { emoji: '💧', count: 3, animBase: 'sparkFloat' },
    ],
  },
  3: {
    name: '🔥 Volcano Temple',
    bg: 'linear-gradient(180deg, #1a0000 0%, #5c0f0f 40%, #a02020 70%, #3d0a0a 100%)',
    groundColor: 'rgba(220,80,20,.18)',
    groundBorder: 'rgba(255,120,40,.4)',
    accentColor: '#ff6b35',
    particles: [
      { emoji: '🔥', count: 4, animBase: 'emberRise' },
      { emoji: '✨', count: 4, animBase: 'sparkFloat' },
    ],
  },
  4: {
    name: '🌌 Space Nebula',
    bg: 'linear-gradient(180deg, #03001c 0%, #1b0a3d 40%, #2e0854 70%, #12003a 100%)',
    groundColor: 'rgba(120,60,220,.15)',
    groundBorder: 'rgba(180,100,255,.35)',
    accentColor: '#9b59b6',
    particles: [
      { emoji: '⭐', count: 7, animBase: 'starTwinkle' },
      { emoji: '🌟', count: 3, animBase: 'sparkFloat' },
    ],
  },
  5: {
    name: '🐉 Dragon Realm',
    bg: 'linear-gradient(180deg, #0d0500 0%, #2a0f00 35%, #4a1a00 65%, #1a0800 100%)',
    groundColor: 'rgba(200,100,0,.18)',
    groundBorder: 'rgba(255,160,40,.4)',
    accentColor: '#FFD700',
    particles: [
      { emoji: '🔥', count: 3, animBase: 'emberRise' },
      { emoji: '⚡', count: 3, animBase: 'sparkFloat' },
      { emoji: '🌟', count: 2, animBase: 'starTwinkle' },
    ],
  },
};

// ── HP Bar ────────────────────────────────────────────────────────────────────

function HPBar({ name, current, max, color, align = 'left' }: {
  name: string; current: number; max: number; color: string; align?: 'left' | 'right';
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = current <= 1 ? '#e74c3c' : color;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: align === 'right' ? 'flex-end' : 'flex-start', marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', fontFamily: font,
          textShadow: '0 1px 3px rgba(0,0,0,.5)' }}>{name}</span>
      </div>
      <div style={{ background: 'rgba(0,0,0,.4)', borderRadius: 6, height: 12, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 6, background: barColor,
          width: `${pct}%`,
          transition: 'width 0.4s ease, background 0.3s',
          boxShadow: `0 0 8px ${barColor}99`,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: align === 'right' ? 'flex-end' : 'flex-start', marginTop: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.65)', fontFamily: font }}>
          {current}/{max}
        </span>
      </div>
    </div>
  );
}

// ── Ambient Particles ─────────────────────────────────────────────────────────

function AmbientParticles({ theme }: { theme: ArenaTheme }) {
  const items: React.ReactNode[] = [];
  let key = 0;
  for (const group of theme.particles) {
    for (let i = 0; i < group.count; i++) {
      const left   = 5 + Math.floor(Math.random() * 90);
      const delay  = (Math.random() * 4).toFixed(2);
      const dur    = (3 + Math.random() * 4).toFixed(2);
      const size   = 10 + Math.floor(Math.random() * 10);
      items.push(
        <span key={key++} style={{
          position: 'absolute',
          left: `${left}%`,
          bottom: '30px',
          fontSize: size,
          pointerEvents: 'none',
          opacity: 0,
          animation: `${group.animBase} ${dur}s ease-in-out ${delay}s infinite`,
          zIndex: 1,
        }}>
          {group.emoji}
        </span>
      );
    }
  }
  return <>{items}</>;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  state: BossEncounterState;
  grade: Grade;
  pipMood: PipMood;
  frostbiteMood: FrostbiteMood;
  dialogue: string;
  pipMessage: string;
  pipStage: PipStage;
  timerPct: number;
  answered: boolean;
  selectedIdx: number | null;
  latestPowerIndex: number;
  earnedPowers: PowerType[];
  shake: boolean;
  showProjectileRight: boolean;
  showProjectileLeft: boolean;
  projectileEmoji: string;
  screenFlash: 'hit' | 'hurt' | null;
  showIceParticles: boolean;
  showSparkParticles: boolean;
  onAnswer: (idx: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const BattleArena: React.FC<Props> = ({
  state, grade, pipMood, frostbiteMood, dialogue, pipMessage,
  pipStage, timerPct, answered, selectedIdx, latestPowerIndex,
  earnedPowers, shake, showProjectileRight, showProjectileLeft,
  projectileEmoji, screenFlash, showIceParticles, showSparkParticles,
  onAnswer,
}) => {
  const q     = state.questions[state.currentQuestion];
  const theme = ARENA_THEMES[grade];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: theme.bg,
      fontFamily: font,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Ambient background particles ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <AmbientParticles theme={theme} />
      </div>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 16px',
        background: 'rgba(0,0,0,.3)',
        borderBottom: `1px solid ${theme.accentColor}44`,
        position: 'relative', zIndex: 5,
      }}>
        <div>
          <p style={{ color: theme.accentColor, fontWeight: 900, fontSize: 10,
            letterSpacing: 1.5, textTransform: 'uppercase', textShadow: `0 0 8px ${theme.accentColor}` }}>
            {theme.name}
          </p>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, fontWeight: 700 }}>
            Q {state.currentQuestion + 1} / {state.questions.length}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: state.maxHearts }).map((_, i) => (
            <span key={i} style={{
              fontSize: 18,
              filter: i < state.frostbiteHearts ? 'none' : 'grayscale(1) opacity(0.2)',
              transition: 'filter 0.3s',
            }}>❄️</span>
          ))}
        </div>
      </div>

      {/* ── HP bars ── */}
      <div style={{ display: 'flex', gap: 12, padding: '10px 16px 6px', position: 'relative', zIndex: 5 }}>
        <HPBar name="🌿 Pip" current={state.pipHearts} max={state.pipMaxHearts}
          color={theme.accentColor} align="left" />
        <HPBar name="Frostbite ❄️" current={state.frostbiteHearts} max={state.maxHearts}
          color="#7EC8E3" align="right" />
      </div>

      {/* ── Screen flash ── */}
      {screenFlash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
          background: screenFlash === 'hit'
            ? 'rgba(255,220,50,.22)'
            : 'rgba(80,180,255,.28)',
          animation: 'screenFlashFade 0.35s ease-out forwards',
        }} />
      )}

      {/* ── Characters stage ── */}
      <div style={{ position: 'relative', height: 160, margin: '4px 16px 0', flexShrink: 0, zIndex: 5 }}>

        {/* Arena ground */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
          background: theme.groundColor,
          borderRadius: 10,
          borderTop: `2px solid ${theme.groundBorder}`,
          boxShadow: `0 0 20px ${theme.accentColor}22`,
        }} />

        {/* Pip (left) */}
        <div style={{ position: 'absolute', left: 8, bottom: 30 }}>
          <PipBattleCharacter mood={pipMood} size={96} stage={pipStage} />
        </div>

        {/* Frostbite (right) — flipped to face left */}
        <div style={{ position: 'absolute', right: 8, bottom: 22, transform: 'scaleX(-1)' }}>
          <FrostbiteCharacter mood={frostbiteMood} size={96} />
        </div>

        {/* Frostbite dialogue bubble */}
        <div style={{
          position: 'absolute', right: 112, bottom: 88,
          background: 'rgba(255,255,255,.96)',
          border: `2px solid ${theme.accentColor}88`,
          borderRadius: '12px 12px 4px 12px',
          padding: '7px 11px', maxWidth: 155,
          fontSize: 11, fontWeight: 700, color: '#1a3a5a',
          boxShadow: `0 3px 12px rgba(0,0,0,.25), 0 0 8px ${theme.accentColor}33`,
          lineHeight: 1.4, zIndex: 10,
        }}>
          {dialogue}
        </div>

        {/* Projectile → Pip attacks Frostbite */}
        {showProjectileRight && (
          <span style={{
            position: 'absolute', left: 108, bottom: 70, fontSize: 26,
            animation: 'projectileRight 0.55s ease-in forwards',
            pointerEvents: 'none', zIndex: 10, display: 'inline-block',
          }}>
            {projectileEmoji}
          </span>
        )}

        {/* Projectile ← Frostbite attacks Pip */}
        {showProjectileLeft && (
          <span style={{
            position: 'absolute', right: 108, bottom: 70, fontSize: 26,
            animation: 'projectileLeft 0.55s ease-in forwards',
            pointerEvents: 'none', zIndex: 10, display: 'inline-block',
          }}>
            {projectileEmoji}
          </span>
        )}

        {/* Ice particles burst on Frostbite hit */}
        {showIceParticles && ['❄️','💎','❄️','🔹','❄️'].map((ch, i) => (
          <span key={i} style={{
            position: 'absolute', right: 20 + i * 14, bottom: 44 + (i % 3) * 22,
            fontSize: 14 + (i % 2) * 6, pointerEvents: 'none', zIndex: 15,
            animation: `iceParticle${i % 3} 0.6s ease-out forwards`,
          }}>{ch}</span>
        ))}

        {/* Spark particles burst from Pip on correct answer */}
        {showSparkParticles && ['✨','⭐','✨','💫','✨'].map((ch, i) => (
          <span key={i} style={{
            position: 'absolute', left: 20 + i * 12, bottom: 44 + (i % 3) * 20,
            fontSize: 12 + (i % 2) * 8, pointerEvents: 'none', zIndex: 15,
            animation: `sparkParticle${i % 3} 0.55s ease-out forwards`,
          }}>{ch}</span>
        ))}
      </div>

      {/* ── Power charges ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
        minHeight: 36, position: 'relative', zIndex: 5,
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.45)',
          textTransform: 'uppercase', letterSpacing: 0.5 }}>Powers</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {earnedPowers.length === 0 ? (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', fontStyle: 'italic' }}>
              Answer correctly to earn powers!
            </span>
          ) : (
            earnedPowers.map((p, i) => (
              <span key={`${p}-${i}`} title={POWERS[p].label} style={{
                fontSize: 20, display: 'inline-block',
                animation: i === latestPowerIndex
                  ? 'powerPopIn 0.45s cubic-bezier(.34,1.56,.64,1) forwards' : 'none',
                filter: 'drop-shadow(0 0 5px rgba(255,220,80,.7))',
              }}>
                {POWERS[p].emoji}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── Question area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 14px 16px',
        overflowY: 'auto', position: 'relative', zIndex: 5 }}>

        {/* Timer bar */}
        <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 6, height: 8,
          overflow: 'hidden', marginBottom: 10 }}>
          <div style={{
            height: '100%', borderRadius: 6,
            background: timerPct > 50 ? theme.accentColor : timerPct > 25 ? '#FFD700' : '#e74c3c',
            width: `${timerPct}%`,
            transition: 'width 0.1s linear, background 0.3s',
            boxShadow: timerPct <= 25 ? '0 0 10px #e74c3c' : `0 0 6px ${theme.accentColor}88`,
          }} />
        </div>

        {/* Question card */}
        <div style={{
          background: 'rgba(255,255,255,.97)', borderRadius: 16,
          padding: '14px 16px', marginBottom: 10,
          border: `2px solid ${theme.accentColor}55`,
          boxShadow: `0 4px 20px rgba(0,0,0,.3), 0 0 12px ${theme.accentColor}22`,
          animation: shake ? 'arenaShake 0.4s ease' : 'none',
        }}>
          <p style={{ fontWeight: 900, fontSize: 14, color: '#1a1a2e', lineHeight: 1.5 }}>
            {q.question}
          </p>
        </div>

        {/* Answer buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {q.options.map((opt, i) => {
            let bg     = 'rgba(255,255,255,.92)';
            let border = '2px solid rgba(200,220,255,.45)';
            let color  = '#1a1a2e';
            if (answered) {
              if (i === q.correctIndex)      { bg = '#dcfce7'; border = '2px solid #22c55e'; color = '#166534'; }
              else if (i === selectedIdx)    { bg = '#fee2e2'; border = '2px solid #ef4444'; color = '#991b1b'; }
              else                           { bg = 'rgba(255,255,255,.45)'; color = '#888'; }
            }
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => onAnswer(i)}
                style={{
                  background: bg, border, borderRadius: 14,
                  padding: '11px 14px', textAlign: 'left',
                  fontSize: 13, fontWeight: 700, color,
                  cursor: answered ? 'default' : 'pointer',
                  fontFamily: font,
                  transition: 'background 0.2s, border 0.2s, transform 0.1s',
                  boxShadow: answered ? 'none' : '0 3px 8px rgba(0,0,0,.18)',
                }}
                onMouseEnter={e => { if (!answered) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { if (!answered) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Pip encouragement */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,.1)', borderRadius: 14,
          padding: '10px 14px', border: `1.5px solid ${theme.accentColor}44`,
          boxShadow: `0 0 8px ${theme.accentColor}22`,
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🌿</span>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.9)',
            fontFamily: font, lineHeight: 1.4 }}>{pipMessage}</p>
        </div>
      </div>

      {/* ── CSS keyframes ── */}
      <style>{`
        @keyframes projectileRight {
          0%   { transform: translateX(0)     scale(1.2); opacity: 1;   }
          70%  { transform: translateX(150px) scale(1.7); opacity: 0.9; }
          100% { transform: translateX(220px) scale(0.3); opacity: 0;   }
        }
        @keyframes projectileLeft {
          0%   { transform: translateX(0)      scale(1.2); opacity: 1;   }
          70%  { transform: translateX(-150px) scale(1.7); opacity: 0.9; }
          100% { transform: translateX(-220px) scale(0.3); opacity: 0;   }
        }
        @keyframes powerPopIn {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.5) rotate(5deg); opacity: 1; }
          100% { transform: scale(1)   rotate(0deg); opacity: 1; }
        }
        @keyframes arenaShake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-5px); }
          80%     { transform: translateX(5px); }
        }
        @keyframes screenFlashFade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes iceParticle0 {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(-28px,-44px) scale(0.3); opacity:0; }
        }
        @keyframes iceParticle1 {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(20px,-54px) scale(0.2); opacity:0; }
        }
        @keyframes iceParticle2 {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(-10px,-64px) scale(0.4); opacity:0; }
        }
        @keyframes sparkParticle0 {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(32px,-48px) scale(0.3); opacity:0; }
        }
        @keyframes sparkParticle1 {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(-22px,-58px) scale(0.2); opacity:0; }
        }
        @keyframes sparkParticle2 {
          0%   { transform: translate(0,0) scale(1); opacity:1; }
          100% { transform: translate(12px,-68px) scale(0.4); opacity:0; }
        }
        /* Ambient particle animations */
        @keyframes leafDrift {
          0%   { opacity:0; transform: translateY(0) rotate(0deg) translateX(0); }
          15%  { opacity:0.8; }
          80%  { opacity:0.6; }
          100% { opacity:0; transform: translateY(-120px) rotate(360deg) translateX(30px); }
        }
        @keyframes bubbleRise {
          0%   { opacity:0; transform: translateY(0) scale(0.7); }
          20%  { opacity:0.7; }
          80%  { opacity:0.5; }
          100% { opacity:0; transform: translateY(-130px) scale(1.2); }
        }
        @keyframes emberRise {
          0%   { opacity:0; transform: translateY(0) scale(1) translateX(0); }
          20%  { opacity:0.9; }
          60%  { opacity:0.6; }
          100% { opacity:0; transform: translateY(-110px) scale(0.4) translateX(20px); }
        }
        @keyframes starTwinkle {
          0%,100% { opacity:0; transform: scale(0.5); }
          40%,60% { opacity:0.9; transform: scale(1.2); }
        }
        @keyframes sparkFloat {
          0%   { opacity:0; transform: translateY(0) scale(0.8); }
          30%  { opacity:1; }
          100% { opacity:0; transform: translateY(-90px) scale(0.3); }
        }
      `}</style>
    </div>
  );
};

export default BattleArena;
