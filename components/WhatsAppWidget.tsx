"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "@/lib/routing";
import { SERVICE_OPEN, WA_OPEN, useWindowEvent, type ServiceOpenPayload, type WaOpenPayload } from "@/lib/events";
import { waContextForPath, waContextForService, waLink, type WaChip, type WaContext } from "@/lib/wa";
import styles from "./WhatsAppWidget.module.css";

const CHIPS: readonly WaChip[] = ["restaurant", "pub", "cafe"];

const WA_PATH = "M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z";

/**
 * The floating WhatsApp launcher and its panel. Every link out carries a pre-filled message —
 * the chip's opener plus one sentence for where the visitor came from — so the first message
 * on the phone already says what the lead wants (lib/wa.ts holds the mapping, the copy is under
 * `wa.msg`). The context is, in order: what the opener of the panel said (`openWa({ context })`,
 * the contact form's "sent" state), the last service walkthrough opened on this page, the route.
 */
export default function WhatsAppWidget() {
  const t = useTranslations("wa");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [explicit, setExplicit] = useState<WaContext | null>(null);
  const [service, setService] = useState<WaContext | null>(null);

  useWindowEvent<WaOpenPayload | undefined>(
    WA_OPEN,
    useCallback((detail) => {
      setExplicit(detail?.context ?? null);
      setOpen(true);
    }, []),
  );
  useWindowEvent<ServiceOpenPayload>(
    SERVICE_OPEN,
    useCallback((detail) => setService(waContextForService(detail.slug)), []),
  );
  // A walkthrough opened on the home page says nothing about what the visitor wants on /pricing.
  useEffect(() => setService(null), [pathname]);

  const context = explicit ?? service ?? waContextForPath(pathname);
  const link = (opener: string) => waLink(locale, `${opener} ${t(`msg.ctx.${context}`)}`);

  // The launcher is a fresh start: whatever the last opener asked for no longer applies.
  const toggle = () => {
    setExplicit(null);
    setOpen((v) => !v);
  };

  return (
    <div className={styles.root}>
      <AnimatePresence>
        {open && (
          <motion.div className={styles.panel} data-wa-panel initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: .2 }}>
            <div className={styles.head}>
              <div className={styles.avatar} aria-hidden="true">D</div>
              <div>
                <div className={styles.name}>{t("name")}</div>
                <div className={styles.status}>{t("status")}</div>
              </div>
              <button type="button" className={styles.headClose} onClick={() => setOpen(false)} aria-label="Close WhatsApp">×</button>
            </div>
            <div className={styles.chat}>
              <div className={styles.bubble}>{t("greeting")}</div>
              <div className={styles.chips}>
                {CHIPS.map((chip) => (
                  <a key={chip} className={styles.chip} href={link(t(`msg.chip.${chip}`))} target="_blank" rel="noopener noreferrer">
                    {t(`chip_${chip}`)}
                  </a>
                ))}
              </div>
            </div>
            <div className={styles.foot}>
              <a className={styles.go} href={link(t("msg.hello"))} target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>
                {t("continue")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" className={styles.launcher} onClick={toggle} aria-label="WhatsApp" aria-expanded={open}>
        {open ? <span style={{ fontSize: 26, lineHeight: 1 }}>×</span> : (
          <svg width="30" height="30" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>
        )}
      </button>
    </div>
  );
}
