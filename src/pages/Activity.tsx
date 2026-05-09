import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft, BookOpen, Pencil, Star, Users, FileText, Scale, Volume2 } from "lucide-react";
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
import { generateCombinedStory, type CombinedStoryData, type ActivityType } from "@/lib/ai";
import { STORY_GENRES } from "@/lib/storyGenres";
import { pickSampleStory, findBundledStoryByTitle } from "@/lib/pickSampleStory";
import Vocabulary from "@/components/activities/Vocabulary";
import CompareContrast from "@/components/activities/CompareContrast";
import FactOpinion from "@/components/activities/FactOpinion";
import Summaries from "@/components/activities/Summaries";
import CharacterTraits from "@/components/activities/CharacterTraits";
import StoryReadingFlow from "@/components/StoryReadingFlow";
import { ReadingRichParagraph } from "@/components/ReadingRichParagraph";
import {
  computeQuestionScore,
  type QuestionResolution,
  type ReadingMetrics,
} from "@/lib/activityScoring";
import { countWords, minimumReadingSeconds } from "@/lib/storySections";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { persistActivityQuestionScores } from "@/lib/questionScoreBreakdown";
import type { Json } from "@/integrations/supabase/types";
import {
  appendDailyStoryCompletedActivity,
  claimDailyStorySession,
  fetchTodaysStorySession,
  setDailyStoryReadingDone,
  storyFingerprint,
  type DailyStorySessionRow,
} from "@/lib/dailyStorySession";
import { applyReadingUtteranceVoice } from "@/lib/readingVoice";
import { cn } from "@/lib/utils";
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

function resolutionStorageKey(activityType: ActivityType, questionKey: string) {
  return `${activityType}::${questionKey}`;
}

function expectedQuestionKeys(activityType: ActivityType, data: CombinedStoryData): string[] {
  switch (activityType) {
    case "vocabulary":
      return data.vocabulary.words.map((_, i) => `word:${i}`);
    case "fact-opinion":
      return data.factOpinion.statements.map((_, i) => `stmt:${i}`);
    case "summaries":
      return ["summary"];
    case "character-traits":
      return data.characterTraits.questions.map((_, i) => `trait:${i}`);
    case "compare-contrast":
      return ["compare"];
    default:
      return [];
  }
}

/** Stars require perfect accuracy and a decent composite score (first-try heavy + evidence + reading pace). */
const STAR_SCORE_THRESHOLD = 62;

function displayStoryTitle(title: string) {
  return title.replace(/\s+\(Story\s+\d+\)$/i, "");
}

