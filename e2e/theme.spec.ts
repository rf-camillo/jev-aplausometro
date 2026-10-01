import { expect, test } from "@playwright/test";

import { evaluate, expectAccessible } from "./support";

test("the chosen theme sticks after a reload, and the dark one is accessible too", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const dark = page.getByRole("button", { name: "Tema escuro" });
  await dark.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(dark).toHaveAttribute("aria-pressed", "true");
  await evaluate(page);
  await expectAccessible(page);
});
