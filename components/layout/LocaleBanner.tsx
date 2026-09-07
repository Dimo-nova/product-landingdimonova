"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { motion } from "motion/react";
import { routing, usePathname, useRouter } from "@/lib/routing";
import { BANNER_COPY } from "@/lib/bannerCopy";
import styles from "./LocaleBanner.module.css";

type Locale = (typeof routing.locales)[number];
const COOKIE = "dim-lang-dismissed";

function hasCookie(name: string) {
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${name}=`));
}

export default function LocaleBanner() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [preferred, setPreferred] = useState<Locale | null>(null);

  useEffect(() => {
    if (hasCookie(COOKIE)) return;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    const match = langs
      .map((l) => l.slice(0, 2).toLowerCase())
      .find((l): l is Locale => (routing.locales as readonly string[]).includes(l));
    if (match && match !== locale) setPreferred(match);
  }, [locale]);

  if (!preferred) return null;

  const dismiss = () => {
    document.cookie = `${COOKIE}=1; max-age=7776000; path=/; samesite=lax`;
    setPreferred(null);
  };

  return (
    <motion.div
      className={styles.bar}
      role="status"
      data-locale-banner
      initial={{ y: -44, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span lang={preferred}>{BANNER_COPY[preferred]}</span>
      <button type="button" className={styles.change} lang={preferred} onClick={() => router.replace(pathname, { locale: preferred })}>
        {BANNER_LABELS[preferred].change}
      </button>
      <button type="button" className={styles.close} aria-label={BANNER_LABELS[preferred].close} onClick={dismiss}>×</button>
    </motion.div>
  );
}

// Button labels must also be in the *preferred* language (the visitor may not read the current one).
const BANNER_LABELS: Record<Locale, { change: string; close: string }> = {
  en: { change: "Switch", close: "Dismiss" },
  es: { change: "Cambiar", close: "Cerrar" },
  de: { change: "Wechseln", close: "Schließen" },
  fr: { change: "Changer", close: "Fermer" },
  pt: { change: "Mudar", close: "Fechar" },
};
