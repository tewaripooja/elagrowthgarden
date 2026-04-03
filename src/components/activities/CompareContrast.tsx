import { useState } from "react";
import { CompareContrastData } from "@/lib/ai";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  data: CompareContrastData;
  onCorrect: () => void;
}

export default function CompareContrast({ data, onCorrect }: Props) {
  const [similarities, setSimilarities] = useState("");
  const [differences, setDifferences] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (similarities.trim().length > 10 && differences.trim().length > 10) {
      onCorrect();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <h3 className="font-heading text-lg mb-3 text-garden-blue">📖 Story 1</h3>
          <p className="font-body text-sm leading-relaxed text-foreground">{data.story1}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <h3 className="font-heading text-lg mb-3 text-garden-purple">📖 Story 2</h3>
          <p className="font-body text-sm leading-relaxed text-foreground">{data.story2}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-heading text-lg mb-3 text-foreground">🤔 {data.question}</h3>

        <div className="space-y-4">
          <div>
            <label className="font-heading text-sm text-primary mb-1 block">Similarities</label>
            <Textarea
              placeholder="What is the same about these stories?"
              value={similarities}
              onChange={(e) => setSimilarities(e.target.value)}
              disabled={submitted}
              className="rounded-xl font-body"
            />
          </div>
          <div>
            <label className="font-heading text-sm text-garden-orange mb-1 block">Differences</label>
            <Textarea
              placeholder="What is different about these stories?"
              value={differences}
              onChange={(e) => setDifferences(e.target.value)}
              disabled={submitted}
              className="rounded-xl font-body"
            />
          </div>

          <Button onClick={handleSubmit} disabled={submitted} className="rounded-xl font-heading w-full">
            Submit Answer
          </Button>

          {submitted && (
            <div className="bg-muted rounded-xl p-4">
              <p className="font-heading text-sm text-primary mb-1">Great thinking! 🌱</p>
              <p className="font-body text-sm text-muted-foreground">Here's a sample answer: {data.sampleAnswer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
