import { X } from "lucide-react";

import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { JevConfidence, MostCommonReaction, PersonaScore } from "@/components/persona/PersonaFacts";
import { ReactionBar } from "@/components/persona/ReactionBar";
import type { Placing } from "@/lib/audience/ranking";

interface SpotlightCardProps {
  placing: Placing;
  onShowAll: () => void;
}

export function SpotlightCard({ placing: { item, rank }, onShowAll }: SpotlightCardProps) {
  return (
    <section className="spotlight-card" aria-label="Persona em destaque">
      <PersonaAvatar id={item.persona.id} size="medium" />
      <span className="spotlight-who">
        <strong>{item.persona.name}</strong>
        <span className="spotlight-rank">
          {rank === null ? "Fora do aplausômetro" : `${String(rank)}º no aplauso`}
        </span>
        <span className="persona-blurb">{item.persona.blurb}</span>
        <MostCommonReaction distribution={item.distribution} />
        {item.confidence !== null && <JevConfidence confidence={item.confidence} />}
      </span>
      <ReactionBar distribution={item.distribution} />
      <PersonaScore item={item} />
      <button type="button" className="button button-chip spotlight-close" onClick={onShowAll}>
        <X aria-hidden="true" />
        Mostrar todos
      </button>
    </section>
  );
}
