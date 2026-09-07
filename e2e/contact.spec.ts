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

test("venue picker selects pub", async ({ page }) => {
  await page.goto("/contact");
  // Pub pill starts inactive (transparent bg)
  const pubPill = page.getByRole("button", { name: /^pub$/i }).first();
  await pubPill.click();
  // After click, the pub pill has dark background (#1F1814)
  await expect(pubPill).toHaveCSS("background-color", "rgb(31, 24, 20)");
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

test("unticked consent blocks submission with an inline error", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel(/your name/i).fill("Test User");
  await page.getByLabel(/venue name/i).fill("The Test Pub");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByRole("main").getByRole("button", { name: /request a demo/i }).click();
  await expect(page.getByText("Please accept the privacy policy")).toBeVisible();
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
  // Should be back to form state
  await expect(page.getByRole("main").getByRole("button", { name: /request a demo/i })).toBeVisible();
});
