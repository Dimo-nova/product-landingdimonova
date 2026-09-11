import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect, routing } from "@/lib/routing";
import { pageMetadata } from "@/lib/meta";
import { FEATURES_PUBLISHED } from "@/lib/config";
import { SERVICES, isServiceSlug } from "@/lib/services";
import Annotated from "@/components/ui/Annotated";
import PageCta from "@/components/page/PageCta";
import ServiceHero from "@/components/features/ServiceHero";
import { ServiceArt } from "@/components/home/ServiceArt";
import MenuSections from "@/components/features/MenuSections";
import OrderingSections from "@/components/features/OrderingSections";
import ReviewsSections from "@/components/features/ReviewsSections";
import styles from "./page.module.css";

/** The three slugs come from lib/services.ts and nowhere else; anything past them is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SERVICES.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) return {};
  return pageMetadata(
    locale,
    `/features/${slug}`,
    `features.pages.${slug}.seo.title`,
    `features.pages.${slug}.seo.desc`,
  );
}

/**
 * One route for the three things Dimonova sells. The shell is shared — a dark hero that owns the
 * page's single <h1> and its demo CTA, then the page's own sections, then the closing CTA band —
 * but each slug brings its own hero illustration, its own background wash and its own sections,
 * so the three read as three pages rather than one template with the nouns swapped.
 *
 * The hero illustration is the same scene as the service's card on the home page
 * (components/home/ServiceArt.tsx), drawn large: the card is the thumbnail, this is the poster,
 * and a visitor who clicked the card lands on the picture they clicked.
 */
export default async function ServicePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  // See FEATURES_PUBLISHED in lib/config.ts: the service walkthroughs live on the home page now.
  if (!FEATURES_PUBLISHED) redirect({ href: "/", locale });
  setRequestLocale(locale);

  const t = await getTranslations(`features.pages.${slug}`);
  const tCommon = await getTranslations("common");

  const art = (
    <div className={styles.art}>
      <ServiceArt slug={slug} />
    </div>
  );

  return (
    <main id="main" tabIndex={-1} className={styles.page}>
      <ServiceHero
        tone={slug}
        eyebrow={t("eyebrow")}
        // <mark> is the annotated word, same contract as the home hero's headline.
        title={t.rich("title", { mark: (chunks) => <Annotated>{chunks}</Annotated> })}
        lead={t("lead")}
        pills={t.raw("pills") as string[]}
        ctaLabel={tCommon("demo_arrow")}
        source={`features-${slug}`}
        art={art}
      />

      {slug === "menu" && <MenuSections />}
      {slug === "ordering" && <OrderingSections />}
      {slug === "reviews" && <ReviewsSections />}

      <PageCta title={t("cta.title")} body={t("cta.body")} cta={tCommon("demo_arrow")} source={`features-${slug}-cta`} />
    </main>
  );
}
