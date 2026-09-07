import { test, expect } from "@playwright/test";

test("unknown EN route renders the localized 404 inside the shell", async ({ page }) => {
  const res = await page.goto("/this-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This dish isn't on the menu.");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
});

test("unknown ES route renders Spanish 404 and the demo button opens the modal", async ({ page }) => {
  const res = await page.goto("/es/esto-no-existe");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Este plato no está en la carta.");
  await page.getByRole("button", { name: "Pedir demo" }).click();
  await expect(page.getByRole("dialog", { name: "Pide tu demo" })).toBeVisible();
});
