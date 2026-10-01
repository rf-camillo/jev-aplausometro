import type { JevClient } from "@/lib/jev/client";
import { createAudienceHandler } from "@/lib/server/audience-handler";
import { jevClientFromEnv } from "@/lib/server/jev-from-env";
import { createRateLimiter, evaluationsPerMinute } from "@/lib/server/rate-limit";
import {
  createSpendingCap,
  EVALUATIONS_PER_MINUTE_CAP,
  evaluationsPerDay,
} from "@/lib/server/spending-cap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MINUTE = 60_000;
const PER_CLIENT = evaluationsPerMinute(process.env);
/** A network may ask for three clients' worth, so a household or an office is not held back. */
const NETWORK_SHARE = 3;

let client: JevClient | null = null;

const handle = createAudienceHandler({
  jev: () => (client ??= jevClientFromEnv(process.env)),
  limiter: createRateLimiter({ limit: PER_CLIENT, windowMs: MINUTE }),
  networkLimiter: createRateLimiter({ limit: PER_CLIENT * NETWORK_SHARE, windowMs: MINUTE }),
  cap: createSpendingCap({ perMinute: EVALUATIONS_PER_MINUTE_CAP, perDay: evaluationsPerDay() }),
});

export function POST(request: Request): Promise<Response> {
  return handle(request);
}
