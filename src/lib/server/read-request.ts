import { z } from "zod";

import { MAX_POST_LENGTH, normalizePost } from "../audience/live";
import { AppError } from "../core/errors";
import { readLimitedText } from "../core/read-limited";

/** Generous for 3000 characters of text, even when every one of them is an emoji. */
export const MAX_BODY_BYTES = 16_384;

const NOT_TEXT = "Envie o post como texto.";
export const UNREADABLE = "Não foi possível ler o pedido.";
const TOO_LARGE = "O post é grande demais.";

const requestSchema = z.object(
  {
    post: z
      .string({ error: NOT_TEXT })
      .transform(normalizePost)
      .pipe(
        z
          .string()
          .min(1, "Escreva o post antes de chamar a plateia.")
          .max(MAX_POST_LENGTH, `O post pode ter até ${String(MAX_POST_LENGTH)} caracteres.`),
      ),
  },
  { error: NOT_TEXT },
);

export async function readPost(request: Request): Promise<string> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) throw new AppError("INVALID_INPUT", TOO_LARGE);
  const raw = await readLimitedText(request.body, MAX_BODY_BYTES);
  if (raw === null) throw new AppError("INVALID_INPUT", TOO_LARGE);
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new AppError("INVALID_INPUT", UNREADABLE);
  }
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    throw new AppError("INVALID_INPUT", parsed.error.issues[0]?.message ?? NOT_TEXT);
  }
  return parsed.data.post;
}
