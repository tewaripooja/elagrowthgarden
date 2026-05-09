import { useEffect, useRef, useState } from "react";
import type { CharacterTraitsData } from "@/lib/ai";
import type { QuestionResolution } from "@/lib/activityScoring";
import QuickReflection from "@/components/QuickReflection";
import { Button } from "@/components/ui/button";
import EvidenceSentencePicker from "@/components/EvidenceSentencePicker";
import { isEvidenceAcceptable } from "@/lib/evidenceValidation";
import { logQuestionAttempt } from "@/lib/questionAttempts";
import {
  MAX_ACTIVITY_ATTEMPTS,
  PASSAGE_ABOVE_HINT,
  PASSAGE_INLINE_HINT,
  remainingAttemptsHint,
} from "@/lib/activityAttempts";
import { explainTraitCorrect } from "@/lib/explainCorrect";
import type { McqSlice } from "@/lib/questionVariants";
import {
  characterTraitConceptVariants,
  pickInitialMcqPresentation,
  pickRetryMcqPresentation,
} from "@/lib/questionVariants";

interface Props {
  data: CharacterTraitsData;
  mainStory: string;
  storyKey: string;
  userId: string | null;
  evidenceQuestionCount?: number;
  onCorrect: () => void;
  onQuestionResolved?: (resolution: QuestionResolution) => void;
}

type RowStatus = "playing" | "correct" | "revealed";

type PendingReflect =
  | { qIndex: number; fails: number; mode: "instant" }
  | { qIndex: number; fails: number; mode: "evidence"; answerOk: boolean; evidenceOk: boolean };

function questionsKey(questions: CharacterTraitsData["questions"]): string {
  return questions.map((q) => q.question).join("\0");
}

function initTraitDeck(questions: CharacterTraitsData["questions"]) {
  const presentation: McqSlice[] = [];
  const variantPick: number[] = [];
  for (const q of questions) {
    const v = characterTraitConceptVariants(q);
    const r = pickInitialMcqPresentation(v);
    presentation.push(r.slice);
    variantPick.push(r.variantIdx);
  }
  return { presentation, variantPick };
}

