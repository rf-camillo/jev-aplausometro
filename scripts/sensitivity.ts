import { writeFile } from "node:fs/promises";

import { format } from "prettier";

import { buildQuestions, buildState } from "../src/lib/audience/questions";
import { type AudienceResult, interpretEvaluation } from "../src/lib/audience/result";
import { jevClientFromEnv } from "../src/lib/server/jev-from-env";
import { CHECKS } from "./sensitivity/checks";
import { drift, measure } from "./sensitivity/measure";
import { type Outcome, renderReport } from "./sensitivity/report";

/**
 * Does the audience move the way a reader would expect when one thing about a post changes?
 * Runs every check against the real Jev and rewrites docs/sensitivity.md with the outcome.
 */
function usage(): never {
  console.error("Uso: TYPESAFE_API_KEY=... npm run sensitivity");
  process.exit(1);
}
const jev = jevClientFromEnv(process.env) ?? usage();
const questions = buildQuestions();

async function evaluate(post: string): Promise<{ result: AudienceResult; latencyMs: number }> {
  const evaluation = await jev.evaluate({ state: buildState(post), questions });
  return { result: interpretEvaluation(evaluation), latencyMs: evaluation.latencyMs };
}

const outcomes: Outcome[] = [];
for (const check of CHECKS) {
  const first = await evaluate(check.a);
  const second = await evaluate(check.b);
  const a = measure(first.result, first.latencyMs);
  const b = measure(second.result, second.latencyMs);
  const passed = check.expect(a, b);
  outcomes.push({ check, a, b, drift: drift(first.result, second.result), passed });
  console.log(`${passed ? "✅" : "❌"} ${check.name}: ${check.expectation}`);
}

const latencies = outcomes.flatMap(({ a, b }) => [a.latencyMs, b.latencyMs]).sort((x, y) => x - y);
const medianMs = latencies[Math.floor(latencies.length / 2)] ?? 0;
await writeFile(
  "docs/sensitivity.md",
  await format(renderReport(outcomes, medianMs, new Date().toISOString().slice(0, 10)), {
    parser: "markdown",
  }),
);
const passed = outcomes.filter((outcome) => outcome.passed).length;
console.log(
  `\n${String(passed)}/${String(outcomes.length)} · mediana ${String(medianMs)} ms · docs/sensitivity.md escrito`,
);
