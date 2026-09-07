import { test, expect } from "@playwright/test";

test.describe("locale banner", () => {
  test.use({ locale: "es-ES" });

  test("shows when browser language differs and switches locale", async ({ page, context }) => {
    // Force EN despite an es-ES browser (simulates a shared /en link).
    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" }]);
    await page.goto("/");
    const banner = page.locator("[data-locale-banner]");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("¿Prefieres leerlo en español?");
    await banner.getByRole("button", { name: "Cambiar" }).click();
    await expect(page).toHaveURL(/\/es(\/|$)/);
    await expect(page.locator("[data-locale-banner]")).toHaveCount(0);
  });

  test("dismiss sets a cookie and the banner stays hidden", async ({ page, context }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", url: "http://localhost:3100" }]);
    await page.goto("/");
    await page.locator("[data-locale-banner]").getByRole("button", { name: "Cerrar" }).click();
    await expect(page.locator("[data-locale-banner]")).toHaveCount(0);
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "dim-lang-dismissed")?.value).toBe("1");
    await page.reload();
    await expect(page.locator("[data-locale-banner]")).toHaveCount(0);
  });
});

test("no banner when browser language matches", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-locale-banner]")).toHaveCount(0);
});
