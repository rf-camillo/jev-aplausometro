import type { PersonaId } from "../audience/personas";
import type { Reaction } from "../audience/reactions";
import type { Seat } from "../audience/seats";
import type { SeatPosition } from "./layout";

/** How long a new reaction takes to ripple from the center of the audience to its edges. */
export const RIPPLE_MS = 700;
/** Neighbors switch a few milliseconds apart, so the ripple looks like people, not a wipe. */
const STAGGER_MS = 25;
const STAGGER_GROUPS = 7;
/** Spreads each person's idle sway over the circle, so nobody moves in sync. */
const PHASE_STEP = 2.399;

export interface SeatState {
  index: number;
  position: SeatPosition;
  /** Who sits here, or null while the audience waits for the first post. */
  personaId: PersonaId | null;
  phase: number;
  reaction: Reaction | null;
  previous: Reaction | null;
  /** When, in ms, this seat switches from `previous` to `reaction`. */
  changeAt: number;
}

export function initialSeatStates(positions: readonly SeatPosition[]): SeatState[] {
  return positions.map((position, index) => ({
    index,
    position,
    personaId: null,
    phase: (index * PHASE_STEP) % (Math.PI * 2),
    reaction: null,
    previous: null,
    changeAt: 0,
  }));
}

/** The reaction a seat shows at `now`: the previous one until its turn in the ripple. */
export function reactionAt(state: SeatState, now: number): Reaction | null {
  return now >= state.changeAt ? state.reaction : state.previous;
}

/**
 * Seats a new audience. Seats whose reaction changes switch in a ripple from the center, or
 * all at once without it; the others only take their new persona.
 */
export function withSeats(
  states: readonly SeatState[],
  seats: readonly Seat[] | null,
  now: number,
  ripple: boolean,
): SeatState[] {
  return states.map((state) => {
    const seat = seats?.[state.index];
    const reaction = seat?.reaction ?? null;
    const personaId = seat?.personaId ?? state.personaId;
    if (reaction === state.reaction) return { ...state, personaId };
    const distance = Math.abs(state.position.x - 0.5) * 2;
    const delay = ripple ? distance * RIPPLE_MS + (state.index % STAGGER_GROUPS) * STAGGER_MS : 0;
    return {
      ...state,
      personaId,
      previous: reactionAt(state, now),
      reaction,
      changeAt: now + delay,
    };
  });
}

/**
 * Moves every seat to a new layout, keeping who sits there and how they react. The seats come
 * back ordered from the back row to the front, the order they are drawn in so the front rows
 * overlap; each keeps its `index`, which is what ties it to its seat in the audience.
 */
export function withPositions(
  states: readonly SeatState[],
  positions: readonly SeatPosition[],
): SeatState[] {
  return states
    .map((state) => ({ ...state, position: positions[state.index] ?? state.position }))
    .sort((a, b) => a.position.y - b.position.y);
}
