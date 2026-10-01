import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Aplausometro } from "@/components/Aplausometro";
import { APP_NAME } from "@/components/layout/site";
import { highlightsOf, standoutsLine } from "@/lib/audience/highlights";
import { TOTAL_SEATS } from "@/lib/audience/personas";
import { decodeShare } from "@/lib/audience/share";
import { verdictFor } from "@/lib/audience/verdict";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shared = decodeShare((await params).code);
  if (!shared) return { title: APP_NAME };
  const { result } = shared;
  const verdict = verdictFor(result.applause);
  const highlights = highlightsOf(result);
  const title = `Aplausômetro: ${String(result.applause)}/100, ${verdict.label}`;
  const description = `${standoutsLine(highlights)} Teste o seu post com uma plateia de ${String(TOTAL_SEATS)} leitores.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedPage({ params }: Props) {
  const shared = decodeShare((await params).code);
  if (!shared) notFound();
  return <Aplausometro shared={shared} />;
}
