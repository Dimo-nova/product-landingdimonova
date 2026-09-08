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

test("the play pill opens the story video", async ({ page }) => {
  // HERO_VIDEO_SRC (lib/config.ts) now points at the first client's story video on the
  // project's Supabase media bucket, so Hero.tsx renders the pill again. The video itself is
  // never requested until this button is pressed, which is what keeps the page free of
  // third-party requests on load (see e2e/tokens.spec.ts).
  await page.goto("/");
  const pill = page.getByRole("button", { name: /How Dimonova started/ });
  await expect(pill).toBeVisible();
  await pill.click();
  await expect(page.getByRole("dialog")).toBeVisible();
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
