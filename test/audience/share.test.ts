import { describe, expect, it } from "vitest";

import { METRICS, SCORE_LEVELS, SCORE_METRIC_LIST } from "@/lib/audience/metrics";
import { PERSONAS } from "@/lib/audience/personas";
import { REACTIONS } from "@/lib/audience/reactions";
import { interpretEvaluation } from "@/lib/audience/result";
import { arrangeSeats } from "@/lib/audience/seats";
import { decodeShare, encodeShare, resultOnShow, SHARE_BYTES } from "@/lib/audience/share";
import { LATEST, spreadsOffset, V1, V2, V3 } from "@/lib/audience/share-format";
import { hashString } from "@/lib/core/hash";

import { fakeEvaluation } from "../support/evaluations";

const result = interpretEvaluation(
  fakeEvaluation({
    fallback: { like: 0.46, applaud: 0.31, eyeroll: 0.23 },
    reactions: { senior_dev: { eyeroll: 0.97, ignore: 0.03 }, mom: { applaud: 1 } },
    scores: { clarity: 3.76, cliche: 3.56 },
    nouls: { soundsLikeAi: 0.46 },
  }),
);

function bytesOf(code: string): Uint8Array {
  const binary = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function codeOf(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("shared links", () => {
  const code = encodeShare(result, 0xdeadbeef);

  it("fit in a short, URL-safe code", () => {
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(code.length).toBeLessThan(190);
    expect(bytesOf(code)).toHaveLength(SHARE_BYTES);
  });

  it("bring back the meter, the metrics, the seed and every persona", () => {
    const shared = decodeShare(code);
    expect(shared?.seed).toBe(0xdeadbeef);
    expect(shared?.result.applause).toBe(result.applause);
    expect(shared?.result.metrics.clarity).toBeCloseTo(result.metrics.clarity, 2);
    expect(shared?.result.metrics.soundsLikeAi).toBe(0.46);
    for (const [index, original] of result.personas.entries()) {
      const copy = shared?.result.personas[index];
      expect(copy?.persona.id).toBe(original.persona.id);
      expect(copy?.confidence).toBe(original.confidence);
      for (const reaction of REACTIONS) {
        expect(copy?.distribution[reaction]).toBeCloseTo(original.distribution[reaction], 2);
      }
    }
  });

  it("bring back how each score spread over its levels, and Jev's confidence in it", () => {
    const shared = decodeShare(code);
    for (const metric of ["clarity", "cliche", "authenticity"] as const) {
      const original = result.spreads[metric];
      const copy = shared?.result.spreads[metric];
      expect(copy?.confidence).toBe(original?.confidence);
      copy?.levels.forEach((level, index) => {
        expect(level).toBeCloseTo(original?.levels[index] ?? -1, 2);
      });
    }
  });

  it("seat the same audience as the original", () => {
    const shared = decodeShare(code);
    expect(shared && arrangeSeats(shared.result, shared.seed)).toEqual(
      arrangeSeats(result, 0xdeadbeef),
    );
  });

  it("keep an unknown confidence unknown", () => {
    const unknown = {
      ...result,
      personas: result.personas.map((item) => ({ ...item, confidence: null })),
    };
    expect(decodeShare(encodeShare(unknown, 1))?.result.personas[0]?.confidence).toBeNull();
  });

  it("reject anything that encodeShare did not make", () => {
    const valid = bytesOf(code);
    const spreadsAt = spreadsOffset(LATEST.layout);
    const tampered = (index: number, value: number) => {
      const bytes = valid.slice();
      bytes[index] = value;
      return codeOf(bytes);
    };
    const silent = valid.slice();
    silent.fill(0, 21, 29);
    const flatSpread = valid.slice();
    flatSpread.fill(0, spreadsAt, spreadsAt + 5);
    const halfAbsent = valid.slice();
    halfAbsent[spreadsAt] = 255;

    for (const bad of [
      "",
      "not a code!",
      "%%%",
      "A",
      code.slice(0, -4),
      tampered(0, 4),
      tampered(1, 101),
      tampered(2, 150),
      tampered(11, 180),
      tampered(12, 101),
      codeOf(silent),
      tampered(spreadsAt, 150),
      tampered(spreadsAt + 5, 180),
      codeOf(flatSpread),
      codeOf(halfAbsent),
    ]) {
      expect(decodeShare(bad)).toBeNull();
    }
  });

  it("accept only one spelling of each result", () => {
    const last = code.at(-1) ?? "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const sibling = code.slice(0, -1) + (alphabet[alphabet.indexOf(last) ^ 1] ?? "");
    expect(bytesOf(sibling)).toEqual(bytesOf(code));
    expect(decodeShare(sibling)).toBeNull();
    expect(decodeShare(code)).not.toBeNull();
  });

  it("keep reading a link shared with version 1, number for number", () => {
    const golden =
      "AVNLGTIeWgE1KEJQBQBfAAAAAFAKAFoAAAAAUA8AVQAAAABQFABQAAAAAFAZAEsAAAAAUB4ARgAAAABQIwBBAAAAAFAoADwAAAAAUC0ANwAAAABQMgAyAAAAAFA3AC0AAAAAUDwAKAAAAAA";
    const shared = decodeShare(golden);
    expect(shared?.seed).toBe(20260930);
    expect(shared?.result.applause).toBe(83);
    expect(Object.values(shared?.result.spreads ?? {})).toEqual([null, null, null]);
    expect(shared?.result.metrics).toEqual({
      clarity: 0.75,
      cliche: 0.25,
      authenticity: 0.5,
      soundsLikeAi: 0.3,
      callToAction: 0.9,
    });
    const applauded: Record<string, number> = {
      recruiter: 0.05,
      senior_dev: 0.1,
      junior_dev: 0.15,
      founder: 0.2,
      investor: 0.25,
      hr_manager: 0.3,
      product_manager: 0.35,
      designer: 0.4,
      client: 0.45,
      uncle: 0.5,
      mom: 0.55,
      coach: 0.6,
    };
    for (const [id, applaud] of Object.entries(applauded)) {
      const item = shared?.result.personas.find((candidate) => candidate.persona.id === id);
      expect(item?.confidence, id).toBe(0.8);
      expect(item?.distribution.applaud, id).toBeCloseTo(applaud, 5);
      expect(item?.distribution.like, id).toBeCloseTo(1 - applaud, 5);
    }
  });

  it("keep reading a link shared with version 2, spreads and all", () => {
    const golden =
      "AktLGTIeCgE1KIlQAABkAAAAAFAAAGQAAAAAUAAAZAAAAABQAABkAAAAAFAAAGQAAAAAUAAAZAAAAABQAABkAAAAAFAAAGQAAAAAUAAAZAAAAABQAABkAAAAAFAAAGQAAAAAUAAAZAAAAAAAAgMfQDwAAAEjQDwEMwkfBTw";
    const shared = decodeShare(golden);
    expect(shared?.seed).toBe(20261001);
    const spreads: Record<string, number[]> = {
      clarity: [0, 0.02, 0.03, 0.31, 0.64],
      cliche: [0, 0, 0.01, 0.35, 0.64],
      authenticity: [0.04, 0.51, 0.09, 0.31, 0.05],
    };
    for (const [metric, levels] of Object.entries(spreads)) {
      const spread = shared?.result.spreads[metric as keyof typeof shared.result.spreads];
      expect(spread?.confidence, metric).toBe(0.6);
      levels.forEach((level, index) => {
        expect(spread?.levels[index], metric).toBeCloseTo(level, 5);
      });
    }
  });

  it("keep reading a link shared with version 3, disagreement and all", () => {
    const golden =
      "Az5LGTIeCgE1KIpQAAAyMgAAAABQAAAAADwAAChQAAAyMgAAAABQAAAyMgAAAABQAAAyMgAAAABQAAAyMgAAAABQAAAyMgAAAABQAAAyMgAAAABQAAAyMgAAAABQAAAyMgAAAABQAAAyMgAAAABQAAAyMgAAAAAFChQoGTwFChQoGTwFChQoGTw";
    const shared = decodeShare(golden);
    expect(shared?.seed).toBe(20261002);
    expect(shared?.result.applause).toBe(62);
    const senior = shared?.result.personas.find((item) => item.persona.id === "senior_dev");
    expect(senior?.distribution).toMatchObject({ disagree: 0.6, eyeroll: 0.4, like: 0 });
    const mom = shared?.result.personas.find((item) => item.persona.id === "mom");
    expect(mom?.distribution).toMatchObject({ like: 0.5, comment: 0.5, disagree: 0 });
  });

  it("read the reactions older links did not have as never given", () => {
    const golden =
      "AVNLGTIeWgE1KEJQBQBfAAAAAFAKAFoAAAAAUA8AVQAAAABQFABQAAAAAFAZAEsAAAAAUB4ARgAAAABQIwBBAAAAAFAoADwAAAAAUC0ANwAAAABQMgAyAAAAAFA3AC0AAAAAUDwAKAAAAAA";
    for (const item of decodeShare(golden)?.result.personas ?? []) {
      expect(item.distribution.disagree).toBe(0);
    }
  });

  it("cover every persona, reaction and metric of the app in the latest version", () => {
    // A failure here means the app grew: shared links need a new version that still reads the older ones.
    expect([...V1.personas].sort()).toEqual(PERSONAS.map((persona) => persona.id).sort());
    expect([...LATEST.layout.reactions].sort()).toEqual([...REACTIONS].sort());
    expect([...V3.reactions]).toEqual([...LATEST.layout.reactions]);
    expect([...V1.metrics].sort()).toEqual([...METRICS].sort());
  });

  it("cover every score of the app, level by level, since version 2", () => {
    expect([...V2.scores].sort()).toEqual([...SCORE_METRIC_LIST].sort());
    expect(V2.levels).toBe(SCORE_LEVELS);
  });
});

describe("resultOnShow", () => {
  const shared = { result, seed: 7 };

  it("shows the shared result until the reader has their own", () => {
    expect(resultOnShow(null, shared)).toBe(shared);
    expect(resultOnShow(null, null)).toBeNull();
  });

  it("shows the reader's own result, seated by the hash of their post", () => {
    expect(resultOnShow({ post: "meu post", result }, shared)).toEqual({
      result,
      seed: hashString("meu post"),
    });
  });
});
