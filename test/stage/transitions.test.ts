import { describe, expect, it } from "vitest";

import type { Seat } from "@/lib/audience/seats";
import { seatPositions } from "@/lib/stage/layout";
import {
  initialSeatStates,
  reactionAt,
  RIPPLE_MS,
  withPositions,
  withSeats,
} from "@/lib/stage/transitions";

const positions = seatPositions([3]);
const [left, center, right] = [0, 1, 2];

function seats(reaction: Seat["reaction"]): Seat[] {
  return positions.map(() => ({ personaId: "mom", reaction }));
}

describe("seat transitions", () => {
  it("start with an empty audience that sways out of sync", () => {
    const states = initialSeatStates(positions);
    expect(states.map((state) => state.reaction)).toEqual([null, null, null]);
    expect(new Set(states.map((state) => state.phase)).size).toBe(3);
  });

  it("ripple a new reaction from the center to the edges", () => {
    const states = withSeats(initialSeatStates(positions), seats("applaud"), 1000, true);
    expect(states[center]?.changeAt).toBe(1000 + (center % 7) * 25);
    const centerAt = states[center]?.changeAt ?? 0;
    expect(states[left]?.changeAt).toBeGreaterThan(centerAt + RIPPLE_MS / 2);
    expect(states[right]?.changeAt).toBeGreaterThan(centerAt + RIPPLE_MS / 2);
    const edge = states[right];
    expect(edge && reactionAt(edge, 1000)).toBeNull();
    expect(edge && reactionAt(edge, 1000 + RIPPLE_MS * 2)).toBe("applaud");
  });

  it("switch everyone at once without the ripple", () => {
    const states = withSeats(initialSeatStates(positions), seats("like"), 500, false);
    expect(states.every((state) => state.changeAt === 500)).toBe(true);
  });

  it("keep the reaction that was showing when a change interrupts the ripple", () => {
    const first = withSeats(initialSeatStates(positions), seats("applaud"), 0, true);
    const second = withSeats(first, seats("eyeroll"), 100, true);
    expect(second[right]?.previous).toBeNull();
    expect(second[center]?.previous).toBe("applaud");
  });

  it("leave unchanged reactions alone and keep who sits where across layouts", () => {
    const states = withSeats(initialSeatStates(positions), seats("like"), 0, false);
    expect(withSeats(states, seats("like"), 9999, true)).toEqual(states);

    const layout = seatPositions([1, 2]);
    const moved = withPositions(states, layout);
    expect(moved.map((state) => state.reaction)).toEqual(["like", "like", "like"]);
    expect(moved.every((state) => state.position === layout[state.index])).toBe(true);
    const rows = moved.map((state) => state.position.y);
    expect(rows).toEqual([...rows].sort((a, b) => a - b));
    const kept = withPositions(states, []).find((state) => state.index === 0);
    expect(kept?.position).toEqual(positions[0]);
  });
});
