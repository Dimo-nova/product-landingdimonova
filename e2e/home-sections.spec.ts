import { test, expect } from "@playwright/test";

test("the eight service cards link to their feature anchors", async ({ page }) => {
  await page.goto("/");
  const grid = page.locator("#services");
  const cards = grid.getByRole("link");
  await expect(cards).toHaveCount(8);
  await expect(grid.getByRole("link", { name: /Digital menu/ })).toHaveAttribute("href", "/features#menu");
  await expect(grid.getByRole("link", { name: /Smart reviews/ })).toHaveAttribute("href", "/features#reviews");
});

test("no card claims that bad reviews are withheld from Google", async ({ page }) => {
  await page.goto("/");
  const text = (await page.locator("#services").innerText()).toLowerCase();
  expect(text).not.toContain("bad ones come to you first");
  expect(text).toContain("every review still reaches google");
});

test("the logo strip renders each client logo once for assistive tech", async ({ page }) => {
  await page.goto("/");
  const strip = page.locator("[data-logo-strip]");
  // getByAltText matches plain DOM attributes and counts both the visible and the
  // aria-hidden marquee duplicate (2). getByRole consults the accessibility tree, where
  // Marquee's aria-hidden="true" duplicate group is pruned, so it correctly counts 1.
  await expect(strip.getByRole("img", { name: "Bálamo" })).toHaveCount(1);
});

test("the AI section cycles its tabs and applies a change", async ({ page }) => {
  await page.goto("/#ai");
  const demo = page.locator("[data-ai-demo]");
  await expect(demo).toBeVisible();
  const tabs = demo.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(demo).toContainText("Translate the menu into German");
});

test("the AI tabs are fully operable with the keyboard", async ({ page }) => {
  await page.goto("/");
  const tabs = page.locator("[data-ai-demo]").getByRole("tab");
  await tabs.first().focus();
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.nth(2)).toBeFocused();
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
});

test("the AI section explains that nothing is written without approval", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#ai")).toContainText("Nothing is written to your menu until someone says yes.");
});

test("the Bálamo case shows the real menu and its five pills", async ({ page }) => {
  await page.goto("/#balamo");
  const s = page.locator("#balamo");
  await expect(s.getByAltText(/Bálamo's digital menu/)).toBeVisible();
  await expect(s.locator("[data-balamo-pill]")).toHaveCount(5);
  await expect(s.getByRole("link", { name: "See the case" })).toHaveAttribute("href", "/cases");
});

test("the home page does not overflow horizontally at a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(overflow).toBe(true);
});
