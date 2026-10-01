"use client";

import { Check, Download, Link2 } from "lucide-react";
import Image from "next/image";
import { useSyncExternalStore } from "react";

import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import type { AudienceResult } from "@/lib/audience/result";
import { encodeShare } from "@/lib/audience/share";
import { linkedInComposerUrl, shareText } from "@/lib/audience/share-text";

import { type CopyState, useCopy } from "./useCopy";

interface SharePanelProps {
  result: AudienceResult;
  seed: number;
}

const COPY_LABELS: Record<CopyState, string> = {
  idle: "Copiar",
  copied: "Copiado!",
  failed: "Não foi possível copiar",
};

const noSubscription = () => () => undefined;

/** The page's address, known only in the browser; empty while rendering on the server. */
function useOrigin(): string {
  return useSyncExternalStore(
    noSubscription,
    () => window.location.origin,
    () => "",
  );
}

export function SharePanel({ result, seed }: SharePanelProps) {
  const origin = useOrigin();
  const path = `/r/${encodeShare(result, seed)}`;
  const image = `${path}/opengraph-image`;
  const link = `${origin}${path}`;

  const { state: copyState, copy } = useCopy(link);

  function postOnLinkedIn() {
    window.open(linkedInComposerUrl(shareText(result, link)), "_blank", "noopener");
  }

  return (
    <section className="panel share-panel" aria-labelledby="share-title">
      <h2 id="share-title" className="eyebrow panel-title">
        Compartilhe o resultado
      </h2>
      <div className="share-body">
        <Image
          className="share-preview"
          src={image}
          alt={`Cartão do resultado: ${String(result.applause)} de 100 no Aplausômetro`}
          width={1200}
          height={630}
          unoptimized
        />
        <div className="share-side">
          <span className="share-link-label" id="share-link-label">
            Link do resultado
          </span>
          <div className="share-link" role="group" aria-labelledby="share-link-label">
            <code>{link.replace(/^https?:\/\//, "")}</code>
            <button type="button" className="button button-chip" onClick={copy}>
              {copyState === "copied" ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
              {COPY_LABELS[copyState]}
            </button>
          </div>
          <div className="share-actions">
            <button type="button" className="button button-primary" onClick={postOnLinkedIn}>
              <LinkedInIcon />
              Postar no LinkedIn
            </button>
            <a className="button" href={image} download="aplausometro.png">
              <Download aria-hidden="true" />
              Baixar imagem
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
