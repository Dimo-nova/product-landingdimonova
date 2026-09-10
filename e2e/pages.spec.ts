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

// Features: /features is now a short index of the three services, and each service has a real
// page of its own at /features/<slug> (app/[locale]/features/[slug]/page.tsx). The eight
// #menu/#ai/#ordering/... scroll anchors that used to live on one long page are gone with the
// four-block tour they belonged to — lib/services.ts links to the pages now, not to anchors.
const SERVICE_SLUGS = ["menu", "ordering", "reviews"];

test("features page has exactly one h1", async ({ page }) => {
  await page.goto("/features");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("the features index links to each of the three service pages", async ({ page }) => {
  await page.goto("/features");
  // Scoped to the service links: <main> also holds the closing CTA's WhatsApp link, so counting
  // every link here would break whenever that band gains or loses one.
  const cards = page.locator('main a[href^="/features/"]');
  await expect(cards).toHaveCount(SERVICE_SLUGS.length);
  for (const slug of SERVICE_SLUGS) {
    await expect(page.locator(`main a[href="/features/${slug}"]`)).toHaveCount(1);
  }
});

test("every service page renders, in both locales", async ({ page }) => {
  for (const prefix of ["", "/es"]) {
    for (const slug of SERVICE_SLUGS) {
      const response = await page.goto(`${prefix}/features/${slug}`);
      expect(response?.status(), `${prefix}/features/${slug} did not respond 200`).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    }
  }
});

test("an unknown service slug 404s", async ({ page }) => {
  const response = await page.goto("/features/nope");
  expect(response?.status()).toBe(404);
});

test("each service page's hero CTA opens the demo modal", async ({ page }) => {
  for (const slug of SERVICE_SLUGS) {
    await page.goto(`/features/${slug}`);
    // Scoped to <main>: the header carries its own, differently-labelled "Request a demo" button,
    // and the page's closing PageCta band repeats this one.
    await page.locator("main").getByRole("button", { name: "Request a demo →" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
  }
});

test("the ordering page attributes the ticket figures to Square and links the source", async ({ page }) => {
  await page.goto("/features/ordering");
  const main = page.locator("main");
  await expect(main).toContainText("Square");
  const source = main.getByRole("link", { name: /Square/ });
  await expect(source).toHaveAttribute("href", /squareup\.com/);
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(source).toHaveAttribute("rel", /noopener/);
});

// The review product is not review gating and must never be described as one: every rating
// reaches Google, and the only difference for a low one is that the reason is collected first.
// This locks both halves of that promise, in both locales.
const REVIEWS_PROMISE = [
  { path: "/features/reviews", phrases: ["this is not review gating", "reaches google"] },
  { path: "/es/features/reviews", phrases: ["esto no es filtrar reseñas", "llega a google"] },
];

for (const { path, phrases } of REVIEWS_PROMISE) {
  test(`${path} states that every rating still reaches Google`, async ({ page }) => {
    await page.goto(path);
    const text = (await page.locator("main").innerText()).toLowerCase();
    for (const phrase of phrases) {
      expect(text, `"${phrase}" is missing from ${path}`).toContain(phrase);
    }
  });
}

test("the features index closing CTA opens the demo modal", async ({ page }) => {
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
// hero now carries the first client's story video, played in place rather than in a modal.

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

test("the about page hero plays the story video in place, and only on request", async ({ page }) => {
  await page.goto("/about");
  const play = page.locator("main").getByRole("button", { name: /How Dimonova started/i });
  await expect(play).toBeVisible();
  // Nothing is mounted up front: the .mp4 lives on Supabase, so a <video> in the initial DOM
  // would mean a third-party request on page load.
  await expect(page.locator("main video")).toHaveCount(0);
  await play.click();
  await expect(page.locator("main video")).toHaveCount(1);
  // In place, not in a modal.
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the about page closing CTA opens the demo modal", async ({ page }) => {
  await page.goto("/about");
  await page.locator("main").getByRole("button", { name: "Request a demo →" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
