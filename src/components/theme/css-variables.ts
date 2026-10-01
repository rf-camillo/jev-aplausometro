import type { CSSProperties } from "react";

/**
 * Inline custom properties, like `--tone`, for a stylesheet to read. React's style type knows
 * no custom properties, so the one cast lives here.
 */
export function cssVariables(variables: Record<`--${string}`, string>): CSSProperties {
  return variables;
}
