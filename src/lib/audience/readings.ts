import {
  isNoulMetric,
  levelsOf,
  type Metric,
  METRICS,
  NOUL_METRICS,
  type NoulMetric,
  SCORE_METRICS,
  type ScoreMetric,
} from "./metrics";
import type { AudienceResult, ScoreSpread } from "./result";

/** Whether a metric's value is good news for the post; "neutral" when neither way is better. */
export type Tone = "good" | "mixed" | "bad" | "neutral";

export interface MetricReading {
  metric: Metric;
  label: string;
  hint: string;
  /** The headline, in words: the likeliest level, "Dividido", or "Sim" or "Não". */
  headline: string;
  /** The chance of the headline, from 0 to 1, or null when there is no single answer to it. */
  chance: number | null;
  tone: Tone;
  /** For a score, how Jev spread it over the rubric, from the lowest level to the highest. */
  levels: SpreadLevel[] | null;
  /** How sure Jev said it was of the score, from 0 to 1, when it said. */
  confidence: number | null;
}

export interface SpreadLevel {
  label: string;
  probability: number;
  /** From 0 (the worst for the post) to the number of levels less one (the best). */
  quality: number;
}

const HINTS: Record<Metric, string> = {
  clarity: "Fácil de entender na primeira leitura",
  authenticity: "Soa pessoal, com a voz de quem escreveu",
  cliche: "Frases feitas e fórmulas de LinkedIn",
  soundsLikeAi: "Tom genérico de texto gerado por IA",
  callToAction: "Pede para comentar, se candidatar ou clicar",
};

/** A score is good news from here up and bad news below `BAD_BELOW`, once turned so higher is better. */
const GOOD_FROM = 0.6;
const BAD_BELOW = 0.4;

const toneOf = (goodness: number): Tone =>
  goodness >= GOOD_FROM ? "good" : goodness < BAD_BELOW ? "bad" : "mixed";

/**
 * Jev is split when a level has at least this much and trails the likeliest by less than
 * `SPLIT_GAP`. A neighbor of the likeliest agrees on the direction, so it never splits.
 */
const SPLIT_FROM = 0.2;
const SPLIT_GAP = 0.15;

function isSplit(first: SpreadLevel, levels: readonly SpreadLevel[]): boolean {
  return levels.some(
    (level) =>
      Math.abs(level.quality - first.quality) > 1 &&
      level.probability >= SPLIT_FROM &&
      first.probability - level.probability < SPLIT_GAP,
  );
}

function fitsRubric(spread: ScoreSpread, levels: number): boolean {
  return spread.levels.length === levels && spread.levels.some((probability) => probability > 0);
}

/**
 * A score, in words: the level Jev finds most likely, or "Dividido" when it hesitates between
 * two far apart, rather than the average, which can land on a level Jev barely believes. The
 * tone follows the headline. Without a spread that fits the rubric, as in an older link, only
 * the average is left.
 */
function scoreReading(
  metric: ScoreMetric,
  value: number,
  spread: ScoreSpread | null,
): MetricReading {
  const { label } = SCORE_METRICS[metric];
  const criteria = levelsOf(metric);
  const top = criteria.length - 1;
  const higherIsWorse = metric === "cliche";
  const base = { metric, label, hint: HINTS[metric] };
  const averageTone = toneOf(higherIsWorse ? 1 - value : value);
  if (!spread || !fitsRubric(spread, criteria.length)) {
    const headline = criteria[Math.round(value * top)] ?? "";
    return { ...base, headline, chance: null, tone: averageTone, levels: null, confidence: null };
  }
  const levels = criteria.map((name, index) => ({
    label: name,
    probability: spread.levels[index] ?? 0,
    quality: higherIsWorse ? top - index : index,
  }));
  const [first] = [...levels].sort((a, b) => b.probability - a.probability);
  if (!first || isSplit(first, levels)) {
    return {
      ...base,
      headline: "Dividido",
      chance: null,
      tone: averageTone,
      levels,
      confidence: spread.confidence,
    };
  }
  return {
    ...base,
    headline: first.label,
    chance: first.probability,
    tone: toneOf(first.quality / top),
    levels,
    confidence: spread.confidence,
  };
}

function noulReading(metric: NoulMetric, yes: number): MetricReading {
  const answer = yes >= 0.5;
  const certainty = answer ? yes : 1 - yes;
  const tone: Tone = metric === "callToAction" ? "neutral" : answer ? "bad" : "good";
  return {
    metric,
    label: NOUL_METRICS[metric].label,
    hint: HINTS[metric],
    headline: answer ? "Sim" : "Não",
    chance: certainty,
    tone,
    levels: null,
    confidence: null,
  };
}

export function readMetric(
  metric: Metric,
  value: number,
  spread: ScoreSpread | null = null,
): MetricReading {
  return isNoulMetric(metric) ? noulReading(metric, value) : scoreReading(metric, value, spread);
}

export function readMetrics(result: Pick<AudienceResult, "metrics" | "spreads">): MetricReading[] {
  return METRICS.map((metric) =>
    readMetric(
      metric,
      result.metrics[metric],
      isNoulMetric(metric) ? null : result.spreads[metric],
    ),
  );
}
