import { useState } from "react";
import { SummariesData } from "@/lib/ai";
import { Button } from "@/components/ui/button";

interface Props {
  data: SummariesData;
  onCorrect: () => void;
}

export default function Summaries({ data, onCorrect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = data.options[index].correct;
    setIsCorrect(correct);
    if (correct) onCorrect();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h3 className="font-heading text-lg mb-3 text-foreground">📖 Read the Story</h3>
        <p className="font-body text-base leading-relaxed text-foreground">{data.story}</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-lg text-foreground">📝 Pick the Best Summary</h3>
        {data.options.map((opt, i) => {
          let variant: "outline" | "default" | "destructive" = "outline";
          if (selected === i) variant = isCorrect ? "default" : "destructive";
          else if (selected !== null && opt.correct) variant = "default";

          return (
            <Button
              key={i}
              variant={variant}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className="rounded-xl font-body text-left w-full h-auto py-4 px-5 whitespace-normal"
            >
              {opt.text}
            </Button>
          );
        })}
        {isCorrect !== null && (
          <p className={`text-sm font-body ${isCorrect ? "text-primary" : "text-destructive"}`}>
            {isCorrect ? "Perfect summary! 🌟" : "Not quite — the highlighted one is the best summary."}
          </p>
        )}
      </div>
    </div>
  );
}
