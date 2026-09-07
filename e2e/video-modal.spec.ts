import { test, expect } from "@playwright/test";

test("video element mounts only while the modal is open", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("video")).toHaveCount(0);
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent("video:open", { detail: { src: "/assets/nonexistent.mp4", title: "Test clip", orientation: "portrait" } }))
  );
  const dialog = page.getByRole("dialog", { name: "Test clip" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("video")).toHaveCount(1);
  await expect(dialog.locator("video")).toHaveAttribute("src", "/assets/nonexistent.mp4");
  await page.keyboard.press("Escape");
  await expect(page.locator("video")).toHaveCount(0);
});
