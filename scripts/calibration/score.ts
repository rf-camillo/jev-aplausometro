import { type Distribution, topReaction } from "../../src/lib/audience/reactions";
import { readMetrics } from "../../src/lib/audience/readings";
import type { AudienceResult } from "../../src/lib/audience/result";
import { type CalibrationPost, DISPLEASED, HIGH, LOW, ORDER, PLEASED } from "./posts";

/** What a run keeps of one post: enough to check it and to compare runs, nothing to redraw. */
export interface Snapshot {
  id: string;
  applause: number;
  personas: Record<
    string,
    { applause: number; top: string; confidence: number | null; distribution?: Distribution }
  >;
  metrics: Record<string, number>;
  headlines: Record<string, string>;
  scoreConfidence: number | null;
  latencyMs: number;
}

export interface Check {
  post: string;
  label: string;
  passed: boolean;
}

export function snapshotOf(id: string, result: AudienceResult, latencyMs: number): Snapshot {
  const personas = Object.fromEntries(
    result.personas.map((item) => [
      item.persona.id,
      {
        applause: item.applause,
        top: topReaction(item.distribution),
        confidence: item.confidence,
        distribution: item.distribution,
      },
    ]),
  );
  const readings = readMetrics(result);
  const confidences = readings.flatMap((reading) =>
    reading.confidence === null ? [] : [reading.confidence],
  );
  return {
    id,
    applause: result.applause,
    personas,
    metrics: { ...result.metrics },
    headlines: Object.fromEntries(readings.map((reading) => [reading.metric, reading.headline])),
    scoreConfidence: confidences.length > 0 ? mean(confidences) : null,
    latencyMs,
  };
}

const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

const applauseOf = (snapshot: Snapshot, persona: string): number =>
  snapshot.personas[persona]?.applause ?? Number.NaN;

export function checksOf(post: CalibrationPost, snapshot: Snapshot): Check[] {
  const { expect } = post;
  const checks: Check[] = [];
  const add = (label: string, passed: boolean) => checks.push({ post: post.id, label, passed });
  if (expect.applause) {
    const [min, max] = expect.applause;
    add(
      `aplauso entre ${String(min)} e ${String(max)}`,
      snapshot.applause >= min && snapshot.applause <= max,
    );
  }
  for (const persona of expect.pleased ?? []) {
    add(`${persona} gosta`, applauseOf(snapshot, persona) >= PLEASED);
  }
  for (const persona of expect.displeased ?? []) {
    add(`${persona} não gosta`, applauseOf(snapshot, persona) <= DISPLEASED);
  }
  for (const [first, second] of expect.above ?? []) {
    add(`${first} acima de ${second}`, applauseOf(snapshot, first) > applauseOf(snapshot, second));
  }
  for (const [metric, level] of Object.entries(expect.metrics ?? {})) {
    const value = snapshot.metrics[metric] ?? Number.NaN;
    add(
      `${metric} ${level === "high" ? "alto" : "baixo"}`,
      level === "high" ? value >= HIGH : value <= LOW,
    );
  }
  return checks;
}

export function orderChecks(snapshots: Snapshot[]): Check[] {
  const byId = new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]));
  return ORDER.map(([first, second]) => ({
    post: "ordem",
    label: `${first} acima de ${second}`,
    passed: (byId.get(first)?.applause ?? 0) > (byId.get(second)?.applause ?? 0),
  }));
}

export interface Summary {
  passed: number;
  total: number;
  applauseMin: number;
  applauseMax: number;
  applauseSpread: number;
  personaConfidence: number;
  scoreConfidence: number;
  splits: number;
  medianMs: number;
}

export function summarize(snapshots: Snapshot[], checks: Check[]): Summary {
  const applause = snapshots.map((snapshot) => snapshot.applause);
  const average = mean(applause);
  const spread = Math.sqrt(mean(applause.map((value) => (value - average) ** 2)));
  const personaConfidences = snapshots.flatMap((snapshot) =>
    Object.values(snapshot.personas).flatMap((item) =>
      item.confidence === null ? [] : [item.confidence],
    ),
  );
  const latencies = snapshots.map((snapshot) => snapshot.latencyMs).sort((a, b) => a - b);
  return {
    passed: checks.filter((check) => check.passed).length,
    total: checks.length,
    applauseMin: Math.min(...applause),
    applauseMax: Math.max(...applause),
    applauseSpread: spread,
    personaConfidence: mean(personaConfidences),
    scoreConfidence: mean(
      snapshots.flatMap((snapshot) =>
        snapshot.scoreConfidence === null ? [] : [snapshot.scoreConfidence],
      ),
    ),
    splits: snapshots.reduce(
      (count, snapshot) =>
        count +
        Object.values(snapshot.headlines).filter((headline) => headline === "Dividido").length,
      0,
    ),
    medianMs: latencies[Math.floor(latencies.length / 2)] ?? 0,
  };
}
