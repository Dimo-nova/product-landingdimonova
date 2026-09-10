import InlineVideo from "@/components/ui/InlineVideo";
import { getTranslations } from "next-intl/server";
import type { VideoReview } from "./reviews-types";
import styles from "./Reviews.module.css";

/**
 * The video half of a review row. Playback happens in place, not in a modal: `InlineVideo`
 * keeps the local poster on screen until the visitor presses play and only then mounts a
 * `<video>` pointing at the .mp4 on Supabase, so nothing third-party is requested on load.
 */
export default async function ReviewsVideo({ video }: { video: VideoReview }) {
  const t = await getTranslations("home.reviews");

  return (
    <div data-review-card="video" data-review-id={video.id}>
      <InlineVideo
        src={video.src}
        poster={video.poster}
        posterAlt={video.name}
        playLabel={t("playVideo", { name: video.name })}
        sizes="(max-width: 900px) 92vw, 700px"
        className={styles.videoCard}
      />
    </div>
  );
}
