import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft } from "lucide-react";
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

const ACTIVITY_CARD_STYLES: Record<string, string> = {
  vocabulary: "bg-amber-100/90 border-amber-300/55",
  "compare-contrast": "bg-cyan-100/85 border-cyan-300/50",
  "fact-opinion": "bg-rose-100/85 border-rose-300/50",
  summaries: "bg-lime-100/85 border-lime-300/50",
  "character-traits": "bg-violet-100/85 border-violet-300/50",
};

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

/** A story counts only when every activity has a perfect completion. */
function isStoryFullyAttempted(records: StoryRecord[]): boolean {
  return ALL_ACTIVITIES.every((activity) =>
    records.some((r) => r.activityType === activity && r.perfect),
  );
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
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-10 md:space-y-12">
          {/* Scores by activity */}
          <div className="space-y-4 rounded-2xl bg-white/75 backdrop-blur-md border border-white/45 p-6 md:p-8 shadow-sm">
            <h2 className="font-heading text-xl font-bold tracking-tight text-violet-950">
              Scores by activity 🚀
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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
                      "flex flex-col gap-2 justify-between min-h-[5.5rem] p-4 rounded-xl border backdrop-blur-sm shadow-sm",
                      ACTIVITY_CARD_STYLES[actType] ?? "bg-white/40 border-white/45",
                    )}
                  >
                    <span className="font-heading font-semibold text-violet-950 text-sm leading-snug">
                      {ACTIVITY_LABELS[actType]}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-violet-900/80">
                      <span>{totalStories} stories</span>
                      <span>{accuracy}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Garden */}
          <div className="space-y-4 rounded-2xl bg-teal-100/55 backdrop-blur-md border border-teal-300/45 p-6 md:p-8 shadow-sm">
            <h2 className="font-heading text-xl font-bold tracking-tight text-violet-950">
              My Garden 🌸
            </h2>
            <Garden currentStage={gameState.currentStage} flowers={gameState.flowers} />
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}
