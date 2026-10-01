import { describe, expect, it } from "vitest";

import { createLru } from "@/lib/core/lru";

describe("createLru", () => {
  it("evicts the least recently used entry", () => {
    const cache = createLru<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.get("a")).toBe(1);
    cache.set("c", 3);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")).toBe(1);
    expect(cache.get("c")).toBe(3);
    expect(cache.size).toBe(2);
  });

  it("replaces a value without growing and keeps falsy values", () => {
    const cache = createLru<string, number>(2);
    cache.set("a", 1);
    cache.set("a", 0);
    expect(cache.size).toBe(1);
    expect(cache.get("a")).toBe(0);
  });

  it("refuses a capacity below one", () => {
    expect(() => createLru(0)).toThrow(RangeError);
  });
});
