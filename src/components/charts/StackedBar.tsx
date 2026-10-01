import { percent } from "@/lib/core/format";

export interface BarPart {
  key: string;
  /** Its share of the whole, from 0 to 1. */
  share: number;
  color: string;
  tip: string;
}

interface StackedBarProps {
  parts: BarPart[];
  /** The whole bar in words, for screen readers; null when the page says it elsewhere. */
  description: string | null;
}

export function StackedBar({ parts, description }: StackedBarProps) {
  const a11y =
    description === null ? { "aria-hidden": true } : { role: "img", "aria-label": description };
  return (
    <span className="stacked-bar" {...a11y}>
      {parts
        .filter((part) => part.share > 0)
        .map((part) => (
          <span
            key={part.key}
            className="stacked-part"
            style={{ width: percent(part.share), background: part.color }}
          >
            <span className="tooltip stacked-tip" aria-hidden="true">
              {part.tip}
            </span>
          </span>
        ))}
    </span>
  );
}
