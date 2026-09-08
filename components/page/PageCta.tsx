import { getTranslations, getLocale } from "next-intl/server";
import Container from "@/components/ui/Container";
import { CONTACT } from "@/lib/config";
import PageCtaButton from "./PageCtaButton";
import styles from "./PageCta.module.css";

type Props = { title: string; body: string; cta: string; source: string };

/**
 * Shared closing call-to-action band (features/about/cases): a server shell holding a rounded
 * --cream panel, with a small client button that opens the demo modal and a locale-routed
 * WhatsApp fallback, matching the pattern already used by the home page's FinalCta.
 */
export default async function PageCta({ title, body, cta, source }: Props) {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const waUrl = locale === "es" ? CONTACT.whatsappES : CONTACT.whatsappIE;

  return (
    <Container>
      <section className={styles.section}>
        <div className={styles.panel}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.body}>{body}</p>
          <div className={styles.actions}>
            <PageCtaButton source={source}>{cta}</PageCtaButton>
            <a className={styles.wa} href={waUrl} target="_blank" rel="noopener noreferrer">
              {t("chat_wa")}
            </a>
          </div>
        </div>
      </section>
    </Container>
  );
}
