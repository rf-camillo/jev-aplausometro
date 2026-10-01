import { mkdir, readFile, writeFile } from "node:fs/promises";

import { format } from "prettier";

import { buildQuestions, buildState } from "../src/lib/audience/questions";
import { interpretEvaluation } from "../src/lib/audience/result";
import { hashString } from "../src/lib/core/hash";
import { jevClientFromEnv } from "../src/lib/server/jev-from-env";
import { POSTS } from "./calibration/posts";
import { checksOfRun, renderReport, type Run } from "./calibration/report";
import { snapshotOf } from "./calibration/score";

const RUNS = "docs/calibration";
const REPORT = "docs/calibration.md";

function usage(): never {
  console.error(
    [
      "Uso:",
      "  TYPESAFE_API_KEY=... npm run calibrate -- run v5   avalia o conjunto e guarda a versão",
      "  npm run calibrate -- report v1 v2 [...]            compara versões guardadas",
    ].join("\n"),
  );
  process.exit(1);
}

const [command, ...names] = process.argv.slice(2);
const isName = (name: string) => /^[a-z0-9-]+$/.test(name);
if (names.length === 0 || !names.every(isName)) usage();

if (command === "run") {
  if (names.length !== 1) usage();
  const jev = jevClientFromEnv(process.env) ?? usage();
  const questions = buildQuestions();
  const run: Run = {
    label: names[0] ?? "",
    date: new Date().toISOString().slice(0, 10),
    questions: hashString(JSON.stringify(questions)).toString(16),
    snapshots: [],
  };
  for (const post of POSTS) {
    const evaluation = await jev.evaluate({ state: buildState(post.text), questions });
    const snapshot = snapshotOf(post.id, interpretEvaluation(evaluation), evaluation.latencyMs);
    run.snapshots.push(snapshot);
    console.log(`${post.id.padEnd(26)} ${String(snapshot.applause).padStart(3)}`);
  }
  await mkdir(RUNS, { recursive: true });
  await writeFile(`${RUNS}/${run.label}.json`, `${JSON.stringify(run, null, 2)}\n`);
  const checks = checksOfRun(run);
  console.log(
    `\n${String(checks.filter((check) => check.passed).length)} de ${String(checks.length)} expectativas · ${RUNS}/${run.label}.json`,
  );
} else if (command === "report") {
  const runs = await Promise.all(
    names.map(async (name) => JSON.parse(await readFile(`${RUNS}/${name}.json`, "utf8")) as Run),
  );
  await writeFile(REPORT, await format(renderReport(runs), { parser: "markdown" }));
  console.log(`${REPORT} escrito`);
} else {
  usage();
}
