import { createElement } from "react";

import { cssVariables } from "@/components/theme/css-variables";
import { bodyColor, personaColor, personaSkin } from "@/components/theme/palette";
import type { PersonaId } from "@/lib/audience/personas";

import { AVATAR_BOX, AVATAR_SHAPE, personFigure } from "./person-figure";
import { personaIcon } from "./persona-icons";

interface PersonaAvatarProps {
  id: PersonaId;
  size?: "small" | "medium" | "large";
  /** A place in the ranking, which the badge shows instead of the prop on a phone. */
  rank?: number;
}

/** Decorative: the persona's name always sits next to it as text. */
export function PersonaAvatar({ id, size = "large", rank }: PersonaAvatarProps) {
  return (
    <span className={`avatar is-${size}`} aria-hidden="true">
      <svg viewBox={`0 0 ${String(AVATAR_BOX)} ${String(AVATAR_BOX)}`} className="avatar-figure">
        {personFigure({
          shape: AVATAR_SHAPE,
          body: bodyColor(id),
          skin: personaSkin(id),
          seat: "var(--stage-seat)",
        })}
      </svg>
      {size !== "small" && (
        <span className="avatar-badge" style={cssVariables({ "--persona": personaColor(id) })}>
          {createElement(personaIcon(id), { strokeWidth: 2 })}
          {rank !== undefined && <span className="avatar-rank">{rank}º</span>}
        </span>
      )}
    </span>
  );
}
