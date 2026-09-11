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

test("a valid email opens the demo modal already filled in, and sends the early heads-up", async ({ page }) => {
  await page.goto("/");
  // The first lead notification: the address goes to /api/demo-interest before the modal opens.
  const sent: unknown[] = [];
  await page.route("**/api/demo-interest", async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  const cta = page.getByRole("form", { name: "Book a demo" }).first();
  await cta.getByPlaceholder("Your email").fill("ana@bar.es");
  await cta.getByRole("button", { name: "Book a demo" }).click();
  const dialog = page.getByRole("dialog", { name: "Book your demo" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Email")).toHaveValue("ana@bar.es");
  await expect.poll(() => sent.length).toBe(1);
  expect(sent[0]).toMatchObject({ email: "ana@bar.es", source: expect.any(String) });
});

test("the early heads-up refuses a bad address server-side", async ({ request }) => {
  const res = await request.post("/api/demo-interest", { data: { email: "nope" } });
  expect(res.status()).toBe(400);
  await expect(res.json()).resolves.toEqual({ error: "invalid_email" });
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

test("the photograph is the only hero background left", async ({ page }) => {
  // The owner picked the photograph; the phone-mock variant and its ?hero=c switch are gone.
  // This guards against either coming back by accident.
  await page.goto("/");
  await expect(page.locator("[data-hero-bg='photo']")).toHaveCount(1);
  await page.goto("/?hero=c");
  await expect(page.locator("[data-hero-bg='photo']")).toHaveCount(1);
  await expect(page.locator("[data-hero-bg='mock']")).toHaveCount(0);
});

test("the client-dashboard link points at the panel", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Already a client/ })).toHaveAttribute("href", "https://menuadmin.dimonova.com");
});

test("the hero ships one photograph per breakpoint in the prerendered HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('data-hero-bg="photo"');
  // Matched on the folder, not on file names: the owner swaps these photographs from time to
  // time, and a test that names the files turns that into a red suite for no reason. What has to
  // hold is that the picture ships in the static HTML at all (crawlers and the LCP depend on it),
  // that it is art-directed with a <source media> rather than one image for every device, and
  // that the LCP hint survived.
  expect(html).toMatch(/<source[^>]*media="\(max-width: 900px\)"[^>]*assets\/hero\//);
  expect(html).toMatch(/<img[^>]*assets\/hero\//);
  expect(html.toLowerCase()).toContain('fetchpriority="high"');
});

test("each breakpoint downloads only its own hero photograph", async ({ page }) => {
  // The whole reason this is a <picture> and not two hidden <img>s: a hidden image still
  // downloads, so a phone would pay for the desktop photograph as well.
  const seen = new Set<string>();
  page.on("request", (r) => {
    if (r.resourceType() === "image" && r.url().includes("/assets/hero/")) {
      seen.add(r.url().split("/").pop()!);
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(seen.size, `phone fetched ${[...seen].join(", ")}`).toBe(1);

  seen.clear();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(seen.size, `desktop fetched ${[...seen].join(", ")}`).toBe(1);
});
