// src/components/game/FrostbiteCharacter.tsx

import React from 'react';

export type FrostbiteMood = 'idle' | 'taunt' | 'hurt' | 'defeated' | 'sleeping';

interface Props {
  mood?: FrostbiteMood;
  size?: number;
  showFrostBreath?: boolean;
  className?: string;
}

export const FrostbiteCharacter: React.FC<Props> = ({
  mood = 'idle',
  size = 120,
  showFrostBreath = false,
  className = '',
}) => {
  // Pure CSS animation per mood — no JS timers needed
  const animation: string =
    mood === 'idle'     ? 'frostFloat 3.2s ease-in-out infinite' :
    mood === 'taunt'    ? 'frostTaunt 0.55s ease-in-out infinite' :
    mood === 'hurt'     ? 'frostHurt 0.5s ease-out forwards' :
    mood === 'defeated' ? 'frostDefeated 0.6s ease-out forwards' :
    mood === 'sleeping' ? 'frostFloat 4s ease-in-out infinite' : '';

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'inline-block',
    animation,
    transformOrigin: 'center bottom',
    filter: mood === 'defeated' ? 'grayscale(0.5) brightness(0.85)' : 'none',
    transition: 'filter 0.4s',
  };

  // Eye shapes by mood
  const eyes = () => {
    switch (mood) {
      case 'hurt':     return { scaleY: 0.35, cy: 52 };
      case 'defeated': return { scaleY: 0.25, cy: 54 };
      case 'taunt':    return { scaleY: 1.25, cy: 50 };
      default:         return { scaleY: 1,    cy: 52 };
    }
  };

  const mouthPath = () => {
    switch (mood) {
      case 'hurt':     return 'M 52 74 Q 64 68 76 74';
      case 'defeated': return 'M 50 76 Q 64 70 78 76';
      case 'taunt':    return 'M 52 72 Q 64 80 76 72';
      default:         return 'M 54 73 Q 64 78 74 73';
    }
  };

  const e = eyes();

  return (
    <div style={containerStyle} className={className}>
      <svg
        viewBox="0 0 128 160"
        width={size}
        height={size * 1.25}
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        {/* Shadow */}
        <ellipse cx="64" cy="154" rx="28" ry="6" fill="#00000018" />

        {/* Body */}
        <ellipse cx="64" cy="110" rx="36" ry="38"
          fill={mood === 'defeated' ? '#b0cfe0' : '#7EC8E3'} />

        {/* Left arm */}
        <ellipse cx="26" cy="108" rx="12" ry="20" fill="#7EC8E3"
          transform={mood === 'hurt' ? 'rotate(30 26 108)' : mood === 'taunt' ? 'rotate(18 26 108)' : 'rotate(10 26 108)'} />
        {/* Right arm */}
        <ellipse cx="102" cy="108" rx="12" ry="20" fill="#7EC8E3"
          transform={mood === 'taunt' ? 'rotate(-34 102 108)' : mood === 'hurt' ? 'rotate(-14 102 108)' : 'rotate(-10 102 108)'} />

        {/* Belly ice patch */}
        <ellipse cx="64" cy="118" rx="18" ry="14" fill="#c8eef8" opacity="0.6" />

        {/* Feet */}
        <ellipse cx="46" cy="146" rx="14" ry="8" fill="#5aaec0" />
        <ellipse cx="82" cy="146" rx="14" ry="8" fill="#5aaec0" />

        {/* Head */}
        <circle cx="64" cy="55" r="38"
          fill={mood === 'defeated' ? '#b0cfe0' : '#7EC8E3'} />

        {/* Ice crown */}
        <g opacity={mood === 'defeated' ? '0.3' : '1'}>
          <polygon points="36,22 40,8 46,22"  fill="#c8eef8" stroke="#a0d8ef" strokeWidth="1" />
          <polygon points="50,18 55,2 60,18"  fill="#ddf3fc" stroke="#a0d8ef" strokeWidth="1" />
          <polygon points="64,16 70,0 76,16"  fill="#c8eef8" stroke="#a0d8ef" strokeWidth="1" />
          <polygon points="78,18 83,2 88,18"  fill="#ddf3fc" stroke="#a0d8ef" strokeWidth="1" />
          <polygon points="88,22 94,8 98,22"  fill="#c8eef8" stroke="#a0d8ef" strokeWidth="1" />
          <rect x="34" y="20" width="60" height="8" rx="3"
            fill="#a0d8ef" stroke="#7EC8E3" strokeWidth="1" />
        </g>

        {/* Eyebrows */}
        {mood === 'defeated' ? (
          <>
            <line x1="42" y1="38" x2="54" y2="42" stroke="#4a8fa0" strokeWidth="3" strokeLinecap="round" />
            <line x1="74" y1="42" x2="86" y2="38" stroke="#4a8fa0" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="42" y1="40" x2="54" y2="36" stroke="#4a8fa0" strokeWidth="3" strokeLinecap="round" />
            <line x1="74" y1="36" x2="86" y2="40" stroke="#4a8fa0" strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* Eyes */}
        <ellipse cx="50" cy={e.cy} rx="8" ry={8 * e.scaleY} fill="white" />
        <ellipse cx="78" cy={e.cy} rx="8" ry={8 * e.scaleY} fill="white" />
        {mood !== 'defeated' && (
          <>
            <circle cx="52" cy={e.cy + 1} r="4" fill="#1a3a4a" />
            <circle cx="80" cy={e.cy + 1} r="4" fill="#1a3a4a" />
            <circle cx="53" cy={e.cy - 1} r="1.5" fill="white" />
            <circle cx="81" cy={e.cy - 1} r="1.5" fill="white" />
          </>
        )}

        {/* Dizzy X eyes when defeated */}
        {mood === 'defeated' && (
          <>
            <text x="46" y="56" fontSize="10" textAnchor="middle">✦</text>
            <text x="74" y="56" fontSize="10" textAnchor="middle">✦</text>
          </>
        )}

        {/* Nose */}
        <ellipse cx="64" cy="64" rx="6" ry="4" fill="#5aaec0" />

        {/* Mouth */}
        <path d={mouthPath()} fill="none" stroke="#1a3a4a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Teeth (idle/taunt) */}
        {(mood === 'idle' || mood === 'taunt') && (
          <>
            <rect x="56" y="73" width="6" height="7" rx="2" fill="white" opacity="0.9" />
            <rect x="64" y="73" width="6" height="7" rx="2" fill="white" opacity="0.9" />
          </>
        )}

        {/* Ice crack details */}
        <path d="M 50 100 L 55 112 L 48 120" fill="none" stroke="#a0d8ef" strokeWidth="1.5" opacity="0.6" />
        <path d="M 74 95 L 78 108 L 72 118"  fill="none" stroke="#a0d8ef" strokeWidth="1.5" opacity="0.6" />

        {/* Frost breath */}
        {showFrostBreath && (
          <g opacity="0.7">
            <ellipse cx="64" cy="92" rx="10" ry="5" fill="#ddf3fc"
              style={{ animation: 'frostPuff 1.5s ease-in-out infinite' }} />
            <ellipse cx="58" cy="86" rx="7" ry="4" fill="#c8eef8"
              style={{ animation: 'frostPuff 1.5s ease-in-out infinite 0.3s' }} />
            <ellipse cx="68" cy="80" rx="5" ry="3" fill="#eef9fd"
              style={{ animation: 'frostPuff 1.5s ease-in-out infinite 0.6s' }} />
          </g>
        )}

        {/* Hurt impact sparks */}
        {mood === 'hurt' && (
          <>
            <text x="96" y="38" fontSize="18" style={{ animation: 'sparkPop 0.4s ease-out forwards' }}>⚡</text>
            <text x="18" y="42" fontSize="14" style={{ animation: 'sparkPop 0.4s ease-out forwards 0.05s' }}>💫</text>
            <text x="88" y="20" fontSize="13" style={{ animation: 'sparkPop 0.4s ease-out forwards 0.1s' }}>✨</text>
          </>
        )}

        {/* ZZZ sleeping */}
        {mood === 'sleeping' && (
          <>
            <text x="88" y="35" fontSize="12" fill="#7EC8E3" fontWeight="bold">z</text>
            <text x="96" y="24" fontSize="16" fill="#7EC8E3" fontWeight="bold">Z</text>
            <text x="106" y="14" fontSize="20" fill="#7EC8E3" fontWeight="bold">Z</text>
          </>
        )}
      </svg>

      <style>{`
        @keyframes frostFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes frostTaunt {
          0%   { transform: translateX(0px)   rotate(0deg)  scale(1); }
          20%  { transform: translateX(-10px) rotate(-5deg) scale(1.06); }
          50%  { transform: translateX(8px)   rotate(4deg)  scale(1.04); }
          80%  { transform: translateX(-6px)  rotate(-3deg) scale(1.02); }
          100% { transform: translateX(0px)   rotate(0deg)  scale(1); }
        }
        @keyframes frostHurt {
          0%   { transform: translateX(0px)  rotate(0deg); }
          15%  { transform: translateX(18px) rotate(8deg); }
          35%  { transform: translateX(-12px) rotate(-6deg); }
          55%  { transform: translateX(8px)  rotate(4deg); }
          75%  { transform: translateX(-5px) rotate(-2deg); }
          100% { transform: translateX(0px)  rotate(0deg); }
        }
        @keyframes frostDefeated {
          0%   { transform: translateY(0px)  rotate(0deg)  scale(1); }
          40%  { transform: translateY(8px)  rotate(12deg) scale(0.92); }
          100% { transform: translateY(12px) rotate(15deg) scale(0.88); }
        }
        @keyframes frostPuff {
          0%, 100% { opacity: 0.4; transform: translateY(0) scale(1); }
          50%       { opacity: 0.85; transform: translateY(-5px) scale(1.15); }
        }
        @keyframes sparkPop {
          0%   { transform: scale(0.5) translateY(0);   opacity: 1; }
          60%  { transform: scale(1.4) translateY(-6px); opacity: 1; }
          100% { transform: scale(0.8) translateY(-12px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FrostbiteCharacter;
