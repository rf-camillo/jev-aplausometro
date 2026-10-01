import { bodyShade } from "@/components/theme/palette";

/** The colors of the theater, read from the CSS tokens so the canvas follows the theme. */
export interface StageColors {
  seat: string;
  /** The body of someone still waiting for a post, before a persona sits there. */
  idleBody: string;
  glow: string;
  snore: string;
}

/** Reads the tokens once per theme; the canvas keeps them between frames. */
export function readStageColors(element: Element): StageColors {
  const style = getComputedStyle(element);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    seat: token("--stage-seat"),
    idleBody: bodyShade(token("--stage-idle")),
    glow: token("--stage-glow"),
    snore: token("--stage-snore"),
  };
}
