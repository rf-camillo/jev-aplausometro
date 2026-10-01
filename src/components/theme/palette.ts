import { type PersonaId, PERSONAS } from "@/lib/audience/personas";
import type { Reaction } from "@/lib/audience/reactions";
import type { Tone } from "@/lib/audience/readings";
import { shade } from "@/lib/core/color";
import { recordFrom } from "@/lib/core/record";

/** One color per persona, so each sector of the audience reads as a group in both themes. */
const PERSONA_COLORS: Record<PersonaId, string> = {
  recruiter: "#e0715f",
  senior_dev: "#5f8fe0",
  junior_dev: "#b88a3c",
  founder: "#e0a24f",
  investor: "#62c3d9",
  hr_manager: "#d77fb0",
  product_manager: "#8f7de0",
  designer: "#e05f95",
  client: "#6cbf8b",
  uncle: "#c9c957",
  mom: "#f09a7a",
  coach: "#a4d95f",
};

export const REACTION_COLORS: Record<Reaction, string> = {
  applaud: "#f0a93b",
  share: "#4fb884",
  like: "#6b93f0",
  comment: "#9d83f2",
  disagree: "#b04a6f",
  ignore: "#8a8274",
  sleep: "#5b6a8c",
  eyeroll: "#ec6f5e",
};

/** The applause meter, from boos on the left to a standing ovation on the right. */
export const METER_SEGMENTS = ["#d9573f", "#e8894a", "#f0b54f", "#a9c55a", "#5fb37e"] as const;

/** A metric card's icon and yes-or-no bar, in the meter's colors: green for good news. */
export const TONE_COLORS: Record<Tone, string> = {
  good: METER_SEGMENTS[4],
  mixed: METER_SEGMENTS[2],
  bad: METER_SEGMENTS[0],
  neutral: "var(--muted)",
};

const SKIN_TONES = ["#f1c9a5", "#e0ac84", "#c68b62", "#a0694a", "#7a4e35", "#5a3825"] as const;

/**
 * The share card is an image, so it cannot follow the reader's theme: it always uses the
 * light paper, which stands out in a dark feed, with the stage's colors.
 */
export const CARD_COLORS = {
  paper: "#f5f1e8",
  top: "#efe6d4",
  seat: "#e2d6bf",
  ink: "#1c1a17",
  muted: "#6a6358",
  warm: "#9c4a13",
} as const;

export function personaColor(id: PersonaId): string {
  return PERSONA_COLORS[id];
}

/** Bodies are drawn a shade darker than their color, so the heads stand out against them. */
export function bodyShade(color: string): string {
  return shade(color, -0.25);
}

const BODY_COLORS = recordFrom(
  PERSONAS.map((persona) => persona.id),
  (id) => bodyShade(PERSONA_COLORS[id]),
);

/** A persona's body color, worked out once: the canvas asks for it for every seat, every frame. */
export function bodyColor(id: PersonaId): string {
  return BODY_COLORS[id];
}

/** The face of each persona in the cast, spread so neighbors in the grid rarely match. */
const PERSONA_SKINS: Record<PersonaId, number> = {
  recruiter: 3,
  senior_dev: 4,
  junior_dev: 1,
  founder: 0,
  investor: 5,
  hr_manager: 2,
  product_manager: 3,
  designer: 4,
  client: 5,
  uncle: 0,
  mom: 1,
  coach: 2,
};

export function personaSkin(id: PersonaId): string {
  return SKIN_TONES[PERSONA_SKINS[id]] ?? SKIN_TONES[1];
}

export function skinFor(index: number): string {
  return SKIN_TONES[(index * 7 + 3) % SKIN_TONES.length] ?? SKIN_TONES[1];
}
