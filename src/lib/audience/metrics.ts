import type { NoulQuestion, ScoreQuestion } from "../jev/types";

interface ScoreSpec {
  label: string;
  instructions: string;
  /** The rubric from the lowest level to the highest: the word the page shows, and what it means. */
  levels: readonly (readonly [level: string, anchor: string])[];
}

/**
 * Every level carries an anchor: a bare word like "Neutro" leaves Jev to guess where it sits,
 * and a plain informative post used to read as a cliché.
 */
export const SCORE_METRICS = {
  clarity: {
    label: "Clareza",
    instructions: "Quão claro e fácil de entender é este post para quem lê no feed?",
    levels: [
      ["Confuso", "não dá para saber o que o autor quer dizer"],
      ["Pouco claro", "a ideia aparece, mas é preciso reler ou adivinhar partes"],
      ["Razoável", "dá para entender, com trechos vagos ou desorganizados"],
      ["Claro", "a ideia é entendida na primeira leitura"],
      ["Muito claro", "direto e concreto, impossível entender errado"],
    ],
  },
  cliche: {
    label: "Clichê",
    instructions:
      "Quanto este post se apoia em frases feitas, fórmulas de LinkedIn e lições genéricas? Um post só informativo, sem frases de efeito, não é clichê.",
    levels: [
      ["Original", "nenhuma frase feita; fala do caso concreto com palavras próprias"],
      ["Pouco clichê", "uma ou outra expressão comum, mas o conteúdo é próprio"],
      ["Algo clichê", "mistura conteúdo próprio com frases de efeito ou fórmulas conhecidas"],
      ["Bem clichê", "a maior parte é fórmula, frase de efeito ou lição genérica"],
      ["Puro clichê", "só fórmulas e frases feitas, nada de específico"],
    ],
  },
  authenticity: {
    label: "Autenticidade",
    instructions:
      "Quão autêntico este post soa: parece escrito por uma pessoa real, com a própria voz e experiência?",
    levels: [
      ["Artificial", "soa fabricado, encenado ou escrito só para impressionar"],
      ["Pouco autêntico", "tem algo real, mas a voz é forçada ou de autopromoção"],
      ["Neutro", "informativo e impessoal, sem a voz de quem escreve"],
      ["Autêntico", "tem voz própria e detalhes de quem viveu aquilo"],
      ["Muito autêntico", "pessoal e específico, só essa pessoa poderia ter escrito"],
    ],
  },
} as const satisfies Record<string, ScoreSpec>;

export const NOUL_METRICS = {
  soundsLikeAi: {
    label: "Parece IA?",
    question: { type: "noul", instructions: "Este post parece ter sido escrito por IA?" },
  },
  callToAction: {
    label: "Chamada para ação?",
    question: {
      type: "noul",
      instructions:
        "O post pede ao leitor uma ação clara, como comentar, se candidatar ou acessar um link?",
    },
  },
} as const satisfies Record<string, { label: string; question: NoulQuestion }>;

/** Every score is rated on a rubric of this many levels. */
export const SCORE_LEVELS = 5;

export type ScoreMetric = keyof typeof SCORE_METRICS;
export type NoulMetric = keyof typeof NOUL_METRICS;
export type Metric = ScoreMetric | NoulMetric;

export function isNoulMetric(metric: Metric): metric is NoulMetric {
  return metric in NOUL_METRICS;
}

/** The words of a score's rubric, from the lowest level to the highest. */
export function levelsOf(metric: ScoreMetric): string[] {
  return SCORE_METRICS[metric].levels.map(([level]) => level);
}

export function metricQuestion(metric: Metric): ScoreQuestion | NoulQuestion {
  if (isNoulMetric(metric)) return NOUL_METRICS[metric].question;
  const { instructions, levels } = SCORE_METRICS[metric];
  return {
    type: "score",
    instructions,
    criteria: levels.map(([level, anchor]) => `${level}: ${anchor}`),
  };
}

/** Every metric, in the order they are read: the writing first, then the two yes-or-no questions. */
export const METRICS = [
  "clarity",
  "authenticity",
  "cliche",
  "soundsLikeAi",
  "callToAction",
] as const satisfies readonly Metric[];

export const SCORE_METRIC_LIST = METRICS.filter(
  (metric): metric is ScoreMetric => !isNoulMetric(metric),
);
