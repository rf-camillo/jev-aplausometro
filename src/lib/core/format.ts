/** A fraction from 0 to 1 as a whole percentage: 0.456 becomes "46%". */
export function percent(fraction: number): string {
  return `${String(Math.round(fraction * 100))}%`;
}
