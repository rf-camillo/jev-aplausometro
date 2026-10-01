export interface Verdict {
  label: string;
  emoji: string;
}

const VERDICTS: readonly (Verdict & { from: number })[] = [
  { from: 85, label: "Ovação de pé!", emoji: "🎉" },
  { from: 65, label: "Aplausos calorosos", emoji: "👏" },
  { from: 45, label: "Palmas educadas", emoji: "🙂" },
  { from: 25, label: "Silêncio constrangedor", emoji: "😶" },
  { from: 0, label: "Vaia!", emoji: "🍅" },
];

/** What a TV host would shout for this reading of the applause meter. */
export function verdictFor(applause: number): Verdict {
  const found = VERDICTS.find((verdict) => applause >= verdict.from) ?? VERDICTS.at(-1);
  if (!found) throw new Error("There are no verdicts");
  return { label: found.label, emoji: found.emoji };
}
