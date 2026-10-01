import { ROWS, seatPositions, seatUnit } from "./layout";

export interface Placed<T> {
  item: T;
  /** The seat's number, which also picks its skin tone. */
  index: number;
  /** The seat's position and the person's size, in pixels of the box. */
  x: number;
  y: number;
  unit: number;
}

/**
 * Seats a crowd in the stage's wide layout, scaled to a box: the item at index i takes seat i,
 * as on the stage. Back rows come first, so drawing in order lets the front rows overlap them.
 */
export function placeInRows<T>(
  items: readonly T[],
  box: { width: number; height: number },
): Placed<T>[] {
  const positions = seatPositions(ROWS);
  const unit = seatUnit(box.width, box.height, ROWS);
  return items
    .flatMap((item, index) => {
      const position = positions[index];
      if (!position) return [];
      return [
        {
          item,
          index,
          x: position.x * box.width,
          y: position.y * box.height,
          unit: unit * position.scale,
        },
      ];
    })
    .sort((a, b) => a.y - b.y);
}
