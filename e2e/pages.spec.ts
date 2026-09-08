import { test, expect } from "@playwright/test";

const pages = ["features", "pricing", "about"];
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

// Pricing page: the footer, the mega menu and the mobile nav's Resources section all link to
// /pricing#faq. That anchor must resolve, or the link scrolls nowhere.

test("pricing page has exactly one h1", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("the /pricing#faq anchor resolves to an element", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.locator("#faq")).toHaveCount(1);
});

test("the pricing FAQ reveals a question's answer on click, with no JavaScript required", async ({ page }) => {
  await page.goto("/pricing");
  const first = page.locator("main details").first();
  const answer = first.locator("p");
  await expect(answer).toBeHidden();
  await first.locator("summary").click();
  await expect(answer).toBeVisible();
});

// Cases page: hidden on purpose (see app/[locale]/cases/page.tsx, CASES_PUBLISHED) until real
// case studies exist, per commit 514d840. The page underneath is rebuilt on the new design
// system but every venue in it is an invented placeholder, so this route must keep redirecting
// home rather than rendering its content.

test("the cases page is not published yet and redirects home", async ({ page }) => {
  await page.goto("/cases");
  await expect(page).toHaveURL("/");
  await page.goto("/es/cases");
  await expect(page).toHaveURL("/es");
});

// About page: the team section keeps its two real headshots (with descriptive alt text) plus
// two placeholder cards (see TODO.md), and the hero must not grow a dead-end video control —
// the spec calls for the first client's video here, but that clip doesn't exist yet.

test("about page has exactly one h1", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("the two real headshots on the about page keep descriptive alt text (name plus role)", async ({ page }) => {
  await page.goto("/about");
  const alts = await page.locator("main img").evaluateAll((els) => els.map((el) => el.getAttribute("alt") ?? ""));
  expect(alts.length).toBeGreaterThanOrEqual(2);
  for (const alt of alts) {
    expect(alt.trim().length, `alt text too short: "${alt}"`).toBeGreaterThan(10);
  }
});

test("the about page shows the two real founders and no placeholder people", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByAltText(/Pablo, co-owner/)).toBeVisible();
  await expect(page.getByAltText(/Sergio, co-owner/)).toBeVisible();
  await expect(page.getByText("Name placeholder")).toHaveCount(0);
});

test("the about page hero has no dead-end video control", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("main video")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /play/i })).toHaveCount(0);
});

test("the about page closing CTA opens the demo modal", async ({ page }) => {
  await page.goto("/about");
  await page.locator("main").getByRole("button", { name: "Request a demo →" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
