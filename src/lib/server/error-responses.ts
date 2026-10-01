import { type ErrorBody, type ErrorCode, FAILURE_MESSAGE } from "../audience/api";
import { AppError, type AppErrorCode } from "../core/errors";
import { UNREADABLE } from "./read-request";

export const NO_STORE = { "Cache-Control": "no-store" };

/** What the writer sees for each failure; the internal detail never leaves the server. */
const FAILURES: Record<AppErrorCode, { status: number; message: string }> = {
  INVALID_INPUT: { status: 400, message: UNREADABLE },
  JEV_AUTH: {
    status: 500,
    message: "O Aplausômetro está sem acesso ao Jev agora.",
  },
  JEV_UNAVAILABLE: {
    status: 503,
    message: "A plateia está lotada agora.",
  },
  TIMEOUT: { status: 504, message: "A plateia demorou para reagir." },
  OVER_BUDGET: { status: 503, message: "A plateia está lotada agora." },
  JEV_BAD_RESPONSE: {
    status: 502,
    message: "A plateia reagiu de um jeito inesperado.",
  },
};

function failure(status: number, code: ErrorCode, message: string): Response {
  const body: ErrorBody = { error: { code, message } };
  return Response.json(body, { status, headers: NO_STORE });
}

/** A request made from another site, through its visitors' browsers. */
export function foreignOrigin(): Response {
  return failure(403, "FOREIGN_ORIGIN", "Este pedido só pode vir do próprio Aplausômetro.");
}

export function notJson(): Response {
  return failure(415, "NOT_JSON", "Envie o post como JSON.");
}

export function rateLimited(): Response {
  return failure(429, "RATE_LIMITED", "Muitas avaliações seguidas. Espere um minuto.");
}

/** Only an invalid request shows its own message, written for the reader; others are generic. */
export function errorResponse(error: unknown): Response {
  if (!(error instanceof AppError)) {
    return failure(500, "INTERNAL", FAILURE_MESSAGE);
  }
  const known = FAILURES[error.code];
  const message = error.code === "INVALID_INPUT" ? error.message : known.message;
  return failure(known.status, error.code, message);
}

/** What the server log may say about a failure: the code or the error class, never content. */
export function logLine(error: unknown): string {
  if (error instanceof AppError) return `audience: ${error.code}`;
  return `audience: unexpected ${error instanceof Error ? error.name : "error"}`;
}
