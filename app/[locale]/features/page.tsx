import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import { redirect } from "@/lib/routing";
import { FEATURES_PUBLISHED } from "@/lib/config";
import { SERVICES } from "@/lib/services";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import PageHero from "@/components/page/PageHero";
import PageCta from "@/components/page/PageCta";
import ServiceCard from "@/components/home/ServiceCard";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/features", "seo.features.title", "seo.features.desc");
}

/**
 * Index of the three things Dimonova sells. It used to be a four-block tour of the product; the
 * owner collapsed the offer to three services, each of which now has a page of its own under
 * `/features/[slug]`, so this page's only job is to hand a visitor to the right one.
 *
 * The cards read from lib/services.ts — the same registry the mega menu, the mobile nav, the
 * footer and the home page's service cards use — so a fourth service would appear here on its own.
 * They are the home page's own cards (components/home/ServiceCard.tsx), illustration and all, with
 * a "see how it works" line added: a visitor who has seen the home recognises them at once.
 */
export default async function FeaturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // See FEATURES_PUBLISHED in lib/config.ts: everything this page said is on the home page now.
  if (!FEATURES_PUBLISHED) redirect({ href: "/", locale });
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main id="main" tabIndex={-1}>
      <PageHero eyebrow={t("features.eyebrow")} title={t("features.title")} intro={t("features.intro")} />

      <Container>
        <section className={styles.index}>
          <ul className={styles.grid}>
            {SERVICES.map((service, i) => (
              <li key={service.slug} className={styles.cell}>
                <Reveal delay={i * 0.06} className={styles.reveal}>
                  <ServiceCard
                    slug={service.slug}
                    title={t(`services.${service.slug}.title`)}
                    line={t(`services.${service.slug}.line`)}
                    bullets={t.raw(`services.${service.slug}.bullets`) as string[]}
                    cta={t("services.modal.open")}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <PageCta title={t("features.cta.title")} body={t("features.cta.body")} cta={t("common.demo_arrow")} source="features-cta" />
    </main>
  );
}
