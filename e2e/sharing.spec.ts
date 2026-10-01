import { expect, test } from "@playwright/test";

import {
  composerStatus,
  evaluate,
  evaluatePost,
  expectAccessible,
  meter,
  POST,
  postField,
  RANKED_COUNT,
  rankingRows,
} from "./support";

const V1_LINK =
  "AVNLGTIeWgE1KEJQBQBfAAAAAFAKAFoAAAAAUA8AVQAAAABQFABQAAAAAFAZAEsAAAAAUB4ARgAAAABQIwBBAAAAAFAoADwAAAAAUC0ANwAAAABQMgAyAAAAAFA3AC0AAAAAUDwAKAAAAAA";

test("posting on LinkedIn opens the composer with the result already written", async ({
  page,
  context,
}) => {
  await context.route("https://www.linkedin.com/**", (route) => route.fulfill({ body: "ok" }));
  await evaluatePost(page);
  const popup = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Postar no LinkedIn" }).click();
  const composer = new URL((await popup).url());
  expect(composer.searchParams.get("shareActive")).toBe("true");
  const text = composer.searchParams.get("text") ?? "";
  expect(text).toMatch(/\d+ de 100/);
  expect(text).toMatch(/\/r\/[A-Za-z0-9_-]+$/);
  expect(text).not.toContain("GitHub");
});

test("a shared link shows the same audience and a card, never the post", async ({
  page,
  request,
}) => {
  await evaluatePost(page);
  const reading = await meter(page).getAttribute("aria-label");

  const sharing = page.getByRole("region", { name: "Compartilhe o resultado" });
  await expect(sharing.getByRole("img", { name: /Cartão do resultado/ })).toBeVisible();
  await expect(sharing.getByRole("group", { name: "Link do resultado" })).toContainText("/r/");
  const cardHref = await sharing.getByRole("link", { name: "Baixar imagem" }).getAttribute("href");
  expect(cardHref).toMatch(/^\/r\/[A-Za-z0-9_-]+\/opengraph-image$/);
  const card = await request.get(cardHref ?? "");
  expect(card.status()).toBe(200);
  expect(card.headers()["content-type"]).toBe("image/png");
  expect(card.headers()["cache-control"]).toContain("immutable");

  const sharedPath = (cardHref ?? "").replace("/opengraph-image", "");
  expect(sharedPath).not.toContain("GitHub");
  await page.goto(sharedPath);
  await expect(page).toHaveTitle(/^Aplausômetro: \d+\/100/);
  await expect(meter(page)).toHaveAccessibleName(reading ?? "");
  await expect(rankingRows(page)).toHaveCount(RANKED_COUNT);
  await expect(page.getByText(POST)).toHaveCount(0);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/opengraph-image/,
  );
  await expectAccessible(page);

  const field = postField(page);
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("");
  const notice = page.getByText("Resultado Compartilhado");
  await expect(notice).toBeVisible();
  await expect(sharing).toHaveCount(0);

  await evaluate(page, "Meu próprio post, escrito depois de abrir o link de um amigo.");
  await expect(notice).toHaveCount(0);
  await expect(page).toHaveURL("/");
  await expect(composerStatus(page)).toHaveText(/Avaliado em \d+ ms pelo Jev/);
  await expect(sharing).toBeVisible();
});

test("a link from before the spreads shows each score by its average, without a bar", async ({
  page,
}) => {
  await page.goto(`/r/${V1_LINK}`);
  const cards = page.getByRole("region", { name: "O post em números" }).getByRole("listitem");
  await expect(cards.filter({ hasText: "Clareza" })).toContainText("Claro");
  await expect(cards.filter({ hasText: "Autenticidade" })).toContainText("Neutro");
  await expect(page.getByRole("img", { name: /^Distribuição:/ })).toHaveCount(0);
});

test("a broken shared link is a 404", async ({ page }) => {
  const response = await page.goto("/r/isto-nao-e-um-resultado");
  expect(response?.status()).toBe(404);
});
