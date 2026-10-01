import { z } from "zod";

import type { AppErrorCode } from "../core/errors";
import { METRICS, SCORE_LEVELS, SCORE_METRIC_LIST } from "./metrics";
import { findPersona, PERSONAS } from "./personas";
import { REACTIONS } from "./reactions";
import { applauseOf, type AudienceResult, type PersonaResult } from "./result";

export const AUDIENCE_ENDPOINT = "/api/audience";

export interface AudienceRequest {
  post: string;
}

export interface AudienceAnswer {
  result: AudienceResult;
  latencyMs: number;
  model: string;
}

export type ErrorCode = AppErrorCode | "RATE_LIMITED" | "FOREIGN_ORIGIN" | "NOT_JSON" | "INTERNAL";

export interface ErrorBody {
  error: { code: ErrorCode; message: string };
}

/** What the page says when something failed in a way it cannot explain better. */
export const FAILURE_MESSAGE = "Algo deu errado.";
export const OFFLINE_MESSAGE = "Não foi possível falar com a plateia. Verifique sua conexão.";

const probability = z.number().min(0).max(1);

/** The answer names each persona by id only; the page already knows the rest. */
const wireSchema = z.object({
  personas: z.array(
    z.object({
      id: z.string(),
      distribution: z.record(z.enum(REACTIONS), probability),
      confidence: probability.nullable(),
    }),
  ),
  metrics: z.record(z.enum(METRICS), probability),
  spreads: z.record(
    z.enum(SCORE_METRIC_LIST),
    z
      .object({
        levels: z
          .array(probability)
          .length(SCORE_LEVELS)
          .refine((levels) => levels.some((level) => level > 0)),
        confidence: probability.nullable(),
      })
      .nullable(),
  ),
  applause: z.number().min(0).max(100),
  latencyMs: z.number().nonnegative(),
  model: z.string(),
});

export type AnswerWire = z.infer<typeof wireSchema>;

const errorSchema = z.object({ error: z.object({ message: z.string() }) });

export function answerToWire({ result, latencyMs, model }: AudienceAnswer): AnswerWire {
  return {
    personas: result.personas.map(({ persona, distribution, confidence }) => ({
      id: persona.id,
      distribution,
      confidence,
    })),
    metrics: result.metrics,
    spreads: result.spreads,
    applause: result.applause,
    latencyMs,
    model,
  };
}

export function answerFromWire(body: unknown): AudienceAnswer | null {
  const parsed = wireSchema.safeParse(body);
  if (!parsed.success) return null;
  const personas: PersonaResult[] = [];
  for (const { id, distribution, confidence } of parsed.data.personas) {
    const persona = findPersona(id);
    if (!persona) return null;
    personas.push({ persona, distribution, confidence, applause: applauseOf(distribution) });
  }
  // The whole audience, once each: the ranking and the stage need every persona.
  const ids = new Set(personas.map((item) => item.persona.id));
  if (personas.length !== PERSONAS.length || ids.size !== PERSONAS.length) return null;
  const { metrics, spreads, applause, latencyMs, model } = parsed.data;
  return {
    result: { personas, metrics, spreads, applause },
    latencyMs,
    model,
  };
}

export function errorMessageOf(body: unknown): string | null {
  const parsed = errorSchema.safeParse(body);
  return parsed.success ? parsed.data.error.message : null;
}
