import { test, expect } from "@playwright/test";

test("the eight service cards link to their feature anchors", async ({ page }) => {
  await page.goto("/");
  const grid = page.locator("#services");
  const cards = grid.getByRole("link");
  await expect(cards).toHaveCount(8);
  await expect(grid.getByRole("link", { name: /Digital menu/ })).toHaveAttribute("href", "/features#menu");
  await expect(grid.getByRole("link", { name: /Smart reviews/ })).toHaveAttribute("href", "/features#reviews");
});

test("the service card body text meets AA contrast", async ({ page }) => {
  await page.goto("/");
  const ratio = await page.locator("#services a").first().evaluate((card) => {
    const body = card.querySelector("[data-card-body]") as HTMLElement;
    const lum = (c: string) => {
      const [r, g, b] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const ch = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
      return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
    };
    const fg = lum(getComputedStyle(body).color);
    const bg = lum(getComputedStyle(body.parentElement as Element).backgroundColor);
    const [hi, lo] = fg > bg ? [fg, bg] : [bg, fg];
    return (hi + 0.05) / (lo + 0.05);
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test("no card claims that bad reviews are withheld from Google", async ({ page }) => {
  await page.goto("/");
  const text = (await page.locator("#services").innerText()).toLowerCase();
  expect(text).not.toContain("bad ones come to you first");
  expect(text).toContain("every review still reaches google");
});

test("the logo strip renders each client logo once for assistive tech", async ({ page }) => {
  await page.goto("/");
  const strip = page.locator("[data-logo-strip]");
  // getByAltText matches plain DOM attributes and counts both the visible and the
  // aria-hidden marquee duplicate (2). getByRole consults the accessibility tree, where
  // Marquee's aria-hidden="true" duplicate group is pruned, so it correctly counts 1.
  await expect(strip.getByRole("img", { name: "Bálamo" })).toHaveCount(1);
});

test("the AI section cycles its tabs and applies a change", async ({ page }) => {
  await page.goto("/#ai");
  const demo = page.locator("[data-ai-demo]");
  await expect(demo).toBeVisible();
  const tabs = demo.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(demo).toContainText("Translate the menu into German");
});

test("the AI demo pluralizes the toast for the single-row descriptions tab", async ({ page }) => {
  // The third tab ("Descriptions") has exactly one row, so home.ai.demo.toast must be an
  // ICU plural — the naive "{count} dishes updated" string would render on screen every
  // cycle for this tab.
  await page.goto("/#ai");
  const demo = page.locator("[data-ai-demo]");
  const tabs = demo.getByRole("tab");
  await tabs.nth(2).click();
  await expect(demo).toContainText(/1 dish updated/, { timeout: 10000 });
  await expect(demo).not.toContainText(/1 dishes updated/);
});

test("the AI tabs are fully operable with the keyboard", async ({ page }) => {
  await page.goto("/");
  const tabs = page.locator("[data-ai-demo]").getByRole("tab");
  await tabs.first().focus();
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.nth(2)).toBeFocused();
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
});

test("the AI section explains that nothing is written without approval", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#ai")).toContainText("Nothing is written to your menu until someone says yes.");
});

test("the Bálamo case shows the real menu and its five pills", async ({ page }) => {
  await page.goto("/#balamo");
  const s = page.locator("#balamo");
  await expect(s.getByAltText(/Bálamo's digital menu/)).toBeVisible();
  await expect(s.locator("[data-balamo-pill]")).toHaveCount(5);
  await expect(s.getByRole("link", { name: "See the case" })).toHaveAttribute("href", "/cases");
});

test("the home page does not overflow horizontally at a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(overflow).toBe(true);
});

test("the differentiator band lists all ten claims, with the duplicate marquee copy hidden", async ({ page }) => {
  // `aria-hidden` sits on Marquee's duplicated *group* wrapper, not on the individual
  // `[data-diff-item]` pills inside it — a `:not([aria-hidden='true'])` filter on the items
  // themselves excludes nothing, so this has to query through the accessibility tree instead.
  // `getByRole` does exactly that: it prunes anything under an aria-hidden/inert ancestor
  // (Marquee marks its duplicate `inert` too), so a count of 10 here genuinely proves the
  // duplicate copy is invisible to assistive tech, not just an artifact of a Set collapsing
  // twenty duplicated titles down to ten.
  await page.goto("/");
  const band = page.locator("[data-diff]");
  const items = band.getByRole("group");
  await expect(items).toHaveCount(10);
  const titles = await items.locator("[data-diff-title]").allInnerTexts();
  expect(new Set(titles).size).toBe(10);
});

test("keyboard focus pauses the AI demo instead of advancing under the reader", async ({ page }) => {
  test.setTimeout(30000);
  await page.goto("/");
  const demo = page.locator("[data-ai-demo]");
  const tabs = demo.getByRole("tab");
  await tabs.nth(1).focus();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  // Well past the auto-advance hold, the focused tab must still be the selected one.
  await page.waitForTimeout(12000);
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toBeFocused();
});

test("the Bálamo pills stay inside the viewport at two-column widths", async ({ page }) => {
  for (const width of [1000, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const pills = page.locator("[data-balamo-pill]");
    await expect(pills).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      const box = await pills.nth(i).boundingBox();
      expect(box, `pill ${i} at ${width}px has no box`).not.toBeNull();
      expect(box!.x, `pill ${i} at ${width}px starts off-screen`).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width, `pill ${i} at ${width}px overflows`).toBeLessThanOrEqual(width);
    }
  }
});

test("hovering a claim reveals its explanation", async ({ page }) => {
  // The claim pills live inside a continuously-scrolling Marquee track. Playwright's hover()
  // first waits for the target to be "stable" (an identical bounding box across two
  // animation frames) before it will move the mouse — a perpetually-translating ancestor
  // never satisfies that, so the real pointer event is never dispatched and pauseOnHover
  // (itself only reachable via that same pointer event) never gets a chance to run. This is
  // exactly the situation Marquee's own reduced-motion styles are built for: freeze the
  // track so the target is stationary, same as it would already be for a real user with the
  // OS-level "reduce motion" preference on.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const item = page.locator("[data-diff-item]").first();
  await item.hover();
  await expect(item.locator("[data-diff-body]")).toBeVisible();
});

test("the reviews section states that content is pending while the data file is empty", async ({ page }) => {
  await page.goto("/#reviews");
  const s = page.locator("#reviews");
  await expect(s).toBeVisible();
  await expect(s).toContainText("Reviews coming soon.");
  await expect(s.getByText(/on Google$/)).toHaveCount(0);
});

test("populated reviews render as cards", async ({ page }) => {
  const { default: data } = await import("../data/reviews.json", { with: { type: "json" } });
  test.skip(data.google.length === 0 && data.videos.length === 0, "no review content yet");
  await page.goto("/#reviews");
  await expect(page.locator("[data-review-card]").first()).toBeVisible();
});

test("focusing a claim reveals its explanation", async ({ page }) => {
  // Mirrors "hovering a claim reveals its explanation" above: the pills live inside a
  // continuously-scrolling Marquee track, so reduced motion freezes it, keeping the
  // focused item's box stable for the assertion.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const item = page.locator("[data-diff-item]").first();
  await item.focus();
  await expect(item.locator("[data-diff-body]")).toBeVisible();
});

test("focusing a claim pill pauses its marquee track without a pointer", async ({ page }) => {
  // Unlike the two tests above, this one deliberately does NOT emulate reduced motion: it
  // proves the track itself pauses via CSS (`:focus-within`), not merely that reduced-motion
  // styles would have frozen it anyway.
  await page.goto("/");
  const item = page.locator("[data-diff-item]").first();
  await item.focus();
  const playState = await item.evaluate((el) => {
    const wrap = el.closest('[data-pause="true"]');
    const track = wrap?.firstElementChild as HTMLElement | null;
    return track ? getComputedStyle(track).animationPlayState : null;
  });
  expect(playState).toBe("paused");
});

test("each AI provider link carries the full prompt", async ({ page }) => {
  await page.goto("/#ai-compare");
  const links = page.locator("#ai-compare a[target='_blank']");
  await expect(links).toHaveCount(4);
  const hrefs = await links.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
  for (const host of ["chat.openai.com", "claude.ai", "perplexity.ai", "google.com"]) {
    expect(hrefs.some((h) => new URL(h).host.includes(host))).toBe(true);
  }
  for (const h of hrefs) {
    const q = new URL(h).searchParams.get("q");
    expect(q).toContain("Dimonova");
    expect(q).not.toContain("Bad ones come to you first");
  }
});

test("the prompt describes the review flow accurately", async ({ page }) => {
  await page.goto("/#ai-compare");
  const href = await page.locator("#ai-compare a[target='_blank']").first().getAttribute("href");
  const q = new URL(href!).searchParams.get("q")!;
  expect(q).toContain("before sending everyone on to Google");
});

test("copy button reports success", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#ai-compare");
  await page.getByRole("button", { name: "Copy the question" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
});

test("the AI provider links show their names and fit a phone screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const section = page.locator("#ai-compare");
  for (const name of ["ChatGPT", "Claude", "Perplexity", "Google AI Mode"]) {
    await expect(section.getByRole("link", { name })).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
