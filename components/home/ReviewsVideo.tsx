"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { openVideo } from "@/lib/events";
import type { VideoReview } from "./reviews-types";
import styles from "./Reviews.module.css";

/**
 * The video half of a review row: the local poster frame plus a coral play button. Never a
 * mounted `<video>` — the .mp4 lives on Supabase and must not be requested on page load, so
 * pressing the button dispatches `openVideo` and the globally-mounted `VideoModal` owns
 * playback. The clips were filmed landscape, hence `orientation: "landscape"`.
 *
 * This is the only client-side piece of the section; everything around it is server-rendered.
 */
export default function ReviewsVideo({ video }: { video: VideoReview }) {
  const t = useTranslations("home.reviews");

  return (
    <div className={styles.videoCard} data-review-card="video" data-review-id={video.id}>
      <Image
        src={video.poster}
        alt={video.name}
        fill
        sizes="(max-width: 900px) 92vw, 830px"
        className={styles.poster}
      />
      <button
        type="button"
        className={styles.playBtn}
        aria-label={t("playVideo", { name: video.name })}
        onClick={() =>
          openVideo({
            src: video.src,
            poster: video.poster,
            title: video.name,
            orientation: "landscape",
          })
        }
      >
        <span aria-hidden="true">▶</span>
      </button>
    </div>
  );
}
