import { test, expect } from "@playwright/test";

const pages = ["features", "pricing", "cases", "about"];
for (const p of pages) {
  test(`${p} page renders a heading`, async ({ page }) => {
    await page.goto(`/${p}`);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
  test(`${p} page works in spanish`, async ({ page }) => {
    await page.goto(`/es/${p}`);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
}

// Features page: the home page's eight service cards and the header's Resources menu link to
// /features#menu, #ai, #ordering, #training, #multi, #reviews, #daily, #translate. Every one of
// those anchors must resolve to a real element on this page, or the link scrolls nowhere.
const FEATURES_ANCHORS = ["menu", "ai", "ordering", "training", "multi", "reviews", "daily", "translate"];

test("features page has exactly one h1", async ({ page }) => {
  await page.goto("/features");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("all eight /features anchors resolve to an element", async ({ page }) => {
  await page.goto("/features");
  for (const id of FEATURES_ANCHORS) {
    await expect(page.locator(`#${id}`), `#${id} should exist on /features`).toHaveCount(1);
  }
});

test("the three features screenshots have real alt text", async ({ page }) => {
  await page.goto("/features");
  const alts = await page.locator("main img").evaluateAll((els) => els.map((el) => el.getAttribute("alt") ?? ""));
  expect(alts.length).toBeGreaterThanOrEqual(3);
  for (const alt of alts) {
    expect(alt.trim().length, `alt text too short: "${alt}"`).toBeGreaterThan(10);
  }
});

test("the features page closing CTA opens the demo modal", async ({ page }) => {
  await page.goto("/features");
  // Scoped to <main>: the header carries its own, differently-labelled "Request a demo" button.
  await page.locator("main").getByRole("button", { name: "Request a demo →" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
