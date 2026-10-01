import { describe, expect, it } from "vitest";

import { TOTAL_SEATS } from "@/lib/audience/personas";
import { emptyDistribution } from "@/lib/audience/reactions";
import { interpretEvaluation } from "@/lib/audience/result";
import { apportion, arrangeSeats, countReactions } from "@/lib/audience/seats";

import { fakeEvaluation, personaAt } from "../support/evaluations";

describe("apportion", () => {
  it("gives every seat away and follows the probabilities", () => {
    const counts = apportion(
      { ...emptyDistribution(), applaud: 0.5, eyeroll: 0.23, ignore: 0.17, comment: 0.1 },
      20,
    );
    expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(20);
    expect(counts).toMatchObject({ applaud: 10, eyeroll: 5, ignore: 3, comment: 2 });
  });

  it("hands leftover seats to the largest remainders", () => {
    const third = 1 / 3;
    const counts = apportion(
      { ...emptyDistribution(), like: third, share: third, sleep: third },
      16,
    );
    expect([counts.like, counts.share, counts.sleep].sort()).toEqual([5, 5, 6]);
  });
});

describe("arrangeSeats", () => {
  const result = interpretEvaluation(
    fakeEvaluation({ fallback: { like: 0.5, applaud: 0.25, eyeroll: 0.25 } }),
  );

  it("seats all 120 people, persona by persona", () => {
    const seats = arrangeSeats(result, 1);
    expect(seats).toHaveLength(TOTAL_SEATS);
    expect(seats.slice(0, personaAt(0).seats).every((seat) => seat.personaId === "recruiter")).toBe(
      true,
    );
    expect(seats.filter((seat) => seat.reaction === "like")).toHaveLength(TOTAL_SEATS / 2);
  });

  it("seats the same seed the same way and another seed differently", () => {
    expect(arrangeSeats(result, 7)).toEqual(arrangeSeats(result, 7));
    expect(arrangeSeats(result, 7)).not.toEqual(arrangeSeats(result, 8));
  });

  it("counts the seats of each reaction given", () => {
    const seats = [
      { personaId: "mom", reaction: "applaud" },
      { personaId: "mom", reaction: "applaud" },
      { personaId: "coach", reaction: "eyeroll" },
    ] as const;
    expect(countReactions(seats)).toEqual([
      { reaction: "applaud", count: 2 },
      { reaction: "eyeroll", count: 1 },
    ]);
  });
});
