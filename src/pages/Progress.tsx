import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft, Star, Trophy, Flower2, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameState, type StoryRecord } from "@/hooks/useGameState";

const ACTIVITY_LABELS: Record<string, string> = {
  vocabulary: "📚 Vocabulary",
  "compare-contrast": "🔄 Compare & Contrast",
  "fact-opinion": "🔍 Fact vs Opinion",
  summaries: "📝 Summaries",
  "character-traits": "🧑 Character Traits",
};

export default function Progress() {
  const navigate = useNavigate();
  const gameState = useGameState();

  const perfectCount = gameState.storyHistory.filter((s) => s.perfect).length;
  const totalStories = gameState.storyHistory.length;
  const overallAccuracy = totalStories > 0
    ? Math.round(
        (gameState.storyHistory.reduce((sum, s) => sum + s.correctAnswers, 0) /
          gameState.storyHistory.reduce((sum, s) => sum + s.totalQuestions, 0)) *
          100
      )
    : 0;

  // Group stories by activity type for breakdown
  const byActivity = gameState.storyHistory.reduce<Record<string, StoryRecord[]>>((acc, s) => {
    acc[s.activityType] = acc[s.activityType] || [];
    acc[s.activityType].push(s);
    return acc;
  }, {});

  return (
    <DynamicSky>
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="clay-button min-h-[48px] rounded-2xl font-heading"
            >
              <ArrowLeft className="h-5 w-5 mr-1" /> Home
            </Button>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              My Progress 🏆
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="clay-card p-5 flex flex-col items-center text-center">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <span className="font-heading text-3xl font-bold text-foreground">{gameState.level}</span>
              <span className="text-sm text-muted-foreground">Grade Level</span>
            </div>
            <div className="clay-card p-5 flex flex-col items-center text-center">
              <Star className="h-8 w-8 text-garden-warning mb-2" />
              <span className="font-heading text-3xl font-bold text-foreground">{gameState.stars}</span>
              <span className="text-sm text-muted-foreground">Stars Earned</span>
            </div>
            <div className="clay-card p-5 flex flex-col items-center text-center">
              <Flower2 className="h-8 w-8 text-garden-pink mb-2" />
              <span className="font-heading text-3xl font-bold text-foreground">{gameState.flowers}</span>
              <span className="text-sm text-muted-foreground">Flowers Grown</span>
            </div>
            <div className="clay-card p-5 flex flex-col items-center text-center">
              <Trophy className="h-8 w-8 text-garden-success mb-2" />
              <span className="font-heading text-3xl font-bold text-foreground">{overallAccuracy}%</span>
              <span className="text-sm text-muted-foreground">Accuracy</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="clay-card p-6 mb-8">
            <h2 className="font-heading text-xl font-bold text-foreground mb-3">
              Level Up Progress 🚀
            </h2>
            <p className="text-muted-foreground mb-3">
              Get 100% on 5 stories in a row to reach Grade {Math.min(gameState.level + 1, 5)}!
            </p>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      i < gameState.perfectStreak
                        ? "bg-garden-success text-primary-foreground scale-110"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < gameState.perfectStreak ? "⭐" : (i + 1)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {gameState.perfectStreak}/5 perfect stories
              </span>
            </div>
            {gameState.level >= 5 && (
              <p className="mt-3 text-garden-success font-heading font-bold">
                🎉 You've reached the highest level! Amazing work!
              </p>
            )}
          </div>

          {/* Activity Breakdown */}
          <div className="clay-card p-6 mb-8">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">
              Activity Breakdown 📊
            </h2>
            {Object.keys(byActivity).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No stories completed yet. Go try an activity! 🌱
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byActivity).map(([type, records]) => {
                  const perfect = records.filter((r) => r.perfect).length;
                  const total = records.length;
                  return (
                    <div key={type} className="flex items-center justify-between p-3 rounded-2xl bg-muted/50">
                      <span className="font-heading font-semibold text-foreground">
                        {ACTIVITY_LABELS[type] || type}
                      </span>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{total} stories</span>
                        <span className="text-garden-success font-bold">{perfect} perfect</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent History */}
          <div className="clay-card p-6">
            <h2 className="font-heading text-xl font-bold text-foreground mb-4">
              Recent Stories 📖
            </h2>
            {gameState.storyHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Your story history will appear here! 🌟
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {[...gameState.storyHistory].reverse().slice(0, 20).map((record, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-2xl ${
                      record.perfect ? "bg-garden-success/10 border border-garden-success/30" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-heading text-sm text-foreground">
                        {ACTIVITY_LABELS[record.activityType] || record.activityType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">Grade {record.level}</span>
                      <span className={record.perfect ? "text-garden-success font-bold" : "text-muted-foreground"}>
                        {record.correctAnswers}/{record.totalQuestions}
                        {record.perfect && " ⭐"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}
