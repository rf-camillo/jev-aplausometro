import type { Spotlight } from "@/components/hooks/useSpotlight";
import type { Highlights, Standout } from "@/lib/audience/highlights";
import type { PersonaId } from "@/lib/audience/personas";
import { outsideTheMeter, rankByApplause } from "@/lib/audience/ranking";
import type { AudienceResult } from "@/lib/audience/result";

import { BarLegend } from "./BarLegend";
import { PersonaRow } from "./PersonaRow";

interface PersonaBreakdownProps {
  result: AudienceResult;
  highlights: Highlights;
  spotlight: Spotlight;
}

export function PersonaBreakdown({ result, highlights, spotlight }: PersonaBreakdownProps) {
  const standoutOf = (id: PersonaId): Standout | null =>
    id === highlights.fan.id ? "fan" : id === highlights.critic.id ? "critic" : null;
  return (
    <section className="panel" aria-labelledby="personas-title">
      <h2 id="personas-title" className="eyebrow panel-title">
        Quem reagiu como
      </h2>
      <p className="panel-hint">
        Do maior fã ao maior crítico. Clique numa persona para vê-la na plateia.
      </p>
      <BarLegend />
      <ol className="persona-list" aria-label="Ranking dos leitores">
        {rankByApplause(result).map((item, index) => (
          <PersonaRow
            key={item.persona.id}
            item={item}
            rank={index + 1}
            standout={standoutOf(item.persona.id)}
            spotlight={spotlight}
          />
        ))}
      </ol>
      <h3 className="eyebrow persona-aside-title">Só pela graça</h3>
      <p className="panel-hint">Reagem na plateia, mas ficam fora do aplausômetro.</p>
      <ul className="persona-list" aria-label="Fora do aplausômetro">
        {outsideTheMeter(result).map((item) => (
          <PersonaRow
            key={item.persona.id}
            item={item}
            rank={null}
            standout={null}
            spotlight={spotlight}
          />
        ))}
      </ul>
    </section>
  );
}
