import { test, expect } from "@playwright/test";
import { SERVICES } from "./services";

test("exposes exactly the 8 services in spec order", () => {
  expect(SERVICES.map((s) => s.slug)).toEqual([
    "menu", "ai", "ordering", "training", "multi", "reviews", "daily", "translate",
  ]);
});

test("every service links to its features anchor", () => {
  for (const s of SERVICES) expect(s.href).toBe(`/features#${s.slug}`);
});
