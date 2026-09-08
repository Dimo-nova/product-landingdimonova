"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { AI_PROVIDER_IDS, AI_PROVIDER_LABELS, buildProviderUrl, type AiProviderId } from "@/lib/aiPrompt";
import styles from "./AiCompare.module.css";

const ICON_SRC: Record<AiProviderId, string> = {
  chatgpt: "/assets/ai/chatgpt.svg",
  claude: "/assets/ai/claude.svg",
  perplexity: "/assets/ai/perplexity.svg",
  google: "/assets/ai/google.svg",
};

/**
 * Copies `text` to the clipboard, trying three tiers so a visitor is never left with a
 * silent no-op: the async Clipboard API, then a legacy `execCommand("copy")` on a
 * temporary textarea, and finally "nothing worked" so the caller can fall back to a
 * visible, read-only textarea the visitor can select and copy by hand.
 */
async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path below
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * "Ask someone who doesn't work here": hands the visitor the full, honest pitch as a
 * prompt they can open in whichever assistant they already trust, so the comparison
 * comes from a third party rather than from us. The four marks are original glyphs we
 * drew for this section (see public/assets/ai/*.svg) — not the providers' logos, which
 * are trademarks this site has no licence to reproduce.
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
                <span
                  className={styles.mark}
                  style={{ WebkitMaskImage: `url(${ICON_SRC[id]})`, maskImage: `url(${ICON_SRC[id]})` }}
                  aria-hidden="true"
                />
                <span className="u-visually-hidden">{AI_PROVIDER_LABELS[id]}</span>
              </a>
            ))}
          </div>

          <Button variant="outline" onDark size="lg" className={styles.copyBtn} type="button" onClick={handleCopy}>
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
