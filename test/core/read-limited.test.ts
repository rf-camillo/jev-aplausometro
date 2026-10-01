import { describe, expect, it } from "vitest";

import { readLimitedText } from "@/lib/core/read-limited";

function stream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

describe("readLimitedText", () => {
  it("reads a body within the limit, across chunks and multibyte characters", async () => {
    expect(await readLimitedText(stream(["olá, ", "plateia 👏"]), 64)).toBe("olá, plateia 👏");
    expect(await readLimitedText(null, 64)).toBe("");
  });

  it("stops at the limit, counting bytes rather than characters", async () => {
    expect(await readLimitedText(stream(["👏👏"]), 7)).toBeNull();
    expect(await readLimitedText(stream(["👏👏"]), 8)).toBe("👏👏");
  });

  it("rejects when the read is aborted", async () => {
    const failing = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new DOMException("aborted", "AbortError"));
      },
    });
    await expect(readLimitedText(failing, 64)).rejects.toThrow("aborted");
  });
});
