/** Shape of `data/reviews.json`. The file can ship empty (`{ rating: null, profileUrl: "",
 * videos: [], google: [] }`), so this type is declared by hand rather than inferred:
 * TypeScript would otherwise narrow the empty array literals to `never[]`, and nothing that
 * pushes a real `VideoReview`/`GoogleReview` into them would type-check. */
export type VideoReview = {
  id: string;
  name: string;
  venue: string;
  poster: string;
  src: string;
  /** The `id` of the written review left by this same client, when there is one. This is the
   * only thing that pairs a video with a text review: never pair by array position, because
   * the two arrays hold different people and a positional guess would put one reviewer's words
   * under another venue's name. A video with no `reviewId` (or one pointing at an id that is
   * not in `google`) renders its row with the venue card instead of a quote. */
  reviewId?: string;
};

export type GoogleReview = {
  id: string;
  name: string;
  /** The reviewer's venue, when it is known. Google does not expose one for every reviewer, and
   * inventing one would put words in a real person's mouth, so the card simply omits the line. */
  venue?: string;
  text: string;
  url: string;
  /** Star rating out of 5. Defaults to 5 when omitted (all reviews so far have been 5-star). */
  rating?: number;
};

export type ReviewsData = {
  rating: number | null;
  profileUrl: string;
  videos: VideoReview[];
  google: GoogleReview[];
};

/** One full-width row of the section: a client's video and, when they also wrote one, that same
 * client's written review. `review` stays `undefined` until the owner declares the link. */
export type ReviewRow = {
  video: VideoReview;
  review?: GoogleReview;
};

/**
 * Builds the section's rows from the two arrays. Every video gets a row, in file order; a row
 * carries a written review only when the video declares that review's `id` in `reviewId`, so
 * the pairing is always something a human wrote down rather than something the layout inferred.
 *
 * Written reviews that no video claims come back in `unpaired` — they are real reviews and
 * still have to appear in the section, just without a video beside them.
 */
export function buildReviewRows(
  videos: VideoReview[],
  google: GoogleReview[],
): { rows: ReviewRow[]; unpaired: GoogleReview[] } {
  const byId = new Map(google.map((review) => [review.id, review]));
  const paired = new Set<string>();

  const rows = videos.map((video) => {
    const review = video.reviewId ? byId.get(video.reviewId) : undefined;
    if (review) paired.add(review.id);
    return { video, review };
  });

  return { rows, unpaired: google.filter((review) => !paired.has(review.id)) };
}
