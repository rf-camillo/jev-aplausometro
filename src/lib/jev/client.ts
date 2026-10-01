import { AppError, errorMessage } from "../core/errors";
import { readLimitedText } from "../core/read-limited";
import { withRetry } from "../core/retry";
import { type Evaluation, evaluationSchema, type Question } from "./types";

export const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone";
export const JEV_MODEL = "jev-latest";

const DEFAULT_TIMEOUT_MS = 5000;
/** Waking up after a quiet spell, Jev has taken more than ten seconds; the retry waits for it. */
const DEFAULT_RETRY_TIMEOUT_MS = 15_000;
/** One more try at most: every try is paid for, and a second one rarely changes the outcome. */
const DEFAULT_RETRIES = 1;
const DEFAULT_RETRY_DELAY_MS = 250;
const RETRYABLE_STATUS = new Set([500, 502, 503, 504, 529]);
/** Jev asking us to slow down: unavailable too, but trying again would only add to the load. */
const THROTTLED_STATUS = 429;
/** A full answer to the audience's 17 questions is a few kilobytes; anything far bigger is not one. */
const MAX_RESPONSE_BYTES = 256 * 1024;

/** The failures worth one more try, marked where they are thrown. */
const retryable = new WeakSet<Error>();

function markRetryable(error: AppError): AppError {
  retryable.add(error);
  return error;
}

export interface JevClientOptions {
  apiKey: string;
  fetch?: typeof fetch;
  endpoint?: string;
  timeoutMs?: number;
  retryTimeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

export interface EvaluateRequest {
  state: unknown;
  questions: Record<string, Question>;
  signal?: AbortSignal;
}

export interface JevClient {
  evaluate(request: EvaluateRequest): Promise<Evaluation>;
}

function statusError(status: number): AppError {
  if (status === 401 || status === 403) {
    return new AppError("JEV_AUTH", "Jev rejected the API key");
  }
  if (RETRYABLE_STATUS.has(status) || status === THROTTLED_STATUS) {
    const error = new AppError("JEV_UNAVAILABLE", `Jev is unavailable (HTTP ${String(status)})`);
    return RETRYABLE_STATUS.has(status) ? markRetryable(error) : error;
  }
  return new AppError("JEV_BAD_RESPONSE", `Jev refused the request (HTTP ${String(status)})`);
}

const isRetryable = (error: unknown): boolean => error instanceof Error && retryable.has(error);

/** The answer as JSON, or null when it is not JSON; refused when far bigger than an answer. */
async function readAnswer(response: Response): Promise<unknown> {
  const text = await readLimitedText(response.body, MAX_RESPONSE_BYTES);
  if (text === null) throw new AppError("JEV_BAD_RESPONSE", "Jev answered with an oversized body");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Calls Jev over the TypeSafe HTTP API. Jev failing on its side, network failures and a timeout
 * get one more try after a pause, with a longer wait: Jev answers in about 300 ms, so a timeout
 * is usually it waking up after a quiet spell. Being throttled, authentication and malformed requests fail at once.
 */
export function createJevClient(options: JevClientOptions): JevClient {
  const {
    apiKey,
    fetch: fetchFn = globalThis.fetch,
    endpoint = JEV_ENDPOINT,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryTimeoutMs = DEFAULT_RETRY_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    sleep,
    now = () => performance.now(),
  } = options;

  function failureOf(
    error: unknown,
    request: EvaluateRequest,
    timeout: AbortSignal,
    limitMs: number,
  ): unknown {
    if (request.signal?.aborted) return error;
    if (timeout.aborted) {
      return markRetryable(
        new AppError("TIMEOUT", `Jev did not answer within ${String(limitMs)} ms`),
      );
    }
    if (error instanceof AppError) return error;
    return markRetryable(
      new AppError("JEV_UNAVAILABLE", `Jev request failed: ${errorMessage(error)}`, {
        cause: error,
      }),
    );
  }

  async function attempt(request: EvaluateRequest, retry: boolean): Promise<Evaluation> {
    const limitMs = retry ? retryTimeoutMs : timeoutMs;
    const timeout = AbortSignal.timeout(limitMs);
    const signal = request.signal ? AbortSignal.any([request.signal, timeout]) : timeout;
    const started = now();
    let body: unknown;
    let ms: number;
    try {
      const response = await fetchFn(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: JEV_MODEL,
          state: request.state,
          questions: request.questions,
        }),
        signal,
      });
      ms = Math.round(now() - started);
      if (!response.ok) throw statusError(response.status);
      body = await readAnswer(response);
    } catch (error) {
      throw failureOf(error, request, timeout, limitMs);
    }
    const parsed = evaluationSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("JEV_BAD_RESPONSE", "Jev answered in an unexpected format");
    }
    return {
      model: parsed.data.model,
      answers: parsed.data.answers,
      inputTokens: parsed.data.usage?.input_tokens ?? null,
      latencyMs: ms,
    };
  }

  return {
    evaluate: (request) =>
      withRetry((count) => attempt(request, count > 0), {
        retries,
        delayMs: retryDelayMs,
        shouldRetry: isRetryable,
        ...(sleep ? { sleep } : {}),
      }),
  };
}
