"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Link, usePathname } from "@/lib/routing";
import { SERVICES } from "@/lib/services";
import { openDemo } from "@/lib/events";
import { ADMIN_URL, FEATURES_PUBLISHED } from "@/lib/config";
import ServiceButton from "./ServiceButton";
import Button from "@/components/ui/Button";
import { useFocusTrap } from "@/lib/useFocusTrap";
import LangSwitcher from "./LangSwitcher";
import styles from "./MobileNav.module.css";

type Key = "products" | "clients" | "resources";

export default function MobileNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Key | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when the route changes.
  useEffect(() => { setOpen(false); }, [pathname]);

  useFocusTrap(panelRef, open, () => panelRef.current?.querySelector<HTMLElement>("[data-mobile-close]") ?? undefined);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  const acc = (key: Key, label: string, children: React.ReactNode) => (
    <div className={[styles.row, section === key && styles.open].filter(Boolean).join(" ")}>
      <button type="button" className={styles.rowBtn} aria-expanded={section === key} onClick={() => setSection(section === key ? null : key)}>
        {label}
        <svg className={styles.chev} width="14" height="14" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 3.5l3 3 3-3" /></svg>
      </button>
      {section === key && <div className={styles.sub}>{children}</div>}
    </div>
  );

  return (
    <>
      <button type="button" className={styles.toggle} aria-label={t("nav.openMenu")} aria-expanded={open} onClick={() => setOpen(true)}>
        <span className={styles.bars}><span /><span /><span /></span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.top}>
              <img src="/assets/logo_horizontal.svg" alt="Dimonova" height={40} width={100} />
              <button type="button" className={styles.close} aria-label={t("nav.closeMenu")} onClick={() => setOpen(false)} data-mobile-close>×</button>
            </div>
            <div className={styles.body}>
              {acc("products", t("nav.products"),
                SERVICES.map((s) =>
                  FEATURES_PUBLISHED ? (
                    <Link key={s.slug} href={s.href}>{t(`services.${s.slug}.title`)}</Link>
                  ) : (
                    <ServiceButton key={s.slug} slug={s.slug} className={styles.subBtn} onOpen={() => setOpen(false)}>
                      {t(`services.${s.slug}.title`)}
                    </ServiceButton>
                  ),
                ))}
              <div className={styles.row}><Link className={styles.rowLink} href="/pricing">{t("nav.pricing")}</Link></div>
              {/* Clients is a plain row, matching the desktop nav: one page, no panel. */}
              <div className={styles.row}><Link className={styles.rowLink} href="/clients">{t("nav.clients")}</Link></div>
              {acc("resources", t("nav.resources"), (
                <>
                  <Link href="/pricing#faq">{t("nav.mega.faq")}</Link>
                  <Link href="/#ai-compare">{t("nav.mega.aiCompare")}</Link>
                </>
              ))}
              <div className={styles.row}><Link className={styles.rowLink} href="/about">{t("nav.about")}</Link></div>
              <div className={styles.row}><Link className={styles.rowLink} href="/contact">{t("nav.contact")}</Link></div>
            </div>
            <div className={styles.ctas}>
              <Button size="lg" onClick={() => { setOpen(false); openDemo({ source: "header" }); }}>{t("nav.demo")}</Button>
              <Button size="lg" variant="outline" href={ADMIN_URL} external>{t("nav.clientAccess")}</Button>
              <LangSwitcher inline />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
