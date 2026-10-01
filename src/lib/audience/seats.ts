import { type Random, seededRandom } from "../core/random";
import { recordFrom } from "../core/record";
import type { PersonaId } from "./personas";
import { type Distribution, type Reaction, REACTIONS } from "./reactions";
import type { AudienceResult } from "./result";

export interface Seat {
  personaId: PersonaId;
  reaction: Reaction;
}

/**
 * Splits a persona's seats among the reactions in proportion to Jev's probabilities
 * (largest remainder), so the crowd shows the distribution instead of a noisy sample.
 */
export function apportion(distribution: Distribution, seats: number): Record<Reaction, number> {
  const quotas = REACTIONS.map((reaction) => {
    const quota = distribution[reaction] * seats;
    return { reaction, whole: Math.floor(quota), remainder: quota - Math.floor(quota) };
  });
  const counts = recordFrom(REACTIONS, () => 0);
  for (const { reaction, whole } of quotas) counts[reaction] = whole;
  let left = seats - quotas.reduce((sum, { whole }) => sum + whole, 0);
  const byRemainder = [...quotas].sort((a, b) => b.remainder - a.remainder);
  for (const { reaction } of byRemainder) {
    if (left <= 0) break;
    counts[reaction] += 1;
    left -= 1;
  }
  return counts;
}

function shuffle<T>(items: T[], random: Random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other] as T, result[index] as T];
  }
  return result;
}

/**
 * The whole audience, persona by persona, with each persona's seats shuffled by a seed (the
 * hash of the post): the same post, or a shared link to it, seats the crowd the same way.
 */
export function arrangeSeats(result: AudienceResult, seed: number): Seat[] {
  const random = seededRandom(seed);
  return result.personas.flatMap(({ persona, distribution }) => {
    const counts = apportion(distribution, persona.seats);
    const seats = REACTIONS.flatMap((reaction) =>
      Array.from({ length: counts[reaction] }, (): Seat => ({ personaId: persona.id, reaction })),
    );
    return shuffle(seats, random);
  });
}

export function countReactions(seats: readonly Seat[]): { reaction: Reaction; count: number }[] {
  return REACTIONS.map((reaction) => ({
    reaction,
    count: seats.filter((seat) => seat.reaction === reaction).length,
  })).filter(({ count }) => count > 0);
}
