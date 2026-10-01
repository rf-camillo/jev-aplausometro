import { personFigure } from "@/components/persona/person-figure";
import { bodyColor, CARD_COLORS, skinFor } from "@/components/theme/palette";
import { type Reaction, REACTION_INFO } from "@/lib/audience/reactions";
import type { Seat } from "@/lib/audience/seats";
import { PERSON, personShape } from "@/lib/stage/person";
import { placeInRows } from "@/lib/stage/placement";
import { REACTION_LOOK } from "@/lib/stage/reaction-look";

import { BOX } from "./card-style";

const CROWD = { width: 700, height: 470 };

function ReactionEmoji({
  reaction,
  x,
  y,
  unit,
}: {
  reaction: Reaction;
  x: number;
  y: number;
  unit: number;
}) {
  const { onFace, overHead } = REACTION_LOOK[reaction];
  if (!onFace && !overHead) return null;
  const size = (onFace ? PERSON.face.size : PERSON.badge.size) * unit;
  const centerY = y + (onFace ? PERSON.head.top : PERSON.badge.top) * unit;
  return (
    <div
      style={{
        ...BOX,
        position: "absolute",
        left: x - size / 2,
        top: centerY - size / 2,
        width: size,
        height: size,
        fontSize: size * 0.85,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {REACTION_INFO[reaction].emoji}
    </div>
  );
}

export function CardCrowd({ seats }: { seats: Seat[] }) {
  const placed = placeInRows(seats, CROWD);
  return (
    <div style={{ ...BOX, position: "relative", width: CROWD.width, height: CROWD.height }}>
      <svg
        width={CROWD.width}
        height={CROWD.height}
        viewBox={`0 0 ${String(CROWD.width)} ${String(CROWD.height)}`}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {placed.map(({ item, index, x, y, unit }) =>
          personFigure({
            key: index,
            shape: personShape(x, y, unit),
            body: bodyColor(item.personaId),
            skin: REACTION_LOOK[item.reaction].onFace ? null : skinFor(index),
            seat: CARD_COLORS.seat,
            opacity: REACTION_LOOK[item.reaction].opacity,
          }),
        )}
      </svg>
      {placed.map(({ item, index, x, y, unit }) => (
        <ReactionEmoji key={index} reaction={item.reaction} x={x} y={y} unit={unit} />
      ))}
    </div>
  );
}
