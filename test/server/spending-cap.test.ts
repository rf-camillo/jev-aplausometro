import { describe, expect, it } from "vitest";

import { createSpendingCap, evaluationsPerDay } from "@/lib/server/spending-cap";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

describe("createSpendingCap", () => {
  it("refuses past the minute's budget, and allows again when the minute turns", () => {
    let time = 0;
    const cap = createSpendingCap({ perMinute: 2, perDay: 100, now: () => time });
    expect([cap.spend(), cap.spend(), cap.spend()]).toEqual([true, true, false]);
    time = MINUTE;
    expect(cap.spend()).toBe(true);
  });

  it("refuses past the day's budget, even across minutes, until the day turns", () => {
    let time = 0;
    const cap = createSpendingCap({ perMinute: 10, perDay: 3, now: () => time });
    for (const minute of [0, 1, 2]) {
      time = minute * MINUTE;
      expect(cap.spend()).toBe(true);
    }
    time = 3 * MINUTE;
    expect(cap.spend()).toBe(false);
    time = DAY;
    expect(cap.spend()).toBe(true);
  });
});

describe("evaluationsPerDay", () => {
  it("turns five dollars into about 41 thousand evaluations", () => {
    expect(evaluationsPerDay()).toBe(41_666);
    expect(evaluationsPerDay(0.00024)).toBe(2);
  });
});
