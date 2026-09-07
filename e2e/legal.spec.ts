import { test, expect } from "@playwright/test";

const SLUGS = ["privacy", "terms", "cookies"] as const;

const TITLES: Record<(typeof SLUGS)[number], { en: string; es: string }> = {
  privacy: { en: "Privacy policy", es: "Política de privacidad" },
  terms: { en: "Legal notice and terms of use", es: "Aviso legal y condiciones de uso" },
  cookies: { en: "Cookie policy", es: "Política de cookies" },
};

for (const slug of SLUGS) {
  test(`/legal/${slug} renders in English`, async ({ page }) => {
    const res = await page.goto(`/legal/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(TITLES[slug].en);
    const h2Count = await page.getByRole("heading", { level: 2 }).count();
    expect(h2Count).toBeGreaterThanOrEqual(4);
  });

  test(`/es/legal/${slug} renders in Spanish`, async ({ page }) => {
    const res = await page.goto(`/es/legal/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(TITLES[slug].es);
    const h2Count = await page.getByRole("heading", { level: 2 }).count();
    expect(h2Count).toBeGreaterThanOrEqual(4);
  });
}

test("/legal/nope returns 404", async ({ page }) => {
  expect((await page.goto("/legal/nope"))?.status()).toBe(404);
});

test("Spanish privacy page references the AEPD", async ({ page }) => {
  await page.goto("/es/legal/privacy");
  await expect(page.locator("main")).toContainText("AEPD");
});

test("English privacy page mentions Standard Contractual Clauses", async ({ page }) => {
  await page.goto("/legal/privacy");
  await expect(page.locator("main")).toContainText("Standard Contractual Clauses");
});

test("footer legal column links to all three documents", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/legal/privacy");
  await expect(footer.getByRole("link", { name: "Cookies" })).toHaveAttribute("href", "/legal/cookies");
  await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/legal/terms");
});

test("footer shows the business-identity line", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-business-details]")).toBeVisible();
});

test("cookie policy names both cookies", async ({ page }) => {
  await page.goto("/legal/cookies");
  const body = page.locator("main");
  await expect(body).toContainText("NEXT_LOCALE");
  await expect(body).toContainText("dim-lang-dismissed");
});

test("privacy page tables do not cause horizontal page overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/legal/privacy");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(overflow).toBe(true);
});
