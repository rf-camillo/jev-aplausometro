import { CARD_COLORS } from "@/components/theme/palette";
import { highlightsOf, STANDOUT_LABELS, STANDOUTS } from "@/lib/audience/highlights";
import { REACTION_INFO } from "@/lib/audience/reactions";
import type { AudienceResult } from "@/lib/audience/result";
import { countReactions, type Seat } from "@/lib/audience/seats";
import { verdictFor } from "@/lib/audience/verdict";

import { BOX, COLUMN, DISPLAY } from "./card-style";
import { CardCrowd } from "./CardCrowd";
import { CardMeter } from "./CardMeter";
import { CardStandout } from "./CardStandout";

interface ShareCardProps {
  result: AudienceResult;
  seats: Seat[];
  site: string;
}

function Score({ result, readers }: { result: AudienceResult; readers: number }) {
  const verdict = verdictFor(result.applause);
  const highlights = highlightsOf(result);
  return (
    <div style={{ ...COLUMN, width: 400 }}>
      <div style={{ ...BOX, fontFamily: DISPLAY, fontSize: 46, color: CARD_COLORS.warm }}>
        Aplausômetro
      </div>
      <div style={{ ...BOX, fontSize: 21, color: CARD_COLORS.muted }}>
        {`Como ${String(readers)} leitores reagiram ao post`}
      </div>
      <div style={{ ...BOX, marginTop: 26 }}>
        <CardMeter reading={result.applause} />
      </div>
      <div style={{ ...BOX, alignItems: "flex-end", gap: 10, marginTop: 6 }}>
        <div style={{ ...BOX, fontFamily: DISPLAY, fontSize: 96, lineHeight: 1 }}>
          {String(result.applause)}
        </div>
        <div style={{ ...BOX, fontSize: 28, color: CARD_COLORS.muted, marginBottom: 12 }}>
          de 100
        </div>
      </div>
      <div style={{ ...BOX, fontFamily: DISPLAY, fontSize: 34, marginTop: 4 }}>
        {`${verdict.emoji} ${verdict.label}`}
      </div>
      <div style={{ ...COLUMN, gap: 10, marginTop: "auto" }}>
        {STANDOUTS.map((standout) => (
          <CardStandout
            key={standout}
            role={STANDOUT_LABELS[standout]}
            persona={highlights[standout]}
          />
        ))}
      </div>
    </div>
  );
}

export function ShareCard({ result, seats, site }: ShareCardProps) {
  const counts = countReactions(seats);
  return (
    <div
      style={{
        ...BOX,
        width: "100%",
        height: "100%",
        justifyContent: "space-between",
        padding: "44px 40px 36px 56px",
        background: `linear-gradient(180deg, ${CARD_COLORS.top} 0%, ${CARD_COLORS.paper} 75%)`,
        color: CARD_COLORS.ink,
        fontFamily: "Inter",
      }}
    >
      <Score result={result} readers={seats.length} />
      <div style={{ ...COLUMN, alignItems: "center" }}>
        <CardCrowd seats={seats} />
        <div style={{ ...BOX, gap: 22, fontSize: 22, color: CARD_COLORS.muted }}>
          {counts.map(({ reaction, count }) => (
            <div key={reaction} style={{ ...BOX, alignItems: "center", gap: 6 }}>
              <div style={BOX}>{REACTION_INFO[reaction].emoji}</div>
              <div style={BOX}>{String(count)}</div>
            </div>
          ))}
        </div>
        <div style={{ ...BOX, gap: 10, marginTop: "auto", fontSize: 20, color: CARD_COLORS.muted }}>
          <div style={{ ...BOX, color: CARD_COLORS.warm, fontWeight: 600 }}>Teste o seu post</div>
          <div style={BOX}>{site}</div>
        </div>
      </div>
    </div>
  );
}
