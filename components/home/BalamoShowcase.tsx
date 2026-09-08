import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import DeviceFrame from "@/components/ui/DeviceFrame";
import Eyebrow from "@/components/page/Eyebrow";
import BalamoPills from "./BalamoPills";
import styles from "./BalamoShowcase.module.css";

type Stat = { value: string; label: string };

/**
 * The Bálamo client-case showcase: a real menu on a phone with two decorative coral rings and
 * five floating pills on the left, the pitch and three headline numbers on the right. Modelled
 * on the last.app client showcase.
 *
 * The rings and the pills' bob loop are purely decorative motion — the rings are `aria-hidden`,
 * and the bob animation is driven through `motion`'s `animate` prop, which the app-wide
 * `MotionConfig reducedMotion="user"` (see components/layout/Providers.tsx) automatically turns
 * off under `prefers-reduced-motion`, so the pills sit still rather than bob.
 *
 * The three stat values are the literal placeholder "—": the real figures haven't been supplied
 * yet, so they're rendered as-is rather than invented (see CLAUDE.md).
 */
export default async function BalamoShowcase() {
  const t = await getTranslations();
  const pills = t.raw("home.balamo.pills") as string[];
  // A stat whose value is still the "—" placeholder is dropped rather than rendered: three
  // giant dashes under the copy read as a broken component, not as "figures pending". The
  // block reappears on its own once real numbers land in home.balamo.stats (see TODO.md).
  const stats = (t.raw("home.balamo.stats") as Stat[]).filter((stat) => stat.value !== "—");

  return (
    <section id="balamo" className={styles.section}>
      <Container>
        <div className={styles.layout}>
          <Reveal className={styles.visual}>
            <div className={styles.rings} aria-hidden="true">
              <span className={[styles.ring, styles.ringSmall].join(" ")} />
              <span className={[styles.ring, styles.ringLarge].join(" ")} />
            </div>
            <div className={styles.phoneWrap}>
              <DeviceFrame kind="phone" src="/assets/cases/balamo-phone.png" alt={t("alt.balamoPhone")} />
            </div>
            <BalamoPills labels={pills} />
          </Reveal>

          <Reveal delay={0.1} className={styles.copy}>
            <div className={styles.brandRow}>
              <Eyebrow as="span" className={styles.eyebrowInline}>
                {t("home.balamo.eyebrow")}
              </Eyebrow>
              {/* alt="": the visible "Case: Bálamo Restaurante" eyebrow right above it already
                  carries the meaning, so real alt text would announce the name twice. */}
              <img src="/assets/Logos/balamo.svg" alt="" className={styles.logo} />
            </div>
            <h2 className={styles.title}>{t("home.balamo.title")}</h2>
            <p className={styles.body}>{t("home.balamo.body")}</p>
            <Button href="/cases" variant="outline">
              {t("home.balamo.cta")}
            </Button>
            <hr className={styles.hr} aria-hidden="true" />
            {stats.length > 0 && (
            <div className={styles.stats}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
