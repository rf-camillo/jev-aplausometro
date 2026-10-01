import { PERSON } from "@/lib/stage/person";

const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

export function drawSeatBack(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  unit: number,
  color: string,
): void {
  context.fillStyle = color;
  context.beginPath();
  const { width, height, top, radius } = PERSON.seat;
  context.roundRect(
    x - (width * unit) / 2,
    y + top * unit,
    width * unit,
    height * unit,
    radius * unit,
  );
  context.fill();
}

export function drawEmoji(
  context: CanvasRenderingContext2D,
  emoji: string,
  x: number,
  y: number,
  size: number,
): void {
  context.font = `${String(Math.round(size))}px ${EMOJI_FONT}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(emoji, x, y);
}

export function drawCircle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
): void {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}
