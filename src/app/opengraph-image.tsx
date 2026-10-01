import { ImageResponse } from "next/og";

import { CARD_SIZE } from "@/components/share/card/card-style";
import { ShareCard } from "@/components/share/card/ShareCard";
import { EXAMPLE_SHARE } from "@/lib/audience/example";
import { TOTAL_SEATS } from "@/lib/audience/personas";
import { arrangeSeats } from "@/lib/audience/seats";
import { decodeShare } from "@/lib/audience/share";

import { cardFonts } from "./card-fonts";
import { siteHost } from "./site";

export const size = CARD_SIZE;
export const contentType = "image/png";
export const alt = `Aplausômetro: cole seu post e veja uma plateia de ${String(TOTAL_SEATS)} leitores reagir`;

export default async function Image() {
  const example = decodeShare(EXAMPLE_SHARE);
  if (!example) throw new Error("The example share code is invalid");
  return new ImageResponse(
    <ShareCard
      result={example.result}
      seats={arrangeSeats(example.result, example.seed)}
      site={siteHost()}
    />,
    { ...CARD_SIZE, fonts: await cardFonts() },
  );
}
