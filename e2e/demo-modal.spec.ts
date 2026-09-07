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
    // multipart: extract each field's value, not just whether the field name is present
    const fields = ["name", "email", "venue", "locations", "menuToday", "source", "vtype", "locale"];
    posted = Object.fromEntries(fields.map((k) => {
      const m = body.match(new RegExp(`name="${k}"\\r\\n\\r\\n([^\\r]*)`));
      return [k, m?.[1] ?? ""];
    }));
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
  await dialog.locator("#demo-consent").check();
  await dialog.getByRole("button", { name: "Book demo" }).click();
  await expect(dialog.getByText("Done. We'll write to you today.")).toBeVisible();
  expect(posted).toEqual({ name: "Ana", email: "ana@bar.es", venue: "Bar Ana", locations: "2-5", menuToday: "web", source: "header", vtype: "restaurant", locale: "en" });
});

test("shows the error state with WhatsApp fallback on 500", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.goto("/es");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Pide tu demo" });
  await dialog.getByLabel("Tu nombre").fill("Ana");
  await dialog.getByLabel("Email").fill("ana@bar.es");
  await dialog.getByLabel("Nombre del restaurante").fill("Bar Ana");
  await dialog.locator("#demo-consent").check();
  await dialog.getByRole("button", { name: "Pedir demo" }).click();
  await expect(dialog.getByText("No ha ido.")).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Abrir WhatsApp" })).toHaveAttribute("href", /wa\.me\/34/);
  await dialog.getByRole("button", { name: "Reintentar" }).click();
  await expect(dialog.getByLabel("Tu nombre")).toHaveValue("Ana");
});

test("focus stays inside the dialog through sending, success and retry", async ({ page }) => {
  await page.route("**/api/contact", async (route) => { await new Promise((r) => setTimeout(r, 300)); await route.fulfill({ status: 500, body: "{}" }); });
  await page.goto("/");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await dialog.getByLabel("Your name").fill("Ana");
  await dialog.getByLabel("Email").fill("ana@bar.es");
  await dialog.getByLabel("Restaurant name").fill("Bar Ana");
  await dialog.locator("#demo-consent").check();
  await dialog.getByRole("button", { name: "Book demo" }).click();
  // while sending, the active element is inside the dialog
  const insideWhileSending = await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));
  expect(insideWhileSending).toBe(true);
  await expect(dialog.getByText("That didn't go through.")).toBeVisible();
  const insideOnError = await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));
  expect(insideOnError).toBe(true);
  await dialog.getByRole("button", { name: "Try again" }).click();
  await expect(dialog.getByLabel("Your name")).toBeFocused();
});

test("opened from the header, Escape closes it and returns focus to the header button", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("banner").getByRole("button", { name: "Request a demo" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Book your demo" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
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

test("consent checkbox blocks submission when unticked and no request is sent", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/contact", async (route) => {
    calls++;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await dialog.getByLabel("Your name").fill("Ana");
  await dialog.getByLabel("Email").fill("ana@bar.es");
  await dialog.getByLabel("Restaurant name").fill("Bar Ana");
  await dialog.getByRole("button", { name: "Book demo" }).click();
  await expect(dialog.getByText("Please accept the privacy policy")).toBeVisible();
  expect(calls).toBe(0);
});

test("ticking consent lets the submission through", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }));
  await page.goto("/");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await dialog.getByLabel("Your name").fill("Ana");
  await dialog.getByLabel("Email").fill("ana@bar.es");
  await dialog.getByLabel("Restaurant name").fill("Bar Ana");
  await dialog.locator("#demo-consent").check();
  await dialog.getByRole("button", { name: "Book demo" }).click();
  await expect(dialog.getByText("Done. We'll write to you today.")).toBeVisible();
});

test("consent checkbox is reachable and toggleable by keyboard", async ({ page }) => {
  await page.goto("/");
  await open(page);
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  const checkbox = dialog.locator("#demo-consent");
  await checkbox.focus();
  await expect(checkbox).toBeFocused();
  await expect(checkbox).not.toBeChecked();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();
});
