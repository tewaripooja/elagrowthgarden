import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ReadingMetrics } from "@/lib/activityScoring";
import type { StoryReadingExtras } from "@/lib/ai";
import {
  buildSectionCheckpoint,
  countWords,
  minimumReadingSeconds,
  splitStoryIntoSections,
  vocabularyWordsInText,
  type SectionCheckpoint,
} from "@/lib/storySections";
import { ReadingRichParagraph } from "@/components/ReadingRichParagraph";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { applyReadingUtteranceVoice } from "@/lib/readingVoice";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
const MAX_CHECKPOINT_ATTEMPTS = 2;

type Props = {
  storyKey: string;
  title: string;
  genre: string;
  story: string;
  vocabularyWords: { word: string }[];
  readingExtras?: StoryReadingExtras;
  userId: string | null;
  onComplete: (metrics: ReadingMetrics) => void;
};

export default function StoryReadingFlow({
  storyKey,
  title,
  genre,
  story,
  vocabularyWords,
  readingExtras,
  userId,
  onComplete,
}: Props) {
  const storyText = story ?? "";
  const sections = useMemo(() => splitStoryIntoSections(storyText), [storyText]);
  const sectionCount = sections.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [checkpointPassed, setCheckpointPassed] = useState(false);
  const [revealedAfterMax, setRevealedAfterMax] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  /** Mascot: read-aloud / word taps / correct-answer celebration */
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);

  /** Re-render once per second so elapsed reading time updates. */
  const [, setTimeTick] = useState(0);

  const readingAggRef = useRef({ seconds: 0, minimum: 0 });

  /** Mascot: Web Speech + timers */
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fullReadUtteranceActiveRef = useRef(false);
  const happyResetTimeoutRef = useRef<number | null>(null);
  const clearMascotHappyTimer = useCallback(() => {
    if (happyResetTimeoutRef.current != null) {
      clearTimeout(happyResetTimeoutRef.current);
      happyResetTimeoutRef.current = null;
    }
  }, []);

  const stopSpeechSynthesisSession = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    fullReadUtteranceActiveRef.current = false;
  }, []);

  const resetMascotMood = useCallback(() => {
    setIsSpeaking(false);
    setIsHappy(false);
  }, []);

  const checkpoint: SectionCheckpoint = useMemo(
    () => buildSectionCheckpoint(sections, currentIndex),
    [sections, currentIndex],
  );

  const sectionEnteredAtRef = useRef<number>(Date.now());

  useEffect(() => {
    sectionEnteredAtRef.current = Date.now();
    stopSpeechSynthesisSession();
    clearMascotHappyTimer();
    resetMascotMood();
    setSelectedOption(null);
    setAttemptsUsed(0);
    setCheckpointPassed(false);
    setRevealedAfterMax(false);
    setFeedback(null);
  }, [
    currentIndex,
    stopSpeechSynthesisSession,
    clearMascotHappyTimer,
    resetMascotMood,
  ]);

  useEffect(() => {
    readingAggRef.current = { seconds: 0, minimum: 0 };
  }, [storyKey]);

  useEffect(() => {
    const id = window.setInterval(() => setTimeTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [currentIndex]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const primeVoices = () => void synth.getVoices();
    primeVoices();
    synth.addEventListener("voiceschanged", primeVoices);
    return () => synth.removeEventListener("voiceschanged", primeVoices);
  }, []);

  const startReadAloud = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      stopSpeechSynthesisSession();

      const utterance = new SpeechSynthesisUtterance(text);
      applyReadingUtteranceVoice(utterance);
      utteranceRef.current = utterance;
      fullReadUtteranceActiveRef.current = true;

      const stopSpeakingUi = () => {
        if (utteranceRef.current !== utterance) return;
        fullReadUtteranceActiveRef.current = false;
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utterance.onstart = () => {
        if (utteranceRef.current !== utterance) return;
        setIsSpeaking(true);
      };
      utterance.onend = stopSpeakingUi;
      utterance.onerror = stopSpeakingUi;

      window.speechSynthesis.speak(utterance);
    },
    [stopSpeechSynthesisSession],
  );

  useEffect(() => {
    return () => {
      stopSpeechSynthesisSession();
      clearMascotHappyTimer();
      resetMascotMood();
    };
  }, [stopSpeechSynthesisSession, clearMascotHappyTimer, resetMascotMood]);

  useEffect(() => {
    if (sectionCount === 0) {
      setHydrated(true);
      onComplete({ totalSecondsSpent: 0, totalMinimumSeconds: 1 });
      return;
    }

    if (!userId) {
      setHydrated(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("reading_progress")
        .select("section_index, passed, seconds_spent")
        .eq("user_id", userId)
        .eq("story_key", storyKey);

      if (cancelled) return;
      if (error) {
        console.warn("reading_progress fetch:", error.message);
        setHydrated(true);
        return;
      }

      const passedSet = new Set<number>();
      for (const row of data ?? []) {
        if (row.passed) passedSet.add(row.section_index);
      }
      let resumeAt = sectionCount;
      let allDone = true;
      for (let i = 0; i < sectionCount; i++) {
        if (!passedSet.has(i)) {
          allDone = false;
          resumeAt = i;
          break;
        }
      }
      readingAggRef.current = { seconds: 0, minimum: 0 };
      for (let i = 0; i < resumeAt; i++) {
        const row = data?.find((r) => r.section_index === i);
        readingAggRef.current.seconds += row?.seconds_spent ?? 0;
        readingAggRef.current.minimum += minimumReadingSeconds(countWords(sections[i] ?? ""));
      }
      if (!allDone) {
        setCurrentIndex(resumeAt);
      }
      if (allDone) {
        let seconds = 0;
        let minimum = 0;
        for (let i = 0; i < sectionCount; i++) {
          const row = data?.find((r) => r.section_index === i);
          seconds += row?.seconds_spent ?? 0;
          minimum += minimumReadingSeconds(countWords(sections[i] ?? ""));
        }
        if (!cancelled) {
          setHydrated(true);
          onComplete({
            totalSecondsSpent: Math.max(0, seconds),
            totalMinimumSeconds: Math.max(1, minimum),
          });
        }
        return;
      }
      if (!cancelled) setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, storyKey, sectionCount, sections, onComplete]);

  const persistSection = useCallback(
    async (sectionIndex: number, passed: boolean, attempts: number, secondsSpent: number) => {
      if (!userId) return;
      const { error } = await supabase.from("reading_progress").upsert(
        {
          user_id: userId,
          story_key: storyKey,
          section_index: sectionIndex,
          attempts_used: attempts,
          passed,
          seconds_spent: secondsSpent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,story_key,section_index" },
      );
      if (error) console.warn("reading_progress upsert:", error.message);
    },
    [userId, storyKey],
  );

  const sectionText = sections[currentIndex] ?? "";
  const minReadingSeconds = useMemo(
    () => minimumReadingSeconds(countWords(sectionText)),
    [sectionText],
  );
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - sectionEnteredAtRef.current) / 1000),
  );
  const readingTimeMet = elapsedSeconds >= minReadingSeconds;
  const wordsHere = useMemo(
    () => vocabularyWordsInText(vocabularyWords, sectionText),
    [vocabularyWords, sectionText],
  );

  const toggleSectionReadAloud = useCallback(() => {
    if (!sectionText.trim()) return;
    if (fullReadUtteranceActiveRef.current) {
      stopSpeechSynthesisSession();
      setIsSpeaking(false);
      return;
    }
    startReadAloud(sectionText);
  }, [sectionText, stopSpeechSynthesisSession, startReadAloud]);

  const mascotMotion = useMemo(() => {
    const celebrating = isHappy;
    const speakingMotion = isSpeaking && !celebrating;
    const idleMotion = !isSpeaking && !celebrating;
    return {
      wrapClassName: cn(
        "mascot-container shrink-0 self-start",
        celebrating && "mascot-happy",
        speakingMotion && "mascot-speaking",
        idleMotion && "mascot-idle",
      ),
      mediaClassName: cn(
        "mascot-image relative z-0 block w-full max-w-[800px] sm:max-w-[960px] h-auto rounded-lg object-contain select-none",
        idleMotion && "mascot-idle-breathe",
      ),
    };
  }, [isHappy, isSpeaking]);

  const handleCheckAnswer = useCallback(() => {
    if (checkpointPassed || selectedOption === null) return;

    const correct = selectedOption === checkpoint.correctIndex;
    const nextAttempts = attemptsUsed + 1;

    if (correct) {
      const seconds = Math.max(
        1,
        Math.round((Date.now() - sectionEnteredAtRef.current) / 1000),
      );
      setAttemptsUsed(nextAttempts);
      setCheckpointPassed(true);
      setFeedback("correct");
      clearMascotHappyTimer();
      setIsHappy(true);
      happyResetTimeoutRef.current = window.setTimeout(() => {
        happyResetTimeoutRef.current = null;
        setIsHappy(false);
      }, 1000);
      void persistSection(currentIndex, true, nextAttempts, seconds);
      return;
    }

    setFeedback("wrong");
    setAttemptsUsed(nextAttempts);

    if (nextAttempts >= MAX_CHECKPOINT_ATTEMPTS) {
      setRevealedAfterMax(true);
      setCheckpointPassed(true);
      const seconds = Math.max(
        1,
        Math.round((Date.now() - sectionEnteredAtRef.current) / 1000),
      );
      void persistSection(currentIndex, true, nextAttempts, seconds);
    }
  }, [
    checkpointPassed,
    selectedOption,
    checkpoint.correctIndex,
    attemptsUsed,
    persistSection,
    currentIndex,
    clearMascotHappyTimer,
  ]);

  const handleNextSection = useCallback(async () => {
    if (!checkpointPassed) return;
    const elapsed = Math.floor((Date.now() - sectionEnteredAtRef.current) / 1000);
    if (elapsed < minReadingSeconds) {
      const remain = Math.max(1, minReadingSeconds - elapsed);
      toast.message("Take your time with this part", {
        description: `Reading at about 150 words per minute, we suggest around ${minReadingSeconds}s here. About ${remain}s left before you can move on.`,
      });
      return;
    }
    const totalSeconds = Math.max(1, Math.round((Date.now() - sectionEnteredAtRef.current) / 1000));
    const secText = sections[currentIndex] ?? "";
    const minSuggested = minimumReadingSeconds(countWords(secText));
    readingAggRef.current.seconds += totalSeconds;
    readingAggRef.current.minimum += minSuggested;

    await persistSection(currentIndex, true, attemptsUsed, totalSeconds);
    if (currentIndex >= sectionCount - 1) {
      onComplete({
        totalSecondsSpent: Math.max(0, readingAggRef.current.seconds),
        totalMinimumSeconds: Math.max(1, readingAggRef.current.minimum),
      });
      return;
    }
    setCurrentIndex((i) => i + 1);
  }, [
    checkpointPassed,
    minReadingSeconds,
    persistSection,
    currentIndex,
    attemptsUsed,
    sectionCount,
    onComplete,
    sections,
  ]);

  if (!hydrated) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-center font-heading text-foreground border border-white/50">
        Loading your reading progress…
      </div>
    );
  }

  const nextLockedByCheckpoint = !checkpointPassed;
  const nextLockedByTime = checkpointPassed && !readingTimeMet;
  const isLast = currentIndex >= sectionCount - 1;
  const secondsUntilReadingOk = Math.max(0, minReadingSeconds - elapsedSeconds);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 md:p-7 shadow-sm border border-white/50 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            <Button
              type="button"
              variant={fullReadUtteranceActiveRef.current ? "default" : "secondary"}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={toggleSectionReadAloud}
              disabled={!sectionText.trim()}
              aria-label={fullReadUtteranceActiveRef.current ? "Stop reading aloud" : "Read aloud"}
              aria-pressed={fullReadUtteranceActiveRef.current}
            >
              <Volume2 className={cn("h-4 w-4", fullReadUtteranceActiveRef.current && "opacity-95")} aria-hidden />
            </Button>
          </div>
          <span className="mt-1 inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-heading rounded-full">
            {genre}
          </span>
        </div>
        <p className="text-sm font-heading text-muted-foreground shrink-0">
          Part {currentIndex + 1} of {sectionCount}
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap" aria-label="Section progress">
        {sections.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-8 rounded-full transition-colors",
              i < currentIndex ? "bg-emerald-500" : i === currentIndex ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      {checkpointPassed && !readingTimeMet && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/60 pt-4 pb-1 text-xs font-medium text-muted-foreground">
          <span className="text-amber-800/90">
            Keep reading — Next unlocks in ~{secondsUntilReadingOk}s
          </span>
        </div>
      )}

      <div className="story-with-mascot flex flex-col sm:flex-row sm:items-start gap-4 pt-3">
        <div className={mascotMotion.wrapClassName}>
          <div className="relative inline-block leading-none">
            <img
              src="/images/mascot.png"
              alt="Reading helper mascot"
              width={1136}
              height={1192}
              className={mascotMotion.mediaClassName}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>
        <ReadingRichParagraph
          className="font-body min-w-0 flex-1"
          text={sectionText}
          vocabularyWords={wordsHere}
          extraKeyPhrases={readingExtras?.keyPhrases}
          autoHighlightOpening
        />
      </div>

      <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3">
        <p className="font-heading text-sm font-semibold text-foreground">{checkpoint.question}</p>
        <ul className="space-y-2">
          {checkpoint.options.map((opt, i) => {
            const isCorrect = i === checkpoint.correctIndex;
            const showReveal = revealedAfterMax && isCorrect;
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={checkpointPassed && !showReveal}
                  onClick={() => !checkpointPassed && setSelectedOption(i)}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2.5 text-sm font-body border transition-colors",
                    selectedOption === i && !checkpointPassed
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-background/80 hover:bg-background",
                    showReveal && "ring-2 ring-emerald-500 border-emerald-500/60",
                  )}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>

        {feedback === "wrong" && !revealedAfterMax && (
          <p className="text-sm text-destructive font-medium">
            Not quite — try again (
            {(() => {
              const left = Math.max(0, MAX_CHECKPOINT_ATTEMPTS - attemptsUsed);
              return `${left} ${left === 1 ? "attempt" : "attempts"} left`;
            })()}
            ).
          </p>
        )}
        {revealedAfterMax && (
          <p className="text-sm text-amber-800 font-medium">
            Here is the correct answer. You can move on when you are ready.
          </p>
        )}
        {feedback === "correct" && (
          <p className="text-sm text-emerald-700 font-medium">Nice work — that fits this part of the story.</p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="font-heading rounded-xl"
            disabled={checkpointPassed || selectedOption === null}
            onClick={handleCheckAnswer}
          >
            Check answer
          </Button>
          <Button
            type="button"
            className={cn(
              "font-heading rounded-xl",
              nextLockedByTime && "opacity-75",
            )}
            disabled={nextLockedByCheckpoint}
            onClick={() => void handleNextSection()}
          >
            {isLast ? "Start activities" : "Next section"}
          </Button>
        </div>
      </div>
    </div>
  );
}

