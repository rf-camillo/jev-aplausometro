import { describe, expect, it } from "vitest";

import { statusOf } from "@/lib/audience/status";

const answered = { post: "Um post avaliado pela plateia.", fromCache: false, latencyMs: 280 };

describe("statusOf", () => {
  it("says nothing before the first post", () => {
    expect(statusOf("", false, null)).toBeNull();
  });

  it("says the audience is reading while it is", () => {
    expect(statusOf("qualquer coisa", true, null)).toEqual({
      kind: "busy",
      text: "A plateia está lendo…",
    });
  });

  it("counts down the characters a short post still needs", () => {
    expect(statusOf("Curto demais", false, null)).toEqual({
      kind: "hint",
      text: "Mínimo de 20 caracteres (faltam 8)",
    });
  });

  it("keeps the answer for a short post evaluated on purpose", () => {
    const short = { ...answered, post: "Curto demais" };
    expect(statusOf("Curto demais", false, short)?.kind).toBe("done");
  });

  it("tells how fast Jev answered, or that the answer came from before", () => {
    expect(statusOf(answered.post, false, answered)?.text).toBe("Avaliado em 280 ms pelo Jev");
    expect(statusOf(answered.post, false, { ...answered, fromCache: true })?.text).toBe(
      "Já avaliado!",
    );
  });
});
