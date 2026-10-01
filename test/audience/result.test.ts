import { describe, expect, it } from "vitest";

import { METER_SEATS } from "@/lib/audience/personas";
import { metricKey, personaKey } from "@/lib/audience/questions";
import { emptyDistribution } from "@/lib/audience/reactions";
import { interpretEvaluation } from "@/lib/audience/result";

import { fakeEvaluation, personaAt } from "../support/evaluations";

describe("interpretEvaluation", () => {
  it("normalizes each persona's distribution and fills missing reactions", () => {
    const result = interpretEvaluation(
      fakeEvaluation({ reactions: { recruiter: { applaud: 0.3, eyeroll: 0.3 } } }),
    );
    const recruiter = result.personas[0];
    expect(recruiter?.distribution).toEqual({
      ...emptyDistribution(),
      applaud: 0.5,
      eyeroll: 0.5,
    });
    expect(recruiter?.applause).toBeCloseTo(0.5);
    expect(recruiter?.confidence).toBe(0.8);
  });

  it("puts the applause meter at 100 for a standing ovation and 0 for eye rolls", () => {
    expect(interpretEvaluation(fakeEvaluation({ fallback: { applaud: 1 } })).applause).toBe(100);
    expect(interpretEvaluation(fakeEvaluation({ fallback: { eyeroll: 1 } })).applause).toBe(0);
  });

  it("weights the meter by each persona's seats", () => {
    const loud = interpretEvaluation(
      fakeEvaluation({ fallback: { eyeroll: 1 }, reactions: { recruiter: { applaud: 1 } } }),
    );
    expect(loud.applause).toBe(Math.round((personaAt(0).seats / METER_SEATS) * 100));
  });

  it("leaves the readers who react for fun out of the meter", () => {
    const fun = interpretEvaluation(
      fakeEvaluation({
        fallback: { eyeroll: 1 },
        reactions: { mom: { applaud: 1 }, coach: { applaud: 1 }, uncle: { applaud: 1 } },
      }),
    );
    expect(fun.applause).toBe(0);
    expect(METER_SEATS).toBe(90);
  });

  it("scales scores to 0 to 1 and keeps the yes-or-no probabilities", () => {
    const result = interpretEvaluation(
      fakeEvaluation({
        scores: { clarity: 4, cliche: 2, authenticity: 9 },
        nouls: { soundsLikeAi: 0.7 },
      }),
    );
    expect(result.metrics).toEqual({
      clarity: 1,
      cliche: 0.5,
      authenticity: 1,
      soundsLikeAi: 0.7,
      callToAction: 0.1,
    });
  });

  it("rejects an evaluation that misses a question or answers with the wrong type", () => {
    const missing = fakeEvaluation({ omit: [personaKey(personaAt(3))] });
    expect(() => interpretEvaluation(missing)).toThrow(/did not answer "persona_founder"/);

    const wrongPersona = fakeEvaluation();
    wrongPersona.answers[personaKey(personaAt(0))] = { type: "noul", noul: 1 };
    expect(() => interpretEvaluation(wrongPersona)).toThrow(/Expected a choice/);

    const wrongScore = fakeEvaluation();
    wrongScore.answers[metricKey("clarity")] = { type: "noul", noul: 1 };
    expect(() => interpretEvaluation(wrongScore)).toThrow(/Expected a score/);

    const wrongNoul = fakeEvaluation();
    wrongNoul.answers[metricKey("callToAction")] = { type: "score", score: 1, probabilities: {} };
    expect(() => interpretEvaluation(wrongNoul)).toThrow(/Expected a yes-or-no/);

    expect(() =>
      interpretEvaluation(fakeEvaluation({ reactions: { mom: { unknown: 1 } as never } })),
    ).toThrow(/no probability on any reaction/);
  });
});
