import { ImageResponse } from "next/og";

import { CARD_SIZE } from "@/components/share/card/card-style";
import { ShareCard } from "@/components/share/card/ShareCard";
import { arrangeSeats } from "@/lib/audience/seats";
import { decodeShare } from "@/lib/audience/share";

import { cardFonts } from "../../card-fonts";
import { siteHost } from "../../site";

export const size = CARD_SIZE;
export const contentType = "image/png";
export const alt = "O resultado do Aplausômetro: o medidor, o veredito e a plateia";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const shared = decodeShare(code);
  if (!shared) return new Response("Not found", { status: 404 });
  const seats = arrangeSeats(shared.result, shared.seed);
  return new ImageResponse(<ShareCard result={shared.result} seats={seats} site={siteHost()} />, {
    ...CARD_SIZE,
    fonts: await cardFonts(),
    // A code always draws the same card, so it may be kept for good by browsers and the CDN.
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
