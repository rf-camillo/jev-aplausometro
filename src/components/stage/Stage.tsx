import type { ReactNode, RefObject } from "react";

import type { Spotlight } from "@/components/hooks/useSpotlight";
import type { Placing } from "@/lib/audience/ranking";
import type { Seat } from "@/lib/audience/seats";

import { ApplauseMeter } from "./ApplauseMeter";
import { AudienceCanvas } from "./AudienceCanvas";
import { ReactionLegend } from "./ReactionLegend";
import { SpotlightCard } from "./SpotlightCard";

interface StageProps {
  applause: number | null;
  loading: boolean;
  seats: Seat[] | null;
  label: string;
  /** A line over the meter saying whose result this is, when it is not the reader's own. */
  notice: string | null;
  spotlight: Spotlight;
  /** Set on the audience, for the spotlight to bring it into view. */
  audienceRef: RefObject<HTMLDivElement | null>;
  /** Where the pinned persona placed, shown in place of the legend with a way back. */
  placing: Placing | null;
  children?: ReactNode;
}

export function Stage({
  applause,
  loading,
  seats,
  label,
  notice,
  spotlight,
  audienceRef,
  placing,
  children,
}: StageProps) {
  return (
    <section className="stage" aria-label="A plateia">
      {notice && <p className="stage-notice">{notice}</p>}
      <ApplauseMeter value={applause} loading={loading} />
      <AudienceCanvas
        ref={audienceRef}
        seats={seats}
        label={label}
        focus={spotlight.focus}
        onPick={seats ? spotlight.onPin : null}
      />
      {placing ? (
        <SpotlightCard placing={placing} onShowAll={spotlight.onShowAll} />
      ) : (
        <ReactionLegend />
      )}
      {children}
    </section>
  );
}
