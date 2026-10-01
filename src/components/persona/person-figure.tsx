import type { ReactElement } from "react";

import { bodyPath, type PersonShape, personShape } from "@/lib/stage/person";

export const AVATAR_BOX = 64;
export const AVATAR_SHAPE = personShape(32, 18, 36);

interface PersonFigureOptions {
  shape: PersonShape;
  body: string;
  /** Null draws no head, for a face shown as an emoji instead. */
  skin: string | null;
  seat: string;
  opacity?: number;
  key?: number;
}

/**
 * A person as SVG: the seat, the shoulders and the head, from the same shape as the people on
 * the stage. A function rather than a component, because the share card's renderer (Satori)
 * takes only plain SVG elements inside an `<svg>`.
 */
export function personFigure({
  shape,
  body,
  skin,
  seat,
  opacity = 1,
  key,
}: PersonFigureOptions): ReactElement {
  return (
    <g key={key} opacity={opacity}>
      <rect
        x={shape.seat.x}
        y={shape.seat.y}
        width={shape.seat.width}
        height={shape.seat.height}
        rx={shape.seat.radius}
        fill={seat}
      />
      <path d={bodyPath(shape.body)} fill={body} />
      {skin && <circle cx={shape.head.cx} cy={shape.head.cy} r={shape.head.r} fill={skin} />}
    </g>
  );
}
