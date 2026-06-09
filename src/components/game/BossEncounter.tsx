// ─────────────────────────────────────────
// src/components/game/BossEncounter.tsx
// Prodigy-style visual boss battle.
// Pip (left) fights Frostbite (right) with
// HP bars, projectile animations, and powers.
// ─────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FrostbiteCharacter, FrostbiteMood } from './FrostbiteCharacter';
import { BattleArena } from './BattleArena';
import {
  BOSS_QUESTIONS, GRADE_CONFIGS,
  FROSTBITE_TAUNTS, FROSTBITE_HURT_REACTIONS, FROSTBITE_DEFEAT_LINES,
  POWERS, ACTIVITY_TO_POWER,
} from '@/data/frostbiteGameData';
import type { Grade, BossEncounterState, PipMood, PowerType, PipStage } from '@/types/game';
import type { CombinedStoryData } from '@/lib/ai';
import { deriveQuestionsFromStory, pickBossQuestions } from '@/lib/bossQuestionsFromStory';

// Matches the themes in BattleArena — used to tint intro/victory/defeat screens
const GRADE_ACCENT: Record<Grade, string> = {
  1: '#5BBD4E',
  2: '#00b4d8',
  3: '#ff6b35',
  4: '#9b59b6',
  5: '#FFD700',
};
const GRADE_BG: Record<Grade, string> = {
  1: 'linear-gradient(180deg,#0d2b0d 0%,#1b4d20 60%,#1a3d1f 100%)',
  2: 'linear-gradient(180deg,#00214d 0%,#0a4a7a 60%,#0a3d5c 100%)',
  3: 'linear-gradient(180deg,#1a0000 0%,#5c0f0f 60%,#3d0a0a 100%)',
  4: 'linear-gradient(180deg,#03001c 0%,#1b0a3d 60%,#12003a 100%)',
  5: 'linear-gradient(180deg,#0d0500 0%,#2a0f00 60%,#1a0800 100%)',
};
import {
  playBossIntroSound, playBossHitSound, playBossAttackSound,
  playBossVictorySound, playBossDefeatSound, playPowerEarnedSound,
  speakFrostbite, stopFrostbiteVoice,
} from '@/lib/sounds';

const font = "'Nunito',sans-serif";

function getPipStartHP(g: Grade): number {
  if (g <= 2) return 3;
  if (g === 3) return 4;
  return 5;
}

interface Props {
  grade: Grade;
  pipStage?: PipStage;
  storyData?: CombinedStoryData | null;
  onVictory: () => void;
  onDefeat: () => void;
}

