import { COMPANY } from "@/lib/config";

export type LegalSlug = "privacy" | "terms" | "cookies" | "refunds";

/**
 * Registry-details fragment as its own sentence, e.g. " Datos registrales: X." — appended
 * only when `COMPANY.registry` is set. Sole traders have no company-registry entry, so this
 * returns "" and the surrounding sentence reads cleanly without it.
 */
export function registrySentence(label: string): string {
  return COMPANY.registry ? ` ${label}: ${COMPANY.registry}.` : "";
}

/**
 * Registry-details fragment as a clause inside a larger sentence, e.g. ", registry details: X"
 * — appended only when `COMPANY.registry` is set. Pass the connector/punctuation that should
 * precede the label (e.g. ", registry details" or " y datos registrales").
 */
export function registryClause(prefixedLabel: string): string {
  return COMPANY.registry ? `${prefixedLabel}: ${COMPANY.registry}` : "";
}

export type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][] };

export type LegalSection = { heading: string; blocks: Block[] };

export type LegalDoc = {
  slug: LegalSlug;
  title: string;
  description: string;
  /** Short lead paragraph under the H1. */
  intro: string;
  sections: LegalSection[];
};
