"use client";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { openDemo } from "@/lib/events";
import styles from "./EmailCta.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Email field that hands the address to the demo modal instead of submitting anywhere. */
export default function EmailCta({ source, onDark }: { source: string; onDark?: boolean }) {
  const t = useTranslations("home.hero");
  const [error, setError] = useState<string | null>(null);
  const errId = useId();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString().trim() ?? "";
    if (!EMAIL_RE.test(email)) { setError(t("emailInvalid")); return; }
    setError(null);
    openDemo({ email, source });
  }

  return (
    <form
      className={[styles.form, onDark && styles.onDark].filter(Boolean).join(" ")}
      onSubmit={onSubmit}
      noValidate
      aria-label={t("cta")}
    >
      <div className={styles.row}>
        <input
          className={styles.input}
          type="email"
          name="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          aria-label={t("emailPlaceholder")}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          onChange={() => error && setError(null)}
        />
        <Button type="submit" size="lg">{t("cta")}</Button>
      </div>
      {error && <span id={errId} className={styles.error}>{error}</span>}
    </form>
  );
}
