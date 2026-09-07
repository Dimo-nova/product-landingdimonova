import { test, expect } from "@playwright/test";

// Dispatching the CustomEvent races VideoModal's hydration: if the client component hasn't
// attached its window listener yet, the event is lost for good (unlike a real click, a raw
// window.dispatchEvent isn't replayed by React once hydration finishes). Retry the dispatch
// until the dialog shows up rather than firing once and hoping hydration already happened
// (same pattern as e2e/demo-modal.spec.ts).
const open = (page: import("@playwright/test").Page, detail: Record<string, string>, dialogName: string) =>
  expect(async () => {
    await page.evaluate((d) => window.dispatchEvent(new CustomEvent("video:open", { detail: d })), detail);
    await expect(page.getByRole("dialog", { name: dialogName })).toBeVisible({ timeout: 300 });
  }).toPass({ timeout: 10_000 });

test("video modal mounts the player only while open and falls back when the source fails", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("video")).toHaveCount(0);
  await open(page, { src: "/assets/nonexistent.mp4", title: "Test clip", orientation: "portrait" }, "Test clip");
  const dialog = page.getByRole("dialog", { name: "Test clip" });
  await expect(dialog).toBeVisible();
  // The source does not exist, so the <video> may already have been replaced by the fallback.
  const videoOrFallback = dialog.locator('video[src="/assets/nonexistent.mp4"], a[href="/assets/nonexistent.mp4"]');
  await expect(videoOrFallback).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
});
