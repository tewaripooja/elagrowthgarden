import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft, Star, Trophy, Flower2, BookOpen } from "lucide-react";
import Garden from "@/components/Garden";
import { Button } from "@/components/ui/button";
import { useGameState, type StoryRecord } from "@/hooks/useGameState";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { cn } from "@/lib/utils";

const ACTIVITY_LABELS: Record<string, string> = {
  vocabulary: "📚 Vocabulary",
  "compare-contrast": "🔄 Compare & Contrast",
  "fact-opinion": "🔍 Fact vs Opinion",
  summaries: "📝 Summaries",
  "character-traits": "🧑 Character Traits",
};

const ALL_ACTIVITIES = ["vocabulary", "compare-contrast", "fact-opinion", "summaries", "character-traits"];

const STAT_CARD_STYLES = [
  "bg-amber-200/55 border-amber-300/50 shadow-sm",
  "bg-fuchsia-200/50 border-fuchsia-300/45 shadow-sm",
  "bg-emerald-200/50 border-emerald-300/45 shadow-sm",
  "bg-sky-200/55 border-sky-300/50 shadow-sm",
] as const;

const ACTIVITY_CARD_STYLES: Record<string, string> = {
  vocabulary: "bg-amber-100/90 border-amber-300/55",
  "compare-contrast": "bg-cyan-100/85 border-cyan-300/50",
  "fact-opinion": "bg-rose-100/85 border-rose-300/50",
  summaries: "bg-lime-100/85 border-lime-300/50",
  "character-traits": "bg-violet-100/85 border-violet-300/50",
};

const RECENT_ROW_PALETTE = [
  "bg-orange-100/80 border-orange-300/45",
  "bg-indigo-100/75 border-indigo-300/45",
  "bg-pink-100/80 border-pink-300/45",
  "bg-teal-100/75 border-teal-300/45",
  "bg-yellow-100/70 border-yellow-300/45",
] as const;

/** Group history rows that belong to one loaded story (same session). */
function groupRecordsByStory(history: StoryRecord[]): Map<string, StoryRecord[]> {
  const map = new Map<string, StoryRecord[]>();
  history.forEach((r) => {
    const list = map.get(r.storyKey) ?? [];
    list.push(r);
    map.set(r.storyKey, list);
  });
  return map;
}

/** A story counts only after Submit on every activity tab (all question sets attempted). */
function isStoryFullyAttempted(records: StoryRecord[]): boolean {
  const types = new Set(records.map((r) => r.activityType));
  return ALL_ACTIVITIES.every((t) => types.has(t));
}

/** storyKeys where the learner submitted all five activities. */
function completeStoryKeys(history: StoryRecord[]): Set<string> {
  const groups = groupRecordsByStory(history);
  const complete = new Set<string>();
  groups.forEach((records, key) => {
    if (isStoryFullyAttempted(records)) complete.add(key);
  });
  return complete;
}

/** Total correct ÷ total questions, only for rows belonging to complete stories. */
function scorePercentForCompleteStories(history: StoryRecord[], completeKeys: Set<string>): number {
  const filtered = history.filter((r) => completeKeys.has(r.storyKey));
  if (filtered.length === 0) return 0;
  const c = filtered.reduce((s, r) => s + r.correctAnswers, 0);
  const t = filtered.reduce((s, r) => s + r.totalQuestions, 0);
  if (t <= 0) return 0;
  return Math.round((c / t) * 100);
}

/** Same score logic for one activity type, complete stories only. */
function activityScorePercentForCompleteStories(
  history: StoryRecord[],
  activityType: string,
  completeKeys: Set<string>,
): number {
  const filtered = history.filter((r) => completeKeys.has(r.storyKey) && r.activityType === activityType);
  if (filtered.length === 0) return 0;
  const c = filtered.reduce((s, r) => s + r.correctAnswers, 0);
  const t = filtered.reduce((s, r) => s + r.totalQuestions, 0);
  if (t <= 0) return 0;
  return Math.round((c / t) * 100);
}

