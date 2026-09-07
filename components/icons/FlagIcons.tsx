import type { ReactNode } from "react";

const FLAGS: Record<string, ReactNode> = {
  en: (
    <>
      <rect width="20" height="15" fill="#012169" />
      <path d="M0 0 20 15M20 0 0 15" stroke="#fff" strokeWidth="3" />
      <path d="M0 0 20 15M20 0 0 15" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M10 0v15M0 7.5h20" stroke="#fff" strokeWidth="5" />
      <path d="M10 0v15M0 7.5h20" stroke="#C8102E" strokeWidth="3" />
    </>
  ),
  es: (
    <>
      <rect width="20" height="15" fill="#AA151B" />
      <rect y="3.75" width="20" height="7.5" fill="#F1BF00" />
    </>
  ),
  de: (
    <>
      <rect width="20" height="5" fill="#000" />
      <rect y="5" width="20" height="5" fill="#DD0000" />
      <rect y="10" width="20" height="5" fill="#FFCE00" />
    </>
  ),
  fr: (
    <>
      <rect width="20" height="15" fill="#fff" />
      <rect width="6.67" height="15" fill="#002395" />
      <rect x="13.33" width="6.67" height="15" fill="#ED2939" />
    </>
  ),
  pt: (
    <>
      <rect width="20" height="15" fill="#DA291C" />
      <rect width="8" height="15" fill="#046A38" />
      <circle cx="8" cy="7.5" r="3.1" fill="#FFE900" stroke="#046A38" strokeWidth="0.6" />
    </>
  ),
};

/** Simplified flag for the language picker. Decorative: the language name carries the meaning. */
export function FlagIcon({ locale }: { locale: string }) {
  const flag = FLAGS[locale];
  if (!flag) return null;
  return (
    <svg viewBox="0 0 20 15" width="20" height="15" aria-hidden="true" focusable="false" style={{ borderRadius: 2, display: "block", flex: "none" }}>
      {flag}
    </svg>
  );
}
