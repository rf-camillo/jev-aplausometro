import { describe, expect, it } from "vitest";

import {
  canEvaluate,
  LIVE_DELAY_MS,
  LIVE_MIN_LENGTH,
  LIVE_SPACING_MS,
  liveDelay,
  MAX_POST_LENGTH,
  normalizePost,
  shouldEvaluateLive,
} from "@/lib/audience/live";

describe("live evaluation rules", () => {
  it("treats drafts that differ only in spacing as the same post", () => {
    expect(normalizePost("  Olá,\t  rede!\n\n\n\nTchau  ")).toBe("Olá, rede!\n\nTchau");
  });

  it("reads LinkedIn's bold and italic letters as plain ones, keeping accents and emoji", () => {
    expect(normalizePost("O 𝗔𝗽𝗹𝗮𝘂𝘀𝗼̂𝗺𝗲𝘁𝗿𝗼 e o 𝘑𝘦𝘷, em Ｊｅｖ 👏")).toBe(
      "O Aplausômetro e o Jev, em Jev 👏",
    );
  });

  it("evaluates on its own only once the draft says enough", () => {
    expect(shouldEvaluateLive("a".repeat(LIVE_MIN_LENGTH - 1))).toBe(false);
    expect(shouldEvaluateLive("a".repeat(LIVE_MIN_LENGTH))).toBe(true);
    expect(shouldEvaluateLive("a".repeat(MAX_POST_LENGTH + 1))).toBe(false);
  });

  it("lets the button evaluate any non-empty post within the limit", () => {
    expect(canEvaluate("oi")).toBe(true);
    expect(canEvaluate("   ")).toBe(false);
  });

  it("waits for the pause, and keeps questions on their own spaced apart", () => {
    expect(liveDelay(10_000, null)).toBe(LIVE_DELAY_MS);
    expect(liveDelay(10_000, 9_000)).toBe(LIVE_SPACING_MS - 1_000);
    expect(liveDelay(10_000, 10_000 - LIVE_SPACING_MS)).toBe(LIVE_DELAY_MS);
    expect(liveDelay(10_000, 0)).toBe(LIVE_DELAY_MS);
  });
});
