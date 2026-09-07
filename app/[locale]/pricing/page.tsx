import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import PricingHero from "@/components/sections/PricingHero";
import PricingIncluded from "@/components/sections/PricingIncluded";
import PricingShape from "@/components/sections/PricingShape";
import PricingStrip from "@/components/sections/PricingStrip";
import PricingFaq from "@/components/sections/PricingFaq";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/pricing", "seo.pricing.title", "seo.pricing.desc");
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main id="main" tabIndex={-1} className="dim-legacy">
      <PricingHero />
      <PricingIncluded />
      <PricingShape />
      <PricingStrip />
      <PricingFaq />
    </main>
  );
}
