import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import FeaturesHero from "@/components/sections/FeaturesHero";
import FeaturesDashboard from "@/components/sections/FeaturesDashboard";
import FeaturesAnalytics from "@/components/sections/FeaturesAnalytics";
import FeaturesOnboarding from "@/components/sections/FeaturesOnboarding";
import FeaturesCta from "@/components/sections/FeaturesCta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/features", "seo.features.title", "seo.features.desc");
}

export default async function FeaturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main id="main" tabIndex={-1} className="dim-legacy">
      <FeaturesHero />
      <FeaturesDashboard />
      <FeaturesAnalytics />
      <FeaturesOnboarding />
      <FeaturesCta />
    </main>
  );
}
