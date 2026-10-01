import { REACTION_INFO, REACTIONS } from "@/lib/audience/reactions";

export function ReactionLegend() {
  return (
    <ul className="legend reaction-legend" aria-label="Legenda das reações">
      {REACTIONS.map((reaction) => (
        <li key={reaction}>
          <span aria-hidden="true">{REACTION_INFO[reaction].emoji}</span>{" "}
          {REACTION_INFO[reaction].label.toLowerCase()}
        </li>
      ))}
    </ul>
  );
}
