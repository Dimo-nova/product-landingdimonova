import type { routing } from "./routing";

type Locale = (typeof routing.locales)[number];

/** Prompt shown in the *preferred* language, so it is readable by the visitor. */
export const BANNER_COPY: Record<Locale, string> = {
  en: "Prefer to read this in English?",
  es: "¿Prefieres leerlo en español?",
  de: "Lieber auf Deutsch lesen?",
  fr: "Préférez-vous lire en français ?",
  pt: "Prefere ler em português?",
};
