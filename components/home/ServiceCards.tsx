import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { Link } from "@/lib/routing";
import { SERVICES } from "@/lib/services";
import { ServiceArt } from "./ServiceArt";
import styles from "./ServiceCards.module.css";

/** The three service cards: what Dimonova builds, connects and keeps running. Each one links to its own page under `/features/[slug]`. */
export default async function ServiceCards() {
  const t = await getTranslations();

  return (
    <Container>
      <section id="services" className={styles.section}>
        <Reveal className={styles.head}>
          <h2>{t("home.services.title")}</h2>
          <p className={styles.lead}>{t("home.services.lead")}</p>
        </Reveal>

        <div className={styles.grid}>
          {SERVICES.map((service, i) => {
            const title = t(`services.${service.slug}.title`);
            return (
              <Reveal key={service.slug} delay={i * 0.06} className={styles.cardWrap}>
                <Link href={service.href} className={styles.card}>
                  {/* A drawn illustration per service (components/home/ServiceArt.tsx), not a
                      screenshot: none exists for these three yet, and none would survive the
                      card's coral gradient anyway. aria-hidden so it doesn't get read out ahead
                      of the link's own name, which the heading below already carries. */}
                  <div className={styles.media} aria-hidden="true">
                    <ServiceArt slug={service.slug} />
                  </div>
                  <div className={styles.body}>
                    <h3>{title}</h3>
                    <p data-card-body>{t(`services.${service.slug}.line`)}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </Container>
  );
}
