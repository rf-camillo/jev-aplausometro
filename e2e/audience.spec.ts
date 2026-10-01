import { expect, type Locator, type Page, test } from "@playwright/test";

import { evaluatePost, spotlightCard, waitFrames } from "./support";

/** Moves the mouse over the audience, row by row, until it rests on someone. */
async function pointAtSomeone(
  page: Page,
  box: { x: number; y: number; width: number; height: number },
  tip: Locator,
): Promise<boolean> {
  for (let row = 0.9; row >= 0.2; row -= 0.1) {
    for (let column = 0.05; column <= 0.95; column += 0.01) {
      await page.mouse.move(box.x + box.width * column, box.y + box.height * row);
      if (await tip.isVisible()) return true;
    }
  }
  return false;
}

function audience(page: Page) {
  return page.getByRole("img", { name: /^Plateia de 120 pessoas/ });
}

test("a persona can be spotlighted from the list and released three ways", async ({ page }) => {
  await evaluatePost(page);
  const investor = page.getByRole("button", { name: "Investidor: destacar na plateia" });
  await investor.click();
  await expect(investor).toHaveAttribute("aria-pressed", "true");
  await expect(audience(page)).toBeInViewport();
  await expect(spotlightCard(page)).toContainText("Investidor");
  await expect(spotlightCard(page)).toContainText("º no aplauso");
  await expect(spotlightCard(page)).toContainText(/Confiança do Jev: \d+%/);
  await investor.click();
  await expect(investor).toHaveAttribute("aria-pressed", "false");

  await investor.click();
  await page.getByRole("button", { name: "Mostrar todos" }).click();
  await expect(investor).toHaveAttribute("aria-pressed", "false");
  await expect(spotlightCard(page)).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Legenda das reações" })).toBeVisible();

  await investor.click();
  await page.keyboard.press("Escape");
  await expect(investor).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("button", { name: "Mãe: destacar na plateia" }).click();
  await expect(spotlightCard(page)).toContainText("Fora do aplausômetro");
});

test("the fan under the audience spotlights its persona", async ({ page }) => {
  await evaluatePost(page);
  const fan = page.getByRole("button", { name: /^Maior fã: / });
  await expect(fan).toHaveAccessibleName("Maior fã: Investidor");
  await fan.click();
  await expect(fan).toHaveAttribute("aria-pressed", "true");
  await expect(spotlightCard(page)).toContainText("Investidor");
});

test("pointing at someone in the audience names them, and a click spotlights them", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "phones have no pointer to hover with");
  await evaluatePost(page);
  const canvas = audience(page);
  await canvas.evaluate((element) => {
    element.scrollIntoView({ block: "center" });
  });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("The audience has no size");
  const tip = page.locator(".seat-tip");
  expect(await pointAtSomeone(page, box, tip), "nobody found under the pointer").toBe(true);
  await expect(tip).toHaveText(/^\S.* · .+$/);
  const name = (await tip.textContent())?.split(" · ")[0] ?? "";

  await page.mouse.down();
  await page.mouse.up();
  await expect(spotlightCard(page)).toContainText(name);
  await expect(page.getByRole("button", { name: `${name}: destacar na plateia` })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the audience stays still for people who ask for less motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await evaluatePost(page);
  const first = await audience(page).screenshot();
  await waitFrames(page, 20);
  expect((await audience(page).screenshot()).equals(first)).toBe(true);
});

test("releasing a persona with the same button lights the whole audience again", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await evaluatePost(page);
  await audience(page).evaluate((element) => {
    element.scrollIntoView({ block: "center" });
  });
  const whole = await audience(page).screenshot();
  const mom = page.getByRole("button", { name: "Mãe: destacar na plateia" });
  await mom.focus();
  await page.keyboard.press("Enter");
  await expect(mom).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Enter");
  await expect(mom).toHaveAttribute("aria-pressed", "false");
  await waitFrames(page, 2);
  expect((await audience(page).screenshot()).equals(whole)).toBe(true);
});
