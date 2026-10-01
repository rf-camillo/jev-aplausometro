"use client";

import { useEffect, useMemo, useRef } from "react";

import { describeAudience, WAITING_AUDIENCE } from "@/lib/audience/describe";
import { highlightsOf } from "@/lib/audience/highlights";
import { placingOf } from "@/lib/audience/ranking";
import { arrangeSeats } from "@/lib/audience/seats";
import { resultOnShow, type SharedResult } from "@/lib/audience/share";
import { statusOf } from "@/lib/audience/status";

import { AudienceCast } from "./cast/AudienceCast";
import { Composer } from "./composer/Composer";
import { useAudience } from "./hooks/useAudience";
import { useSpotlight } from "./hooks/useSpotlight";
import { FinePrint } from "./layout/FinePrint";
import { PageShell } from "./layout/PageShell";
import { APP_NAME } from "./layout/site";
import { MetricCards } from "./results/MetricCards";
import { PersonaBreakdown } from "./results/PersonaBreakdown";
import { SharePanel } from "./share/SharePanel";
import { HighlightChips } from "./stage/HighlightChips";
import { Stage } from "./stage/Stage";

const TAGLINE = "Escreva ou cole seu post do LinkedIn e veja leitores reagirem.";
const SHARED_TAGLINE = "Alguém testou um post aqui. Escreva o seu e veja a plateia reagir.";

export function Aplausometro({ shared = null }: { shared?: SharedResult | null }) {
  const { draft, setDraft, answered, loading, error, evaluateNow } = useAudience();
  const { spotlight, audienceRef } = useSpotlight();

  const shown = useMemo(() => resultOnShow(answered, shared), [answered, shared]);
  const fromLink = shown !== null && answered === null;
  const seats = useMemo(() => shown && arrangeSeats(shown.result, shown.seed), [shown]);
  const highlights = useMemo(() => shown && highlightsOf(shown.result), [shown]);

  const leftTheLink = useRef(false);
  useEffect(() => {
    if (!answered || !shared || leftTheLink.current) return;
    leftTheLink.current = true;
    window.history.replaceState(null, "", "/");
    document.title = APP_NAME;
  }, [answered, shared]);

  return (
    <PageShell
      tagline={fromLink ? SHARED_TAGLINE : TAGLINE}
      lead={
        <Composer
          post={draft}
          status={statusOf(draft, loading, answered)}
          error={loading ? null : error}
          onChange={setDraft}
          onSubmit={evaluateNow}
        />
      }
    >
      <Stage
        applause={shown?.result.applause ?? null}
        loading={loading}
        seats={seats}
        label={shown && highlights ? describeAudience(shown.result, highlights) : WAITING_AUDIENCE}
        notice={fromLink ? "Resultado Compartilhado" : null}
        spotlight={spotlight}
        audienceRef={audienceRef}
        placing={shown && spotlight.pinned ? placingOf(shown.result, spotlight.pinned) : null}
      >
        {highlights && (
          <HighlightChips
            highlights={highlights}
            pinned={spotlight.pinned}
            onPick={spotlight.onPin}
          />
        )}
      </Stage>

      {shown && highlights ? (
        <>
          <PersonaBreakdown result={shown.result} highlights={highlights} spotlight={spotlight} />
          <MetricCards result={shown.result} />
          {!fromLink && <SharePanel result={shown.result} seed={shown.seed} />}
        </>
      ) : (
        <AudienceCast />
      )}
      <FinePrint />
    </PageShell>
  );
}
