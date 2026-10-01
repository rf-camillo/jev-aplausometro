import { meterArc } from "@/components/stage/meter-arc";
import { CARD_COLORS } from "@/components/theme/palette";
import { METER, needleTip } from "@/lib/stage/meter";

/** The stage's applause meter, its needle drawn straight to where it points. */
export function CardMeter({ reading }: { reading: number }) {
  const tip = needleTip(reading);
  return (
    <svg width={230} height={133} viewBox={`0 0 ${String(METER.width)} ${String(METER.height)}`}>
      <line
        x1={METER.pivot.x}
        y1={METER.pivot.y}
        x2={tip.x}
        y2={tip.y}
        stroke={CARD_COLORS.ink}
        strokeWidth={METER.needle.width}
        strokeLinecap="round"
      />
      {meterArc(CARD_COLORS.ink)}
    </svg>
  );
}
