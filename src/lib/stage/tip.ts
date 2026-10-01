import { findPersona, type PersonaId } from "../audience/personas";
import { type Reaction, REACTION_INFO } from "../audience/reactions";
import { seatAt } from "./hit";
import { seatUnit } from "./layout";
import type { SeatState } from "./transitions";

/** How far above the head the tip sits, in units of the person's size. */
const TIP_ABOVE = 0.45;
/** The least room left between a tip and the edges of the window, in CSS pixels. */
const TIP_MARGIN = 8;

export interface SeatTip {
  personaId: PersonaId;
  text: string;
  /** Where the tip points, above the head, in CSS pixels of the stage. */
  left: number;
  top: number;
}

export function tipText(personaId: PersonaId | null, reaction: Reaction | null): string | null {
  const persona = personaId === null ? undefined : findPersona(personaId);
  if (!persona || reaction === null) return null;
  const { emoji, label } = REACTION_INFO[reaction];
  return `${persona.name} · ${emoji} ${label.toLowerCase()}`;
}

/** How far to slide a tip sideways, in CSS pixels, so it stays whole inside the window. */
export function shiftInside(tip: { left: number; right: number }, windowWidth: number): number {
  if (tip.left < TIP_MARGIN) return TIP_MARGIN - tip.left;
  const limit = windowWidth - TIP_MARGIN;
  return tip.right > limit ? limit - tip.right : 0;
}

/**
 * The tip for the person at a point of the stage, in CSS pixels, or null between people and
 * over seats still waiting for a post.
 */
export function seatTipAt(
  states: readonly SeatState[],
  point: { x: number; y: number },
  stage: { width: number; height: number; rows: readonly number[] },
): SeatTip | null {
  const unit = seatUnit(stage.width, stage.height, stage.rows);
  const size = { width: stage.width, height: stage.height, unit };
  const index = seatAt(
    states.map((state) => state.position),
    point,
    size,
  );
  const state = index === null ? undefined : states[index];
  if (!state?.personaId) return null;
  const text = tipText(state.personaId, state.reaction);
  if (text === null) return null;
  return {
    personaId: state.personaId,
    text,
    left: state.position.x * stage.width,
    top: state.position.y * stage.height - TIP_ABOVE * unit * state.position.scale,
  };
}
