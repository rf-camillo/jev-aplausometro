import { scoreOf } from "@/lib/audience/ranking";
import { type Distribution, REACTION_INFO, topReaction } from "@/lib/audience/reactions";
import type { PersonaResult } from "@/lib/audience/result";
import { percent } from "@/lib/core/format";

export function MostCommonReaction({ distribution }: { distribution: Distribution }) {
  const top = topReaction(distribution);
  const { emoji, label } = REACTION_INFO[top];
  return (
    <span className="persona-top">
      Mais comum: {emoji} {label.toLowerCase()} ({percent(distribution[top])})
    </span>
  );
}

export function JevConfidence({ confidence }: { confidence: number }) {
  return <span className="persona-confidence">Confiança do Jev: {percent(confidence)}</span>;
}

export function PersonaScore({ item }: { item: PersonaResult }) {
  return (
    <span className="persona-score">
      <strong>{scoreOf(item)}</strong>
      <span>de 100</span>
    </span>
  );
}
