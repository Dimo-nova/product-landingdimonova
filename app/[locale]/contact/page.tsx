import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import Container from "@/components/ui/Container";
import PageHero from "@/components/page/PageHero";
import ContactForm from "@/components/contact/ContactForm";
import ChatWaButton from "@/components/contact/ChatWaButton";
import { CONTACT } from "@/lib/config";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/contact", "seo.contact.title", "seo.contact.desc");
}

// Maps the <em> tag embedded in contact.title (messages/*.json) to a real component instead of
// dangerouslySetInnerHTML, same pattern as pricing/cases.
const richTitle = {
  em: (chunks: ReactNode) => <em className={styles.accent}>{chunks}</em>,
};

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main id="main" tabIndex={-1}>
      <PageHero eyebrow={t("contact.eyebrow")} title={t.rich("contact.title", richTitle)} intro={t("contact.intro")} />

      <section className={styles.formSection}>
        <Container>
          <div className={styles.grid}>
            <ContactForm />

            <aside className={styles.side}>
              {/* Prefer to chat */}
              <div className={styles.chatPanel}>
                <p className={styles.chatLabel}>{t("contact.side.chat_label")}</p>
                <p className={styles.chatBody}>{t("contact.side.chat_body")}</p>
                <ChatWaButton>{t("contact.side.chat_btn")}</ChatWaButton>
              </div>

              {/* Old fashioned way */}
              <div className={styles.infoPanel}>
                <p className={styles.infoLabel}>{t("contact.side.old_label")}</p>
                <div className={styles.infoList}>
                  <div>
                    <p className={styles.infoGroupLabel}>{t("contact.side.email_label")}</p>
                    <p className={styles.infoValue}>{CONTACT.email}</p>
                  </div>
                  <div>
                    <p className={styles.infoGroupLabel}>{t("contact.side.phone_calls_label")}</p>
                    <div className={styles.infoLinks}>
                      <a href={CONTACT.telES} className={styles.infoLink}>
                        {CONTACT.phoneES} <span className={styles.infoLinkMeta}>{t("contact.side.phone_lang_es")}</span>
                      </a>
                      <a href={CONTACT.telIE} className={styles.infoLink}>
                        {CONTACT.phoneIE} <span className={styles.infoLinkMeta}>{t("contact.side.phone_lang_en")}</span>
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className={styles.infoGroupLabel}>WhatsApp</p>
                    <div className={styles.infoLinks}>
                      <a href={CONTACT.whatsappES} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                        {CONTACT.phoneES} <span className={styles.infoLinkMeta}>· Pablo</span>
                      </a>
                      <a href={CONTACT.whatsappIE} target="_blank" rel="noopener noreferrer" className={styles.infoLink}>
                        {CONTACT.phoneIE} <span className={styles.infoLinkMeta}>· Sergio</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
