import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft, BookOpen, Pencil, Star, Users, FileText, Scale, Volume2, CheckCircle2 } from "lucide-react";
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
import { pickSampleStory } from "@/lib/pickSampleStory";
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
import { persistActivityQuestionScores } from "@/lib/questionScoreBreakdown";
import type { Json } from "@/integrations/supabase/types";
import {
  appendDailyStoryCompletedActivity,
  saveDailyStorySession,
  setDailyStoryReadingDone,
  storyFingerprint,
} from "@/lib/dailyStorySession";
import { speakExpressive } from "@/lib/readingVoice";
import {
  clearGuestActiveStory,
  getGuestActiveStory,
  saveGuestActiveStory,
} from "@/lib/guestTrial";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { playCorrectSound, playStarSound, playWrongSound } from "@/lib/sounds";

type ActivityLocationState = {
  activityTab?: ActivityType;
  fromReading?: boolean;
};

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

/** Pull the simple definition text from a VocabularyWord (correct option). */
function getVocabDefinition(w: import("@/lib/ai").VocabularyWord): string {
  if ("variants" in w && w.variants.length > 0) {
    return w.variants[0].options[w.variants[0].correctIndex] ?? "";
  }
  if ("options" in w) {
    return (w as { options: string[]; correctIndex: number }).options[
      (w as { options: string[]; correctIndex: number }).correctIndex
    ] ?? "";
  }
  return "";
}

function toVocabWithDefs(words: import("@/lib/ai").VocabularyWord[]) {
  return words.map((w) => ({ word: w.word, definition: getVocabDefinition(w) }));
}

