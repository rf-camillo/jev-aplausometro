import { describe, expect, it, vi } from "vitest";

import type { AudienceAnswer } from "@/lib/audience/api";
import { interpretEvaluation } from "@/lib/audience/result";
import { type Answered, type Ask, createAudienceSession, type Step } from "@/lib/audience/session";

import { fakeEvaluation } from "../support/evaluations";

const POST = "Um post longo o bastante para a plateia.";
const OTHER = "Outro post, também longo o bastante.";
const ANSWER: AudienceAnswer = {
  result: interpretEvaluation(fakeEvaluation()),
  latencyMs: 280,
  model: "jev-1.13.0",
};

/** An `ask` whose answers are handed out by the test, one question at a time. */
function controlledAsk() {
  const questions: { post: string; signal: AbortSignal; answer: () => void; fail: () => void }[] =
    [];
  const ask = vi.fn<Ask>(
    (post, signal) =>
      new Promise((resolve, reject) => {
        questions.push({
          post,
          signal,
          answer: () => {
            resolve(ANSWER);
          },
          fail: () => {
            reject(new Error("A plateia está lotada agora."));
          },
        });
      }),
  );
  return { ask, questions };
}

/** The answer of a step that asked, failing the test when the step did not ask. */
function asked(step: Step): Promise<Answered | null> {
  if (step.kind !== "asking") throw new Error(`expected a question, got ${step.kind}`);
  return step.answered;
}

describe("createAudienceSession", () => {
  it("asks about the normalized post and answers with it", async () => {
    const { ask, questions } = controlledAsk();
    const session = createAudienceSession(ask);
    const step = session.ask(`  ${POST}  `);
    expect(step.kind).toBe("asking");
    expect(session.busy).toBe(true);
    questions[0]?.answer();
    await expect(asked(step)).resolves.toMatchObject({
      post: POST,
      fromCache: false,
      latencyMs: 280,
    });
    expect(session.busy).toBe(false);
    expect(ask).toHaveBeenCalledWith(POST, expect.any(AbortSignal));
  });

  it("skips what cannot be evaluated and the question already in flight", () => {
    const { ask } = controlledAsk();
    const session = createAudienceSession(ask);
    expect(session.ask("   ").kind).toBe("skipped");
    expect(session.ask(POST).kind).toBe("asking");
    expect(session.ask(`${POST}  `).kind).toBe("skipped");
    expect(ask).toHaveBeenCalledTimes(1);
  });

  it("answers a post it has seen from memory, without asking again", async () => {
    const { ask, questions } = controlledAsk();
    const session = createAudienceSession(ask);
    const first = session.ask(POST);
    questions[0]?.answer();
    await asked(first);
    expect(session.ask(POST)).toMatchObject({ kind: "remembered", answered: { fromCache: true } });
    expect(ask).toHaveBeenCalledTimes(1);
  });

  it("drops a question a newer draft overtakes, settling it with null", async () => {
    const { ask, questions } = controlledAsk();
    const session = createAudienceSession(ask);
    const old = session.ask(POST);
    session.ask(OTHER);
    expect(questions[0]?.signal.aborted).toBe(true);
    questions[0]?.answer();
    await expect(asked(old)).resolves.toBeNull();
    expect(session.busy).toBe(true);
  });

  it("drops the question in flight when the draft moves away from it, not when it stays", () => {
    const { ask, questions } = controlledAsk();
    const session = createAudienceSession(ask);
    session.ask(POST);
    expect(session.cancelUnlessAbout(`${POST} `)).toBe(false);
    expect(session.cancelUnlessAbout(OTHER)).toBe(true);
    expect(questions[0]?.signal.aborted).toBe(true);
    expect(session.busy).toBe(false);
    expect(session.cancelUnlessAbout(OTHER)).toBe(false);
  });

  it("passes a failure on to the reader, unless the question was dropped", async () => {
    const { ask, questions } = controlledAsk();
    const session = createAudienceSession(ask);
    const failed = session.ask(POST);
    questions[0]?.fail();
    await expect(asked(failed)).rejects.toThrow("lotada");

    const dropped = session.ask(OTHER);
    session.close();
    questions[1]?.fail();
    await expect(asked(dropped)).resolves.toBeNull();
  });
});
