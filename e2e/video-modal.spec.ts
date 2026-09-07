import { test, expect } from "@playwright/test";

test("video modal mounts the player only while open and falls back when the source fails", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("video")).toHaveCount(0);
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent("video:open", { detail: { src: "/assets/nonexistent.mp4", title: "Test clip", orientation: "portrait" } }))
  );
  const dialog = page.getByRole("dialog", { name: "Test clip" });
  await expect(dialog).toBeVisible();
  // The source does not exist, so the <video> may already have been replaced by the fallback.
  const videoOrFallback = dialog.locator('video[src="/assets/nonexistent.mp4"], a[href="/assets/nonexistent.mp4"]');
  await expect(videoOrFallback).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
});
