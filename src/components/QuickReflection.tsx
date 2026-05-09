import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const REFLECTION_CHIPS = [
  { id: "story", label: "Matched the story" },
  { id: "sounded", label: "Sounded right" },
  { id: "unsure", label: "Not sure yet" },
  { id: "skip", label: "Skip" },
] as const;

export type ReflectionChoiceId = (typeof REFLECTION_CHIPS)[number]["id"];

type Props = {
  onContinue: (choiceId: ReflectionChoiceId, note?: string) => void;
  className?: string;
};

/** One-tap reasoning chips plus optional note — keeps guessing from feeling instantaneous. */
export default function QuickReflection({ onContinue, className }: Props) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div
      className={cn(
        "rounded-xl border border-violet-200/90 bg-violet-50/85 dark:bg-violet-950/25 dark:border-violet-400/30 p-3 space-y-2",
        className,
      )}
      role="region"
      aria-label="Quick reflection"
    >
      <p className="text-xs font-heading font-semibold text-violet-950 dark:text-violet-100">
        Quick pause — what guided your choice?
      </p>
      <div className="flex flex-wrap gap-2">
        {REFLECTION_CHIPS.map((chip) => (
          <Button
            key={chip.id}
            type="button"
            size="sm"
            variant="secondary"
            className="rounded-full text-xs font-heading h-8 px-3 border-violet-200/80"
            onClick={() => onContinue(chip.id, note.trim() || undefined)}
          >
            {chip.label}
          </Button>
        ))}
      </div>
      {!noteOpen ? (
        <button
          type="button"
          className="text-xs text-violet-700 dark:text-violet-300 underline underline-offset-2 font-body"
          onClick={() => setNoteOpen(true)}
        >
          Add a note (optional)
        </button>
      ) : (
        <Input
          placeholder="Optional note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="text-xs h-9 rounded-lg font-body"
          maxLength={200}
        />
      )}
    </div>
  );
}
