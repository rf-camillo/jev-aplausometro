import { AVATAR_BOX, AVATAR_SHAPE, personFigure } from "@/components/persona/person-figure";
import { bodyColor, CARD_COLORS, personaSkin } from "@/components/theme/palette";
import type { Persona } from "@/lib/audience/personas";

import { BOX } from "./card-style";

export function CardStandout({ role, persona }: { role: string; persona: Persona }) {
  return (
    <div style={{ ...BOX, alignItems: "center", gap: 12, fontSize: 22 }}>
      <svg width={40} height={40} viewBox={`0 0 ${String(AVATAR_BOX)} ${String(AVATAR_BOX)}`}>
        {personFigure({
          shape: AVATAR_SHAPE,
          body: bodyColor(persona.id),
          skin: personaSkin(persona.id),
          seat: CARD_COLORS.seat,
        })}
      </svg>
      <div style={{ ...BOX, color: CARD_COLORS.muted }}>{`${role}:`}</div>
      <div style={{ ...BOX, fontWeight: 600 }}>{persona.name}</div>
    </div>
  );
}
