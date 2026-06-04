import { useEffect, useMemo, useRef, useState } from "react";
import type { SummariesData, SummaryOption } from "@/lib/ai";
import type { QuestionResolution } from "@/lib/activityScoring";
import { splitIntoSentences } from "@/lib/storySections";
import QuickReflection from "@/components/QuickReflection";
import { Button } from "@/components/ui/button";
import EvidenceSentencePicker from "@/components/EvidenceSentencePicker";
import { isEvidenceAcceptable } from "@/lib/evidenceValidation";
import { logQuestionAttempt } from "@/lib/questionAttempts";
import {
  MAX_ACTIVITY_ATTEMPTS,
  PASSAGE_INLINE_HINT,
  remainingAttemptsHint,
} from "@/lib/activityAttempts";
import { explainSummaryCorrect } from "@/lib/explainCorrect";
import { playWrongSound } from "@/lib/sounds";
import {
  pickInitialSummaryPresentation,
  pickRetrySummaryPresentation,
  summariesConceptVariants,
} from "@/lib/questionVariants";

interface Props {
  data: SummariesData;
  mainStory: string;
  storyKey: string;
  userId: string | null;
  onCorrect: () => void;
  onQuestionResolved?: (resolution: QuestionResolution) => void;
  vocabularyWords?: { word: string; definition?: string }[];
}

function summariesDeckKey(data: SummariesData): string {
  return JSON.stringify({
    base: data.options,
    variants: data.summaryVariants ?? null,
  });
}

