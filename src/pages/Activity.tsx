import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft, Loader2, BookOpen, Pencil, Star, Trophy, Users, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGameState, type ActivityMode } from "@/hooks/useGameState";
import { generateCombinedStory, type CombinedStoryData, type ActivityType } from "@/lib/ai";
import Vocabulary from "@/components/activities/Vocabulary";
import CompareContrast from "@/components/activities/CompareContrast";
import FactOpinion from "@/components/activities/FactOpinion";
import Summaries from "@/components/activities/Summaries";
import CharacterTraits from "@/components/activities/CharacterTraits";
import { toast } from "sonner";

const ACTIVITY_TABS: { id: ActivityType; label: string; icon: React.ReactNode }[] = [
  { id: "vocabulary", label: "Vocabulary", icon: <BookOpen className="h-4 w-4" /> },
  { id: "fact-opinion", label: "Fact vs Opinion", icon: <Scale className="h-4 w-4" /> },
  { id: "summaries", label: "Summaries", icon: <FileText className="h-4 w-4" /> },
  { id: "character-traits", label: "Characters", icon: <Users className="h-4 w-4" /> },
  { id: "compare-contrast", label: "Compare", icon: <Pencil className="h-4 w-4" /> },
];

const STAGES_COUNT = 5;

function getQuestionCount(activityType: ActivityType, data: CombinedStoryData): number {
  if (activityType === "vocabulary") return data.vocabulary?.words?.length || 5;
  if (activityType === "compare-contrast") return 1;
  if (activityType === "fact-opinion") return data.factOpinion?.statements?.length || 5;
  if (activityType === "summaries") return 1;
  if (activityType === "character-traits") return data.characterTraits?.questions?.length || 3;
  return 1;
}

