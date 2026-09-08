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

// The six real pages. `/cases` is deliberately excluded: it redirects home while
// CASES_PUBLISHED is false (see app/[locale]/cases/page.tsx), so it never renders its own
// content — sweeping it would just re-check "/" a second time. Don't add it back until that
// redirect is lifted.
const PAGES = ["/", "/features", "/pricing", "/about", "/contact", "/legal/privacy"];

for (const path of PAGES) {
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

for (const path of PAGES) {
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

for (const path of PAGES) {
  test(`${path} has exactly one <h1>`, async ({ page }) => {
    await page.goto(path);
    const count = await page.locator("h1").count();
    expect(count).toBe(1);
  });
}

for (const path of PAGES) {
  test(`${path} does not overflow horizontally at a 390px viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `document.documentElement.scrollWidth exceeds window.innerWidth by ${overflow}px on ${path}`).toBeLessThanOrEqual(1);
  });
}

// Eyebrow labels (the small bold uppercase text above section headings — features/pricing/about's
// PageHero and FeatureBlock, plus the home page's AiPanel/BalamoShowcase) used --brand (~3.2:1 on
// white/cream), below the 4.5:1 text under 18px needs. components/page/Eyebrow.tsx centralizes
// the fix (--brand-deep, ~5:1, on a light ground). CSS module class names are build hashes
// ("PageHero-module__aBcDe__eyebrow"), so this matches on the local name after the last "__"
// rather than the exact hash, and stays correct across rebuilds. The contrast formula mirrors
// the `contrast()` helper in e2e/footer.spec.ts.
const EYEBROW_PAGES = ["/features", "/pricing", "/about", "/"];

for (const path of EYEBROW_PAGES) {
  test(`every eyebrow label on ${path} meets 4.5:1 contrast`, async ({ page }) => {
    await page.goto(path);
    const results = await page.evaluate(() => {
      // el.classList (not el.className.split) so this also works for SVG elements, whose
      // className is an SVGAnimatedString rather than a plain string.
      const isEyebrowClass = (el: Element) =>
        Array.from(el.classList).some((c) => c.split("__").pop() === "eyebrow");
      const lum = (color: string) => {
        const [r, g, b] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const ch = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
        return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
      };
      // Walks up from the element to find the first ancestor with a non-transparent
      // background — an eyebrow's immediate parent is usually background:transparent.
      const effectiveBackground = (el: Element) => {
        let node: Element | null = el;
        while (node) {
          const bg = getComputedStyle(node).backgroundColor;
          const alpha = (bg.match(/[\d.]+/g) ?? [])[3];
          if (bg && (alpha === undefined || parseFloat(alpha) > 0)) return bg;
          node = node.parentElement;
        }
        return "rgb(255, 255, 255)";
      };
      return Array.from(document.querySelectorAll<HTMLElement>("[class]"))
        .filter(isEyebrowClass)
        .map((el) => {
          const fg = lum(getComputedStyle(el).color);
          const bg = lum(effectiveBackground(el));
          const [hi, lo] = fg > bg ? [fg, bg] : [bg, fg];
          return { text: (el.textContent ?? "").trim().slice(0, 40), ratio: (hi + 0.05) / (lo + 0.05) };
        });
    });
    expect(results.length, `no eyebrow-class elements found on ${path}`).toBeGreaterThan(0);
    for (const { text, ratio } of results) {
      expect(ratio, `eyebrow "${text}" on ${path} has contrast ${ratio.toFixed(2)}, needs >= 4.5`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
