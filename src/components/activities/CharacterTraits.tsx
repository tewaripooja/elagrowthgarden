import { useState } from "react";
import { CharacterTraitsData } from "@/lib/ai";
import { Button } from "@/components/ui/button";

interface Props {
  data: CharacterTraitsData;
  onCorrect: () => void;
}

export default function CharacterTraits({ data, onCorrect }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(data.questions.length).fill(null));
  const [checked, setChecked] = useState<(boolean | null)[]>(Array(data.questions.length).fill(null));

  const handleSelect = (qIndex: number, optIndex: number) => {
    if (checked[qIndex] !== null) return;

    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);

    const isCorrect = optIndex === data.questions[qIndex].correctIndex;
    const newChecked = [...checked];
    newChecked[qIndex] = isCorrect;
    setChecked(newChecked);

    if (isCorrect) onCorrect();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h3 className="font-heading text-lg mb-3 text-foreground">📖 Read the Story</h3>
        <p className="font-body text-base leading-relaxed text-foreground">{data.story}</p>
      </div>

      <div className="space-y-5">
        <h3 className="font-heading text-lg text-foreground">🧑 Character Traits</h3>
        {data.questions.map((q, qi) => (
          <div key={qi} className="bg-card rounded-xl p-4 border border-border">
            <p className="font-heading text-sm mb-3 text-foreground">{q.question}</p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, oi) => {
                let variant: "outline" | "default" | "destructive" = "outline";
                if (answers[qi] === oi) variant = checked[qi] ? "default" : "destructive";
                else if (checked[qi] !== null && oi === q.correctIndex) variant = "default";

                return (
                  <Button
                    key={oi}
                    variant={variant}
                    onClick={() => handleSelect(qi, oi)}
                    disabled={checked[qi] !== null}
                    className="rounded-xl font-body text-left justify-start h-auto py-3"
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>
            {checked[qi] !== null && (
              <p className={`mt-2 text-sm font-body ${checked[qi] ? "text-primary" : "text-destructive"}`}>
                {checked[qi] ? "You got it! 🌟" : `The answer is: ${q.options[q.correctIndex]}`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
