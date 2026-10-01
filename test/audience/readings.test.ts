import { describe, expect, it } from "vitest";

import { readMetric, readMetrics } from "@/lib/audience/readings";

const spreadOf = (levels: number[], confidence: number | null = 0.6) => ({ levels, confidence });

describe("readMetric", () => {
  it("names the level Jev finds most likely, with its chance", () => {
    const reading = readMetric("clarity", 0.94, spreadOf([0, 0, 0.01, 0.23, 0.76], 0.78));
    expect(reading).toMatchObject({
      headline: "Muito claro",
      chance: 0.76,
      confidence: 0.78,
      tone: "good",
    });
    expect(reading.levels?.map((level) => level.label)).toEqual([
      "Confuso",
      "Pouco claro",
      "Razoável",
      "Claro",
      "Muito claro",
    ]);
  });

  it("says Jev is split between two levels far apart, instead of the average", () => {
    const reading = readMetric("authenticity", 0.53, spreadOf([0.01, 0.38, 0.14, 0.42, 0.05]));
    expect(reading).toMatchObject({ headline: "Dividido", chance: null, tone: "mixed" });
    expect(readMetric("clarity", 0.5, spreadOf([0.2, 0.2, 0.2, 0.2, 0.2])).headline).toBe(
      "Dividido",
    );
  });

  it("names the likelier level when every rival is small, far behind or next to it", () => {
    const headlineOf = (levels: number[]) => readMetric("clarity", 0.6, spreadOf(levels)).headline;
    expect(headlineOf([0, 0, 0.1, 0.24, 0.66])).toBe("Muito claro");
    expect(headlineOf([0, 0.1, 0.2, 0.45, 0.25])).toBe("Claro");
    expect(headlineOf([0, 0, 0.15, 0.45, 0.4])).toBe("Claro");
  });

  it("splits from a rival of 20% and below a gap of 15 points", () => {
    const headlineOf = (levels: number[]) => readMetric("clarity", 0.5, spreadOf(levels)).headline;
    expect(headlineOf([0.2, 0.1, 0.34, 0.16, 0.2])).toBe("Dividido");
    expect(headlineOf([0.19, 0.1, 0.33, 0.19, 0.19])).toBe("Razoável");
    expect(headlineOf([0.3, 0.1, 0.45, 0.05, 0.1])).toBe("Razoável");
    expect(headlineOf([0.31, 0.1, 0.45, 0.04, 0.1])).toBe("Dividido");
  });

  it("colors a score by its headline, not by the average", () => {
    const reading = readMetric("authenticity", 0.47, spreadOf([0.04, 0.51, 0.09, 0.31, 0.05]));
    expect(reading).toMatchObject({ headline: "Pouco autêntico", tone: "bad" });
    expect(readMetric("cliche", 0.2, spreadOf([0.7, 0.2, 0.1, 0, 0])).tone).toBe("good");
  });

  it("reads a spread that does not fit the rubric as if it had not traveled", () => {
    for (const levels of [
      [0.5, 0.5],
      [0, 0, 0, 0, 0],
    ]) {
      expect(readMetric("clarity", 0.75, spreadOf(levels))).toMatchObject({
        headline: "Claro",
        chance: null,
        levels: null,
      });
    }
  });

  it("ranks the levels from worst to best, a cliché going the other way", () => {
    const clarity = readMetric("clarity", 0.5, spreadOf([0.2, 0.2, 0.2, 0.2, 0.2]));
    const cliche = readMetric("cliche", 0.5, spreadOf([0.2, 0.2, 0.2, 0.2, 0.2]));
    expect(clarity.levels?.map((level) => level.quality)).toEqual([0, 1, 2, 3, 4]);
    expect(cliche.levels?.map((level) => level.quality)).toEqual([4, 3, 2, 1, 0]);
    expect(readMetric("cliche", 1).tone).toBe("bad");
    expect(readMetric("cliche", 0).tone).toBe("good");
  });

  it("falls back to the level of the average when the spread did not travel", () => {
    expect(readMetric("authenticity", 0.5)).toMatchObject({
      headline: "Neutro",
      chance: null,
      levels: null,
      tone: "mixed",
    });
    expect(readMetric("clarity", 0)).toMatchObject({ headline: "Confuso", tone: "bad" });
  });

  it("answers the yes-or-no questions with their chance", () => {
    expect(readMetric("soundsLikeAi", 0.3)).toMatchObject({
      headline: "Não",
      chance: 0.7,
      tone: "good",
    });
    expect(readMetric("soundsLikeAi", 0.9)).toMatchObject({ headline: "Sim", tone: "bad" });
    expect(readMetric("callToAction", 0.98)).toMatchObject({ headline: "Sim", tone: "neutral" });
  });
});

describe("readMetrics", () => {
  it("reads every metric in order, each with a hint and its spread", () => {
    const readings = readMetrics({
      metrics: {
        clarity: 0.9,
        authenticity: 0.5,
        cliche: 0.5,
        soundsLikeAi: 0.2,
        callToAction: 0.5,
      },
      spreads: { clarity: spreadOf([0, 0, 0.1, 0.2, 0.7]), cliche: null, authenticity: null },
    });
    expect(readings.map((reading) => reading.metric)).toEqual([
      "clarity",
      "authenticity",
      "cliche",
      "soundsLikeAi",
      "callToAction",
    ]);
    expect(readings.every((reading) => reading.hint.length > 0)).toBe(true);
    expect(readings[0]?.chance).toBe(0.7);
    expect(readings[1]?.levels).toBeNull();
  });
});
