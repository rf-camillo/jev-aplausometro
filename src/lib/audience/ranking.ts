import type { PersonaId } from "./personas";
import type { AudienceResult, PersonaResult } from "./result";

/** The personas in the meter, from the one who applauded the most to the one who applauded the least. */
export function rankByApplause(result: AudienceResult): PersonaResult[] {
  return result.personas
    .filter((item) => item.persona.inMeter)
    .sort((a, b) => b.applause - a.applause);
}

/** The personas who react for the fun of it, in the order of the audience. */
export function outsideTheMeter(result: AudienceResult): PersonaResult[] {
  return result.personas.filter((item) => !item.persona.inMeter);
}

export interface Placing {
  item: PersonaResult;
  /** 1 for the biggest fan; null for a persona outside the meter. */
  rank: number | null;
}

export function placingOf(result: AudienceResult, personaId: PersonaId): Placing | null {
  const item = result.personas.find((candidate) => candidate.persona.id === personaId);
  if (!item) return null;
  if (!item.persona.inMeter) return { item, rank: null };
  return { item, rank: rankByApplause(result).indexOf(item) + 1 };
}

/** A persona's own applause meter, from 0 to 100, as the list and the spotlight show it. */
export function scoreOf(item: PersonaResult): number {
  return Math.round(item.applause * 100);
}
