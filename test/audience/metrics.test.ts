import { describe, expect, it } from "vitest";

import {
  isNoulMetric,
  levelsOf,
  metricQuestion,
  METRICS,
  NOUL_METRICS,
  SCORE_LEVELS,
  SCORE_METRIC_LIST,
  SCORE_METRICS,
} from "@/lib/audience/metrics";

describe("the metrics", () => {
  it("lists every metric once", () => {
    const all = [...Object.keys(SCORE_METRICS), ...Object.keys(NOUL_METRICS)];
    expect([...METRICS].sort()).toEqual(all.sort());
  });

  it("asks a score or a yes-or-no question, as each metric needs", () => {
    expect(isNoulMetric("soundsLikeAi")).toBe(true);
    expect(isNoulMetric("clarity")).toBe(false);
    expect(metricQuestion("clarity").type).toBe("score");
    expect(metricQuestion("callToAction").type).toBe("noul");
  });

  it("rates every score on a rubric of the same size, each level with what it means", () => {
    for (const metric of SCORE_METRIC_LIST) {
      const question = metricQuestion(metric);
      expect(question.type === "score" && question.criteria).toHaveLength(SCORE_LEVELS);
      expect(levelsOf(metric)).toHaveLength(SCORE_LEVELS);
    }
    const clarity = metricQuestion("clarity");
    expect(clarity.type === "score" && clarity.criteria[0]).toBe(
      "Confuso: não dá para saber o que o autor quer dizer",
    );
    expect(levelsOf("authenticity")[2]).toBe("Neutro");
  });
});
