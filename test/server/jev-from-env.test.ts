import { describe, expect, it } from "vitest";

import { jevClientFromEnv } from "@/lib/server/jev-from-env";

describe("jevClientFromEnv", () => {
  it("needs a key", () => {
    expect(jevClientFromEnv({})).toBeNull();
    expect(jevClientFromEnv({ TYPESAFE_API_KEY: "" })).toBeNull();
  });

  it("uses TypeSafe by default, or an endpoint of theirs over HTTPS", () => {
    expect(jevClientFromEnv({ TYPESAFE_API_KEY: "k" })).not.toBeNull();
    expect(
      jevClientFromEnv({ TYPESAFE_API_KEY: "k", TYPESAFE_API_URL: "https://api.typesafe.ai/v2" }),
    ).not.toBeNull();
  });

  it("allows a local stand-in, for the tests", () => {
    expect(
      jevClientFromEnv({ TYPESAFE_API_KEY: "k", TYPESAFE_API_URL: "http://127.0.0.1:4599" }),
    ).not.toBeNull();
  });

  it.each([
    "http://api.typesafe.ai/v1/systemone",
    "https://typesafe.ai.example.com/",
    "https://example.com/steal",
    "not a url",
  ])("never sends the key to %s", (endpoint) => {
    expect(jevClientFromEnv({ TYPESAFE_API_KEY: "k", TYPESAFE_API_URL: endpoint })).toBeNull();
  });
});
