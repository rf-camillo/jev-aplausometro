import { describe, expect, it } from "vitest";

import { shade } from "@/lib/core/color";

describe("shade", () => {
  it("darkens and lightens each channel, clamped to the valid range", () => {
    expect(shade("#804020", -0.5)).toBe("rgb(64, 32, 16)");
    expect(shade("#804020", 0)).toBe("rgb(128, 64, 32)");
    expect(shade("#ff8000", 1)).toBe("rgb(255, 255, 0)");
  });
});
