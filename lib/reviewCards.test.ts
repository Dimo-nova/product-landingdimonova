import { test, expect } from "@playwright/test";
// This runner (playwright.unit.config.ts) only resolves relative specifiers, not the `@/`
// alias the rest of the app uses, so reach into components/home by relative path.
import { buildReviewRows, type GoogleReview, type VideoReview } from "../components/home/reviews-types";

function video(id: string, reviewId?: string): VideoReview {
  return { id, name: id, venue: "Venue", poster: `${id}.jpg`, src: `${id}.mp4`, reviewId };
}

function google(id: string): GoogleReview {
  return { id, name: id, venue: "Venue", text: "Great food.", url: `https://example.com/${id}` };
}

test("pairs a video with the written review its reviewId names", () => {
  const { rows, unpaired } = buildReviewRows([video("v1", "g1")], [google("g1")]);

  expect(rows).toHaveLength(1);
  expect(rows[0].video.id).toBe("v1");
  expect(rows[0].review?.id).toBe("g1");
  expect(unpaired).toEqual([]);
});

test("never pairs by position: a video with no reviewId gets no review", () => {
  // The regression this guards: `videos[0]` and `google[0]` are different people. Pairing them
  // by index would print one reviewer's words under another venue's name.
  const { rows, unpaired } = buildReviewRows([video("v1")], [google("g1")]);

  expect(rows[0].review).toBeUndefined();
  expect(unpaired.map((r) => r.id)).toEqual(["g1"]);
});

test("a reviewId that matches nothing leaves the row unpaired instead of throwing", () => {
  const { rows, unpaired } = buildReviewRows([video("v1", "missing")], [google("g1")]);

  expect(rows[0].review).toBeUndefined();
  expect(unpaired.map((r) => r.id)).toEqual(["g1"]);
});

test("every video gets a row in file order and every review is either paired or unpaired", () => {
  const videos = [video("v1", "g2"), video("v2"), video("v3", "g3")];
  const reviews = [google("g1"), google("g2"), google("g3"), google("g4")];

  const { rows, unpaired } = buildReviewRows(videos, reviews);

  expect(rows.map((r) => r.video.id)).toEqual(["v1", "v2", "v3"]);
  expect(rows.map((r) => r.review?.id)).toEqual(["g2", undefined, "g3"]);
  // Nothing dropped and nothing shown twice: paired + unpaired covers the input exactly once.
  const placed = [...rows.flatMap((r) => (r.review ? [r.review.id] : [])), ...unpaired.map((r) => r.id)];
  expect(new Set(placed).size).toBe(placed.length);
  expect(new Set(placed)).toEqual(new Set(reviews.map((r) => r.id)));
});

test("no videos leaves every written review unpaired", () => {
  const reviews = [google("g1"), google("g2")];

  const { rows, unpaired } = buildReviewRows([], reviews);

  expect(rows).toEqual([]);
  expect(unpaired.map((r) => r.id)).toEqual(["g1", "g2"]);
});

test("no written reviews still gives every video its row", () => {
  const { rows, unpaired } = buildReviewRows([video("v1"), video("v2")], []);

  expect(rows.map((r) => r.video.id)).toEqual(["v1", "v2"]);
  expect(rows.every((r) => r.review === undefined)).toBe(true);
  expect(unpaired).toEqual([]);
});
