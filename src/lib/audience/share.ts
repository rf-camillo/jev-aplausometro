import { decodeBase64Url, encodeBase64Url } from "../core/base64url";
import { hashString } from "../core/hash";
import { PERSONAS } from "./personas";
import type { AudienceResult, PersonaResult } from "./result";
import {
  LATEST,
  LAYOUTS,
  readBody,
  readSpreads,
  sizeOf,
  writeBody,
  writeSpreads,
} from "./share-format";

/**
 * A shared result travels in the link itself, so nothing is stored anywhere. It carries only
 * numbers (the meter, the metrics, how the scores spread, each persona's reactions and the
 * seat seed), never the post. The bytes are laid out in `share-format.ts`.
 */
export interface SharedResult {
  result: AudienceResult;
  seed: number;
}

export const SHARE_BYTES = sizeOf(LATEST.layout);

export function encodeShare(result: AudienceResult, seed: number): string {
  const bytes = new Uint8Array(SHARE_BYTES);
  bytes[0] = LATEST.version;
  writeBody(bytes, LATEST.layout, result, seed);
  writeSpreads(bytes, LATEST.layout, result);
  return encodeBase64Url(bytes);
}

/**
 * Reads a shared link back, of either version; any code that was not made by `encodeShare`
 * gives null. Everything travels in whole percents, so what is worked out again from it can
 * shift at a threshold: in a near tie, another fan or critic than the author saw, or a score
 * read as split, or no longer split.
 */
export function decodeShare(code: string): SharedResult | null {
  const bytes = decodeBase64Url(code);
  const layout = LAYOUTS[bytes?.[0] ?? 0];
  if (!bytes || !layout || sizeOf(layout) !== bytes.length) return null;
  // The last character has two bits base64 ignores, so four spellings decode alike; only the
  // one this page writes is a link, which keeps one result on one address.
  if (encodeBase64Url(bytes) !== code) return null;
  const body = readBody(bytes, layout);
  if (!body) return null;
  const spreads = readSpreads(bytes, layout);
  if (!spreads) return null;
  const inAppOrder = (item: PersonaResult) => PERSONAS.indexOf(item.persona);
  const personas = [...body.result.personas].sort((a, b) => inAppOrder(a) - inAppOrder(b));
  return { result: { ...body.result, personas, spreads }, seed: body.seed };
}

/**
 * The result the page shows: the reader's own once they have one, otherwise the shared one
 * they arrived with. The reader's audience is seated by the hash of their post.
 */
export function resultOnShow(
  own: { post: string; result: AudienceResult } | null,
  shared: SharedResult | null,
): SharedResult | null {
  if (own) return { result: own.result, seed: hashString(own.post) };
  return shared;
}
