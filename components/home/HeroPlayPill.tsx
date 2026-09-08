"use client";
import pillStyles from "@/components/ui/Pill.module.css";
import styles from "./HeroPlayPill.module.css";
import { openVideo } from "@/lib/events";

/**
 * The hero's "how it started" pill: a real <button> (Pill itself only renders <span>/<Link>) that
 * opens the story video. The caller only renders this component once it has a real `src` — see
 * `HERO_VIDEO_SRC` in `lib/config.ts`.
 */
export default function HeroPlayPill({ label, src, poster }: { label: string; src: string; poster?: string }) {
  return (
    <button
      type="button"
      className={[pillStyles.pill, pillStyles.dark, pillStyles.md].join(" ")}
      onClick={() => openVideo({ src, poster, title: label, orientation: "landscape" })}
    >
      <span className={styles.icon} aria-hidden="true">▶</span>
      {label}
    </button>
  );
}
