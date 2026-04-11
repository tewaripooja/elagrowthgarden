import { PlantStage } from "@/hooks/useGameState";

interface GardenProps {
  currentStage: PlantStage;
  flowers: number;
  stars: number;
}

function PlantSVG({ stage }: { stage: PlantStage }) {
  return (
    <div className="flex flex-col items-center justify-end h-48 relative">
      {stage === "flower" && (
        <div className="animate-bloom mb-[-4px]">
          <svg width="60" height="60" viewBox="0 0 60 60">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse key={angle} cx="30" cy="30" rx="12" ry="20" fill="hsl(330, 60%, 65%)" transform={`rotate(${angle}, 30, 30)`} opacity="0.85" />
            ))}
            <circle cx="30" cy="30" r="8" fill="hsl(45, 95%, 60%)" />
          </svg>
        </div>
      )}
      {stage === "bud" && (
        <div className="animate-bounce-in mb-[-4px]">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <ellipse cx="20" cy="25" rx="10" ry="14" fill="hsl(142, 50%, 50%)" />
            <ellipse cx="14" cy="22" rx="8" ry="12" fill="hsl(142, 45%, 55%)" transform="rotate(-15, 14, 22)" />
            <ellipse cx="26" cy="22" rx="8" ry="12" fill="hsl(142, 45%, 55%)" transform="rotate(15, 26, 22)" />
          </svg>
        </div>
      )}
      {(stage === "leaves" || stage === "bud" || stage === "flower") && (
        <div className={`animate-sway ${stage === "leaves" ? "" : "mt-[-8px]"}`}>
          <svg width="70" height="40" viewBox="0 0 70 40">
            <path d="M35 35 Q15 20 10 10 Q25 15 35 30" fill="hsl(142, 55%, 45%)" />
            <path d="M35 35 Q55 20 60 10 Q45 15 35 30" fill="hsl(142, 50%, 50%)" />
          </svg>
        </div>
      )}
      {stage !== "seed" && (
        <div className="animate-grow-up">
          <svg width="10" height={stage === "sprout" ? "30" : "50"} viewBox={`0 0 10 ${stage === "sprout" ? 30 : 50}`}>
            <rect x="3" y="0" width="4" height={stage === "sprout" ? 30 : 50} rx="2" fill="hsl(142, 40%, 40%)" />
          </svg>
        </div>
      )}
      {stage === "sprout" && (
        <div className="animate-sway mt-[-12px]">
          <svg width="30" height="20" viewBox="0 0 30 20">
            <path d="M15 18 Q5 10 8 2 Q12 8 15 15" fill="hsl(142, 55%, 50%)" />
            <path d="M15 18 Q25 10 22 2 Q18 8 15 15" fill="hsl(142, 50%, 55%)" />
          </svg>
        </div>
      )}
      {stage === "seed" && (
        <div className="animate-bounce-in">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <ellipse cx="12" cy="14" rx="8" ry="6" fill="hsl(30, 50%, 45%)" />
            <ellipse cx="12" cy="12" rx="6" ry="4" fill="hsl(30, 45%, 55%)" />
          </svg>
        </div>
      )}
    </div>
  );
}

function CompletedFlower({ index }: { index: number }) {
  const hues = [330, 270, 200, 25, 45, 350];
  const hue = hues[index % hues.length];
  return (
    <div className="animate-bloom" style={{ animationDelay: `${index * 0.1}s` }}>
      <svg width="36" height="50" viewBox="0 0 36 50">
        <rect x="16" y="25" width="4" height="25" rx="2" fill="hsl(142, 40%, 40%)" />
        <path d="M18 30 Q8 25 6 18 Q12 22 18 28" fill="hsl(142, 50%, 50%)" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="18" cy="15" rx="6" ry="10" fill={`hsl(${hue}, 60%, 65%)`} transform={`rotate(${angle}, 18, 15)`} opacity="0.8" />
        ))}
        <circle cx="18" cy="15" r="5" fill="hsl(45, 90%, 60%)" />
      </svg>
    </div>
  );
}

function StarDisplay({ count }: { count: number }) {
  const starStyles = ["⭐", "🌟", "✨", "💫", "⭐"];
  return (
    <div className="flex flex-wrap gap-1 justify-center mb-2">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-lg animate-star-pop" style={{ animationDelay: `${i * 0.05}s` }}>
          {starStyles[i % starStyles.length]}
        </span>
      ))}
    </div>
  );
}

export default function Garden({ currentStage, flowers, stars }: GardenProps) {
  return (
    <div className="clay-card p-5 h-full flex flex-col">
      <h2 className="font-heading text-xl text-center mb-2 text-foreground">🌱 My Garden</h2>

      {stars > 0 && <StarDisplay count={stars} />}

      <div className="flex-1 flex flex-col items-center justify-end mb-4">
        <PlantSVG stage={currentStage} />
        <div className="w-32 h-6 bg-garden-dirt rounded-t-full mt-[-2px]" />
        <p className="text-sm text-muted-foreground mt-2 capitalize">{currentStage}</p>
      </div>

      {flowers > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground text-center mb-2">Bloomed: {flowers} 🌸</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {Array.from({ length: Math.min(flowers, 12) }).map((_, i) => (
              <CompletedFlower key={i} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
