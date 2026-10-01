/**
 * The applause meter's drawing, in a 200-wide view box, shared by the page and the share
 * card: an arc of colored segments and a needle that turns around the pivot, from left (0)
 * to right (100).
 */
export const METER = {
  width: 200,
  /** Down to the bottom of the pivot, where the drawing ends without a number under it. */
  height: 116,
  pivot: { x: 100, y: 100, radius: 9 },
  arc: { radius: 80, width: 16, gap: 0.005 },
  needle: { tipY: 40, width: 4 },
} as const;

function arcPoint(fraction: number): [number, number] {
  const angle = Math.PI * (1 - fraction);
  const { pivot, arc } = METER;
  return [pivot.x + arc.radius * Math.cos(angle), pivot.y - arc.radius * Math.sin(angle)];
}

/** The SVG path of one of `count` equal segments of the arc, with a small gap between them. */
export function segmentPath(index: number, count: number): string {
  const [x1, y1] = arcPoint(index / count + METER.arc.gap);
  const [x2, y2] = arcPoint((index + 1) / count - METER.arc.gap);
  const radius = String(METER.arc.radius);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** The needle's angle for a reading, in degrees from pointing straight up. */
export function needleAngle(reading: number): number {
  return -90 + (Math.min(100, Math.max(0, reading)) / 100) * 180;
}

/** Where the needle's tip is for a reading, for drawings that cannot rotate it. */
export function needleTip(reading: number): { x: number; y: number } {
  const angle = (needleAngle(reading) * Math.PI) / 180;
  const length = METER.pivot.y - METER.needle.tipY;
  return {
    x: METER.pivot.x + Math.sin(angle) * length,
    y: METER.pivot.y - Math.cos(angle) * length,
  };
}
