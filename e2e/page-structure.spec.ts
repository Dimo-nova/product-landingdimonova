import { test, expect } from "@playwright/test";
import en from "../messages/en.json";
import es from "../messages/es.json";

/**
 * Locks Phase 4's promise for the five rebuilt inner pages: each keeps its sections, their
 * order, and their copy. Unlike e2e/pages.spec.ts's `getByRole("heading").first()` checks, this
 * also asserts the response status — Next's error page still renders *a* heading, so a
 * server-render crash (the realistic failure mode when a `t.rich` tag is mis-mapped) would
 * otherwise pass silently.
 *
 * The expected <h1> and <h2> texts are read from messages/en.json and messages/es.json rather
 * than hard-coded, so the test fails the moment a section's copy changes — not just when a
 * section is added, removed or reordered.
 */

type Messages = typeof en;
const MESSAGES: Record<"en" | "es", Messages> = { en, es: es as Messages };

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

function getMessage(messages: Messages, dottedKey: string): string {
  const value = dottedKey
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], messages);
  if (typeof value !== "string") {
    throw new Error(`messages key "${dottedKey}" did not resolve to a string`);
  }
  return value;
}

type PageSpec = {
  path: string;
  titleKey: string;
  /** Dotted message keys for `main h2` texts, in expected DOM order. */
  h2Keys: string[];
};

const PAGES: PageSpec[] = [
  {
    path: "/features",
    titleKey: "features.title",
    // /features is a short index now: one <h2> per service card (read from lib/services.ts, in
    // registry order) and then the closing PageCta band's own <h2> (components/page/PageCta.tsx
    // renders `title` as an <h2>).
    h2Keys: ["services.menu.title", "services.ordering.title", "services.reviews.title", "features.cta.title"],
  },
  {
    // The flagship service page. It absorbed the five services the owner folded into the digital
    // menu, so its sections are the menu itself, the dashboard and its assistant, translations,
    // the bundled extras (multi-venue, daily menu, training) and a FAQ.
    path: "/features/menu",
    titleKey: "features.pages.menu.title",
    h2Keys: [
      "features.pages.menu.s1.title",
      "features.pages.menu.s2.title",
      "features.pages.menu.s3.title",
      "features.pages.menu.s4.title",
      "features.pages.menu.faq.title",
      "features.pages.menu.cta.title",
    ],
  },
  {
    path: "/features/ordering",
    titleKey: "features.pages.ordering.title",
    h2Keys: [
      "features.pages.ordering.s1.title",
      "features.pages.ordering.s2.title",
      "features.pages.ordering.s3.title",
      "features.pages.ordering.s4.title",
      "features.pages.ordering.cta.title",
    ],
  },
  {
    path: "/features/reviews",
    titleKey: "features.pages.reviews.title",
    h2Keys: [
      "features.pages.reviews.s1.title",
      "features.pages.reviews.s2.title",
      "features.pages.reviews.s3.title",
      "features.pages.reviews.faq.title",
      "features.pages.reviews.cta.title",
    ],
  },
  {
    path: "/pricing",
    titleKey: "pricing.title",
    // pricing.included.title, pricing.faq.title: the "what's included" panel and the FAQ
    // section. The "what shapes your quote" panel in between has no <h2> of its own, and this
    // page has no closing PageCta (its own two-card "quote" section ends it instead).
    h2Keys: ["pricing.included.title", "pricing.faq.title"],
  },
  {
    path: "/about",
    titleKey: "about.title",
    // about.why.title, about.principles.title: the two sections that always render. The team
    // section's about.team.title is deliberately excluded — it sits behind TEAM_PUBLISHED
    // (false) in app/[locale]/about/page.tsx, so it never reaches the DOM; see
    // e2e/pages.spec.ts's "stays hidden behind TEAM_PUBLISHED" test for that guarantee.
    // about.cta.title is the closing PageCta band's own <h2>, same as features above.
    h2Keys: ["about.why.title", "about.principles.title", "about.cta.title"],
  },
  {
    path: "/contact",
    titleKey: "contact.title",
    // The contact page has no <h2> — just the PageHero <h1> and the form/side panel.
    h2Keys: [],
  },
];

for (const locale of ["en", "es"] as const) {
  const messages = MESSAGES[locale];
  const prefix = locale === "en" ? "" : `/${locale}`;

  for (const { path, titleKey, h2Keys } of PAGES) {
    const url = `${prefix}${path}`;

    test(`${url} keeps its sections, order and copy`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status(), `${url} did not respond 200`).toBe(200);

      const expectedTitle = stripTags(getMessage(messages, titleKey));
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(expectedTitle);

      const expectedH2s = h2Keys.map((key) => stripTags(getMessage(messages, key)));
      const actualH2s = await page.locator("main h2").allTextContents();
      expect(actualH2s, `${url} main h2 order/content changed`).toEqual(expectedH2s);
    });
  }
}
