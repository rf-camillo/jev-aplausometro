import { createLru } from "../core/lru";
import type { AudienceAnswer } from "./api";
import { canEvaluate, normalizePost } from "./live";

export interface Answered extends AudienceAnswer {
  post: string;
  fromCache: boolean;
}

/** Asks the server about a post; rejects with a message for the reader when it cannot. */
export type Ask = (post: string, signal: AbortSignal) => Promise<AudienceAnswer>;

export type Step =
  | { kind: "skipped" }
  | { kind: "remembered"; answered: Answered }
  /** Settles with the answer, or with null when a newer draft or a cancel overtook it. */
  | { kind: "asking"; answered: Promise<Answered | null> };

export interface AudienceSession {
  ask(draft: string): Step;
  /** Drops the question in flight unless it is about this draft; says whether it dropped one. */
  cancelUnlessAbout(draft: string): boolean;
  readonly busy: boolean;
  /** Drops the question in flight for good, when the page goes away. */
  close(): void;
}

const CACHE_SIZE = 50;

/**
 * The audience's memory and manners: it never asks twice about the same post, answers from
 * memory when it can, and drops a question the moment the draft moves on from it.
 */
export function createAudienceSession(ask: Ask, cacheSize = CACHE_SIZE): AudienceSession {
  const cache = createLru<string, AudienceAnswer>(cacheSize);
  let pending: { post: string; controller: AbortController } | null = null;

  const cancel = () => {
    pending?.controller.abort();
    pending = null;
  };

  const settle = async (post: string, controller: AbortController): Promise<Answered | null> => {
    try {
      const answer = await ask(post, controller.signal);
      cache.set(post, answer);
      return controller.signal.aborted ? null : { ...answer, post, fromCache: false };
    } catch (error) {
      if (controller.signal.aborted) return null;
      throw error;
    } finally {
      if (pending?.controller === controller) pending = null;
    }
  };

  return {
    ask(draft) {
      const post = normalizePost(draft);
      if (!canEvaluate(post) || pending?.post === post) return { kind: "skipped" };
      cancel();
      const remembered = cache.get(post);
      if (remembered) {
        return { kind: "remembered", answered: { ...remembered, post, fromCache: true } };
      }
      const controller = new AbortController();
      pending = { post, controller };
      return { kind: "asking", answered: settle(post, controller) };
    },
    cancelUnlessAbout(draft) {
      if (!pending || pending.post === normalizePost(draft)) return false;
      cancel();
      return true;
    },
    get busy() {
      return pending !== null;
    },
    close: cancel,
  };
}
