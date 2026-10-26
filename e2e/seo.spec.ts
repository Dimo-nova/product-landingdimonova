import { test, expect } from "@playwright/test";

test("home page has title with Dimonova", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Dimonova/i);
});

test("/sitemap.xml returns 200", async ({ page }) => {
  const res = await page.goto("/sitemap.xml");
  expect(res?.status()).toBe(200);
});

test("/robots.txt returns 200 and contains dimonova.com", async ({ page }) => {
  const res = await page.goto("/robots.txt");
  expect(res?.status()).toBe(200);
  const body = await page.content();
  expect(body).toContain("dimonova.com");
});

test("Spanish home has hreflang links", async ({ page }) => {
  await page.goto("/es");
  const hreflang = page.locator('link[rel="alternate"][hreflang]');
  await expect(hreflang.first()).toBeAttached();
});

// The production domain answers on www; the bare dimonova.com 307s there. Every absolute URL the
// site hands to crawlers must be the www one, or it points them at a redirect instead of the page
// (SITE_URL in lib/config.ts). Written out in full here, not imported, so a change to the
// constant has to be a deliberate change to this test too.
const ORIGIN = "https://www.dimonova.com";

test("canonical, hreflang and og:image URLs use the www origin", async ({ page }) => {
  await page.goto("/es/pricing");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${ORIGIN}/es/pricing`);
  const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) =>
    els.map((el) => [el.getAttribute("hreflang"), el.getAttribute("href")]),
  );
  expect(Object.fromEntries(alternates)).toEqual({
    en: `${ORIGIN}/pricing`,
    es: `${ORIGIN}/es/pricing`,
    de: `${ORIGIN}/de/pricing`,
    fr: `${ORIGIN}/fr/pricing`,
    pt: `${ORIGIN}/pt/pricing`,
    "x-default": `${ORIGIN}/pricing`,
  });
  // og:image is relative in lib/meta.ts and resolved against metadataBase.
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `${ORIGIN}/og.png`);
});

test("every sitemap URL and the robots.txt sitemap line use the www origin", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(locs.length).toBeGreaterThan(0);
  expect(locs.filter((u) => !u.startsWith(`${ORIGIN}/`))).toEqual([]);

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
});