export default function Summaries({
  data,
  mainStory,
  storyKey,
  userId,
  onCorrect,
  onQuestionResolved,
  vocabularyWords = [],
}: Props) {
  const deckKey = summariesDeckKey(data);
  const summarySets = useMemo(() => summariesConceptVariants(data), [deckKey]);

  const [{ variantIdx, displayOptions }, setDeck] = useState(() =>
    pickInitialSummaryPresentation(summarySets),
  );

  const [summaryChoice, setSummaryChoice] = useState<number | null>(null);
  const [evidenceIdx, setEvidenceIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [passed, setPassed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const attemptRef = useRef(0);
  const creditedRef = useRef(false);
  const pendingReflectRef = useRef<{
    fails: number;
    answerOk: boolean;
    evidenceOk: boolean;
    prevVariantIdx: number;
  } | null>(null);

  useEffect(() => {
    const sets = summariesConceptVariants(data);
    setDeck(pickInitialSummaryPresentation(sets));
    setSummaryChoice(null);
    setEvidenceIdx(null);
    setFeedback(null);
    setPassed(false);
    setRevealed(false);
    setReflecting(false);
    attemptRef.current = 0;
    creditedRef.current = false;
    pendingReflectRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckKey]);

  const correctOption = useMemo(() => summarySets[variantIdx]?.find((o) => o.correct), [summarySets, variantIdx]);

  const finishReflectionAndRetry = () => {
    const p = pendingReflectRef.current;
    pendingReflectRef.current = null;
    setReflecting(false);
    if (!p) return;
    const { fails, answerOk, evidenceOk, prevVariantIdx } = p;
    setDeck(pickRetrySummaryPresentation(summarySets, prevVariantIdx));
    setSummaryChoice(null);
    setEvidenceIdx(null);

    const hint = remainingAttemptsHint(fails);
    if (!answerOk && !evidenceOk) {
      setFeedback(hint ? `Almost — align your summary pick with a sentence that matches it. ${hint}` : "");
    } else if (!answerOk) {
      setFeedback(hint ? `Warm try — pick the summary that fits the whole arc of the story. ${hint}` : "");
    } else {
      setFeedback(hint ? `Summary choice works — tap a sentence that really supports it. ${hint}` : "");
    }
  };

  const handleCheck = () => {
    if (summaryChoice === null || evidenceIdx === null || passed || revealed || reflecting) return;
    attemptRef.current += 1;
    const chosen = displayOptions[summaryChoice];
    const referenceForEvidence = chosen?.text ?? "";
    const answerOk = Boolean(chosen?.correct);
    const evidenceOk = isEvidenceAcceptable(mainStory, evidenceIdx, referenceForEvidence);

    if (userId) {
      void logQuestionAttempt({
        userId,
        storyKey,
        activityType: "summaries",
        questionKey: "summaries:best-summary",
        attemptNumber: attemptRef.current,
        answerCorrect: answerOk,
        evidenceCorrect: evidenceOk,
      });
    }

    const ok = answerOk && evidenceOk;
    if (ok) {
      setPassed(true);
      setFeedback("Perfect — your summary choice and evidence match. 🌟");
      onQuestionResolved?.({
        questionKey: "summary",
        attemptsToCorrect: attemptRef.current,
        evidenceApplies: true,
        evidenceCorrect: true,
      });
      if (!creditedRef.current) {
        creditedRef.current = true;
        onCorrect();
      }
      return;
    }

    const fails = attemptRef.current;
    playWrongSound();
    if (fails >= MAX_ACTIVITY_ATTEMPTS) {
      setRevealed(true);
      setFeedback(null);
      queueMicrotask(() =>
        onQuestionResolved?.({
          questionKey: "summary",
          attemptsToCorrect: 0,
          evidenceApplies: true,
          evidenceCorrect: false,
        }),
      );
      return;
    }

    pendingReflectRef.current = {
      fails,
      answerOk,
      evidenceOk,
      prevVariantIdx: variantIdx,
    };
    setReflecting(true);
  };

  const canSubmit = summaryChoice !== null && evidenceIdx !== null && !passed && !revealed && !reflecting;
  const lockedOut = passed || revealed;
  const freezeChoices = lockedOut || reflecting;

  // Pre-select 3–4 sentences to show as evidence candidates.
  // Score every sentence against the correct option text, then pick:
  //   • top 2 highest-scoring sentences (the likely correct evidence)
  //   • 1–2 mid/low-scoring sentences as distractors
  // The original sentence indices are preserved so isEvidenceAcceptable still works.
  const evidenceCandidates = useMemo(() => {
    const sentences = splitIntoSentences(mainStory ?? "");
    const refText = correctOption?.text ?? "";
    if (!refText || sentences.length <= 4) return undefined; // show all when story is very short

    // Simple word-overlap score (mirrors evidenceValidation.ts)
    const refWords = new Set(
      (refText.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [])
    );
    const scores = sentences.map(s => {
      const words = s.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
      return words.filter(w => refWords.has(w)).length;
    });

    // Sort indices by score descending
    const ranked = scores
      .map((score, idx) => ({ idx, score }))
      .sort((a, b) => b.score - a.score);

    const top = ranked.slice(0, 2).map(r => r.idx);                 // 2 best
    const rest = ranked.slice(2);
    // pick 1–2 distractors from the middle of the ranked list
    const midStart = Math.floor(rest.length / 3);
    const distractors = rest
      .slice(midStart, midStart + 2)
      .map(r => r.idx);

    // Combine and sort by original position so reading order is preserved
    return [...new Set([...top, ...distractors])].sort((a, b) => a - b);
  }, [mainStory, correctOption?.text]);

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg text-foreground">📝 Pick the Best Summary</h3>
      <p className="text-sm text-muted-foreground font-body">
        Pick the best summary, then tap a sentence from the story that supports your choice.
      </p>

      <div className="space-y-2">
        <p className="text-sm font-heading font-semibold text-foreground">Which summary is best?</p>
        {displayOptions.map((opt: SummaryOption, i: number) => {
          let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
          if (summaryChoice === i) variant = passed ? "default" : revealed ? "outline" : "secondary";
          else if ((passed || revealed) && opt.correct) variant = "default";
          return (
            <Button
              key={`${variantIdx}-${i}-${opt.text.slice(0, 32)}`}
              variant={variant}
              onClick={() => !freezeChoices && setSummaryChoice(i)}
              disabled={freezeChoices}
              className="rounded-xl font-body text-left w-full h-auto py-4 px-5 whitespace-normal"
            >
              {opt.text}
            </Button>
          );
        })}
      </div>

      <EvidenceSentencePicker
        story={mainStory}
        selectedIndex={evidenceIdx}
        onSelect={setEvidenceIdx}
        disabled={freezeChoices}
        vocabularyWords={vocabularyWords}
        candidateIndices={evidenceCandidates}
      />

      <Button
        type="button"
        className="clay-button bg-garden-success text-primary-foreground font-heading w-full rounded-xl"
        disabled={!canSubmit}
        onClick={handleCheck}
      >
        Check summary & evidence
      </Button>

      {reflecting && (
        <QuickReflection className="mt-1" onContinue={() => finishReflectionAndRetry()} />
      )}

      {passed && feedback && (
        <p className={`text-sm font-body text-primary`}>{feedback}</p>
      )}

      {revealed && correctOption && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 space-y-2">
          <p className="text-sm font-heading font-semibold text-amber-950">
            Here&apos;s the summary we&apos;d pick after {MAX_ACTIVITY_ATTEMPTS} tries — you&apos;re building skill!
          </p>
          <p className="text-sm font-body text-foreground">{correctOption.text}</p>
          <p className="text-xs text-muted-foreground font-body leading-snug border-t border-amber-200/80 pt-2 mt-1">
            Why this one: {explainSummaryCorrect(correctOption)}
          </p>
          <p className="text-xs text-muted-foreground font-body">
            Notice sentences that echo these ideas — that habit makes summaries easier every time.
          </p>
          <p className="text-xs text-amber-950/85">{PASSAGE_INLINE_HINT}</p>
        </div>
      )}

      {!passed && !revealed && !reflecting && feedback && (
        <p className="text-sm font-body text-destructive">{feedback}</p>
      )}
    </div>
  );
}
