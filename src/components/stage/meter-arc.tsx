import type { ReactElement } from "react";

import { METER_SEGMENTS } from "@/components/theme/palette";
import { METER, segmentPath } from "@/lib/stage/meter";

/**
 * The meter's colored arc and its pivot, as plain SVG elements: a function rather than a
 * component, because the share card's renderer (Satori) takes only those inside an `<svg>`.
 */
export function meterArc(pivotColor: string): ReactElement[] {
  return [
    ...METER_SEGMENTS.map((color, index) => (
      <path
        key={color}
        d={segmentPath(index, METER_SEGMENTS.length)}
        stroke={color}
        strokeWidth={METER.arc.width}
        fill="none"
      />
    )),
    <circle
      key="pivot"
      cx={METER.pivot.x}
      cy={METER.pivot.y}
      r={METER.pivot.radius}
      fill={pivotColor}
    />,
  ];
}
