import { StackedBar } from "@/components/charts/StackedBar";
import { REACTION_COLORS } from "@/components/theme/palette";
import { type Distribution, REACTION_INFO, REACTIONS } from "@/lib/audience/reactions";
import { percent } from "@/lib/core/format";

export function ReactionBar({ distribution }: { distribution: Distribution }) {
  const parts = REACTIONS.map((reaction) => ({
    key: reaction,
    share: distribution[reaction],
    color: REACTION_COLORS[reaction],
    tip: `${REACTION_INFO[reaction].emoji} ${REACTION_INFO[reaction].label} · ${percent(distribution[reaction])}`,
  }));
  return <StackedBar parts={parts} description={null} />;
}
