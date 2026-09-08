import { test, expect } from "@playwright/test";
import en from "../messages/en.json";
import es from "../messages/es.json";

/** The live headline is rendered via t.rich with a <mark> wrapper around one word (see
 *  components/home/Hero.tsx / Annotated). Strip the tag to get the plain text a11y tree exposes. */
// The headline copy carries two markup tags that Hero.tsx turns into elements, neither of
// which contributes text: <mark> for the drawn annotation and <line> for a forced line break
// (Spanish only). Both come out here so the assertion compares words to words.
const stripTags = (title: string) => title.replace(/<\/?(?:mark|line)>/g, "");

test("home hero heading renders the current headline", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 }).first();
  await expect(h1).toContainText(stripTags(en.home.hero.title));
});

test("home shows venue logo strip with La Pulpería", async ({ page }) => {
  await page.goto("/");
  // Scoped to the strip: the venue's name is also the accessible name of its review card's
  // poster further down the page, so an unscoped role query matches more than one image.
  // Within the strip, getByRole still resolves to exactly one match, because it consults the
  // accessibility tree and Marquee's repeated copies are all aria-hidden and inert.
  const strip = page.locator("[data-logo-strip]");
  await expect(strip.getByRole("img", { name: "La Pulpería" })).toBeVisible();
});

test("/es renders the hero in Spanish", async ({ page }) => {
  await page.goto("/es");
  const h1 = page.getByRole("heading", { level: 1 }).first();
  await expect(h1).toContainText(stripTags(es.home.hero.title));
});

test("home renders all nine sections, in order, with no legacy markup on <main>", async ({ page }) => {
  await page.goto("/");
  const main = page.locator("main#main");

  // The rebuild replaced every legacy section; `dim-legacy` (and any other `dim-*` class) must
  // be gone from the home's own <main>. (Some `.dim-*` utility classes may still exist globally
  // in globals.css until the other pages are migrated — this only asserts the home page itself.)
  const mainClass = (await main.getAttribute("class")) ?? "";
  expect(mainClass).not.toMatch(/dim-/);

  // Hero has no stable id/data anchor (out of scope for this task) — its heading is checked by
  // the tests above — so the other eight sections are asserted by their real anchors, and the
  // total <section> count confirms Hero is still the ninth.
  const anchors = [
    "[data-logo-strip]", // LogoStrip
    "#services", // ServiceCards
    "#ai", // AiPanel
    "#balamo", // BalamoShowcase
    "[data-diff]", // DifferentiatorBand
    "#reviews", // Reviews
    "#ai-compare", // AiCompare
    "#final-cta", // FinalCta
  ];
  for (const selector of anchors) {
    await expect(main.locator(selector)).toBeVisible();
  }
  await expect(main.locator("section")).toHaveCount(9);

  // Order matches the brief: Hero, LogoStrip, ServiceCards, AiPanel, BalamoShowcase,
  // DifferentiatorBand, Reviews, AiCompare, FinalCta — FinalCta is the very last section.
  const lastSection = main.locator("section").last();
  await expect(lastSection).toHaveAttribute("id", "final-cta");
});

test("the final CTA sends the email to the demo modal and links to WhatsApp", async ({ page }) => {
  await page.goto("/#final-cta");
  const section = page.locator("#final-cta");
  await expect(section.getByRole("heading", { level: 2 })).toContainText(en.home.finalCta.title);

  const cta = section.getByRole("form").first();
  await cta.getByPlaceholder("Your email").fill("ana@bar.es");
  await cta.getByRole("button", { name: "Book a demo" }).click();
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Email")).toHaveValue("ana@bar.es");

  await expect(section.getByRole("link")).toHaveAttribute("href", "https://wa.me/353852680856");
});

test("/es routes the final CTA's WhatsApp link to the Spanish number", async ({ page }) => {
  await page.goto("/es#final-cta");
  const section = page.locator("#final-cta");
  await expect(section.getByRole("link")).toHaveAttribute("href", "https://wa.me/34622040285");
});
