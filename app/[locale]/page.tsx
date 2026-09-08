import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import Hero from "@/components/home/Hero";
import LogoStrip from "@/components/home/LogoStrip";
import ServiceCards from "@/components/home/ServiceCards";
import AiPanel from "@/components/home/AiPanel";
import BalamoShowcase from "@/components/home/BalamoShowcase";
import DifferentiatorBand from "@/components/home/DifferentiatorBand";
import Reviews from "@/components/home/Reviews";
import AiCompare from "@/components/home/AiCompare";
import FinalCta from "@/components/home/FinalCta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "", "seo.home.title", "seo.home.desc");
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main id="main" tabIndex={-1}>
      <Hero />
      <LogoStrip />
      <ServiceCards />
      <AiPanel />
      <BalamoShowcase />
      <DifferentiatorBand />
      <Reviews />
      <AiCompare />
      <FinalCta />
    </main>
  );
}
