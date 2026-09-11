"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import styles from "./StoryHero.module.css";

type Props = {
  title: string;
  /** The story video and its local poster. */
  src: string;
  poster: string;
  posterAlt: string;
};

type State = "idle" | "playing" | "paused";

/**
 * The about page's hero: the first client's story video across the whole panel, with the page's
 * copy over its lower-left corner. Nothing plays on its own — the panel opens on the local
 * poster with a play button, and the .mp4 (on the project's Supabase bucket, see
 * HERO_VIDEO_SRC) is only requested once someone presses it. It then plays in place, with
 * sound. A click anywhere on the running video pauses it and the big play button comes back;
 * there is no separate pause control, only a mute toggle in the corner. The video is focusable
 * while it runs, and Enter/Space pause it, so the keyboard has the same route as the mouse.
 * Only the page's title sits over the picture.
 *
 * Playback is started from a ref rather than by trusting `autoPlay`: the element mounts in the
 * same task as the press, so the user activation still applies and audio is allowed, but a
 * browser that refuses simply leaves the play button where it is for a second press.
 */
export default function StoryHero({ title, src, poster, posterAlt }: Props) {
  const t = useTranslations("about.hero");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>("idle");
  const [muted, setMuted] = useState(false);
  const started = state !== "idle";

  useEffect(() => {
    if (state !== "playing") return;
    videoRef.current?.play().catch(() => setState("paused"));
  }, [state]);

  const toggle = () => {
    if (state === "playing") {
      videoRef.current?.pause();
      setState("paused");
    } else {
      setState("playing");
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  };

  return (
    <Container className={styles.wrap}>
      <section className={styles.section} data-story-hero data-state={state}>
        {started ? (
          <video
            ref={videoRef}
            className={[styles.video, styles.videoLive].join(" ")}
            src={src}
            poster={poster}
            playsInline
            preload="metadata"
            muted={muted}
            tabIndex={0}
            aria-label={state === "playing" ? t("pause") : t("play")}
            onClick={toggle}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }}
            onPlay={() => setState("playing")}
            onPause={() => setState((s) => (s === "playing" ? "paused" : s))}
            onEnded={() => setState("idle")}
          />
        ) : (
          <Image src={poster} alt={posterAlt} fill priority sizes="100vw" className={styles.video} />
        )}
        <div className={styles.scrim} aria-hidden="true" />

        {/* The big play button, whenever the story is not running. */}
        {state !== "playing" && (
          <button type="button" className={styles.playBig} aria-label={t("play")} onClick={toggle}>
            <PlayIcon />
          </button>
        )}

        {/* The one small control once the story has started: mute. */}
        {started && (
          <div className={styles.controls}>
            <button type="button" className={styles.control} aria-label={muted ? t("unmute") : t("mute")} aria-pressed={muted} onClick={toggleMute} data-mute>
              {muted ? <MutedIcon /> : <SoundIcon />}
            </button>
          </div>
        )}

        <div className={styles.copy}>
          <h1 className={styles.title}>{title}</h1>
        </div>
      </section>
    </Container>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" stroke="none" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" stroke="none" />
      <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
    </svg>
  );
}
