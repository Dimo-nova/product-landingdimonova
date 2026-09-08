import { test, expect } from "@playwright/test";

test("hero owns the only h1 and annotates the last word", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText("We take care of it.");
  await expect(h1.locator("svg")).toHaveCount(1);
});

test("an invalid email is rejected without opening the modal", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("form", { name: "Book a demo" }).first();
  await cta.getByPlaceholder("Your email").fill("nope");
  await cta.getByRole("button", { name: "Book a demo" }).click();
  await expect(cta.getByText("Enter a valid email")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a valid email opens the demo modal already filled in", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("form", { name: "Book a demo" }).first();
  await cta.getByPlaceholder("Your email").fill("ana@bar.es");
  await cta.getByRole("button", { name: "Book a demo" }).click();
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Email")).toHaveValue("ana@bar.es");
});

test("the play pill is absent while the story video is unset", async ({ page }) => {
  // HeroPlayPill would open a video modal at HERO_VIDEO_SRC (lib/config.ts), which is
  // intentionally `null` until the founder's video is uploaded — a prominent call-to-action
  // that opens a video modal's 404 fallback is worse than no pill at all, so Hero.tsx renders
  // none while it's unset. Flip this back to a click-opens-the-modal assertion once
  // HERO_VIDEO_SRC is set.
  await page.goto("/");
  await expect(page.getByRole("button", { name: /How Dimonova started/ })).toHaveCount(0);
});

test("photo is the default background and ?hero=c switches to the mock", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-hero-bg='photo']")).toHaveCount(1);
  await page.goto("/?hero=c");
  await expect(page.locator("[data-hero-bg='mock']")).toHaveCount(1);
});

test("the client-dashboard link points at the panel", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Already a client/ })).toHaveAttribute("href", "https://menuadmin.dimonova.com");
});

test("the hero photograph is present in the prerendered HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('data-hero-bg="photo"');
  expect(html).toMatch(/hero-stock/);
});