export default function Activity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const gameState = useGameState();

  const locationState = (location.state ?? null) as ActivityLocationState | null;
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
  const [submittingActivity, setSubmittingActivity] = useState<string | null>(null);
  const activitySubmitLockRef = useRef(false);
  const roundRef = useRef(0);
  const [readingMetrics, setReadingMetrics] = useState<ReadingMetrics | null>(null);
  /** Reading tile path: full-story speech synthesis active (word taps ignored until done). */
  const [readingHomeFullSpeaking, setReadingHomeFullSpeaking] = useState(false);
  const [readingHomeHighlightRange, setReadingHomeHighlightRange] = useState<{ start: number; end: number } | null>(null);
  const readingHomeFullUtteranceActiveRef = useRef(false);
  const cancelReadingHomeSpeechRef = useRef<() => void>(() => {});
  const fullStoryReadingStartedAtRef = useRef<number>(Date.now());
  const resolutionsRef = useRef<Record<string, QuestionResolution>>({});
  const guestRestoreRanRef = useRef(false);

  const storyKey = useMemo(
    () => (data ? `${data.title}::${data.genre}::r${round}` : ""),
    [data?.title, data?.genre, round],
  );

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const handleReadingFlowComplete = useCallback(
    (metrics: ReadingMetrics) => {
      setReadingMetrics(metrics);
      setReadingFlowComplete(true);
      if (user?.id) {
        void setDailyStoryReadingDone(user.id, true);
      }
    },
    [user?.id],
  );

  const handleFullStoryReadingContinue = useCallback(() => {
    if (!data) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    cancelReadingHomeSpeechRef.current();
    cancelReadingHomeSpeechRef.current = () => {};
    readingHomeFullUtteranceActiveRef.current = false;
    setReadingHomeFullSpeaking(false);
    setReadingHomeHighlightRange(null);
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
      cancelReadingHomeSpeechRef.current();
      cancelReadingHomeSpeechRef.current = () => {};
      readingHomeFullUtteranceActiveRef.current = false;
      setReadingHomeFullSpeaking(false);
      setReadingHomeHighlightRange(null);
      return;
    }

    readingHomeFullUtteranceActiveRef.current = true;
    setReadingHomeFullSpeaking(true);
    const cancel = speakExpressive(
      text,
      (start, end) => setReadingHomeHighlightRange({ start, end }),
      () => { readingHomeFullUtteranceActiveRef.current = false; setReadingHomeFullSpeaking(false); setReadingHomeHighlightRange(null); },
      () => { readingHomeFullUtteranceActiveRef.current = false; setReadingHomeFullSpeaking(false); setReadingHomeHighlightRange(null); },
    );
    cancelReadingHomeSpeechRef.current = cancel;
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

  /** Resume guest's in-progress story after refresh. */
  useEffect(() => {
    if (user?.id || data !== null || guestRestoreRanRef.current) return;
    const saved = getGuestActiveStory();
    if (!saved) return;

    guestRestoreRanRef.current = true;
    lastStoryTitleRef.current = saved.story.title;
    setRound(saved.round);
    setData(saved.story);
    setCompletedActivities(saved.completedActivities);
    setReadingFlowComplete(saved.readingFlowComplete);
  }, [user?.id, data]);

  /** Persist guest story progress locally. */
  useEffect(() => {
    if (user?.id || !data) return;
    saveGuestActiveStory({
      story: data,
      round,
      completedActivities,
      readingFlowComplete,
      fromReadingHome,
    });
  }, [user?.id, data, round, completedActivities, readingFlowComplete, fromReadingHome]);

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
        void saveDailyStorySession(user.id, {
          fingerprint: storyFingerprint(result),
          genreLabel,
          storyTitle: result.title,
          storyRound: nextRound,
          storySnapshot: loadedFromBundled ? null : (result as unknown as Json),
        });
      }

      setCorrectCounts({});
      setCompletedActivities({});
      lastStoryTitleRef.current = result.title;
      setData(result);
      setRound(nextRound);

      if (!user?.id) {
        saveGuestActiveStory({
          story: result,
          round: nextRound,
          completedActivities: {},
          readingFlowComplete: false,
          fromReadingHome,
        });
      }

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
    if (data && !ACTIVITY_TABS.every((t) => completedActivities[t.id])) {
      toast.message("Finish this story first", {
        description: "Submit all activities for this story before picking a new one.",
      });
      return;
    }
    perfectLogoutPromptRoundRef.current = null;
    setPerfectStoryLogoutOpen(false);
    setReadingFlowComplete(false);
    if (!user?.id) {
      clearGuestActiveStory();
    }
    setData(null);
    setCorrectCounts({});
    setCompletedActivities({});
  };

  const handleCorrect = useCallback((activityType: ActivityType) => {
    playCorrectSound();
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
        playStarSound();
        gameState.awardPerfectActivity();
        setRecentStar(true);
        setTimeout(() => setRecentStar(false), 2000);
      }
      gameState.completeStory(activityType, totalQ, correct, `${data.title}::${round}`);

      if (user?.id) {
        void appendDailyStoryCompletedActivity(user.id, activityType);
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

  return (
    <DynamicSky>
      <Dialog open={perfectStoryLogoutOpen} onOpenChange={setPerfectStoryLogoutOpen}>
        <DialogContent className="font-heading sm:rounded-2xl border-2 border-emerald-200/80 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">🎉 Perfect Story!</DialogTitle>
            <DialogDescription className="text-base text-foreground/90 pt-1">
              You answered every question correctly for all activities. You're a superstar! 🌟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="font-heading rounded-xl"
              onClick={() => setPerfectStoryLogoutOpen(false)}
            >
              Keep reading 📖
            </Button>
            <Button
              type="button"
              className="font-heading rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handlePerfectStoryGoHome}
            >
              Back to Garden 🌱
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen w-full flex flex-col pb-8">
        {/* ── COLORFUL HEADER ── */}
        <div
          style={{
            background: data
              ? "linear-gradient(135deg,#5BBD4E 0%,#27ae60 60%,#1abc9c 100%)"
              : "linear-gradient(135deg,#5bb8f5 0%,#7ec8f8 60%,#a8ddf7 100%)",
            transition: "background .5s ease",
          }}
          className="w-full px-4 md:px-8 pt-4 pb-5 shadow-md"
        >
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  background:"rgba(255,255,255,.25)",
                  border:"none",
                  borderRadius:14,
                  color:"#fff",
                  fontWeight:800,
                  fontSize:13,
                  padding:"8px 16px",
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  gap:6,
                  fontFamily:"'Nunito',sans-serif",
                  transition:"background .15s",
                }}
                onMouseEnter={(e)=>{ (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,.38)"; }}
                onMouseLeave={(e)=>{ (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,.25)"; }}
              >
                <ArrowLeft size={16} /> Garden
              </button>

              <div className="flex items-center gap-2 text-white" style={{ textShadow:"0 1px 4px rgba(0,0,0,.2)" }}>
                <BookOpen className="h-6 w-6 shrink-0" />
                <h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight">
                  {data ? `📖 ${displayStoryTitle(data.title)}` : "Story Time"}
                </h1>
              </div>

              {/* Star badge */}
              <div
                className={`ml-auto star-badge ${recentStar ? "glowing" : ""}`}
                style={{ flexShrink: 0 }}
              >
                <Star className="h-6 w-6 text-amber-100 fill-current drop-shadow-md" />
                <span className="absolute -bottom-1 -right-1 bg-violet-950 text-amber-100 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {gameState.stars}
                </span>
              </div>
            </div>

            {/* Genre + progress bar */}
            {data && (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                  <span style={{ background:"rgba(255,255,255,.3)", borderRadius:20, padding:"3px 12px", fontSize:11, fontWeight:800, color:"#fff" }}>
                    {data.genre}
                  </span>
                  {readingFlowComplete && (
                    <span style={{ background:"rgba(255,255,255,.3)", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:800, color:"#fff", display:"flex", alignItems:"center", gap:4 }}>
                      <CheckCircle2 size={12} /> Reading done ✅
                    </span>
                  )}
                </div>
                <div style={{ background:"rgba(255,255,255,.35)", borderRadius:10, height:11, overflow:"hidden" }}>
                  <div
                    style={{
                      height:"100%",
                      background:"rgba(255,255,255,.9)",
                      borderRadius:10,
                      transition:"width .6s cubic-bezier(.34,1.56,.64,1)",
                      width:`${progressPercent}%`,
                    }}
                  />
                </div>
                <p className="text-white/90 mt-1.5" style={{ fontSize:10, fontWeight:700, textAlign:"right" }}>
                  🌱 {gameState.currentStage} · 🌸 {gameState.flowers} flowers
                </p>
              </>
            )}
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 flex-1 pt-6 md:pt-8">
            {!data && (
              <div className="w-full space-y-6 md:space-y-8 pb-4">
                  <div className="flex justify-center gap-2 text-3xl drop-shadow-md" aria-hidden>
                    <span>✨</span><span>🌈</span><span>✨</span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-center text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                    {storyPickerHeading}
                  </h2>
                  {loadingStory && (
                    <div className="flex justify-center">
                      <div className="reading-timer-pill animate-reading-timer">
                        📖 Opening your story…
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {STORY_GENRES.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => void loadContent(g.label)}
                        disabled={loadingStory}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1.5 rounded-2xl p-4 text-center min-h-[128px] md:min-h-[140px] transition-all duration-200",
                          g.tileClass,
                          loadingStory
                            ? "opacity-55 cursor-not-allowed saturate-75"
                            : "hover:scale-[1.04] active:scale-[0.98] hover:-translate-y-0.5",
                        )}
                      >
                        <span className="text-4xl drop-shadow-sm" aria-hidden>{g.emoji}</span>
                        <span className="font-heading text-sm md:text-base font-bold leading-tight drop-shadow-sm">{g.label}</span>
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
                    vocabularyWords={toVocabWithDefs(data.vocabulary?.words ?? [])}
                    extraKeyPhrases={data.readingExtras?.keyPhrases}
                    autoHighlightOpening
                    highlightRange={readingHomeFullSpeaking ? readingHomeHighlightRange : null}
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
                  <ReadingRichParagraph
                    className="font-body mt-4"
                    text={data.story ?? ""}
                    vocabularyWords={toVocabWithDefs(data.vocabulary?.words ?? [])}
                    extraKeyPhrases={data.readingExtras?.keyPhrases}
                  />
                </div>

                {/* Activity Tabs */}
                {visibleActivityIds.length > 0 ? (
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActivityType)}>
                    <TabsList
                      className="w-full flex flex-wrap h-auto gap-1.5 p-2 rounded-2xl mb-5 shadow-sm"
                      style={{ background:"rgba(255,255,255,.85)", backdropFilter:"blur(8px)", border:"2px solid rgba(255,255,255,.6)" }}
                    >
                      {ACTIVITY_TABS.filter((tab) => visibleActivityIds.includes(tab.id)).map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-heading data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                          {tab.icon}
                          <span className="hidden sm:inline">{tab.label}</span>
                          {completedActivities[tab.id] && (
                            <span className="text-[10px] ml-0.5">✅</span>
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* Per-tab: activity + submit button */}
                    {(["vocabulary","fact-opinion","summaries","character-traits","compare-contrast"] as ActivityType[]).map((id) => {
                      const labels: Record<ActivityType, string> = {
                        vocabulary: "Submit Vocabulary ✅",
                        "fact-opinion": "Submit Fact vs Opinion ✅",
                        summaries: "Submit Summary ✅",
                        "character-traits": "Submit Character Traits ✅",
                        "compare-contrast": "Submit Compare & Contrast ✅",
                      };
                      return (
                        <TabsContent key={id} value={id}>
                          {id === "vocabulary" && (
                            <Vocabulary data={data.vocabulary} onCorrect={() => handleCorrect("vocabulary")} onQuestionResolved={(r) => handleQuestionResolved("vocabulary", r)} />
                          )}
                          {id === "fact-opinion" && (
                            <FactOpinion data={data.factOpinion} onCorrect={() => handleCorrect("fact-opinion")} onQuestionResolved={(r) => handleQuestionResolved("fact-opinion", r)} />
                          )}
                          {id === "summaries" && (
                            <Summaries data={data.summaries} mainStory={data.story ?? ""} storyKey={storyKey} userId={user?.id ?? null} onCorrect={() => handleCorrect("summaries")} onQuestionResolved={(r) => handleQuestionResolved("summaries", r)} vocabularyWords={toVocabWithDefs(data.vocabulary?.words ?? [])} />
                          )}
                          {id === "character-traits" && (
                            <CharacterTraits data={data.characterTraits} mainStory={data.story ?? ""} storyKey={storyKey} userId={user?.id ?? null} onCorrect={() => handleCorrect("character-traits")} onQuestionResolved={(r) => handleQuestionResolved("character-traits", r)} vocabularyWords={toVocabWithDefs(data.vocabulary?.words ?? [])} />
                          )}
                          {id === "compare-contrast" && (
                            <CompareContrast data={data.compareContrast} mainStory={data.story ?? ""} onCorrect={() => handleCorrect("compare-contrast")} onQuestionResolved={(r) => handleQuestionResolved("compare-contrast", r)} />
                          )}

                          {!completedActivities[id] && (
                            <button
                              type="button"
                              disabled={submittingActivity === id}
                              onClick={() => void handleCompleteActivity(id)}
                              style={{
                                marginTop: 16,
                                width: "100%",
                                background: submittingActivity === id
                                  ? "#aaa"
                                  : "linear-gradient(135deg,#5BBD4E,#27ae60)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 16,
                                padding: "14px 20px",
                                fontSize: 14,
                                fontWeight: 800,
                                cursor: submittingActivity === id ? "not-allowed" : "pointer",
                                fontFamily: "'Nunito','Sniglet',sans-serif",
                                boxShadow: "0 5px 0 0 rgba(22,163,74,.4)",
                                transition: "transform .15s, box-shadow .15s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                              }}
                              onMouseEnter={(e) => {
                                if (submittingActivity !== id)
                                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "";
                              }}
                            >
                              {submittingActivity === id ? "Saving… ⏳" : labels[id]}
                            </button>
                          )}
                          {completedActivities[id] && (
                            <div style={{ marginTop:12, background:"#d5f5e3", borderRadius:14, padding:"12px 16px", textAlign:"center", fontSize:13, fontWeight:800, color:"#1a6a3a" }}>
                              🎉 Activity complete!
                            </div>
                          )}
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                ) : null}

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleNextStory}
                    disabled={Boolean(data && !ACTIVITY_TABS.every((t) => completedActivities[t.id]))}
                    title={data && !ACTIVITY_TABS.every((t) => completedActivities[t.id]) ? "Submit every activity for this story first." : undefined}
                    style={{
                      background: ACTIVITY_TABS.every((t) => completedActivities[t.id])
                        ? "linear-gradient(135deg,#5bb8f5,#3498DB)"
                        : "rgba(255,255,255,.7)",
                      color: ACTIVITY_TABS.every((t) => completedActivities[t.id]) ? "#fff" : "#888",
                      border: "2px solid rgba(255,255,255,.6)",
                      borderRadius: 16,
                      padding: "13px 32px",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: ACTIVITY_TABS.every((t) => completedActivities[t.id]) ? "pointer" : "not-allowed",
                      fontFamily: "'Nunito','Sniglet',sans-serif",
                      boxShadow: ACTIVITY_TABS.every((t) => completedActivities[t.id]) ? "0 5px 0 0 rgba(52,152,219,.4)" : "none",
                      opacity: ACTIVITY_TABS.every((t) => completedActivities[t.id]) ? 1 : 0.6,
                      transition: "transform .15s",
                    }}
                    onMouseEnter={(e) => {
                      if (ACTIVITY_TABS.every((t) => completedActivities[t.id]))
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "";
                    }}
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
