import type { Reaction } from "../audience/reactions";

export interface ReactionLook {
  overHead: boolean;
  onFace: boolean;
  /** How visible the person stays: someone passing by fades. */
  opacity: number;
}

const PLAIN: ReactionLook = { overHead: false, onFace: false, opacity: 1 };

/** How each reaction shows on a person, the same on the stage and on the share card. */
export const REACTION_LOOK: Record<Reaction, ReactionLook> = {
  applaud: { ...PLAIN, overHead: true },
  share: { ...PLAIN, overHead: true },
  like: { ...PLAIN, overHead: true },
  comment: { ...PLAIN, overHead: true },
  disagree: { ...PLAIN, overHead: true },
  ignore: { ...PLAIN, opacity: 0.35 },
  sleep: PLAIN,
  eyeroll: { ...PLAIN, onFace: true },
};
