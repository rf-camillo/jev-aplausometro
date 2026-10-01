import { describe, expect, it, vi } from "vitest";

import { createJevClient, JEV_ENDPOINT, JEV_MODEL } from "@/lib/jev/client";

const QUESTIONS = { ai: { type: "noul", instructions: "Parece IA?" } } as const;

const OK_BODY = {
  model: "jev-1.13.0",
  answers: { ai: { type: "noul", noul: 0.4 } },
  usage: { input_tokens: 120, output_tokens: 0 },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function client(responses: (Response | Error)[], overrides = {}) {
  const fetchFn = vi.fn<typeof fetch>(() => {
    const next = responses.shift();
    if (next === undefined) throw new Error("no more responses");
    return next instanceof Error ? Promise.reject(next) : Promise.resolve(next);
  });
  const sleep = vi.fn(() => Promise.resolve());
  let clock = 0;
  const jev = createJevClient({
    apiKey: "test-key",
    fetch: fetchFn,
    sleep,
    now: () => (clock += 100),
    ...overrides,
  });
  return { jev, fetchFn, sleep };
}

describe("createJevClient", () => {
  it("posts the state and questions and parses the answers", async () => {
    const { jev, fetchFn } = client([json(OK_BODY)]);
    const evaluation = await jev.evaluate({ state: { post: "oi" }, questions: QUESTIONS });

    expect(evaluation).toEqual({
      model: "jev-1.13.0",
      answers: { ai: { type: "noul", noul: 0.4 } },
      inputTokens: 120,
      latencyMs: 100,
    });
    const [url, init] = fetchFn.mock.calls[0] ?? [];
    expect(url).toBe(JEV_ENDPOINT);
    expect(init?.headers).toEqual({
      Authorization: "Bearer test-key",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(init?.body as string)).toEqual({
      model: JEV_MODEL,
      state: { post: "oi" },
      questions: QUESTIONS,
    });
  });

  it.each([
    ["an overload", json({ error: "overloaded" }, 529)],
    ["a network failure", new TypeError("fetch failed")],
  ])("tries once more after %s", async (_label, failure) => {
    const { jev, fetchFn, sleep } = client([failure, json(OK_BODY)]);
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).resolves.toMatchObject({
      model: "jev-1.13.0",
    });
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(sleep.mock.calls).toEqual([[250]]);
  });

  it("gives up after one more try", async () => {
    const { jev, fetchFn } = client([json({}, 503), json({}, 503)]);
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).rejects.toMatchObject({
      code: "JEV_UNAVAILABLE",
      message: "Jev is unavailable (HTTP 503)",
    });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("does not try again when Jev asks to slow down, which would only add to the load", async () => {
    const { jev, fetchFn } = client([json({}, 429)]);
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).rejects.toMatchObject({
      code: "JEV_UNAVAILABLE",
      message: "Jev is unavailable (HTTP 429)",
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("tells a timeout apart even when it comes while the answer is being read", async () => {
    const fetchFn = vi.fn<typeof fetch>((_url, init) => {
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          init?.signal?.addEventListener("abort", () => {
            controller.error(new DOMException("The operation timed out.", "TimeoutError"));
          });
        },
      });
      return Promise.resolve(new Response(body, { status: 200 }));
    });
    const jev = createJevClient({ apiKey: "k", fetch: fetchFn, timeoutMs: 20, retries: 0 });
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).rejects.toMatchObject({
      code: "TIMEOUT",
    });
  });

  it("refuses an answer far bigger than an answer can be", async () => {
    const { jev } = client([new Response("x".repeat(300 * 1024), { status: 200 })]);
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).rejects.toMatchObject({
      code: "JEV_BAD_RESPONSE",
      message: "Jev answered with an oversized body",
    });
  });

  it.each([
    [401, "JEV_AUTH"],
    [403, "JEV_AUTH"],
    [422, "JEV_BAD_RESPONSE"],
  ] as const)("does not retry HTTP %i", async (status, code) => {
    const { jev, fetchFn } = client([json({}, status)]);
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).rejects.toMatchObject({
      code,
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["an unexpected shape", json({ answers: "nope" })],
    ["a body that is not JSON", new Response("<html>", { status: 200 })],
  ])("rejects %s", async (_label, response) => {
    const { jev } = client([response]);
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).rejects.toMatchObject({
      code: "JEV_BAD_RESPONSE",
    });
  });

  it("reports a timeout when Jev takes too long", async () => {
    const hanging: typeof fetch = (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("aborted", "AbortError"));
        });
      });
    const jev = createJevClient({
      apiKey: "k",
      fetch: hanging,
      timeoutMs: 10,
      retries: 0,
    });
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).rejects.toMatchObject({
      code: "TIMEOUT",
    });
  });

  it("tries once more after a timeout, as Jev waking up is slow only the first time", async () => {
    let calls = 0;
    const slowThenFast: typeof fetch = (_input, init) => {
      calls += 1;
      if (calls > 1) return Promise.resolve(json(OK_BODY));
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("aborted", "AbortError"));
        });
      });
    };
    const jev = createJevClient({
      apiKey: "k",
      fetch: slowThenFast,
      timeoutMs: 10,
      retryTimeoutMs: 1000,
      sleep: () => Promise.resolve(),
    });
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).resolves.toMatchObject({
      model: "jev-1.13.0",
    });
    expect(calls).toBe(2);
  });

  it("waits longer on the retry than on the first try", async () => {
    const started: number[] = [];
    const hanging: typeof fetch = (_input, init) => {
      started.push(performance.now());
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("aborted", "AbortError"));
        });
      });
    };
    const jev = createJevClient({
      apiKey: "k",
      fetch: hanging,
      timeoutMs: 10,
      retryTimeoutMs: 60,
      sleep: () => Promise.resolve(),
    });
    const begun = performance.now();
    await expect(jev.evaluate({ state: "x", questions: QUESTIONS })).rejects.toMatchObject({
      code: "TIMEOUT",
      message: "Jev did not answer within 60 ms",
    });
    expect(started).toHaveLength(2);
    expect(performance.now() - begun).toBeGreaterThanOrEqual(60);
  });

  it("stops when the caller aborts, without retrying", async () => {
    const controller = new AbortController();
    const hanging = vi.fn<typeof fetch>(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
    );
    const jev = createJevClient({ apiKey: "k", fetch: hanging });
    const pending = jev.evaluate({ state: "x", questions: QUESTIONS, signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(hanging).toHaveBeenCalledTimes(1);
  });

  it("waits with real timers and measures with the real clock by default", async () => {
    const responses = [json({}, 529), json(OK_BODY)];
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(responses.shift() ?? json({}, 500)));
    const jev = createJevClient({ apiKey: "k", fetch: fetchFn, retryDelayMs: 1 });
    const evaluation = await jev.evaluate({ state: "x", questions: QUESTIONS });
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(evaluation.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("keeps a missing usage as unknown tokens", async () => {
    const { jev } = client([json({ model: "jev", answers: {} })]);
    await expect(jev.evaluate({ state: "x", questions: {} })).resolves.toMatchObject({
      inputTokens: null,
    });
  });
});
