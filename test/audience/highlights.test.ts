import { describe, expect, it } from "vitest";

import { highlightsOf } from "@/lib/audience/highlights";
import { rankByApplause } from "@/lib/audience/ranking";
import { interpretEvaluation } from "@/lib/audience/result";

import { fakeEvaluation } from "../support/evaluations";

describe("highlightsOf", () => {
  it("finds the biggest fan, the harshest critic and the dominant reaction", () => {
    const result = interpretEvaluation(
      fakeEvaluation({
        fallback: { like: 0.6, ignore: 0.4 },
        reactions: { investor: { applaud: 1 }, senior_dev: { eyeroll: 0.99, ignore: 0.01 } },
      }),
    );
    const highlights = highlightsOf(result);
    expect(highlights.fan.id).toBe("investor");
    expect(highlights.critic.id).toBe("senior_dev");
    expect(highlights.dominant).toBe("like");
  });

  it("names as critic whoever applauded least, the last in the ranking", () => {
    const result = interpretEvaluation(
      fakeEvaluation({
        fallback: { like: 1 },
        reactions: {
          senior_dev: { eyeroll: 0.6, applaud: 0.4 },
          recruiter: { ignore: 1 },
        },
      }),
    );
    expect(highlightsOf(result).critic.id).toBe("recruiter");
    expect(rankByApplause(result).at(-1)?.persona.id).toBe("recruiter");
  });

  it("never names a reader outside the meter as fan or critic", () => {
    const result = interpretEvaluation(
      fakeEvaluation({
        fallback: { like: 1 },
        reactions: { mom: { applaud: 1 }, coach: { eyeroll: 1 }, designer: { ignore: 1 } },
      }),
    );
    const highlights = highlightsOf(result);
    expect(highlights.fan.id).not.toBe("mom");
    expect(highlights.critic.id).toBe("designer");
  });

  it("refuses an empty audience", () => {
    const result = interpretEvaluation(fakeEvaluation());
    expect(() => highlightsOf({ ...result, personas: [] })).toThrow(/no personas/);
  });
});
