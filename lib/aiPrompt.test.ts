import { test, expect } from "@playwright/test";
import { AI_PROVIDER_IDS, AI_PROVIDER_LOGOS, buildProviderUrl } from "./aiPrompt";

test("exposes the four providers in display order", () => {
  expect(AI_PROVIDER_IDS).toEqual(["chatgpt", "claude", "perplexity", "gemini"]);
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

test("gemini points at Gemini itself, not at Search", () => {
  expect(new URL(buildProviderUrl("gemini", "x")).host).toBe("gemini.google.com");
});

test("every provider has a mark on disk", () => {
  for (const id of AI_PROVIDER_IDS) {
    expect(AI_PROVIDER_LOGOS[id]).toMatch(/^\/assets\/ai\/[a-z]+\.svg$/);
  }
});
