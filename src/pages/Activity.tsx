import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft, BookOpen, Pencil, Star, Users, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGameState } from "@/hooks/useGameState";
import type { CombinedStoryData, ActivityType } from "@/lib/ai";
import { STORY_GENRES } from "@/lib/storyGenres";
import { pickSampleStory } from "@/lib/pickSampleStory";
import Vocabulary from "@/components/activities/Vocabulary";
import CompareContrast from "@/components/activities/CompareContrast";
import FactOpinion from "@/components/activities/FactOpinion";
import Summaries from "@/components/activities/Summaries";
import CharacterTraits from "@/components/activities/CharacterTraits";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { cn } from "@/lib/utils";

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

function isFullStoryPerfect(
  storyData: CombinedStoryData,
  completed: Record<string, boolean>,
  correct: Record<string, number>,
): boolean {
  return ACTIVITY_TABS.every((t) => {
    if (!completed[t.id]) return false;
    const total = getQuestionCount(t.id, storyData);
    const c = correct[t.id] ?? 0;
    return total > 0 && c === total;
  });
}

export default function Activity() {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = useGameState();

  const locationState = (location.state ?? null) as {
    activityTab?: ActivityType;
    fromReading?: boolean;
  } | null;
  /** Home "Reading" tile — show every activity tab. Any other tile — one activity first, then remaining only. */
  const fromReadingHome = Boolean(locationState?.fromReading);
  const entryActivityTab: ActivityType | null =
    fromReadingHome
      ? null
      : locationState?.activityTab &&
          ACTIVITY_TABS.some((t) => t.id === locationState.activityTab)
        ? locationState.activityTab
        : null;

  const [data, setData] = useState<CombinedStoryData | null>(null);
  const lastStoryTitleRef = useRef<string | null>(null);
  const [round, setRound] = useState(0);
  const [recentStar, setRecentStar] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityType>("vocabulary");

  // Track correct counts and completion per activity type per round
  const [correctCounts, setCorrectCounts] = useState<Record<string, number>>({});
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});
  const [perfectStoryLogoutOpen, setPerfectStoryLogoutOpen] = useState(false);
  const perfectLogoutPromptRoundRef = useRef<number | null>(null);

  /** Which activity tabs appear in the bar: Reading = all; other home tiles = chosen only until done, then incomplete only. */
  const visibleActivityIds = useMemo(() => {
    if (!data) return [];
    if (fromReadingHome || !entryActivityTab) {
      return ACTIVITY_TABS.map((t) => t.id);
    }
    if (!completedActivities[entryActivityTab]) {
      return [entryActivityTab];
    }
    return ACTIVITY_TABS.map((t) => t.id).filter((id) => !completedActivities[id]);
  }, [data, fromReadingHome, entryActivityTab, completedActivities]);

  const progressPercent = (gameState.stageIndex / STAGES_COUNT) * 100;

  const loadContent = (genreLabel: string) => {
    perfectLogoutPromptRoundRef.current = null;
    setPerfectStoryLogoutOpen(false);
    setCorrectCounts({});
    setCompletedActivities({});
    const result = pickSampleStory(genreLabel, lastStoryTitleRef.current);
    lastStoryTitleRef.current = result.title;
    setData(result);
    setRound((r) => r + 1);
    if (entryActivityTab && ACTIVITY_TABS.some((t) => t.id === entryActivityTab)) {
      setActiveTab(entryActivityTab);
    } else {
      setActiveTab("vocabulary");
    }
  };

  const handleNextStory = () => {
    perfectLogoutPromptRoundRef.current = null;
    setPerfectStoryLogoutOpen(false);
    setData(null);
    setCorrectCounts({});
    setCompletedActivities({});
  };

  const handleCorrect = useCallback((activityType: ActivityType) => {
    gameState.handleCorrectAnswer();
    setCorrectCounts((prev) => ({ ...prev, [activityType]: (prev[activityType] || 0) + 1 }));
  }, [gameState]);

  const handleCompleteActivity = useCallback((activityType: ActivityType) => {
    if (completedActivities[activityType] || !data) return;
    setCompletedActivities((prev) => ({ ...prev, [activityType]: true }));

    const totalQ = getQuestionCount(activityType, data);
    const correct = correctCounts[activityType] || 0;
    const perfect = totalQ > 0 && correct === totalQ;
    const starBlockedForReadingVocab = fromReadingHome && activityType === "vocabulary";
    if (perfect && !starBlockedForReadingVocab) {
      gameState.awardPerfectActivity();
      setRecentStar(true);
      setTimeout(() => setRecentStar(false), 2000);
    }
    gameState.completeStory(activityType, totalQ, correct, `${data.title}::${round}`);
  }, [completedActivities, data, correctCounts, gameState, fromReadingHome, round]);

  useEffect(() => {
    if (visibleActivityIds.length === 0 || visibleActivityIds.includes(activeTab)) return;
    setActiveTab(visibleActivityIds[0]);
  }, [visibleActivityIds, activeTab]);

  useEffect(() => {
    if (!data) return;
    if (!isFullStoryPerfect(data, completedActivities, correctCounts)) return;
    if (perfectLogoutPromptRoundRef.current === round) return;
    perfectLogoutPromptRoundRef.current = round;
    setPerfectStoryLogoutOpen(true);
  }, [data, completedActivities, correctCounts, round]);

  const handlePerfectStoryGoHome = useCallback(() => {
    setPerfectStoryLogoutOpen(false);
    navigate("/");
  }, [navigate]);

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
      <Dialog open={perfectStoryLogoutOpen} onOpenChange={setPerfectStoryLogoutOpen}>
        <DialogContent className="font-heading sm:rounded-2xl border-2 border-emerald-200/80 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">Perfect story</DialogTitle>
            <DialogDescription className="text-base text-foreground/90 pt-1">
              You answered every question correctly for all activities in this story. Amazing work!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="font-heading rounded-xl"
              onClick={() => setPerfectStoryLogoutOpen(false)}
            >
              Keep reading
            </Button>
            <Button
              type="button"
              className="font-heading rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handlePerfectStoryGoHome}
            >
              Back to home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className={cn("min-h-screen w-full flex flex-col pb-8", PAGE_SHELL_GRADIENT)}>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6 pb-6 border-b border-white/25">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="min-h-[48px] rounded-2xl font-heading bg-white/20 hover:bg-white/30 text-white border-0 shadow-none"
            >
              <ArrowLeft className="h-5 w-5 mr-1" /> Home
            </Button>

            <div className="flex items-center gap-2 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
              <BookOpen className="h-6 w-6 shrink-0" />
              <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
                Story Time
              </h1>
            </div>

            <div className={`ml-auto star-badge ${recentStar ? "glowing" : ""}`}>
              <Star className="h-6 w-6 text-amber-100 fill-current drop-shadow-md" />
              <span className="absolute -bottom-1 -right-1 bg-violet-950 text-amber-100 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {gameState.stars}
              </span>
            </div>
          </div>

          <div className="progress-bar-track bg-white/40">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-white/85 mt-2 text-right drop-shadow-sm">
            🌱 Growing: {gameState.currentStage} · 🌸 Flowers: {gameState.flowers}
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 flex-1 pt-6 md:pt-8">
            {!data && (
              <div className="w-full space-y-6 md:space-y-8 pb-4">
                  <div className="flex justify-center gap-2 text-3xl drop-shadow-md" aria-hidden>
                    <span>✨</span>
                    <span>🌈</span>
                    <span>✨</span>
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-center text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                    Pick a story type
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {STORY_GENRES.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => loadContent(g.label)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl p-4 text-center min-h-[128px] md:min-h-[140px] transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] hover:-translate-y-0.5 ${g.tileClass}`}
                      >
                        <span className="text-4xl drop-shadow-sm" aria-hidden>
                          {g.emoji}
                        </span>
                        <span className="font-heading text-sm md:text-base font-bold leading-tight drop-shadow-sm">
                          {g.label}
                        </span>
                        <span className="text-[11px] md:text-xs font-medium opacity-85 leading-snug">{g.hint}</span>
                      </button>
                    ))}
                  </div>
              </div>
            )}

            {data && (
              <div key={round}>
                {/* Story Section - Always Visible */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 md:p-7 mb-6 shadow-sm border border-white/50">
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
                    className="font-body text-base sm:text-lg leading-relaxed sm:leading-loose text-foreground mt-4 max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: activeTab === "vocabulary"
                        ? highlightWords(data.story, data.vocabulary?.words || [])
                        : data.story,
                    }}
                  />
                </div>

                {/* Activity Tabs — non-Reading home: one activity until submitted, then remaining incomplete only */}
                {visibleActivityIds.length > 0 ? (
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActivityType)}>
                    <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-white/75 backdrop-blur-md p-2 rounded-xl border border-white/50 mb-4 shadow-sm">
                      {ACTIVITY_TABS.filter((tab) => visibleActivityIds.includes(tab.id)).map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-heading data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {tab.icon}
                          <span className="hidden sm:inline">{tab.label}</span>
                          {completedActivities[tab.id] && <span className="text-[10px]">✅</span>}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="vocabulary">
                      <Vocabulary data={data.vocabulary} onCorrect={() => handleCorrect("vocabulary")} />
                      {!completedActivities["vocabulary"] && (
                        <button onClick={() => handleCompleteActivity("vocabulary")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                          Submit Vocabulary ✅
                        </button>
                      )}
                    </TabsContent>

                    <TabsContent value="fact-opinion">
                      <FactOpinion data={data.factOpinion} onCorrect={() => handleCorrect("fact-opinion")} />
                      {!completedActivities["fact-opinion"] && (
                        <button onClick={() => handleCompleteActivity("fact-opinion")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                          Submit Fact vs Opinion ✅
                        </button>
                      )}
                    </TabsContent>

                    <TabsContent value="summaries">
                      <Summaries data={data.summaries} onCorrect={() => handleCorrect("summaries")} />
                      {!completedActivities["summaries"] && (
                        <button onClick={() => handleCompleteActivity("summaries")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                          Submit Summary ✅
                        </button>
                      )}
                    </TabsContent>

                    <TabsContent value="character-traits">
                      <CharacterTraits data={data.characterTraits} onCorrect={() => handleCorrect("character-traits")} />
                      {!completedActivities["character-traits"] && (
                        <button onClick={() => handleCompleteActivity("character-traits")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                          Submit Character Traits ✅
                        </button>
                      )}
                    </TabsContent>

                    <TabsContent value="compare-contrast">
                      <CompareContrast data={data.compareContrast} mainStory={data.story} onCorrect={() => handleCorrect("compare-contrast")} />
                      {!completedActivities["compare-contrast"] && (
                        <button onClick={() => handleCompleteActivity("compare-contrast")} className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full">
                          Submit Compare & Contrast ✅
                        </button>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <p className="mb-4 text-center font-heading text-sm text-white drop-shadow-sm rounded-xl bg-white/20 px-4 py-3 border border-white/30">
                    You finished every activity for this story — pick another story or go home.
                  </p>
                )}

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleNextStory}
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
