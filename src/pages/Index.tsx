import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Trophy, BookA, GitCompareArrows, CheckCircle, FileText, Users } from "lucide-react";
import DynamicSky from "@/components/DynamicSky";
import type { ActivityType } from "@/lib/ai";
import { STORY_GENRES } from "@/lib/storyGenres";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { cn } from "@/lib/utils";

/** Which Story Time tab to open first (genres are chosen on the next screen). */
const ACTIVITY_TAB_BY_LABEL: Record<string, ActivityType> = {
  Reading: "vocabulary",
  Vocabulary: "vocabulary",
  "Fact vs Opinion": "fact-opinion",
  Summaries: "summaries",
  "Character Traits": "character-traits",
  "Compare & Contrast": "compare-contrast",
};

/** Tile colors match the genre picker grid (same order as STORY_GENRES). */
const activities = [
  { icon: BookOpen, label: "Reading", emoji: "📖", genreIndex: 0 },
  { icon: BookA, label: "Vocabulary", emoji: "📚", genreIndex: 1 },
  { icon: CheckCircle, label: "Fact vs Opinion", emoji: "✅", genreIndex: 2 },
  { icon: FileText, label: "Summaries", emoji: "📝", genreIndex: 3 },
  { icon: Users, label: "Character Traits", emoji: "🎭", genreIndex: 4 },
  { icon: GitCompareArrows, label: "Compare & Contrast", emoji: "🔀", genreIndex: 5 },
] as const;

export default function Index() {
  const navigate = useNavigate();

  return (
    <DynamicSky>
      <div className={cn("min-h-screen w-full flex flex-col", PAGE_SHELL_GRADIENT)}>
        <div className="w-full max-w-4xl mx-auto px-4 py-10 md:py-16 flex flex-col gap-8 md:gap-10 flex-1 justify-center">
          <div className="flex justify-center gap-2 text-4xl drop-shadow-lg saturate-150" aria-hidden>
            <span className="[filter:drop-shadow(0_0_8px_rgba(255,255,255,0.8))]">✨</span>
            <span>🌈</span>
            <span className="[filter:drop-shadow(0_0_8px_rgba(255,255,255,0.8))]">✨</span>
          </div>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.9)] shrink-0" />
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.25)] [text-shadow:0_0_24px_rgba(255,255,255,0.35)]">
                ELA Growth Garden
              </h1>
              <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-cyan-200 drop-shadow-[0_0_12px_rgba(103,232,249,0.95)] shrink-0" />
            </div>
            <p className="text-base md:text-lg text-cyan-50 max-w-lg mx-auto leading-relaxed font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.2)]">
              Read fun stories, answer questions, and watch your garden grow! 🌸
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 w-full saturate-125">
            {activities.map((a) => {
              const tileClass = STORY_GENRES[a.genreIndex]?.tileClass ?? STORY_GENRES[0].tileClass;
              return (
                <button
                  key={a.label}
                  type="button"
                  onClick={() =>
                    navigate("/activity", {
                      state: {
                        activityTab: ACTIVITY_TAB_BY_LABEL[a.label] ?? "vocabulary",
                        /** Reading is browse-first; stars require a chosen activity (see Activity page). */
                        fromReading: a.label === "Reading",
                      },
                    })
                  }
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl p-4 text-center min-h-[120px] md:min-h-[128px] transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] hover:-translate-y-0.5 ${tileClass}`}
                >
                  <a.icon className="h-9 w-9 md:h-10 md:w-10 shrink-0 drop-shadow-sm opacity-95" strokeWidth={2.25} />
                  <span className="font-heading text-sm md:text-base font-bold leading-tight drop-shadow-sm">
                    {a.label}
                  </span>
                  <span className="text-2xl" aria-hidden>
                    {a.emoji}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/progress")}
              className="rounded-2xl px-8 py-4 font-heading text-lg flex items-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] bg-gradient-to-br from-lime-300 via-yellow-300 to-emerald-400 border-2 border-white shadow-[0_6px_0_0_rgba(34,197,94,0.45),0_0_24px_rgba(250,204,21,0.45)] hover:shadow-[0_8px_0_0_rgba(22,163,74,0.55),0_0_32px_rgba(250,204,21,0.55)] text-emerald-950 font-bold"
            >
              <Trophy className="h-6 w-6" />
              My Progress 🏆
            </button>
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}