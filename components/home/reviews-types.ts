/** Shape of `data/reviews.json`. The file ships empty (`{ rating: null, profileUrl: "", videos:
 * [], google: [] }`) until the owner supplies real reviews, so this type is declared by hand
 * rather than inferred: TypeScript would otherwise narrow the empty array literals to
 * `never[]`, and nothing that pushes a real `VideoReview`/`GoogleReview` into them would
 * type-check. */
export type VideoReview = {
  id: string;
  name: string;
  venue: string;
  poster: string;
  src: string;
};

export type GoogleReview = {
  id: string;
  name: string;
  venue: string;
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

export type ReviewCard =
  | { type: "video"; item: VideoReview }
  | { type: "google"; item: GoogleReview };

/**
 * Interleaves videos and Google reviews in the fixed spec order — video, google, google,
 * video, google, google, google — skipping a slot whenever that type's queue is already
 * empty. The pattern then repeats (rather than stopping after one pass) so any reviews
 * beyond the first seven still get placed instead of silently dropped.
 */
const ORDER = ["video", "google", "google", "video", "google", "google", "google"] as const;

export function buildReviewCards(videos: VideoReview[], google: GoogleReview[]): ReviewCard[] {
  const videoQueue = [...videos];
  const googleQueue = [...google];
  const cards: ReviewCard[] = [];
  let i = 0;
  while (videoQueue.length || googleQueue.length) {
    const slot = ORDER[i % ORDER.length];
    i++;
    if (slot === "video" && videoQueue.length) {
      cards.push({ type: "video", item: videoQueue.shift()! });
    } else if (slot === "google" && googleQueue.length) {
      cards.push({ type: "google", item: googleQueue.shift()! });
    }
  }
  return cards;
}
