import { test, expect } from "@playwright/test";

test.describe("desktop header", () => {
  test("mega menu opens on hover and lists the three services", async ({ page }) => {
    await page.goto("/");
    const products = page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Features" });
    await products.hover();
    const panel = page.locator("#mega-products");
    await expect(panel).toBeVisible();
    // The service pages are unpublished (FEATURES_PUBLISHED in lib/config.ts), so the three
    // entries are buttons that open the service walkthrough, not links to /features/<slug>.
    await expect(panel.getByRole("button")).toHaveCount(3);
    await expect(panel.getByRole("button", { name: /Digital menu/ })).toBeVisible();
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
    // Contact is a top-level link now, not an entry hidden inside the Resources panel.
    await expect(nav.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    await expect(page.getByRole("banner").getByRole("link", { name: "Client login" })).toHaveAttribute("href", "https://menuadmin.dimonova.com");
    await page.getByRole("banner").getByRole("button", { name: "Request a demo" }).click();
    await expect(page.getByRole("dialog", { name: "Book your demo" })).toBeVisible();
  });

  test("client-side navigation lands at the very top, not under the sticky header", async ({ page }) => {
    // Next's layout router focuses the new page's <main tabIndex=-1> after every client
    // navigation. Chrome scrolls a focused element that is taller than the viewport so its top
    // edge sits at the viewport top — 88px down, past the sticky header — unless `main`
    // carries a matching scroll-margin-top. The visible symptom was a small jump on the home
    // hero when arriving from any other page or switching language.
    await page.goto("/contact");
    await page.getByRole("banner").getByRole("link", { name: "Dimonova" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main")).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("switching language lands at the very top too", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").locator('button[aria-label="Choose language"]').click();
    await page.locator('[data-lang="es"]').click();
    await expect(page).toHaveURL(/\/es(\/|$)/);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
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
    // Tab through every entry in the panel (links while the service pages are published, buttons
    // opening the walkthrough while they are not) and out the other side.
    const links = await page.locator("#mega-products a, #mega-products button").count();
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
    await expect(panel.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    await panel.getByRole("button", { name: "Features" }).click();
    // A button, not a link: the service pages are unpublished (FEATURES_PUBLISHED).
    await expect(panel.getByRole("button", { name: /Digital menu/ })).toBeVisible();
    await panel.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL("/pricing");
  });

  // The panel used to close only when the pathname changed, so a link that stays on the current
  // page (a hash on the page you are on, the page's own nav entry, a language switch, whose
  // locale-less pathname is identical) left it open over the page with the body scroll locked.
  test("mobile panel closes on a link that stays on the current page", async ({ page }) => {
    await page.goto("/");
    const panel = page.getByRole("dialog", { name: "Menu" });
    await expect(async () => {
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(panel).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
    await panel.getByRole("button", { name: "Resources" }).click();
    await panel.getByRole("link", { name: /Compare with/ }).click();
    await expect(panel).toBeHidden();
    await expect(page).toHaveURL(/#ai-compare$/);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");

    // Same page, no hash: the current page's own entry.
    await page.goto("/pricing");
    await expect(async () => {
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(panel).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
    await panel.getByRole("link", { name: "Pricing" }).click();
    await expect(panel).toBeHidden();
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
