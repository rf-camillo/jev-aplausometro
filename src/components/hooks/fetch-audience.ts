import {
  answerFromWire,
  AUDIENCE_ENDPOINT,
  type AudienceAnswer,
  type AudienceRequest,
  errorMessageOf,
  FAILURE_MESSAGE,
  OFFLINE_MESSAGE,
} from "@/lib/audience/api";

/** The server, or the firewall in front of it, asking to slow down. */
export class TooManyRequestsError extends Error {}

/** Asks the server about a post; rejects with an Error whose message is for the reader. */
export async function fetchAudience(post: string, signal: AbortSignal): Promise<AudienceAnswer> {
  const request: AudienceRequest = { post };
  let response: Response;
  try {
    response = await fetch(AUDIENCE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(OFFLINE_MESSAGE, { cause: error });
  }
  const body: unknown = await response.json().catch(() => null);
  const answer = response.ok ? answerFromWire(body) : null;
  if (answer) return answer;
  const message = errorMessageOf(body) ?? FAILURE_MESSAGE;
  throw response.status === 429 ? new TooManyRequestsError(message) : new Error(message);
}
