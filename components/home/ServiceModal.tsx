"use client";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { isServiceSlug, type ServiceSlug } from "@/lib/services";
import { EASE_OUT } from "@/lib/motion";
import { SERVICE_OPEN, openDemo, useWindowEvent, type ServiceOpenPayload } from "@/lib/events";
import { ServiceArt } from "./ServiceArt";
import styles from "./ServiceModal.module.css";

type Step = { title: string; body: string };

/**
 * The service walkthrough: opened from a service card (or the header's Features menu), it shows
 * the card's own scene and the three steps it takes to get that service running. It opens on
 * step 1 and moves only when the visitor clicks a step — nothing advances on its own — so a
 * step being read is never swapped out. The numbers of the steps already passed stay coral, and
 * the connector between two numbers fills once the step above it is done. Mounted once in
 * app/[locale]/layout.tsx and driven by the `service:open` window event, like the demo and
 * video modals. The only motion is the step body opening, through `motion`'s `animate`, which
 * `<MotionConfig reducedMotion="user">` flattens on its own.
 */
export default function ServiceModal() {
  const t = useTranslations();
  const [slug, setSlug] = useState<ServiceSlug | null>(null);
  const [active, setActive] = useState(0);

  useWindowEvent<ServiceOpenPayload>(
    SERVICE_OPEN,
    useCallback((d) => {
      if (d && isServiceSlug(d.slug)) {
        setActive(0);
        setSlug(d.slug);
      }
    }, []),
  );
  const close = useCallback(() => setSlug(null), []);

  if (!slug) {
    return (
      <Modal open={false} onClose={close} labelledBy="service-modal-title" closeLabel={t("services.modal.close")} maxWidth="860px">
        {null}
      </Modal>
    );
  }

  const steps = t.raw(`services.${slug}.steps`) as Step[];
  const bullets = t.raw(`services.${slug}.bullets`) as string[];

  return (
    <Modal open onClose={close} labelledBy="service-modal-title" closeLabel={t("services.modal.close")} maxWidth="860px">
      <div className={styles.layout}>
        {/* The card's scene again, so the modal opens on the picture the visitor just clicked. */}
        <div className={styles.art} aria-hidden="true">
          <ServiceArt slug={slug} />
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("services.modal.eyebrow")}</p>
          <h2 id="service-modal-title" className={styles.title}>
            {t(`services.${slug}.title`)}
          </h2>

          <ol className={styles.steps} data-service-steps>
            {steps.map((step, i) => {
              const open = i === active;
              // Reached: this step or one before it is the active one, so its number is coral and
              // (unless it is the active one) the connector below it is filled.
              const reached = i <= active;
              const cls = [styles.step, open && styles.stepOpen, reached && styles.stepReached, i < active && styles.stepDone]
                .filter(Boolean)
                .join(" ");
              return (
                <li key={step.title} className={cls} data-step-open={open || undefined}>
                  <button
                    type="button"
                    className={styles.stepButton}
                    aria-expanded={open}
                    aria-controls={`service-step-${i}`}
                    onClick={() => setActive(i)}
                  >
                    <span className={styles.stepNum} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="u-visually-hidden">{t("services.modal.stepLabel", { n: i + 1 })}</span>
                    <span className={styles.stepTitle}>{step.title}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`service-step-${i}`}
                        className={styles.stepBodyWrap}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE_OUT }}
                      >
                        <p className={styles.stepBody}>{step.body}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>

          <p className={styles.includesTitle}>{t("services.modal.includes")}</p>
          <ul className={styles.includes}>
            {bullets.map((item) => (
              <li key={item} className={styles.include}>
                {item}
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Button size="lg" onClick={() => { close(); openDemo({ source: `service-${slug}` }); }}>
              {t("common.demo_arrow")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
