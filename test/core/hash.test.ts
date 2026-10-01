import { describe, expect, it } from "vitest";

import { hashString } from "@/lib/core/hash";

describe("hashString", () => {
  it("is stable and spreads similar inputs", () => {
    expect(hashString("")).toBe(0x811c9dc5);
    expect(hashString("aplausômetro")).toBe(hashString("aplausômetro"));
    expect(hashString("post a")).not.toBe(hashString("post b"));
  });
});
