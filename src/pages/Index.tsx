import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Trophy, BookA, GitCompareArrows, CheckCircle, FileText, Users } from "lucide-react";
import DynamicSky from "@/components/DynamicSky";

const activities = [
  { icon: BookA, label: "Vocabulary", emoji: "📚", color: "bg-primary" },
  { icon: CheckCircle, label: "Fact vs Opinion", emoji: "✅", color: "bg-garden-success" },
  { icon: FileText, label: "Summaries", emoji: "📝", color: "bg-garden-info" },
  { icon: Users, label: "Character Traits", emoji: "🎭", color: "bg-accent" },
  { icon: GitCompareArrows, label: "Compare & Contrast", emoji: "🔀", color: "bg-garden-warning" },
];

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
              flex flex-col items-center gap-4 w-full shadow-lg hover:scale-105 transition-transform duration-200"
          >
            <BookOpen className="h-12 w-12" />
            <span className="font-heading text-2xl font-bold tracking-tight">Start Reading 📖</span>
            <span className="text-sm opacity-80 font-normal leading-relaxed">
              Read a story, then practice all 5 activities below!
            </span>
          </button>
        </div>

        {/* Activity Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-8 max-w-3xl w-full">
          {activities.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate("/activity")}
              className={`${a.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer`}
            >
              <a.icon className="h-7 w-7" />
              <span className="font-heading text-xs font-bold text-center leading-tight">{a.label}</span>
              <span className="text-lg">{a.emoji}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <button
            onClick={() => navigate("/progress")}
            className="clay-button bg-garden-warning text-primary-foreground px-8 py-4 rounded-3xl font-heading text-lg flex items-center gap-2 hover:scale-105 transition-transform duration-200"
          >
            <Trophy className="h-6 w-6" />
            My Progress 🏆
          </button>

          <p className="text-sm text-white/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            For readers ages 7–10 · Grades 2–5
          </p>
        </div>
      </div>
    </DynamicSky>
  );
}