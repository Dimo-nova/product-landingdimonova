import { test, expect } from "@playwright/test";
import { AI_PROVIDER_IDS, buildProviderUrl } from "./aiPrompt";

test("exposes the four providers in display order", () => {
  expect(AI_PROVIDER_IDS).toEqual(["chatgpt", "claude", "perplexity", "google"]);
});

test("encodes the question into each provider's URL", () => {
  const q = "¿Compensa? a&b";
  for (const id of AI_PROVIDER_IDS) {
    const url = new URL(buildProviderUrl(id, q));
    expect(url.protocol).toBe("https:");
    const carried = url.searchParams.get("q");
    expect(carried).toBe(q);
  }
});

test("google uses the AI mode parameter", () => {
  expect(buildProviderUrl("google", "x")).toContain("udm=50");
});
