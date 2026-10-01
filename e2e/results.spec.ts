import { expect, test } from "@playwright/test";

import { evaluate, evaluatePost, expectAccessible, PERSONA_COUNT, rankingRows } from "./support";

test("the cast introduces every persona with a face and a name, until a post comes", async ({
  page,
}) => {
  await page.goto("/");
  const cast = page.getByRole("region", { name: "Quem está na plateia" });
  await expect(cast.getByRole("listitem")).toHaveCount(PERSONA_COUNT);
  await expect(cast.locator("svg")).toHaveCount(PERSONA_COUNT * 2);
  await expect(cast.getByText("Tio do Zap")).toBeVisible();
  await expect(cast.getByText("Adora uma lição de vida")).toBeVisible();

  await evaluate(page);
  await expect(cast).toHaveCount(0);
});

test("the personas are ranked from the biggest fan to the harshest critic", async ({ page }) => {
  await evaluatePost(page);
  const rows = rankingRows(page);
  await expect(rows.first()).toContainText("Investidor");
  await expect(rows.first()).toContainText("Maior fã");
  await expect(rows.last()).toContainText("Dev Sênior");
  await expect(rows.last()).toContainText("Maior crítico");
  await expect(
    page.getByRole("list", { name: "Legenda das cores" }).getByRole("listitem"),
  ).toHaveCount(8);

  const part = rows.first().locator(".stacked-part").first();
  await part.hover();
  await expect(part.locator(".stacked-tip")).toBeVisible();
  await expect(part.locator(".stacked-tip")).toContainText(/· \d+%/);
  await expectAccessible(page);
});

test("the post's metrics come as five cards, the yes-or-no ones with their certainty", async ({
  page,
}) => {
  await evaluatePost(page);
  const cards = page.getByRole("region", { name: "O post em números" }).getByRole("listitem");
  await expect(cards).toHaveCount(5);
  const soundsLikeAi = cards.filter({ hasText: "Parece IA?" });
  await expect(soundsLikeAi).toContainText("Não");
  await expect(soundsLikeAi).toContainText("70% de chance");

  const authenticity = cards.filter({ hasText: "Autenticidade" });
  await expect(authenticity.getByRole("img", { name: /^Distribuição: Artificial/ })).toBeVisible();
  await expect(authenticity).toContainText("Pouco autêntico");
  await expect(authenticity).toContainText("51%");
  await expect(authenticity).toContainText("Confiança do Jev: 26%");

  const clarity = cards.filter({ hasText: "Clareza" });
  await expect(clarity).toContainText("Dividido");
  await expect(clarity.locator(".metric-chance")).toHaveCount(0);
});

test("on a phone, each persona's place sits on its avatar and the details step aside", async ({
  page,
  isMobile,
}) => {
  await evaluatePost(page);
  const first = rankingRows(page).first();
  const blurb = first.getByText("De olho em tração e números");
  const place = first.locator(".avatar-rank");
  if (isMobile) {
    await expect(place).toHaveText("1º");
    await expect(blurb).toHaveCount(1);
    const details = first.locator(".persona-details");
    expect((await details.boundingBox())?.width ?? 0).toBeLessThanOrEqual(1);
  } else {
    await expect(place).toBeHidden();
    await expect(blurb).toBeVisible();
  }
});
