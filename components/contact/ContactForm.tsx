"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { Link } from "@/lib/routing";
import { CONTACT, MAX_UPLOAD_BYTES } from "@/lib/config";
import fieldStyles from "@/components/ui/Field.module.css";
import styles from "./ContactForm.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Vtype = "restaurant" | "pub" | "cafe" | "other";
type Status = "idle" | "sending" | "success" | "error";
type Errors = Partial<Record<"name" | "email" | "venue" | "consent" | "menuFile", string>>;

const VTYPES: Vtype[] = ["restaurant", "pub", "cafe", "other"];

const EMPTY_FIELDS = { name: "", email: "", venue: "", phone: "", message: "", menuUrl: "" };

const WA_ICON = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="#25D366" aria-hidden="true" className={styles.waIcon}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/**
 * The rebuilt contact form. Behaviour inventoried from the pre-rebuild `components/ContactForm.tsx`
 * survives; two things were fixed rather than reproduced:
 *  - the venue-type pills are now a real `<fieldset>`/radio group (native arrow-key navigation,
 *    `aria-checked` exposed for free) instead of buttons whose only selected indicator was a
 *    background colour;
 *  - the failed-submit case is a proper error state (title, body, retry, locale-correct WhatsApp
 *    link) instead of a hard-coded Spanish-only sentence with no WhatsApp fallback at all.
 */
