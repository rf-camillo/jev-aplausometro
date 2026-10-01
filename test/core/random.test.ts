import { describe, expect, it } from "vitest";

import { seededRandom } from "@/lib/core/random";

describe("seededRandom", () => {
  it("repeats the sequence for the same seed and stays in [0, 1)", () => {
    const first = seededRandom(42);
    const second = seededRandom(42);
    const values = Array.from({ length: 1000 }, () => first());
    expect(values.slice(0, 5)).toEqual(Array.from({ length: 5 }, () => second()));
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it("is roughly uniform", () => {
    const next = seededRandom(7);
    const buckets = [0, 0, 0, 0];
    for (let index = 0; index < 40_000; index++) {
      const bucket = Math.floor(next() * 4);
      buckets[bucket] = (buckets[bucket] ?? 0) + 1;
    }
    for (const count of buckets) expect(count).toBeGreaterThan(9_500);
  });
});
