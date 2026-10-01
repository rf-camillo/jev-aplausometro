import { StackedBar } from "@/components/charts/StackedBar";
import { METER_SEGMENTS } from "@/components/theme/palette";
import type { SpreadLevel } from "@/lib/audience/readings";
import { percent } from "@/lib/core/format";

/**
 * How Jev spread a score over its rubric, as one bar from the lowest level to the highest,
 * each level in the meter's color for how good it is for the post.
 */
export function SpreadBar({ levels }: { levels: SpreadLevel[] }) {
  const parts = levels.map((level) => ({
    key: level.label,
    share: level.probability,
    color: METER_SEGMENTS[level.quality] ?? METER_SEGMENTS[2],
    tip: `${level.label} · ${percent(level.probability)}`,
  }));
  const description = `Distribuição: ${levels.map((level) => `${level.label} ${percent(level.probability)}`).join(", ")}`;
  return <StackedBar parts={parts} description={description} />;
}
