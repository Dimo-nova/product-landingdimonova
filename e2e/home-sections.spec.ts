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
