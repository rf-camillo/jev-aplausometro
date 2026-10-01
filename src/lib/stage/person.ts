/**
 * A person of the audience, in units of their size: one drawing shared by the canvas, the
 * avatars, the share card and the pointer, so they all agree on where the head is.
 */
export const PERSON = {
  seat: { width: 1.44, height: 1.15, top: -0.05, radius: 0.3 },
  /** The upper half of an ellipse, the shoulders showing over the seat. */
  body: { top: 0.62, halfWidth: 0.62, halfHeight: 0.52 },
  head: { top: 0.02, radius: 0.36 },
  hands: { top: 0.42, radius: 0.12 },
  /** The reaction floating above the head, and the eye roll that replaces it. */
  badge: { top: -0.78, size: 0.7 },
  face: { size: 0.95 },
  /** Where a pointer counts as being on the person. */
  hit: { halfWidth: 0.62, top: -0.36, bottom: 1.1 },
} as const;

export interface PersonShape {
  seat: { x: number; y: number; width: number; height: number; radius: number };
  body: { cx: number; cy: number; rx: number; ry: number };
  head: { cx: number; cy: number; r: number };
}

/** Where each part of a person sitting at (x, y) falls, for a person `unit` pixels wide. */
export function personShape(x: number, y: number, unit: number): PersonShape {
  const { seat, body, head } = PERSON;
  return {
    seat: {
      x: x - (seat.width * unit) / 2,
      y: y + seat.top * unit,
      width: seat.width * unit,
      height: seat.height * unit,
      radius: seat.radius * unit,
    },
    body: { cx: x, cy: y + body.top * unit, rx: body.halfWidth * unit, ry: body.halfHeight * unit },
    head: { cx: x, cy: y + head.top * unit, r: head.radius * unit },
  };
}

export function bodyPath({ cx, cy, rx, ry }: PersonShape["body"]): string {
  return `M ${String(cx - rx)} ${String(cy)} a ${String(rx)} ${String(ry)} 0 0 1 ${String(2 * rx)} 0 Z`;
}
