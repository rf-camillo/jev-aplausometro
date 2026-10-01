import { describe, expect, it } from "vitest";

import { interpretEvaluation } from "@/lib/audience/result";
import { linkedInComposerUrl, shareText } from "@/lib/audience/share-text";

import { fakeEvaluation, personaAt } from "../support/evaluations";

describe("shareText", () => {
  it("tells the score, the verdict, the fan, the critic and the link", () => {
    const fan = personaAt(4);
    const critic = personaAt(1);
    const result = interpretEvaluation(
      fakeEvaluation({ reactions: { [fan.id]: { applaud: 1 }, [critic.id]: { eyeroll: 1 } } }),
    );
    const text = shareText(result, "https://aplausometro.example/r/abc");
    expect(text).toContain(`${String(result.applause)} de 100`);
    expect(text).toContain(`Maior fã: ${fan.name}.`);
    expect(text).toContain(`Maior crítico: ${critic.name}.`);
    expect(text.endsWith("https://aplausometro.example/r/abc")).toBe(true);
  });
});

describe("linkedInComposerUrl", () => {
  it("opens the composer with the text encoded", () => {
    const url = new URL(linkedInComposerUrl("Olá & até já\nhttps://x.y/r/a"));
    expect(url.origin).toBe("https://www.linkedin.com");
    expect(url.searchParams.get("shareActive")).toBe("true");
    expect(url.searchParams.get("text")).toBe("Olá & até já\nhttps://x.y/r/a");
  });
});
