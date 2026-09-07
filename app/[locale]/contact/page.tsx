import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import ContactHero from "@/components/sections/ContactHero";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/contact", "seo.contact.title", "seo.contact.desc");
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main id="main" tabIndex={-1} className="dim-legacy">
      <ContactHero />
      <ContactForm />
    </main>
  );
}
