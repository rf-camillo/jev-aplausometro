import { describe, expect, it } from "vitest";

import { bodyPath, PERSON, personShape } from "@/lib/stage/person";

describe("personShape", () => {
  it("places the seat, the body and the head around the seat position, to scale", () => {
    const shape = personShape(100, 50, 10);
    expect(shape.head).toEqual({
      cx: 100,
      cy: 50 + PERSON.head.top * 10,
      r: PERSON.head.radius * 10,
    });
    expect(shape.body.rx).toBeCloseTo(PERSON.body.halfWidth * 10);
    expect(shape.seat.x + shape.seat.width / 2).toBeCloseTo(100);
    expect(shape.seat.y).toBeCloseTo(50 + PERSON.seat.top * 10);
  });

  it("draws the body as the upper half of its ellipse", () => {
    expect(bodyPath({ cx: 10, cy: 20, rx: 5, ry: 4 })).toBe("M 5 20 a 5 4 0 0 1 10 0 Z");
  });
});
