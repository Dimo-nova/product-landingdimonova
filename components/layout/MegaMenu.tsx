"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Link, usePathname } from "@/lib/routing";
import { SERVICES } from "@/lib/services";
import styles from "./MegaMenu.module.css";

type Key = "products" | "clients" | "resources";
const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;

function Chevron() {
  return (
    <svg className={styles.chev} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 3.5l3 3 3-3" />
    </svg>
  );
}

export default function MegaMenu() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState<Key | null>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const buttons = useRef<Partial<Record<Key, HTMLButtonElement | null>>>({});

  const clearTimers = () => { window.clearTimeout(openTimer.current); window.clearTimeout(closeTimer.current); };
  const scheduleOpen = (key: Key) => { clearTimers(); openTimer.current = window.setTimeout(() => setOpen(key), OPEN_DELAY); };
  const scheduleClose = () => { clearTimers(); closeTimer.current = window.setTimeout(() => setOpen(null), CLOSE_DELAY); };
  const cancelClose = () => window.clearTimeout(closeTimer.current);

  const close = useCallback((restoreTo?: Key) => {
    clearTimers();
    setOpen(null);
    if (restoreTo) buttons.current[restoreTo]?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(open); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => () => clearTimers(), []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // While a panel is open, every other top-level item (the other triggers and the plain links)
  // drops out of the Tab sequence. Without this, Tab from inside an open panel would step through
  // the remaining nav items — themselves still inside `root` — before ever reaching something
  // that isn't part of the mega menu, so the "focus left it" blur-close below would need far more
  // Tabs than a user would expect to fire. Mouse/hover interaction is unaffected: tabIndex only
  // changes keyboard tab order.
  const trigger = (key: Key, label: string) => (
    <button
      type="button"
      ref={(el) => { buttons.current[key] = el; }}
      className={styles.item}
      aria-expanded={open === key}
      aria-controls={`mega-${key}`}
      tabIndex={open && open !== key ? -1 : undefined}
      onMouseEnter={() => scheduleOpen(key)}
      onMouseLeave={scheduleClose}
      onClick={() => { if (open === key) return; clearTimers(); setOpen(key); }}
    >
      {label}
      <Chevron />
    </button>
  );

  const link = (href: string, label: string) => (
    <Link href={href} className={styles.item} aria-current={isActive(href) ? "page" : undefined} tabIndex={open ? -1 : undefined} onMouseEnter={scheduleClose}>
      {label}
    </Link>
  );

  return (
    <div className={styles.root} onBlur={(e) => { if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) close(); }}>
      <nav className={styles.nav} aria-label="Main">
        {trigger("products", t("nav.products"))}
        {link("/pricing", t("nav.pricing"))}
        {trigger("clients", t("nav.clients"))}
        {trigger("resources", t("nav.resources"))}
        {link("/about", t("nav.about"))}
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key={open}
            id={`mega-${open}`}
            className={styles.panel}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className={styles.inner}>
              {open === "products" && (
                <>
                  <p className={styles.title}>{t("nav.mega.productsTitle")}</p>
                  <div className={styles.grid}>
                    {SERVICES.map((s) => (
                      <Link key={s.slug} href={s.href} className={styles.card} onClick={() => close()}>
                        <span className={styles.cardTitle}>{t(`services.${s.slug}.title`)}</span>
                        <span className={styles.cardLine}>{t(`services.${s.slug}.line`)}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
              {open === "clients" && (
                <div className={styles.clients}>
                  <Link href="/cases" className={styles.featured} onClick={() => close()}>
                    <h3>{t("nav.mega.clientsFeatured")}</h3>
                    <p>{t("nav.mega.clientsFeaturedLine")}</p>
                    <span className={styles.featuredCta}>{t("nav.mega.clientsFeaturedCta")} →</span>
                  </Link>
                  <div className={styles.list}>
                    <Link href="/cases" onClick={() => close()}>{t("nav.mega.clientsAll")}</Link>
                    <Link href="/#reviews" onClick={() => close()}>{t("nav.mega.clientsVideos")}</Link>
                  </div>
                </div>
              )}
              {open === "resources" && (
                <div className={styles.list} style={{ maxWidth: 360 }}>
                  <Link href="/pricing#faq" onClick={() => close()}>{t("nav.mega.faq")}</Link>
                  <Link href="/#ai-compare" onClick={() => close()}>{t("nav.mega.aiCompare")}</Link>
                  <Link href="/contact" onClick={() => close()}>{t("nav.mega.contact")}</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
