import { describe, expect, it } from "vitest";

import { percent } from "@/lib/core/format";

describe("percent", () => {
  it("rounds a fraction to a whole percentage", () => {
    expect(percent(0)).toBe("0%");
    expect(percent(0.456)).toBe("46%");
    expect(percent(1)).toBe("100%");
  });
});
