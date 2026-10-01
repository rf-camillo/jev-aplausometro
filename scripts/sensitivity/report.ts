import { percent } from "../../src/lib/core/format";
import type { Check } from "./checks";
import type { Measures } from "./measure";

export interface Outcome {
  check: Check;
  a: Measures;
  b: Measures;
  drift: number;
  passed: boolean;
}

function row({ check, a, b, drift, passed }: Outcome): string {
  const change = (from: string, to: string) => `${from} → ${to}`;
  return [
    check.name,
    check.expectation,
    change(String(a.applause), String(b.applause)),
    change(percent(a.eyeroll), percent(b.eyeroll)),
    change(percent(a.cliche), percent(b.cliche)),
    change(percent(a.soundsLikeAi), percent(b.soundsLikeAi)),
    change(percent(a.callToAction), percent(b.callToAction)),
    drift.toFixed(3),
    passed ? "✅" : "❌",
  ].join(" | ");
}

/** The report committed as docs/sensitivity.md, written whatever the outcome. */
export function renderReport(outcomes: Outcome[], medianMs: number, date: string): string {
  const passed = outcomes.filter((outcome) => outcome.passed).length;
  const checks = outcomes.map((outcome) => outcome.check);
  return `# Checagem de sensibilidade

Rodada em ${date} com o Jev de verdade (\`npm run sensitivity\`). Cada linha compara dois posts que diferem em um só aspecto e diz se a plateia se moveu como um leitor esperaria. O resultado é publicado como saiu, inclusive o que falhou.

**${String(passed)} de ${String(outcomes.length)} checagens passaram.** Latência mediana: ${String(medianMs)} ms por avaliação, com as 17 perguntas numa chamada só.

| Checagem | Esperado | Aplauso | Revira os olhos | Clichê | Parece IA | Chamada para ação | Distância | |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${outcomes.map((outcome) => `| ${row(outcome)} |`).join("\n")}

A **distância** é a média, entre as 12 personas, da distância de variação total entre as duas distribuições de reação: 0 é a mesma plateia, 1 é uma plateia completamente diferente.

## As perguntas

${checks.map((check) => `- **${check.name}:** ${check.question}`).join("\n")}

## Os posts

${checks.map((check) => `### ${check.name}\n\n**A.** ${check.a}\n\n**B.** ${check.b}`).join("\n\n")}
`;
}
