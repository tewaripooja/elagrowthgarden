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
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyReadingUtteranceVoice, speakExpressive } from "@/lib/readingVoice";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";
const MAX_CHECKPOINT_ATTEMPTS = 2;

// Pip messages for different reading moments
const PIP_READING   = ["Read carefully! Tap yellow words to learn them 🌟","Take your time — every word counts! 📖","I love this part! Keep reading 🦊","You're doing great — almost there! 💪"];
const PIP_CORRECT   = ["WAHOOOO! That's RIGHT! 🎉🌟","YES YES YES! You nailed it! 💫","Incredible! I knew you could! 🌸","PERFECT! You're a superstar! 🎊"];
const PIP_WRONG     = ["Hmm, not quite — check the right answer! 💪","Almost! Every mistake helps us learn 🌱","It's okay! I believe in you! 🤗"];
const PIP_TIMER     = ["Keep reading — I'm counting on you! ⏰","Just a few more seconds… 🌱","Reading builds your brain! 📚"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Inline Pip SVG
function PipMascot({ isHappy, isSpeaking }: { isHappy: boolean; isSpeaking: boolean }) {
  return (
    <svg
      width="52" height="52"
      viewBox="0 0 64 64"
      className={cn(
        "shrink-0 select-none",
        isHappy && "mascot-happy",
        isSpeaking && !isHappy && "mascot-speaking",
        !isSpeaking && !isHappy && "animate-pip-float",
      )}
      aria-hidden
    >
      <circle cx="32" cy="22" r="16" fill="#A8E6CF" />
      <ellipse cx="32" cy="38" rx="18" ry="15" fill="#A8E6CF" />
      <ellipse cx="32" cy="8" rx="13" ry="5" fill="#8B5E3C" />
      <rect x="23" y="5" width="18" height="6" rx="3" fill="#A0522D" />
      <ellipse cx="14" cy="30" rx="10" ry="6" fill="#5BBD4E" opacity=".85" transform="rotate(-25 14 30)" />
      <ellipse cx="50" cy="30" rx="10" ry="6" fill="#5BBD4E" opacity=".85" transform="rotate(25 50 30)" />
      <circle cx="26" cy="21" r="4" fill="white" />
      <circle cx="38" cy="21" r="4" fill="white" />
      <circle cx="27" cy="22" r="2.2" fill="#2a3a1a" />
      <circle cx="39" cy="22" r="2.2" fill="#2a3a1a" />
      <circle cx="27.7" cy="21.2" r=".9" fill="white" />
      <circle cx="39.7" cy="21.2" r=".9" fill="white" />
      <path
        d={isHappy ? "M26 28 Q32 36 38 28" : "M27 28 Q32 33 37 28"}
        fill="none" stroke="#2a3a1a" strokeWidth="1.8" strokeLinecap="round"
      />
    </svg>
  );
}

type Props = {
  storyKey: string;
  title: string;
  genre: string;
  story: string;
  vocabularyWords: { word: string; definition?: string }[];
  readingExtras?: StoryReadingExtras;
  userId: string | null;
  readingWpm?: number;
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
  readingWpm,
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

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [pipMessage, setPipMessage] = useState(() => pick(PIP_READING));
  const [pipKey, setPipKey] = useState(0);
  const [highlightRange, setHighlightRange] = useState<{ start: number; end: number } | null>(null);

  const [, setTimeTick] = useState(0);

  const readingAggRef = useRef({ seconds: 0, minimum: 0 });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fullReadUtteranceActiveRef = useRef(false);
  const cancelSpeechRef = useRef<() => void>(() => {});
  const happyResetTimeoutRef = useRef<number | null>(null);

  const clearMascotHappyTimer = useCallback(() => {
    if (happyResetTimeoutRef.current != null) {
      clearTimeout(happyResetTimeoutRef.current);
      happyResetTimeoutRef.current = null;
    }
  }, []);

  const stopSpeechSynthesisSession = useCallback(() => {
    cancelSpeechRef.current();
    cancelSpeechRef.current = () => {};
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    fullReadUtteranceActiveRef.current = false;
    setHighlightRange(null);
  }, []);

  const resetMascotMood = useCallback(() => {
    setIsSpeaking(false);
    setIsHappy(false);
  }, []);

  const sayPip = useCallback((msg: string) => {
    setPipMessage(msg);
    setPipKey((k) => k + 1);
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
    sayPip(pick(PIP_READING));
  }, [currentIndex, stopSpeechSynthesisSession, clearMascotHappyTimer, resetMascotMood, sayPip]);

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

  const startReadAloud = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    stopSpeechSynthesisSession();
    fullReadUtteranceActiveRef.current = true;
    setIsSpeaking(true);
    const cancel = speakExpressive(
      text,
      (start, end) => setHighlightRange({ start, end }),
      () => { fullReadUtteranceActiveRef.current = false; setIsSpeaking(false); setHighlightRange(null); },
      () => { fullReadUtteranceActiveRef.current = false; setIsSpeaking(false); setHighlightRange(null); },
    );
    cancelSpeechRef.current = cancel;
  }, [stopSpeechSynthesisSession]);

  useEffect(() => {
    return () => {
      stopSpeechSynthesisSession();
      clearMascotHappyTimer();
      resetMascotMood();
    };
  }, [stopSpeechSynthesisSession, clearMascotHappyTimer, resetMascotMood]);

  // DB hydration
  useEffect(() => {
    if (sectionCount === 0) {
      setHydrated(true);
      onComplete({ totalSecondsSpent: 0, totalMinimumSeconds: 1 });
      return;
    }
    if (!userId) { setHydrated(true); return; }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("reading_progress")
        .select("section_index, passed, seconds_spent")
        .eq("user_id", userId)
        .eq("story_key", storyKey);

      if (cancelled) return;
      if (error) { console.warn("reading_progress fetch:", error.message); setHydrated(true); return; }

      const passedSet = new Set<number>();
      for (const row of data ?? []) { if (row.passed) passedSet.add(row.section_index); }

      let resumeAt = sectionCount;
      let allDone = true;
      for (let i = 0; i < sectionCount; i++) {
        if (!passedSet.has(i)) { allDone = false; resumeAt = i; break; }
      }
      readingAggRef.current = { seconds: 0, minimum: 0 };
      for (let i = 0; i < resumeAt; i++) {
        const row = data?.find((r) => r.section_index === i);
        readingAggRef.current.seconds  += row?.seconds_spent ?? 0;
        readingAggRef.current.minimum  += minimumReadingSeconds(countWords(sections[i] ?? ""), readingWpm);
      }
      if (!allDone) setCurrentIndex(resumeAt);
      if (allDone) {
        let seconds = 0, minimum = 0;
        for (let i = 0; i < sectionCount; i++) {
          const row = data?.find((r) => r.section_index === i);
          seconds += row?.seconds_spent ?? 0;
          minimum += minimumReadingSeconds(countWords(sections[i] ?? ""), readingWpm);
        }
        if (!cancelled) {
          setHydrated(true);
          onComplete({ totalSecondsSpent: Math.max(0, seconds), totalMinimumSeconds: Math.max(1, minimum) });
        }
        return;
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => { cancelled = true; };
  }, [userId, storyKey, sectionCount, sections, onComplete]);

  const persistSection = useCallback(
    async (sectionIndex: number, passed: boolean, attempts: number, secondsSpent: number) => {
      if (!userId) return;
      const { error } = await supabase.from("reading_progress").upsert(
        { user_id: userId, story_key: storyKey, section_index: sectionIndex, attempts_used: attempts, passed, seconds_spent: secondsSpent, updated_at: new Date().toISOString() },
        { onConflict: "user_id,story_key,section_index" },
      );
      if (error) console.warn("reading_progress upsert:", error.message);
    },
    [userId, storyKey],
  );

  const sectionText = sections[currentIndex] ?? "";
  const minReadingSeconds = useMemo(() => minimumReadingSeconds(countWords(sectionText), readingWpm), [sectionText, readingWpm]);
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sectionEnteredAtRef.current) / 1000));
  const readingTimeMet = elapsedSeconds >= minReadingSeconds;
  const secondsUntilReadingOk = Math.max(0, minReadingSeconds - elapsedSeconds);
  const wordsHere = useMemo(() => vocabularyWordsInText(vocabularyWords, sectionText), [vocabularyWords, sectionText]);

  const toggleSectionReadAloud = useCallback(() => {
    if (!sectionText.trim()) return;
    if (fullReadUtteranceActiveRef.current) { stopSpeechSynthesisSession(); setIsSpeaking(false); return; }
    startReadAloud(sectionText);
  }, [sectionText, stopSpeechSynthesisSession, startReadAloud]);

  const handleCheckAnswer = useCallback(() => {
    if (checkpointPassed || selectedOption === null) return;
    const correct = selectedOption === checkpoint.correctIndex;
    const nextAttempts = attemptsUsed + 1;

    if (correct) {
      const seconds = Math.max(1, Math.round((Date.now() - sectionEnteredAtRef.current) / 1000));
      setAttemptsUsed(nextAttempts);
      setCheckpointPassed(true);
      setFeedback("correct");
      clearMascotHappyTimer();
      setIsHappy(true);
      playCorrectSound();
      sayPip(pick(PIP_CORRECT));
      happyResetTimeoutRef.current = window.setTimeout(() => {
        happyResetTimeoutRef.current = null;
        setIsHappy(false);
        sayPip(pick(PIP_READING));
      }, 2000);
      void persistSection(currentIndex, true, nextAttempts, seconds);
      return;
    }

    setFeedback("wrong");
    setAttemptsUsed(nextAttempts);
    playWrongSound();
    sayPip(pick(PIP_WRONG));

    if (nextAttempts >= MAX_CHECKPOINT_ATTEMPTS) {
      setRevealedAfterMax(true);
      setCheckpointPassed(true);
      const seconds = Math.max(1, Math.round((Date.now() - sectionEnteredAtRef.current) / 1000));
      void persistSection(currentIndex, true, nextAttempts, seconds);
    }
  }, [checkpointPassed, selectedOption, checkpoint.correctIndex, attemptsUsed, persistSection, currentIndex, clearMascotHappyTimer, sayPip]);

  const handleNextSection = useCallback(async () => {
    if (!checkpointPassed) return;
    const elapsed = Math.floor((Date.now() - sectionEnteredAtRef.current) / 1000);
    if (elapsed < minReadingSeconds) {
      sayPip(pick(PIP_TIMER));
      return;
    }
    const totalSeconds = Math.max(1, Math.round((Date.now() - sectionEnteredAtRef.current) / 1000));
    const secText = sections[currentIndex] ?? "";
    const minSuggested = minimumReadingSeconds(countWords(secText), readingWpm);
    readingAggRef.current.seconds += totalSeconds;
    readingAggRef.current.minimum += minSuggested;

    await persistSection(currentIndex, true, attemptsUsed, totalSeconds);
    if (currentIndex >= sectionCount - 1) {
      onComplete({ totalSecondsSpent: Math.max(0, readingAggRef.current.seconds), totalMinimumSeconds: Math.max(1, readingAggRef.current.minimum) });
      return;
    }
    setCurrentIndex((i) => i + 1);
  }, [checkpointPassed, minReadingSeconds, persistSection, currentIndex, attemptsUsed, sectionCount, onComplete, sections, sayPip]);

  if (!hydrated) {
    return (
      <div style={{ background:"rgba(255,255,255,.9)", borderRadius:20, padding:32, textAlign:"center", fontWeight:700, color:"#3a5a2a" }}>
        Loading your reading progress…
      </div>
    );
  }

  const nextLockedByCheckpoint = !checkpointPassed;
  const nextLockedByTime = checkpointPassed && !readingTimeMet;
  const isLast = currentIndex >= sectionCount - 1;
  const readingProgressPct = secondsUntilReadingOk <= 0 ? 100 : Math.round((elapsedSeconds / minReadingSeconds) * 100);

  return (
    <div style={{ background:"rgba(255,255,255,.92)", borderRadius:22, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,.10)", border:"2px solid rgba(255,255,255,.7)" }}>

      {/* ── HEADER ── */}
      <div style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", padding:"14px 18px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:900, color:"#fff", fontFamily:"'Nunito',sans-serif" }}>{title}</div>
            {readingExtras?.sectionTitles?.[currentIndex] && (
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.85)", marginTop:2 }}>
                {readingExtras.sectionTitles[currentIndex]}
              </div>
            )}
            <div style={{ display:"inline-block", marginTop:4, background:"rgba(255,255,255,.3)", borderRadius:20, padding:"3px 11px", fontSize:11, fontWeight:800, color:"#fff" }}>
              {genre}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Button
              type="button"
              variant={fullReadUtteranceActiveRef.current ? "default" : "secondary"}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full bg-white/30 hover:bg-white/50 border-0 text-white"
              onClick={toggleSectionReadAloud}
              disabled={!sectionText.trim()}
              aria-label={fullReadUtteranceActiveRef.current ? "Stop reading aloud" : "Read aloud"}
            >
              <Volume2 className="h-4 w-4" aria-hidden />
            </Button>
            <div style={{ fontSize:11, fontWeight:800, color:"rgba(255,255,255,.9)", background:"rgba(255,255,255,.2)", borderRadius:20, padding:"4px 11px" }}>
              Part {currentIndex + 1} / {sectionCount}
            </div>
          </div>
        </div>

        {/* Section progress dots */}
        <div style={{ display:"flex", gap:6 }} aria-label="Section progress">
          {sections.map((_, i) => (
            <div
              key={i}
              className={cn(
                "section-dot",
                i < currentIndex ? "done" : i === currentIndex ? "active" : "pending",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── PIP + STORY ── */}
      <div style={{ padding:"16px 18px" }}>
        {/* Pip row */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:10, marginBottom:14 }}>
          <PipMascot isHappy={isHappy} isSpeaking={isSpeaking} />
          <div key={pipKey} className="pip-bubble animate-pip-bubble-pop" style={{ flex:1 }}>
            {pipMessage}
          </div>
        </div>

        {/* Reading timer — only when checkpoint passed but time not met */}
        {nextLockedByTime && (
          <div style={{ marginBottom:14, display:"flex", justifyContent:"center" }}>
            <div className="reading-timer-pill animate-reading-timer">
              ⏱️ Keep reading… {secondsUntilReadingOk}s left
            </div>
          </div>
        )}

        {/* Reading progress bar (subtle) */}
        {checkpointPassed && !readingTimeMet && (
          <div style={{ background:"#e0f0cc", borderRadius:8, height:6, overflow:"hidden", marginBottom:12 }}>
            <div style={{ height:"100%", background:"#5BBD4E", borderRadius:8, width:`${readingProgressPct}%`, transition:"width 1s linear" }} />
          </div>
        )}

        {/* Story text */}
        <ReadingRichParagraph
          className="font-body"
          text={sectionText}
          vocabularyWords={wordsHere}
          extraKeyPhrases={readingExtras?.keyPhrases}
          autoHighlightOpening
          highlightRange={isSpeaking ? highlightRange : null}
        />
      </div>

      {/* ── CHECKPOINT ── */}
      <div
        className="animate-checkpoint-in"
        style={{
          margin:"0 14px 16px",
          background: feedback === "correct"
            ? "linear-gradient(135deg,#d5f5e3,#a8f0c0)"
            : feedback === "wrong"
            ? "linear-gradient(135deg,#fde8e8,#ffc8c8)"
            : "linear-gradient(135deg,#f0f8ff,#e8f4fd)",
          borderRadius:16,
          border: feedback === "correct"
            ? "2px solid #27ae60"
            : feedback === "wrong"
            ? "2px solid #e74c3c"
            : "2px solid #b8d8f8",
          padding:"14px 16px",
          transition:"background .3s, border-color .3s",
        }}
      >
        <p style={{ fontSize:17, fontWeight:800, color:"#1a3a5a", marginBottom:14, lineHeight:1.55 }}>
          {checkpoint.question}
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {checkpoint.options.map((opt, i) => {
            const isCorrect   = i === checkpoint.correctIndex;
            const showReveal  = revealedAfterMax && isCorrect;
            const isSelected  = selectedOption === i;
            const isDone      = checkpointPassed && !showReveal;

            let optStyle: React.CSSProperties = {
              borderRadius: 14,
              border: "2.5px solid",
              borderColor: "#c8e8a0",
              background: "#fff",
              padding: "13px 18px",
              fontSize: 16,
              fontWeight: 700,
              color: "#3a5a2a",
              cursor: isDone ? "default" : "pointer",
              textAlign: "left",
              width: "100%",
              fontFamily: "'Nunito',sans-serif",
              lineHeight: 1.45,
              transition: "all .15s",
              opacity: isDone && !showReveal ? 0.55 : 1,
            };
            if (isSelected && !checkpointPassed) {
              optStyle = { ...optStyle, borderColor:"#6c63ff", background:"#f0edff", color:"#3a1a8a" };
            }
            if (showReveal) {
              optStyle = { ...optStyle, borderColor:"#27ae60", background:"#d5f5e3", color:"#1a6a3a", opacity:1 };
            }

            return (
              <button
                key={i}
                type="button"
                disabled={isDone}
                onClick={() => !checkpointPassed && setSelectedOption(i)}
                style={optStyle}
                onMouseEnter={(e) => { if (!isDone) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback messages */}
        {feedback === "wrong" && !revealedAfterMax && (
          <p style={{ marginTop:12, fontSize:15, color:"#c0392b", fontWeight:700, lineHeight:1.4 }}>
            Not quite — try again ({Math.max(0, MAX_CHECKPOINT_ATTEMPTS - attemptsUsed)} {MAX_CHECKPOINT_ATTEMPTS - attemptsUsed === 1 ? "attempt" : "attempts"} left).
          </p>
        )}
        {revealedAfterMax && (
          <p style={{ marginTop:12, fontSize:15, color:"#8a5800", fontWeight:700, lineHeight:1.4 }}>
            Here is the correct answer. You can move on when you are ready.
          </p>
        )}
        {feedback === "correct" && (
          <p style={{ marginTop:12, fontSize:15, color:"#1a6a3a", fontWeight:800, lineHeight:1.4 }}>
            🎉 Nice work — that fits this part of the story!
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
          <button
            type="button"
            disabled={checkpointPassed || selectedOption === null}
            onClick={handleCheckAnswer}
            style={{
              borderRadius:13,
              border:"none",
              background: (checkpointPassed || selectedOption === null) ? "#ddd" : "linear-gradient(135deg,#6c63ff,#8b5cf6)",
              color: (checkpointPassed || selectedOption === null) ? "#999" : "#fff",
              padding:"12px 24px",
              fontSize:15,
              fontWeight:800,
              cursor: (checkpointPassed || selectedOption === null) ? "not-allowed" : "pointer",
              fontFamily:"'Nunito',sans-serif",
              transition:"transform .15s",
            }}
            onMouseEnter={(e) => { if (!(checkpointPassed || selectedOption === null)) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
          >
            Check answer
          </button>
          <button
            type="button"
            disabled={nextLockedByCheckpoint}
            onClick={() => void handleNextSection()}
            style={{
              borderRadius:13,
              border:"none",
              background: nextLockedByCheckpoint
                ? "#ddd"
                : nextLockedByTime
                ? "linear-gradient(135deg,#f0c030,#e0a020)"
                : "linear-gradient(135deg,#5BBD4E,#27ae60)",
              color: nextLockedByCheckpoint ? "#999" : "#fff",
              padding:"12px 24px",
              fontSize:15,
              fontWeight:800,
              cursor: nextLockedByCheckpoint ? "not-allowed" : "pointer",
              fontFamily:"'Nunito',sans-serif",
              boxShadow: nextLockedByCheckpoint ? "none" : "0 4px 0 0 rgba(22,163,74,.3)",
              transition:"transform .15s",
              display:"flex",
              alignItems:"center",
              gap:6,
            }}
            onMouseEnter={(e) => { if (!nextLockedByCheckpoint) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
          >
            {nextLockedByTime && <span>⏱️</span>}
            {isLast ? "Start activities 🎯" : "Next section →"}
          </button>
        </div>
      </div>
    </div>
  );
}
