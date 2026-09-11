import { test, expect } from "@playwright/test";
import en from "../messages/en.json";
import { CONTACT } from "../lib/config";

test("whatsapp widget toggles open", async ({ page }) => {
  await page.goto("/");
  // The panel text (wa.name) should be hidden initially
  const panel = page.getByText(/Dimonova team|Equipo Dimonova/i);
  await expect(panel).toBeHidden();
  // Click the floating launcher button (aria-label="WhatsApp")
  await page.getByRole("button", { name: /whatsapp/i }).first().click();
  await expect(panel).toBeVisible();
});

/**
 * Every link out of the panel carries a pre-filled message: the chip's opener plus one sentence
 * for where the visitor came from (see lib/wa.ts and docs/superpowers/specs/2026-09-11-whatsapp-
 * prefill-design.md). The href is asserted rather than the message text on screen because the
 * text only exists inside the URL.
 */
const msg = en.wa.msg;
const href = (text: string) => `${CONTACT.whatsappIE}?text=${encodeURIComponent(text)}`;

function panel(page: import("@playwright/test").Page) {
  return page.locator("[data-wa-panel]");
}

test("chips and Continue pre-fill the page's context", async ({ page }) => {
  await page.goto("/pricing");
  await page.getByRole("button", { name: /whatsapp/i }).first().click();
  const p = panel(page);
  await expect(p.getByRole("link", { name: msg_chip("pub") })).toHaveAttribute(
    "href",
    href(`${msg.chip.pub} ${msg.ctx.pricing}`),
  );
  await expect(p.getByRole("link", { name: en.wa.continue })).toHaveAttribute(
    "href",
    href(`${msg.hello} ${msg.ctx.pricing}`),
  );
});

test("a service walkthrough opened on the page wins over the route", async ({ page }) => {
  await page.goto("/");
  // The card's button only works once React has hydrated; a click that lands before that is
  // swallowed, so retry until the walkthrough is actually open.
  const cta = page.locator("#services").getByRole("button", { name: "See how it gets set up" }).nth(1);
  await expect(async () => {
    await cta.click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 1000 });
  }).toPass();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByRole("button", { name: /whatsapp/i }).first().click();
  await expect(panel(page).getByRole("link", { name: msg_chip("restaurant") })).toHaveAttribute(
    "href",
    href(`${msg.chip.restaurant} ${msg.ctx.serviceOrdering}`),
  );
});

test("the contact form's success button opens the panel with the sent-form context", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
  );
  await page.goto("/contact");
  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/venue name/i).fill("The Test Pub");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.locator("#contact-consent").check();
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();
  await page.getByRole("button", { name: en.contact.success.wa }).click();

  await expect(panel(page).getByRole("link", { name: en.wa.continue })).toHaveAttribute(
    "href",
    href(`${msg.hello} ${msg.ctx.formSent}`),
  );
});

test("the contact form's error fallback links straight out with the failed-form context", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "email_error" }) }),
  );
  await page.goto("/contact");
  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/venue name/i).fill("The Test Pub");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.locator("#contact-consent").check();
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();

  await expect(page.getByRole("alert").getByRole("link", { name: en.modal.demo.whatsapp })).toHaveAttribute(
    "href",
    href(`${msg.hello} ${msg.ctx.formFailed}`),
  );
});

function msg_chip(chip: "restaurant" | "pub" | "cafe") {
  return en.wa[`chip_${chip}` as const];
}
