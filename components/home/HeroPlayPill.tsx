"use client";
import pillStyles from "@/components/ui/Pill.module.css";
import styles from "./HeroPlayPill.module.css";
import { openVideo } from "@/lib/events";

/** The hero's "how it started" pill: a real <button> (Pill itself only renders <span>/<Link>) that opens the story video. */
export default function HeroPlayPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={[pillStyles.pill, pillStyles.dark, pillStyles.md].join(" ")}
      onClick={() => openVideo({ src: "/assets/videos/how-it-started.mp4", title: label, orientation: "landscape" })}
    >
      <span className={styles.icon} aria-hidden="true">▶</span>
      {label}
    </button>
  );
}
