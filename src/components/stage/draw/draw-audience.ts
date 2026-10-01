import type { SeatState } from "@/lib/stage/transitions";

import { drawSeat, type Frame } from "./draw-seat";

/** The last glow built for each canvas; it only changes with the size or the theme. */
const glows = new WeakMap<CanvasRenderingContext2D, { key: string; glow: CanvasGradient }>();

function stageGlow(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
): CanvasGradient {
  const key = `${String(width)}×${String(height)} ${color}`;
  const cached = glows.get(context);
  if (cached?.key === key) return cached.glow;
  const centerY = height * 1.1;
  const glow = context.createRadialGradient(
    width / 2,
    centerY,
    height * 0.1,
    width / 2,
    centerY,
    height * 1.1,
  );
  glow.addColorStop(0, color);
  glow.addColorStop(1, "transparent");
  glows.set(context, { key, glow });
  return glow;
}

/** The whole audience, in the order given: back rows first, so the front rows overlap them. */
export function drawAudience(
  context: CanvasRenderingContext2D,
  seats: readonly SeatState[],
  frame: Frame,
): void {
  context.clearRect(0, 0, frame.width, frame.height);
  context.fillStyle = stageGlow(context, frame.width, frame.height, frame.colors.glow);
  context.fillRect(0, 0, frame.width, frame.height);
  for (const seat of seats) drawSeat(context, seat, frame);
}
