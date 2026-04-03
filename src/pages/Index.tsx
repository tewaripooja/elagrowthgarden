import { useNavigate } from "react-router-dom";
import { BookOpen, GitCompareArrows, Scale, FileText, Users } from "lucide-react";

const activities = [
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen, color: "bg-primary hover:bg-primary/90", emoji: "📚" },
  { id: "compare-contrast", label: "Compare & Contrast", icon: GitCompareArrows, color: "bg-accent hover:bg-accent/90", emoji: "🔄" },
  { id: "fact-opinion", label: "Fact vs Opinion", icon: Scale, color: "bg-garden-purple hover:opacity-90", emoji: "🔍" },
  { id: "summaries", label: "Summaries", icon: FileText, color: "bg-garden-orange hover:opacity-90", emoji: "📝" },
  { id: "character-traits", label: "Character Traits", icon: Users, color: "bg-garden-pink hover:opacity-90", emoji: "🧑" },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-3">
          🌱 The ELA Growth Garden
        </h1>
        <p className="font-body text-lg text-muted-foreground max-w-md mx-auto">
          Read fun stories, answer questions, and watch your garden grow! 🌸
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-3xl w-full">
        {activities.map((a) => (
          <button
            key={a.id}
            onClick={() => navigate(`/activity/${a.id}`)}
            className={`${a.color} text-primary-foreground rounded-2xl p-6 shadow-lg 
              transition-all duration-200 hover:scale-105 hover:shadow-xl
              flex flex-col items-center gap-3 min-h-[140px] justify-center`}
          >
            <span className="text-3xl">{a.emoji}</span>
            <span className="font-heading text-lg font-semibold">{a.label}</span>
          </button>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted-foreground font-body">
        For readers ages 7–10 · Grades 2–5
      </p>
    </div>
  );
}
