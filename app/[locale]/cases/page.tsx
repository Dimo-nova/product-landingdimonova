import { redirect } from "next/navigation";

// Página oculta hasta tener suficientes reviews. Para reactivar:
// 1. Borrar este redirect
// 2. Descomentar el bloque de abajo
// 3. Añadir nav.cases en Header, MobileNav y Footer

export default function CasesPage() {
  redirect("/");
}

/*
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/meta";
import CasesHero from "@/components/sections/CasesHero";
import CasesFeatured from "@/components/sections/CasesFeatured";
import CasesGrid from "@/components/sections/CasesGrid";
import CasesCta from "@/components/sections/CasesCta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "/cases", "seo.cases.title", "seo.cases.desc");
}

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main id="main" tabIndex={-1} className="dim-legacy">
      <CasesHero />
      <CasesFeatured />
      <CasesGrid />
      <CasesCta />
    </main>
  );
}
*/