export const BossEncounter: React.FC<Props> = ({
  grade, pipStage = 1, storyData, onVictory, onDefeat,
}) => {
  const config = GRADE_CONFIGS[grade];
  const pipHP  = getPipStartHP(grade);

  // Build question pool on mount — useState initializer runs once per mount,
  // so every new battle gets a freshly shuffled set.
  const [shuffledQuestions] = useState(() => {
    const storyQs = storyData ? deriveQuestionsFromStory(storyData) : [];
    return pickBossQuestions(storyQs, BOSS_QUESTIONS[grade], 5);
  });

  const [state, setState] = useState<BossEncounterState>({
    phase: 'intro',
    frostbiteHearts: config.frostbiteHearts,
    maxHearts:       config.frostbiteHearts,
    currentQuestion: 0,
    questions: shuffledQuestions,
    playerHits:   0,
    frostbiteHits: 0,
    pipHearts:    pipHP,
    pipMaxHearts: pipHP,
  });

  // Frostbite state
  const [mood,     setMood]     = useState<FrostbiteMood>('taunt');
  const [dialogue, setDialogue] = useState("Bah! You dare challenge the great Frostbite?!");

  // Pip state
  const [pipMood, setPipMood] = useState<PipMood>('idle');

  // Question state
  const [timeLeft,     setTimeLeft]     = useState(config.bossQuestionTimeMs / 1000);
  const [answered,     setAnswered]     = useState(false);
  const [selectedIdx,  setSelectedIdx]  = useState<number | null>(null);
  const [shake,        setShake]        = useState(false);
  const [pipMessage,   setPipMessage]   = useState("You've got this! Answer fast! 🌟");

  // Projectile state
  const [showProjectileRight, setShowProjectileRight] = useState(false);
  const [showProjectileLeft,  setShowProjectileLeft]  = useState(false);
  const [projectileEmoji,     setProjectileEmoji]     = useState('⭐');

  // Visual effects state
  const [screenFlash,       setScreenFlash]       = useState<'hit' | 'hurt' | null>(null);
  const [showIceParticles,  setShowIceParticles]  = useState(false);
  const [showSparkParticles,setShowSparkParticles]= useState(false);

  // Power state
  const [earnedPowers,     setEarnedPowers]     = useState<PowerType[]>([]);
  const [latestPowerIndex, setLatestPowerIndex] = useState(-1);

  // ── Play intro sound + Frostbite intro speech ────────────────────────────
  useEffect(() => {
    if (state.phase === 'intro') {
      playBossIntroSound();
      setTimeout(() => speakFrostbite("Think you can beat me? Ha! Words are no match for the cold!"), 600);
    }
    if (state.phase === 'victory') {
      stopFrostbiteVoice();
      playBossVictorySound();
      setTimeout(() => speakFrostbite("You used... words. Just words. And you beat me. Impossible!"), 600);
    }
    if (state.phase === 'defeat') {
      stopFrostbiteVoice();
      playBossDefeatSound();
      setTimeout(() => speakFrostbite("Heh heh! Better luck next time, little Guardian!"), 500);
    }
  }, [state.phase]);

  // ── Timer countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'battle' || answered) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 0.1), 100);
    return () => clearTimeout(t);
  }, [timeLeft, state.phase, answered]);

  // Reset timer on new question; speak opening taunt on first question
  useEffect(() => {
    if (state.phase === 'battle') {
      setTimeLeft(config.bossQuestionTimeMs / 1000);
      setAnswered(false);
      setSelectedIdx(null);
      if (state.currentQuestion === 0) {
        setTimeout(() => speakFrostbite("Bah! You dare challenge the great Frostbite?!"), 400);
      }
    }
  }, [state.currentQuestion, state.phase]);

  // ── Answer handler ───────────────────────────────────────────────────────
  const handleAnswer = useCallback((idx: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedIdx(idx);

    const q       = state.questions[state.currentQuestion];
    const correct = idx === q.correctIndex;

    if (correct) {
      // ── CORRECT: Pip attacks Frostbite ──
      const earnedPower: PowerType = ACTIVITY_TO_POWER[q.activityType] ?? 'story_fire';
      const powerEmoji = POWERS[earnedPower].emoji;
      const hurtLine = FROSTBITE_HURT_REACTIONS[Math.floor(Math.random() * FROSTBITE_HURT_REACTIONS.length)];

      playBossHitSound();
      playPowerEarnedSound();

      setMood('hurt');
      setPipMood('attack');
      setProjectileEmoji(powerEmoji);
      setShowProjectileRight(true);
      setShowSparkParticles(true);
      setScreenFlash('hit');
      setDialogue(hurtLine);
      setPipMessage(['YES! Direct hit! 🔥', 'Wahoooo! 💫', 'Keep going! ⚡'][Math.floor(Math.random() * 3)]);

      setTimeout(() => speakFrostbite(hurtLine), 300);

      setEarnedPowers(prev => {
        const next = [...prev, earnedPower];
        setLatestPowerIndex(next.length - 1);
        return next;
      });

      setTimeout(() => {
        setShowProjectileRight(false);
        setShowSparkParticles(false);
        setScreenFlash(null);
        setPipMood('idle');
      }, 600);

      setState(prev => {
        const newHearts = prev.frostbiteHearts - 1;
        const newHits   = prev.playerHits + 1;

        if (newHearts <= 0) {
          // Victory!
          setTimeout(() => {
            setPipMood('victory');
            setMood('defeated');
            setDialogue(FROSTBITE_DEFEAT_LINES[0]);
            setState(p => ({ ...p, phase: 'victory', frostbiteHearts: 0 }));
          }, 800);
          return { ...prev, frostbiteHearts: 0, playerHits: newHits };
        }

        // Advance to next question
        setTimeout(() => {
          setMood('taunt');
          setPipMood('idle');
          const taunt = FROSTBITE_TAUNTS[Math.floor(Math.random() * FROSTBITE_TAUNTS.length)];
          setDialogue(taunt);
          speakFrostbite(taunt);
          if (prev.currentQuestion + 1 < prev.questions.length) {
            setState(p => ({ ...p, currentQuestion: p.currentQuestion + 1 }));
          }
        }, 900);

        return { ...prev, frostbiteHearts: newHearts, playerHits: newHits };
      });

    } else {
      // ── WRONG: Frostbite attacks Pip ──
      playBossAttackSound();

      const attackLine = "HA! Wrong! Feel the frost! 🧊";
      setMood('taunt');
      setPipMood('hurt');
      setShake(true);
      setProjectileEmoji('❄️');
      setShowProjectileLeft(true);
      setShowIceParticles(true);
      setScreenFlash('hurt');
      setDialogue(attackLine);
      setPipMessage("It's okay! You can still do this! 💪");

      setTimeout(() => speakFrostbite("HA! Wrong! Feel the frost!"), 200);

      setTimeout(() => {
        setShake(false);
        setShowProjectileLeft(false);
        setShowIceParticles(false);
        setScreenFlash(null);
        setPipMood('idle');
      }, 600);

      setState(prev => {
        const newPipHearts    = prev.pipHearts - 1;
        const newFrostbiteHits = prev.frostbiteHits + 1;

        if (newPipHearts <= 0) {
          // Pip HP = 0 → defeat
          setTimeout(() => {
            setState(p => ({ ...p, phase: 'defeat', pipHearts: 0 }));
          }, 900);
          return { ...prev, pipHearts: 0, frostbiteHits: newFrostbiteHits };
        }

        // Advance to next question or defeat if out of questions
        setTimeout(() => {
          setMood('taunt');
          const taunt = FROSTBITE_TAUNTS[Math.floor(Math.random() * FROSTBITE_TAUNTS.length)];
          setDialogue(taunt);
          speakFrostbite(taunt);
          if (prev.currentQuestion + 1 < prev.questions.length) {
            setState(p => ({ ...p, currentQuestion: p.currentQuestion + 1 }));
          } else {
            if (prev.frostbiteHearts > 0) {
              setState(p => ({ ...p, phase: 'defeat' }));
            }
          }
        }, 900);

        return { ...prev, pipHearts: newPipHearts, frostbiteHits: newFrostbiteHits };
      });
    }
  }, [answered, state]);

  const timerPct = (timeLeft / (config.bossQuestionTimeMs / 1000)) * 100;

  const accent = GRADE_ACCENT[grade];

  // ── INTRO phase ───────────────────────────────────────────────────────────
  if (state.phase === 'intro') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        background: GRADE_BG[grade],
        padding: 24, textAlign: 'center', fontFamily: font,
      }}>
        <div style={{ fontSize: 64, marginBottom: 12, animation: 'introBounce 1s ease-in-out infinite' }}>❄️</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8,
          textShadow: `0 0 24px ${accent}` }}>
          FROSTBITE APPEARS!
        </h1>
        <p style={{ color: 'rgba(220,240,255,.8)', fontWeight: 700, marginBottom: 24, fontSize: 14 }}>
          You've completed an activity — Frostbite is challenging you to a battle!
        </p>
        <FrostbiteCharacter mood="taunt" size={140} showFrostBreath />
        <div style={{
          background: 'rgba(255,255,255,.1)', border: `1.5px solid ${accent}66`,
          borderRadius: 16, padding: '14px 20px', maxWidth: 300, margin: '20px 0',
          backdropFilter: 'blur(8px)', boxShadow: `0 0 16px ${accent}33`,
        }}>
          <p style={{ fontWeight: 700, color: '#c8eef8', fontStyle: 'italic', fontSize: 13 }}>
            "Think you can beat me? Ha! Words are no match for the cold!"
          </p>
        </div>
        <Button
          style={{
            background: `linear-gradient(135deg,${accent},${accent}bb)`,
            color: '#fff', fontWeight: 900, fontSize: 16,
            padding: '14px 32px', borderRadius: 18, border: 'none',
            boxShadow: `0 6px 0 ${accent}66`, cursor: 'pointer',
            fontFamily: font, textShadow: '0 1px 3px rgba(0,0,0,.3)',
          }}
          onClick={() => setState(p => ({ ...p, phase: 'battle' }))}
        >
          ⚔️ Accept the Challenge!
        </Button>
        <style>{`
          @keyframes introBounce {
            0%,100% { transform: translateY(0) rotate(-5deg); }
            50%      { transform: translateY(-16px) rotate(5deg); }
          }
        `}</style>
      </div>
    );
  }

  // ── VICTORY phase ─────────────────────────────────────────────────────────
  if (state.phase === 'victory') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        background: GRADE_BG[grade],
        padding: 24, textAlign: 'center', fontFamily: font,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Victory confetti burst */}
        {['🎉','⭐','🌟','✨','🎊','💫','🌸','🏆'].map((e, i) => (
          <span key={i} style={{
            position: 'absolute',
            left: `${8 + i * 12}%`,
            top: '-20px',
            fontSize: 22 + (i % 3) * 6,
            animation: `confettiFall ${1.2 + i * 0.15}s ease-in ${i * 0.1}s infinite`,
            pointerEvents: 'none',
          }}>{e}</span>
        ))}

        <div style={{ fontSize: 64, marginBottom: 8, animation: 'victoryPop 0.6s cubic-bezier(.34,1.56,.64,1)' }}>🏆</div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', marginBottom: 8,
          textShadow: `0 0 24px ${accent}, 0 2px 8px rgba(0,0,0,.4)` }}>
          FROSTBITE DEFEATED!
        </h1>
        <FrostbiteCharacter mood="defeated" size={120} />
        <div style={{
          background: 'rgba(255,255,255,.12)', border: `1.5px solid ${accent}88`,
          borderRadius: 16, padding: '14px 20px', maxWidth: 300, margin: '16px 0',
          boxShadow: `0 0 20px ${accent}33`,
        }}>
          <p style={{ fontWeight: 700, color: '#dff5e0', fontStyle: 'italic', fontSize: 13 }}>
            "{FROSTBITE_DEFEAT_LINES[1]}"
          </p>
          <p style={{ fontWeight: 600, color: 'rgba(255,255,255,.6)', fontSize: 11, marginTop: 4 }}>
            — Frostbite, grumbling
          </p>
        </div>
        <p style={{ color: accent, fontWeight: 900, marginBottom: 4, fontSize: 16,
          textShadow: `0 0 12px ${accent}` }}>
          🌟 +100 XP earned!
        </p>
        {earnedPowers.length > 0 && (
          <p style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
            Powers earned: {earnedPowers.map(p => POWERS[p].emoji).join(' ')}
          </p>
        )}
        <p style={{ color: 'rgba(255,255,255,.75)', fontWeight: 700, marginBottom: 24, fontSize: 13 }}>
          Your garden is growing again! 🌱
        </p>
        <Button
          style={{
            background: `linear-gradient(135deg,${accent},${accent}bb)`,
            color: '#fff', fontWeight: 900, fontSize: 16,
            padding: '13px 32px', borderRadius: 18, border: 'none',
            boxShadow: `0 5px 0 ${accent}66`, cursor: 'pointer', fontFamily: font,
            textShadow: '0 1px 3px rgba(0,0,0,.3)',
          }}
          onClick={onVictory}
        >
          🌸 Back to My Garden!
        </Button>
        <style>{`
          @keyframes confettiFall {
            0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
            80%  { opacity: 0.8; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
          @keyframes victoryPop {
            0%   { transform: scale(0) rotate(-15deg); }
            60%  { transform: scale(1.3) rotate(5deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
        `}</style>
      </div>
    );
  }

  // ── DEFEAT phase ──────────────────────────────────────────────────────────
  if (state.phase === 'defeat') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
        background: 'linear-gradient(180deg,#0f0c29 0%,#1a1a4e 100%)',
        padding: 24, textAlign: 'center', fontFamily: font,
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🥶</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
          Frostbite won this round!
        </h1>
        <FrostbiteCharacter mood="taunt" size={110} />
        <div style={{
          background: 'rgba(255,255,255,.08)', border: '1.5px solid rgba(200,220,255,.2)',
          borderRadius: 16, padding: '14px 20px', maxWidth: 300, margin: '16px 0',
        }}>
          <p style={{ fontWeight: 700, color: '#c8eef8', fontStyle: 'italic', fontSize: 13 }}>
            "Heh heh! Better luck next time, little Guardian!"
          </p>
        </div>
        <p style={{ color: 'rgba(200,220,255,.8)', fontWeight: 700, marginBottom: 4, fontSize: 13 }}>
          Don't worry — Pip still believes in you! 💚
        </p>
        <p style={{ color: 'rgba(200,220,255,.5)', fontSize: 12, marginBottom: 24 }}>
          Complete more activities to grow stronger and try again!
        </p>
        <Button
          style={{
            background: `linear-gradient(135deg,${accent},${accent}bb)`, color: '#fff',
            fontWeight: 900, fontSize: 16, padding: '13px 32px',
            borderRadius: 18, border: 'none',
            boxShadow: `0 5px 0 ${accent}66`, cursor: 'pointer', fontFamily: font,
          }}
          onClick={onDefeat}
        >
          🌱 Keep Training!
        </Button>
      </div>
    );
  }

  // ── BATTLE phase — delegated to BattleArena ───────────────────────────────
  return (
    <BattleArena
      state={state}
      grade={grade}
      pipMood={pipMood}
      frostbiteMood={mood}
      dialogue={dialogue}
      pipMessage={pipMessage}
      pipStage={pipStage}
      timerPct={timerPct}
      answered={answered}
      selectedIdx={selectedIdx}
      latestPowerIndex={latestPowerIndex}
      earnedPowers={earnedPowers}
      shake={shake}
      showProjectileRight={showProjectileRight}
      showProjectileLeft={showProjectileLeft}
      projectileEmoji={projectileEmoji}
      screenFlash={screenFlash}
      showIceParticles={showIceParticles}
      showSparkParticles={showSparkParticles}
      onAnswer={handleAnswer}
    />
  );
};

export default BossEncounter;
