import { useState } from "react";
import { FactOpinionData } from "@/lib/ai";
import { Button } from "@/components/ui/button";

interface Props {
  data: FactOpinionData;
  onCorrect: () => void;
}

export default function FactOpinion({ data, onCorrect }: Props) {
  const [answers, setAnswers] = useState<(string | null)[]>(Array(data.statements.length).fill(null));
  const [checked, setChecked] = useState<(boolean | null)[]>(Array(data.statements.length).fill(null));

  const handleSelect = (index: number, choice: "fact" | "opinion") => {
    if (checked[index] !== null) return;

    const newAnswers = [...answers];
    newAnswers[index] = choice;
    setAnswers(newAnswers);

    const isCorrect = choice === data.statements[index].type;
    const newChecked = [...checked];
    newChecked[index] = isCorrect;
    setChecked(newChecked);

    if (isCorrect) onCorrect();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h3 className="font-heading text-lg mb-3 text-foreground">📖 Read the Story</h3>
        <p className="font-body text-base leading-relaxed text-foreground">{data.story}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-heading text-lg text-foreground">🔍 Fact or Opinion?</h3>
        {data.statements.map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border">
            <p className="font-body text-sm mb-3 text-foreground">"{s.text}"</p>
            <div className="flex gap-3">
              <Button
                variant={answers[i] === "fact" ? (checked[i] ? "default" : "destructive") : "outline"}
                onClick={() => handleSelect(i, "fact")}
                disabled={checked[i] !== null}
                className="rounded-xl font-heading flex-1"
              >
                📋 Fact
              </Button>
              <Button
                variant={answers[i] === "opinion" ? (checked[i] ? "default" : "destructive") : "outline"}
                onClick={() => handleSelect(i, "opinion")}
                disabled={checked[i] !== null}
                className="rounded-xl font-heading flex-1"
              >
                💭 Opinion
              </Button>
            </div>
            {checked[i] !== null && (
              <p className={`mt-2 text-sm font-body ${checked[i] ? "text-primary" : "text-destructive"}`}>
                {checked[i] ? "Correct! 🌟" : `This is a ${s.type}. Keep trying!`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
