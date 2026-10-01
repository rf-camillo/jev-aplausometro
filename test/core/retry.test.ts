import { describe, expect, it, vi } from "vitest";

import { sleep, withRetry } from "@/lib/core/retry";

const retryable = (error: unknown) => error instanceof Error && error.message === "busy";

describe("withRetry", () => {
  it("retries accepted failures with exponential backoff until the task succeeds", async () => {
    const wait = vi.fn(() => Promise.resolve());
    const task = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("busy"))
      .mockRejectedValueOnce(new Error("busy"))
      .mockResolvedValue("ok");
    await expect(
      withRetry(task, { retries: 3, delayMs: 100, shouldRetry: retryable, sleep: wait }),
    ).resolves.toBe("ok");
    expect(wait.mock.calls).toEqual([[100], [200]]);
  });

  it("gives up after the last retry and on failures it does not accept", async () => {
    const busy = vi.fn(() => Promise.reject(new Error("busy")));
    const wait = () => Promise.resolve();
    await expect(
      withRetry(busy, { retries: 1, delayMs: 1, shouldRetry: retryable, sleep: wait }),
    ).rejects.toThrow("busy");
    expect(busy).toHaveBeenCalledTimes(2);

    const broken = vi.fn(() => Promise.reject(new Error("broken")));
    await expect(
      withRetry(broken, { retries: 5, delayMs: 1, shouldRetry: retryable, sleep: wait }),
    ).rejects.toThrow("broken");
    expect(broken).toHaveBeenCalledTimes(1);
  });

  it("waits with a real timer by default", async () => {
    const started = Date.now();
    await sleep(15);
    expect(Date.now() - started).toBeGreaterThanOrEqual(10);
  });
});
