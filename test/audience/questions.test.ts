import { describe, expect, it } from "vitest";

import { PERSONAS } from "@/lib/audience/personas";
import { buildQuestions, buildState, metricKey, personaKey } from "@/lib/audience/questions";
import { REACTIONS } from "@/lib/audience/reactions";

import { personaAt } from "../support/evaluations";

describe("buildQuestions", () => {
  it("asks every persona to choose a reaction and every metric in one call", () => {
    const questions = buildQuestions();
    expect(Object.keys(questions)).toHaveLength(PERSONAS.length + 5);

    const recruiter = questions[personaKey(personaAt(0))];
    expect(recruiter).toMatchObject({ type: "choice" });
    expect(recruiter?.instructions).toContain("recrutadora de tecnologia");
    expect(Object.keys(recruiter?.type === "choice" ? recruiter.criteria : {})).toEqual([
      ...REACTIONS,
    ]);
    expect(questions[metricKey("cliche")]).toMatchObject({ type: "score" });
    expect(questions[metricKey("soundsLikeAi")]).toMatchObject({ type: "noul" });
  });

  it("wraps the post in a trimmed state", () => {
    expect(buildState("  Olá, rede!  ")).toEqual({ plataforma: "LinkedIn", post: "Olá, rede!" });
  });
});
