import { useState } from "react";
import { VocabularyData } from "@/lib/ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  data: VocabularyData;
  onCorrect: (earnStar?: boolean) => void;
}

export default function Vocabulary({ data, onCorrect }: Props) {
  const [answers, setAnswers] = useState<string[]>(Array(data.words.length).fill(""));
  const [checked, setChecked] = useState<(boolean | null)[]>(Array(data.words.length).fill(null));
  const [feedback, setFeedback] = useState<string[]>(Array(data.words.length).fill(""));

  const highlightStory = (story: string, words: { word: string }[]) => {
    let result = story;
    words.forEach(({ word }) => {
      const regex = new RegExp(`\\b(${word})\\b`, "gi");
      result = result.replace(regex, `<strong class="text-accent font-bold">$1</strong>`);
    });
    return result;
  };

  const checkAnswer = (index: number) => {
    const userAnswer = answers[index].trim().toLowerCase();
    const correctMeaning = data.words[index].meaning.toLowerCase();
    // Simple check: if the user's answer contains key words from the meaning
    const keyWords = correctMeaning.split(" ").filter((w) => w.length > 3);
    const isCorrect = keyWords.some((kw) => userAnswer.includes(kw)) || userAnswer.length > 3 && correctMeaning.includes(userAnswer);

    const newChecked = [...checked];
    const newFeedback = [...feedback];
    newChecked[index] = isCorrect;
    newFeedback[index] = isCorrect ? "Great job! ⭐" : `Not quite. It means: ${data.words[index].meaning}`;
    setChecked(newChecked);
    setFeedback(newFeedback);

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
            <p className="font-heading text-base mb-2 text-accent">{w.word}</p>
            <div className="flex gap-2">
              <Input
                placeholder="Type the meaning..."
                value={answers[i]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[i] = e.target.value;
                  setAnswers(newAnswers);
                }}
                disabled={checked[i] === true}
                className="rounded-xl font-body"
              />
              <Button
                onClick={() => checkAnswer(i)}
                disabled={checked[i] === true || !answers[i].trim()}
                className="rounded-xl font-heading"
              >
                Check
              </Button>
            </div>
            {feedback[i] && (
              <p className={`mt-2 text-sm font-body ${checked[i] ? "text-primary" : "text-destructive"}`}>
                {feedback[i]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
