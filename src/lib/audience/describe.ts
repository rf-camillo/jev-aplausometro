import { type Highlights, standoutsLine } from "./highlights";
import { TOTAL_SEATS } from "./personas";
import { REACTION_INFO } from "./reactions";
import type { AudienceResult } from "./result";

export const WAITING_AUDIENCE = `Plateia de ${String(TOTAL_SEATS)} pessoas esperando o seu post.`;

/** The audience in one sentence, for screen readers in place of the drawing. */
export function describeAudience(result: AudienceResult, highlights: Highlights): string {
  return [
    `Plateia de ${String(TOTAL_SEATS)} pessoas.`,
    `Aplausômetro em ${String(result.applause)} de 100.`,
    `Reação mais comum: ${REACTION_INFO[highlights.dominant].label}.`,
    standoutsLine(highlights),
  ].join(" ");
}
