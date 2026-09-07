import { test, expect } from "@playwright/test";

test("whatsapp widget toggles open", async ({ page }) => {
  await page.goto("/");
  // The panel text (wa.name) should be hidden initially
  const panel = page.getByText(/Dimonova team|Equipo Dimonova/i);
  await expect(panel).toBeHidden();
  // Click the floating launcher button (aria-label="WhatsApp")
  await page.getByRole("button", { name: /whatsapp/i }).first().click();
  await expect(panel).toBeVisible();
});
