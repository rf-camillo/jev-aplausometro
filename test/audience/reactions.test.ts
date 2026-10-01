import { describe, expect, it } from "vitest";

import { emptyDistribution, REACTION_INFO, REACTIONS, topReaction } from "@/lib/audience/reactions";

describe("reactions", () => {
  it("are worth between nothing and a full applause", () => {
    for (const reaction of REACTIONS) {
      expect(REACTION_INFO[reaction].applause).toBeGreaterThanOrEqual(0);
      expect(REACTION_INFO[reaction].applause).toBeLessThanOrEqual(1);
    }
    expect(REACTION_INFO.applaud.applause).toBe(1);
    expect(REACTION_INFO.eyeroll.applause).toBe(0);
  });

  it("pick the most likely reaction, breaking ties by their order", () => {
    expect(topReaction({ ...emptyDistribution(), comment: 0.4, eyeroll: 0.6 })).toBe("eyeroll");
    expect(topReaction({ ...emptyDistribution(), like: 0.5, eyeroll: 0.5 })).toBe("like");
    expect(topReaction(emptyDistribution())).toBe("applaud");
  });
});
