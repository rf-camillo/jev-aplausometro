import { type Reaction, REACTION_INFO } from "../audience/reactions";
import { REACTION_LOOK } from "./reaction-look";

/** How a person looks at one moment. Distances are in units of the person's size. */
export interface Pose {
  /** Vertical offset of the whole person; negative is up. */
  lift: number;
  headShift: number;
  opacity: number;
  face: "skin" | "eyeroll";
  /** How far each hand is from the center, or null when the hands are down. */
  clapGap: number | null;
  badge: { emoji: string; bounce: number } | null;
  /** How far the sleeper's "z" has risen, or null when awake. */
  snore: number | null;
}

type PoseAt = (seconds: number, phase: number) => Pose;

const idle: PoseAt = (seconds, phase) => ({
  lift: Math.sin(seconds * 1.3 + phase) * 0.03,
  headShift: 0,
  opacity: 1,
  face: "skin",
  clapGap: null,
  badge: null,
  snore: null,
});

const bounce = (seconds: number, phase: number): number =>
  Math.abs(Math.sin(seconds * 2.5 + phase)) * 0.1;

const withBadge =
  (reaction: Reaction): PoseAt =>
  (seconds, phase) => ({
    ...idle(seconds, phase),
    badge: { emoji: REACTION_INFO[reaction].emoji, bounce: bounce(seconds, phase) },
  });

/** One pose per reaction, and `idle` for a seat still waiting for the first post. */
export const POSES: Record<Reaction | "idle", PoseAt> = {
  idle,
  applaud: (seconds, phase) => ({
    ...idle(seconds, phase),
    lift: -Math.abs(Math.sin(seconds * 9 + phase)) * 0.14,
    clapGap: 0.16 + Math.abs(Math.sin(seconds * 18 + phase)) * 0.12,
    badge:
      Math.sin(seconds * 2.2 + phase) > 0.2
        ? { emoji: REACTION_INFO.applaud.emoji, bounce: bounce(seconds, phase) }
        : null,
  }),
  share: withBadge("share"),
  like: withBadge("like"),
  comment: withBadge("comment"),
  disagree: (seconds, phase) => ({
    ...withBadge("disagree")(seconds, phase),
    headShift: Math.sin(seconds * 3 + phase) * 0.06,
  }),
  ignore: (seconds, phase) => ({ ...idle(seconds, phase), opacity: REACTION_LOOK.ignore.opacity }),
  sleep: (seconds, phase) => ({
    ...idle(seconds, phase),
    headShift: 0.14,
    snore: ((seconds * 0.6 + phase) % 1) * 0.5,
  }),
  eyeroll: (seconds, phase) => ({
    ...idle(seconds, phase),
    headShift: Math.sin(seconds * 6 + phase) * 0.05,
    face: "eyeroll",
  }),
};
