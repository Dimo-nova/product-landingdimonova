import { test, expect } from "@playwright/test";
import { BANNER_COPY } from "./bannerCopy";

// Mirrors routing.locales in lib/routing.ts (not imported: next-intl/navigation
// cannot load under the unit runner). Update both if the locale list changes.
const LOCALES = ["en", "es", "de", "fr", "pt"] as const;

test("banner copy exists for every locale", () => {
  for (const l of LOCALES) expect(BANNER_COPY[l].length).toBeGreaterThan(5);
});
