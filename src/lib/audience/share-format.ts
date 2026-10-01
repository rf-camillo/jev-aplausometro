import { recordFrom } from "../core/record";
import type { Metric, ScoreMetric } from "./metrics";
import { findPersona } from "./personas";
import { type Distribution, emptyDistribution, type Reaction, REACTIONS } from "./reactions";
import { applauseOf, type AudienceResult, type PersonaResult, type ScoreSpread } from "./result";

/*
 * The bytes of a shared link. Every version is frozen once links carry it: its lists never
 * follow the app's, and a newer version keeps reading the older ones.
 *
 * Version 1, one byte each unless noted: version, applause, the five metrics, the seed (4 bytes),
 * then for every persona its confidence (255 when unknown) and its seven reactions, in percent.
 * Version 2 is version 1 followed by how each score spread over its rubric: for each of the
 * three scores, its five levels and Jev's confidence (255 when unknown), or six bytes of 255
 * when the spread did not travel. Version 3 is version 2 with eight reactions per persona,
 * "disagree" among them.
 */

export const V1 = {
  metrics: ["clarity", "cliche", "authenticity", "soundsLikeAi", "callToAction"],
  personas: [
    "recruiter",
    "senior_dev",
    "junior_dev",
    "founder",
    "investor",
    "hr_manager",
    "product_manager",
    "designer",
    "client",
    "uncle",
    "mom",
    "coach",
  ],
  reactions: ["applaud", "share", "like", "comment", "ignore", "sleep", "eyeroll"],
} as const satisfies { metrics: Metric[]; personas: string[]; reactions: Reaction[] };

export const V2 = {
  scores: ["clarity", "cliche", "authenticity"],
  levels: 5,
} as const satisfies { scores: ScoreMetric[]; levels: number };

export const V3 = {
  reactions: ["applaud", "share", "like", "comment", "disagree", "ignore", "sleep", "eyeroll"],
} as const satisfies { reactions: Reaction[] };

export interface Layout {
  reactions: readonly Reaction[];
  spreads: boolean;
}

const WITH_SPREADS: Layout = { reactions: V1.reactions, spreads: true };

/** The version this page writes, and the layout of its bytes. */
export const LATEST = { version: 3, layout: { reactions: V3.reactions, spreads: true } } as const;

export const LAYOUTS: Record<number, Layout> = {
  1: { reactions: V1.reactions, spreads: false },
  2: WITH_SPREADS,
  [LATEST.version]: LATEST.layout,
};

const UNKNOWN = 255;
const HEADER_BYTES = 2 + V1.metrics.length + 4;
const SPREAD_BYTES = V2.levels + 1;

const personaBytes = (layout: Layout): number => 1 + layout.reactions.length;

/** Where the spreads of the scores start: right after the last persona. */
export const spreadsOffset = (layout: Layout): number =>
  HEADER_BYTES + V1.personas.length * personaBytes(layout);

export const sizeOf = (layout: Layout): number =>
  spreadsOffset(layout) + (layout.spreads ? V2.scores.length * SPREAD_BYTES : 0);

/** What every version holds but the spreads of the scores. */
export interface Body {
  result: Omit<AudienceResult, "spreads">;
  seed: number;
}

const toPercent = (value: number): number => Math.round(Math.min(1, Math.max(0, value)) * 100);

export function writeBody(
  bytes: Uint8Array,
  layout: Layout,
  result: AudienceResult,
  seed: number,
): void {
  bytes[1] = Math.round(Math.min(100, Math.max(0, result.applause)));
  V1.metrics.forEach((metric, index) => {
    bytes[2 + index] = toPercent(result.metrics[metric]);
  });
  new DataView(bytes.buffer).setUint32(2 + V1.metrics.length, seed >>> 0);
  V1.personas.forEach((id, index) => {
    const offset = HEADER_BYTES + index * personaBytes(layout);
    const found = result.personas.find((item) => item.persona.id === id);
    bytes[offset] = found?.confidence == null ? UNKNOWN : toPercent(found.confidence);
    layout.reactions.forEach((reaction, position) => {
      bytes[offset + 1 + position] = toPercent(found?.distribution[reaction] ?? 0);
    });
  });
}

