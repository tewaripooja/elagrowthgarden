import { useState } from "react";
import { splitIntoSentences } from "@/lib/storySections";
import { cn } from "@/lib/utils";

type VocabWord = { word: string; definition?: string };

type Props = {
  story: string;
  selectedIndex: number | null;
  onSelect: (sentenceIndex: number) => void;
  disabled?: boolean;
  label?: string;
  /** Optional vocab words — highlighted yellow with click-to-define inside sentences. */
  vocabularyWords?: VocabWord[];
  /**
   * When provided, only these sentence indices (into the full story) are shown.
   * onSelect still receives the original index so validation works unchanged.
   */
  candidateIndices?: number[];
};

/**
 * Render a sentence with vocabulary words highlighted in yellow.
 * Clicking a vocab word shows/hides its definition below the sentence.
 */
function HighlightedSentence({
  text,
  vocabMap,
}: {
  text: string;
  vocabMap: Map<string, string>;
}) {
  const [activeDef, setActiveDef] = useState<{ word: string; def: string } | null>(null);

  if (vocabMap.size === 0) return <>{text}</>;

  // Build a regex that matches any vocabulary word
  const escaped = [...vocabMap.keys()].map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");

  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));

    const raw  = match[0];
    const key  = raw.toLowerCase();
    const def  = vocabMap.get(key) ?? "";
    const isActive = activeDef?.word.toLowerCase() === key;

    parts.push(
      <span
        key={`${match.index}-${raw}`}
        onClick={(e) => {
          e.stopPropagation(); // don't trigger sentence selection
          setActiveDef(isActive ? null : { word: raw, def });
        }}
        style={{
          background: isActive ? "#FFE44D" : "#fff9c4",
          borderRadius: 5,
          padding: "1px 5px",
          borderBottom: `2.5px solid ${isActive ? "#f0a800" : "#FFD700"}`,
          color: "#8B6000",
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "'Nunito',sans-serif",
          transition: "background .15s",
          userSelect: "none",
        }}
      >
        {raw}
      </span>,
    );

    lastIdx = match.index + raw.length;
  }

  if (lastIdx < text.length) parts.push(text.slice(lastIdx));

  return (
    <>
      {parts}
      {activeDef && (
        <span
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "block",
            marginTop: 6,
            background: "#fffde7",
            border: "1.5px solid #FFD700",
            borderRadius: 10,
            padding: "7px 12px",
            fontSize: 13,
            fontWeight: 700,
            color: "#5a3a00",
            fontFamily: "'Nunito',sans-serif",
            lineHeight: 1.4,
            animation: "pip-bubble-pop .2s ease-out",
          }}
        >
          <span style={{ fontWeight: 900, color: "#8B6000", marginRight: 6 }}>{activeDef.word}:</span>
          📖 {activeDef.def}
        </span>
      )}
    </>
  );
}

/** Tap a sentence to select it as evidence (simple reading-comprehension interaction). */
export default function EvidenceSentencePicker({
  story,
  selectedIndex,
  onSelect,
  disabled,
  label = "Tap a sentence from the story that supports your answer.",
  vocabularyWords = [],
  candidateIndices,
}: Props) {
  const allSentences = splitIntoSentences(story ?? "");

  // If a curated shortlist is provided use it, otherwise show everything
  const visiblePairs: { idx: number; text: string }[] =
    candidateIndices && candidateIndices.length > 0
      ? candidateIndices
          .filter(i => i >= 0 && i < allSentences.length)
          .map(i => ({ idx: i, text: allSentences[i]! }))
      : allSentences.map((text, idx) => ({ idx, text }));

  // Build lowercase → definition map for fast lookup
  const vocabMap = new Map<string, string>();
  for (const w of vocabularyWords) {
    if (w.definition) vocabMap.set(w.word.toLowerCase(), w.definition);
  }

  return (
    <div className="space-y-2">
      <p style={{ fontSize: 14, fontWeight: 700, color: "#3a3a5a", fontFamily: "'Nunito',sans-serif" }}>
        {label}
        {vocabMap.size > 0 && (
          <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600, color: "#8B6000" }}>
            (tap yellow words to see meanings)
          </span>
        )}
      </p>
      <div
        className="rounded-xl border border-border bg-muted/20 p-3 space-y-2"
        role="list"
      >
        {visiblePairs.map(({ idx, text }, displayPos) => {
          const isSel = selectedIndex === idx;
          return (
            <div
              key={idx}
              role="listitem"
              onClick={() => !disabled && onSelect(idx)}
              className={cn(
                "w-full text-left rounded-lg px-3 py-2.5 leading-relaxed transition-colors",
                "border border-transparent hover:bg-accent/10",
                isSel && "bg-accent/20 border-accent ring-2 ring-accent/30",
                disabled && "opacity-60 cursor-not-allowed",
                !disabled && "cursor-pointer",
              )}
              style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 600 }}
            >
              <span style={{ color: "#a0a0c0", marginRight: 8, fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>
                {displayPos + 1}.
              </span>
              <HighlightedSentence text={text} vocabMap={vocabMap} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
