import { recordFrom } from "../core/record";
import type { Question } from "../jev/types";
import { type Metric, metricQuestion, METRICS } from "./metrics";
import { type Persona, PERSONAS } from "./personas";
import { REACTION_INFO, REACTIONS } from "./reactions";

export function personaKey(persona: Persona): string {
  return `persona_${persona.id}`;
}

export function metricKey(metric: Metric): string {
  return `metric_${metric}`;
}

const reactionCriteria = recordFrom(REACTIONS, (reaction) => REACTION_INFO[reaction].criterion);

/** Everything the audience asks Jev about one post, sent in a single call. */
export function buildQuestions(): Record<string, Question> {
  const questions: Record<string, Question> = {};
  for (const persona of PERSONAS) {
    questions[personaKey(persona)] = {
      type: "choice",
      instructions: `Como ${persona.reader} reage a este post no LinkedIn? Escolha a reação mais forte que essa pessoa teria.`,
      criteria: reactionCriteria,
    };
  }
  for (const metric of METRICS) questions[metricKey(metric)] = metricQuestion(metric);
  return questions;
}

export function buildState(post: string): { plataforma: string; post: string } {
  return { plataforma: "LinkedIn", post: post.trim() };
}
