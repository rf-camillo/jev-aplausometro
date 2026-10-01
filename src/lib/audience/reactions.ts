import { recordFrom } from "../core/record";

export const REACTIONS = [
  "applaud",
  "share",
  "like",
  "comment",
  "disagree",
  "ignore",
  "sleep",
  "eyeroll",
] as const;

export type Reaction = (typeof REACTIONS)[number];

export interface ReactionInfo {
  label: string;
  emoji: string;
  /** What Jev reads when it picks this reaction. */
  criterion: string;
  /** How much of an applause this reaction is worth, from 0 to 1. */
  applause: number;
}

/**
 * Each criterion names one reaction a reader would stop at, so the options do not overlap:
 * whoever shares also likes, but sharing is as far as they go.
 */
export const REACTION_INFO: Record<Reaction, ReactionInfo> = {
  applaud: {
    label: "Aplaude",
    emoji: "👏",
    criterion: "Aplaude: acha admirável ou inspirador e faz questão de reconhecer",
    applause: 1,
  },
  share: {
    label: "Compartilha",
    emoji: "🔁",
    criterion: "Compartilha: acha útil ou relevante a ponto de repassar para a própria rede",
    applause: 1,
  },
  like: {
    label: "Curte",
    emoji: "👍",
    criterion: "Curte: gosta, mas não vai além de um clique",
    applause: 0.6,
  },
  comment: {
    label: "Comenta",
    emoji: "💬",
    criterion: "Comenta para concordar, perguntar ou acrescentar algo",
    applause: 0.75,
  },
  disagree: {
    label: "Discorda",
    emoji: "👎",
    criterion: "Discorda: acha errado, exagerado ou arrogante e critica, em público ou não",
    applause: 0,
  },
  ignore: {
    label: "Passa reto",
    emoji: "🚶",
    criterion: "Passa reto: não é assunto dele e segue rolando sem reagir",
    applause: 0.2,
  },
  sleep: {
    label: "Dorme",
    emoji: "😴",
    criterion: "Dorme: acha chato ou longo demais e não termina de ler",
    applause: 0.05,
  },
  eyeroll: {
    label: "Revira os olhos",
    emoji: "🙄",
    criterion: "Revira os olhos: acha clichê, forçado ou autopromoção",
    applause: 0,
  },
};

export type Distribution = Record<Reaction, number>;

export function emptyDistribution(): Distribution {
  return recordFrom(REACTIONS, () => 0);
}

/** The most likely reaction; ties go to the one listed first in `REACTIONS`. */
export function topReaction(distribution: Distribution): Reaction {
  return REACTIONS.reduce((best, reaction) =>
    distribution[reaction] > distribution[best] ? reaction : best,
  );
}
