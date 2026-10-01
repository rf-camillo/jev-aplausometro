import { z } from "zod";

/** A yes-or-no question; the answer is the probability of "yes". */
export interface NoulQuestion {
  type: "noul";
  instructions: string;
}

/** Picks one of up to 255 named options; the answer is a distribution over them. */
export interface ChoiceQuestion {
  type: "choice";
  instructions: string;
  criteria: Record<string, string>;
}

/** Rates on an ordered rubric of 2 to 10 levels, from the lowest to the highest. */
export interface ScoreQuestion {
  type: "score";
  instructions: string;
  criteria: string[];
}

export type Question = NoulQuestion | ChoiceQuestion | ScoreQuestion;

const probabilities = z.record(z.string(), z.number().min(0).max(1));

const answerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("noul"), noul: z.number().min(0).max(1) }),
  z.object({
    type: z.literal("choice"),
    choice: z.string(),
    confidence: z.number().min(0).max(1).optional(),
    probabilities,
  }),
  z.object({
    type: z.literal("score"),
    score: z.number(),
    confidence: z.number().min(0).max(1).optional(),
    probabilities,
  }),
]);

export const evaluationSchema = z.object({
  model: z.string(),
  answers: z.record(z.string(), answerSchema),
  usage: z.object({ input_tokens: z.number(), output_tokens: z.number() }).optional(),
});

export type Answer = z.infer<typeof answerSchema>;

export interface Evaluation {
  model: string;
  answers: Record<string, Answer>;
  inputTokens: number | null;
  latencyMs: number;
}
