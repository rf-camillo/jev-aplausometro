"use client";

import { type PointerEvent, type RefObject, useState } from "react";

import type { PersonaId } from "@/lib/audience/personas";
import { type SeatTip, seatTipAt } from "@/lib/stage/tip";
import type { SeatState } from "@/lib/stage/transitions";

interface SeatPointerOptions {
  states: RefObject<SeatState[]>;
  rows: RefObject<readonly number[]>;
  /** Where the persona under the mouse is kept, for the drawing to read on every frame. */
  hoverRef: RefObject<PersonaId | null>;
  redraw: () => void;
  onPick: ((personaId: PersonaId) => void) | null;
}

interface SeatPointer {
  tip: SeatTip | null;
  /** Forgets the person under the mouse, when the people or their seats change under it. */
  clear: () => void;
  handlers: {
    onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void;
    onPointerLeave: () => void;
    onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => void;
  };
}

/** Whether two tips say the same about the same seat, so moving within someone does not re-render. */
function sameTip(a: SeatTip | null, b: SeatTip | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return a.left === b.left && a.top === b.top && a.text === b.text;
}

/**
 * The pointer over the audience: a mouse resting on someone shows their tip and lights their
 * persona; a click or a tap picks it.
 */
export function useSeatPointer({
  states,
  rows,
  hoverRef,
  redraw,
  onPick,
}: SeatPointerOptions): SeatPointer {
  const [tip, setTip] = useState<SeatTip | null>(null);

  const tipAt = (event: PointerEvent<HTMLCanvasElement>): SeatTip | null => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const stage = { width: rect.width, height: rect.height, rows: rows.current };
    return seatTipAt(states.current, point, stage);
  };

  const hover = (next: SeatTip | null) => {
    const persona = next?.personaId ?? null;
    if (hoverRef.current !== persona) {
      hoverRef.current = persona;
      redraw();
    }
    setTip((current) => (sameTip(current, next) ? current : next));
  };

  return {
    tip,
    clear: () => {
      hover(null);
    },
    handlers: {
      onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => {
        if (event.pointerType === "mouse") hover(tipAt(event));
      },
      onPointerLeave: () => {
        hover(null);
      },
      onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => {
        const picked = tipAt(event);
        if (picked) onPick?.(picked.personaId);
      },
    },
  };
}
