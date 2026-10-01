import { REACTION_COLORS } from "@/components/theme/palette";
import { REACTION_INFO, REACTIONS } from "@/lib/audience/reactions";

export function BarLegend() {
  return (
    <ul className="legend bar-legend" aria-label="Legenda das cores">
      {REACTIONS.map((reaction) => (
        <li key={reaction}>
          <span className="bar-swatch" style={{ background: REACTION_COLORS[reaction] }} />
          {REACTION_INFO[reaction].label.toLowerCase()}
        </li>
      ))}
    </ul>
  );
}
