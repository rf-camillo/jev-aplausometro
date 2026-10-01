import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { type Highlights, STANDOUT_LABELS, STANDOUTS } from "@/lib/audience/highlights";
import type { PersonaId } from "@/lib/audience/personas";

interface HighlightChipsProps {
  highlights: Highlights;
  pinned: PersonaId | null;
  onPick: (personaId: PersonaId) => void;
}

export function HighlightChips({ highlights, pinned, onPick }: HighlightChipsProps) {
  return (
    <div className="highlight-chips">
      {STANDOUTS.map((standout) => {
        const persona = highlights[standout];
        return (
          <button
            key={standout}
            type="button"
            className="highlight-chip"
            aria-pressed={pinned === persona.id}
            onClick={() => onPick(persona.id)}
          >
            <PersonaAvatar id={persona.id} size="small" />
            <span>
              {STANDOUT_LABELS[standout]}: <strong>{persona.name}</strong>
            </span>
          </button>
        );
      })}
    </div>
  );
}
