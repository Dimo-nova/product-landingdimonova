import Pill from "@/components/ui/Pill";
import styles from "./BalamoShowcase.module.css";

/* Read from the upper left round the flanks, with the fifth straight up: nothing below the tablet. */
const POSITIONS = ["upLeft", "upRight", "left", "right", "top"] as const;

/**
 * The five labelled pills around the Bálamo tablet, placed on the inner ring at symmetrical
 * angles (see `.pillSlot` and the angle classes in BalamoShowcase.module.css). Static: they used
 * to bob on a loop and the owner asked for them to hold still, which also means this no longer
 * needs to be a client component at all.
 */
export default function BalamoPills({ labels }: { labels: string[] }) {
  return (
    <div className={styles.pills}>
      {labels.map((label, i) => (
        <div key={label} className={[styles.pillSlot, styles[POSITIONS[i % POSITIONS.length]]].join(" ")}>
          <span data-balamo-pill>
            <Pill tone="light">{label}</Pill>
          </span>
        </div>
      ))}
    </div>
  );
}
