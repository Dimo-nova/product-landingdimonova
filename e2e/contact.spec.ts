import { test, expect } from "@playwright/test";

test("contact page loads with heading", async ({ page }) => {
  const res = await page.goto("/contact");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});

test("contact page works in spanish", async ({ page }) => {
  await page.goto("/es/contact");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
});

test("empty submit shows validation errors", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();
  await expect(page.getByText("Your name is required.")).toBeVisible();
  await expect(page.getByText("Email is required.")).toBeVisible();
  await expect(page.getByText("Venue name is required.")).toBeVisible();
});

test("invalid email shows email error", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/venue name/i).fill("Test Pub");
  await page.getByLabel(/email/i).fill("not-an-email");
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();
  await expect(page.getByText(/email doesn't look right/i)).toBeVisible();
});

test("name, email and venue fields report validity via aria-invalid and aria-describedby", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();
  const name = page.getByLabel(/your name/i);
  await expect(name).toHaveAttribute("aria-invalid", "true");
  const describedBy = await name.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`#${describedBy}`)).toHaveText("Your name is required.");
});

test("venue type is a real radio group exposed to assistive tech", async ({ page }) => {
  await page.goto("/contact");
  const group = page.getByRole("radiogroup", { name: /venue type/i });
  await expect(group).toBeVisible();
  await expect(group.getByRole("radio")).toHaveCount(4);
});

test("venue type radio group: restaurant is selected by default and pub can be picked", async ({ page }) => {
  await page.goto("/contact");
  const restaurant = page.getByRole("radio", { name: "Restaurant" });
  const pub = page.getByRole("radio", { name: /^pub$/i });
  await expect(restaurant).toBeChecked();
  await pub.click();
  await expect(pub).toBeChecked();
  await expect(restaurant).not.toBeChecked();
});

test("venue type pills are keyboard-operable with arrow keys", async ({ page }) => {
  await page.goto("/contact");
  const restaurant = page.getByRole("radio", { name: "Restaurant" });
  const pub = page.getByRole("radio", { name: /^pub$/i });
  const cafe = page.getByRole("radio", { name: /^café$/i });

  await restaurant.focus();
  await expect(restaurant).toBeChecked();
  await page.keyboard.press("ArrowRight");
  await expect(pub).toBeChecked();
  await expect(pub).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(cafe).toBeChecked();
  await page.keyboard.press("ArrowLeft");
  await expect(pub).toBeChecked();
});

test("valid submit shows success state", async ({ page }) => {
  // The route handler makes a real Notion API call; mock it so the test doesn't depend on
  // live credentials (same pattern as e2e/demo-modal.spec.ts).
  await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }));
  await page.goto("/contact");
  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/venue name/i).fill("The Test Pub");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.locator("#contact-consent").check();
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();
  await expect(page.getByText(/we'll be in touch/i)).toBeVisible();
});

test("unticked consent blocks submission with an inline error and sends no request", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/contact", async (route) => {
    calls++;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/contact");
  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/venue name/i).fill("The Test Pub");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();
  await expect(page.getByText("Please accept the privacy policy")).toBeVisible();
  expect(calls).toBe(0);
});

// The client already blocks submission without a ticked box, but the server must not rely on
// that (GDPR art. 7(1) accountability). Post straight to the API, bypassing the form entirely,
// to prove the guard lives server-side too.
test("the API rejects a request with no consent field", async ({ request }) => {
  const res = await request.post("/api/contact", {
    multipart: { name: "Ana", email: "ana@bar.es", venue: "Bar Ana", vtype: "restaurant" },
  });
  expect(res.status()).toBe(400);
  await expect(res.json()).resolves.toEqual({ error: "consent_required" });
});

// Same reasoning as the consent guard above: the client blocks an oversized file before it
// ever reaches fetch, but a request built by hand skips that. Post straight to the API with a
// file just over MAX_UPLOAD_BYTES to prove the size guard is enforced server-side too, and that
// it fires before the (also missing here) required fields would otherwise be reported.
test("the API rejects a request with an oversized menu file", async ({ request }) => {
  const res = await request.post("/api/contact", {
    multipart: {
      name: "Ana",
      email: "ana@bar.es",
      venue: "Bar Ana",
      vtype: "restaurant",
      consent: "yes",
      menuFile: {
        name: "menu.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
      },
    },
  });
  expect(res.status()).toBe(400);
  await expect(res.json()).resolves.toEqual({ error: "file_too_large" });
});

test("success state has send another button that resets form", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }));
  await page.goto("/contact");
  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/venue name/i).fill("The Test Pub");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.locator("#contact-consent").check();
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();
  await expect(page.getByText(/we'll be in touch/i)).toBeVisible();
  await page.getByRole("button", { name: /send another/i }).click();
  // Should be back to form state, empty again
  await expect(page.getByRole("main").getByRole("button", { name: /request a demo/i })).toBeVisible();
  await expect(page.getByLabel(/your name/i)).toHaveValue("");
  await expect(page.locator("#contact-consent")).not.toBeChecked();
});

test("a 500 response shows the WhatsApp fallback", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "notion_error" }) }));
  await page.goto("/contact");
  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/venue name/i).fill("The Test Pub");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.locator("#contact-consent").check();
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();
  await expect(page.getByText("That didn't go through.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open WhatsApp" })).toHaveAttribute("href", /wa\.me\/353/);
  // Retrying returns to the form without losing what was already typed in.
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByLabel(/your name/i)).toHaveValue("Test User");
});

test("a 500 response in spanish links to the spanish WhatsApp number", async ({ page }) => {
  await page.route("**/api/contact", (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "notion_error" }) }));
  await page.goto("/es/contact");
  await page.getByLabel(/tu nombre/i).fill("Test User");
  await page.getByLabel(/nombre del local/i).fill("The Test Pub");
  await page.getByLabel(/correo electrónico/i).fill("test@example.com");
  await page.locator("#contact-consent").check();
  await page.getByRole("main").getByRole("button", { name: /solicitar una demo/i }).click();
  await expect(page.getByRole("link", { name: "Abrir WhatsApp" })).toHaveAttribute("href", /wa\.me\/34/);
});

test("dish list file upload accepts a file and shows its name", async ({ page }) => {
  await page.goto("/contact");
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({ name: "menu.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await expect(page.getByText("menu.pdf")).toBeVisible();
});

// The dropzone label's visible text swaps to the chosen file's name ("menu.pdf") once a file is
// selected, which would otherwise become the file input's accessible name too (via the wrapping
// <label>) — a screen-reader user tabbing back to it would hear the filename instead of "Dish
// list", with no indication of what the control is for. aria-labelledby on the input keeps the
// field label as its accessible name regardless of what's showing in the dropzone.
test("the dish list file input keeps its field label as its accessible name after a file is selected", async ({ page }) => {
  await page.goto("/contact");
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({ name: "menu.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
  await expect(page.getByText("menu.pdf")).toBeVisible();
  await expect(fileInput).toHaveAccessibleName(/Dish list/);
});

// Mirrors lib/config.ts MAX_UPLOAD_BYTES (4 MB) — no fixture file is committed, a plain
// zero-filled Buffer one byte over the limit is enough to trip the client-side check.
test("a file over the 4 MB limit is rejected client-side without a request being made", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/contact", async (route) => {
    calls++;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/contact");
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "menu.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
  });
  await expect(page.getByText("That file is too large. The limit is 4 MB.")).toBeVisible();

  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/venue name/i).fill("The Test Pub");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.locator("#contact-consent").check();
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();

  await expect(page.getByText("That file is too large. The limit is 4 MB.")).toBeVisible();
  expect(calls).toBe(0);
});
