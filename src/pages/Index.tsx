import { useNavigate } from "react-router-dom";
import { BookOpen, GitCompareArrows, Scale, FileText, Users, Sparkles } from "lucide-react";
import DynamicSky from "@/components/DynamicSky";

const activities = [
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen, bg: "bg-primary", emoji: "📚", desc: "Learn new words!" },
  { id: "compare-contrast", label: "Compare & Contrast", icon: GitCompareArrows, bg: "bg-secondary", emoji: "🔄", desc: "Spot the differences!" },
  { id: "fact-opinion", label: "Fact vs Opinion", icon: Scale, bg: "bg-garden-purple", emoji: "🔍", desc: "True or thought?" },
  { id: "summaries", label: "Summaries", icon: FileText, bg: "bg-accent", emoji: "📝", desc: "Sum it up!" },
  { id: "character-traits", label: "Character Traits", icon: Users, bg: "bg-garden-pink", emoji: "🧑", desc: "Who are they?" },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <DynamicSky>
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="h-8 w-8 text-accent" />
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground">
            The ELA Growth Garden
          </h1>
          <Sparkles className="h-8 w-8 text-accent" />
        </div>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Read fun stories, answer questions, and watch your garden grow! 🌸
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl w-full">
        {activities.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              onClick={() => navigate(`/activity/${a.id}`)}
              className={`${a.bg} text-primary-foreground clay-button rounded-3xl p-6
                flex flex-col items-center gap-3 min-h-[160px] justify-center
                hover:animate-micro-bounce`}
            >
              <div className="flex items-center gap-2">
                <span className="text-4xl">{a.emoji}</span>
                <Icon className="h-7 w-7 opacity-80" />
              </div>
              <span className="font-heading text-xl font-semibold">{a.label}</span>
              <span className="text-sm opacity-80 font-normal">{a.desc}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        For readers ages 7–10 · Grades 2–5
      </p>
    </div>
    </DynamicSky>
  );
}
