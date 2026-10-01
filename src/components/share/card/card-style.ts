/**
 * Shared bits of the share card. Satori, which renders it, lays out only flex boxes, so every
 * box with children starts from `BOX`.
 */
export const CARD_SIZE = { width: 1200, height: 630 };
export const DISPLAY = "Newsreader";
export const BOX = { display: "flex" } as const;
export const COLUMN = { display: "flex", flexDirection: "column" } as const;
