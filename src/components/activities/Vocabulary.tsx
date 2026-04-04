import { useState } from "react";
import { VocabularyData } from "@/lib/ai";
import { Button } from "@/components/ui/button";

interface Props {
  data: VocabularyData;
  onCorrect: (earnStar?: boolean) => void;
}

export default function Vocabulary({ data, onCorrect }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(data.words.length).fill(null));
  const [checked, setChecked] = useState<(boolean | null)[]>(Array(data.words.length).fill(null));

  const highlightStory = (story: string, words: { word: string }[]) => {
    let result = story;
    words.forEach(({ word }) => {
      const regex = new RegExp(`\\b(${word})\\b`, "gi");
      result = result.replace(regex, `<strong class="text-accent font-bold">$1</strong>`);
    });
    return result;
  };

  const handleSelect = (wordIndex: number, optIndex: number) => {
    if (checked[wordIndex] !== null) return;

    const newAnswers = [...answers];
    newAnswers[wordIndex] = optIndex;
    setAnswers(newAnswers);

    const isCorrect = optIndex === data.words[wordIndex].correctIndex;
    const newChecked = [...checked];
    newChecked[wordIndex] = isCorrect;
    setChecked(newChecked);

    if (isCorrect) onCorrect(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h3 className="font-heading text-lg mb-3 text-foreground">📖 Read the Story</h3>
        <p
          className="font-body text-base leading-relaxed text-foreground"
          dangerouslySetInnerHTML={{ __html: highlightStory(data.story, data.words) }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-heading text-lg text-foreground">📝 What do these words mean?</h3>
        {data.words.map((w, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border">
            <p className="font-heading text-base mb-3 text-accent">{w.word}</p>
            <div className="grid grid-cols-1 gap-2">
              {w.options.map((opt, oi) => {
                let variant: "outline" | "default" | "destructive" = "outline";
                if (answers[i] === oi) variant = checked[i] ? "default" : "destructive";
                else if (checked[i] !== null && oi === w.correctIndex) variant = "default";

                return (
                  <Button
                    key={oi}
                    variant={variant}
                    onClick={() => handleSelect(i, oi)}
                    disabled={checked[i] !== null}
                    className="rounded-xl font-body text-left justify-start h-auto py-3"
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>
            {checked[i] !== null && (
              <p className={`mt-2 text-sm font-body ${checked[i] ? "text-primary" : "text-destructive"}`}>
                {checked[i] ? "Great job! ⭐" : `The correct meaning is: ${w.options[w.correctIndex]}`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
