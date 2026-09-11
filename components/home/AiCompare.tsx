"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { AI_PROVIDER_IDS, AI_PROVIDER_LABELS, AI_PROVIDER_LOGOS, buildProviderUrl } from "@/lib/aiPrompt";
import { copyText } from "@/lib/clipboard";
import styles from "./AiCompare.module.css";

/**
 * Generic "opens elsewhere" glyph — an arrow leaving a box. Plain UI iconography (the
 * same shape used across the web for external links), not a brand mark, so it's safe to
 * share across all four provider pills.
 */
function ExternalIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.5 3H3.5C2.94772 3 2.5 3.44772 2.5 4V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H12C12.5523 13.5 13 13.0523 13 12.5V9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 2.5H13.5V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 3L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * "Ask someone who doesn't work here": hands the visitor the full, honest pitch as a
 * prompt they can open in whichever assistant they already trust, so the comparison
 * comes from a third party rather than from us. Each provider is shown with its own
 * official mark and its name, which is ordinary nominative reference: it says where the
 * link goes, not that anyone endorses us. See `public/assets/ai/SOURCES.md` for where each
 * file came from and the permission question that remains open.
 */
export default function AiCompare() {
  const t = useTranslations("home.aiCompare");
  const prompt = t("prompt");

  const [copied, setCopied] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (fallbackOpen) {
      fallbackRef.current?.focus();
      fallbackRef.current?.select();
    }
  }, [fallbackOpen]);

  async function handleCopy() {
    const ok = await copyText(prompt);
    if (!ok) {
      setFallbackOpen(true);
      return;
    }
    setFallbackOpen(false);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="ai-compare" className={styles.section}>
      <Container>
        <Reveal className={styles.head}>
          <h2 className={styles.title}>{t("title")}</h2>
          <p className={styles.lead}>{t("lead")}</p>
        </Reveal>

        <Reveal delay={0.1} className={styles.actions}>
          <div className={styles.providers}>
            {AI_PROVIDER_IDS.map((id) => (
              <a
                key={id}
                className={styles.provider}
                href={buildProviderUrl(id, prompt)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* alt="": the provider's name is the next thing in the link's own text, so
                    alt text on the mark would make a screen reader say it twice. */}
                <span className={styles.plate}>
                  <img src={AI_PROVIDER_LOGOS[id]} alt="" className={styles.logo} />
                </span>
                {/* On a phone the four links collapse to their marks in one row; the name stays
                    in the DOM, visually hidden, so the link keeps its accessible name. */}
                <span className={styles.label}>{AI_PROVIDER_LABELS[id]}</span>
                <ExternalIcon />
              </a>
            ))}
          </div>

          <Button variant="outline" onDark size="xl" type="button" onClick={handleCopy}>
            {copied ? t("copied") : t("copy")}
          </Button>

          {fallbackOpen && (
            <div className={styles.fallback}>
              <label className={styles.fallbackLabel} htmlFor="ai-compare-fallback">
                {t("copy")}
              </label>
              <textarea
                id="ai-compare-fallback"
                ref={fallbackRef}
                className={styles.fallbackArea}
                readOnly
                value={prompt}
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
