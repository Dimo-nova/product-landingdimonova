import { test, expect } from "@playwright/test";

test("design tokens and fonts are applied on :root", async ({ page }) => {
  await page.goto("/");
  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      brand: cs.getPropertyValue("--brand").trim(),
      ink: cs.getPropertyValue("--ink").trim(),
      display: cs.getPropertyValue("--font-display").trim(),
      body: cs.getPropertyValue("--font-body").trim(),
    };
  });
  expect(tokens.brand.toUpperCase()).toBe("#FE5243");
  expect(tokens.ink.toUpperCase()).toBe("#0F0E0D");
  expect(tokens.display).toMatch(/Bricolage/i);
  expect(tokens.body).toMatch(/Instrument/i);
});
