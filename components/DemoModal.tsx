"use client";
import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { DEMO_OPEN, useWindowEvent, type DemoOpenPayload } from "@/lib/events";
import { CONTACT } from "@/lib/config";
import styles from "./DemoModal.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Status = "idle" | "sending" | "success" | "error";
type Errors = Partial<Record<"name" | "email" | "venue", string>>;

export default function DemoModal() {
  const t = useTranslations("modal.demo");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  // The error state renders a different subtree than the form, so the form (and its uncontrolled
  // inputs) unmounts while it's showing; without this, "Try again" would bring back an empty form.
  // Captured on every submit attempt and fed back in as defaultValue, the same way `email` already
  // survives from the opening payload.
  const [savedValues, setSavedValues] = useState({ name: "", venue: "", phone: "" });
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  useWindowEvent<DemoOpenPayload>(DEMO_OPEN, useCallback((d) => {
    setEmail(d?.email ?? "");
    setSavedValues({ name: "", venue: "", phone: "" });
    setSource(d?.source ?? "");
    setStatus("idle");
    setErrors({});
    setOpen(true);
  }, []));

  const close = useCallback(() => setOpen(false), []);
  const waUrl = locale === "es" ? CONTACT.whatsappES : CONTACT.whatsappIE;

  function validate(fd: FormData): Errors {
    const e: Errors = {};
    if (!String(fd.get("name") ?? "").trim()) e.name = t("errRequired");
    const em = String(fd.get("email") ?? "").trim();
    if (!em) e.email = t("errRequired");
    else if (!EMAIL_RE.test(em)) e.email = t("errEmail");
    if (!String(fd.get("venue") ?? "").trim()) e.venue = t("errRequired");
    return e;
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    setEmail(String(fd.get("email") ?? ""));
    setSavedValues({
      name: String(fd.get("name") ?? ""),
      venue: String(fd.get("venue") ?? ""),
      phone: String(fd.get("phone") ?? ""),
    });
    const e = validate(fd);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const err = (k: keyof Errors) => (errors[k] ? <span id={`demo-${k}-err`} className={styles.err}>{errors[k]}</span> : null);

  return (
    <Modal open={open} onClose={close} labelledBy="demo-title" closeLabel={t("close")}>
      <div className={styles.body}>
        {/*
          The dialog's aria-labelledby must keep pointing at a stable name for as long as it's
          open, but the visible heading text changes per status (idle/success/error). Rather than
          moving id="demo-title" between three different headings — which would rename the dialog
          itself mid-flow — a single visually-hidden node carries the fixed accessible name, and
          each status renders its own plain (unlabelled) heading for sighted users.
        */}
        <h2 id="demo-title" className="u-visually-hidden">{t("title")}</h2>
        {status === "success" ? (
          <div className={styles.state} role="status">
            <motion.div className={styles.tick} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>✓</motion.div>
            <p className={styles.title}>{t("successTitle")}</p>
            <p className={styles.lead}>{t("successBody")}</p>
            <div className={styles.stateActions}><Button onClick={close}>{t("close")}</Button></div>
          </div>
        ) : status === "error" ? (
          <div className={styles.state} role="alert">
            <p className={styles.title}>{t("errorTitle")}</p>
            <p className={styles.lead}>{t("errorBody")}</p>
            <div className={styles.stateActions}>
              <Button onClick={() => setStatus("idle")}>{t("retry")}</Button>
              <Button variant="outline" href={waUrl} external>{t("whatsapp")}</Button>
            </div>
          </div>
        ) : (
          <>
            <p className={styles.title}>{t("title")}</p>
            <p className={styles.lead}>{t("lead")}</p>
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="source" value={source} />
              <input type="hidden" name="vtype" value="restaurant" />

              {/* Name is first so it receives initial focus; email is prefilled when it came from the hero. */}
              <Field id="name" label={t("name")} defaultValue={savedValues.name} error={err("name")} invalid={!!errors.name} disabled={status === "sending"} />
              <Field id="email" type="email" label={t("email")} defaultValue={email} error={err("email")} invalid={!!errors.email} disabled={status === "sending"} />
              <Field id="venue" label={t("venue")} defaultValue={savedValues.venue} error={err("venue")} invalid={!!errors.venue} disabled={status === "sending"} />
              <Field id="phone" type="tel" label={t("phone")} defaultValue={savedValues.phone} disabled={status === "sending"} />

              <fieldset className={styles.field} style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className={styles.label}>{t("locations")}</legend>
                <div className={styles.pills}>
                  {[["1", t("locations1")], ["2-5", t("locations2")], ["6+", t("locations6")]].map(([v, l], i) => (
                    <label key={v} className={styles.pill}>
                      <input type="radio" name="locations" value={v} defaultChecked={i === 0} disabled={status === "sending"} />
                      <span>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className={styles.field} style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className={styles.label}>{t("menuToday")}</legend>
                <div className={styles.pills}>
                  {[["pdf", t("menuPdf")], ["web", t("menuWeb")], ["other-system", t("menuOther")]].map(([v, l]) => (
                    <label key={v} className={styles.pill}>
                      <input type="radio" name="menuToday" value={v} disabled={status === "sending"} />
                      <span>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className={styles.actions}>
                <Button type="submit" size="lg" disabled={status === "sending"}>
                  {status === "sending" ? t("sending") : t("submit")}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}

function Field({ id, label, type = "text", defaultValue, error, invalid, disabled }: {
  id: "name" | "email" | "venue" | "phone"; label: string; type?: string; defaultValue?: string;
  error?: React.ReactNode; invalid?: boolean; disabled?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={`demo-${id}`} className={styles.label}>{label}</label>
      <input
        id={`demo-${id}`}
        name={id}
        type={type}
        className={styles.input}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `demo-${id}-err` : undefined}
        autoComplete={id === "email" ? "email" : id === "phone" ? "tel" : id === "name" ? "name" : "organization"}
      />
      {error}
    </div>
  );
}
