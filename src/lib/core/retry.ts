export interface RetryOptions {
  /** How many times to try again after the first failure. */
  retries: number;
  /** The wait before the first retry; each later retry waits twice as long. */
  delayMs: number;
  shouldRetry: (error: unknown) => boolean;
  sleep?: (ms: number) => Promise<void>;
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Runs `task`, telling it which attempt this is: 0 for the first, 1 for the first retry. */
export async function withRetry<T>(
  task: (attempt: number) => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const { retries, delayMs, shouldRetry, sleep: wait = sleep } = options;
  for (let attempt = 0; ; attempt++) {
    try {
      return await task(attempt);
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) throw error;
      await wait(delayMs * 2 ** attempt);
    }
  }
}
