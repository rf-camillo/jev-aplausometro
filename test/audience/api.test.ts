import { describe, expect, it } from "vitest";

import { answerFromWire, answerToWire, errorMessageOf } from "@/lib/audience/api";
import { interpretEvaluation } from "@/lib/audience/result";

import { fakeEvaluation } from "../support/evaluations";

const answer = {
  result: interpretEvaluation(
    fakeEvaluation({ reactions: { mom: { applaud: 1 }, senior_dev: { eyeroll: 1 } } }),
  ),
  latencyMs: 280,
  model: "jev-1.13.0",
};

describe("the answer over the wire", () => {
  it("comes back the same, the personas named by id only", () => {
    const wire = answerToWire(answer);
    expect(wire.personas.map((item) => Object.keys(item))).toContainEqual([
      "id",
      "distribution",
      "confidence",
    ]);
    expect(answerFromWire(JSON.parse(JSON.stringify(wire)))).toEqual(answer);
  });

  it("is refused when it is not an answer", () => {
    const wire = answerToWire(answer);
    const [first, ...rest] = wire.personas;
    for (const body of [
      null,
      "texto",
      { ...wire, applause: 140 },
      { ...wire, personas: [{ ...first, id: "desconhecida" }, ...rest] },
      { ...wire, metrics: { clarity: 0.5 } },
      { ...wire, personas: [] },
      { ...wire, personas: [first, first, ...rest.slice(1)] },
      { ...wire, spreads: { ...wire.spreads, clarity: { levels: [0.5, 0.5], confidence: 0.5 } } },
      {
        ...wire,
        spreads: { ...wire.spreads, clarity: { levels: [0, 0, 0, 0, 0], confidence: 0.5 } },
      },
      {
        ...wire,
        spreads: { ...wire.spreads, clarity: { levels: [0, 0, 0, 0, 1.2], confidence: 0.5 } },
      },
      { ...wire, spreads: { clarity: null, cliche: null } },
    ]) {
      expect(answerFromWire(body)).toBeNull();
    }
  });
});

describe("errorMessageOf", () => {
  it("reads the message of an error body, and nothing else", () => {
    expect(errorMessageOf({ error: { code: "RATE_LIMITED", message: "Espere." } })).toBe("Espere.");
    expect(errorMessageOf({ oops: true })).toBeNull();
  });
});
