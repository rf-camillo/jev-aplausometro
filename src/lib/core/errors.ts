export type AppErrorCode =
  "INVALID_INPUT" | "JEV_AUTH" | "JEV_UNAVAILABLE" | "JEV_BAD_RESPONSE" | "TIMEOUT" | "OVER_BUDGET";

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AppError";
    this.code = code;
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
