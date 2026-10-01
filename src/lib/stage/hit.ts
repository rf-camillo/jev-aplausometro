import type { SeatPosition } from "./layout";
import { PERSON } from "./person";

/**
 * The seat under a point of the stage, in CSS pixels, or null when the point falls between
 * people. Front rows overlap the ones behind, so the frontmost person under the point wins.
 */
export function seatAt(
  positions: readonly SeatPosition[],
  point: { x: number; y: number },
  size: { width: number; height: number; unit: number },
): number | null {
  let hit: number | null = null;
  let frontmost = -Infinity;
  positions.forEach((position, index) => {
    const unit = size.unit * position.scale;
    const x = position.x * size.width;
    const y = position.y * size.height;
    const inside =
      Math.abs(point.x - x) <= PERSON.hit.halfWidth * unit &&
      point.y >= y + PERSON.hit.top * unit &&
      point.y <= y + PERSON.hit.bottom * unit;
    if (inside && position.y > frontmost) {
      hit = index;
      frontmost = position.y;
    }
  });
  return hit;
}
