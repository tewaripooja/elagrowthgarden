// src/components/game/PipBattleCharacter.tsx

import React from 'react';
import type { PipMood, PipStage } from '@/types/game';
import { PIP_STAGES } from '@/data/frostbiteGameData';

interface Props {
  mood?: PipMood;
  size?: number;
  stage?: PipStage;
  className?: string;
}

export const PipBattleCharacter: React.FC<Props> = ({
  mood = 'idle',
  size = 100,
  stage = 1,
  className = '',
}) => {
  const stageData = PIP_STAGES[stage];
  const wingColor = stageData.wingColor;
  const glowColor = stageData.glowColor;
  const hasCrown  = stageData.hasCrown;
  const hasAura   = stageData.hasAura;

  // CSS animation name drives all movement — no JS state needed
  const animation: string =
    mood === 'idle'    ? 'pipFloat 2.4s ease-in-out infinite' :
    mood === 'attack'  ? 'pipLunge 0.45s ease-out forwards' :
    mood === 'hurt'    ? 'pipKnockback 0.45s ease-out forwards' :
    mood === 'victory' ? 'pipVictory 0.7s ease-in-out infinite' : '';

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'inline-block',
    animation,
    transformOrigin: 'center bottom',
  };

  // Eye expression per mood
  const eyeRy = mood === 'hurt' ? 2 : mood === 'attack' ? 4 : 5;
  const eyeY  = mood === 'hurt' ? 41 : 40;

  // Mouth path per mood
  const mouthPath =
    mood === 'victory' ? 'M 36 52 Q 50 64 64 52' :
    mood === 'attack'  ? 'M 38 50 Q 50 55 62 50' :
    mood === 'hurt'    ? 'M 38 54 Q 50 48 62 54' :
                         'M 39 51 Q 50 57 61 51';

  return (
    <div style={containerStyle} className={className}>
      <svg
        viewBox="0 0 100 110"
        width={size}
        height={Math.round(size * 1.1)}
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        {/* Aura glow (stage 5) */}
        {hasAura && (
          <circle cx="50" cy="35" r="28" fill={glowColor} opacity="0.25"
            style={{ filter: 'blur(6px)' }} />
        )}

        {/* Shadow */}
        <ellipse cx="50" cy="106" rx="20" ry="5" fill="#00000018" />

        {/* Body */}
        <ellipse cx="50" cy="80" rx="22" ry="26" fill={wingColor} />

        {/* Wings */}
        <ellipse cx="26" cy="72" rx="13" ry="7" fill={wingColor} opacity="0.8"
          transform={mood === 'attack' ? 'rotate(-25 26 72)' : mood === 'hurt' ? 'rotate(14 26 72)' : 'rotate(-5 26 72)'} />
        <ellipse cx="74" cy="72" rx="13" ry="7" fill={wingColor} opacity="0.8"
          transform={mood === 'attack' ? 'rotate(28 74 72)' : mood === 'hurt' ? 'rotate(-14 74 72)' : 'rotate(5 74 72)'} />

        {/* Feet */}
        <ellipse cx="40" cy="104" rx="10" ry="5" fill={wingColor} opacity="0.9" />
        <ellipse cx="60" cy="104" rx="10" ry="5" fill={wingColor} opacity="0.9" />

        {/* Victory arms */}
        {mood === 'victory' && (
          <>
            <ellipse cx="22" cy="60" rx="8" ry="14" fill={wingColor}
              transform="rotate(-40 22 60)" />
            <ellipse cx="78" cy="60" rx="8" ry="14" fill={wingColor}
              transform="rotate(40 78 60)" />
          </>
        )}

        {/* Head */}
        <circle cx="50" cy="36" r="24" fill={glowColor} />

        {/* Hat */}
        <ellipse cx="50" cy="13" rx="16" ry="5" fill="#8B5E3C" />
        <rect x="40" y="10" width="20" height="7" rx="3" fill="#A0522D" />

        {/* Crown (stage 3+) */}
        {hasCrown && (
          <g opacity={mood === 'hurt' ? 0.4 : 1}>
            <polygon points="34,10 37,2 41,10" fill="#FFD700" stroke="#FFA500" strokeWidth="0.8" />
            <polygon points="46,8 50,0 54,8"   fill="#FFE566" stroke="#FFA500" strokeWidth="0.8" />
            <polygon points="59,10 63,2 66,10"  fill="#FFD700" stroke="#FFA500" strokeWidth="0.8" />
            <rect x="32" y="8" width="36" height="5" rx="2" fill="#FFA500" />
          </g>
        )}

        {/* Eyebrows */}
        {mood === 'attack' ? (
          <>
            <line x1="34" y1="28" x2="44" y2="31" stroke="#2a3a1a" strokeWidth="2" strokeLinecap="round" />
            <line x1="56" y1="31" x2="66" y2="28" stroke="#2a3a1a" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : mood === 'hurt' ? (
          <>
            <line x1="34" y1="31" x2="44" y2="28" stroke="#2a3a1a" strokeWidth="2" strokeLinecap="round" />
            <line x1="56" y1="28" x2="66" y2="31" stroke="#2a3a1a" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="34" y1="30" x2="44" y2="30" stroke="#2a3a1a" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="56" y1="30" x2="66" y2="30" stroke="#2a3a1a" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}

        {/* Eyes */}
        <ellipse cx="40" cy={eyeY} rx="6" ry={eyeRy} fill="white" />
        <ellipse cx="60" cy={eyeY} rx="6" ry={eyeRy} fill="white" />
        {mood !== 'hurt' ? (
          <>
            <circle cx="41" cy={eyeY + 1} r="3.5" fill="#2a3a1a" />
            <circle cx="61" cy={eyeY + 1} r="3.5" fill="#2a3a1a" />
            <circle cx="42" cy={eyeY - 1} r="1.2" fill="white" />
            <circle cx="62" cy={eyeY - 1} r="1.2" fill="white" />
          </>
        ) : (
          <>
            <line x1="37" y1={eyeY - 2} x2="43" y2={eyeY + 2} stroke="#2a3a1a" strokeWidth="2" strokeLinecap="round" />
            <line x1="43" y1={eyeY - 2} x2="37" y2={eyeY + 2} stroke="#2a3a1a" strokeWidth="2" strokeLinecap="round" />
            <line x1="57" y1={eyeY - 2} x2="63" y2={eyeY + 2} stroke="#2a3a1a" strokeWidth="2" strokeLinecap="round" />
            <line x1="63" y1={eyeY - 2} x2="57" y2={eyeY + 2} stroke="#2a3a1a" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Nose */}
        <ellipse cx="50" cy="47" rx="4" ry="2.5" fill="#2a3a1a" opacity="0.5" />

        {/* Mouth */}
        <path d={mouthPath} fill="none" stroke="#2a3a1a" strokeWidth="2" strokeLinecap="round" />

        {/* Victory sparkles */}
        {mood === 'victory' && (
          <>
            <text x="72" y="24" fontSize="12">✨</text>
            <text x="12" y="28" fontSize="10">🌟</text>
          </>
        )}

        {/* Hurt stars */}
        {mood === 'hurt' && (
          <>
            <text x="70" y="22" fontSize="12">⚡</text>
            <text x="12" y="26" fontSize="10">💫</text>
          </>
        )}

        {/* Attack glow ring */}
        {mood === 'attack' && (
          <circle cx="50" cy="36" r="26" fill="none"
            stroke={glowColor} strokeWidth="3" opacity="0.7"
            style={{ animation: 'attackPulse 0.4s ease-out forwards' }} />
        )}
      </svg>

      <style>{`
        @keyframes pipFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes pipLunge {
          0%   { transform: translateX(0px)   scaleX(1)    rotate(0deg); }
          40%  { transform: translateX(28px)  scaleX(1.12) rotate(8deg); }
          70%  { transform: translateX(18px)  scaleX(1.05) rotate(4deg); }
          100% { transform: translateX(0px)   scaleX(1)    rotate(0deg); }
        }
        @keyframes pipKnockback {
          0%   { transform: translateX(0px)   rotate(0deg); }
          25%  { transform: translateX(-22px) rotate(-10deg); }
          55%  { transform: translateX(-8px)  rotate(-4deg); }
          75%  { transform: translateX(-14px) rotate(-7deg); }
          100% { transform: translateX(0px)   rotate(0deg); }
        }
        @keyframes pipVictory {
          0%   { transform: translateY(0px)   rotate(-4deg) scale(1);    }
          25%  { transform: translateY(-16px) rotate(4deg)  scale(1.08); }
          50%  { transform: translateY(0px)   rotate(-4deg) scale(1);    }
          75%  { transform: translateY(-10px) rotate(2deg)  scale(1.04); }
          100% { transform: translateY(0px)   rotate(-4deg) scale(1);    }
        }
        @keyframes attackPulse {
          0%   { opacity: 0.7; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PipBattleCharacter;
