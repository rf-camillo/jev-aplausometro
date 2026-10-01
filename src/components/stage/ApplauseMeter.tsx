import { READING_TEXT } from "@/lib/audience/status";
import { verdictFor } from "@/lib/audience/verdict";
import { METER, needleAngle } from "@/lib/stage/meter";

import { meterArc } from "./meter-arc";

interface ApplauseMeterProps {
  value: number | null;
  loading: boolean;
}

/** The number sits under the pivot with room around it; without one, the drawing ends at the arc. */
const VALUE_Y = 152;
const HEIGHT_WITH_VALUE = 168;

function captionFor(value: number | null, loading: boolean): string {
  if (loading) return READING_TEXT;
  if (value === null) return "A plateia está esperando o seu post para reagir…";
  const verdict = verdictFor(value);
  return `${verdict.emoji} ${verdict.label}`;
}

export function ApplauseMeter({ value, loading }: ApplauseMeterProps) {
  const reading = value ?? 0;
  const height = value === null ? METER.height : HEIGHT_WITH_VALUE;
  const { pivot, needle } = METER;

  return (
    <figure className="applause-meter">
      <svg
        viewBox={`0 0 ${String(METER.width)} ${String(height)}`}
        role="img"
        aria-label={
          value === null
            ? "Aplausômetro: esperando um post"
            : `Aplausômetro: ${String(value)} de 100`
        }
      >
        {meterArc("currentColor")}
        <g
          className={loading ? "applause-needle is-loading" : "applause-needle"}
          style={{
            transformOrigin: `${String(pivot.x)}px ${String(pivot.y)}px`,
            transform: `rotate(${String(needleAngle(reading))}deg)`,
          }}
        >
          <line
            x1={pivot.x}
            y1={pivot.y}
            x2={pivot.x}
            y2={needle.tipY}
            stroke="currentColor"
            strokeWidth={needle.width}
            strokeLinecap="round"
          />
        </g>
        {value !== null && (
          <text x={pivot.x} y={VALUE_Y} textAnchor="middle" className="applause-value">
            {String(value)}
            <tspan className="applause-scale" dx="6">
              de 100
            </tspan>
          </text>
        )}
      </svg>
      <figcaption>{captionFor(value, loading)}</figcaption>
    </figure>
  );
}
