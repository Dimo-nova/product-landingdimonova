import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import AboutHero from "@/components/sections/AboutHero";
import AboutWhy from "@/components/sections/AboutWhy";
import AboutPrinciples from "@/components/sections/AboutPrinciples";
// import AboutTeam from "@/components/sections/AboutTeam";
import AboutCta from "@/components/sections/AboutCta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/about", "seo.about.title", "seo.about.desc");
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main className="dim-legacy">
      <AboutHero />
      <AboutWhy />
      <AboutPrinciples />
      {/* <AboutTeam /> */}
      <AboutCta />
    </main>
  );
}
