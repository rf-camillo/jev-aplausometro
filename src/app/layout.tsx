import "./styles/index.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { APP_NAME } from "@/components/layout/site";
import { themeBootScript } from "@/components/theme/theme-mode";
import { TOTAL_SEATS } from "@/lib/audience/personas";

import { siteUrl } from "./site";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: APP_NAME,
  description: `Cole seu post do LinkedIn e veja uma plateia de ${String(TOTAL_SEATS)} leitores reagir, com as probabilidades calibradas do Jev.`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#151410" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <link
          rel="preload"
          href="/fonts/newsreader-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
