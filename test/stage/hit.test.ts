import { describe, expect, it } from "vitest";

import { seatAt } from "@/lib/stage/hit";
import type { SeatPosition } from "@/lib/stage/layout";

const size = { width: 1000, height: 500, unit: 40 };
const seat = (x: number, y: number, row: number): SeatPosition => ({ x, y, scale: 1, row });

describe("seatAt", () => {
  const positions = [seat(0.2, 0.5, 1), seat(0.5, 0.5, 1), seat(0.5, 0.55, 0)];

  it("finds the person under the point, from the top of the head to the seat", () => {
    expect(seatAt(positions, { x: 200, y: 250 }, size)).toBe(0);
    expect(seatAt(positions, { x: 220, y: 240 }, size)).toBe(0);
    expect(seatAt(positions, { x: 200, y: 290 }, size)).toBe(0);
  });

  it("returns null between people", () => {
    expect(seatAt(positions, { x: 350, y: 250 }, size)).toBeNull();
    expect(seatAt(positions, { x: 200, y: 200 }, size)).toBeNull();
  });

  it("prefers the front row where people overlap", () => {
    expect(seatAt(positions, { x: 500, y: 280 }, size)).toBe(2);
    expect(seatAt(positions, { x: 500, y: 240 }, size)).toBe(1);
  });

  it("scales the box with the person", () => {
    const small = [{ ...seat(0.2, 0.5, 1), scale: 0.5 }];
    expect(seatAt(small, { x: 210, y: 250 }, size)).toBe(0);
    expect(seatAt(small, { x: 215, y: 250 }, size)).toBeNull();
  });
});
