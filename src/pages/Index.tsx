import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Trophy } from "lucide-react";
import DynamicSky from "@/components/DynamicSky";

export default function Index() {
  const navigate = useNavigate();

  return (
    <DynamicSky>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-accent" />
            <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              The ELA Growth Garden
            </h1>
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <p className="text-lg text-white/90 max-w-lg mx-auto leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            Read fun stories, answer questions, and watch your garden grow! 🌸
          </p>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col items-center gap-6 max-w-md w-full">
          <button
            onClick={() => navigate("/activity")}
            className="bg-primary text-white clay-button rounded-3xl p-8
              flex flex-col items-center gap-4 w-full shadow-lg"
          >
            <BookOpen className="h-12 w-12" />
            <span className="font-heading text-2xl font-bold tracking-tight">Start Reading 📖</span>
            <span className="text-sm opacity-80 font-normal leading-relaxed">
              Read a story, then try Vocabulary, Fact vs Opinion, Summaries, Character Traits & Compare & Contrast!
            </span>
          </button>

          <button
            onClick={() => navigate("/progress")}
            className="clay-button bg-garden-warning text-primary-foreground px-8 py-4 rounded-3xl font-heading text-lg flex items-center gap-2"
          >
            <Trophy className="h-6 w-6" />
            My Progress 🏆
          </button>
        </div>

        <p className="mt-6 text-sm text-white/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          For readers ages 7–10 · Grades 2–5
        </p>
      </div>
    </DynamicSky>
  );
}
