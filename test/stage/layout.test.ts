import { describe, expect, it } from "vitest";

import { TOTAL_SEATS } from "@/lib/audience/personas";
import {
  COMPACT_BELOW_PX,
  COMPACT_ROWS,
  layoutFor,
  ROWS,
  seatPositions,
  seatUnit,
} from "@/lib/stage/layout";

describe("seatPositions", () => {
  const positions = seatPositions();

  it("has one position per seat of the audience", () => {
    expect(ROWS.reduce((sum, count) => sum + count, 0)).toBe(TOTAL_SEATS);
    expect(COMPACT_ROWS.reduce((sum, count) => sum + count, 0)).toBe(TOTAL_SEATS);
    expect(seatPositions(COMPACT_ROWS)).toHaveLength(TOTAL_SEATS);
    expect(positions).toHaveLength(TOTAL_SEATS);
  });

  it("keeps every seat inside the stage and the back rows smaller and higher", () => {
    for (const seat of positions) {
      expect(seat.x).toBeGreaterThan(0);
      expect(seat.x).toBeLessThan(1);
      expect(seat.y).toBeGreaterThan(0);
      expect(seat.y).toBeLessThan(1);
    }
    const front = positions.filter((seat) => seat.row === 0);
    const back = positions.filter((seat) => seat.row === ROWS.length - 1);
    expect(Math.max(...back.map((seat) => seat.y))).toBeLessThan(
      Math.min(...front.map((seat) => seat.y)),
    );
    expect(back[0]?.scale).toBeLessThan(front[0]?.scale ?? 0);
  });

  it("goes from left to right, so each persona gets a sector", () => {
    for (let index = 1; index < positions.length; index++) {
      expect(positions[index]?.x).toBeGreaterThanOrEqual(positions[index - 1]?.x ?? 0);
    }
  });

  it("centers a row with a single seat", () => {
    const [seat] = seatPositions([1]);
    expect(seat).toMatchObject({ x: 0.5, scale: 1, row: 0 });
    expect(seat?.y).toBeCloseTo(0.79);
  });
});

describe("layoutFor", () => {
  it("switches to the compact rows on narrow screens", () => {
    expect(layoutFor(COMPACT_BELOW_PX - 1).rows).toBe(COMPACT_ROWS);
    expect(layoutFor(COMPACT_BELOW_PX).rows).toBe(ROWS);
  });
});

describe("seatUnit", () => {
  it("is limited by the tightest row side by side, or by the gap between rows", () => {
    const wide = seatUnit(10_000, 400, ROWS);
    const tall = seatUnit(400, 10_000, ROWS);
    expect(wide).toBeCloseTo((400 * 0.74) / (ROWS.length - 1) / 1.3);
    expect(tall).toBeLessThan(400 / 10);
  });

  it("grows with the stage", () => {
    expect(seatUnit(2000, 1000, ROWS)).toBeCloseTo(seatUnit(1000, 500, ROWS) * 2);
  });
});
