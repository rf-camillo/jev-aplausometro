import { describe, expect, it, vi } from "vitest";

import { answerFromWire, type ErrorBody } from "@/lib/audience/api";
import { MAX_POST_LENGTH } from "@/lib/audience/live";
import { AppError } from "@/lib/core/errors";
import type { EvaluateRequest, JevClient } from "@/lib/jev/client";
import { createAudienceHandler } from "@/lib/server/audience-handler";
import { createRateLimiter, type RateLimiter } from "@/lib/server/rate-limit";
import { MAX_BODY_BYTES } from "@/lib/server/read-request";

import { fakeEvaluation } from "../support/evaluations";

const POST = "Publiquei um projeto novo no GitHub.";

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/audience", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function setup(
  options: {
    evaluate?: (request: EvaluateRequest) => Promise<unknown>;
    jev?: JevClient | null;
    limiter?: RateLimiter;
  } = {},
) {
  const evaluate = vi.fn(options.evaluate ?? (() => Promise.resolve(fakeEvaluation())));
  const jev = options.jev === undefined ? ({ evaluate } as unknown as JevClient) : options.jev;
  const log = vi.fn();
  const handle = createAudienceHandler({
    jev: () => jev,
    limiter: options.limiter ?? { allow: () => true },
    log,
  });
  return { handle, evaluate, log };
}

async function errorOf(response: Response): Promise<ErrorBody["error"]> {
  return ((await response.json()) as ErrorBody).error;
}

