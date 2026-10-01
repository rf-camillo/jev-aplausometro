import { describe, expect, it } from "vitest";

import { seatPositions } from "@/lib/stage/layout";
import { seatTipAt, shiftInside, tipText } from "@/lib/stage/tip";
import { initialSeatStates } from "@/lib/stage/transitions";

describe("tipText", () => {
  it("names the person and their reaction", () => {
    expect(tipText("senior_dev", "eyeroll")).toBe("Dev Sênior · 🙄 revira os olhos");
  });

  it("says nothing for an empty seat or a seat still waiting", () => {
    expect(tipText(null, "applaud")).toBeNull();
    expect(tipText("mom", null)).toBeNull();
  });
});

describe("shiftInside", () => {
  it("leaves a tip that fits where it is", () => {
    expect(shiftInside({ left: 100, right: 300 }, 1000)).toBe(0);
  });

  it("slides a tip off either edge back inside, with a margin", () => {
    expect(shiftInside({ left: -40, right: 160 }, 1000)).toBe(48);
    expect(shiftInside({ left: 900, right: 1030 }, 1000)).toBe(-38);
  });
});

describe("seatTipAt", () => {
  const rows = [2];
  const stage = { width: 1000, height: 500, rows };
  const [left, right] = initialSeatStates(seatPositions(rows));
  const seated = [
    left && { ...left, personaId: "coach" as const, reaction: "eyeroll" as const },
    right,
  ].filter((state) => state !== undefined);
  const center = (index: number) => ({
    x: (seated[index]?.position.x ?? 0) * stage.width,
    y: (seated[index]?.position.y ?? 0) * stage.height,
  });

  it("names the person under the point, with the tip above their head", () => {
    const tip = seatTipAt(seated, center(0), stage);
    expect(tip).toMatchObject({ personaId: "coach", text: "Coach · 🙄 revira os olhos" });
    expect(tip?.left).toBeCloseTo(center(0).x);
    expect(tip?.top).toBeLessThan(center(0).y);
  });

  it("gives no tip between people or over a seat still waiting", () => {
    expect(seatTipAt(seated, { x: 500, y: 5 }, stage)).toBeNull();
    expect(seatTipAt(seated, center(1), stage)).toBeNull();
  });
});
