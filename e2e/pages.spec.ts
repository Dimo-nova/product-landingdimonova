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
// those anchors must resolve to a real element on this page, or the link scrolls nowhere — and
// that element's scroll-margin-top must clear the sticky header, or the target lands hidden
// behind it (see app/[locale]/features/page.module.css .anchor).
const FEATURES_ANCHORS = ["menu", "ai", "ordering", "training", "multi", "reviews", "daily", "translate"];

test("features page has exactly one h1", async ({ page }) => {
  await page.goto("/features");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("all eight /features anchors resolve to an element clear of the sticky header", async ({ page }) => {
  for (const anchor of FEATURES_ANCHORS) {
    await page.goto(`/features#${anchor}`);
    const headerBox = await page.getByRole("banner").boundingBox();
    const target = page.locator(`#${anchor}`);
    await expect(target).toHaveCount(1);
    const box = await target.boundingBox();
    expect(box, `#${anchor} has no box`).not.toBeNull();
    expect(box!.y, `#${anchor} lands under the sticky header`).toBeGreaterThanOrEqual(headerBox!.height - 2);
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

// Cases page: published (CASES_PUBLISHED is true in lib/config.ts) now that the owner supplied
// three real case studies. Every placeholder venue, the "example" disclaimer and the invented
// stats are gone — the page names the three real clients and nothing else. If a venue name ever
// disappears from these assertions, the copy has drifted back towards placeholders.
const CASE_VENUES = ["Calsot", "La Pulpería", "Bálamo"];

test("the cases page renders with exactly one h1", async ({ page }) => {
  await page.goto("/cases");
  await expect(page).toHaveURL("/cases");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("the cases page names the three real venues, in both locales", async ({ page }) => {
  for (const path of ["/cases", "/es/cases"]) {
    await page.goto(path);
    for (const venue of CASE_VENUES) {
      await expect(page.locator("main").getByRole("heading", { name: venue, exact: true })).toBeVisible();
    }
  }
});

test("the cases page carries no placeholder copy", async ({ page }) => {
  await page.goto("/cases");
  const text = (await page.locator("main").innerText()).toLowerCase();
  for (const word of ["placeholder", "tbd", "venue name"]) {
    expect(text, `"${word}" is still on the cases page`).not.toContain(word);
  }
});

test("each case reads before, what we did, result", async ({ page }) => {
  await page.goto("/cases");
  for (const label of ["Before", "What we did", "Result"]) {
    await expect(page.locator("main").getByRole("heading", { name: label, exact: true })).toHaveCount(CASE_VENUES.length);
  }
});

// About page: the team section (two real headshots, Pablo and Sergio) is rebuilt on the current
// design system but stays hidden behind TEAM_PUBLISHED in app/[locale]/about/page.tsx — the
// owner turned it off in commit 249fec2 and this phase must not silently turn it back on. The
// hero also must not grow a dead-end video control — the spec calls for the first client's video
// here, but that clip doesn't exist yet.

test("about page has exactly one h1", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("the about page team section stays hidden behind TEAM_PUBLISHED", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "The people you'll actually talk to." })).toHaveCount(0);
  await expect(page.getByAltText(/Pablo, co-owner/)).toHaveCount(0);
  await expect(page.getByAltText(/Sergio, co-owner/)).toHaveCount(0);
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
