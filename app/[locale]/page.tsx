import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import Hero from "@/components/home/Hero";
import LogoStrip from "@/components/home/LogoStrip";
import ServiceCards from "@/components/home/ServiceCards";
import AiPanel from "@/components/home/AiPanel";
import BalamoShowcase from "@/components/home/BalamoShowcase";
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
    <main id="main" tabIndex={-1} className="dim-legacy">
      <Hero />
      <LogoStrip />
      <ServiceCards />
      <AiPanel />
      <BalamoShowcase />
      <Differentiator />
      {/* <SocialProof /> */}
      <PricingTeaser />
      <HomeCta />
    </main>
  );
}
