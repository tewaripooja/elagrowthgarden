import { useMemo, useRef, useState } from "react";
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
import { deriveCompareMcqs, type CompareMcqQuestion } from "@/lib/compareContrastMcq";

interface Props {
  data: CompareContrastData;
  mainStory: string;
  grade?: number;
  onCorrect: () => void;
  onQuestionResolved?: (resolution: QuestionResolution) => void;
}

// ── Single MCQ question row ────────────────────────────────────────────────

function McqRow({
  q,
  qIdx,
  onCorrect,
}: {
  q: CompareMcqQuestion;
  qIdx: number;
  onCorrect: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);
  const creditedRef = useRef(false);

  const handlePick = (i: number) => {
    if (done) return;
    setSelected(i);
    if (i === q.correctIndex) {
      setDone(true);
      if (!creditedRef.current) {
        creditedRef.current = true;
        onCorrect();
      }
    } else {
      playWrongSound();
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className="space-y-2">
      <p className="font-heading text-sm font-semibold text-foreground">
        {qIdx + 1}. {q.question}
      </p>
      <div className={`space-y-2 ${shake ? 'animate-shake' : ''}`}>
        {q.options.map((opt, i) => {
          let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
          if (done) {
            variant = i === q.correctIndex ? "default" : "outline";
          } else if (selected === i) {
            variant = "destructive";
          }
          return (
            <Button
              key={i}
              variant={variant}
              disabled={done}
              onClick={() => handlePick(i)}
              className="rounded-xl font-body text-left w-full h-auto py-3 px-4 whitespace-normal justify-start"
            >
              {opt}
            </Button>
          );
        })}
      </div>
      {done && <p className="text-sm font-body text-primary">Correct! 🌟</p>}
      {!done && selected !== null && selected !== q.correctIndex && (
        <p className="text-sm font-body text-destructive">Not quite — try again!</p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CompareContrast({ data, mainStory, grade = 1, onCorrect, onQuestionResolved }: Props) {
  const canWriteMode = grade >= 3;
  const [writeMode, setWriteMode] = useState(false);

  const mcqs = useMemo(
    () => deriveCompareMcqs(mainStory, data.story2, data.sampleAnswer),
    [mainStory, data.story2, data.sampleAnswer],
  );

  const [mcqDone, setMcqDone] = useState([false, false]);
  const resolvedRef = useRef(false);

  const handleMcqCorrect = (idx: number) => {
    setMcqDone(prev => {
      const next = [...prev];
      next[idx] = true;
      if (next.every(Boolean) && !resolvedRef.current) {
        resolvedRef.current = true;
        onQuestionResolved?.({
          questionKey: 'compare',
          attemptsToCorrect: 1,
          evidenceApplies: false,
          evidenceCorrect: true,
        });
        onCorrect();
      }
      return next;
    });
  };

  const allMcqDone = mcqDone.every(Boolean);

  // ── Free-text state ────────────────────────────────────────────────────
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
    setHint(line ? `${line} Add at least one full sentence for each.` : null);
  };

  const handleTextSubmit = () => {
    if (submitted || reflecting) return;
    if (isAnswerOk()) {
      setSubmitted(true);
      setHint(null);
      onQuestionResolved?.({ questionKey: 'compare', attemptsToCorrect: wrongSubmits + 1, evidenceApplies: false, evidenceCorrect: true });
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
      queueMicrotask(() => onQuestionResolved?.({ questionKey: 'compare', attemptsToCorrect: 0, evidenceApplies: false, evidenceCorrect: false }));
      return;
    }
    pendingFailsRef.current = fails;
    setReflecting(true);
  };

  return (
    <div className="space-y-6">

      {/* Story 2 */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <h3 className="font-heading text-lg mb-3 text-garden-purple">
          📖 Story 2 (Compare with the main story above)
        </h3>
        <p className="font-body text-sm leading-relaxed text-foreground">{data.story2}</p>
      </div>

      {/* Mode toggle for grades 3–5 */}
      {canWriteMode && (
        <div className="flex justify-end">
          <button
            onClick={() => setWriteMode(m => !m)}
            className="text-xs font-heading text-primary underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            {writeMode ? '← Back to questions' : '✏️ Write my own answer instead'}
          </button>
        </div>
      )}

      {/* ── MCQ mode (default) ── */}
      {!writeMode && (
        <div className="bg-card rounded-2xl p-5 border border-border space-y-5">
          <h3 className="font-heading text-lg text-foreground">🤔 {data.question}</h3>
          <p className="text-sm text-muted-foreground font-body">
            Answer both questions to complete this activity.
          </p>

          {mcqs.map((q, i) => (
            <McqRow
              key={i}
              q={q}
              qIdx={i}
              onCorrect={() => handleMcqCorrect(i)}
            />
          ))}

          {allMcqDone && (
            <div className="bg-muted rounded-xl p-4">
              <p className="font-heading text-sm text-primary mb-1">Great comparing! 🌱</p>
              <p className="font-body text-sm text-muted-foreground">
                Sample answer: {data.sampleAnswer}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Free-text mode (grades 3–5 optional) ── */}
      {writeMode && (
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h3 className="font-heading text-lg text-foreground">🤔 {data.question}</h3>
          <div>
            <label className="font-heading text-sm text-primary mb-1 block">Similarities</label>
            <Textarea
              placeholder="What is the same about these stories?"
              value={similarities}
              onChange={e => setSimilarities(e.target.value)}
              disabled={submitted}
              className="rounded-xl font-body"
            />
          </div>
          <div>
            <label className="font-heading text-sm text-garden-orange mb-1 block">Differences</label>
            <Textarea
              placeholder="What is different about these stories?"
              value={differences}
              onChange={e => setDifferences(e.target.value)}
              disabled={submitted}
              className="rounded-xl font-body"
            />
          </div>

          {!submitted && (
            <Button onClick={handleTextSubmit} disabled={reflecting} className="rounded-xl font-heading w-full">
              Submit answer
            </Button>
          )}

          {reflecting && (
            <QuickReflection className="mt-1" onContinue={() => finishReflectionAndHint()} />
          )}

          {hint && !submitted && !reflecting && (
            <p className="text-sm font-body text-destructive">{hint}</p>
          )}

          {submitted && !revealedAfterFails && (
            <div className="bg-muted rounded-xl p-4">
              <p className="font-heading text-sm text-primary mb-1">Great thinking! 🌱</p>
              <p className="font-body text-sm text-muted-foreground">
                Sample answer: {data.sampleAnswer}
              </p>
            </div>
          )}

          {submitted && revealedAfterFails && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 space-y-2">
              <p className="font-heading text-sm font-semibold text-amber-950">
                Example answer after {MAX_ACTIVITY_ATTEMPTS} tries:
              </p>
              <p className="font-body text-sm text-foreground">{data.sampleAnswer}</p>
              <p className="text-xs text-muted-foreground font-body leading-snug border-t border-amber-200/80 pt-2 mt-1">
                Why this works: {explainCompareContrastReveal(data.sampleWhyCorrect)}
              </p>
              <p className="text-xs text-amber-950/85">{PASSAGE_ABOVE_HINT}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