export default function Activity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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
  const seenBundledTitlesRef = useRef<Record<string, Set<string>>>({});
  const [loadingStory, setLoadingStory] = useState(false);
  const [round, setRound] = useState(0);
  const [recentStar, setRecentStar] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityType>("vocabulary");

  // Track correct counts and completion per activity type per round
  const [correctCounts, setCorrectCounts] = useState<Record<string, number>>({});
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});
  const [perfectStoryLogoutOpen, setPerfectStoryLogoutOpen] = useState(false);
  const perfectLogoutPromptRoundRef = useRef<number | null>(null);
  const [readingFlowComplete, setReadingFlowComplete] = useState(false);
  /** Logged-in: today’s story row from DB; `dailySessionReady` false while fetching. */
  const [dailySession, setDailySession] = useState<DailyStorySessionRow | null>(null);
  const [dailySessionReady, setDailySessionReady] = useState(false);
  const [submittingActivity, setSubmittingActivity] = useState<string | null>(null);
  const activitySubmitLockRef = useRef(false);
  const roundRef = useRef(0);
  const resumeRanRef = useRef(false);
  const [readingMetrics, setReadingMetrics] = useState<ReadingMetrics | null>(null);
  /** Reading tile path: full-story speech synthesis active (word taps ignored until done). */
  const [readingHomeFullSpeaking, setReadingHomeFullSpeaking] = useState(false);
  const readingHomeFullUtteranceActiveRef = useRef(false);
  const fullStoryReadingStartedAtRef = useRef<number>(Date.now());
  const resolutionsRef = useRef<Record<string, QuestionResolution>>({});

  const storyKey = useMemo(
    () => (data ? `${data.title}::${data.genre}::r${round}` : ""),
    [data?.title, data?.genre, round],
  );

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const refreshDailySession = useCallback(async () => {
    if (!user?.id) {
      setDailySession(null);
      setDailySessionReady(true);
      return;
    }
    const row = await fetchTodaysStorySession(user.id);
    setDailySession(row);
    setDailySessionReady(true);
  }, [user?.id]);

  const handleReadingFlowComplete = useCallback(
    (metrics: ReadingMetrics) => {
      setReadingMetrics(metrics);
      setReadingFlowComplete(true);
      if (user?.id) {
        void (async () => {
          await setDailyStoryReadingDone(user.id, true);
          await refreshDailySession();
        })();
      }
    },
    [user?.id, refreshDailySession],
  );

  const handleFullStoryReadingContinue = useCallback(() => {
    if (!data) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    readingHomeFullUtteranceActiveRef.current = false;
    setReadingHomeFullSpeaking(false);
    const elapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - fullStoryReadingStartedAtRef.current) / 1000),
    );
    const minimumSeconds = Math.max(1, minimumReadingSeconds(countWords(data.story ?? "")));
    handleReadingFlowComplete({
      totalSecondsSpent: elapsedSeconds,
      totalMinimumSeconds: minimumSeconds,
    });
  }, [data, handleReadingFlowComplete]);

  const toggleReadingHomeReadAloud = useCallback(() => {
    const text = data?.story?.trim() ?? "";
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (readingHomeFullUtteranceActiveRef.current) {
      window.speechSynthesis.cancel();
      readingHomeFullUtteranceActiveRef.current = false;
      setReadingHomeFullSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    applyReadingUtteranceVoice(utterance);
    readingHomeFullUtteranceActiveRef.current = true;
    setReadingHomeFullSpeaking(true);
    utterance.onend = () => {
      readingHomeFullUtteranceActiveRef.current = false;
      setReadingHomeFullSpeaking(false);
    };
    utterance.onerror = () => {
      readingHomeFullUtteranceActiveRef.current = false;
      setReadingHomeFullSpeaking(false);
    };
    window.speechSynthesis.speak(utterance);
  }, [data?.story]);

  useEffect(() => {
    setReadingMetrics(null);
    fullStoryReadingStartedAtRef.current = Date.now();
    resolutionsRef.current = {};
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    readingHomeFullUtteranceActiveRef.current = false;
    setReadingHomeFullSpeaking(false);
  }, [round, data?.title, data?.genre]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      readingHomeFullUtteranceActiveRef.current = false;
    };
  }, []);

  useEffect(() => {
    setDailySessionReady(false);
    void refreshDailySession();
  }, [refreshDailySession]);

  useEffect(() => {
    if (data === null) resumeRanRef.current = false;
  }, [data]);

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;
    const onFocus = () => {
      void refreshDailySession();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user?.id, refreshDailySession]);

  /** Resume incomplete daily story after refresh (same fingerprint + round). */
  useEffect(() => {
    if (!user?.id || data !== null || !dailySessionReady || resumeRanRef.current) return;
    if (!dailySession) return;

    const allDone = ACTIVITY_TABS.every((t) => dailySession.completed_activities.includes(t.id));
    if (allDone) return;

    resumeRanRef.current = true;
    setLoadingStory(true);

    void (async () => {
      try {
        let result: CombinedStoryData | null = null;
        const snap = dailySession.story_snapshot;
        if (snap && typeof snap === "object" && !Array.isArray(snap)) {
          result = snap as CombinedStoryData;
        } else {
          result = findBundledStoryByTitle(dailySession.genre_label, dailySession.story_title);
        }

        if (!result) {
          toast.error("Could not restore today's story.");
          resumeRanRef.current = false;
          return;
        }

        lastStoryTitleRef.current = result.title;
        setRound(dailySession.story_round);
        setData(result);

        const completed: Record<string, boolean> = {};
        dailySession.completed_activities.forEach((a) => {
          completed[a] = true;
        });
        setCompletedActivities(completed);
        setReadingFlowComplete(dailySession.reading_done);

        if (entryActivityTab && ACTIVITY_TABS.some((t) => t.id === entryActivityTab)) {
          setActiveTab(entryActivityTab);
        } else {
          setActiveTab("vocabulary");
        }
      } finally {
        setLoadingStory(false);
      }
    })();
  }, [user?.id, data, dailySession, dailySessionReady, entryActivityTab]);

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
  const storyPickerHeadingByActivity: Partial<Record<ActivityType, string>> = {
    vocabulary: "Pick a Story type to increase your Vocabulary",
    "fact-opinion": "Pick a Story type to improve your Fact vs Opinion skills",
    summaries: "Pick a Story type to improve your Summaries",
    "character-traits": "Pick a Story type to improve your Character Traits",
    "compare-contrast": "Pick a Story type to improve your Compare & Contrast skills",
  };
  const storyPickerHeading =
    (entryActivityTab && storyPickerHeadingByActivity[entryActivityTab]) || "Pick a story type";

  const todaysStoryFullyComplete =
    Boolean(user?.id && dailySession) &&
    ACTIVITY_TABS.every((t) => dailySession!.completed_activities.includes(t.id));

  const loadContent = async (genreLabel: string) => {
    perfectLogoutPromptRoundRef.current = null;
    setPerfectStoryLogoutOpen(false);
    setReadingFlowComplete(false);
    setLoadingStory(true);
    try {
      const seenForGenre = seenBundledTitlesRef.current[genreLabel] ?? new Set<string>();
      seenBundledTitlesRef.current[genreLabel] = seenForGenre;

      let loadedFromBundled = false;
      let result = pickSampleStory(genreLabel, lastStoryTitleRef.current, seenForGenre);
      if (result) {
        seenForGenre.add(result.title);
        loadedFromBundled = true;
      } else {
        result = await generateCombinedStory(gameState.level, genreLabel);
        toast.message("Loaded an AI fallback story", {
          description: "Bundled stories for this genre were exhausted in this session.",
        });
      }

      const nextRound = roundRef.current + 1;

      if (user?.id) {
        const claim = await claimDailyStorySession(user.id, {
          fingerprint: storyFingerprint(result),
          genreLabel,
          storyTitle: result.title,
          storyRound: nextRound,
          storySnapshot: loadedFromBundled ? null : (result as unknown as Json),
        });
        if (!claim.ok) {
          toast.error("Today's story is already in progress", {
            description:
              "Finish every activity for your current story today, or come back tomorrow for a new one.",
          });
          return;
        }
        await refreshDailySession();
      }

      setCorrectCounts({});
      setCompletedActivities({});
      lastStoryTitleRef.current = result.title;
      setData(result);
      setRound(nextRound);

      if (entryActivityTab && ACTIVITY_TABS.some((t) => t.id === entryActivityTab)) {
        setActiveTab(entryActivityTab);
      } else {
        setActiveTab("vocabulary");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load story";
      toast.error(message);
    } finally {
      setLoadingStory(false);
    }
  };

  const handleNextStory = () => {
    if (user?.id && data && !ACTIVITY_TABS.every((t) => completedActivities[t.id])) {
      toast.message("Finish today's story first", {
        description: "Submit all activities for this story today before leaving.",
      });
      return;
    }
    perfectLogoutPromptRoundRef.current = null;
    setPerfectStoryLogoutOpen(false);
    setReadingFlowComplete(false);
    setData(null);
    setCorrectCounts({});
    setCompletedActivities({});
  };

  const handleCorrect = useCallback((activityType: ActivityType) => {
    gameState.handleCorrectAnswer();
    setCorrectCounts((prev) => ({ ...prev, [activityType]: (prev[activityType] || 0) + 1 }));
  }, [gameState]);

  const handleQuestionResolved = useCallback((activityType: ActivityType, res: QuestionResolution) => {
    resolutionsRef.current[resolutionStorageKey(activityType, res.questionKey)] = res;
  }, []);

  const handleCompleteActivity = useCallback(async (activityType: ActivityType) => {
    if (completedActivities[activityType] || !data || activitySubmitLockRef.current) return;

    activitySubmitLockRef.current = true;
    setSubmittingActivity(activityType);

    try {
      setCompletedActivities((prev) => ({ ...prev, [activityType]: true }));

      const totalQ = getQuestionCount(activityType, data);
      const correct = correctCounts[activityType] || 0;
      const perfect = totalQ > 0 && correct === totalQ;

      const keys = expectedQuestionKeys(activityType, data);
      const scoreRows = keys.map((questionKey) => {
        const res = resolutionsRef.current[resolutionStorageKey(activityType, questionKey)];
        const row = computeQuestionScore(res, readingMetrics);
        return { question_key: questionKey, row };
      });
      const avgFinal =
        scoreRows.reduce((sum, r) => sum + r.row.final_points, 0) / Math.max(1, scoreRows.length);

      keys.forEach((k) => delete resolutionsRef.current[resolutionStorageKey(activityType, k)]);

      if (user?.id) {
        void persistActivityQuestionScores(user.id, storyKey, activityType, scoreRows);
      }

      toast.message(`${activityType.replace("-", " ")} · score ~${Math.round(avgFinal)}`, {
        description:
          readingMetrics && readingMetrics.totalMinimumSeconds > 0
            ? `Includes reading pace (${Math.round((readingMetrics.totalSecondsSpent / readingMetrics.totalMinimumSeconds) * 100)}% of suggested time)`
            : undefined,
      });

      const starBlockedForReadingVocab = fromReadingHome && activityType === "vocabulary";
      const earnsStar = perfect && avgFinal >= STAR_SCORE_THRESHOLD && !starBlockedForReadingVocab;
      if (earnsStar) {
        gameState.awardPerfectActivity();
        setRecentStar(true);
        setTimeout(() => setRecentStar(false), 2000);
      }
      gameState.completeStory(activityType, totalQ, correct, `${data.title}::${round}`);

      if (user?.id) {
        await appendDailyStoryCompletedActivity(user.id, activityType);
        await refreshDailySession();
      }
    } finally {
      activitySubmitLockRef.current = false;
      setSubmittingActivity(null);
    }
  }, [
    completedActivities,
    data,
    correctCounts,
    gameState,
    fromReadingHome,
    round,
    readingMetrics,
    storyKey,
    user?.id,
    refreshDailySession,
  ]);

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
                    {storyPickerHeading}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {STORY_GENRES.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => void loadContent(g.label)}
                        disabled={
                          loadingStory ||
                          (user?.id && !dailySessionReady) ||
                          (user?.id && todaysStoryFullyComplete)
                        }
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

            {data && !readingFlowComplete && fromReadingHome && (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 md:p-7 mb-6 shadow-sm border border-white/50">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">
                        {displayStoryTitle(data.title)}
                      </h2>
                      <Button
                        type="button"
                        variant={readingHomeFullSpeaking ? "default" : "secondary"}
                        size="icon"
                        className="h-9 w-9 shrink-0 rounded-full"
                        onClick={toggleReadingHomeReadAloud}
                        disabled={!(data.story ?? "").trim()}
                        aria-label={readingHomeFullSpeaking ? "Stop reading aloud" : "Read aloud"}
                        aria-pressed={readingHomeFullSpeaking}
                      >
                        <Volume2 className={cn("h-4 w-4", readingHomeFullSpeaking && "opacity-95")} aria-hidden />
                      </Button>
                    </div>
                    <span className="mt-1 inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-heading rounded-full">
                      {data.genre}
                    </span>
                  </div>
                </div>
                <div className="mt-3 max-w-none">
                  <ReadingRichParagraph
                    text={data.story ?? ""}
                    vocabularyWords={data.vocabulary?.words ?? []}
                    extraKeyPhrases={data.readingExtras?.keyPhrases}
                    autoHighlightOpening
                  />
                </div>
                <div className="mt-5 flex justify-end">
                  <Button onClick={handleFullStoryReadingContinue} className="min-h-[44px] rounded-xl font-heading">
                    Continue to Activities
                  </Button>
                </div>
              </div>
            )}

            {data && !readingFlowComplete && !fromReadingHome && (
              <div key={`read-${storyKey}-${round}`} className="mb-6">
                <StoryReadingFlow
                  storyKey={storyKey}
                  title={displayStoryTitle(data.title)}
                  genre={data.genre}
                  story={data.story ?? ""}
                  vocabularyWords={data.vocabulary?.words ?? []}
                  readingExtras={data.readingExtras}
                  userId={user?.id ?? null}
                  onComplete={(m) => handleReadingFlowComplete(m)}
                />
              </div>
            )}

            {data && readingFlowComplete && (
              <div key={round}>
                {/* Full story — after section checkpoints */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 md:p-7 mb-6 shadow-sm border border-white/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">
                        {displayStoryTitle(data.title)}
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
                        ? highlightWords(data.story ?? "", data.vocabulary?.words || [])
                        : (data.story ?? ""),
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
                      <Vocabulary
                        data={data.vocabulary}
                        onCorrect={() => handleCorrect("vocabulary")}
                        onQuestionResolved={(r) => handleQuestionResolved("vocabulary", r)}
                      />
                      {!completedActivities["vocabulary"] && (
                        <button
                          type="button"
                          disabled={submittingActivity === "vocabulary"}
                          onClick={() => void handleCompleteActivity("vocabulary")}
                          className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {submittingActivity === "vocabulary" ? "Saving…" : "Submit Vocabulary ✅"}
                        </button>
                      )}
                    </TabsContent>

                    <TabsContent value="fact-opinion">
                      <FactOpinion
                        data={data.factOpinion}
                        onCorrect={() => handleCorrect("fact-opinion")}
                        onQuestionResolved={(r) => handleQuestionResolved("fact-opinion", r)}
                      />
                      {!completedActivities["fact-opinion"] && (
                        <button
                          type="button"
                          disabled={submittingActivity === "fact-opinion"}
                          onClick={() => void handleCompleteActivity("fact-opinion")}
                          className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {submittingActivity === "fact-opinion" ? "Saving…" : "Submit Fact vs Opinion ✅"}
                        </button>
                      )}
                    </TabsContent>

                    <TabsContent value="summaries">
                      <Summaries
                        data={data.summaries}
                        mainStory={data.story ?? ""}
                        storyKey={storyKey}
                        userId={user?.id ?? null}
                        onCorrect={() => handleCorrect("summaries")}
                        onQuestionResolved={(r) => handleQuestionResolved("summaries", r)}
                      />
                      {!completedActivities["summaries"] && (
                        <button
                          type="button"
                          disabled={submittingActivity === "summaries"}
                          onClick={() => void handleCompleteActivity("summaries")}
                          className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {submittingActivity === "summaries" ? "Saving…" : "Submit Summary ✅"}
                        </button>
                      )}
                    </TabsContent>

                    <TabsContent value="character-traits">
                      <CharacterTraits
                        data={data.characterTraits}
                        mainStory={data.story ?? ""}
                        storyKey={storyKey}
                        userId={user?.id ?? null}
                        onCorrect={() => handleCorrect("character-traits")}
                        onQuestionResolved={(r) => handleQuestionResolved("character-traits", r)}
                      />
                      {!completedActivities["character-traits"] && (
                        <button
                          type="button"
                          disabled={submittingActivity === "character-traits"}
                          onClick={() => void handleCompleteActivity("character-traits")}
                          className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {submittingActivity === "character-traits" ? "Saving…" : "Submit Character Traits ✅"}
                        </button>
                      )}
                    </TabsContent>

                    <TabsContent value="compare-contrast">
                      <CompareContrast
                        data={data.compareContrast}
                        mainStory={data.story ?? ""}
                        onCorrect={() => handleCorrect("compare-contrast")}
                        onQuestionResolved={(r) => handleQuestionResolved("compare-contrast", r)}
                      />
                      {!completedActivities["compare-contrast"] && (
                        <button
                          type="button"
                          disabled={submittingActivity === "compare-contrast"}
                          onClick={() => void handleCompleteActivity("compare-contrast")}
                          className="clay-button bg-garden-success text-primary-foreground px-8 py-3 font-heading mt-4 w-full disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {submittingActivity === "compare-contrast"
                            ? "Saving…"
                            : "Submit Compare & Contrast ✅"}
                        </button>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : null}

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleNextStory}
                    disabled={Boolean(
                      user?.id &&
                        data &&
                        !ACTIVITY_TABS.every((t) => completedActivities[t.id]),
                    )}
                    title={
                      user?.id &&
                      data &&
                      !ACTIVITY_TABS.every((t) => completedActivities[t.id])
                        ? "Submit every activity for today's story first."
                        : undefined
                    }
                    className="clay-button bg-card text-foreground border border-border px-8 py-3 font-heading disabled:opacity-50 disabled:pointer-events-none"
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
