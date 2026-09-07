import { test, expect } from "@playwright/test";

test("design tokens and next/font variables are applied on :root", async ({ page }) => {
  await page.goto("/");
  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      brand: cs.getPropertyValue("--brand").trim(),
      ink: cs.getPropertyValue("--ink").trim(),
    };
  });
  expect(tokens.brand.toUpperCase()).toBe("#FE5243");
  expect(tokens.ink.toUpperCase()).toBe("#0F0E0D");

  const fonts = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      bricolageVar: cs.getPropertyValue("--font-bricolage").trim(),
      instrumentVar: cs.getPropertyValue("--font-instrument").trim(),
      bodyFamily: getComputedStyle(document.body).fontFamily,
    };
  });
  // next/font defines these variables only when the generated class is on <html>.
  expect(fonts.bricolageVar).not.toBe("");
  expect(fonts.instrumentVar).not.toBe("");
  expect(fonts.bodyFamily).toMatch(/Instrument/i);
});

test("no third-party font requests", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => { const u = new URL(r.url()); if (u.host !== "localhost:3100") external.push(r.url()); });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
});
