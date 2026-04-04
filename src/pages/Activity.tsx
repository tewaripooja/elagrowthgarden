import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft, Loader2, BookOpen, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Garden from "@/components/Garden";
import { useGameState, type ActivityMode } from "@/hooks/useGameState";
import { generateContent, type ActivityData, type ActivityType } from "@/lib/ai";
import Vocabulary from "@/components/activities/Vocabulary";
import CompareContrast from "@/components/activities/CompareContrast";
import FactOpinion from "@/components/activities/FactOpinion";
import Summaries from "@/components/activities/Summaries";
import CharacterTraits from "@/components/activities/CharacterTraits";
import { toast } from "sonner";

const TITLES: Record<string, { label: string; icon: React.ReactNode }> = {
  vocabulary: { label: "Vocabulary", icon: <BookOpen className="h-6 w-6" /> },
  "compare-contrast": { label: "Compare & Contrast", icon: <BookOpen className="h-6 w-6" /> },
  "fact-opinion": { label: "Fact vs Opinion", icon: <Pencil className="h-6 w-6" /> },
  summaries: { label: "Summaries", icon: <Pencil className="h-6 w-6" /> },
  "character-traits": { label: "Character Traits", icon: <BookOpen className="h-6 w-6" /> },
};

const STAGES_COUNT = 5;

export default function Activity() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const gameState = useGameState();
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [recentStar, setRecentStar] = useState(false);

  const activityType = mode as ActivityType;
  const titleInfo = TITLES[mode || ""] || { label: "Activity", icon: null };

  const progressPercent = (gameState.stageIndex / STAGES_COUNT) * 100;

  const loadContent = async () => {
    setLoading(true);
    setData(null);
    try {
      const result = await generateContent(activityType, gameState.level);
      setData(result);
      setRound((r) => r + 1);
    } catch (e) {
      toast.error("Couldn't load the story. Please try again!");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrect = (earnStar = false) => {
    gameState.handleCorrectAnswer(earnStar);
    if (earnStar) {
      setRecentStar(true);
      setTimeout(() => setRecentStar(false), 2000);
    }
  };

  return (
    <DynamicSky>
    <div className="min-h-screen p-4 md:p-6">
      {/* Top bar with progress */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="clay-button min-h-[48px] rounded-2xl font-heading"
          >
            <ArrowLeft className="h-5 w-5 mr-1" /> Home
          </Button>

          <div className="flex items-center gap-2">
            {titleInfo.icon}
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              {titleInfo.label}
            </h1>
          </div>

          <span className="ml-auto text-sm text-muted-foreground clay-card px-4 py-2">
            Grade {gameState.level}
          </span>

          {/* Star Badge */}
          <div className={`star-badge ${recentStar ? "glowing" : ""}`}>
            <Star className="h-6 w-6 text-primary-foreground fill-current" />
            <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {gameState.stars}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-right">
          🌱 Growing: {gameState.currentStage} · 🌸 Flowers: {gameState.flowers}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Left: Content area */}
        <div className="flex-1 lg:w-2/3">
          {!data && !loading && (
            <div className="clay-card flex flex-col items-center justify-center min-h-[300px] p-8">
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <p className="font-heading text-xl mb-4 text-foreground">Ready to read? 📖</p>
              <button
                onClick={loadContent}
                className="clay-button bg-primary text-primary-foreground px-10 py-4 text-lg"
              >
                Generate a Story! 🌟
              </button>
            </div>
          )}

          {loading && (
            <div className="clay-card flex flex-col items-center justify-center min-h-[300px] p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="font-heading text-lg text-muted-foreground">Writing your story... ✍️</p>
            </div>
          )}

          {data && !loading && (
            <div key={round}>
              {activityType === "vocabulary" && (
                <Vocabulary data={data as any} onCorrect={() => handleCorrect(true)} />
              )}
              {activityType === "compare-contrast" && (
                <CompareContrast data={data as any} onCorrect={() => handleCorrect()} />
              )}
              {activityType === "fact-opinion" && (
                <FactOpinion data={data as any} onCorrect={() => handleCorrect()} />
              )}
              {activityType === "summaries" && (
                <Summaries data={data as any} onCorrect={() => handleCorrect()} />
              )}
              {activityType === "character-traits" && (
                <CharacterTraits data={data as any} onCorrect={() => handleCorrect()} />
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={loadContent}
                  className="clay-button bg-card text-foreground border border-border px-8 py-3 font-heading"
                >
                  Next Story 📖
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Garden */}
        <div className="lg:w-1/3 min-w-[280px]">
          <Garden
            currentStage={gameState.currentStage}
            flowers={gameState.flowers}
            stars={gameState.stars}
          />
        </div>
      </div>
    </div>
    </DynamicSky>
  );
}
