import type { Spotlight } from "@/components/hooks/useSpotlight";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { MostCommonReaction, PersonaScore } from "@/components/persona/PersonaFacts";
import { ReactionBar } from "@/components/persona/ReactionBar";
import { StandoutBadge } from "@/components/persona/StandoutBadge";
import type { Standout } from "@/lib/audience/highlights";
import type { PersonaResult } from "@/lib/audience/result";

interface PersonaRowProps {
  item: PersonaResult;
  /** Null for a persona outside the meter, which has no place in the ranking. */
  rank: number | null;
  standout: Standout | null;
  spotlight: Spotlight;
}

/** One persona of the ranking; the whole row picks it, through the name's button. */
export function PersonaRow({ item, rank, standout, spotlight }: PersonaRowProps) {
  const { persona, distribution } = item;
  const pinned = spotlight.pinned === persona.id;
  const preview = () => {
    spotlight.onPreview(persona.id);
  };
  const leave = () => {
    spotlight.onPreview(null);
  };

  return (
    <li className={pinned ? "persona-row is-pinned" : "persona-row"}>
      <span className="persona-rank" aria-hidden="true">
        {rank !== null && `${String(rank)}º`}
      </span>
      <PersonaAvatar id={persona.id} size="medium" {...(rank !== null && { rank })} />
      <span className="persona-who">
        <button
          type="button"
          className="persona-name"
          aria-pressed={pinned}
          aria-label={`${persona.name}: destacar na plateia`}
          onMouseEnter={preview}
          onMouseLeave={leave}
          onFocus={preview}
          onBlur={leave}
          onClick={() => spotlight.onPin(persona.id)}
        >
          {persona.name}
        </button>
        {standout && <StandoutBadge standout={standout} />}
        <span className="wide-only persona-details">
          <span className="persona-blurb">{persona.blurb}</span>
          <MostCommonReaction distribution={distribution} />
        </span>
      </span>
      <ReactionBar distribution={distribution} />
      <PersonaScore item={item} />
    </li>
  );
}