export function writeSpreads(bytes: Uint8Array, layout: Layout, result: AudienceResult): void {
  V2.scores.forEach((metric, index) => {
    const offset = spreadsOffset(layout) + index * SPREAD_BYTES;
    const spread = result.spreads[metric];
    for (let level = 0; level < V2.levels; level++) {
      bytes[offset + level] = spread ? toPercent(spread.levels[level] ?? 0) : UNKNOWN;
    }
    bytes[offset + V2.levels] = spread?.confidence == null ? UNKNOWN : toPercent(spread.confidence);
  });
}

/** A byte read as a share from 0 to 1, or null when it is out of range. */
function percentReader(bytes: Uint8Array) {
  return (index: number): number | null => {
    const value = bytes[index] ?? 0;
    return value <= 100 ? value / 100 : null;
  };
}

/** The body of a link, or null when any byte is out of range. */
export function readBody(bytes: Uint8Array, layout: Layout): Body | null {
  const percentAt = percentReader(bytes);
  const applause = bytes[1] ?? 0;
  if (applause > 100) return null;
  const metrics = recordFrom(V1.metrics, () => 0);
  for (const [index, metric] of V1.metrics.entries()) {
    const value = percentAt(2 + index);
    if (value === null) return null;
    metrics[metric] = value;
  }
  const seed = new DataView(bytes.buffer).getUint32(2 + V1.metrics.length);

  const personas: PersonaResult[] = [];
  for (const [index, id] of V1.personas.entries()) {
    const offset = HEADER_BYTES + index * personaBytes(layout);
    const confidenceByte = bytes[offset] ?? 0;
    if (confidenceByte > 100 && confidenceByte !== UNKNOWN) return null;
    const distribution: Distribution = emptyDistribution();
    let total = 0;
    for (const [position, reaction] of layout.reactions.entries()) {
      const value = percentAt(offset + 1 + position);
      if (value === null) return null;
      distribution[reaction] = value;
      total += value;
    }
    if (total <= 0) return null;
    for (const reaction of REACTIONS) distribution[reaction] /= total;
    const persona = findPersona(id);
    if (!persona) continue;
    personas.push({
      persona,
      distribution,
      confidence: confidenceByte === UNKNOWN ? null : confidenceByte / 100,
      applause: applauseOf(distribution),
    });
  }
  return { result: { personas, metrics, applause }, seed };
}

/** The spreads of the scores, each null when it did not travel; undefined when a byte is wrong. */
export function readSpreads(
  bytes: Uint8Array,
  layout: Layout,
): Record<ScoreMetric, ScoreSpread | null> | undefined {
  const percentAt = percentReader(bytes);
  const spreads = recordFrom<ScoreMetric, ScoreSpread | null>(V2.scores, () => null);
  if (!layout.spreads) return spreads;
  for (const [index, metric] of V2.scores.entries()) {
    const offset = spreadsOffset(layout) + index * SPREAD_BYTES;
    const absent = Array.from({ length: SPREAD_BYTES }, (_, byte) => bytes[offset + byte]);
    if (absent.every((byte) => byte === UNKNOWN)) continue;
    const levels: number[] = [];
    for (let level = 0; level < V2.levels; level++) {
      const value = percentAt(offset + level);
      if (value === null) return undefined;
      levels.push(value);
    }
    const total = levels.reduce((sum, value) => sum + value, 0);
    if (total <= 0) return undefined;
    const confidenceByte = bytes[offset + V2.levels] ?? 0;
    if (confidenceByte > 100 && confidenceByte !== UNKNOWN) return undefined;
    spreads[metric] = {
      levels: levels.map((value) => value / total),
      confidence: confidenceByte === UNKNOWN ? null : confidenceByte / 100,
    };
  }
  return spreads;
}
