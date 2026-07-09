"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { s } from "@/lib/style";
import Hover from "./Hover";
import { CONTACT } from "@/lib/config";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Vtype = "restaurant" | "pub" | "cafe" | "other";

interface Errors {
  name?: string;
  email?: string;
  venue?: string;
}

export default function ContactForm() {
  const t = useTranslations();
  const locale = useLocale();
  const [vtype, setVtype] = useState<Vtype>("restaurant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [venue, setVenue] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = t("errors.name");
    if (!email.trim()) next.email = t("errors.email_required");
    else if (!EMAIL_RE.test(email)) next.email = t("errors.email_invalid");
    if (!venue.trim()) next.venue = t("errors.venue");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError(false);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("venue", venue);
      fd.append("vtype", vtype);
      fd.append("phone", phone);
      fd.append("message", message);
      fd.append("menuUrl", menuUrl);
      fd.append("locale", locale);
      if (menuFile) fd.append("menuFile", menuFile);

      const res = await fetch("/api/contact", { method: "POST", body: fd });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(true);
      }
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setVenue("");
    setPhone("");
    setMessage("");
    setMenuUrl("");
    setMenuFile(null);
    setVtype("restaurant");
    setErrors({});
    setSubmitted(false);
  }

  function pillStyle(v: Vtype) {
    const on = vtype === v;
    return s(
      `padding:10px 16px;border-radius:999px;border:1px solid ${on ? "#1F1814" : "#E8E0D2"};background:${on ? "#1F1814" : "transparent"};color:${on ? "#FAF6F0" : "#1F1814"};font:500 13px/1 'Instrument Sans',sans-serif;transition:all .15s;cursor:pointer`
    );
  }

  function nameBorder() {
    return errors.name ? "#B8523A" : "#E8E0D2";
  }
  function emailBorder() {
    return errors.email ? "#B8523A" : "#E8E0D2";
  }
  function venueBorder() {
    return errors.venue ? "#B8523A" : "#E8E0D2";
  }

  return (
    <section className="dim-pad-h dim-form-outer" style={s("max-width:1240px;margin:0 auto;padding:32px 40px 120px")}>
      <div className="dim-hero-grid" style={s("display:grid;grid-template-columns:1.3fr 1fr;gap:48px;align-items:start")}>

        {/* FORM */}
        <div className="dim-form-inner" style={s("background:#fff;border:1px solid #E8E0D2;border-radius:20px;padding:40px")}>
          {submitted ? (
            /* Success state */
            <div className="dim-pop" style={s("padding:32px 0;text-align:center")}>
              <div style={s("width:64px;height:64px;border-radius:50%;background:#F1E8DA;color:#B8523A;display:inline-flex;align-items:center;justify-content:center;font:500 28px/1 'Instrument Sans',sans-serif;margin-bottom:20px")}>✓</div>
              <h2 style={s("font:400 30px/1.15 'Instrument Sans',sans-serif;color:#1F1814;letter-spacing:-.02em;margin:0 0 12px")}>{t("contact.success.title")}</h2>
              <p style={s("font:400 15px/1.6 'Instrument Sans',sans-serif;color:#4A4036;margin:0 auto 24px;max-width:420px")}>{t("contact.success.body")}</p>
              <div style={s("display:flex;gap:10px;justify-content:center;flex-wrap:wrap")}>
                <Hover
                  as="button"
                  base="font:500 14px/1 'Instrument Sans',sans-serif;color:#1F1814;padding:13px 20px;border:1px solid #1F1814;border-radius:999px;display:inline-flex;align-items:center;gap:8px;cursor:pointer"
                  hover="background:#1F1814;color:#FAF6F0"
                  onClick={() => window.dispatchEvent(new CustomEvent("dimonova:open-wa"))}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="#25D366" style={s("flex-shrink:0")}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span>{t("contact.success.wa")}</span>
                </Hover>
                <button
                  onClick={resetForm}
                  style={s("font:500 14px/1 'Instrument Sans',sans-serif;color:#8A7E70;padding:13px 18px;cursor:pointer")}
                >
                  {t("contact.success.again")}
                </button>
              </div>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={onSubmit} noValidate>
              <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#8A7E70;margin-bottom:24px")}>{t("contact.form.eyebrow")}</div>

              <div style={s("display:flex;flex-direction:column;gap:20px")}>

                {/* Name + Email row */}
                <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:16px")} className="dim-stack-md">
                  <div>
                    <label
                      htmlFor="cf-name"
                      style={s("display:block;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;margin-bottom:8px")}
                    >
                      {t("contact.form.name_label")}
                    </label>
                    <input
                      id="cf-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder={t("contact.form.name_ph")}
                      aria-label={t("contact.form.name_label")}
                      style={s(`width:100%;padding:14px 16px;background:#FAF6F0;border:1px solid ${nameBorder()};border-radius:10px;font:400 14px/1 'Instrument Sans',sans-serif;color:#1F1814;transition:border-color .15s,box-shadow .15s;box-sizing:border-box`)}
                    />
                    {errors.name && (
                      <div style={s("font:400 12px/1.4 'Instrument Sans',sans-serif;color:#B8523A;margin-top:6px")}>{errors.name}</div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="cf-email"
                      style={s("display:block;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;margin-bottom:8px")}
                    >
                      {t("contact.form.email_label")}
                    </label>
                    <input
                      id="cf-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder={t("contact.form.email_ph")}
                      aria-label={t("contact.form.email_label")}
                      style={s(`width:100%;padding:14px 16px;background:#FAF6F0;border:1px solid ${emailBorder()};border-radius:10px;font:400 14px/1 'Instrument Sans',sans-serif;color:#1F1814;transition:border-color .15s,box-shadow .15s;box-sizing:border-box`)}
                    />
                    {errors.email && (
                      <div style={s("font:400 12px/1.4 'Instrument Sans',sans-serif;color:#B8523A;margin-top:6px")}>{errors.email}</div>
                    )}
                  </div>
                </div>

                {/* Venue name */}
                <div>
                  <label
                    htmlFor="cf-venue"
                    style={s("display:block;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;margin-bottom:8px")}
                  >
                    {t("contact.form.venue_label")}
                  </label>
                  <input
                    id="cf-venue"
                    type="text"
                    value={venue}
                    onChange={(e) => {
                      setVenue(e.target.value);
                      if (errors.venue) setErrors((prev) => ({ ...prev, venue: undefined }));
                    }}
                    placeholder={t("contact.form.venue_ph")}
                    aria-label={t("contact.form.venue_label")}
                    style={s(`width:100%;padding:14px 16px;background:#FAF6F0;border:1px solid ${venueBorder()};border-radius:10px;font:400 14px/1 'Instrument Sans',sans-serif;color:#1F1814;transition:border-color .15s,box-shadow .15s;box-sizing:border-box`)}
                  />
                  {errors.venue && (
                    <div style={s("font:400 12px/1.4 'Instrument Sans',sans-serif;color:#B8523A;margin-top:6px")}>{errors.venue}</div>
                  )}
                </div>

                {/* Venue type pills */}
                <div>
                  <label style={s("display:block;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;margin-bottom:10px")}>
                    {t("contact.form.vtype_label")}
                  </label>
                  <div style={s("display:flex;gap:8px;flex-wrap:wrap")}>
                    <button type="button" onClick={() => setVtype("restaurant")} style={pillStyle("restaurant")} aria-pressed={vtype === "restaurant"}>
                      {t("contact.form.vtype_restaurant")}
                    </button>
                    <button type="button" onClick={() => setVtype("pub")} style={pillStyle("pub")} aria-pressed={vtype === "pub"}>
                      {t("contact.form.vtype_pub")}
                    </button>
                    <button type="button" onClick={() => setVtype("cafe")} style={pillStyle("cafe")} aria-pressed={vtype === "cafe"}>
                      {t("contact.form.vtype_cafe")}
                    </button>
                    <button type="button" onClick={() => setVtype("other")} style={pillStyle("other")} aria-pressed={vtype === "other"}>
                      {t("contact.form.vtype_other")}
                    </button>
                  </div>
                </div>

                {/* Phone (optional) */}
                <div>
                  <label
                    htmlFor="cf-phone"
                    style={s("display:block;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;margin-bottom:8px")}
                  >
                    <span>{t("contact.form.phone_label")}</span>{" "}
                    <span style={s("color:#8A7E70;font-weight:400")}>{t("contact.form.optional")}</span>
                  </label>
                  <input
                    id="cf-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("contact.form.phone_ph")}
                    style={s("width:100%;padding:14px 16px;background:#FAF6F0;border:1px solid #E8E0D2;border-radius:10px;font:400 14px/1 'Instrument Sans',sans-serif;color:#1F1814;transition:border-color .15s,box-shadow .15s;box-sizing:border-box")}
                  />
                </div>

                {/* Current digital menu URL (optional) */}
                <div>
                  <label
                    htmlFor="cf-menuurl"
                    style={s("display:block;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;margin-bottom:8px")}
                  >
                    <span>{t("contact.form.menuurl_label")}</span>{" "}
                    <span style={s("color:#8A7E70;font-weight:400")}>{t("contact.form.optional")}</span>
                  </label>
                  <input
                    id="cf-menuurl"
                    type="url"
                    name="menu_url"
                    value={menuUrl}
                    onChange={(e) => setMenuUrl(e.target.value)}
                    placeholder={t("contact.form.menuurl_ph")}
                    style={s("width:100%;padding:14px 16px;background:#FAF6F0;border:1px solid #E8E0D2;border-radius:10px;font:400 14px/1 'Instrument Sans',sans-serif;color:#1F1814;transition:border-color .15s,box-shadow .15s;box-sizing:border-box")}
                  />
                </div>

                {/* Dish list file (optional) */}
                <div>
                  <label
                    style={s("display:block;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;margin-bottom:8px")}
                  >
                    <span>{t("contact.form.menufile_label")}</span>{" "}
                    <span style={s("color:#8A7E70;font-weight:400")}>{t("contact.form.optional")}</span>
                  </label>
                  <label style={s("display:flex;align-items:center;gap:12px;padding:14px 16px;background:#FAF6F0;border:1.5px dashed #E8E0D2;border-radius:10px;cursor:pointer;transition:border-color .15s")}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={s("flex-shrink:0;color:#8A7E70")}>
                      <path d="M8 1v9M4.5 5.5 8 2l3.5 3.5M2 11.5V14h12v-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={s(`font:400 14px/1 'Instrument Sans',sans-serif;color:${menuFile ? "#1F1814" : "#8A7E70"}`)}>
                      {menuFile ? menuFile.name : t("contact.form.menufile_ph")}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.xls,.xlsx"
                      style={s("display:none")}
                      onChange={(e) => setMenuFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <div style={s("font:400 11px/1.4 'Instrument Sans',sans-serif;color:#B8A89A;margin-top:6px")}>{t("contact.form.menufile_hint")}</div>
                </div>

                {/* Message (optional) */}
                <div>
                  <label
                    htmlFor="cf-message"
                    style={s("display:block;font:500 12px/1 'Instrument Sans',sans-serif;color:#1F1814;margin-bottom:8px")}
                  >
                    <span>{t("contact.form.message_label")}</span>{" "}
                    <span style={s("color:#8A7E70;font-weight:400")}>{t("contact.form.optional")}</span>
                  </label>
                  <textarea
                    id="cf-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder={t("contact.form.message_ph")}
                    style={s("width:100%;padding:14px 16px;background:#FAF6F0;border:1px solid #E8E0D2;border-radius:10px;font:400 14px/1.5 'Instrument Sans',sans-serif;color:#1F1814;resize:vertical;transition:border-color .15s,box-shadow .15s;box-sizing:border-box")}
                  />
                </div>

                {/* Footer: disclaimer + submit */}
                <div style={s("display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:8px")}>
                  <div style={s("font:400 12px/1.5 'Instrument Sans',sans-serif;color:#8A7E70;max-width:280px")}>{t("contact.form.disclaimer")}</div>
                  <div style={s("display:flex;flex-direction:column;align-items:flex-end;gap:8px")}>
                    {submitError && (
                      <div style={s("font:400 12px/1.4 'Instrument Sans',sans-serif;color:#B8523A")}>
                        Error al enviar — inténtalo de nuevo o escríbenos por WhatsApp.
                      </div>
                    )}
                    <Hover
                      as="button"
                      type="submit"
                      base={`font:600 14px/1 'Instrument Sans',sans-serif;color:#FAF6F0;background:#B8523A;padding:15px 24px;border-radius:999px;transition:background .15s,transform .15s;cursor:pointer;opacity:${submitting ? ".6" : "1"}`}
                      hover="background:#9B4530;transform:translateY(-1px)"
                    >
                      {submitting ? "…" : t("contact.form.submit")}
                    </Hover>
                  </div>
                </div>

              </div>
            </form>
          )}
        </div>

        {/* SIDE PANEL */}
        <div style={s("display:flex;flex-direction:column;gap:16px")}>
          {/* Prefer to chat */}
          <div style={s("background:#F1E8DA;border-radius:18px;padding:28px")}>
            <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#1F1814;margin-bottom:14px")}>{t("contact.side.chat_label")}</div>
            <p style={s("font:400 14px/1.6 'Instrument Sans',sans-serif;color:#4A4036;margin:0 0 18px")}>{t("contact.side.chat_body")}</p>
            <Hover
              as="button"
              base="width:100%;font:600 14px/1 'Instrument Sans',sans-serif;color:#1F1814;background:#FAF6F0;padding:14px 18px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;gap:10px;border:1px solid #1F1814;cursor:pointer"
              hover="background:#1F1814;color:#FAF6F0"
              onClick={() => window.dispatchEvent(new CustomEvent("dimonova:open-wa"))}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366" style={s("flex-shrink:0")}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>{t("contact.side.chat_btn")}</span>
            </Hover>
          </div>

          {/* Old fashioned way */}
          <div style={s("background:#fff;border:1px solid #E8E0D2;border-radius:18px;padding:28px")}>
            <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8A7E70;margin-bottom:14px")}>{t("contact.side.old_label")}</div>
            <div style={s("display:flex;flex-direction:column;gap:14px")}>
              <div>
                <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;color:#8A7E70;margin-bottom:4px")}>{t("contact.side.email_label")}</div>
                <div style={s("font:500 16px/1 'Instrument Sans',sans-serif;color:#1F1814")}>{CONTACT.email}</div>
              </div>
              <div>
                <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;color:#8A7E70;margin-bottom:6px")}>{t("contact.side.phone_calls_label")}</div>
                <div style={s("display:flex;flex-direction:column;gap:5px")}>
                  <a href="tel:+34622040285" style={s("font:500 15px/1.3 'Instrument Sans',sans-serif;color:#1F1814;text-decoration:none")}>
                    {CONTACT.phoneES}{" "}
                    <span style={s("font:400 12px/1 'Instrument Sans',sans-serif;color:#8A7E70")}>{t("contact.side.phone_lang_es")}</span>
                  </a>
                  <a href="tel:+353852680856" style={s("font:500 15px/1.3 'Instrument Sans',sans-serif;color:#1F1814;text-decoration:none")}>
                    {CONTACT.phoneIE}{" "}
                    <span style={s("font:400 12px/1 'Instrument Sans',sans-serif;color:#8A7E70")}>{t("contact.side.phone_lang_en")}</span>
                  </a>
                </div>
              </div>
              <div>
                <div style={s("font:500 11px/1 'Instrument Sans',sans-serif;color:#8A7E70;margin-bottom:6px")}>WhatsApp</div>
                <div style={s("display:flex;flex-direction:column;gap:5px")}>
                  <a href={CONTACT.whatsappES} target="_blank" rel="noopener noreferrer" style={s("font:500 15px/1.3 'Instrument Sans',sans-serif;color:#1F1814;text-decoration:none")}>
                    {CONTACT.phoneES}{" "}
                    <span style={s("font:400 12px/1 'Instrument Sans',sans-serif;color:#8A7E70")}>· Pablo</span>
                  </a>
                  <a href={CONTACT.whatsappIE} target="_blank" rel="noopener noreferrer" style={s("font:500 15px/1.3 'Instrument Sans',sans-serif;color:#1F1814;text-decoration:none")}>
                    {CONTACT.phoneIE}{" "}
                    <span style={s("font:400 12px/1 'Instrument Sans',sans-serif;color:#8A7E70")}>· Sergio</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
