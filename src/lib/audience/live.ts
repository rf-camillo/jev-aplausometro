/** How long the writer must pause before the audience reacts on its own. */
export const LIVE_DELAY_MS = 700;

/**
 * The least time between two questions the audience asks on its own. Someone writing from
 * scratch pauses for 700 ms many times a minute; this keeps them well inside the server's limit.
 */
export const LIVE_SPACING_MS = 4000;

/** How long to wait before asking about a draft on its own, given when the last question went out. */
export function liveDelay(now: number, lastAskedAt: number | null): number {
  if (lastAskedAt === null) return LIVE_DELAY_MS;
  return Math.max(LIVE_DELAY_MS, lastAskedAt + LIVE_SPACING_MS - now);
}

/** The longest post the audience reads, a little over a LinkedIn post at its fullest. */
export const MAX_POST_LENGTH = 3000;

/** Shorter drafts wait for Ctrl or ⌘ + Enter: a few words say too little to judge. */
export const LIVE_MIN_LENGTH = 20;

/**
 * Two drafts that differ only in spacing are the same post to the audience. The "bold" and
 * "italic" letters LinkedIn posts borrow from Unicode's math alphabets read as plain letters
 * (NFKC), so Jev judges the words and not the strange symbols they are drawn with.
 */
export function normalizePost(text: string): string {
  return text
    .normalize("NFKC")
    .trim()
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

export function canEvaluate(text: string): boolean {
  const post = normalizePost(text);
  return post.length > 0 && post.length <= MAX_POST_LENGTH;
}

export function shouldEvaluateLive(text: string): boolean {
  return canEvaluate(text) && normalizePost(text).length >= LIVE_MIN_LENGTH;
}
