import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { PERSONAS } from "@/lib/audience/personas";

export function AudienceCast() {
  return (
    <section className="panel cast" aria-labelledby="cast-title">
      <h2 id="cast-title" className="eyebrow panel-title">
        Quem está na plateia
      </h2>
      <ul className="cast-list">
        {PERSONAS.map((persona) => (
          <li key={persona.id} className="cast-member">
            <PersonaAvatar id={persona.id} />
            <span className="cast-name">{persona.name}</span>
            <span className="cast-blurb">{persona.blurb}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
