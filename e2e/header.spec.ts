import { test, expect } from "@playwright/test";

test.describe("desktop header", () => {
  test("mega menu opens on hover and lists the 8 services", async ({ page }) => {
    await page.goto("/");
    const products = page.getByRole("button", { name: "Products" });
    await products.hover();
    const panel = page.locator("#mega-products");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link")).toHaveCount(8);
    await expect(panel.getByRole("link", { name: /Digital menu/ })).toHaveAttribute("href", "/features#menu");
    await expect(products).toHaveAttribute("aria-expanded", "true");
  });

  test("mega menu opens with keyboard and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const clients = page.getByRole("button", { name: "Clients" });
    await clients.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#mega-clients")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mega-clients")).toBeHidden();
    await expect(clients).toBeFocused();
  });

  test("direct links and CTAs", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    await expect(page.getByRole("link", { name: "Client login" })).toHaveAttribute("href", "https://menuadmin.dimonova.com");
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

  test("language switch changes URL locale", async ({ page }) => {
    await page.goto("/");
    await page.locator('button[aria-label="Choose language"]').click();
    await page.locator("[data-lang='es']").first().click();
    await expect(page).toHaveURL(/\/es(\/|$)/);
  });
});

test.describe("mobile header", () => {
  test.use({ viewport: { width: 480, height: 900 } });

  test("hamburger opens a panel with accordions", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    await page.getByRole("button", { name: "Open menu" }).click();
    const panel = page.getByRole("dialog", { name: "Menu" });
    await expect(panel).toBeVisible();
    await panel.getByRole("button", { name: "Products" }).click();
    await expect(panel.getByRole("link", { name: /Digital menu/ })).toBeVisible();
    await panel.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL("/pricing");
  });
});
