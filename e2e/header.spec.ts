import { test, expect } from "@playwright/test";

test.describe("desktop header", () => {
  test("mega menu opens on hover and lists the three services", async ({ page }) => {
    await page.goto("/");
    const products = page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Features" });
    await products.hover();
    const panel = page.locator("#mega-products");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link")).toHaveCount(3);
    await expect(panel.getByRole("link", { name: /Digital menu/ })).toHaveAttribute("href", "/features/menu");
    await expect(products).toHaveAttribute("aria-expanded", "true");
  });

  test("mega menu opens with keyboard and closes with Escape", async ({ page }) => {
    await page.goto("/");
    // "Resources" rather than "Clients": Clients is now a plain link to /clients, not a mega
    // trigger, so it has no panel to open (see the comment in components/layout/MegaMenu.tsx).
    const resources = page.getByRole("button", { name: "Resources" });
    await resources.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#mega-resources")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mega-resources")).toBeHidden();
    await expect(resources).toBeFocused();
  });

  test("direct links and CTAs", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    await expect(page.getByRole("banner").getByRole("link", { name: "Client login" })).toHaveAttribute("href", "https://menuadmin.dimonova.com");
    await page.getByRole("banner").getByRole("button", { name: "Request a demo" }).click();
    await expect(page.getByRole("dialog", { name: "Book your demo" })).toBeVisible();
  });

  test("compacts on scroll", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(header).toHaveAttribute("data-scrolled", "true");
  });

  test("compaction is stable inside the threshold band", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await page.evaluate(() => window.scrollTo(0, 30));
    await page.waitForTimeout(300);
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);
    await expect(header).toHaveAttribute("data-scrolled", "true");
    await page.evaluate(() => window.scrollTo(0, 40));
    await page.waitForTimeout(300);
    await expect(header).toHaveAttribute("data-scrolled", "true"); // stays compact until < 24
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await expect(header).toHaveAttribute("data-scrolled", "false");
  });

  test("mega menu closes when focus leaves it", async ({ page }) => {
    await page.goto("/");
    const products = page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Features" });
    await products.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#mega-products")).toBeVisible();
    // Tab through every link in the panel and out the other side
    const links = await page.locator("#mega-products a").count();
    for (let i = 0; i < links + 2; i++) await page.keyboard.press("Tab");
    await expect(page.locator("#mega-products")).toBeHidden();
  });

  test("language switch changes URL locale", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.locator('button[aria-label="Choose language"]').click();
    await header.locator("[data-lang='es']").click();
    await expect(page).toHaveURL(/\/es(\/|$)/);
  });

  test("language dropdown options are readable (header)", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.locator('button[aria-label="Choose language"]').click();
    const option = header.locator("[data-lang='es']");
    await expect(option).toBeVisible();
    const { color, bg } = await option.evaluate((el) => {
      const cs = getComputedStyle(el);
      const menu = getComputedStyle(el.parentElement as Element);
      return { color: cs.color, bg: menu.backgroundColor };
    });
    // Simple contrast check: verify color is not the same as background
    expect(color).not.toBe(bg);
  });
});

test.describe("mobile header", () => {
  test.use({ viewport: { width: 480, height: 900 } });

  test("hamburger opens a panel with accordions", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    const panel = page.getByRole("dialog", { name: "Menu" });
    // The toggle is in the server HTML before React attaches its handler, so under parallel
    // load a click can land before hydration and be swallowed. Retry until the panel opens.
    await expect(async () => {
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(panel).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
    await panel.getByRole("button", { name: "Features" }).click();
    await expect(panel.getByRole("link", { name: /Digital menu/ })).toBeVisible();
    await panel.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL("/pricing");
  });

  test("mobile panel traps focus and restores it on Escape", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    const panel = page.getByRole("dialog", { name: "Menu" });
    // Same hydration race as above: retry the click until the panel is actually open.
    await expect(async () => {
      await toggle.click();
      await expect(panel).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
    await expect(panel.getByRole("button", { name: "Close menu" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    const inside = await page.evaluate(() => !!document.activeElement?.closest('[role=dialog][aria-label="Menu"]'));
    expect(inside).toBe(true);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});
