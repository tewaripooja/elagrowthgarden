/** Fixed kid-friendly genres — same list for every path into Story Time. */
export const STORY_GENRES = [
  {
    id: "adventure",
    label: "Adventure",
    hint: "Quests & discoveries",
    emoji: "🗺️",
    tileClass:
      "bg-gradient-to-br from-amber-300 via-orange-300 to-yellow-200 border-2 border-white/80 shadow-[0_6px_0_0_rgba(234,88,12,0.25)] hover:shadow-[0_8px_0_0_rgba(234,88,12,0.35)] text-amber-950",
  },
  {
    id: "fantasy-magic",
    label: "Fantasy & Magic",
    hint: "Wizards & wonder",
    emoji: "🪄",
    tileClass:
      "bg-gradient-to-br from-violet-300 via-fuchsia-300 to-pink-200 border-2 border-white/80 shadow-[0_6px_0_0_rgba(147,51,234,0.3)] hover:shadow-[0_8px_0_0_rgba(147,51,234,0.4)] text-violet-950",
  },
  {
    id: "mystery",
    label: "Mystery",
    hint: "Clues & puzzles",
    emoji: "🔍",
    tileClass:
      "bg-gradient-to-br from-sky-300 via-indigo-300 to-blue-200 border-2 border-white/80 shadow-[0_6px_0_0_rgba(37,99,235,0.28)] hover:shadow-[0_8px_0_0_rgba(37,99,235,0.38)] text-indigo-950",
  },
  {
    id: "humor",
    label: "Silly & Funny",
    hint: "Laugh-out-loud fun",
    emoji: "😂",
    tileClass:
      "bg-gradient-to-br from-yellow-300 via-lime-200 to-amber-200 border-2 border-white/80 shadow-[0_6px_0_0_rgba(202,138,4,0.3)] hover:shadow-[0_8px_0_0_rgba(202,138,4,0.42)] text-yellow-950",
  },
  {
    id: "animals",
    label: "Animals & Nature",
    hint: "Creatures big & small",
    emoji: "🦊",
    tileClass:
      "bg-gradient-to-br from-emerald-300 via-green-300 to-lime-200 border-2 border-white/80 shadow-[0_6px_0_0_rgba(22,163,74,0.28)] hover:shadow-[0_8px_0_0_rgba(22,163,74,0.4)] text-emerald-950",
  },
  {
    id: "sci-fi",
    label: "Space & Science",
    hint: "Future & experiments",
    emoji: "🚀",
    tileClass:
      "bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-300 border-2 border-white/80 shadow-[0_6px_0_0_rgba(14,165,233,0.35)] hover:shadow-[0_8px_0_0_rgba(14,165,233,0.45)] text-sky-950",
  },
] as const;
