import { describe, expect, it } from "vitest";

import { ROWS, seatPositions } from "@/lib/stage/layout";
import { placeInRows } from "@/lib/stage/placement";

describe("placeInRows", () => {
  const box = { width: 700, height: 470 };
  const items = Array.from({ length: 120 }, (_, index) => `seat ${String(index)}`);
  const placed = placeInRows(items, box);

  it("gives item i the stage's seat i, scaled to the box", () => {
    const positions = seatPositions(ROWS);
    for (const { item, index, x, y } of placed) {
      expect(item).toBe(`seat ${String(index)}`);
      expect(x).toBeCloseTo((positions[index]?.x ?? 0) * box.width);
      expect(y).toBeCloseTo((positions[index]?.y ?? 0) * box.height);
    }
  });

  it("lists the back rows first, with smaller people than the front", () => {
    const ys = placed.map((seat) => seat.y);
    expect(ys).toEqual([...ys].sort((a, b) => a - b));
    expect(placed[0]?.unit).toBeLessThan(placed.at(-1)?.unit ?? 0);
  });

  it("leaves out items beyond the seats", () => {
    expect(placeInRows([...items, "one too many"], box)).toHaveLength(120);
  });
});
