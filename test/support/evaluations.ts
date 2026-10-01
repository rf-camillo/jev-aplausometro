import { type Persona, PERSONAS } from "@/lib/audience/personas";
import { metricKey, personaKey } from "@/lib/audience/questions";
import type { Distribution } from "@/lib/audience/reactions";
import type { Answer, Evaluation } from "@/lib/jev/types";

export interface FakeAudience {
  reactions?: Partial<Record<string, Partial<Distribution>>>;
  fallback?: Partial<Distribution>;
  scores?: { clarity?: number; cliche?: number; authenticity?: number };
  nouls?: { soundsLikeAi?: number; callToAction?: number };
  /** How each score spreads over its five levels, keyed "0" to "4" as Jev sends them. */
  spreads?: {
    clarity?: Record<string, number>;
    cliche?: Record<string, number>;
    authenticity?: Record<string, number>;
  };
  /** Question keys Jev leaves unanswered. */
  omit?: string[];
}

/** A plausible spread over the five levels of a score, as Jev sends it. */
const SPREAD = { "0": 0.05, "1": 0.1, "2": 0.2, "3": 0.4, "4": 0.25 };

/** A complete Jev evaluation for the audience, with every persona and metric answered. */
export function fakeEvaluation(audience: FakeAudience = {}): Evaluation {
  const fallback = audience.fallback ?? { like: 1 };
  const answers: Record<string, Answer> = {};
  for (const persona of PERSONAS) {
    const probabilities = audience.reactions?.[persona.id] ?? fallback;
    const [choice = "like"] = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0] ?? [];
    answers[personaKey(persona)] = {
      type: "choice",
      choice,
      confidence: 0.8,
      probabilities,
    };
  }
  const scores = { clarity: 3, cliche: 1, authenticity: 2, ...audience.scores };
  for (const metric of ["clarity", "cliche", "authenticity"] as const) {
    answers[metricKey(metric)] = {
      type: "score",
      score: scores[metric],
      confidence: 0.6,
      probabilities: audience.spreads?.[metric] ?? SPREAD,
    };
  }
  const nouls = { soundsLikeAi: 0.3, callToAction: 0.1, ...audience.nouls };
  for (const metric of ["soundsLikeAi", "callToAction"] as const) {
    answers[metricKey(metric)] = { type: "noul", noul: nouls[metric] };
  }
  const omitted = new Set(audience.omit);
  const kept = Object.fromEntries(Object.entries(answers).filter(([key]) => !omitted.has(key)));
  return { model: "jev-1.13.0", answers: kept, inputTokens: 2000, latencyMs: 280 };
}

/** The persona at a position of the audience, failing loudly if there is none. */
export function personaAt(index: number): Persona {
  const persona = PERSONAS[index];
  if (persona === undefined) throw new Error(`No persona at ${String(index)}`);
  return persona;
}
