import { describe, expect, it } from "vitest";

import { findPersona, PERSONAS, SEATS_PER_PERSONA, TOTAL_SEATS } from "@/lib/audience/personas";

describe("the audience", () => {
  it("has 120 seats, ten per persona, and unique personas", () => {
    expect(TOTAL_SEATS).toBe(120);
    expect(PERSONAS.map((persona) => persona.seats)).toEqual(PERSONAS.map(() => SEATS_PER_PERSONA));
    expect(new Set(PERSONAS.map((persona) => persona.id)).size).toBe(PERSONAS.length);
  });

  it("gives every persona a blurb short enough for two lines in the cast", () => {
    for (const persona of PERSONAS) {
      expect(persona.blurb.length, persona.id).toBeGreaterThan(0);
      expect(persona.blurb.length, persona.id).toBeLessThanOrEqual(34);
    }
  });

  it("finds a persona by id, and nobody for an unknown one", () => {
    expect(findPersona("mom")?.name).toBe("Mãe");
    expect(findPersona("nobody")).toBeUndefined();
  });
});
