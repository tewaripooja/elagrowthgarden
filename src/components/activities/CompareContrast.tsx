import { useRef, useState } from "react";
import type { CompareContrastData } from "@/lib/ai";
import type { QuestionResolution } from "@/lib/activityScoring";
import QuickReflection from "@/components/QuickReflection";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MAX_ACTIVITY_ATTEMPTS,
  PASSAGE_ABOVE_HINT,
  remainingAttemptsHint,
} from "@/lib/activityAttempts";
import { explainCompareContrastReveal } from "@/lib/explainCorrect";
import { playWrongSound } from "@/lib/sounds";

interface Props {
  data: CompareContrastData;
  mainStory: string;
  onCorrect: () => void;
  onQuestionResolved?: (resolution: QuestionResolution) => void;
}

export default function CompareContrast({ data, mainStory, onCorrect, onQuestionResolved }: Props) {
  void mainStory;
  const [similarities, setSimilarities] = useState("");
  const [differences, setDifferences] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [revealedAfterFails, setRevealedAfterFails] = useState(false);
  const [wrongSubmits, setWrongSubmits] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [reflecting, setReflecting] = useState(false);
  const pendingFailsRef = useRef<number | null>(null);

  const isAnswerOk = () =>
    similarities.trim().length > 10 && differences.trim().length > 10;

  const finishReflectionAndHint = () => {
    const fails = pendingFailsRef.current;
    pendingFailsRef.current = null;
    setReflecting(false);
    if (fails == null) return;
    const line = remainingAttemptsHint(fails);
    setHint(
      line
        ? `${line} Add at least one full sentence for similarities and one for differences.`
        : null,
    );
  };

  const handleSubmit = () => {
    if (submitted || reflecting) return;

    if (isAnswerOk()) {
      setSubmitted(true);
      setHint(null);
      onQuestionResolved?.({
        questionKey: "compare",
        attemptsToCorrect: wrongSubmits + 1,
        evidenceApplies: false,
        evidenceCorrect: true,
      });
      onCorrect();
      return;
    }

    const fails = wrongSubmits + 1;
    playWrongSound();
    setWrongSubmits(fails);

    if (fails >= MAX_ACTIVITY_ATTEMPTS) {
      setSubmitted(true);
      setRevealedAfterFails(true);
      setHint(null);
      queueMicrotask(() =>
        onQuestionResolved?.({
          questionKey: "compare",
          attemptsToCorrect: 0,
          evidenceApplies: false,
          evidenceCorrect: false,
        }),
      );
      return;
    }

    pendingFailsRef.current = fails;
    setReflecting(true);
  };

  const locked = submitted;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <h3 className="font-heading text-lg mb-3 text-garden-purple">📖 Story 2 (Compare with the main story above)</h3>
        <p className="font-body text-sm leading-relaxed text-foreground">{data.story2}</p>
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
              disabled={locked}
              className="rounded-xl font-body"
            />
          </div>
          <div>
            <label className="font-heading text-sm text-garden-orange mb-1 block">Differences</label>
            <Textarea
              placeholder="What is different about these stories?"
              value={differences}
              onChange={(e) => setDifferences(e.target.value)}
              disabled={locked}
              className="rounded-xl font-body"
            />
          </div>

          {!locked && (
            <Button
              onClick={handleSubmit}
              disabled={reflecting}
              className="rounded-xl font-heading w-full"
            >
              Submit answer
            </Button>
          )}

          {reflecting && (
            <QuickReflection className="mt-1" onContinue={() => finishReflectionAndHint()} />
          )}

          {hint && !locked && !reflecting && (
            <p className="text-sm font-body text-destructive">{hint}</p>
          )}

          {submitted && !revealedAfterFails && (
            <div className="bg-muted rounded-xl p-4">
              <p className="font-heading text-sm text-primary mb-1">Great thinking! 🌱</p>
              <p className="font-body text-sm text-muted-foreground">
                Here&apos;s a sample answer you can compare with yours: {data.sampleAnswer}
              </p>
            </div>
          )}

          {submitted && revealedAfterFails && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 space-y-2">
              <p className="font-heading text-sm font-semibold text-amber-950">
                Example answer after {MAX_ACTIVITY_ATTEMPTS} tries — here&apos;s a solid model:
              </p>
              <p className="font-body text-sm text-foreground">{data.sampleAnswer}</p>
              <p className="text-xs text-muted-foreground font-body leading-snug border-t border-amber-200/80 pt-2 mt-1">
                Why this works: {explainCompareContrastReveal(data.sampleWhyCorrect)}
              </p>
              <p className="text-xs text-muted-foreground font-body">
                Notice how yours lines up — small, specific details are what make compare-and-contrast shine.
              </p>
              <p className="text-xs text-amber-950/85">{PASSAGE_ABOVE_HINT}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
