import { Lock } from "lucide-react";

import { LIVE_MIN_LENGTH } from "@/lib/audience/live";

/** The fine print's id, which the post field points at as its description. */
export const FINE_PRINT_ID = "privacy-note";

export function FinePrint() {
  return (
    <p id={FINE_PRINT_ID} className="fine-print">
      <Lock className="inline-icon" aria-hidden="true" /> Nada é armazenado; não cole dados
      pessoais.{" "}
      <span className="wide-only">
        A plateia reage quando você faz uma pausa, a partir de {LIVE_MIN_LENGTH} caracteres.
      </span>
      <br />É uma simulação de como esses leitores tendem a ler o post, não uma previsão de
      engajamento.
    </p>
  );
}
