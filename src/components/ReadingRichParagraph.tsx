import { Fragment, useMemo, useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { buildReadingChunks, openingSentenceForHighlight } from "@/lib/storyReadingDecor";

// ─── Types ────────────────────────────────────────────────────────────────────

type VocabWord = { word: string; definition?: string };

type DictMeaning = {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
};
type DictEntry = {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings: DictMeaning[];
};
type DictTooltip = {
  rawWord: string;          // original casing from text
  cleanWord: string;        // lowercase, stripped punctuation
  cx: number;
  wordTop: number;
  wordBottom: number;
  loading: boolean;
  entry: DictEntry | null;
  vocabDef?: string;        // instant definition from our vocab data
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function vocabularyCore(token: string) {
  return token.replace(/^[^\w']+|[^\w']+$/g, "");
}
function cleanForDict(token: string) {
  return token.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
}

const POP_COLORS = [
  "text-sky-700", "text-fuchsia-700", "text-amber-700",
  "text-emerald-700", "text-violet-700",
];
function popColorClass(core: string): string {
  let h = 0;
  for (let i = 0; i < core.length; i++) h = (h + core.charCodeAt(i) * (i + 1)) % 1009;
  return POP_COLORS[h % POP_COLORS.length];
}

const PART_OF_SPEECH_COLORS: Record<string, string> = {
  noun:        "#e8f4fd",
  verb:        "#f0ffe8",
  adjective:   "#fff9e8",
  adverb:      "#f8e8ff",
  pronoun:     "#ffe8f0",
  preposition: "#e8fff8",
  conjunction: "#f0e8ff",
  interjection:"#fff0e8",
};
const PART_OF_SPEECH_TEXT: Record<string, string> = {
  noun:"#1a6aa8", verb:"#2a7a2a", adjective:"#8B6000",
  adverb:"#6a1a8a", pronoun:"#8a1a5a", preposition:"#1a6a5a",
  conjunction:"#5a1a8a", interjection:"#8a4a1a",
};

// ─── Component Props ──────────────────────────────────────────────────────────

type Props = {
  text: string;
  vocabularyWords: VocabWord[];
  extraKeyPhrases?: string[];
  autoHighlightOpening?: boolean;
  onSpeakWord?: (rawToken: string) => void;
  highlightRange?: { start: number; end: number } | null;
  className?: string;
};

// ─── Dictionary Tooltip UI ────────────────────────────────────────────────────

function DictPopup({
  tt,
  onClose,
}: {
  tt: DictTooltip;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const TOOLTIP_W = 260;
  const MARGIN = 10;

  const placeAbove = tt.wordTop > 150;
  const rawLeft = tt.cx - TOOLTIP_W / 2;
  const left = Math.max(MARGIN, Math.min(rawLeft, (typeof window !== "undefined" ? window.innerWidth : 800) - TOOLTIP_W - MARGIN));
  const arrowOffset = Math.min(Math.max(tt.cx - left - 8, 12), TOOLTIP_W - 28);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  // Speak the word
  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(tt.cleanWord));
  };

  const meaning = tt.entry?.meanings?.[0];
  const def0 = meaning?.definitions?.[0];
  const phonetic = tt.entry?.phonetics?.find((p) => p.text)?.text ?? tt.entry?.phonetic;

  const posColor = PART_OF_SPEECH_COLORS[meaning?.partOfSpeech ?? ""] ?? "#f5f5f5";
  const posTextColor = PART_OF_SPEECH_TEXT[meaning?.partOfSpeech ?? ""] ?? "#555";

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left,
        width: TOOLTIP_W,
        ...(placeAbove
          ? { bottom: (typeof window !== "undefined" ? window.innerHeight : 600) - tt.wordTop + 8 }
          : { top: tt.wordBottom + 8 }),
        zIndex: 400,
        background: "#fff",
        border: "2.5px solid #FFD700",
        borderRadius: 16,
        boxShadow: "0 8px 28px rgba(0,0,0,.20)",
        fontFamily: "'Nunito',sans-serif",
        animation: "pip-bubble-pop .2s ease-out",
        overflow: "hidden",
      }}
    >
      {/* Arrow */}
      <div style={{ position:"absolute", left:arrowOffset, width:0, height:0,
        ...(placeAbove
          ? { bottom:-9, borderTop:"9px solid #FFD700", borderLeft:"9px solid transparent", borderRight:"9px solid transparent" }
          : { top:-9, borderBottom:"9px solid #FFD700", borderLeft:"9px solid transparent", borderRight:"9px solid transparent" }) }}/>
      <div style={{ position:"absolute", left:arrowOffset+1, width:0, height:0,
        ...(placeAbove
          ? { bottom:-7, borderTop:"7px solid #fff", borderLeft:"7px solid transparent", borderRight:"7px solid transparent" }
          : { top:-7, borderBottom:"7px solid #fff", borderLeft:"7px solid transparent", borderRight:"7px solid transparent" }) }}/>

      {/* Header */}
      <div style={{ background:"#fffde7", padding:"10px 14px 8px", borderBottom:"1.5px solid #FFE082", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:17, fontWeight:900, color:"#5a3a00", letterSpacing:.3 }}>
            {tt.rawWord}
          </div>
          {phonetic && (
            <div style={{ fontSize:11, color:"#8a7a50", fontWeight:600, marginTop:1 }}>{phonetic}</div>
          )}
        </div>
        <button type="button" onClick={speak}
          style={{ background:"#FFE082", border:"none", borderRadius:20, width:28, height:28, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
          title="Hear pronunciation">🔊</button>
        <button type="button" onClick={onClose}
          style={{ background:"none", border:"none", fontSize:16, cursor:"pointer", color:"#bbb", lineHeight:1, flexShrink:0 }}
          aria-label="Close">✕</button>
      </div>

      {/* Body */}
      <div style={{ padding:"10px 14px 12px" }}>
        {/* Loading */}
        {tt.loading && (
          <div style={{ fontSize:12, color:"#aaa", fontWeight:600, textAlign:"center", padding:"8px 0" }}>
            Looking it up… 📖
          </div>
        )}

        {/* Vocab instant definition (while loading or if no API result) */}
        {!tt.loading && tt.vocabDef && !tt.entry && (
          <div style={{ fontSize:13, fontWeight:700, color:"#3a3a2a", lineHeight:1.5 }}>
            📖 {tt.vocabDef}
          </div>
        )}

        {/* Full dictionary entry */}
        {!tt.loading && tt.entry && (
          <>
            {meaning && (
              <div style={{ display:"inline-block", background:posColor, color:posTextColor, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:800, marginBottom:8 }}>
                {meaning.partOfSpeech}
              </div>
            )}
            {def0 && (
              <div style={{ fontSize:13, fontWeight:700, color:"#2a3a2a", lineHeight:1.55, marginBottom: def0.example ? 8 : 0 }}>
                {def0.definition}
              </div>
            )}
            {def0?.example && (
              <div style={{ fontSize:12, fontWeight:600, color:"#6a6a8a", lineHeight:1.45, fontStyle:"italic", borderLeft:"2.5px solid #FFD700", paddingLeft:8 }}>
                "{def0.example}"
              </div>
            )}
            {/* Show our vocab definition if the API one is different */}
            {tt.vocabDef && def0 && tt.vocabDef.toLowerCase() !== def0.definition.toLowerCase().slice(0, tt.vocabDef.length) && (
              <div style={{ marginTop:8, fontSize:11, fontWeight:600, color:"#9a8a50", background:"#fffde7", borderRadius:8, padding:"5px 8px" }}>
                📚 Story meaning: {tt.vocabDef}
              </div>
            )}
          </>
        )}

        {/* Word not found */}
        {!tt.loading && tt.entry === null && !tt.vocabDef && (
          <div style={{ fontSize:12, color:"#aaa", fontWeight:600, textAlign:"center", padding:"4px 0" }}>
            Hmm, couldn't find this one! 🤔
          </div>
        )}
        {!tt.loading && tt.entry === null && tt.vocabDef && (
          <div style={{ fontSize:13, fontWeight:700, color:"#3a3a2a", lineHeight:1.5 }}>
            📖 {tt.vocabDef}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReadingRichParagraph({
  text,
  vocabularyWords,
  extraKeyPhrases,
  autoHighlightOpening = false,
  onSpeakWord,
  highlightRange,
  className,
}: Props) {
  const vocabLower = useMemo(
    () => new Set(vocabularyWords.map((w) => w.word.toLowerCase())),
    [vocabularyWords],
  );
  const defMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of vocabularyWords) {
      if (w.definition) m.set(w.word.toLowerCase(), w.definition);
    }
    return m;
  }, [vocabularyWords]);

  const [dictTooltip, setDictTooltip] = useState<DictTooltip | null>(null);

  const phrases = useMemo(() => {
    const acc = new Set<string>();
    for (const p of extraKeyPhrases ?? []) {
      const t = p.trim();
      if (t.length >= 12) acc.add(t);
    }
    if (autoHighlightOpening) {
      const open = openingSentenceForHighlight(text);
      if (open) acc.add(open);
    }
    return [...acc];
  }, [extraKeyPhrases, autoHighlightOpening, text]);

  const chunks = useMemo(() => buildReadingChunks(text, phrases), [text, phrases]);

  // Fetch from free Dictionary API
  const fetchDict = useCallback(async (cleanWord: string) => {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      if (!res.ok) {
        setDictTooltip((prev) => prev?.cleanWord === cleanWord ? { ...prev, loading: false, entry: null } : prev);
        return;
      }
      const data: DictEntry[] = await res.json();
      setDictTooltip((prev) =>
        prev?.cleanWord === cleanWord ? { ...prev, loading: false, entry: data[0] ?? null } : prev,
      );
    } catch {
      setDictTooltip((prev) => prev?.cleanWord === cleanWord ? { ...prev, loading: false, entry: null } : prev);
    }
  }, []);

  const handleWordClick = useCallback((
    rawWord: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const cleanWord = cleanForDict(rawWord);
    if (!cleanWord || cleanWord.length < 2) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;

    // Toggle off if same word
    if (dictTooltip?.cleanWord === cleanWord) {
      setDictTooltip(null);
      return;
    }

    const vocabDef = defMap.get(cleanWord) ?? defMap.get(rawWord.toLowerCase());

    setDictTooltip({
      rawWord,
      cleanWord,
      cx,
      wordTop: rect.top,
      wordBottom: rect.bottom,
      loading: true,
      entry: null,
      vocabDef,
    });

    void fetchDict(cleanWord);

    if (onSpeakWord) onSpeakWord(rawWord);
  }, [dictTooltip, defMap, fetchDict, onSpeakWord]);

  // Track first-occurrence of each vocab word (deduplicate yellow highlighting)
  const seenVocabWords = new Set<string>();

  // Karaoke yellow style
  const vocabStyle: React.CSSProperties = {
    background: "#fff9c4",
    borderRadius: 5,
    padding: "1px 5px",
    borderBottom: "2.5px solid #FFD700",
    color: "#8B6000",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "'Nunito',sans-serif",
    transition: "background .15s",
  };

  let runningOffset = 0;

  const renderTokenRow = (slice: string, keyPrefix: string, chunkStartOffset: number) => {
    const tokens = slice.match(/\S+|\s+/g) ?? [];
    let tokenOffset = 0;

    return tokens.map((tok, ti) => {
      const tokenAbsStart = chunkStartOffset + tokenOffset;
      const tokenAbsEnd = tokenAbsStart + tok.length;
      tokenOffset += tok.length;

      // Whitespace — plain span
      if (/^\s+$/.test(tok)) {
        return <span key={`${keyPrefix}-ws-${ti}`} className="whitespace-pre-wrap">{tok}</span>;
      }

      const core = vocabularyCore(tok);
      const coreLower = core.toLowerCase();
      const isVocab = vocabLower.has(coreLower);

      // Deduplicate: only first occurrence gets yellow highlight
      const isFirstOccurrence = isVocab && !seenVocabWords.has(coreLower);
      if (isVocab) seenVocabWords.add(coreLower);

      const usePop = core.length >= 9 && !isVocab;
      const key = `${keyPrefix}-w-${ti}-${core.slice(0, 16)}`;

      // Karaoke highlight (speaker active)
      const isSpoken =
        highlightRange != null &&
        tokenAbsStart < highlightRange.end &&
        tokenAbsEnd > highlightRange.start;

      // Determine style
      let wordStyle: React.CSSProperties | undefined;
      if (isSpoken) {
        wordStyle = { background: "#FFE44D", borderRadius: 4, padding: "0 3px", color: "#2a1a00", transition: "background 0.12s ease" };
      } else if (isFirstOccurrence) {
        wordStyle = vocabStyle;
      }

      // Base className (color for long words, etc.)
      const baseClass = cn(
        "inline align-baseline font-inherit leading-inherit transition-colors cursor-pointer",
        "border-0 bg-transparent p-0 shadow-none",
        "hover:bg-black/[.06] rounded-sm focus-visible:outline-none",
        isVocab && !isFirstOccurrence && "font-semibold",
        !isVocab && usePop && popColorClass(core),
        !isVocab && !usePop && "text-foreground",
      );

      return (
        <button
          key={key}
          type="button"
          className={baseClass}
          style={wordStyle}
          onClick={(e) => handleWordClick(tok, e)}
          title={isFirstOccurrence ? "Tap for meaning" : undefined}
        >
          {tok}
        </button>
      );
    });
  };

  return (
    <div className={cn("text-base sm:text-lg leading-relaxed sm:leading-loose text-foreground", className)}>
      {chunks.map((chunk, ci) => {
        const chunkOffset = runningOffset;
        runningOffset += chunk.text.length;

        return chunk.type === "phrase" ? (
          <span key={`ph-${ci}`} className="reading-key-phrase-wrap mx-px inline rounded-md px-0.5 decoration-wavy">
            {renderTokenRow(chunk.text, `ph-${ci}`, chunkOffset)}
          </span>
        ) : (
          <Fragment key={`pl-${ci}`}>
            {renderTokenRow(chunk.text, `pl-${ci}`, chunkOffset)}
          </Fragment>
        );
      })}

      {/* Dictionary popup */}
      {dictTooltip && (
        <DictPopup tt={dictTooltip} onClose={() => setDictTooltip(null)} />
      )}
    </div>
  );
}
