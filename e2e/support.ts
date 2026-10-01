import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";

import { PERSONAS } from "../src/lib/audience/personas";

/*
 * What the tests share. Elements are found as a reader would find them, by role and name;
 * only what is drawn for the eye alone (tips, bars) is found by its class.
 */

/** A post long enough for the audience to react on its own. */
export const POST =
  "Hoje publiquei meu primeiro projeto open source no GitHub, com testes e documentação.";

export const PERSONA_COUNT = PERSONAS.length;

export const RANKED_COUNT = PERSONAS.filter((persona) => persona.inMeter).length;

/** No serious or critical WCAG A or AA violation on the page as it is. */
export async function expectAccessible(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );
  expect(serious.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
}

export function postField(page: Page): Locator {
  return page.getByRole("textbox", { name: "Seu post" });
}

export async function writePost(page: Page, post: string): Promise<void> {
  await postField(page).fill(post);
}

/** The line next to the counter: reading, evaluated, or how many characters are missing. */
export function composerStatus(page: Page): Locator {
  return page.getByRole("region", { name: "Escreva o seu post" }).getByRole("status");
}

export function rankingRows(page: Page): Locator {
  return page.getByRole("list", { name: "Ranking dos leitores" }).getByRole("listitem");
}

export function spotlightCard(page: Page): Locator {
  return page.getByRole("region", { name: "Persona em destaque" });
}

/** The meter's drawing, named after its reading, like "Aplausômetro: 62 de 100". */
export function meter(page: Page): Locator {
  return page.getByRole("img", { name: /^Aplausômetro: / });
}

/** Writes a post on an open page and waits until the whole audience has answered. */
export async function evaluate(page: Page, post = POST): Promise<void> {
  await writePost(page, post);
  await expect(rankingRows(page)).toHaveCount(RANKED_COUNT);
}

export async function evaluatePost(page: Page): Promise<void> {
  await page.goto("/");
  await evaluate(page);
}

export function countAudienceCalls(page: Page): () => number {
  let calls = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/audience")) calls += 1;
  });
  return () => calls;
}

/** Lets the page draw this many frames, for what should or should not move meanwhile. */
export async function waitFrames(page: Page, frames: number): Promise<void> {
  await page.evaluate(
    (count) =>
      new Promise<void>((resolve) => {
        let left = count;
        const next = () => {
          left -= 1;
          if (left <= 0) resolve();
          else requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      }),
    frames,
  );
}
