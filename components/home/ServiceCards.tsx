import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";
import ServiceCard from "./ServiceCard";
import styles from "./ServiceCards.module.css";

/** The three service cards: what Dimonova builds, connects and keeps running. Each one opens its walkthrough modal (ServiceModal). */
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
          {SERVICES.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.06} className={styles.cardWrap}>
              <ServiceCard
                slug={service.slug}
                title={t(`services.${service.slug}.title`)}
                line={t(`services.${service.slug}.line`)}
                bullets={t.raw(`services.${service.slug}.bullets`) as string[]}
                cta={t("services.modal.open")}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}
