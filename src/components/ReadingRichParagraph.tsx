import { Fragment, useMemo } from "react";
import { cn } from "@/lib/utils";
import { buildReadingChunks, openingSentenceForHighlight } from "@/lib/storyReadingDecor";

function vocabularyCore(token: string) {
  return token.replace(/^[^\w']+|[^\w']+$/g, "");
}

const POP_COLORS = [
  "text-sky-700 dark:text-sky-400",
  "text-fuchsia-700 dark:text-fuchsia-400",
  "text-amber-700 dark:text-amber-400",
  "text-emerald-700 dark:text-emerald-400",
  "text-violet-700 dark:text-violet-400",
];

function popColorClass(core: string): string {
  let h = 0;
  for (let i = 0; i < core.length; i++) {
    h = (h + core.charCodeAt(i) * (i + 1)) % 1009;
  }
  return POP_COLORS[h % POP_COLORS.length];
}

type Props = {
  text: string;
  vocabularyWords: { word: string }[];
  /** Story-specific lines to emphasize (in addition to optional opening sentence). */
  extraKeyPhrases?: string[];
  /** When true, highlights the opening sentence when it looks complete enough. */
  autoHighlightOpening?: boolean;
  /** When set, each word is a button that triggers read-aloud for that word. Omit for display-only text. */
  onSpeakWord?: (rawToken: string) => void;
  className?: string;
};

export function ReadingRichParagraph({
  text,
  vocabularyWords,
  extraKeyPhrases,
  autoHighlightOpening = true,
  onSpeakWord,
  className,
}: Props) {
  const vocabLower = useMemo(
    () => new Set(vocabularyWords.map((w) => w.word.toLowerCase())),
    [vocabularyWords],
  );

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

  const wordClassName = (core: string, isVocab: boolean, usePop: boolean) =>
    cn(
      "inline rounded px-0.5 align-baseline font-inherit leading-inherit transition-colors",
      isVocab &&
        "font-extrabold text-accent underline decoration-accent/50 decoration-2 underline-offset-[3px]",
      !isVocab && usePop && popColorClass(core),
      !isVocab && !usePop && "text-foreground",
    );

  const renderTokenRow = (slice: string, keyPrefix: string) => {
    const interactive = typeof onSpeakWord === "function";
    const tokens = slice.match(/\S+|\s+/g) ?? [];
    return tokens.map((tok, ti) => {
      if (/^\s+$/.test(tok)) {
        return (
          <span key={`${keyPrefix}-ws-${ti}`} className="whitespace-pre-wrap">
            {tok}
          </span>
        );
      }
      const core = vocabularyCore(tok);
      const isVocab = vocabLower.has(core.toLowerCase());
      const usePop = core.length >= 9 && !isVocab;
      const key = `${keyPrefix}-w-${ti}-${core.slice(0, 16)}`;
      const cls = cn(
        wordClassName(core, isVocab, usePop),
        interactive &&
          "cursor-pointer border-0 bg-transparent p-0 shadow-none hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-1",
        !interactive && "cursor-default",
      );
      if (interactive) {
        return (
          <button key={key} type="button" onClick={() => onSpeakWord!(tok)} className={cls}>
            {tok}
          </button>
        );
      }
      return (
        <span key={key} className={cls}>
          {tok}
        </span>
      );
    });
  };

  return (
    <div className={cn("text-base sm:text-lg leading-relaxed sm:leading-loose text-foreground", className)}>
      {chunks.map((chunk, ci) =>
        chunk.type === "phrase" ? (
          <span
            key={`ph-${ci}`}
            className="reading-key-phrase-wrap mx-px inline rounded-md px-0.5 decoration-wavy"
          >
            {renderTokenRow(chunk.text, `ph-${ci}`)}
          </span>
        ) : (
          <Fragment key={`pl-${ci}`}>{renderTokenRow(chunk.text, `pl-${ci}`)}</Fragment>
        ),
      )}
    </div>
  );
}
