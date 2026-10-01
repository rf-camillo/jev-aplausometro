import { expect, test } from "@playwright/test";

import { POST } from "./support";

test("every page is sent with the security headers", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("another site cannot spend the API through its visitors' browsers", async ({ request }) => {
  const foreign = await request.post("/api/audience", {
    headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
    data: JSON.stringify({ post: POST }),
  });
  expect(foreign.status()).toBe(403);

  const form = await request.post("/api/audience", {
    headers: { "Content-Type": "text/plain" },
    data: JSON.stringify({ post: POST }),
  });
  expect(form.status()).toBe(415);
});
