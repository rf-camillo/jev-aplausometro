export interface SeatPosition {
  /** Horizontal center, from 0 (left) to 1 (right). */
  x: number;
  /** Vertical center, from 0 (top, the back row) to 1 (bottom, the front row). */
  y: number;
  /** Drawing scale: front rows are bigger than back rows. */
  scale: number;
  /** 0 is the front row. */
  row: number;
}

export interface StageLayout {
  rows: readonly number[];
  positions: SeatPosition[];
}

/** Seats per row, front to back, adding up to the 120 seats of the audience. */
export const ROWS = [10, 12, 13, 14, 16, 17, 18, 20] as const;

/** The same audience in more, shorter rows, so each person is bigger on a narrow screen. */
export const COMPACT_ROWS = [8, 9, 10, 11, 12, 12, 13, 14, 15, 16] as const;

/** Below this width, in CSS pixels, the stage switches to the compact rows. */
export const COMPACT_BELOW_PX = 600;

const FRONT_SCALE = 1;
const BACK_SCALE = 0.72;
/** How much the middle of a row bows toward the stage, as a share of the height. */
const ARC_DEPTH = 0.07;
/** The share of the width the widest row spans. */
const SPREAD = 0.9;
/** The front row's vertical center and how far up the back row sits, as shares of the height. */
const FRONT_Y = 0.86;
const DEPTH_Y = 0.74;
/** The room a person needs, in their own units: side by side in a row, and from row to row. */
const SEAT_WIDTH_UNITS = 1.15;
const ROW_HEIGHT_UNITS = 1.3;

const scaleAt = (depth: number): number => FRONT_SCALE + (BACK_SCALE - FRONT_SCALE) * depth;
/** A row's span as a share of the width: the back rows open wider, like an amphitheater. */
const rowWidthAt = (depth: number): number => SPREAD * (0.82 + 0.18 * depth);

/**
 * An auditorium seen from the stage: curved rows, the front one at the bottom. Seats come
 * sorted from left to right, so consecutive seats form a wedge from the front to the back,
 * and each persona gets its own sector of the audience.
 */
export function seatPositions(rows: readonly number[] = ROWS): SeatPosition[] {
  const last = Math.max(1, rows.length - 1);
  const positions = rows.flatMap((count, row) => {
    const depth = row / last;
    const scale = scaleAt(depth);
    const width = rowWidthAt(depth);
    const baseY = FRONT_Y - depth * DEPTH_Y;
    return Array.from({ length: count }, (_, index): SeatPosition => {
      const t = count === 1 ? 0.5 : index / (count - 1);
      const offset = t - 0.5;
      const x = 0.5 + offset * width;
      const y = baseY - ARC_DEPTH * (1 - (2 * offset) ** 2) * (1 - depth * 0.4);
      return { x, y, scale, row };
    });
  });
  return positions.sort((a, b) => a.x - b.x || a.row - b.row);
}

const WIDE: StageLayout = { rows: ROWS, positions: seatPositions(ROWS) };
const COMPACT: StageLayout = { rows: COMPACT_ROWS, positions: seatPositions(COMPACT_ROWS) };

export function layoutFor(width: number): StageLayout {
  return width < COMPACT_BELOW_PX ? COMPACT : WIDE;
}

/**
 * The size of a front-row person, in pixels: as big as the tightest row allows side by side
 * (each row at its own scale) and as the space between rows allows front to back.
 */
export function seatUnit(width: number, height: number, rows: readonly number[]): number {
  const last = Math.max(1, rows.length - 1);
  const across = rows.map((count, row) => {
    const depth = row / last;
    const spacing = (width * rowWidthAt(depth)) / Math.max(1, count - 1);
    return spacing / (scaleAt(depth) * SEAT_WIDTH_UNITS);
  });
  const rowGap = (height * DEPTH_Y) / last;
  return Math.min(...across, rowGap / (FRONT_SCALE * ROW_HEIGHT_UNITS));
}
