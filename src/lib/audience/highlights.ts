import type { Persona } from "./personas";
import { rankByApplause } from "./ranking";
import { emptyDistribution, type Reaction, REACTIONS, topReaction } from "./reactions";
import type { AudienceResult } from "./result";

export type Standout = "fan" | "critic";

export const STANDOUTS: readonly Standout[] = ["fan", "critic"];

export const STANDOUT_LABELS: Record<Standout, string> = {
  fan: "Maior fã",
  critic: "Maior crítico",
};

export interface Highlights {
  /** The persona who applauded the most: first in the ranking. */
  fan: Persona;
  /** The persona who applauded the least: last in the ranking. */
  critic: Persona;
  /** The most common reaction across every seat. */
  dominant: Reaction;
}

/** The lines that make the result worth sharing, agreeing with the ranking by applause. */
export function highlightsOf(result: AudienceResult): Highlights {
  const ranked = rankByApplause(result);
  const fan = ranked[0];
  const critic = ranked.at(-1);
  if (!fan || !critic) throw new Error("The audience has no personas");
  const overall = emptyDistribution();
  for (const { persona, distribution } of result.personas) {
    for (const reaction of REACTIONS) overall[reaction] += distribution[reaction] * persona.seats;
  }
  return { fan: fan.persona, critic: critic.persona, dominant: topReaction(overall) };
}

/** The fan and the critic in a sentence, for screen readers, link previews and posts. */
export function standoutsLine(highlights: Highlights): string {
  return STANDOUTS.map(
    (standout) => `${STANDOUT_LABELS[standout]}: ${highlights[standout].name}.`,
  ).join(" ");
}
