"use client";

import { type Ref, useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/components/motion";
import type { PersonaId } from "@/lib/audience/personas";
import type { Seat } from "@/lib/audience/seats";
import { layoutFor, ROWS, seatPositions, seatUnit } from "@/lib/stage/layout";
import {
  initialSeatStates,
  type SeatState,
  withPositions,
  withSeats,
} from "@/lib/stage/transitions";

import { drawAudience } from "./draw/draw-audience";
import { readStageColors, type StageColors } from "./draw/stage-colors";
import { SeatTipBubble } from "./SeatTipBubble";
import { useAnimationLoop } from "./useAnimationLoop";
import { useSeatPointer } from "./useSeatPointer";

/** The wide layout, which the audience starts in before its size is known. */
const ROWS_LAYOUT = seatPositions(ROWS);

interface AudienceCanvasProps {
  seats: Seat[] | null;
  label: string;
  focus: PersonaId | null;
  /** Picks the persona of someone clicked; the list below does the same by keyboard. */
  onPick: ((personaId: PersonaId) => void) | null;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The audience, drawn on a canvas; a new reaction ripples out from the center. Pointing at
 * someone names them and lights their persona; clicking them spotlights it.
 */
export function AudienceCanvas({ seats, label, focus, onPick, ref }: AudienceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [firstStates] = useState(() => withPositions(initialSeatStates(ROWS_LAYOUT), ROWS_LAYOUT));
  const statesRef = useRef<SeatState[]>(firstStates);
  const rowsRef = useRef<readonly number[]>(ROWS);
  const focusRef = useRef<PersonaId | null>(focus);
  const hoverRef = useRef<PersonaId | null>(null);
  const colorsRef = useRef<StageColors | null>(null);
  const forgetPointer = useRef<() => void>(() => undefined);

  const redraw = useAnimationLoop(canvasRef, {
    draw: (context, { width, height }, now, moving) => {
      const colors = colorsRef.current;
      if (!colors) return;
      drawAudience(context, statesRef.current, {
        width,
        height,
        unit: seatUnit(width, height, rowsRef.current),
        now,
        moving,
        colors,
        focus: focusRef.current,
        hover: hoverRef.current,
      });
    },
    resize: ({ width }) => {
      const layout = layoutFor(width);
      rowsRef.current = layout.rows;
      statesRef.current = withPositions(statesRef.current, layout.positions);
      forgetPointer.current();
    },
    restyle: (canvas) => {
      colorsRef.current = readStageColors(canvas);
    },
  });
  const pointer = useSeatPointer({ states: statesRef, rows: rowsRef, hoverRef, redraw, onPick });

  useEffect(() => {
    forgetPointer.current = pointer.clear;
  });

  useEffect(() => {
    const ripple = !prefersReducedMotion();
    statesRef.current = withSeats(statesRef.current, seats, performance.now(), ripple);
    forgetPointer.current();
    redraw();
  }, [seats, redraw]);

  useEffect(() => {
    focusRef.current = focus;
    redraw();
  }, [focus, redraw]);

  return (
    <div ref={ref} className="audience-frame">
      <canvas
        ref={canvasRef}
        className={pointer.tip ? "audience-canvas is-pointing" : "audience-canvas"}
        role="img"
        aria-label={label}
        {...pointer.handlers}
      />
      {pointer.tip && <SeatTipBubble tip={pointer.tip} />}
    </div>
  );
}
