import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
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

const TITLES: Record<string, string> = {
  vocabulary: "📚 Vocabulary",
  "compare-contrast": "🔄 Compare & Contrast",
  "fact-opinion": "🔍 Fact vs Opinion",
  summaries: "📝 Summaries",
  "character-traits": "🧑 Character Traits",
};

export default function Activity() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const gameState = useGameState();
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);

  const activityType = mode as ActivityType;

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
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="rounded-xl font-heading">
          <ArrowLeft className="h-4 w-4 mr-1" /> Home
        </Button>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          {TITLES[mode || ""] || "Activity"}
        </h1>
        <span className="ml-auto text-sm font-body text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Grade {gameState.level}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Left: Content area */}
        <div className="flex-1 lg:w-2/3">
          {!data && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-card rounded-2xl border border-border p-8">
              <p className="font-heading text-xl mb-4 text-foreground">Ready to read? 📖</p>
              <Button onClick={loadContent} size="lg" className="rounded-2xl font-heading text-lg px-8">
                Generate a Story! 🌟
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-card rounded-2xl border border-border p-8">
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
                <Button onClick={loadContent} variant="outline" className="rounded-xl font-heading">
                  Next Story 📖
                </Button>
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
  );
}
