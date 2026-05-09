import { useEffect, useRef, useState } from "react";
import type { VocabularyData } from "@/lib/ai";
import QuickReflection from "@/components/QuickReflection";
import { Button } from "@/components/ui/button";
import {
  MAX_ACTIVITY_ATTEMPTS,
  PASSAGE_ABOVE_HINT,
  remainingAttemptsHint,
} from "@/lib/activityAttempts";
import { explainVocabularyCorrect } from "@/lib/explainCorrect";
import type { QuestionResolution } from "@/lib/activityScoring";
import type { McqSlice } from "@/lib/questionVariants";
import {
  pickInitialMcqPresentation,
  pickRetryMcqPresentation,
  vocabularyConceptVariants,
} from "@/lib/questionVariants";

interface Props {
  data: VocabularyData;
  onCorrect: () => void;
  onQuestionResolved?: (resolution: QuestionResolution) => void;
}

type WordStatus = "playing" | "correct" | "revealed";

function deckKey(words: VocabularyData["words"]): string {
  return words.map((w) => w.word).join("\0");
}

function initVocabularyDeck(words: VocabularyData["words"]) {
  const pres: McqSlice[] = [];
  const vp: number[] = [];
  for (const w of words) {
    const variants = vocabularyConceptVariants(w);
    const r = pickInitialMcqPresentation(variants);
    pres.push(r.slice);
    vp.push(r.variantIdx);
  }
  return {
    presentation: pres,
    variantPick: vp,
    answers: Array(words.length).fill(null) as (number | null)[],
    wrongCounts: Array(words.length).fill(0),
    status: Array(words.length).fill("playing") as WordStatus[],
    feedback: Array(words.length).fill(null) as (string | null)[],
  };
}

export default function Vocabulary({ data, onCorrect, onQuestionResolved }: Props) {
  const [{ presentation, variantPick, answers, wrongCounts, status, feedback }, setDeck] = useState(() =>
    initVocabularyDeck(data.words),
  );

  const [reflectingWordIndex, setReflectingWordIndex] = useState<number | null>(null);
  const pendingReflectRef = useRef<{ wordIndex: number; fails: number } | null>(null);

  useEffect(() => {
    setDeck(initVocabularyDeck(data.words));
    setReflectingWordIndex(null);
    pendingReflectRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when word list identity/content changes
  }, [deckKey(data.words)]);

  const completeReflectionAndRetry = () => {
    const p = pendingReflectRef.current;
    pendingReflectRef.current = null;
    setReflectingWordIndex(null);
    if (!p) return;
    const { wordIndex, fails } = p;
    const w = data.words[wordIndex]!;
    setDeck((d) => {
      const variants = vocabularyConceptVariants(w);
      const retry = pickRetryMcqPresentation(variants, d.variantPick[wordIndex] ?? 0);
      const pres = [...d.presentation];
      pres[wordIndex] = retry.slice;
      const vp = [...d.variantPick];
      vp[wordIndex] = retry.variantIdx;
      const ans = [...d.answers];
      ans[wordIndex] = null;
      const fb = [...d.feedback];
      const hint = remainingAttemptsHint(fails);
      fb[wordIndex] = hint ? `Nice try — ${hint}` : "";
      return { ...d, presentation: pres, variantPick: vp, answers: ans, feedback: fb };
    });
  };

  const handleSelect = (wordIndex: number, optIndex: number) => {
    if (reflectingWordIndex !== null) return;
    if (status[wordIndex] !== "playing") return;
    const slice = presentation[wordIndex];
    if (!slice) return;

    const newAnswers = [...answers];
    newAnswers[wordIndex] = optIndex;
    setDeck((d) => ({ ...d, answers: newAnswers }));

    const isCorrect = optIndex === slice.correctIndex;

    if (isCorrect) {
      const next = [...status];
      next[wordIndex] = "correct";
      setDeck((d) => ({
        ...d,
        status: next,
        feedback: (() => {
          const n = [...d.feedback];
          n[wordIndex] = null;
          return n;
        })(),
      }));
      onQuestionResolved?.({
        questionKey: `word:${wordIndex}`,
        attemptsToCorrect: wrongCounts[wordIndex] + 1,
        evidenceApplies: false,
        evidenceCorrect: true,
      });
      onCorrect();
      return;
    }

    const fails = wrongCounts[wordIndex] + 1;
    setDeck((d) => {
      const wc = [...d.wrongCounts];
      wc[wordIndex] = fails;

      if (fails >= MAX_ACTIVITY_ATTEMPTS) {
        const st = [...d.status];
        st[wordIndex] = "revealed";
        const meaning = slice.options[slice.correctIndex];
        const fb = [...d.feedback];
        fb[wordIndex] =
          `Here's the meaning we had in mind: ${meaning} — you'll recognize it faster next time with practice.`;
        queueMicrotask(() =>
          onQuestionResolved?.({
            questionKey: `word:${wordIndex}`,
            attemptsToCorrect: 0,
            evidenceApplies: false,
            evidenceCorrect: false,
          }),
        );
        return { ...d, wrongCounts: wc, status: st, feedback: fb };
      }

      return { ...d, wrongCounts: wc };
    });

    if (fails >= MAX_ACTIVITY_ATTEMPTS) return;

    pendingReflectRef.current = { wordIndex, fails };
    setReflectingWordIndex(wordIndex);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg text-foreground">📝 What do these words mean?</h3>
      {data.words.map((w, i) => {
        const slice = presentation[i]!;
        const playing = status[i] === "playing";
        const correct = status[i] === "correct";
        const revealed = status[i] === "revealed";
        const reflecting = reflectingWordIndex === i;
        const disabledChoice = !playing || reflecting;

        return (
          <div key={`${w.word}-${i}`} className="bg-card rounded-xl p-4 border border-border">
            <p className="font-heading text-base mb-3 text-accent">{w.word}</p>
            <div className="grid grid-cols-1 gap-2">
              {slice.options.map((opt, oi) => {
                let variant: "outline" | "default" | "destructive" = "outline";
                if (answers[i] === oi) {
                  if (correct) variant = "default";
                  else if (playing) variant = "destructive";
                  else variant = "outline";
                } else if ((correct || revealed) && oi === slice.correctIndex) variant = "default";

                return (
                  <Button
                    key={`${w.word}-${oi}-${opt.slice(0, 24)}`}
                    variant={variant}
                    onClick={() => handleSelect(i, oi)}
                    disabled={disabledChoice}
                    className="rounded-xl font-body text-left justify-start h-auto py-3"
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>
            {correct && (
              <p className="mt-2 text-sm font-body text-primary">Great job! ⭐</p>
            )}
            {reflecting && (
              <QuickReflection
                className="mt-3"
                onContinue={() => completeReflectionAndRetry()}
              />
            )}
            {revealed && feedback[i] && (
              <div className="mt-2 space-y-2 text-sm font-body text-amber-900 bg-amber-100/80 rounded-lg px-3 py-2 border border-amber-200">
                <p>{feedback[i]}</p>
                <p className="text-xs text-amber-950/95 leading-snug border-t border-amber-200/80 pt-2 mt-1">
                  Why this fits: {explainVocabularyCorrect(w, slice.options[slice.correctIndex])}
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
