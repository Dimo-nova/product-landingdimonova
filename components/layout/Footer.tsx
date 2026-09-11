import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/routing";
import { CONTACT, ADMIN_URL, CASES_PUBLISHED, COMPANY, FEATURES_PUBLISHED } from "@/lib/config";
import { SERVICES } from "@/lib/services";
import ServiceButton from "./ServiceButton";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import LangSwitcher from "./LangSwitcher";
import styles from "./Footer.module.css";

export default async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <nav className={styles.grid} aria-label="Footer">
            <div className={styles.col}>
              <h2>{t("footer.colProduct")}</h2>
              <ul>
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    {FEATURES_PUBLISHED ? (
                      <Link href={s.href}>{t(`services.${s.slug}.title`)}</Link>
                    ) : (
                      /* Unpublished service pages: opens the service walkthrough instead. */
                      <ServiceButton slug={s.slug} className={styles.serviceBtn}>{t(`services.${s.slug}.title`)}</ServiceButton>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.col}>
              <h2>{t("footer.colCompany")}</h2>
              <ul>
                <li><Link href="/about">{t("nav.about")}</Link></li>
                <li><Link href="/clients">{t("nav.clients")}</Link></li>
                {/* Only while the page is published: unpublished, /cases redirects home, and a
                    footer link that bounces you back to where you were is worse than no link. */}
                {CASES_PUBLISHED && <li><Link href="/cases">{t("nav.cases")}</Link></li>}
                <li><Link href="/pricing">{t("nav.pricing")}</Link></li>
                <li><Link href="/contact">{t("nav.contact")}</Link></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h2>{t("footer.colResources")}</h2>
              <ul>
                <li><Link href="/pricing#faq">{t("nav.mega.faq")}</Link></li>
                <li><Link href="/#ai-compare">{t("nav.mega.aiCompare")}</Link></li>
                <li><a href={ADMIN_URL} target="_blank" rel="noopener noreferrer">{t("nav.clientAccess")}</a></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h2>{t("footer.colLegal")}</h2>
              <ul>
                <li><Link href="/legal/privacy">{t("footer.privacy")}</Link></li>
                <li><Link href="/legal/cookies">{t("footer.cookies")}</Link></li>
                <li><Link href="/legal/terms">{t("footer.terms")}</Link></li>
              </ul>
            </div>
            <div className={styles.col}>
              <h2>{t("footer.colContact")}</h2>
              <ul>
                <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                <li><a href={CONTACT.whatsappES} target="_blank" rel="noopener noreferrer">{t("footer.whatsappEs")}</a></li>
                <li><a href={CONTACT.whatsappIE} target="_blank" rel="noopener noreferrer">{t("footer.whatsappIe")}</a></li>
              </ul>
              <div className={styles.lang}><LangSwitcher /></div>
            </div>
          </nav>
          <hr className={styles.rule} />
          <div className={styles.meta}>
            <span>{t("footer.copyright", { year })}</span>
            <span>{t("footer.madeIn")}</span>
          </div>
          <div className={styles.business} data-business-details>
            {COMPANY.legalName} · {COMPANY.taxId} · {COMPANY.address}
          </div>
        </div>
        {/* The wordmark's reveal starts 24px lower than its resting position (see lib/motion.ts).
            A transform does not shrink back into the layout, so before the animation runs that
            offset pushed the image past the footer's own box and left a strip of the white page
            background showing under the near-black footer. Clipping it here rather than on
            `.footer` itself keeps the footer's language dropdown free to overflow. */}
        <div className={styles.markClip}>
          <Reveal>
            <img className={styles.wordmark} data-wordmark src="/assets/logo_horizontal.svg" alt="" aria-hidden="true" />
          </Reveal>
        </div>
      </Container>
    </footer>
  );
}
