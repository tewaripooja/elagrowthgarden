import { useEffect, useState, useRef, useCallback } from "react";

type TimeOfDay = "day" | "sunset" | "night";

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "sunset";
  return "night";
}

const SKY_COLORS: Record<TimeOfDay, string> = {
  day: "linear-gradient(180deg, #C9A0DC 0%, #E8D0F0 50%, #F5E6FA 100%)",
  sunset: "linear-gradient(180deg, #D4648A 0%, #E8A0B8 40%, #F5D0E0 100%)",
  night: "linear-gradient(180deg, #2A1040 0%, #3D1A5C 50%, #552080 100%)",
};

interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  speed: number;
}

function Fireflies() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1, y: -1 });
  const [fireflies] = useState<Firefly[]>(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 3,
      speed: 2 + Math.random() * 3,
    }))
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-auto"
      onPointerMove={handlePointerMove}
    >
      {fireflies.map((f) => {
        const attractX = mousePos.x >= 0 ? (mousePos.x - f.x) * 0.15 : 0;
        const attractY = mousePos.y >= 0 ? (mousePos.y - f.y) * 0.15 : 0;
        return (
          <div
            key={f.id}
            className="absolute rounded-full"
            style={{
              left: `${f.x + attractX}%`,
              top: `${f.y + attractY}%`,
              width: f.size,
              height: f.size,
              background: "radial-gradient(circle, hsla(55, 100%, 75%, 0.95), hsla(55, 100%, 60%, 0))",
              boxShadow: `0 0 ${f.size * 3}px ${f.size}px hsla(55, 100%, 70%, 0.5)`,
              animation: `firefly-glow ${f.speed}s ease-in-out ${f.delay}s infinite alternate`,
              transition: "left 1.5s ease-out, top 1.5s ease-out",
            }}
          />
        );
      })}
      {/* Stars for night */}
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            width: 2,
            height: 2,
            opacity: 0.3 + Math.random() * 0.5,
            animation: `firefly-glow ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

export default function DynamicSky({ children }: { children: React.ReactNode }) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen" style={{ transition: "background 2s ease-in-out", background: SKY_COLORS[timeOfDay] }}>
      {/* Sky elements */}
      <div className="absolute inset-0 pointer-events-none" style={{ transition: "opacity 2s ease-in-out" }}>
        {timeOfDay === "night" && <Fireflies />}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
