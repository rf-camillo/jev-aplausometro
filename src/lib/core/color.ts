/** A hex color made lighter (positive amount) or darker (negative), channel by channel. */
export function shade(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) =>
    Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * (1 + amount))));
  return `rgb(${String(channel(16))}, ${String(channel(8))}, ${String(channel(0))})`;
}
