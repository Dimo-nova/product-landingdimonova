import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

// axe sweep, wcag2a + wcag2aa only. This is a broader net than the hand-rolled checks above —
// those check four things the shared components satisfy by construction (alt text, accessible
// names, one <h1>, no horizontal overflow), which is exactly why they never caught the eyebrow
// contrast regression a human reviewer found on every inner page. Do not lower the tag set, and
// do not disable a rule wholesale to make this pass — the one exception below is scoped to a
// single, named, owner-approved selector.
//
// Solid buttons (components/ui/Button.tsx `variant="solid"`, e.g. "Request a demo") render white
// text on the --brand coral background at ~3.22:1 (only the `xl` size's bold 700 weight clears
// AA's "large text" 3:1 threshold — see the comment on `.xl` in Button.module.css). The owner
// reviewed this and explicitly kept it rather than darkening the coral or the text, so it is
// filtered out of the axe results below by selector instead of fixed or globally disabled. Every
// other color-contrast finding must still fail this suite — see the Footer.module.css `.business`
// fix in this same review pass for an example of one that was fixed instead.
const SOLID_BUTTON_CLASS = "__solid"; // CSS module hash looks like "Button-module__XXXXXX__solid"

for (const path of PAGES) {
  test(`${path} has no axe wcag2a/wcag2aa violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const violations = results.violations
      .map((violation) => {
        if (violation.id !== "color-contrast") return violation;
        // Matched on the node's full `html` (its actual class attribute), not `target` — axe
        // minimizes `target` to whatever CSS selector is shortest-and-unique *on that page*,
        // which is sometimes just `.Button-module__XXXXXX__lg` with no "solid" in it at all.
        const nodes = violation.nodes.filter((node) => !node.html.includes(SOLID_BUTTON_CLASS));
        return { ...violation, nodes };
      })
      .filter((violation) => violation.nodes.length > 0);

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}
