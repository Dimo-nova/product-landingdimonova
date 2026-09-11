"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { copyText } from "@/lib/clipboard";
import styles from "./Footer.module.css";

/**
 * The footer's email address. A click copies it and says so for two seconds instead of
 * opening a mail client — most visitors are on a phone with no desktop mail app configured,
 * and the address is what they came for. The `mailto:` href stays: it is what the link
 * means to a crawler, to a right-click, and to the click itself when the clipboard is not
 * available (then the default navigation runs and the mail client opens as before).
 */
export default function CopyEmail({ email }: { email: string }) {
  const t = useTranslations("footer");
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Decide before awaiting: preventDefault after an await is too late for the browser.
    if (!navigator.clipboard?.writeText) return;
    e.preventDefault();
    const ok = await copyText(email);
    if (!ok) {
      window.location.href = `mailto:${email}`;
      return;
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <span className={styles.email}>
      <a href={`mailto:${email}`} onClick={handleClick}>{email}</a>
      <span role="status" className={styles.copied}>{copied ? t("emailCopied") : ""}</span>
    </span>
  );
}
