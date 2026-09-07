import { test, expect } from "@playwright/test";
import { BANNER_COPY } from "./bannerCopy";
import { routing } from "./routing";

test("banner copy exists for every locale", () => {
  for (const l of routing.locales) expect(BANNER_COPY[l].length).toBeGreaterThan(5);
});
