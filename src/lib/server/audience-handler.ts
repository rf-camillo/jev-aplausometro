import { answerToWire } from "../audience/api";
import { buildQuestions, buildState } from "../audience/questions";
import { interpretEvaluation } from "../audience/result";
import { AppError } from "../core/errors";
import type { JevClient } from "../jev/client";
import { clientKey, networkKey } from "./client-key";
import {
  errorResponse,
  foreignOrigin,
  logLine,
  NO_STORE,
  notJson,
  rateLimited,
} from "./error-responses";
import type { RateLimiter } from "./rate-limit";
import { readPost } from "./read-request";
import { isJson, isSameOrigin } from "./request-origin";
import type { SpendingCap } from "./spending-cap";

export interface AudienceHandlerOptions {
  jev: () => JevClient | null;
  /** Per client: one IPv4 address or one IPv6 /64. */
  limiter: RateLimiter;
  /** Looser, per wider network: one IPv6 /48, so a free tunnel is not 65,536 clients. */
  networkLimiter?: RateLimiter;
  cap?: SpendingCap;
  log?: (message: string) => void;
}

/**
 * The audience endpoint: turns away other sites and too many requests, validates the post,
 * asks Jev and returns the interpreted audience. The post itself is never logged or stored;
 * only error codes are.
 */
export function createAudienceHandler(
  options: AudienceHandlerOptions,
): (request: Request) => Promise<Response> {
  const {
    jev,
    limiter,
    networkLimiter = { allow: () => true },
    cap = { spend: () => true },
    log = (message) => console.error(message),
  } = options;

  return async function handle(request) {
    if (!isSameOrigin(request)) return foreignOrigin();
    if (!isJson(request)) return notJson();
    if (!limiter.allow(clientKey(request)) || !networkLimiter.allow(networkKey(request))) {
      return rateLimited();
    }
    try {
      const post = await readPost(request);
      const client = jev();
      if (client === null) throw new AppError("JEV_AUTH", "TYPESAFE_API_KEY is not set");
      if (!cap.spend()) throw new AppError("OVER_BUDGET", "The spending cap is reached");
      const evaluation = await client.evaluate({
        state: buildState(post),
        questions: buildQuestions(),
        signal: request.signal,
      });
      const answer = {
        result: interpretEvaluation(evaluation),
        latencyMs: evaluation.latencyMs,
        model: evaluation.model,
      };
      return Response.json(answerToWire(answer), { headers: NO_STORE });
    } catch (error) {
      log(logLine(error));
      return errorResponse(error);
    }
  };
}
