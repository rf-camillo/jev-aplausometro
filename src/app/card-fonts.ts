import { readFile } from "node:fs/promises";
import { join } from "node:path";

const FONTS = [
  { name: "Newsreader", file: "Newsreader-Medium.ttf", weight: 500 },
  { name: "Inter", file: "Inter-Regular.ttf", weight: 400 },
  { name: "Inter", file: "Inter-SemiBold.ttf", weight: 600 },
] as const;

export type CardFont = {
  name: string;
  data: Buffer;
  weight: 400 | 500 | 600;
  style: "normal";
};

let loaded: Promise<CardFont[]> | null = null;

/** The site's fonts for the server-rendered cards, read once per server instance. */
export function cardFonts(): Promise<CardFont[]> {
  loaded ??= Promise.all(
    FONTS.map(async ({ name, file, weight }) => ({
      name,
      weight,
      style: "normal" as const,
      data: await readFile(join(process.cwd(), "assets/fonts", file)),
    })),
  ).catch((error: unknown) => {
    loaded = null;
    throw error;
  });
  return loaded;
}