export default function CharacterTraits({
  data,
  mainStory,
  storyKey,
  userId,
  evidenceQuestionCount = 2,
  onCorrect,
  onQuestionResolved,
}: Props) {
  const n = data.questions.length;

  const [{ presentation }, setMcqDeck] = useState(() => initTraitDeck(data.questions));

  const [answers, setAnswers] = useState<(number | null)[]>(Array(n).fill(null));
  const [evidenceIdx, setEvidenceIdx] = useState<(number | null)[]>(Array(n).fill(null));
  const [feedback, setFeedback] = useState<(string | null)[]>(Array(n).fill(null));
  const [wrongCounts, setWrongCounts] = useState<number[]>(Array(n).fill(0));
  const [status, setStatus] = useState<RowStatus[]>(() => Array(n).fill("playing"));
  const [reflectingQi, setReflectingQi] = useState<number | null>(null);
  const attemptRef = useRef<number[]>(Array(n).fill(0));
  const pendingReflectRef = useRef<PendingReflect | null>(null);

  useEffect(() => {
    const len = data.questions.length;
    setMcqDeck(initTraitDeck(data.questions));
    setAnswers(Array(len).fill(null));
    setEvidenceIdx(Array(len).fill(null));
    setFeedback(Array(len).fill(null));
    setWrongCounts(Array(len).fill(0));
    setStatus(Array(len).fill("playing"));
    setReflectingQi(null);
    pendingReflectRef.current = null;
    attemptRef.current = Array(len).fill(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsKey(data.questions)]);

  const needsEvidence = (qi: number) => qi < evidenceQuestionCount;

  const rotateQuestionPresentation = (qIndex: number) => {
    const q = data.questions[qIndex]!;
    const variants = characterTraitConceptVariants(q);
    setMcqDeck((deck) => {
      const retry = pickRetryMcqPresentation(variants, deck.variantPick[qIndex] ?? 0);
      const pres = [...deck.presentation];
      pres[qIndex] = retry.slice;
      const vp = [...deck.variantPick];
      vp[qIndex] = retry.variantIdx;
      return { presentation: pres, variantPick: vp };
    });
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = null;
      return next;
    });
    if (needsEvidence(qIndex)) {
      setEvidenceIdx((prev) => {
        const next = [...prev];
        next[qIndex] = null;
        return next;
      });
    }
  };

  const completeTraitReflection = () => {
    const p = pendingReflectRef.current;
    pendingReflectRef.current = null;
    setReflectingQi(null);
    if (!p) return;
    const { qIndex, fails } = p;
    rotateQuestionPresentation(qIndex);

    if (p.mode === "instant") {
      const hint = remainingAttemptsHint(fails);
      setFeedback((fb) => {
        const nfb = [...fb];
        nfb[qIndex] = hint ? `Nice try — ${hint}` : "";
        return nfb;
      });
      return;
    }

    const { answerOk, evidenceOk } = p;
    const hint = remainingAttemptsHint(fails);
    setFeedback((prev) => {
      const newFb = [...prev];
      if (!answerOk && !evidenceOk) {
        newFb[qIndex] = hint ? `Almost — tweak your choice or evidence and try again. ${hint}` : "";
      } else if (!answerOk) {
        newFb[qIndex] = hint
          ? `Warm attempt — compare each trait choice to what happens in the story, then adjust your pick. ${hint}`
          : "";
      } else {
        newFb[qIndex] = hint ? `Answer fits — pick a sentence that clearly backs it up. ${hint}` : "";
      }
      return newFb;
    });
  };

  const handleInstantSelect = (qIndex: number, optIndex: number) => {
    if (reflectingQi !== null) return;
    if (status[qIndex] !== "playing") return;

    const slice = presentation[qIndex];
    if (!slice) return;

    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });

    const q = data.questions[qIndex]!;
    const isCorrect = optIndex === slice.correctIndex;

    if (userId) {
      attemptRef.current[qIndex] += 1;
      void logQuestionAttempt({
        userId,
        storyKey,
        activityType: "character-traits",
        questionKey: `character-traits:${qIndex}`,
        attemptNumber: attemptRef.current[qIndex],
        answerCorrect: isCorrect,
        evidenceCorrect: true,
      });
    }

    if (isCorrect) {
      const nextS = [...status];
      nextS[qIndex] = "correct";
      setStatus(nextS);
      setFeedback((fb) => {
        const nfb = [...fb];
        nfb[qIndex] = null;
        return nfb;
      });
      onQuestionResolved?.({
        questionKey: `trait:${qIndex}`,
        attemptsToCorrect: wrongCounts[qIndex] + 1,
        evidenceApplies: false,
        evidenceCorrect: true,
      });
      onCorrect();
      return;
    }

    const fails = wrongCounts[qIndex] + 1;
    setWrongCounts((prev) => {
      const nc = [...prev];
      nc[qIndex] = fails;
      return nc;
    });

    if (fails >= MAX_ACTIVITY_ATTEMPTS) {
      const nextS = [...status];
      nextS[qIndex] = "revealed";
      setStatus(nextS);
      setFeedback((fb) => {
        const nfb = [...fb];
        nfb[qIndex] = null;
        return nfb;
      });
      queueMicrotask(() =>
        onQuestionResolved?.({
          questionKey: `trait:${qIndex}`,
          attemptsToCorrect: 0,
          evidenceApplies: false,
          evidenceCorrect: false,
        }),
      );
      return;
    }

    pendingReflectRef.current = { qIndex, fails, mode: "instant" };
    setReflectingQi(qIndex);
  };

  const handleEvidenceCheck = (qIndex: number) => {
    if (reflectingQi !== null) return;
    if (status[qIndex] !== "playing") return;
    const opt = answers[qIndex];
    const ev = evidenceIdx[qIndex];
    if (opt === null || ev === null) return;

    const slice = presentation[qIndex];
    if (!slice) return;

    const q = data.questions[qIndex]!;
    attemptRef.current[qIndex] += 1;
    const answerOk = opt === slice.correctIndex;
    const referenceForEvidence = `${q.question} ${slice.options[opt]}`;
    const evidenceOk = isEvidenceAcceptable(mainStory, ev, referenceForEvidence);

    if (userId) {
      void logQuestionAttempt({
        userId,
        storyKey,
        activityType: "character-traits",
        questionKey: `character-traits:${qIndex}`,
        attemptNumber: attemptRef.current[qIndex],
        answerCorrect: answerOk,
        evidenceCorrect: evidenceOk,
      });
    }

    const ok = answerOk && evidenceOk;
    if (ok) {
      const nextS = [...status];
      nextS[qIndex] = "correct";
      setStatus(nextS);
      setFeedback((fb) => {
        const nfb = [...fb];
        nfb[qIndex] = "You got it! 🌟";
        return nfb;
      });
      onQuestionResolved?.({
        questionKey: `trait:${qIndex}`,
        attemptsToCorrect: wrongCounts[qIndex] + 1,
        evidenceApplies: true,
        evidenceCorrect: true,
      });
      onCorrect();
      return;
    }

    const fails = wrongCounts[qIndex] + 1;
    setWrongCounts((prev) => {
      const nc = [...prev];
      nc[qIndex] = fails;
      return nc;
    });

    if (fails >= MAX_ACTIVITY_ATTEMPTS) {
      const nextS = [...status];
      nextS[qIndex] = "revealed";
      setStatus(nextS);
      setFeedback((fb) => {
        const nfb = [...fb];
        nfb[qIndex] = null;
        return nfb;
      });
      queueMicrotask(() =>
        onQuestionResolved?.({
          questionKey: `trait:${qIndex}`,
          attemptsToCorrect: 0,
          evidenceApplies: true,
          evidenceCorrect: false,
        }),
      );
      return;
    }

    pendingReflectRef.current = { qIndex, fails, mode: "evidence", answerOk, evidenceOk };
    setReflectingQi(qIndex);
  };

  return (
    <div className="space-y-5">
      <h3 className="font-heading text-lg text-foreground">🧑 Character Traits</h3>
      {data.questions.map((q, qi) => {
        const slice = presentation[qi];
        if (!slice) return null;

        if (!needsEvidence(qi)) {
          const playing = status[qi] === "playing";
          const correct = status[qi] === "correct";
          const revealed = status[qi] === "revealed";
          const reflecting = reflectingQi === qi;
          const disableOpts = !playing || reflecting;

          return (
            <div key={qi} className="bg-card rounded-xl p-4 border border-border">
              <p className="font-heading text-sm mb-3 text-foreground">{q.question}</p>
              <div className="grid grid-cols-1 gap-2">
                {slice.options.map((opt, oi) => {
                  let variant: "outline" | "default" | "destructive" = "outline";
                  if (answers[qi] === oi) {
                    if (correct) variant = "default";
                    else if (playing) variant = "destructive";
                    else variant = "outline";
                  } else if ((correct || revealed) && oi === slice.correctIndex) variant = "default";

                  return (
                    <Button
                      key={`${qi}-${oi}-${opt.slice(0, 20)}`}
                      variant={variant}
                      onClick={() => handleInstantSelect(qi, oi)}
                      disabled={disableOpts}
                      className="rounded-xl font-body text-left justify-start h-auto py-3"
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>
              {correct && <p className="mt-2 text-sm font-body text-primary">You got it! 🌟</p>}
              {reflecting && (
                <QuickReflection className="mt-3" onContinue={() => completeTraitReflection()} />
              )}
              {revealed && (
                <div className="mt-2 space-y-2 text-sm font-body text-amber-900 bg-amber-100/80 rounded-lg px-3 py-2 border border-amber-200">
                  <p>
                    Strongest answer for this question:{" "}
                    <strong>{slice.options[slice.correctIndex]}</strong>
                  </p>
                  <p className="text-xs text-amber-950/95 leading-snug border-t border-amber-200/80 pt-2 mt-1">
                    Why this fits: {explainTraitCorrect(q, slice.options[slice.correctIndex])}
                  </p>
                  <p className="text-xs text-amber-950/90">{PASSAGE_ABOVE_HINT}</p>
                </div>
              )}
              {playing && feedback[qi] && !reflecting && (
                <p className="mt-2 text-sm font-body text-destructive">{feedback[qi]}</p>
              )}
            </div>
          );
        }

        const resolved = status[qi] === "correct";
        const revealedEv = status[qi] === "revealed";
        const reflectingEv = reflectingQi === qi;
        const locked = resolved || revealedEv;
        const freezeEvidenceRow = locked || reflectingEv;
        const canSubmit =
          answers[qi] !== null &&
          evidenceIdx[qi] !== null &&
          status[qi] === "playing" &&
          !reflectingEv;

        return (
          <div key={qi} className="bg-card rounded-xl p-4 border border-border space-y-3">
            <p className="font-heading text-sm text-foreground">{q.question}</p>
            <p className="text-xs text-muted-foreground font-body">
              Pick an answer, then tap supporting evidence in the passage — then check.
            </p>

            <EvidenceSentencePicker
              story={mainStory}
              selectedIndex={evidenceIdx[qi] ?? null}
              onSelect={(i) => {
                const next = [...evidenceIdx];
                next[qi] = i;
                setEvidenceIdx(next);
              }}
              disabled={freezeEvidenceRow}
            />

            <div className="grid grid-cols-1 gap-2">
              {slice.options.map((opt, oi) => {
                let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
                if (answers[qi] === oi) variant = resolved ? "default" : revealedEv ? "outline" : "secondary";
                else if ((resolved || revealedEv) && oi === slice.correctIndex) variant = "default";
                return (
                  <Button
                    key={`${qi}-${oi}-${opt.slice(0, 20)}`}
                    variant={variant}
                    onClick={() => {
                      if (freezeEvidenceRow) return;
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                    disabled={freezeEvidenceRow}
                    className="rounded-xl font-body text-left justify-start h-auto py-3"
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full font-heading rounded-xl"
              disabled={!canSubmit}
              onClick={() => handleEvidenceCheck(qi)}
            >
              Check answer & evidence
            </Button>

            {reflectingEv && (
              <QuickReflection className="mt-1" onContinue={() => completeTraitReflection()} />
            )}

            {resolved && feedback[qi] && (
              <p className={`mt-2 text-sm font-body text-primary`}>{feedback[qi]}</p>
            )}
            {revealedEv && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 space-y-1">
                <p className="text-sm font-heading font-semibold text-amber-950">
                  Here&apos;s the answer after {MAX_ACTIVITY_ATTEMPTS} tries — keep going!
                </p>
                <p className="text-sm font-body text-foreground">{slice.options[slice.correctIndex]}</p>
                <p className="text-xs text-muted-foreground leading-snug border-t border-amber-200/80 pt-2 mt-1">
                  Why this fits: {explainTraitCorrect(q, slice.options[slice.correctIndex])}
                </p>
                <p className="text-xs text-muted-foreground">
                  Look for a sentence that describes this idea — that&apos;s solid evidence next time.
                </p>
                <p className="text-xs text-amber-950/85">{PASSAGE_INLINE_HINT}</p>
              </div>
            )}
            {status[qi] === "playing" && feedback[qi] && !reflectingEv && (
              <p className={`mt-2 text-sm font-body text-destructive`}>{feedback[qi]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
