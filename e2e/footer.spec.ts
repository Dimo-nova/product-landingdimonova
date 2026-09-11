import { test, expect } from "@playwright/test";

test("footer has 5 columns, service links, legal links and the wordmark", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("heading", { level: 2 })).toHaveCount(5);
  // Unpublished service pages (FEATURES_PUBLISHED): the entry is a button opening the walkthrough.
  await expect(footer.getByRole("button", { name: "Digital menu" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/legal/privacy");
  await expect(footer.getByRole("link", { name: "WhatsApp Spain" })).toHaveAttribute("href", /wa\.me\/34/);
  const mark = footer.locator("[data-wordmark]");
  await expect(mark).toBeVisible();
  await expect(mark).toHaveAttribute("src", "/assets/logo_horizontal.svg");
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Dimonova`);
});

function contrast(fg: string, bg: string): number {
  const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const lum = (rgb: number[]) =>
    0.2126 * chan(rgb[0]) + 0.7152 * chan(rgb[1]) + 0.0722 * chan(rgb[2]);
  const chan = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const a = lum(parse(fg)), b = lum(parse(bg));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

test("footer language switcher options are readable when opened", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await footer.locator('button[aria-label="Choose language"]').click();

  const locales = ["en", "es", "de", "fr", "pt"];
  for (const lang of locales) {
    const option = footer.locator(`[data-lang='${lang}']`);
    await expect(option).toBeVisible();
    const { color, bg } = await option.evaluate((el) => {
      const cs = getComputedStyle(el);
      const menu = getComputedStyle(el.parentElement as Element);
      return { color: cs.color, bg: menu.backgroundColor };
    });

    // Check bounding box
    const box = await option.boundingBox();
    expect(box, `${lang}: bounding box exists`).not.toBeNull();
    expect(box!.width, `${lang}: bounding box width > 0`).toBeGreaterThan(0);
    expect(box!.height, `${lang}: bounding box height > 0`).toBeGreaterThan(0);

    // Check contrast ratio
    const ratio = contrast(color, bg);
    expect(ratio, `${lang}: contrast ratio ${ratio.toFixed(2)} >= 4.5`).toBeGreaterThanOrEqual(4.5);

    // Verify no alpha < 1 (fully opaque)
    const hasAlpha = color.includes("/") && parseFloat(color.split("/")[1]) < 1;
    expect(hasAlpha, `${lang}: color should be fully opaque`).toBe(false);
  }
});

test("clicking the footer email copies it and says so, without leaving the page", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const footer = page.locator("footer");
  const email = footer.getByRole("link", { name: "pablo@dimonova.com" });
  await expect(email).toHaveAttribute("href", "mailto:pablo@dimonova.com");
  await email.click();
  await expect(footer.getByRole("status")).toHaveText("Copied to clipboard!");
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pablo@dimonova.com");
});
