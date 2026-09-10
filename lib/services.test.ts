import { test, expect } from "@playwright/test";
import { SERVICES, isServiceSlug } from "./services";

// The registry used to hold eight entries; the owner collapsed the offer to three, folding the
// old ai/multi/daily/training/translate items into the digital menu they were always part of.
test("exposes exactly the three services in spec order", () => {
  expect(SERVICES.map((s) => s.slug)).toEqual(["menu", "ordering", "reviews"]);
});

// Each service now has a page of its own under app/[locale]/features/[slug], rather than an
// anchor on a single long /features page.
test("every service links to its own features page", () => {
  for (const s of SERVICES) expect(s.href).toBe(`/features/${s.slug}`);
});

test("isServiceSlug accepts the three slugs and nothing else", () => {
  for (const s of SERVICES) expect(isServiceSlug(s.slug)).toBe(true);
  for (const other of ["ai", "multi", "daily", "training", "translate", "", "menu/"]) {
    expect(isServiceSlug(other)).toBe(false);
  }
});
