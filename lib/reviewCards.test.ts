import { test, expect } from "@playwright/test";
// This runner (playwright.unit.config.ts) only resolves relative specifiers, not the `@/`
// alias the rest of the app uses, so reach into components/home by relative path.
import { buildReviewCards, type GoogleReview, type VideoReview } from "../components/home/reviews-types";

function video(id: string): VideoReview {
  return { id, name: id, venue: "Venue", poster: `${id}.jpg`, src: `${id}.mp4` };
}

function google(id: string): GoogleReview {
  return { id, name: id, venue: "Venue", text: "Great food.", url: `https://example.com/${id}` };
}

test("interleaves two videos and five Google reviews in the fixed video/google/google pattern", () => {
  const videos = [video("v1"), video("v2")];
  const googleReviews = [google("g1"), google("g2"), google("g3"), google("g4"), google("g5")];

  const cards = buildReviewCards(videos, googleReviews);

  expect(cards.map((c) => c.type)).toEqual([
    "video", "google", "google", "video", "google", "google", "google",
  ]);
  expect(cards.map((c) => c.item.id)).toEqual(["v1", "g1", "g2", "v2", "g3", "g4", "g5"]);
});

test("Google-only input yields every review in order with no gaps", () => {
  const googleReviews = [google("g1"), google("g2"), google("g3"), google("g4")];

  const cards = buildReviewCards([], googleReviews);

  expect(cards.every((c) => c.type === "google")).toBe(true);
  expect(cards.map((c) => c.item.id)).toEqual(["g1", "g2", "g3", "g4"]);
});

test("video-only input yields every review in order with no gaps", () => {
  const videos = [video("v1"), video("v2"), video("v3")];

  const cards = buildReviewCards(videos, []);

  expect(cards.every((c) => c.type === "video")).toBe(true);
  expect(cards.map((c) => c.item.id)).toEqual(["v1", "v2", "v3"]);
});

test("input longer than the seven-slot pattern keeps going without dropping or duplicating an entry", () => {
  const videos = [video("v1"), video("v2"), video("v3")];
  const googleReviews = [
    google("g1"), google("g2"), google("g3"), google("g4"), google("g5"), google("g6"),
  ];

  const cards = buildReviewCards(videos, googleReviews);

  expect(cards).toHaveLength(videos.length + googleReviews.length);
  const ids = cards.map((c) => c.item.id);
  // No duplicates...
  expect(new Set(ids).size).toBe(ids.length);
  // ...and nothing dropped: every input id shows up exactly once.
  expect(new Set(ids)).toEqual(new Set([...videos, ...googleReviews].map((r) => r.id)));
});
