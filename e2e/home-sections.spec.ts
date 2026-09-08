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
  // Anchor navigation can land the demo right at the viewport edge, which is close enough to
  // AiDemo's `useInView(..., { margin: "-100px" })` threshold that the animation effect can
  // read it as out of view and never start typing. Center it before hovering so the rest of
  // this test isn't racing that boundary.
  await demo.scrollIntoViewIfNeeded();
  // The demo advances its own tabs on a timer, so a click or assertion can land right as the
  // auto-advance flips the selected tab out from under it (the cause of this test's previous
  // flakiness). Hovering pauses that hand-off — see AiDemo's `hoveredRef` gate — so the rest of
  // this test runs deterministically.
  await demo.hover();
  const tabs = demo.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  // Exactly one tab selected at any time is the property that actually matters: asserting
  // "the first tab is selected" cannot be relied on once the cycle has started, since it may
  // already have moved on by the time this line runs.
  await expect(demo.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  // Types in one character at a time (TYPE_MS per char in AiDemo) — generous timeout so this
  // doesn't race the typing animation for the full prompt.
  await expect(demo).toContainText("Translate the menu into German", { timeout: 20000 });
});

test("the AI demo pluralizes the toast for the single-row descriptions tab", async ({ page }) => {
  // The third tab ("Descriptions") has exactly one row, so home.ai.demo.toast must be an
  // ICU plural — the naive "{count} dishes updated" string would render on screen every
  // cycle for this tab.
  await page.goto("/#ai");
  const demo = page.locator("[data-ai-demo]");
  // Same two guards as "the AI section cycles its tabs and applies a change" above: center
  // the demo so useInView's -100px margin doesn't misread anchor-scroll placement as out of
  // view, then hover to pause the automatic hand-off (AiDemo's hoveredRef gate) so the click
  // below and the assertions after it aren't racing the auto-advance timer. Without these
  // this test was intermittently flaky under parallel load — it passed in isolation because
  // there was no contention delaying the click past the point the demo was actually in view
  // or past HOLD_MS, but under load either gate could still be closed (or could have already
  // fired and moved on) by the time the click landed.
  await demo.scrollIntoViewIfNeeded();
  await demo.hover();
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

test("the differentiator band lists all ten claims, with the duplicate marquee copies hidden", async ({ page }) => {
  // Marquee renders `repeat` copies of the children per half and two halves, so the band holds
  // 10 claims x 3 repeats x 2 halves = 60 pills in the DOM. Exactly one copy of each claim is
  // exposed: `aria-hidden` (plus `inert`) sits on Marquee's duplicated *group* wrappers, not on
  // the individual `[data-diff-item]` pills, so this counts the pills that sit under a hidden
  // group and asserts the remainder is the ten real ones.
  await page.goto("/");
  const band = page.locator("[data-diff]");
  const all = band.locator("[data-diff-item]");
  const hidden = band.locator("[aria-hidden='true'] [data-diff-item]");
  await expect(all).toHaveCount(60);
  await expect(hidden).toHaveCount(50);
  const titles = await band.locator("[aria-hidden='true'] [data-diff-title]").allInnerTexts();
  expect(titles.length).toBe(50);
  const exposed = await all.locator("[data-diff-title]").allInnerTexts();
  expect(new Set(exposed).size).toBe(10);
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

test("a claim's explanation is visible without hovering it", async ({ page }) => {
  // The owner asked for a strip that never stops, not even on hover, so the explanation can no
  // longer be something you have to catch a moving pill to read: it is always on screen.
  await page.goto("/");
  const item = page.locator("[data-diff-item]").first();
  await expect(item.locator("[data-diff-body]")).toBeVisible();
  await expect(item.locator("[data-diff-body]")).not.toBeEmpty();
});

test("the reviews section shows the Google rating badge, not the empty state", async ({ page }) => {
  // data/reviews.json now carries real content, so the honest "coming soon" state must be
  // gone. If a future change empties that file again, this fails loudly rather than the
  // section quietly reverting.
  await page.goto("/#reviews");
  const s = page.locator("#reviews");
  await expect(s).toBeVisible();
  await expect(s).not.toContainText("Reviews coming soon.");
  await expect(s.getByText(/^\d(?:[.,]\d)?\/5 on Google$/)).toHaveCount(1);
});

test("populated reviews render as cards", async ({ page }) => {
  const { default: data } = await import("../data/reviews.json", { with: { type: "json" } });
  test.skip(data.google.length === 0 && data.videos.length === 0, "no review content yet");
  await page.goto("/#reviews");
  await expect(page.locator("[data-review-card]").first()).toBeVisible();
});

test("the review rows alternate: the first leads with its video, the second with its words", async ({ page }) => {
  // The owner asked for a zig-zag: video left / words right, then words left / video right.
  // DOM order follows the visual order, so reading the cards top to bottom is the assertion.
  const { default: data } = await import("../data/reviews.json", { with: { type: "json" } });
  test.skip(data.videos.length < 2, "needs two client videos to alternate");
  await page.goto("/#reviews");

  const cards = page.locator("#reviews [data-review-card]");
  const kinds = await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-review-card")));
  const ids = await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-review-id")));

  // Row 1: the video first, then that client's words.
  expect(kinds[0]).toBe("video");
  expect(ids[0]).toBe(data.videos[0].id);
  expect(kinds[1]).not.toBe("video");
  // Row 2: the words half first (a written review once there is one, the venue card until
  // then), and the video after it.
  expect(kinds[2]).not.toBe("video");
  expect(kinds[3]).toBe("video");
  expect(ids[3]).toBe(data.videos[1].id);

  // And the words beside the first video really are the review that video declares, not a
  // positional guess at one.
  const declared = (data.videos[0] as { reviewId?: string }).reviewId;
  const paired = data.google.find((review) => review.id === declared);
  test.skip(!paired, "the first video declares no written review yet");
  await expect(cards.nth(1)).toContainText(paired!.text.slice(0, 40));
});

test("no review card links out to Google — only the rating badge does", async ({ page }) => {
  await page.goto("/#reviews");
  // The per-card "See it on Google" link is gone for good; a card holds no links at all.
  await expect(page.locator("#reviews [data-review-card] a")).toHaveCount(0);
  const links = page.locator("#reviews a");
  await expect(links).toHaveCount(1);
  await expect(links.first()).toHaveText(/\/5 on Google$/);
});

test("the claim marquee keeps running under the pointer", async ({ page }) => {
  // Regression guard for the owner's explicit instruction: no pause button, and no pause on
  // hover or focus either. Only the OS-level reduced-motion preference stops the strip, which
  // this test deliberately does not emulate.
  await page.goto("/");
  const track = page.locator("[data-diff] [data-diff-item]").first();
  await track.hover({ force: true, trial: false }).catch(() => {});
  const playState = await track.evaluate((el) => {
    const group = el.parentElement;
    const trackEl = group?.parentElement as HTMLElement | null;
    return trackEl ? getComputedStyle(trackEl).animationPlayState : null;
  });
  expect(playState).toBe("running");
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
