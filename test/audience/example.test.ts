import { describe, expect, it } from "vitest";

import { EXAMPLE_SHARE } from "@/lib/audience/example";
import { decodeShare } from "@/lib/audience/share";

describe("the example on the home page card", () => {
  it("is a valid shared result: the real cliché run, 27 of 100", () => {
    const example = decodeShare(EXAMPLE_SHARE);
    expect(example?.result.applause).toBe(27);
    expect(
      example?.result.personas.find((item) => item.persona.id === "senior_dev")?.distribution
        .eyeroll,
    ).toBeCloseTo(0.96, 2);
    expect(Object.values(example?.result.spreads ?? {}).every((spread) => spread !== null)).toBe(
      true,
    );
  });
});
