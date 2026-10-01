import { bodyColor, skinFor } from "@/components/theme/palette";
import type { PersonaId } from "@/lib/audience/personas";
import { REACTION_INFO } from "@/lib/audience/reactions";
import { PERSON } from "@/lib/stage/person";
import { POSES } from "@/lib/stage/poses";
import { reactionAt, type SeatState } from "@/lib/stage/transitions";

import { drawCircle, drawEmoji, drawSeatBack } from "./primitives";
import type { StageColors } from "./stage-colors";

export interface Frame {
  width: number;
  height: number;
  /** The size of a front-row person, in pixels. */
  unit: number;
  now: number;
  /** False when the reader asked for less motion: every pose is frozen at time zero. */
  moving: boolean;
  colors: StageColors;
  focus: PersonaId | null;
  /** The persona under the pointer, lit more softly than the spotlight. */
  hover: PersonaId | null;
}

/** How visible the rest of the audience stays while one persona is in the spotlight. */
const OUT_OF_FOCUS = 0.18;
/** And while the pointer rests on one persona, with no spotlight. */
const OUT_OF_HOVER = 0.55;

function visibilityOf(personaId: PersonaId | null, frame: Frame): number {
  if (frame.focus !== null) return personaId === frame.focus ? 1 : OUT_OF_FOCUS;
  if (frame.hover !== null) return personaId === frame.hover ? 1 : OUT_OF_HOVER;
  return 1;
}

const HAND_SIDES = [-1, 1] as const;

/** The sleeper's "z", in units of the person's size. */
const SNORE = { left: 0.45, top: -0.5, size: 0.45, opacity: 0.8 };

export function drawSeat(context: CanvasRenderingContext2D, seat: SeatState, frame: Frame): void {
  const reaction = reactionAt(seat, frame.now);
  const seconds = frame.moving ? frame.now / 1000 : 0;
  const pose = POSES[reaction ?? "idle"](seconds, seat.phase);
  const unit = frame.unit * seat.position.scale;
  const x = seat.position.x * frame.width;
  const seatY = seat.position.y * frame.height;
  const y = seatY + pose.lift * unit;
  const headX = x + pose.headShift * unit;
  const headY = y + PERSON.head.top * unit;
  const skin = skinFor(seat.index);

  const visibility = visibilityOf(seat.personaId, frame);
  const body = seat.personaId === null ? frame.colors.idleBody : bodyColor(seat.personaId);

  context.globalAlpha = visibility;
  drawSeatBack(context, x, seatY, unit, frame.colors.seat);

  context.globalAlpha = pose.opacity * visibility;
  context.fillStyle = body;
  context.beginPath();
  context.ellipse(
    x,
    y + PERSON.body.top * unit,
    PERSON.body.halfWidth * unit,
    PERSON.body.halfHeight * unit,
    0,
    Math.PI,
    0,
  );
  context.fill();

  if (pose.face === "eyeroll") {
    drawEmoji(context, REACTION_INFO.eyeroll.emoji, headX, headY, unit * PERSON.face.size);
  } else {
    drawCircle(context, headX, headY, unit * PERSON.head.radius, skin);
  }

  if (pose.clapGap !== null) {
    for (const side of HAND_SIDES) {
      drawCircle(
        context,
        x + side * pose.clapGap * unit,
        y + PERSON.hands.top * unit,
        unit * PERSON.hands.radius,
        skin,
      );
    }
  }
  context.globalAlpha = visibility;

  if (pose.badge) {
    const badgeY = y + (PERSON.badge.top - pose.badge.bounce) * unit;
    drawEmoji(context, pose.badge.emoji, x, badgeY, unit * PERSON.badge.size);
  }

  if (pose.snore !== null) {
    context.globalAlpha = SNORE.opacity * visibility;
    context.fillStyle = frame.colors.snore;
    context.font = `bold ${String(Math.round(unit * SNORE.size))}px system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("z", x + SNORE.left * unit, y + (SNORE.top - pose.snore) * unit);
  }
  context.globalAlpha = 1;
}
