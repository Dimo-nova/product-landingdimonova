import type { ReactNode } from "react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/page/Eyebrow";
import ServiceHeroCta from "./ServiceHeroCta";
import styles from "./ServiceHero.module.css";

type Props = {
  eyebrow: string;
  /** `t.rich(...)` result — the annotated word is wrapped in <mark> in the message. */
  title: ReactNode;
  lead: string;
  /** Three short claims shown as chips under the CTA. */
  pills: string[];
  ctaLabel: string;
  /** `openDemo` source tag, e.g. "features-menu". */
  source: string;
  /** The page's own decorative illustration. Each service page passes a different one. */
  art: ReactNode;
  /**
   * Tints the hero's background wash. The three pages share this shell but must not open
   * identically, so the gradient's colour and origin change per service.
   */
  tone: "menu" | "ordering" | "reviews";
};

const TONE_CLASS = { menu: "toneMenu", ordering: "toneOrdering", reviews: "toneReviews" } as const;

/**
 * Shared dark, full-bleed hero for the three `/features/[slug]` pages: it owns each page's one
 * <h1> and the demo CTA. Everything that makes a page recognisable — the headline, the chips
 * and the `art` illustration — is passed in, so this stays a frame rather than a template with
 * three sets of strings poured into it.
 */
export default function ServiceHero({ eyebrow, title, lead, pills, ctaLabel, source, art, tone }: Props) {
  return (
    <Container>
      <section className={[styles.section, styles[TONE_CLASS[tone]]].join(" ")}>
        <div className={styles.wash} aria-hidden="true" />
        <div className={styles.grid}>
          <Reveal className={styles.copy}>
            {/* tone="dark": this sits on the --ink panel, not the page's light ground. */}
            <Eyebrow tone="dark">{eyebrow}</Eyebrow>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lead}>{lead}</p>
            <div className={styles.actions}>
              <ServiceHeroCta source={source}>{ctaLabel}</ServiceHeroCta>
            </div>
            <ul className={styles.pills}>
              {pills.map((pill) => (
                <li key={pill} className={styles.pill}>
                  {pill}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.12} className={styles.art}>
            {art}
          </Reveal>
        </div>
      </section>
    </Container>
  );
}
