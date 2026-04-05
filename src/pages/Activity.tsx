import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft, Loader2, BookOpen, Pencil, Star, Trophy } from "lucide-react";
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

// How many questions each activity type has
function getQuestionCount(activityType: string, data: ActivityData): number {
  if (!data) return 1;
  if (activityType === "vocabulary") return (data as any).words?.length || 5;
  if (activityType === "compare-contrast") return 1;
  if (activityType === "fact-opinion") return (data as any).statements?.length || 5;
  if (activityType === "summaries") return 1;
  if (activityType === "character-traits") return (data as any).questions?.length || 3;
  return 1;
}

export default function Activity() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const gameState = useGameState();
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [recentStar, setRecentStar] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [storyCompleted, setStoryCompleted] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  const activityType = mode as ActivityType;
  const titleInfo = TITLES[mode || ""] || { label: "Activity", icon: null };
  const activityProgress = gameState.getActivityLevel(activityType);

  const progressPercent = (gameState.stageIndex / STAGES_COUNT) * 100;

  const loadContent = async () => {
    setLoading(true);
    setData(null);
    setCorrectCount(0);
    setStoryCompleted(false);
    setLevelUpMessage(null);
    try {
      const result = await generateContent(activityType, activityProgress.level);
      setData(result);
      setRound((r) => r + 1);
    } catch (e) {
      toast.error("Couldn't load the story. Please try again!");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCorrect = useCallback((earnStar = false) => {
    gameState.handleCorrectAnswer(earnStar);
    setCorrectCount((c) => c + 1);
    if (earnStar) {
      setRecentStar(true);
      setTimeout(() => setRecentStar(false), 2000);
    }
  }, [gameState]);

  const handleCompleteStory = useCallback(() => {
    if (storyCompleted || !data) return;
    setStoryCompleted(true);
    const totalQ = getQuestionCount(activityType, data);
    const prevLevel = activityProgress.level;
    gameState.completeStory(activityType, totalQ, correctCount);
    
    // Check if level changed (will show on next render since state updates async)
    setTimeout(() => {
      const savedState = localStorage.getItem("ela-garden-state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        const newActivityLevel = parsed.activityLevels?.[activityType]?.level || prevLevel;
        if (newActivityLevel > prevLevel) {
          setLevelUpMessage(`🎉 Amazing! ${titleInfo.label} leveled up to Grade ${newActivityLevel}!`);
          toast.success(`🎉 Level Up! ${titleInfo.label} is now Grade ${newActivityLevel}!`);
        }
      }
    }, 100);
  }, [storyCompleted, data, activityType, correctCount, gameState]);

  return (
    <DynamicSky>
    <div className="min-h-screen p-4 md:p-6">
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
            Grade {activityProgress.level}
          </span>

          <div className={`star-badge ${recentStar ? "glowing" : ""}`}>
            <Star className="h-6 w-6 text-primary-foreground fill-current" />
            <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {gameState.stars}
            </span>
          </div>
        </div>

        {/* Level-up progress indicator */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">Perfect stories: {activityProgress.perfectStreak}/5 to next level</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i < activityProgress.perfectStreak ? "bg-garden-success" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-right">
          🌱 Growing: {gameState.currentStage} · 🌸 Flowers: {gameState.flowers}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        <div className="flex-1 lg:w-2/3">
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

              {levelUpMessage && (
                <div className="clay-card bg-garden-success/20 border-2 border-garden-success p-4 mt-4 text-center">
                  <Trophy className="h-8 w-8 text-garden-success mx-auto mb-2" />
                  <p className="font-heading text-lg text-foreground">{levelUpMessage}</p>
                </div>
              )}

              <div className="mt-6 flex justify-center gap-4">
                {!storyCompleted && (
                  <button
                    onClick={handleCompleteStory}
                    className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading"
                  >
                    Submit Story ✅
                  </button>
                )}
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
