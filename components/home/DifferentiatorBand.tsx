import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Marquee from "@/components/ui/Marquee";
import styles from "./DifferentiatorBand.module.css";

type DiffItem = { title: string; body: string };

/**
 * One claim pill. Non-interactive (it does nothing on activation) but focusable, so it carries
 * `role="group"` rather than `button`/`link`. The accessible name is the title + body joined
 * into one string via `aria-label`: that keeps the explanation reachable to assistive tech at
 * all times, independent of the CSS hover/focus-visible state that shows it to sighted users
 * (a screen reader has no "hover"). The visible `data-diff-body` span is then redundant for
 * AT and marked `aria-hidden` to avoid it being read out a second time.
 */
function ClaimPill({ item }: { item: DiffItem }) {
  return (
    <div className={styles.pill} data-diff-item tabIndex={0} role="group" aria-label={`${item.title}. ${item.body}`}>
      <span className={styles.claimTitle} data-diff-title>
        {item.title}
      </span>
      <span className={styles.claimBody} data-diff-body aria-hidden="true">
        {item.body}
      </span>
    </div>
  );
}

/**
 * "What nobody else does" band: two opposing marquees of claim pills. The first five items
 * scroll left, the last five scroll right. Each pill expands on hover/focus to show its body
 * as an absolutely positioned panel below it, so the pill's own box (and therefore the row)
 * never changes size — see DifferentiatorBand.module.css for why the simpler
 * `visibility: hidden; height: 0` -> `auto` approach was measured and rejected.
 */
export default async function DifferentiatorBand() {
  const t = await getTranslations();
  const items = t.raw("home.diff.items") as DiffItem[];
  const left = items.slice(0, 5);
  const right = items.slice(5, 10);

  return (
    <section data-diff className={styles.section}>
      <Container>
        <Reveal className={styles.head}>
          <h2 className={styles.heading}>{t("home.diff.title")}</h2>
          <p className={styles.lead}>{t("home.diff.lead")}</p>
        </Reveal>
      </Container>

      <div className={styles.rows}>
        <Marquee speed={45} direction="left" className={styles.marquee}>
          {left.map((item) => (
            <ClaimPill key={item.title} item={item} />
          ))}
        </Marquee>
        <Marquee speed={50} direction="right" className={styles.marquee}>
          {right.map((item) => (
            <ClaimPill key={item.title} item={item} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
