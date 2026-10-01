import { expect, test } from "@playwright/test";

import {
  composerStatus,
  countAudienceCalls,
  evaluate,
  evaluatePost,
  expectAccessible,
  expectNoHorizontalScroll,
  meter,
  POST,
  postField,
  RANKED_COUNT,
  rankingRows,
  writePost,
} from "./support";

test("the audience waits for a post, accessibly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Aplausômetro" })).toBeVisible();
  await expect(page.getByRole("figure")).toContainText(
    "A plateia está esperando o seu post para reagir…",
  );
  await expect(postField(page)).toBeFocused();
  await expect(page.getByRole("button", { name: "Lição de vida" })).toBeVisible();
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Código no GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/rf-camillo/jev-aplausometro",
  );
  for (const link of await footer.getByRole("link").all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await expectAccessible(page);
  await expectNoHorizontalScroll(page);
});

test("the audience reacts on its own when the writer pauses", async ({ page }) => {
  await evaluatePost(page);
  await expect(page.getByRole("figure")).not.toContainText("esperando o seu post");
  await expect(composerStatus(page)).toHaveText(/Avaliado em \d+ ms pelo Jev/);
  await expect(meter(page)).toHaveAccessibleName(/^Aplausômetro: \d+ de 100$/);
  await expectAccessible(page);
  await expectNoHorizontalScroll(page);
});

test("a post already evaluated comes back without a new call", async ({ page }) => {
  const calls = countAudienceCalls(page);
  await evaluatePost(page);
  const second = page.waitForResponse((response) => response.url().endsWith("/api/audience"));
  await writePost(page, `${POST} Obrigado!`);
  await second;
  await expect(composerStatus(page)).toContainText("Avaliado em");
  await writePost(page, POST);
  await expect(composerStatus(page)).toHaveText("Já avaliado!");
  expect(calls()).toBe(2);
});

test("the keyboard alone reaches the examples and calls the audience", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "phones have no keyboard shortcuts");
  await page.goto("/");
  await expect(postField(page)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Lição de vida" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(rankingRows(page)).toHaveCount(RANKED_COUNT);

  await page.keyboard.press("Shift+Tab");
  await expect(postField(page)).toBeFocused();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Curto demais");
  await page.keyboard.press("Control+Enter");
  await expect(composerStatus(page)).toContainText("Avaliado em");
});

test("a short post waits for the writer, unless they ask with the shortcut", async ({ page }) => {
  await page.clock.install();
  const calls = countAudienceCalls(page);
  await page.goto("/");
  await writePost(page, "Curto demais");
  await expect(composerStatus(page)).toHaveText("Mínimo de 20 caracteres (faltam 8)");
  await page.clock.runFor(2000);
  expect(calls()).toBe(0);
  await postField(page).press("Control+Enter");
  await expect(rankingRows(page)).toHaveCount(RANKED_COUNT);
  expect(calls()).toBe(1);
});

test("an unavailable Jev shows a message instead of an audience, and a way to retry", async ({
  page,
}) => {
  await page.goto("/");
  await writePost(page, "Este post vai encontrar o Jev [fora do ar] agora mesmo.");
  await expect(page.getByRole("alert").filter({ hasText: "lotada" })).toHaveText(
    "A plateia está lotada agora.",
  );
  await expect(rankingRows(page)).toHaveCount(0);
  await expectAccessible(page);

  const calls = countAudienceCalls(page);
  await page.getByRole("button", { name: "Tentar de novo" }).click();
  await expect.poll(calls).toBe(1);
  await evaluate(page);
});

test("asking with the shortcut is not undone by the pause that follows", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await writePost(page, POST);
  await postField(page).press("Control+Enter");
  await expect(composerStatus(page)).toContainText("Avaliado em");
  await page.clock.runFor(2000);
  await expect(composerStatus(page)).toContainText("Avaliado em");
});

test("a question the draft moves on from is dropped, and only the new post is answered", async ({
  page,
}) => {
  const calls = countAudienceCalls(page);
  await page.goto("/");
  const dropped = page.waitForEvent("requestfailed", (request) =>
    request.url().endsWith("/api/audience"),
  );
  await writePost(page, "Um post que o Jev vai ler [devagar], com toda a calma do mundo.");
  await expect(composerStatus(page)).toHaveText("A plateia está lendo…");
  await evaluate(page);
  await dropped;
  await expect(composerStatus(page)).toHaveText(/Avaliado em \d+ ms pelo Jev/);
  expect(calls()).toBe(2);
});

test("while the writer types, the audience asks at most every few seconds", async ({ page }) => {
  await page.clock.install();
  const calls = countAudienceCalls(page);
  await page.goto("/");
  await writePost(page, POST);
  await page.clock.runFor(1000);
  await expect.poll(calls).toBe(1);
  await writePost(page, `${POST} E mais uma frase.`);
  await page.clock.runFor(1000);
  expect(calls()).toBe(1);
  await page.clock.runFor(3500);
  await expect.poll(calls).toBe(2);
});

test("told to slow down, the audience keeps quiet while typing and says why when asked", async ({
  page,
}) => {
  await page.clock.install();
  let refusals = 1;
  await page.route("**/api/audience", (route) => {
    if (refusals <= 0) return route.fallback();
    refusals -= 1;
    return route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "RATE_LIMITED", message: "Muitas avaliações seguidas. Espere um minuto." },
      }),
    });
  });
  const calls = countAudienceCalls(page);
  await page.goto("/");
  await writePost(page, POST);
  await page.clock.runFor(1000);
  await expect.poll(calls).toBe(1);
  await expect(page.getByText("Muitas avaliações seguidas")).toHaveCount(0);
  await page.clock.runFor(16_000);
  await expect(rankingRows(page)).toHaveCount(RANKED_COUNT);

  refusals = 1;
  await writePost(page, `${POST} Agora pedindo na hora.`);
  await postField(page).press("Control+Enter");
  await expect(page.getByRole("alert").filter({ hasText: "Muitas" })).toHaveText(
    "Muitas avaliações seguidas. Espere um minuto.",
  );
});
