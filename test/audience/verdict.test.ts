import { describe, expect, it } from "vitest";

import { verdictFor } from "@/lib/audience/verdict";

describe("verdictFor", () => {
  it.each([
    [100, "Ovação de pé!"],
    [85, "Ovação de pé!"],
    [70, "Aplausos calorosos"],
    [50, "Palmas educadas"],
    [30, "Silêncio constrangedor"],
    [10, "Vaia!"],
    [-5, "Vaia!"],
  ])("reads %i as %s", (applause, label) => {
    expect(verdictFor(applause).label).toBe(label);
  });
});