export default function ContactForm() {
  const t = useTranslations();
  const locale = useLocale();
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [vtype, setVtype] = useState<Vtype>("restaurant");
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const stateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success" || status === "error") stateRef.current?.focus();
  }, [status]);

  const waUrl = locale === "es" ? CONTACT.whatsappES : CONTACT.whatsappIE;

  function setField<K extends keyof typeof EMPTY_FIELDS>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function clearError(key: keyof Errors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function fileError(file: File | null): string | undefined {
    return file && file.size > MAX_UPLOAD_BYTES ? t("contact.form.fileTooLarge") : undefined;
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!fields.name.trim()) e.name = t("errors.name");
    if (!fields.email.trim()) e.email = t("errors.email_required");
    else if (!EMAIL_RE.test(fields.email)) e.email = t("errors.email_invalid");
    if (!fields.venue.trim()) e.venue = t("errors.venue");
    if (!consent) e.consent = t("modal.demo.consentRequired");
    const menuFileErr = fileError(menuFile);
    if (menuFileErr) e.menuFile = menuFileErr;
    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("sending");
    try {
      const fd = new FormData();
      fd.append("name", fields.name);
      fd.append("email", fields.email);
      fd.append("venue", fields.venue);
      fd.append("vtype", vtype);
      fd.append("phone", fields.phone);
      fd.append("message", fields.message);
      fd.append("menuUrl", fields.menuUrl);
      fd.append("locale", locale);
      fd.append("consent", "yes");
      if (menuFile) fd.append("menuFile", menuFile);

      const res = await fetch("/api/contact", { method: "POST", body: fd });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  function resetForm() {
    setFields(EMPTY_FIELDS);
    setVtype("restaurant");
    setMenuFile(null);
    setConsent(false);
    setErrors({});
    setStatus("idle");
  }

  const err = (k: keyof Errors) =>
    errors[k] ? <span id={`cf-${k}-err`} className={fieldStyles.err}>{errors[k]}</span> : null;

  return (
    <div className={styles.panel}>
      {status === "success" ? (
        <div ref={stateRef} tabIndex={-1} className={fieldStyles.state} role="status">
          <div className={fieldStyles.tick} aria-hidden="true">✓</div>
          <p className={fieldStyles.stateTitle}>{t("contact.success.title")}</p>
          <p className={fieldStyles.stateLead}>{t("contact.success.body")}</p>
          <div className={fieldStyles.stateActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent("dimonova:open-wa"))}
            >
              {WA_ICON}
              <span>{t("contact.success.wa")}</span>
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              {t("contact.success.again")}
            </Button>
          </div>
        </div>
      ) : status === "error" ? (
        <div ref={stateRef} tabIndex={-1} className={fieldStyles.state} role="alert">
          <p className={fieldStyles.stateTitle}>{t("modal.demo.errorTitle")}</p>
          <p className={fieldStyles.stateLead}>{t("modal.demo.errorBody")}</p>
          <div className={fieldStyles.stateActions}>
            <Button type="button" onClick={() => setStatus("idle")}>
              {t("modal.demo.retry")}
            </Button>
            <Button variant="outline" href={waUrl} external>
              {t("modal.demo.whatsapp")}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate aria-busy={status === "sending" || undefined}>
          <div className={styles.eyebrow}>{t("contact.form.eyebrow")}</div>

          <div className={styles.stack}>
            <div className={styles.row}>
              <div className={fieldStyles.field}>
                <label htmlFor="cf-name" className={fieldStyles.label}>
                  {t("contact.form.name_label")}
                </label>
                <input
                  id="cf-name"
                  type="text"
                  className={fieldStyles.input}
                  value={fields.name}
                  onChange={(e) => { setField("name", e.target.value); clearError("name"); }}
                  placeholder={t("contact.form.name_ph")}
                  autoComplete="name"
                  aria-invalid={!!errors.name || undefined}
                  aria-describedby={errors.name ? "cf-name-err" : undefined}
                />
                {err("name")}
              </div>
              <div className={fieldStyles.field}>
                <label htmlFor="cf-email" className={fieldStyles.label}>
                  {t("contact.form.email_label")}
                </label>
                <input
                  id="cf-email"
                  type="email"
                  className={fieldStyles.input}
                  value={fields.email}
                  onChange={(e) => { setField("email", e.target.value); clearError("email"); }}
                  placeholder={t("contact.form.email_ph")}
                  autoComplete="email"
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby={errors.email ? "cf-email-err" : undefined}
                />
                {err("email")}
              </div>
            </div>

            <div className={fieldStyles.field}>
              <label htmlFor="cf-venue" className={fieldStyles.label}>
                {t("contact.form.venue_label")}
              </label>
              <input
                id="cf-venue"
                type="text"
                className={fieldStyles.input}
                value={fields.venue}
                onChange={(e) => { setField("venue", e.target.value); clearError("venue"); }}
                placeholder={t("contact.form.venue_ph")}
                autoComplete="organization"
                aria-invalid={!!errors.venue || undefined}
                aria-describedby={errors.venue ? "cf-venue-err" : undefined}
              />
              {err("venue")}
            </div>

            {/* Venue type: a real radio group. Native <input type="radio"> sharing one `name`
                gives arrow-key navigation between options and the checked state to assistive
                tech for free — the legacy version used <button aria-pressed> pills whose only
                selected indicator was a background colour. */}
            <fieldset role="radiogroup" className={`${fieldStyles.field} ${fieldStyles.fieldset}`}>
              <legend className={fieldStyles.label}>{t("contact.form.vtype_label")}</legend>
              <div className={fieldStyles.pills}>
                {VTYPES.map((v) => (
                  <label key={v} className={fieldStyles.pill}>
                    <input
                      type="radio"
                      name="vtype"
                      value={v}
                      checked={vtype === v}
                      onChange={() => setVtype(v)}
                    />
                    <span>{t(`contact.form.vtype_${v}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={fieldStyles.field}>
              <label htmlFor="cf-phone" className={fieldStyles.label}>
                <span>{t("contact.form.phone_label")}</span>{" "}
                <span className={fieldStyles.optional}>{t("contact.form.optional")}</span>
              </label>
              <input
                id="cf-phone"
                type="tel"
                className={fieldStyles.input}
                value={fields.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder={t("contact.form.phone_ph")}
                autoComplete="tel"
              />
            </div>

            <div className={fieldStyles.field}>
              <label htmlFor="cf-menuurl" className={fieldStyles.label}>
                <span>{t("contact.form.menuurl_label")}</span>{" "}
                <span className={fieldStyles.optional}>{t("contact.form.optional")}</span>
              </label>
              <input
                id="cf-menuurl"
                type="url"
                className={fieldStyles.input}
                value={fields.menuUrl}
                onChange={(e) => setField("menuUrl", e.target.value)}
                placeholder={t("contact.form.menuurl_ph")}
              />
            </div>

            <div className={fieldStyles.field}>
              <span id="cf-menuFile-label" className={fieldStyles.label}>
                <span>{t("contact.form.menufile_label")}</span>{" "}
                <span className={fieldStyles.optional}>{t("contact.form.optional")}</span>
              </span>
              <label className={styles.dropzone}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.dropzoneIcon}>
                  <path d="M8 1v9M4.5 5.5 8 2l3.5 3.5M2 11.5V14h12v-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={menuFile ? styles.dropzoneFilled : styles.dropzoneText}>
                  {menuFile ? menuFile.name : t("contact.form.menufile_ph")}
                </span>
                <input
                  type="file"
                  accept=".pdf,.xls,.xlsx"
                  className={styles.hiddenFileInput}
                  aria-invalid={!!errors.menuFile || undefined}
                  aria-labelledby="cf-menuFile-label"
                  aria-describedby={errors.menuFile ? "cf-menuFile-hint cf-menuFile-err" : "cf-menuFile-hint"}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setMenuFile(file);
                    setErrors((prev) => ({ ...prev, menuFile: fileError(file) }));
                  }}
                />
              </label>
              <div id="cf-menuFile-hint" className={styles.hint}>{t("contact.form.menufile_hint")}</div>
              {err("menuFile")}
            </div>

            <div className={fieldStyles.field}>
              <label htmlFor="cf-message" className={fieldStyles.label}>
                <span>{t("contact.form.message_label")}</span>{" "}
                <span className={fieldStyles.optional}>{t("contact.form.optional")}</span>
              </label>
              <textarea
                id="cf-message"
                className={fieldStyles.textarea}
                value={fields.message}
                onChange={(e) => setField("message", e.target.value)}
                rows={4}
                placeholder={t("contact.form.message_ph")}
              />
            </div>

            <div className={fieldStyles.field}>
              <label htmlFor="contact-consent" className={fieldStyles.consent}>
                <input
                  type="checkbox"
                  id="contact-consent"
                  name="consent"
                  value="yes"
                  checked={consent}
                  onChange={(e) => { setConsent(e.target.checked); clearError("consent"); }}
                  aria-invalid={!!errors.consent || undefined}
                  aria-describedby={errors.consent ? "contact-consent-err" : undefined}
                />
                <span>
                  {t.rich("modal.demo.consent", {
                    link: (chunks) => <Link href="/legal/privacy">{chunks}</Link>,
                  })}
                </span>
              </label>
              {errors.consent && (
                <span id="contact-consent-err" className={fieldStyles.err}>
                  {errors.consent}
                </span>
              )}
            </div>

            <div className={styles.footer}>
              <p className={styles.disclaimer}>{t("contact.form.disclaimer")}</p>
              <Button type="submit" variant="solid" size="lg" disabled={status === "sending"}>
                {status === "sending" ? "…" : t("contact.form.submit")}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
