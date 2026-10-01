import { describe, expect, it } from "vitest";

import { METER, needleAngle, needleTip, segmentPath } from "@/lib/stage/meter";

describe("the meter", () => {
  it("turns the needle from left, through up, to right", () => {
    expect(needleAngle(0)).toBe(-90);
    expect(needleAngle(50)).toBe(0);
    expect(needleAngle(100)).toBe(90);
    expect(needleAngle(140)).toBe(90);
  });

  it("puts the tip where the needle points", () => {
    const up = needleTip(50);
    expect(up.x).toBeCloseTo(METER.pivot.x);
    expect(up.y).toBeCloseTo(METER.needle.tipY);
    expect(needleTip(0).x).toBeLessThan(METER.pivot.x);
    expect(needleTip(100).x).toBeGreaterThan(METER.pivot.x);
  });

  it("splits the arc into segments from its left end to its right end", () => {
    const numbers = (path: string) => (path.match(/-?\d+\.\d+/g) ?? []).map(Number);
    const [startX] = numbers(segmentPath(0, 5));
    const endX = numbers(segmentPath(4, 5)).at(-2);
    expect(startX).toBeCloseTo(METER.pivot.x - METER.arc.radius, 0);
    expect(endX).toBeCloseTo(METER.pivot.x + METER.arc.radius, 0);
  });
});
