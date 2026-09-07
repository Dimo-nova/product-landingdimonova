import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import Hero from "@/components/sections/Hero";
import LogoStrip from "@/components/sections/LogoStrip";
import FeaturesSummary from "@/components/sections/FeaturesSummary";
import HowItWorks from "@/components/sections/HowItWorks";
import Differentiator from "@/components/sections/Differentiator";
// import SocialProof from "@/components/sections/SocialProof";
import PricingTeaser from "@/components/sections/PricingTeaser";
import HomeCta from "@/components/sections/HomeCta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "", "seo.home.title", "seo.home.desc");
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="dim-legacy">
      <Hero />
      <LogoStrip />
      <FeaturesSummary />
      <HowItWorks />
      <Differentiator />
      {/* <SocialProof /> */}
      <PricingTeaser />
      <HomeCta />
    </main>
  );
}
