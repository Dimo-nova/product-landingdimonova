import Marquee from "@/components/ui/Marquee";
import styles from "./DifferentiatorBand.module.css";

type DiffItem = { title: string; body: string };

/**
 * One claim pill. Title and body are both always visible rather than revealed on hover: the
 * hover state stops the strip so a claim can be read, it does not have to also uncover the
 * text. Static text means the pill needs no focus handling, no `role` and no `aria-label`
 * reconstructing what it says.
 */
function ClaimPill({ item }: { item: DiffItem }) {
  return (
    <div className={styles.pill} data-diff-item>
      <span className={styles.claimTitle} data-diff-title>
        {item.title}
      </span>
      <span className={styles.claimBody} data-diff-body>
        {item.body}
      </span>
    </div>
  );
}

/** The differentiator band's two opposing rows of claim pills. */
export default function DiffMarquees({ left, right }: { left: DiffItem[]; right: DiffItem[] }) {
  return (
    <div className={styles.rows}>
      <Marquee speed={70} direction="left" repeat={3} pauseOnHover className={styles.marquee}>
        {left.map((item) => (
          <ClaimPill key={item.title} item={item} />
        ))}
      </Marquee>
      <Marquee speed={78} direction="right" repeat={3} pauseOnHover className={styles.marquee}>
        {right.map((item) => (
          <ClaimPill key={item.title} item={item} />
        ))}
      </Marquee>
    </div>
  );
}