export default function Activity() {
  const navigate = useNavigate();
  const gameState = useGameState();
  const [data, setData] = useState<CombinedStoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [recentStar, setRecentStar] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityType>("vocabulary");

  // Track correct counts and completion per activity type per round
  const [correctCounts, setCorrectCounts] = useState<Record<string, number>>({});
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});
  const [levelUpMessages, setLevelUpMessages] = useState<Record<string, string>>({});

  const progressPercent = (gameState.stageIndex / STAGES_COUNT) * 100;

  // Use the minimum grade across activities for generating content
  const minGrade = Math.min(
    ...ACTIVITY_TABS.map((t) => gameState.getActivityLevel(t.id).level)
  );

  const loadContent = async () => {
    setLoading(true);
    setData(null);
    setCorrectCounts({});
    setCompletedActivities({});
    setLevelUpMessages({});
    setActiveTab("vocabulary");
    try {
      const result = await generateCombinedStory(minGrade);
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

  const handleCorrect = useCallback((activityType: ActivityType, earnStar = false) => {
    gameState.handleCorrectAnswer(earnStar);
    setCorrectCounts((prev) => ({ ...prev, [activityType]: (prev[activityType] || 0) + 1 }));
    if (earnStar) {
      setRecentStar(true);
      setTimeout(() => setRecentStar(false), 2000);
    }
  }, [gameState]);

  const handleCompleteActivity = useCallback((activityType: ActivityType) => {
    if (completedActivities[activityType] || !data) return;
    setCompletedActivities((prev) => ({ ...prev, [activityType]: true }));

    const totalQ = getQuestionCount(activityType, data);
    const correct = correctCounts[activityType] || 0;
    const prevLevel = gameState.getActivityLevel(activityType).level;
    gameState.completeStory(activityType, totalQ, correct);

    setTimeout(() => {
      const savedState = localStorage.getItem("ela-garden-state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        const newLevel = parsed.activityLevels?.[activityType]?.level || prevLevel;
        if (newLevel > prevLevel) {
          const label = ACTIVITY_TABS.find((t) => t.id === activityType)?.label || activityType;
          setLevelUpMessages((prev) => ({
            ...prev,
            [activityType]: `🎉 Amazing! ${label} leveled up to Grade ${newLevel}!`,
          }));
          toast.success(`🎉 Level Up! ${label} is now Grade ${newLevel}!`);
        }
      }
    }, 100);
  }, [completedActivities, data, correctCounts, gameState]);

  const highlightWords = (story: string, words: { word: string }[]) => {
    let result = story;
    words?.forEach(({ word }) => {
      const regex = new RegExp(`\\b(${word})\\b`, "gi");
      result = result.replace(regex, `<strong class="text-accent font-bold">$1</strong>`);
    });
    return result;
  };

  return (
    <DynamicSky>
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto mb-4 bg-card/90 backdrop-blur-sm rounded-2xl p-4 border border-border/40 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="clay-button min-h-[48px] rounded-2xl font-heading"
            >
              <ArrowLeft className="h-5 w-5 mr-1" /> Home
            </Button>

            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Story Time
              </h1>
            </div>

            <div className={`ml-auto star-badge ${recentStar ? "glowing" : ""}`}>
              <Star className="h-6 w-6 text-primary-foreground fill-current" />
              <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {gameState.stars}
              </span>
            </div>
          </div>

          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            🌱 Growing: {gameState.currentStage} · 🌸 Flowers: {gameState.flowers}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
            {loading && (
              <div className="clay-card flex flex-col items-center justify-center min-h-[300px] p-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="font-heading text-lg text-muted-foreground">Writing your story... ✍️</p>
              </div>
            )}

            {data && !loading && (
              <div key={round}>
                {/* Story Section - Always Visible */}
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">
                        {data.title}
                      </h2>
                      <span className="inline-block mt-1 px-3 py-1 bg-accent/20 text-accent text-xs font-heading rounded-full">
                        {data.genre}
                      </span>
                    </div>
                  </div>
                  <p
                    className="font-body text-base leading-relaxed text-foreground mt-4"
                    dangerouslySetInnerHTML={{
                      __html: activeTab === "vocabulary"
                        ? highlightWords(data.story, data.vocabulary?.words || [])
                        : data.story,
                    }}
                  />
                </div>

                {/* Activity Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActivityType)}>
                  <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-card/80 p-2 rounded-xl border border-border mb-4">
                    {ACTIVITY_TABS.map((tab) => {
                      const progress = gameState.getActivityLevel(tab.id);
                      return (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-heading data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {tab.icon}
                          <span className="hidden sm:inline">{tab.label}</span>
                          <span className="text-[10px] opacity-70">G{progress.level}</span>
                          {completedActivities[tab.id] && <span className="text-[10px]">✅</span>}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  <TabsContent value="vocabulary">
                    <Vocabulary data={data.vocabulary} onCorrect={() => handleCorrect("vocabulary", true)} />
                    {!completedActivities["vocabulary"] && (
                      <button onClick={() => handleCompleteActivity("vocabulary")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                        Submit Vocabulary ✅
                      </button>
                    )}
                    {levelUpMessages["vocabulary"] && (
                      <div className="clay-card bg-garden-success/20 border-2 border-garden-success p-4 mt-4 text-center">
                        <Trophy className="h-8 w-8 text-garden-success mx-auto mb-2" />
                        <p className="font-heading text-lg text-foreground">{levelUpMessages["vocabulary"]}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="fact-opinion">
                    <FactOpinion data={data.factOpinion} onCorrect={() => handleCorrect("fact-opinion")} />
                    {!completedActivities["fact-opinion"] && (
                      <button onClick={() => handleCompleteActivity("fact-opinion")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                        Submit Fact vs Opinion ✅
                      </button>
                    )}
                    {levelUpMessages["fact-opinion"] && (
                      <div className="clay-card bg-garden-success/20 border-2 border-garden-success p-4 mt-4 text-center">
                        <Trophy className="h-8 w-8 text-garden-success mx-auto mb-2" />
                        <p className="font-heading text-lg text-foreground">{levelUpMessages["fact-opinion"]}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="summaries">
                    <Summaries data={data.summaries} onCorrect={() => handleCorrect("summaries")} />
                    {!completedActivities["summaries"] && (
                      <button onClick={() => handleCompleteActivity("summaries")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                        Submit Summary ✅
                      </button>
                    )}
                    {levelUpMessages["summaries"] && (
                      <div className="clay-card bg-garden-success/20 border-2 border-garden-success p-4 mt-4 text-center">
                        <Trophy className="h-8 w-8 text-garden-success mx-auto mb-2" />
                        <p className="font-heading text-lg text-foreground">{levelUpMessages["summaries"]}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="character-traits">
                    <CharacterTraits data={data.characterTraits} onCorrect={() => handleCorrect("character-traits")} />
                    {!completedActivities["character-traits"] && (
                      <button onClick={() => handleCompleteActivity("character-traits")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                        Submit Character Traits ✅
                      </button>
                    )}
                    {levelUpMessages["character-traits"] && (
                      <div className="clay-card bg-garden-success/20 border-2 border-garden-success p-4 mt-4 text-center">
                        <Trophy className="h-8 w-8 text-garden-success mx-auto mb-2" />
                        <p className="font-heading text-lg text-foreground">{levelUpMessages["character-traits"]}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="compare-contrast">
                    <CompareContrast data={data.compareContrast} mainStory={data.story} onCorrect={() => handleCorrect("compare-contrast")} />
                    {!completedActivities["compare-contrast"] && (
                      <button onClick={() => handleCompleteActivity("compare-contrast")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                        Submit Compare & Contrast ✅
                      </button>
                    )}
                    {levelUpMessages["compare-contrast"] && (
                      <div className="clay-card bg-garden-success/20 border-2 border-garden-success p-4 mt-4 text-center">
                        <Trophy className="h-8 w-8 text-garden-success mx-auto mb-2" />
                        <p className="font-heading text-lg text-foreground">{levelUpMessages["compare-contrast"]}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-center">
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
      </div>
    </DynamicSky>
  );
}
