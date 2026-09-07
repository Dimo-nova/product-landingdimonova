import { test, expect } from "@playwright/test";

// Dispatching the CustomEvent races DemoModal's hydration: if the client component hasn't
// attached its window listener yet, the event is lost for good (unlike a real click, a raw
// window.dispatchEvent isn't replayed by React once hydration finishes). Retry the dispatch
// until the dialog shows up rather than firing once and hoping hydration already happened.
const open = (page: import("@playwright/test").Page, detail: Record<string, string> = {}) =>
  expect(async () => {
    await page.evaluate((d) => window.dispatchEvent(new CustomEvent("demo:open", { detail: d })), detail);
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 300 });
  }).toPass({ timeout: 10_000 });

test("opens with prefilled email and focuses the name field", async ({ page }) => {
  await page.goto("/");
  await open(page, { email: "ana@bar.es", source: "hero" });
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Email")).toHaveValue("ana@bar.es");
  await expect(dialog.getByLabel("Your name")).toBeFocused();
});

test("validates required fields inline", async ({ page }) => {
  await page.goto("/");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await dialog.getByRole("button", { name: "Book demo" }).click();
  await expect(dialog.getByText("Required")).toHaveCount(3);
  await dialog.getByLabel("Email").fill("nope");
  await dialog.getByRole("button", { name: "Book demo" }).click();
  await expect(dialog.getByText("Enter a valid email")).toBeVisible();
});

test("submits to /api/contact and shows success", async ({ page }) => {
  let posted: Record<string, string> = {};
  await page.route("**/api/contact", async (route) => {
    const body = route.request().postDataBuffer()?.toString("utf8") ?? "";
    // multipart: just assert the field names are present
    posted = Object.fromEntries(["name", "email", "venue", "locations", "menuToday", "source", "vtype", "locale"].map((k) => [k, body.includes(`name="${k}"`) ? "yes" : "no"]));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/");
  await open(page, { source: "header" });
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await dialog.getByLabel("Your name").fill("Ana");
  await dialog.getByLabel("Email").fill("ana@bar.es");
  await dialog.getByLabel("Restaurant name").fill("Bar Ana");
  await dialog.getByLabel("2–5").check();
  await dialog.getByLabel("On my website").check();
  await dialog.getByRole("button", { name: "Book demo" }).click();
  await expect(dialog.getByText("Done. We'll write to you today.")).toBeVisible();
  expect(posted).toEqual({ name: "yes", email: "yes", venue: "yes", locations: "yes", menuToday: "yes", source: "yes", vtype: "yes", locale: "yes" });
});

test("shows the error state with WhatsApp fallback on 500", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.goto("/es");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Pide tu demo" });
  await dialog.getByLabel("Tu nombre").fill("Ana");
  await dialog.getByLabel("Email").fill("ana@bar.es");
  await dialog.getByLabel("Nombre del restaurante").fill("Bar Ana");
  await dialog.getByRole("button", { name: "Pedir demo" }).click();
  await expect(dialog.getByText("No ha ido.")).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Abrir WhatsApp" })).toHaveAttribute("href", /wa\.me\/34/);
  await dialog.getByRole("button", { name: "Reintentar" }).click();
  await expect(dialog.getByLabel("Tu nombre")).toHaveValue("Ana");
});

test("focus is trapped: Shift+Tab from the first field reaches the close button, Tab from the last control wraps", async ({ page }) => {
  await page.goto("/");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await expect(dialog.getByLabel("Your name")).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Book demo" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
});
