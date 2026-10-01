import { ThumbsDown, Trophy } from "lucide-react";

import { type Standout, STANDOUT_LABELS } from "@/lib/audience/highlights";

const ICONS = { fan: Trophy, critic: ThumbsDown } as const;

export function StandoutBadge({ standout }: { standout: Standout }) {
  const Icon = ICONS[standout];
  return (
    <span className={standout === "critic" ? "persona-badge is-critic" : "persona-badge"}>
      <Icon aria-hidden="true" />
      {STANDOUT_LABELS[standout]}
    </span>
  );
}
