import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import DeviceFrame from "@/components/ui/DeviceFrame";
import Eyebrow from "@/components/page/Eyebrow";
import BalamoPills from "./BalamoPills";
import styles from "./BalamoShowcase.module.css";

type Stat = { value: string; label: string };

/**
 * The Bálamo client-case showcase: the real menu on the left — the VIP-area tablet, tilted a
 * few degrees like a product shot, and a phone in front of it opened on one dish, so the food is
 * in the picture — with the five things the case is about as tags round the devices
 * (BalamoPills). The pitch and the headline numbers sit on the right.
 *
 * Nothing here moves: the tags used to bob and the owner asked for them to hold still, and the
 * tilt is a plain CSS transform, not an animation. The warm glow behind the devices is decorative
 * and `aria-hidden`; the two device images carry real alt text because they are the case.
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

  // Three grid items rather than two, so a phone can show them in reading order — the case
  // label, logo and headline first, then the devices, then the pitch — while on desktop the
  // devices take the left column and the other two stack on the right.
  return (
    <section id="balamo" className={styles.section}>
      <Container>
        <div className={styles.layout}>
          <Reveal className={styles.head}>
            <div className={styles.brandRow}>
              <Eyebrow as="span" className={styles.eyebrowInline}>
                {t("home.balamo.eyebrow")}
              </Eyebrow>
              {/* alt="": the visible "Case: Bálamo Restaurante" eyebrow right above it already
                  carries the meaning, so real alt text would announce the name twice. */}
              <img src="/assets/Logos/balamo.svg" alt="" className={styles.logo} />
            </div>
            <h2 className={styles.title}>{t("home.balamo.title")}</h2>
          </Reveal>

          <Reveal delay={0.05} className={styles.visual}>
            <div className={styles.stage}>
              <span className={styles.glow} aria-hidden="true" />
              <div className={styles.tablet}>
                <DeviceFrame kind="tablet" landscape src="/assets/cases/balamo-tablet-landscape.webp" alt={t("alt.balamoTablet")} />
              </div>
              <div className={styles.phone}>
                <DeviceFrame kind="phone" compact src="/assets/cases/balamo-phone-dish.webp" alt={t("alt.balamoPhone")} />
              </div>
            </div>
            <BalamoPills labels={pills} />
          </Reveal>

          <Reveal delay={0.1} className={styles.copy}>
            <p className={styles.body}>{t("home.balamo.body")}</p>
            {/* No "see the case" button: /cases is unpublished again (CASES_PUBLISHED in
                lib/config.ts), so the only thing that button could do is bounce a visitor back to
                the home page they are already on. */}
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
