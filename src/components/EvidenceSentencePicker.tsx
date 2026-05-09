import { splitIntoSentences } from "@/lib/storySections";
import { cn } from "@/lib/utils";

type Props = {
  story: string;
  selectedIndex: number | null;
  onSelect: (sentenceIndex: number) => void;
  disabled?: boolean;
  label?: string;
};

/** Tap a sentence to select it as evidence (simple reading-comprehension interaction). */
export default function EvidenceSentencePicker({
  story,
  selectedIndex,
  onSelect,
  disabled,
  label = "Tap a sentence from the story that supports your answer.",
}: Props) {
  const sentences = splitIntoSentences(story ?? "");

  return (
    <div className="space-y-2">
      <p className="text-sm font-heading font-semibold text-foreground">{label}</p>
      <div
        className="rounded-xl border border-border bg-muted/20 p-3 max-h-[min(280px,45vh)] overflow-y-auto space-y-2"
        role="list"
      >
        {sentences.map((sentence, i) => {
          const isSel = selectedIndex === i;
          return (
            <button
              key={i}
              type="button"
              role="listitem"
              disabled={disabled}
              onClick={() => !disabled && onSelect(i)}
              className={cn(
                "w-full text-left rounded-lg px-3 py-2.5 text-sm font-body leading-relaxed transition-colors",
                "border border-transparent hover:bg-accent/10",
                isSel && "bg-accent/20 border-accent ring-2 ring-accent/30",
                disabled && "opacity-60 cursor-not-allowed",
              )}
            >
              <span className="text-muted-foreground mr-2 font-mono text-xs">{i + 1}.</span>
              {sentence}
            </button>
          );
        })}
      </div>
    </div>
  );
}
