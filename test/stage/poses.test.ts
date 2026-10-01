import { describe, expect, it } from "vitest";

import { REACTION_INFO, REACTIONS } from "@/lib/audience/reactions";
import { POSES } from "@/lib/stage/poses";
import { REACTION_LOOK } from "@/lib/stage/reaction-look";

describe("POSES", () => {
  it("shows each reaction the way the share card does", () => {
    for (const reaction of REACTIONS) {
      const pose = POSES[reaction](0.5, 0);
      const look = REACTION_LOOK[reaction];
      expect(pose.face === "eyeroll", reaction).toBe(look.onFace);
      expect(pose.opacity, reaction).toBe(look.opacity);
    }
  });

  it("floats the emoji of sharing, liking and commenting over the head", () => {
    for (const reaction of ["share", "like", "comment"] as const) {
      expect(POSES[reaction](0, 0).badge?.emoji).toBe(REACTION_INFO[reaction].emoji);
    }
  });

  it("claps, sleeps and waits in their own ways", () => {
    expect(POSES.applaud(0.1, 0).clapGap).toBeGreaterThan(0);
    expect(POSES.sleep(0.1, 0).snore).not.toBeNull();
    expect(POSES.idle(0, 0)).toMatchObject({ badge: null, clapGap: null, snore: null });
  });

  it("stays still at time zero, for readers who ask for less motion", () => {
    expect(POSES.like(0, 0)).toEqual(POSES.like(0, 0));
    expect(POSES.idle(0, 0).lift).toBe(0);
  });
});
