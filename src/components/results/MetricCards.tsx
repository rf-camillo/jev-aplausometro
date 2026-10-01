import { Bot, Eye, FingerprintPattern, type LucideIcon, Megaphone, Repeat } from "lucide-react";
import { createElement } from "react";

import { StackedBar } from "@/components/charts/StackedBar";
import { cssVariables } from "@/components/theme/css-variables";
import { TONE_COLORS } from "@/components/theme/palette";
import type { Metric } from "@/lib/audience/metrics";
import { type MetricReading, readMetrics } from "@/lib/audience/readings";
import type { AudienceResult } from "@/lib/audience/result";
import { percent } from "@/lib/core/format";

import { SpreadBar } from "./SpreadBar";

const ICONS: Record<Metric, LucideIcon> = {
  clarity: Eye,
  authenticity: FingerprintPattern,
  cliche: Repeat,
  soundsLikeAi: Bot,
  callToAction: Megaphone,
};

interface MetricCardsProps {
  result: AudienceResult;
}

function noteOf(reading: MetricReading): string | null {
  if (reading.levels) {
    return reading.confidence === null ? null : `Confiança do Jev: ${percent(reading.confidence)}`;
  }
  return reading.chance === null ? null : `${percent(reading.chance)} de chance`;
}

function ChanceBar({ reading }: { reading: MetricReading }) {
  const chance = reading.chance ?? 0;
  const part = {
    key: reading.headline,
    share: chance,
    color: TONE_COLORS[reading.tone],
    tip: `${reading.headline} · ${percent(chance)}`,
  };
  return <StackedBar parts={[part]} description={null} />;
}

export function MetricCards({ result }: MetricCardsProps) {
  return (
    <section className="panel" aria-labelledby="metrics-title">
      <h2 id="metrics-title" className="eyebrow panel-title">
        O post em números
      </h2>
      <ul className="metric-cards">
        {readMetrics(result).map((reading) => (
          <li
            key={reading.metric}
            className="metric-card"
            style={cssVariables({ "--tone": TONE_COLORS[reading.tone] })}
          >
            <span className="metric-head">
              <span className="metric-icon" aria-hidden="true">
                {createElement(ICONS[reading.metric])}
              </span>
              <span className="metric-label">{reading.label}</span>
            </span>
            <span className="metric-headline">
              {reading.headline}
              {reading.levels && reading.chance !== null && (
                <span className="metric-chance">{percent(reading.chance)}</span>
              )}
            </span>
            {reading.levels ? (
              <SpreadBar levels={reading.levels} />
            ) : (
              <ChanceBar reading={reading} />
            )}
            <span className="metric-note">{noteOf(reading)}</span>
            <span className="metric-hint">{reading.hint}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
