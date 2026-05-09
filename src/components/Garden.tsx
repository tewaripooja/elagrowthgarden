import { PlantStage } from "@/hooks/useGameState";

interface GardenProps {
  currentStage: PlantStage;
  flowers: number;
}

const STAGE_SCALE: Record<PlantStage, number> = {
  seed: 0.38,
  sprout: 0.52,
  leaves: 0.68,
  bud: 0.84,
  flower: 1,
};

const FLOWER_HUES = [330, 280, 45, 200, 350, 25, 310, 160];
const FLOWERS_PER_TREE = 20;

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

export default function Garden({ currentStage, flowers }: GardenProps) {
  const totalFlowers = Math.max(0, flowers);
  const completedTrees = Math.floor(totalFlowers / FLOWERS_PER_TREE);
  const activeTreeNumber = completedTrees + 1;
  const flowersOnActiveTree = totalFlowers % FLOWERS_PER_TREE;
  const rolledToNextTree = totalFlowers >= FLOWERS_PER_TREE;

  const scale = STAGE_SCALE[currentStage];
  const cx = 120;
  const cy = 100;
  const spread = 28 + Math.min(flowersOnActiveTree, FLOWERS_PER_TREE) * 0.7;
  const positions = flowerPositions(flowersOnActiveTree, cx, cy, spread);

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-emerald-200/80 shadow-inner bg-gradient-to-b from-sky-200/90 via-sky-100/70 to-emerald-100/50">
      <div className="relative min-h-[260px] md:min-h-[300px] px-2 pb-3">
        <div className="absolute top-3 left-6 z-10 rounded-full border border-emerald-300/70 bg-white/70 px-3 py-1 text-xs font-heading text-emerald-900 shadow-sm">
          Tree {activeTreeNumber}
        </div>

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
            {/* Background birds (subtle sky life) */}
            <g opacity={0.5} fill="none" stroke="hsl(220 30% 35%)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M38 38q5-6 10 0" />
              <path d="M48 38q5-6 10 0" />
              <path d="M168 30q5-6 10 0" />
              <path d="M178 30q5-6 10 0" />
            </g>

            {/* Grass mound */}
            <ellipse cx="120" cy="248" rx="118" ry="22" fill="hsl(142 48% 38%)" opacity={0.9} />
            <ellipse cx="120" cy="245" rx="100" ry="16" fill="hsl(100 45% 48%)" opacity={0.85} />
            <ellipse cx="120" cy="242" rx="85" ry="12" fill="hsl(88 50% 55%)" />

            {/* Ground details for a more natural look */}
            <g opacity={0.8}>
              <ellipse cx="54" cy="246" rx="7" ry="2.5" fill="hsl(90 35% 35%)" />
              <ellipse cx="181" cy="247" rx="9" ry="3" fill="hsl(95 30% 36%)" />
              <ellipse cx="96" cy="250" rx="4.5" ry="1.8" fill="hsl(35 20% 48%)" />
              <ellipse cx="150" cy="251" rx="5" ry="2" fill="hsl(35 20% 45%)" />
            </g>

            {/* Trunk */}
            <rect x="112" y="138" width="16" height="112" rx="5" fill="hsl(28 42% 30%)" />
            <rect x="114" y="140" width="5" height="108" rx="2" fill="hsl(28 32% 40%)" opacity={0.45} />

            {/* Tiny squirrel silhouette on trunk */}
            <g transform="translate(130 196)" opacity={0.95}>
              <ellipse cx="0" cy="0" rx="5" ry="4" fill="hsl(26 45% 24%)" />
              <circle cx="-5.5" cy="-1.5" r="2.2" fill="hsl(26 45% 24%)" />
              <circle cx="-6.2" cy="-2.2" r="0.4" fill="hsl(0 0% 97%)" />
              <path d="M4 -3q4 -3 3 -8q-5 0 -7 4q1 2 4 4Z" fill="hsl(26 45% 24%)" />
            </g>

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
            {totalFlowers === 0 ? (
              <>
                Your tree is ready — earn <span className="text-fuchsia-700">flowers</span> by completing activities!
              </>
            ) : (
              <>
                <span className="text-fuchsia-700 font-bold">{flowersOnActiveTree}</span> flower
                {flowersOnActiveTree !== 1 ? "s" : ""} blooming on Tree {activeTreeNumber}
                {rolledToNextTree && (
                  <span className="text-violet-800/80">
                    {" "}
                    — Great job! You completed Tree {completedTrees} and are now growing Tree {activeTreeNumber}.
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
