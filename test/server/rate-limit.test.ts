import { describe, expect, it } from "vitest";

import {
  createRateLimiter,
  EVALUATIONS_PER_MINUTE,
  evaluationsPerMinute,
} from "@/lib/server/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit inside the window and forgets old hits", () => {
    let time = 0;
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => time });
    expect([limiter.allow("a"), limiter.allow("a"), limiter.allow("a")]).toEqual([
      true,
      true,
      false,
    ]);
    expect(limiter.allow("b")).toBe(true);
    time = 1000;
    expect(limiter.allow("a")).toBe(true);
  });

  it("stops tracking the oldest client when it is full", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });
    limiter.allow("a");
    limiter.allow("b");
    limiter.allow("c");
    expect(limiter.allow("a")).toBe(true);
    expect(limiter.allow("c")).toBe(false);
  });

  it("keeps a blocked client from being the first forgotten, and coming back clean", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });
    limiter.allow("a");
    limiter.allow("b");
    expect(limiter.allow("a")).toBe(false);
    limiter.allow("c");
    expect(limiter.allow("a")).toBe(false);
  });
});

describe("evaluationsPerMinute", () => {
  it("is ten unless the environment sets a positive whole number", () => {
    expect(evaluationsPerMinute({})).toBe(EVALUATIONS_PER_MINUTE);
    expect(evaluationsPerMinute({ AUDIENCE_RATE_LIMIT: "1000" })).toBe(1000);
    for (const bad of ["0", "-5", "2.5", "muitos", ""]) {
      expect(evaluationsPerMinute({ AUDIENCE_RATE_LIMIT: bad })).toBe(EVALUATIONS_PER_MINUTE);
    }
  });
});
