"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react";

import { prefersReducedMotion, subscribeToReducedMotion } from "@/components/motion";
import { subscribeToTheme } from "@/components/theme/theme-mode";

export interface CanvasSize {
  width: number;
  height: number;
}

export interface AnimationCallbacks {
  draw: (context: CanvasRenderingContext2D, size: CanvasSize, now: number, moving: boolean) => void;
  resize?: (size: CanvasSize) => void;
  /** Reads what depends on the theme, once at the start and again whenever it changes. */
  restyle?: (canvas: HTMLCanvasElement) => void;
}

/**
 * Keeps a canvas sharp and animated: it follows the element's size, pixel density and theme,
 * and animates only while the page is visible, the canvas is on screen and the reader has not
 * asked for less motion. Otherwise it draws a single frame. Returns a function that draws
 * again when the content changes while the loop is paused.
 */
export function useAnimationLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  callbacks: AnimationCallbacks,
): () => void {
  const callbacksRef = useRef(callbacks);
  const redrawRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let moving = !prefersReducedMotion();
    const size: CanvasSize = { width: 0, height: 0 };
    let frame = 0;
    let pageVisible = !document.hidden;
    let onScreen = true;

    const drawAt = (now: number) => {
      callbacksRef.current.draw(context, size, now, moving);
    };
    const tick = (now: number) => {
      drawAt(now);
      frame = requestAnimationFrame(tick);
    };
    const running = () => moving && pageVisible && onScreen;
    const sync = () => {
      cancelAnimationFrame(frame);
      if (running()) frame = requestAnimationFrame(tick);
      else drawAt(performance.now());
    };
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      size.width = canvas.clientWidth;
      size.height = canvas.clientHeight;
      canvas.width = Math.round(size.width * ratio);
      canvas.height = Math.round(size.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      callbacksRef.current.resize?.(size);
    };
    const onVisibility = () => {
      pageVisible = !document.hidden;
      sync();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (!running()) drawAt(performance.now());
    });
    const redrawIfPaused = () => {
      if (!running()) drawAt(performance.now());
    };
    const unsubscribeTheme = subscribeToTheme(() => {
      callbacksRef.current.restyle?.(canvas);
      redrawIfPaused();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      sync();
    });
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    const unsubscribeMotion = subscribeToReducedMotion(() => {
      moving = !prefersReducedMotion();
      sync();
    });
    redrawRef.current = redrawIfPaused;
    callbacksRef.current.restyle?.(canvas);
    resize();
    sync();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      unsubscribeTheme();
      unsubscribeMotion();
      document.removeEventListener("visibilitychange", onVisibility);
      redrawRef.current = () => undefined;
    };
  }, [canvasRef]);

  return useCallback(() => {
    redrawRef.current();
  }, []);
}