describe("the audience endpoint", () => {
  it("asks Jev about the trimmed post and returns the audience", async () => {
    const { handle, evaluate } = setup();
    const response = await handle(request({ post: `  ${POST}  ` }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const body: unknown = await response.json();
    const answer = answerFromWire(body);
    expect(answer?.result.personas).toHaveLength(12);
    expect(answer?.result.applause).toBeGreaterThan(0);
    expect(answer?.latencyMs).toBe(280);
    expect(JSON.stringify(body)).not.toContain("recrutadora de tecnologia");

    const sent = evaluate.mock.calls[0]?.[0];
    expect(sent?.state).toEqual({ plataforma: "LinkedIn", post: POST });
    expect(Object.keys(sent?.questions ?? {})).toHaveLength(17);
    expect(sent?.signal).toBeInstanceOf(AbortSignal);
  });

  it("sends Jev the plain letters of a post written in Unicode bold", async () => {
    const { handle, evaluate } = setup();
    await handle(request({ post: `𝗡𝗼𝘃𝗶𝗱𝗮𝗱𝗲: ${POST}` }));
    expect(evaluate.mock.calls[0]?.[0].state).toEqual({
      plataforma: "LinkedIn",
      post: `Novidade: ${POST}`,
    });
  });

  it.each([
    ["an empty post", { post: "   " }, "Escreva o post antes de chamar a plateia."],
    [
      "a post that is too long",
      { post: "a".repeat(MAX_POST_LENGTH + 1) },
      `O post pode ter até ${String(MAX_POST_LENGTH)} caracteres.`,
    ],
    ["a post that is not text", { post: 42 }, "Envie o post como texto."],
    ["a body that is not an object", [POST], "Envie o post como texto."],
    ["a body that is not JSON", "post=oi", "Não foi possível ler o pedido."],
  ])("rejects %s without calling Jev", async (_label, body, message) => {
    const { handle, evaluate } = setup();
    const response = await handle(request(body));
    expect(response.status).toBe(400);
    expect(await errorOf(response)).toEqual({ code: "INVALID_INPUT", message });
    expect(evaluate).not.toHaveBeenCalled();
  });

  it("rejects a body that is too large, declared or not", async () => {
    const { handle } = setup();
    const declared = await handle(
      request({ post: POST }, { "Content-Length": String(MAX_BODY_BYTES + 1) }),
    );
    expect(await errorOf(declared)).toMatchObject({ message: "O post é grande demais." });

    const actual = await handle(request({ post: "😀".repeat(MAX_BODY_BYTES / 4 + 1) }));
    expect(actual.status).toBe(400);
    expect(await errorOf(actual)).toMatchObject({ message: "O post é grande demais." });
  });

  it("limits each client by its forwarded address", async () => {
    const { handle } = setup({ limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    const first = { "X-Forwarded-For": "203.0.113.7, 10.0.0.1" };
    expect((await handle(request({ post: POST }, first))).status).toBe(200);

    const limited = await handle(request({ post: POST }, first));
    expect(limited.status).toBe(429);
    expect(await errorOf(limited)).toMatchObject({ code: "RATE_LIMITED" });

    expect((await handle(request({ post: POST }, { "X-Real-IP": "198.51.100.2" }))).status).toBe(
      200,
    );
  });

  it.each([
    ["JEV_UNAVAILABLE", 503, "A plateia está lotada agora."],
    ["TIMEOUT", 504, "A plateia demorou para reagir."],
    ["JEV_BAD_RESPONSE", 502, "A plateia reagiu de um jeito inesperado."],
    ["JEV_AUTH", 500, "O Aplausômetro está sem acesso ao Jev agora."],
  ] as const)(
    "turns %s into HTTP %i with a message in Portuguese",
    async (code, status, message) => {
      const { handle, log } = setup({
        evaluate: () => Promise.reject(new AppError(code, "internal detail")),
      });
      const response = await handle(request({ post: POST }));
      expect(response.status).toBe(status);
      expect(await errorOf(response)).toEqual({ code, message });
      expect(log).toHaveBeenCalledWith(`audience: ${code}`);
    },
  );

  it("reports a missing API key as a server problem", async () => {
    const { handle } = setup({ jev: null });
    const response = await handle(request({ post: POST }));
    expect(response.status).toBe(500);
    expect(await errorOf(response)).toMatchObject({ code: "JEV_AUTH" });
  });

  it("hides unexpected errors and never logs the post", async () => {
    const { handle, log } = setup({ evaluate: () => Promise.reject(new TypeError(POST)) });
    const response = await handle(request({ post: POST }));
    expect(response.status).toBe(500);
    expect(await errorOf(response)).toEqual({
      code: "INTERNAL",
      message: "Algo deu errado.",
    });
    expect(log).toHaveBeenCalledWith("audience: unexpected TypeError");
    expect(JSON.stringify(log.mock.calls)).not.toContain(POST);
  });
});

describe("the default log", () => {
  it("writes only the error code to the server console", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handle = createAudienceHandler({ jev: () => null, limiter: { allow: () => true } });
    await handle(request({ post: POST }));
    expect(consoleError).toHaveBeenCalledWith("audience: JEV_AUTH");
    consoleError.mockRestore();
  });

  it.each([
    ["another site, as the browser says", { "Sec-Fetch-Site": "cross-site" }],
    ["a sibling subdomain", { "Sec-Fetch-Site": "same-site" }],
    ["another origin", { Origin: "https://evil.example" }],
  ])("turns away a request from %s, without calling Jev", async (_label, headers) => {
    const { handle, evaluate } = setup();
    const response = await handle(request({ post: POST }, headers));
    expect(response.status).toBe(403);
    expect((await errorOf(response)).code).toBe("FOREIGN_ORIGIN");
    expect(evaluate).not.toHaveBeenCalled();
  });

  it("accepts the page's own requests, and clients that are not browsers", async () => {
    const { handle } = setup();
    const own = { "Sec-Fetch-Site": "same-origin", Origin: "http://localhost" };
    expect((await handle(request({ post: POST }, own))).status).toBe(200);
    expect((await handle(request({ post: POST }))).status).toBe(200);
  });

  it("turns away a body not declared as JSON, as a plain form would send it", async () => {
    const { handle, evaluate } = setup();
    const response = await handle(
      request('{"post":"oi","x":"="}', { "Content-Type": "text/plain" }),
    );
    expect(response.status).toBe(415);
    expect((await errorOf(response)).code).toBe("NOT_JSON");
    expect(evaluate).not.toHaveBeenCalled();
  });

  it("stops reading a body sent without its length once it passes the limit", async () => {
    const { handle, evaluate } = setup();
    let pulled = 0;
    const endless = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        controller.enqueue(new Uint8Array(4096).fill(32));
      },
    });
    const response = await handle(
      new Request("http://localhost/api/audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: endless,
        duplex: "half",
      } as RequestInit),
    );
    expect(response.status).toBe(400);
    expect((await errorOf(response)).message).toBe("O post é grande demais.");
    expect(pulled).toBeLessThan(10);
    expect(evaluate).not.toHaveBeenCalled();
  });

  it("turns a client away when its wider network is past its own limit", async () => {
    const { handle, evaluate } = setup();
    const limited = createAudienceHandler({
      jev: () => ({ evaluate }) as unknown as JevClient,
      limiter: { allow: () => true },
      networkLimiter: { allow: () => false },
    });
    expect((await limited(request({ post: POST }))).status).toBe(429);
    expect((await handle(request({ post: POST }))).status).toBe(200);
  });

  it("stops asking Jev once the spending cap is reached, and says the audience is full", async () => {
    const evaluate = vi.fn(() => Promise.resolve(fakeEvaluation()));
    const log = vi.fn();
    const handle = createAudienceHandler({
      jev: () => ({ evaluate }),
      limiter: { allow: () => true },
      cap: { spend: () => false },
      log,
    });
    const response = await handle(request({ post: POST }));
    expect(response.status).toBe(503);
    expect(await errorOf(response)).toEqual({
      code: "OVER_BUDGET",
      message: "A plateia está lotada agora.",
    });
    expect(evaluate).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("audience: OVER_BUDGET");
  });
});
