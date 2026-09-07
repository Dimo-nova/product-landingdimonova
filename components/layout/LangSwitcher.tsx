"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, routing } from "@/lib/routing";
import styles from "./LangSwitcher.module.css";

const LABELS: Record<string, string> = { en: "English", es: "Español", de: "Deutsch", fr: "Français", pt: "Português" };

export default function LangSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  function pick(code: string) {
    setOpen(false);
    router.replace(pathname, { locale: code });
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={t("language")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">🌐</span>
        <span>{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {routing.locales.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitem"
              data-lang={code}
              aria-current={code === locale}
              className={styles.item}
              onClick={() => pick(code)}
            >
              <span className={styles.code}>{code.toUpperCase()}</span>
              <span>{LABELS[code]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
