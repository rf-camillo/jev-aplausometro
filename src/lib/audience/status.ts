import { LIVE_MIN_LENGTH, normalizePost, shouldEvaluateLive } from "./live";

export interface Status {
  kind: "busy" | "done" | "hint";
  text: string;
}

export interface LastAnswer {
  post: string;
  fromCache: boolean;
  latencyMs: number;
}

/** What the page says while the audience reads a post, by the counter and under the meter. */
export const READING_TEXT = "A plateia está lendo…";

/** The line next to the counter, or null while the audience waits for a first post. */
export function statusOf(draft: string, loading: boolean, last: LastAnswer | null): Status | null {
  if (loading) return { kind: "busy", text: READING_TEXT };
  const post = normalizePost(draft);
  if (post.length > 0 && !shouldEvaluateLive(post) && post !== last?.post) {
    const missing = LIVE_MIN_LENGTH - post.length;
    return {
      kind: "hint",
      text: `Mínimo de ${String(LIVE_MIN_LENGTH)} caracteres (faltam ${String(missing)})`,
    };
  }
  if (!last) return null;
  if (last.fromCache) return { kind: "done", text: "Já avaliado!" };
  return { kind: "done", text: `Avaliado em ${String(last.latencyMs)} ms pelo Jev` };
}
