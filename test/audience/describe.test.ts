import { describe, expect, it } from "vitest";

import { describeAudience, WAITING_AUDIENCE } from "@/lib/audience/describe";
import { highlightsOf } from "@/lib/audience/highlights";
import { interpretEvaluation } from "@/lib/audience/result";

import { fakeEvaluation } from "../support/evaluations";

describe("describeAudience", () => {
  it("tells screen readers the meter, the dominant reaction, the fan and the critic", () => {
    const result = interpretEvaluation(
      fakeEvaluation({
        fallback: { eyeroll: 0.7, ignore: 0.3 },
        reactions: { founder: { applaud: 1 }, recruiter: { eyeroll: 1 } },
      }),
    );
    expect(describeAudience(result, highlightsOf(result))).toBe(
      `Plateia de 120 pessoas. Aplausômetro em ${String(result.applause)} de 100. Reação mais comum: Revira os olhos. Maior fã: Fundadora. Maior crítico: Recrutadora.`,
    );
    expect(WAITING_AUDIENCE).toBe("Plateia de 120 pessoas esperando o seu post.");
  });
});
