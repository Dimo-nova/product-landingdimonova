import { test, expect } from "@playwright/test";

test("the skip link is the first tab stop on / and moves focus to #main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#main");
  await page.keyboard.press("Enter");
  const activeId = await page.evaluate(() => document.activeElement?.id);
  expect(activeId).toBe("main");
});

for (const path of ["/", "/features", "/about"]) {
  test(`every <img> on ${path} has an alt attribute`, async ({ page }) => {
    await page.goto(path);
    const offenders = await page.evaluate(() => {
      const describe = (el: Element) => {
        const id = el.id ? `#${el.id}` : "";
        const src = el.getAttribute("src") ?? "";
        return `img${id}[src="${src}"]`;
      };
      return Array.from(document.querySelectorAll("img"))
        .filter((img) => !img.hasAttribute("alt"))
        .map(describe);
    });
    expect(offenders, `<img> missing an alt attribute: ${offenders.join(", ")}`).toEqual([]);
  });
}

for (const path of ["/", "/features", "/about"]) {
  test(`every <button> and <a> has an accessible name on ${path}`, async ({ page }) => {
    await page.goto(path);
    const offenders = await page.evaluate(() => {
      const describe = (el: Element) => {
        const id = el.id ? `#${el.id}` : "";
        const cls = typeof el.className === "string" && el.className.trim()
          ? `.${el.className.trim().split(/\s+/).join(".")}`
          : "";
        return `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 140);
      };
      const hasAccessibleName = (el: Element) => {
        if (el.getAttribute("aria-label")?.trim()) return true;
        const labelledby = el.getAttribute("aria-labelledby");
        if (labelledby && labelledby.split(/\s+/).some((id) => document.getElementById(id)?.textContent?.trim())) return true;
        if (el.getAttribute("title")?.trim()) return true;
        if ((el.textContent ?? "").trim()) return true;
        // An <img> with real (non-empty) alt text inside the control also gives it a name.
        const img = el.querySelector("img[alt]");
        if (img?.getAttribute("alt")?.trim()) return true;
        return false;
      };
      return Array.from(document.querySelectorAll("button, a"))
        .filter((el) => el.getAttribute("aria-hidden") !== "true")
        .filter((el) => !hasAccessibleName(el))
        .map(describe);
    });
    expect(offenders, `<button>/<a> with no accessible name: ${offenders.join(", ")}`).toEqual([]);
  });
}

// Home renders its hero title as two separate <h1> elements (components/sections/Hero.tsx:16-17)
// — a pre-existing heading-structure issue recorded in docs/compliance/2026-09-07-audit.md rather
// than fixed here (the brief: report heading violations, don't restructure legacy copy). /features
// and /about don't share that issue, so the "exactly one <h1>" regression check covers those two;
// the audit records the finding on "/" instead of silently asserting it away here.
for (const path of ["/features", "/about"]) {
  test(`${path} has exactly one <h1>`, async ({ page }) => {
    await page.goto(path);
    const count = await page.locator("h1").count();
    expect(count).toBe(1);
  });
}
