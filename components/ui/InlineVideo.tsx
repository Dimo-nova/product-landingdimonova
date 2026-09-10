"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./InlineVideo.module.css";

type Props = {
  src: string;
  /** Local poster frame. Shown before playback and handed to the <video> as its own poster. */
  poster: string;
  posterAlt: string;
  /** Accessible name for the play button. */
  playLabel: string;
  /** `sizes` for the poster's next/image. */
  sizes?: string;
  className?: string;
};

/**
 * A video that plays where it stands, with no modal.
 *
 * Until the visitor presses play this is just the local poster image and a button: no `<video>`
 * element is mounted, so the .mp4 (which lives on the project's Supabase media bucket) is never
 * requested on page load. That is what keeps every page free of third-party requests until a
 * deliberate user action, which both `e2e/tokens.spec.ts` and the cookie policy depend on.
 *
 * On press the poster is replaced by a real `<video controls>`. Playback is started from a ref
 * rather than by trusting the `autoPlay` attribute: the element mounts in the same task as the
 * click, so the user activation still applies and audio is allowed, but a browser that refuses
 * simply leaves the controls sitting there for a second press instead of throwing.
 */
export default function InlineVideo({ src, poster, posterAlt, playLabel, sizes, className }: Props) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing) return;
    videoRef.current?.play().catch(() => {
      // Autoplay refused: the controls are already visible, so the visitor can press play again.
    });
  }, [playing]);

  return (
    <div className={[styles.frame, className].filter(Boolean).join(" ")}>
      {playing ? (
        <video ref={videoRef} className={styles.video} src={src} poster={poster} controls playsInline preload="none" />
      ) : (
        <>
          <Image src={poster} alt={posterAlt} fill sizes={sizes} className={styles.poster} />
          <button type="button" className={styles.playBtn} aria-label={playLabel} onClick={() => setPlaying(true)}>
            <span aria-hidden="true">▶</span>
          </button>
        </>
      )}
    </div>
  );
}
