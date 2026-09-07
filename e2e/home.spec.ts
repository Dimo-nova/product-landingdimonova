import { test, expect } from "@playwright/test";
import en from "../messages/en.json";
import es from "../messages/es.json";

/** The live headline is rendered via t.rich with a <mark> wrapper around one word (see
 *  components/home/Hero.tsx / Annotated). Strip the tag to get the plain text a11y tree exposes. */
const stripMark = (title: string) => title.replace(/<\/?mark>/g, "");

test("home hero heading renders the current headline", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 }).first();
  await expect(h1).toContainText(stripMark(en.home.hero.title));
});

test("home shows venue logo strip with La Pulpería", async ({ page }) => {
  await page.goto("/");
  // getByRole consults the accessibility tree, where Marquee's aria-hidden duplicate
  // group is pruned, so this resolves to a single (visible) match.
  await expect(page.getByRole("img", { name: "La Pulpería" })).toBeVisible();
});

test("/es renders the hero in Spanish", async ({ page }) => {
  await page.goto("/es");
  const h1 = page.getByRole("heading", { level: 1 }).first();
  await expect(h1).toContainText(stripMark(es.home.hero.title));
});
