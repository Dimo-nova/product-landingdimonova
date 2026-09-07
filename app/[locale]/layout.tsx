import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/lib/routing";
import { fontVars } from "@/lib/fonts";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import DemoModal from "@/components/DemoModal";
import VideoModal from "@/components/VideoModal";
import Providers from "@/components/layout/Providers";
import LocaleBanner from "@/components/layout/LocaleBanner";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <html lang={locale} className={fontVars}>
      <body>
        <a href="#main" className="u-visually-hidden skip-link">{t("common.skipToContent")}</a>
        <NextIntlClientProvider>
          <Providers>
            <LocaleBanner />
            <Header />
            {children}
            <Footer />
            <WhatsAppWidget />
            <DemoModal />
            <VideoModal />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
