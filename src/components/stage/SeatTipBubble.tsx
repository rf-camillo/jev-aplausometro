"use client";

import { useLayoutEffect, useRef } from "react";

import { type SeatTip, shiftInside } from "@/lib/stage/tip";

export function SeatTipBubble({ tip }: { tip: SeatTip }) {
  const bubbleRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble) return;
    bubble.style.setProperty("--tip-shift", "0px");
    const shift = shiftInside(bubble.getBoundingClientRect(), window.innerWidth);
    bubble.style.setProperty("--tip-shift", `${String(shift)}px`);
  }, [tip]);

  return (
    <span
      ref={bubbleRef}
      className="tooltip seat-tip"
      style={{ left: tip.left, top: tip.top }}
      aria-hidden="true"
    >
      {tip.text}
    </span>
  );
}
