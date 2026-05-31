import { useEffect, useRef, useState } from "react";

type TimeOfDay = "day" | "sunset" | "night";

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "sunset";
  return "night";
}

const SKY_GRADIENTS: Record<TimeOfDay, string> = {
  day:    "linear-gradient(180deg,#5bb8f5 0%,#a8ddf7 52%,#c8eea0 100%)",
  sunset: "linear-gradient(180deg,#e8724a 0%,#f5a56a 40%,#f5d58a 70%,#c8eea0 100%)",
  night:  "linear-gradient(180deg,#0d1b3e 0%,#1a2d6b 55%,#2a4a8a 80%,#3a6040 100%)",
};

function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`absolute pointer-events-none ${className ?? ""}`} style={style}>
      <div
        style={{
          position: "relative",
          width: 90,
          height: 30,
          background: "rgba(255,255,255,.85)",
          borderRadius: 50,
          boxShadow: "0 4px 14px rgba(255,255,255,.4)",
        }}
      >
        <div style={{ position: "absolute", top: -18, left: 14, width: 44, height: 44, background: "rgba(255,255,255,.85)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: -12, left: 42, width: 32, height: 32, background: "rgba(255,255,255,.85)", borderRadius: "50%" }} />
      </div>
    </div>
  );
}

const SUN_MESSAGES = [
  "So warm! ☀️", "Hello sunshine! 🌟", "What a bright day! ✨",
  "You're glowing! 💛", "Rise and shine! 🌤️", "Sunny hugs! 🤗",
];

function Sun({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const [burst, setBurst] = useState(false);
  const [msg, setMsg] = useState("");
  const msgIdx = useRef(0);
  const timerRef = useRef<number | null>(null);

  const isNight = timeOfDay === "night";
  const size = isNight ? 44 : 52;
  const top  = isNight ? 56 : 50;
  const bodyBg = isNight
    ? "#FFF9C4"
    : timeOfDay === "sunset"
    ? "radial-gradient(circle,#ffdd57,#ffaa00)"
    : "radial-gradient(circle,#FFE566,#FFD700)";
  const rayColor = isNight ? "#FFF9C4" : timeOfDay === "sunset" ? "#ffaa00" : "#FFD700";
  const ringColor = isNight ? "255,249,196" : timeOfDay === "sunset" ? "255,180,0" : "255,215,0";

  const handleClick = () => {
    if (burst) return;
    const m = SUN_MESSAGES[msgIdx.current % SUN_MESSAGES.length];
    msgIdx.current += 1;
    setMsg(m);
    setBurst(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setBurst(false), 950);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div
      className="absolute"
      style={{ top, left: 22, zIndex: 5, cursor: "pointer", userSelect: "none", pointerEvents: "auto" }}
      onClick={handleClick}
      role="button"
      aria-label="Click the sun!"
    >
      {/* Radiating rays burst */}
      {burst && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: size * 3.2, height: size * 3.2,
          pointerEvents: "none",
          animation: "sun-ray-burst .95s ease-out forwards",
        }}>
          <svg
            viewBox="-60 -60 120 120"
            style={{ width: "100%", height: "100%", overflow: "visible" }}
          >
            {RAY_ANGLES.map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={angle}
                  x1={Math.cos(rad) * 30} y1={Math.sin(rad) * 30}
                  x2={Math.cos(rad) * 56} y2={Math.sin(rad) * 56}
                  stroke={rayColor} strokeWidth="4"
                  strokeLinecap="round" opacity=".85"
                />
              );
            })}
          </svg>
        </div>
      )}

      {/* Tooltip message */}
      {burst && (
        <div style={{
          position: "absolute",
          top: -38, left: size + 8,
          background: "rgba(255,255,255,.96)",
          border: "2px solid #ffe082",
          borderRadius: "12px 12px 12px 4px",
          padding: "5px 12px",
          fontSize: 12,
          fontWeight: 800,
          color: "#7a4f00",
          whiteSpace: "nowrap",
          fontFamily: "'Nunito',sans-serif",
          boxShadow: "0 3px 10px rgba(0,0,0,.12)",
          animation: "pip-bubble-pop .25s ease-out",
          pointerEvents: "none",
          zIndex: 10,
        }}>
          {msg}
        </div>
      )}

      {/* Sun body */}
      <div style={{
        width: size, height: size,
        background: bodyBg,
        borderRadius: "50%",
        boxShadow: burst
          ? `0 0 0 18px rgba(${ringColor},.38), 0 0 0 36px rgba(${ringColor},.15)`
          : `0 0 0 12px rgba(${ringColor},.28), 0 0 0 26px rgba(${ringColor},.12)`,
        animation: burst ? "sun-pop .55s cubic-bezier(.34,1.56,.64,1) forwards" : "sun-pulse-ring 3s ease-in-out infinite",
        transition: "box-shadow .3s ease",
      }} />
    </div>
  );
}

function Butterfly() {
  return (
    <div className="absolute pointer-events-none animate-bfly" style={{ top: 80, left: "36%" }}>
      <svg width="32" height="26" viewBox="0 0 32 26">
        <ellipse cx="8" cy="10" rx="8" ry="5.5" fill="#FF9ECD" opacity=".85" />
        <ellipse cx="8" cy="18" rx="5.5" ry="3.5" fill="#FFB6D9" opacity=".75" />
        <ellipse cx="24" cy="10" rx="8" ry="5.5" fill="#FF9ECD" opacity=".85" />
        <ellipse cx="24" cy="18" rx="5.5" ry="3.5" fill="#FFB6D9" opacity=".75" />
        <line x1="16" y1="4" x2="16" y2="24" stroke="#9B6B8A" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function Stars() {
  const stars = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 55,
    size: 1.5 + Math.random() * 2,
    delay: Math.random() * 3,
    speed: 2 + Math.random() * 3,
  }));
  return (
    <>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute pointer-events-none rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.4 + Math.random() * 0.5,
            animation: `firefly-glow ${s.speed}s ease-in-out ${s.delay}s infinite alternate`,
          }}
        />
      ))}
    </>
  );
}

export default function DynamicSky({ children }: { children: React.ReactNode }) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay);

  useEffect(() => {
    const id = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: SKY_GRADIENTS[timeOfDay], transition: "background 2s ease-in-out" }}
    >
      {/* Sky layer — pointer-events enabled so Sun is clickable */}
      <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents:"none" }}>
        {timeOfDay === "night" ? <Stars /> : null}
        <Sun timeOfDay={timeOfDay} />

        {/* Animated clouds — only day/sunset */}
        {timeOfDay !== "night" && (
          <>
            <Cloud className="animate-cloud-drift-slow" style={{ top: 48, left: -90 }} />
            <Cloud className="animate-cloud-drift-med"  style={{ top: 84, left: -70, opacity: .75 }} />
            <Cloud className="animate-cloud-drift-fast" style={{ top: 32, left: -80 }} />
          </>
        )}
        <Butterfly />
      </div>

      {/* Page content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
