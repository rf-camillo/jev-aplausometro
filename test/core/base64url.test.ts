import { describe, expect, it } from "vitest";

import { decodeBase64Url, encodeBase64Url } from "@/lib/core/base64url";

describe("base64url", () => {
  it("round-trips any bytes through URL-safe characters without padding", () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, index) => index);
    const code = encodeBase64Url(bytes);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeBase64Url(code)).toEqual(bytes);
  });

  it("rejects strings that are not base64url", () => {
    expect(decodeBase64Url("")).toBeNull();
    expect(decodeBase64Url("com espaço")).toBeNull();
    expect(decodeBase64Url("a+b/")).toBeNull();
    expect(decodeBase64Url("A")).toBeNull();
  });
});
