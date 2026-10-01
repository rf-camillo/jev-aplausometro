import { TOTAL_SEATS } from "../../src/lib/audience/personas";
import { REACTIONS } from "../../src/lib/audience/reactions";
import type { AudienceResult } from "../../src/lib/audience/result";

export interface Measures {
  applause: number;
  /** The share of all seats rolling their eyes. */
  eyeroll: number;
  cliche: number;
  soundsLikeAi: number;
  callToAction: number;
  latencyMs: number;
}

export function measure(result: AudienceResult, latencyMs: number): Measures {
  const eyeroll = result.personas.reduce(
    (sum, item) => sum + item.distribution.eyeroll * item.persona.seats,
    0,
  );
  return {
    applause: result.applause,
    eyeroll: eyeroll / TOTAL_SEATS,
    cliche: result.metrics.cliche,
    soundsLikeAi: result.metrics.soundsLikeAi,
    callToAction: result.metrics.callToAction,
    latencyMs,
  };
}

/** How far apart two audiences are: the mean total variation distance across personas. */
export function drift(a: AudienceResult, b: AudienceResult): number {
  const distances = a.personas.map((item, index) => {
    const other = b.personas[index];
    if (!other) return 1;
    return (
      REACTIONS.reduce(
        (sum, reaction) =>
          sum + Math.abs(item.distribution[reaction] - other.distribution[reaction]),
        0,
      ) / 2
    );
  });
  return distances.reduce((sum, value) => sum + value, 0) / distances.length;
}
