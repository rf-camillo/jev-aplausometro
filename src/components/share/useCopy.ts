"use client";

import { useEffect, useRef, useState } from "react";

export type CopyState = "idle" | "copied" | "failed";

const SHOWN_MS = 2500;

/**
 * Copies text to the clipboard and says how it went for a moment. A new copy restarts the
 * moment instead of stacking timers, and a clipboard the browser refuses is said, not hidden.
 */
export function useCopy(text: string): { state: CopyState; copy: () => void } {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = (next: CopyState) => {
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setState("idle");
    }, SHOWN_MS);
  };

  const copy = () => {
    const written =
      typeof navigator.clipboard === "undefined"
        ? Promise.reject(new Error("No clipboard here"))
        : navigator.clipboard.writeText(text);
    written.then(
      () => {
        show("copied");
      },
      () => {
        show("failed");
      },
    );
  };

  return { state, copy };
}
