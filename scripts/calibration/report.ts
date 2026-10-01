import { percent } from "../../src/lib/core/format";
import { POSTS } from "./posts";
import { type Check, checksOf, orderChecks, type Snapshot, summarize, type Summary } from "./score";
import { VERSIONS } from "./versions";

export interface Run {
  label: string;
  date: string;
  /** A hash of every question sent to Jev, which tells two versions of the wording apart. */
  questions: string;
  snapshots: Snapshot[];
}

export function checksOfRun(run: Run): Check[] {
  const byId = new Map(run.snapshots.map((snapshot) => [snapshot.id, snapshot]));
  return [
    ...POSTS.flatMap((post) => {
      const snapshot = byId.get(post.id);
      return snapshot ? checksOf(post, snapshot) : [];
    }),
    ...orderChecks(run.snapshots),
  ];
}

/** "v2" reads as "Versão 2"; any other name as itself. */
export const versionName = (label: string): string =>
  label.replace(/^v(\d+)$/, (_, number: string) => `Versão ${number}`);

const table = (header: string[], rows: string[][]): string =>
  [header, header.map(() => "---"), ...rows].map((row) => `| ${row.join(" | ")} |`).join("\n");

/** The versions side by side, the newest last, written whatever the outcome. */
export function renderReport(runs: Run[]): string {
  const summaries = runs.map((run) => summarize(run.snapshots, checksOfRun(run)));
  const row = (label: string, render: (summary: Summary) => string) => [
    label,
    ...summaries.map(render),
  ];
  const summary = table(
    ["", ...runs.map((run) => `${versionName(run.label)} (${run.date})`)],
    [
      row("Expectativas atendidas", (s) => `${String(s.passed)} de ${String(s.total)}`),
      row(
        "Aplauso, do menor ao maior",
        (s) => `${String(s.applauseMin)} a ${String(s.applauseMax)}`,
      ),
      row("Desvio padrão do aplauso", (s) => s.applauseSpread.toFixed(1)),
      row("Confiança média nas personas", (s) => percent(s.personaConfidence)),
      row("Confiança média nas notas", (s) => percent(s.scoreConfidence)),
      row("Notas divididas", (s) => String(s.splits)),
      row("Latência mediana", (s) => `${String(s.medianMs)} ms`),
    ],
  );
  const posts = table(
    ["Post", ...runs.map((run) => versionName(run.label))],
    POSTS.map((post) => [
      post.id,
      ...runs.map((run) =>
        String(run.snapshots.find((item) => item.id === post.id)?.applause ?? ""),
      ),
    ]),
  );
  return `# Calibração da plateia

Cada versão das perguntas ao Jev avaliada no mesmo conjunto de ${String(POSTS.length)} posts (\`scripts/calibration/posts.ts\`), cada um com o que um leitor esperaria dele: a faixa do aplauso, quem gosta e quem não gosta, e as notas. Rodada com o Jev de verdade (\`npm run calibrate\`) e publicada como saiu. As expectativas valem para todas as versões: quando uma muda, o relatório recalcula todas.

## As versões

${runs.map((run) => `- **${versionName(run.label)}**: ${VERSIONS[run.label] ?? "sem descrição."}`).join("\n")}

## Resumo

${summary}

## Aplauso por post

${posts}
`;
}
