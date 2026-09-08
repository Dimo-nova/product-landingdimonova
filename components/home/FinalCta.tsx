import { getTranslations, getLocale } from "next-intl/server";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import EmailCta from "./EmailCta";
import { CONTACT } from "@/lib/config";
import styles from "./FinalCta.module.css";

/**
 * The last section on the home page: same email-to-demo flow as the hero, on the light
 * `--cream` surface, plus a WhatsApp fallback. The link's whole phrase (not a duplicated
 * "WhatsApp" word) is the anchor text, matching the plain-text anchor convention already
 * used for the WhatsApp links in Footer. Its href is routed to whichever number covers the
 * visitor's locale — the same ES/IE split DemoModal and WhatsAppWidget already apply.
 */
export default async function FinalCta() {
  const t = await getTranslations("home.finalCta");
  const locale = await getLocale();
  const waUrl = locale === "es" ? CONTACT.whatsappES : CONTACT.whatsappIE;

  return (
    <section id="final-cta" className={styles.section}>
      <Container>
        <Reveal className={styles.inner}>
          <h2 className={styles.title}>{t("title")}</h2>
          <p className={styles.lead}>{t("lead")}</p>
          <div className={styles.cta}>
            <EmailCta source="final-cta" />
          </div>
          <p className={styles.whatsapp}>
            <a className={styles.waLink} href={waUrl} target="_blank" rel="noopener noreferrer">
              {t("whatsapp")}
            </a>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
