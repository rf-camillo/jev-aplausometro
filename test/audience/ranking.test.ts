import { describe, expect, it } from "vitest";

import { outsideTheMeter, placingOf, rankByApplause, scoreOf } from "@/lib/audience/ranking";
import { interpretEvaluation } from "@/lib/audience/result";

import { fakeEvaluation, personaAt } from "../support/evaluations";

describe("rankByApplause", () => {
  it("puts the biggest fan first and the harshest critic last, keeping ties in order", () => {
    const fan = personaAt(5);
    const critic = personaAt(0);
    const result = interpretEvaluation(
      fakeEvaluation({
        reactions: { [fan.id]: { applaud: 1 }, [critic.id]: { eyeroll: 1 } },
      }),
    );
    const ranked = rankByApplause(result).map((item) => item.persona.id);
    expect(ranked[0]).toBe(fan.id);
    expect(ranked.at(-1)).toBe(critic.id);
    expect(ranked[1]).toBe(personaAt(1).id);
    expect(result.personas[0]?.persona.id).toBe(critic.id);
  });

  it("ranks only the readers in the meter, and lists the others apart", () => {
    const result = interpretEvaluation(fakeEvaluation({ reactions: { mom: { applaud: 1 } } }));
    expect(rankByApplause(result).map((item) => item.persona.id)).not.toContain("mom");
    expect(outsideTheMeter(result).map((item) => item.persona.id)).toEqual([
      "uncle",
      "mom",
      "coach",
    ]);
  });
});

describe("placingOf", () => {
  it("finds a persona's place in the ranking, or null for a stranger", () => {
    const fan = personaAt(5);
    const result = interpretEvaluation(fakeEvaluation({ reactions: { [fan.id]: { applaud: 1 } } }));
    expect(placingOf(result, fan.id)).toMatchObject({ rank: 1, item: { persona: fan } });
    const withoutMom = {
      ...result,
      personas: result.personas.filter((item) => item.persona.id !== "mom"),
    };
    expect(placingOf(withoutMom, "mom")).toBeNull();
    expect(placingOf(result, "mom")).toMatchObject({ rank: null });
  });
});

describe("scoreOf", () => {
  it("rounds a persona's applause to a score out of 100", () => {
    const result = interpretEvaluation(fakeEvaluation({ fallback: { like: 1 } }));
    const [first] = result.personas;
    expect(first && scoreOf(first)).toBe(60);
  });
});