export default function Progress() {
  const navigate = useNavigate();
  const gameState = useGameState();

  const completeKeys = completeStoryKeys(gameState.storyHistory);
  const totalStories = completeKeys.size;
  const overallAccuracy = scorePercentForCompleteStories(gameState.storyHistory, completeKeys);

  return (
    <DynamicSky>
      <div className={cn("min-h-screen w-full flex flex-col pb-10", PAGE_SHELL_GRADIENT)}>
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-6 border-b border-white/25">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="min-h-[48px] rounded-2xl font-heading bg-white/20 hover:bg-white/30 text-white border-0 shadow-none"
            >
              <ArrowLeft className="h-5 w-5 mr-1" /> Home
            </Button>
            <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              My Progress 🏆
            </h1>
          </div>
          <div className="mt-3 flex items-center gap-2 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]">
            <Trophy className="h-6 w-6 text-amber-300 shrink-0" aria-hidden />
            <span className="font-heading text-lg md:text-xl font-semibold tracking-tight">
              Grade {gameState.level}
            </span>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-10 md:space-y-12">
          {/* Stats — four cards, each with its own color */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div
              className={cn(
                "flex flex-col items-center text-center rounded-2xl border backdrop-blur-sm px-3 py-5 md:py-6",
                STAT_CARD_STYLES[0],
              )}
            >
              <Star className="h-8 w-8 text-amber-600 mb-2 drop-shadow-sm" />
              <span className="font-heading text-3xl font-bold text-violet-950">{gameState.stars}</span>
              <span className="text-sm text-violet-900/75 mt-1">Stars Earned</span>
            </div>
            <div
              className={cn(
                "flex flex-col items-center text-center rounded-2xl border backdrop-blur-sm px-3 py-5 md:py-6",
                STAT_CARD_STYLES[1],
              )}
            >
              <Flower2 className="h-8 w-8 text-fuchsia-600 mb-2 drop-shadow-sm" />
              <span className="font-heading text-3xl font-bold text-violet-950">{gameState.flowers}</span>
              <span className="text-sm text-violet-900/75 mt-1">Flowers Grown</span>
            </div>
            <div
              className={cn(
                "flex flex-col items-center text-center rounded-2xl border backdrop-blur-sm px-3 py-5 md:py-6",
                STAT_CARD_STYLES[2],
              )}
              title="Percent of correct answers among all questions in stories where every activity was submitted."
            >
              <Trophy className="h-8 w-8 text-emerald-700 mb-2 drop-shadow-sm" />
              <span className="font-heading text-3xl font-bold text-violet-950">{overallAccuracy}%</span>
              <span className="text-sm text-violet-900/75 mt-1">Score</span>
            </div>
            <div
              className={cn(
                "flex flex-col items-center text-center rounded-2xl border backdrop-blur-sm px-3 py-5 md:py-6",
                STAT_CARD_STYLES[3],
              )}
              title="Stories where you submitted every activity (all question sets attempted)."
            >
              <BookOpen className="h-8 w-8 text-sky-800 mb-2 drop-shadow-sm" />
              <span className="font-heading text-3xl font-bold text-violet-950">{totalStories}</span>
              <span className="text-sm text-violet-900/75 mt-1">Complete stories</span>
            </div>
          </div>

          {/* Per-activity scores */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold tracking-tight text-white drop-shadow-md">
              Scores by activity 🚀
            </h2>
            <div className="space-y-3">
              {ALL_ACTIVITIES.map((actType) => {
                const accuracy = activityScorePercentForCompleteStories(
                  gameState.storyHistory,
                  actType,
                  completeKeys,
                );
                return (
                  <div
                    key={actType}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-xl border backdrop-blur-sm shadow-sm",
                      ACTIVITY_CARD_STYLES[actType] ?? "bg-white/40 border-white/45",
                    )}
                  >
                    <span className="font-heading font-semibold text-violet-950">
                      {ACTIVITY_LABELS[actType]}
                    </span>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-violet-900/80">
                      <span>{totalStories} stories</span>
                      <span>{accuracy}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent History */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold tracking-tight text-white drop-shadow-md">
              Recent Stories 📖
            </h2>
            {gameState.storyHistory.length === 0 ? (
              <p className="text-violet-950/90 text-center py-6 rounded-xl bg-orange-50/85 backdrop-blur-sm border border-orange-200/50 shadow-sm">
                Your story history will appear here! 🌟
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {[...gameState.storyHistory].reverse().slice(0, 20).map((record, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl border backdrop-blur-sm shadow-sm",
                      record.perfect
                        ? "bg-emerald-200/65 border-emerald-400/55"
                        : RECENT_ROW_PALETTE[i % RECENT_ROW_PALETTE.length],
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-violet-800 shrink-0" />
                      <span className="font-heading text-sm text-violet-950">
                        {ACTIVITY_LABELS[record.activityType] || record.activityType}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm pl-7 sm:pl-0">
                      <span className={record.perfect ? "text-emerald-800 font-bold" : "text-violet-900/75"}>
                        {record.correctAnswers}/{record.totalQuestions}
                        {record.perfect && " ⭐"}
                      </span>
                      <span className="text-xs text-violet-900/60">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Garden */}
          <div className="space-y-4 rounded-2xl bg-teal-100/55 backdrop-blur-md border border-teal-300/45 p-6 md:p-8 shadow-sm">
            <h2 className="font-heading text-xl font-bold tracking-tight text-violet-950">
              My Garden 🌸
            </h2>
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
