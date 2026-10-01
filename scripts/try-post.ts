import { highlightsOf } from "../src/lib/audience/highlights";
import { buildQuestions, buildState } from "../src/lib/audience/questions";
import { REACTION_INFO, REACTIONS } from "../src/lib/audience/reactions";
import { readMetrics } from "../src/lib/audience/readings";
import { interpretEvaluation } from "../src/lib/audience/result";
import { arrangeSeats } from "../src/lib/audience/seats";
import { encodeShare } from "../src/lib/audience/share";
import { percent } from "../src/lib/core/format";
import { hashString } from "../src/lib/core/hash";
import { jevClientFromEnv } from "../src/lib/server/jev-from-env";

const jev = jevClientFromEnv(process.env);
const args = process.argv.slice(2);
/** `--raw` also prints Jev's answers to the metric questions exactly as they came. */
const raw = args.includes("--raw");
const post = args
  .filter((arg) => arg !== "--raw")
  .join(" ")
  .trim();
const unknown = args.filter((arg) => arg.startsWith("--") && arg !== "--raw");
if (!jev || !post || unknown.length > 0) {
  console.error('Uso: TYPESAFE_API_KEY=... npm run try -- [--raw] "texto do post"');
  process.exit(1);
}

const evaluation = await jev.evaluate({ state: buildState(post), questions: buildQuestions() });
const result = interpretEvaluation(evaluation);
if (raw) {
  const metrics = Object.entries(evaluation.answers).filter(([key]) => key.startsWith("metric_"));
  console.log(JSON.stringify(Object.fromEntries(metrics), null, 2));
}
const highlights = highlightsOf(result);
const seats = arrangeSeats(result, hashString(post));

console.log(`\n👏 Aplausômetro: ${String(result.applause)}/100`);
console.log(
  `   ${evaluation.model} · ${String(evaluation.latencyMs)} ms · ${String(evaluation.inputTokens)} tokens\n`,
);
for (const { persona, distribution, confidence, applause } of result.personas) {
  const top = REACTIONS.filter((reaction) => distribution[reaction] >= 0.1)
    .sort((a, b) => distribution[b] - distribution[a])
    .map((reaction) => `${REACTION_INFO[reaction].emoji} ${percent(distribution[reaction])}`)
    .join("  ");
  const row = seats
    .filter((seat) => seat.personaId === persona.id)
    .map((seat) => REACTION_INFO[seat.reaction].emoji)
    .join("");
  console.log(
    `${persona.name.padEnd(14)} aplauso ${percent(applause).padStart(4)} · confiança ${confidence === null ? "?" : percent(confidence)} · ${top}`,
  );
  console.log(`${"".padEnd(14)} ${row}`);
}
console.log("");
for (const reading of readMetrics(result)) {
  const chance = reading.chance === null ? "" : ` ${percent(reading.chance)}`;
  const confidence =
    reading.confidence === null ? "" : ` · confiança ${percent(reading.confidence)}`;
  console.log(`${reading.label.padEnd(19)} ${reading.headline}${chance}${confidence}`);
}
console.log(
  `\nFã: ${highlights.fan.name} · Crítico: ${highlights.critic.name} · Reação dominante: ${REACTION_INFO[highlights.dominant].label}`,
);
console.log(`Link: /r/${encodeShare(result, hashString(post))}\n`);
