export interface RateLimiter {
  allow(key: string): boolean;
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
  /** Stops tracking clients once there are this many, so memory stays bounded. */
  maxKeys?: number;
}

/**
 * A sliding-window limiter kept in the memory of one server instance. It is a first line of
 * defense against a single client hammering the API; the platform firewall is the second.
 */
export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const { limit, windowMs, now = Date.now, maxKeys = 10_000 } = options;
  const hits = new Map<string, number[]>();

  return {
    allow(key) {
      const time = now();
      const recent = (hits.get(key) ?? []).filter((at) => time - at < windowMs);
      const allowed = recent.length < limit;
      if (allowed) recent.push(time);
      // Newest last, blocked clients included: the first forgotten is the one quiet the longest.
      hits.delete(key);
      hits.set(key, recent);
      if (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest !== undefined) hits.delete(oldest);
      }
      return allowed;
    },
  };
}

/** The page asks on its own at most every four seconds, so a writer stays under twenty. */
export const EVALUATIONS_PER_MINUTE = 20;

/**
 * How many evaluations a client may ask for a minute: `AUDIENCE_RATE_LIMIT` when it is a
 * positive whole number (the end-to-end tests raise it, all coming from one address), twenty
 * otherwise.
 */
export function evaluationsPerMinute(env: Record<string, string | undefined>): number {
  const value = Number(env.AUDIENCE_RATE_LIMIT);
  return Number.isInteger(value) && value > 0 ? value : EVALUATIONS_PER_MINUTE;
}
