"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/components/motion";
import type { PersonaId } from "@/lib/audience/personas";

/**
 * Which persona the audience lights up, and the ways to change it. Everything that can pick a
 * persona (the list, the fan and critic, the audience itself) shares one of these.
 */
export interface Spotlight {
  /** The persona lit up: the one previewed wins over the one pinned. */
  focus: PersonaId | null;
  pinned: PersonaId | null;
  onPreview: (id: PersonaId | null) => void;
  onPin: (id: PersonaId) => void;
  onShowAll: () => void;
}

function reveal(element: HTMLElement | null): void {
  if (!element) return;
  const { top, bottom } = element.getBoundingClientRect();
  if (top >= 0 && bottom <= window.innerHeight) return;
  element.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
}

/**
 * The spotlight's state; clicking the pinned persona again, "Mostrar todos" or Esc releases it.
 * The ref goes on the audience, which is brought into view when a persona is pinned from
 * further down the page.
 */
export function useSpotlight(): {
  spotlight: Spotlight;
  audienceRef: RefObject<HTMLDivElement | null>;
} {
  const [pinned, setPinned] = useState<PersonaId | null>(null);
  const [previewed, setPreviewed] = useState<PersonaId | null>(null);
  const audienceRef = useRef<HTMLDivElement>(null);

  const onPin = useCallback(
    (id: PersonaId) => {
      if (pinned === id) {
        setPinned(null);
        setPreviewed(null);
        return;
      }
      setPinned(id);
      reveal(audienceRef.current);
    },
    [pinned],
  );
  const onShowAll = useCallback(() => {
    setPinned(null);
    setPreviewed(null);
  }, []);

  useEffect(() => {
    if (pinned === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onShowAll();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [pinned, onShowAll]);

  return {
    spotlight: { focus: previewed ?? pinned, pinned, onPreview: setPreviewed, onPin, onShowAll },
    audienceRef,
  };
}
