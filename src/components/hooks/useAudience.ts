"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { FAILURE_MESSAGE } from "@/lib/audience/api";
import { LIVE_SPACING_MS, liveDelay, shouldEvaluateLive } from "@/lib/audience/live";
import { type Answered, createAudienceSession } from "@/lib/audience/session";

import { fetchAudience, TooManyRequestsError } from "./fetch-audience";

/** After the server asks to slow down, how long the audience waits to ask on its own again. */
const SLOW_DOWN_MS = 15_000;

interface AudienceState {
  draft: string;
  setDraft: (draft: string) => void;
  answered: Answered | null;
  loading: boolean;
  error: string | null;
  evaluateNow: () => void;
}

/**
 * Keeps the audience in step with the draft: it reacts after a pause in typing, spaced so a
 * writer stays inside the server's limit, and the session behind it drops answers the draft
 * has moved on from and never asks twice. Asked on its own and told to slow down, it keeps the
 * last audience and tries again later, quietly; asked by the writer, it says why it could not.
 */
export function useAudience(): AudienceState {
  const [session] = useState(() => createAudienceSession(fetchAudience));
  const [draft, setDraftState] = useState("");
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pause = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastAskedAt = useRef<number | null>(null);
  const [slowedDown, setSlowedDown] = useState(0);

  const evaluate = useCallback(
    async (text: string, live: boolean) => {
      const step = session.ask(text);
      if (step.kind === "skipped") return;
      setError(null);
      if (step.kind === "remembered") {
        setLoading(false);
        setAnswered((shown) => (shown?.post === step.answered.post ? shown : step.answered));
        return;
      }
      setLoading(true);
      lastAskedAt.current = Date.now();
      try {
        const next = await step.answered;
        if (next) setAnswered(next);
      } catch (caught) {
        if (live && caught instanceof TooManyRequestsError) {
          lastAskedAt.current = Date.now() + SLOW_DOWN_MS - LIVE_SPACING_MS;
          setSlowedDown((count) => count + 1);
          return;
        }
        setError(caught instanceof Error ? caught.message : FAILURE_MESSAGE);
      } finally {
        if (!session.busy) setLoading(false);
      }
    },
    [session],
  );

  const setDraft = useCallback(
    (next: string) => {
      setDraftState(next);
      setError(null);
      if (session.cancelUnlessAbout(next)) setLoading(false);
    },
    [session],
  );

  useEffect(() => {
    if (!shouldEvaluateLive(draft)) return;
    pause.current = setTimeout(
      () => void evaluate(draft, true),
      liveDelay(Date.now(), lastAskedAt.current),
    );
    return () => {
      clearTimeout(pause.current);
    };
  }, [draft, evaluate, slowedDown]);

  useEffect(() => () => session.close(), [session]);

  /** Asks right away, and the pause's own question, now redundant, is dropped. */
  const evaluateNow = useCallback(() => {
    clearTimeout(pause.current);
    void evaluate(draft, false);
  }, [draft, evaluate]);

  return { draft, setDraft, answered, loading, error, evaluateNow };
}
