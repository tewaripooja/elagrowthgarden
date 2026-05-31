import { useEffect, useRef, useState } from "react";
import type { FactOpinionData } from "@/lib/ai";
import type { QuestionResolution } from "@/lib/activityScoring";
import QuickReflection from "@/components/QuickReflection";
import { Button } from "@/components/ui/button";
import {
  MAX_ACTIVITY_ATTEMPTS,
  PASSAGE_ABOVE_HINT,
  remainingAttemptsHint,
} from "@/lib/activityAttempts";
import { explainFactOpinionCorrect } from "@/lib/explainCorrect";
import { playWrongSound } from "@/lib/sounds";

interface Props {
  data: FactOpinionData;
  onCorrect: () => void;
  onQuestionResolved?: (resolution: QuestionResolution) => void;
}

type RowStatus = "playing" | "correct" | "revealed";

function statementsKey(statements: FactOpinionData["statements"]): string {
  return statements.map((s) => `${s.text}\t${s.type}`).join("\n");
}

export default function FactOpinion({ data, onCorrect, onQuestionResolved }: Props) {
  const [factButtonFirst, setFactButtonFirst] = useState<boolean[]>(() =>
    data.statements.map(() => Math.random() < 0.5),
  );
  const [answers, setAnswers] = useState<(string | null)[]>(Array(data.statements.length).fill(null));
  const [wrongCounts, setWrongCounts] = useState<number[]>(Array(data.statements.length).fill(0));
  const [status, setStatus] = useState<RowStatus[]>(() => Array(data.statements.length).fill("playing"));
  const [feedback, setFeedback] = useState<(string | null)[]>(Array(data.statements.length).fill(null));
  const [reflectingRow, setReflectingRow] = useState<number | null>(null);
  const pendingReflectRef = useRef<{ index: number; fails: number } | null>(null);

  useEffect(() => {
    setFactButtonFirst(data.statements.map(() => Math.random() < 0.5));
    setAnswers(Array(data.statements.length).fill(null));
    setWrongCounts(Array(data.statements.length).fill(0));
    setStatus(Array(data.statements.length).fill("playing"));
    setFeedback(Array(data.statements.length).fill(null));
    setReflectingRow(null);
    pendingReflectRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statementsKey(data.statements)]);

  const finishReflectionAndContinue = () => {
    const p = pendingReflectRef.current;
    pendingReflectRef.current = null;
    setReflectingRow(null);
    if (!p) return;
    const { index, fails } = p;
    setFactButtonFirst((prev) => {
      const next = [...prev];
      next[index] = Math.random() < 0.5;
      return next;
    });
    const hint = remainingAttemptsHint(fails);
    setFeedback((fb) => {
      const n = [...fb];
      n[index] = hint ? `Nice try — ${hint}` : "";
      return n;
    });
  };

  const handleSelect = (index: number, choice: "fact" | "opinion") => {
    if (reflectingRow !== null) return;
    if (status[index] !== "playing") return;

    const newAnswers = [...answers];
    newAnswers[index] = choice;
    setAnswers(newAnswers);

    const s = data.statements[index]!;
    const isCorrect = choice === s.type;

    if (isCorrect) {
      const next = [...status];
      next[index] = "correct";
      setStatus(next);
      setFeedback((fb) => {
        const n = [...fb];
        n[index] = null;
        return n;
      });
      onQuestionResolved?.({
        questionKey: `stmt:${index}`,
        attemptsToCorrect: wrongCounts[index] + 1,
        evidenceApplies: false,
        evidenceCorrect: true,
      });
      onCorrect();
      return;
    }

    const fails = wrongCounts[index] + 1;
    playWrongSound();
    setWrongCounts((prev) => {
      const n = [...prev];
      n[index] = fails;
      return n;
    });

    if (fails >= MAX_ACTIVITY_ATTEMPTS) {
      const next = [...status];
      next[index] = "revealed";
      setStatus(next);
      setFeedback((fb) => {
        const n = [...fb];
        n[index] = null;
        return n;
      });
      queueMicrotask(() =>
        onQuestionResolved?.({
          questionKey: `stmt:${index}`,
          attemptsToCorrect: 0,
          evidenceApplies: false,
          evidenceCorrect: false,
        }),
      );
      return;
    }

    pendingReflectRef.current = { index, fails };
    setReflectingRow(index);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg text-foreground">🔍 Fact or Opinion?</h3>
      {data.statements.map((s, i) => {
        const playing = status[i] === "playing";
        const correct = status[i] === "correct";
        const revealed = status[i] === "revealed";
        const reflecting = reflectingRow === i;
        const firstKind = factButtonFirst[i] ? "fact" : "opinion";
        const secondKind = factButtonFirst[i] ? "opinion" : "fact";
        const disableButtons = !playing || reflecting;

        return (
          <div key={i} className="bg-card rounded-xl p-4 border border-border">
            <p className="font-body text-sm mb-3 text-foreground">"{s.text}"</p>
            <div className="flex gap-3">
              <Button
                variant={
                  answers[i] === firstKind
                    ? correct
                      ? "default"
                      : playing
                        ? "destructive"
                        : "outline"
                    : "outline"
                }
                onClick={() => handleSelect(i, firstKind)}
                disabled={disableButtons}
                className="rounded-xl font-heading flex-1"
              >
                {firstKind === "fact" ? "📋 Fact" : "💭 Opinion"}
              </Button>
              <Button
                variant={
                  answers[i] === secondKind
                    ? correct
                      ? "default"
                      : playing
                        ? "destructive"
                        : "outline"
                    : "outline"
                }
                onClick={() => handleSelect(i, secondKind)}
                disabled={disableButtons}
                className="rounded-xl font-heading flex-1"
              >
                {secondKind === "fact" ? "📋 Fact" : "💭 Opinion"}
              </Button>
            </div>
            {correct && <p className="mt-2 text-sm font-body text-primary">Correct! 🌟</p>}
            {reflecting && (
              <QuickReflection className="mt-3" onContinue={() => finishReflectionAndContinue()} />
            )}
            {revealed && (
              <div className="mt-2 space-y-2 text-sm font-body text-amber-900 bg-amber-100/80 rounded-lg px-3 py-2 border border-amber-200">
                <p>
                  Here&apos;s the answer: <strong>{s.type}</strong> — this statement is a {s.type}. You&apos;re
                  still learning!
                </p>
                <p className="text-xs text-amber-950/95 leading-snug border-t border-amber-200/80 pt-2 mt-1">
                  Why {s.type}: {explainFactOpinionCorrect(s)}
                </p>
                <p className="text-xs text-amber-950/90">{PASSAGE_ABOVE_HINT}</p>
              </div>
            )}
            {playing && feedback[i] && !reflecting && (
              <p className="mt-2 text-sm font-body text-destructive">{feedback[i]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
