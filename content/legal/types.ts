export type LegalSlug = "privacy" | "terms" | "cookies" | "refunds";

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
