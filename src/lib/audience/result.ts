import { AppError } from "../core/errors";
import { recordFrom } from "../core/record";
import type { Answer, Evaluation } from "../jev/types";
import {
  levelsOf,
  type Metric,
  type NoulMetric,
  SCORE_METRIC_LIST,
  type ScoreMetric,
} from "./metrics";
import { METER_SEATS, type Persona, PERSONAS } from "./personas";
import { metricKey, personaKey } from "./questions";
import { type Distribution, emptyDistribution, REACTION_INFO, REACTIONS } from "./reactions";

export interface PersonaResult {
  persona: Persona;
  distribution: Distribution;
  confidence: number | null;
  /** The share of an applause this persona gives, from 0 to 1. */
  applause: number;
}

export interface ScoreSpread {
  /** One probability per level of the rubric, from the lowest to the highest, adding up to 1. */
  levels: number[];
  confidence: number | null;
}

export interface AudienceResult {
  personas: PersonaResult[];
  /** Every metric from 0 to 1; a score is the average level Jev expects. */
  metrics: Record<Metric, number>;
  /** How each score spreads over its levels, or null where it did not travel (older links). */
  spreads: Record<ScoreMetric, ScoreSpread | null>;
  /** The applause meter, from 0 to 100, over the personas in the meter. */
  applause: number;
}

function answerFor(evaluation: Evaluation, key: string): Answer {
  const answer = evaluation.answers[key];
  if (answer === undefined) {
    throw new AppError("JEV_BAD_RESPONSE", `Jev did not answer "${key}"`);
  }
  return answer;
}

function distributionOf(answer: Answer, key: string): Distribution {
  if (answer.type !== "choice") {
    throw new AppError("JEV_BAD_RESPONSE", `Expected a choice for "${key}", got ${answer.type}`);
  }
  const distribution = emptyDistribution();
  let total = 0;
  for (const reaction of REACTIONS) {
    const probability = answer.probabilities[reaction] ?? 0;
    distribution[reaction] = probability;
    total += probability;
  }
  if (total <= 0) {
    throw new AppError("JEV_BAD_RESPONSE", `"${key}" has no probability on any reaction`);
  }
  for (const reaction of REACTIONS) distribution[reaction] /= total;
  return distribution;
}

export function applauseOf(distribution: Distribution): number {
  return REACTIONS.reduce(
    (sum, reaction) => sum + distribution[reaction] * REACTION_INFO[reaction].applause,
    0,
  );
}

/**
 * A score, from 0 to 1, and how its probability spreads over the levels of its rubric. Jev keys
 * the levels by their position, "0" for the lowest; a spread that adds up to nothing is left out.
 */
function scoreOf(evaluation: Evaluation, metric: ScoreMetric) {
  const key = metricKey(metric);
  const answer = answerFor(evaluation, key);
  if (answer.type !== "score") {
    throw new AppError("JEV_BAD_RESPONSE", `Expected a score for "${key}", got ${answer.type}`);
  }
  const levels = levelsOf(metric);
  const value = Math.min(1, Math.max(0, answer.score / (levels.length - 1)));
  const raw = levels.map((_, level) => answer.probabilities[String(level)] ?? 0);
  const total = raw.reduce((sum, probability) => sum + probability, 0);
  const spread: ScoreSpread | null =
    total > 0
      ? {
          levels: raw.map((probability) => probability / total),
          confidence: answer.confidence ?? null,
        }
      : null;
  return { value, spread };
}

function noulMetric(evaluation: Evaluation, metric: NoulMetric): number {
  const key = metricKey(metric);
  const answer = answerFor(evaluation, key);
  if (answer.type !== "noul") {
    throw new AppError("JEV_BAD_RESPONSE", `Expected a yes-or-no for "${key}", got ${answer.type}`);
  }
  return answer.noul;
}

export function interpretEvaluation(evaluation: Evaluation): AudienceResult {
  const personas = PERSONAS.map((persona): PersonaResult => {
    const key = personaKey(persona);
    const answer = answerFor(evaluation, key);
    const distribution = distributionOf(answer, key);
    const confidence = answer.type === "choice" ? (answer.confidence ?? null) : null;
    return { persona, distribution, confidence, applause: applauseOf(distribution) };
  });
  const weighted = personas.reduce(
    (sum, result) => sum + (result.persona.inMeter ? result.applause * result.persona.seats : 0),
    0,
  );
  const scores = recordFrom(SCORE_METRIC_LIST, (metric) => scoreOf(evaluation, metric));
  return {
    personas,
    metrics: {
      clarity: scores.clarity.value,
      cliche: scores.cliche.value,
      authenticity: scores.authenticity.value,
      soundsLikeAi: noulMetric(evaluation, "soundsLikeAi"),
      callToAction: noulMetric(evaluation, "callToAction"),
    },
    spreads: recordFrom(SCORE_METRIC_LIST, (metric) => scores[metric].spread),
    applause: Math.round((weighted / METER_SEATS) * 100),
  };
}
