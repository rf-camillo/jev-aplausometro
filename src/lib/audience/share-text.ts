import { highlightsOf, standoutsLine } from "./highlights";
import type { AudienceResult } from "./result";
import { verdictFor } from "./verdict";

export function shareText(result: AudienceResult, link: string): string {
  const verdict = verdictFor(result.applause);
  return [
    `Testei meu post no Aplausômetro: ${String(result.applause)} de 100, ${verdict.emoji} ${verdict.label}.`,
    standoutsLine(highlightsOf(result)),
    `Veja como a plateia reagiu e teste o seu: ${link}`,
  ].join("\n\n");
}

/**
 * LinkedIn's composer, opened with the text already written. The older share link only takes
 * a URL and leaves the post empty.
 */
export function linkedInComposerUrl(text: string): string {
  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
}
