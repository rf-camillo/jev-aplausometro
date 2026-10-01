import { describe, expect, it } from "vitest";

import { recordFrom } from "@/lib/core/record";

describe("recordFrom", () => {
  it("gives every key its value", () => {
    expect(recordFrom(["a", "b"] as const, (key) => key.toUpperCase())).toEqual({ a: "A", b: "B" });
    expect(recordFrom([], () => 1)).toEqual({});
  });
});
