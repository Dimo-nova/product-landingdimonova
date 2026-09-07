import { test, expect } from "@playwright/test";

test("footer has 5 columns, service links, legal links and the wordmark", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("heading", { level: 2 })).toHaveCount(5);
  await expect(footer.getByRole("link", { name: "Digital menu" })).toHaveAttribute("href", "/features#menu");
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/legal/privacy");
  await expect(footer.getByRole("link", { name: "WhatsApp Spain" })).toHaveAttribute("href", /wa\.me\/34/);
  const mark = footer.locator("[data-wordmark]");
  await expect(mark).toBeVisible();
  await expect(mark).toHaveAttribute("src", "/assets/logo_horizontal.svg");
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Dimonova`);
});

test("legal placeholder pages render in both locales", async ({ page }) => {
  await page.goto("/legal/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy policy");
  await page.goto("/es/legal/cookies");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Política de cookies");
  expect((await page.goto("/legal/nope"))?.status()).toBe(404);
});

test("footer language switcher options are readable when opened", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await footer.locator('button[aria-label="Choose language"]').click();
  const option = footer.locator("[data-lang='es']");
  await expect(option).toBeVisible();
  const { color, bg } = await option.evaluate((el) => {
    const cs = getComputedStyle(el);
    const menu = getComputedStyle(el.parentElement as Element);
    return { color: cs.color, bg: menu.backgroundColor };
  });
  expect(color).not.toBe(bg);
  expect(color).not.toBe("rgb(255, 255, 255)");

  const box = await option.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);
});
