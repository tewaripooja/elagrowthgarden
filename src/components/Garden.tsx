import { PlantStage } from "@/hooks/useGameState";

interface GardenProps {
  currentStage: PlantStage;
  flowers: number;
  stars: number;
}

const STAGE_SCALE: Record<PlantStage, number> = {
  seed: 0.38,
  sprout: 0.52,
  leaves: 0.68,
  bud: 0.84,
  flower: 1,
};

const FLOWER_HUES = [330, 280, 45, 200, 350, 25, 310, 160];

/** Mini blossom for the tree canopy — one per flower earned (capped for perf). */
function TreeFlowerBlossom({ hue, delay }: { hue: number; delay: number }) {
  return (
    <g className="animate-bloom" style={{ animationDelay: `${delay}s` }}>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy="0"
          rx="5"
          ry="8"
          fill={`hsl(${hue} 70% 62%)`}
          transform={`rotate(${angle} 0 0)`}
          opacity={0.9}
        />
      ))}
      <circle cx="0" cy="0" r="4" fill={`hsl(${hue} 90% 45%)`} />
    </g>
  );
}

function flowerPositions(count: number, cx: number, cy: number, baseR: number): { x: number; y: number }[] {
  const maxShow = Math.min(count, 48);
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < maxShow; i++) {
    const angle = (i * 137.508 * Math.PI) / 180;
    const r = baseR + (i % 4) * 3 + (i % 7) * 0.5;
    out.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle) * 0.78,
    });
  }
  return out;
}

function StarDisplay({ count }: { count: number }) {
  const starStyles = ["⭐", "🌟", "✨", "💫", "⭐"];
  const n = Math.min(count, 20);
  return (
    <div className="flex flex-wrap gap-1 justify-center px-2 pb-1">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="text-base animate-star-pop" style={{ animationDelay: `${i * 0.04}s` }}>
          {starStyles[i % starStyles.length]}
        </span>
      ))}
      {count > 20 && <span className="text-xs text-violet-800/80 self-center font-medium">+{count - 20}</span>}
    </div>
  );
}

export default function Garden({ currentStage, flowers, stars }: GardenProps) {
  const scale = STAGE_SCALE[currentStage];
  const cx = 120;
  const cy = 100;
  const spread = 28 + Math.min(flowers, 24) * 0.4;
  const positions = flowerPositions(flowers, cx, cy, spread);

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-emerald-200/80 shadow-inner bg-gradient-to-b from-sky-200/90 via-sky-100/70 to-emerald-100/50">
      {stars > 0 && (
        <div className="pt-3 pb-1 border-b border-white/40 bg-white/20">
          <p className="text-center text-xs font-heading text-violet-900/70 mb-1">Stars earned</p>
          <StarDisplay count={stars} />
        </div>
      )}

      <div className="relative min-h-[260px] md:min-h-[300px] px-2 pb-3">
        {/* Sky accents */}
        <div className="pointer-events-none absolute top-3 left-6 w-14 h-8 rounded-full bg-white/70 blur-[1px]" aria-hidden />
        <div className="pointer-events-none absolute top-8 right-10 w-20 h-10 rounded-full bg-white/60 blur-[1px]" aria-hidden />
        <div
          className="pointer-events-none absolute top-4 right-16 w-8 h-8 rounded-full bg-amber-200/90 shadow-[0_0_20px_rgba(253,224,71,0.7)]"
          aria-hidden
        />

        {/* Tree + garden ground */}
        <div className="flex flex-col items-center justify-end h-full min-h-[240px] pt-4">
          <svg
            viewBox="0 0 240 260"
            className="w-full max-w-[min(100%,380px)] h-auto drop-shadow-[0_8px_16px_rgba(22,101,52,0.25)]"
            style={{ transform: `scale(${scale})`, transformOrigin: "bottom center" }}
            aria-label={`Garden tree, growth stage ${currentStage}`}
          >
            <title>Your garden tree</title>
            {/* Grass mound */}
            <ellipse cx="120" cy="248" rx="118" ry="22" fill="hsl(142 48% 38%)" opacity={0.9} />
            <ellipse cx="120" cy="245" rx="100" ry="16" fill="hsl(100 45% 48%)" opacity={0.85} />
            <ellipse cx="120" cy="242" rx="85" ry="12" fill="hsl(88 50% 55%)" />

            {/* Trunk */}
            <rect x="112" y="138" width="16" height="112" rx="5" fill="hsl(28 42% 30%)" />
            <rect x="114" y="140" width="5" height="108" rx="2" fill="hsl(28 32% 40%)" opacity={0.45} />

            {/* Foliage + earned flowers (sway together) */}
            <g className="animate-sway" style={{ transformOrigin: "120px 150px" }}>
              <circle cx="120" cy="105" r="48" fill="hsl(142 52% 38%)" />
              <circle cx="88" cy="118" r="38" fill="hsl(145 48% 42%)" />
              <circle cx="152" cy="118" r="38" fill="hsl(140 50% 40%)" />
              <circle cx="120" cy="78" r="36" fill="hsl(138 55% 36%)" />
              <ellipse cx="120" cy="108" rx="42" ry="32" fill="hsl(142 45% 44%)" opacity={0.6} />
              {positions.map((pos, i) => (
                <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
                  <TreeFlowerBlossom hue={FLOWER_HUES[i % FLOWER_HUES.length]} delay={i * 0.03} />
                </g>
              ))}
            </g>

            {/* Stage hint: tiny sprout when seed */}
            {currentStage === "seed" && (
              <ellipse cx="120" cy="238" rx="6" ry="4" fill="hsl(30 50% 35%)" opacity={0.8} />
            )}
          </svg>

          <p className="text-center text-sm font-heading text-emerald-950/90 mt-1 px-2">
            {flowers === 0 ? (
              <>
                Your tree is ready — earn <span className="text-fuchsia-700">flowers</span> by completing activities!
              </>
            ) : (
              <>
                <span className="text-fuchsia-700 font-bold">{flowers}</span> flower{flowers !== 1 ? "s" : ""} blooming
                on your tree
                {flowers > 48 && (
                  <span className="text-violet-800/80"> (showing 48 of {flowers})</span>
                )}
              </>
            )}
          </p>
          <p className="text-xs text-violet-900/60 capitalize mt-0.5">Growth: {currentStage}</p>
        </div>
      </div>
    </div>
  );
}
