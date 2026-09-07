import { COMPANY, LEGAL_UPDATED } from "@/lib/config";
import type { LegalDoc } from "../types";

export const cookies: LegalDoc = {
  slug: "cookies",
  title: "Cookie policy",
  description: "The two cookies dimonova.com uses, what they do, and why they don't need a consent banner.",
  intro:
    "This page explains what cookies dimonova.com uses. There are only two, both first-party and strictly necessary for the site to work.",
  sections: [
    {
      heading: "1. What a cookie is",
      blocks: [
        {
          kind: "p",
          text: "A cookie is a small text file a website stores in your browser to remember information between visits, such as a language preference.",
        },
      ],
    },
    {
      heading: "2. The cookies this site uses",
      blocks: [
        {
          kind: "table",
          head: ["Cookie", "Type", "What it does", "Duration"],
          rows: [
            [
              "NEXT_LOCALE",
              "First-party, technical/preference",
              "Stores the language you are reading the site in, so you land on it next time",
              "1 year",
            ],
            [
              "dim-lang-dismissed",
              "First-party, technical/preference",
              "Records that you closed the bar offering the site in your browser's language, so it is not shown again",
              "90 days",
            ],
          ],
        },
        {
          kind: "p",
          text: "These are the only two cookies we use. Both are first-party (set by dimonova.com), and neither is used to identify you or to track you across other websites.",
        },
      ],
    },
    {
      heading: "3. What we do not use",
      blocks: [
        {
          kind: "p",
          text: "We use no analytics, advertising or profiling cookies, no social-media cookies, and no tracking pixels or beacons. We also load no fonts, images or scripts from third-party domains.",
        },
      ],
    },
    {
      heading: "4. Why there is no cookie banner",
      blocks: [
        {
          kind: "p",
          text: "The two cookies we use are strictly necessary to provide a function you asked for (viewing the site in your language), so they are exempt from the prior-consent requirement in article 22.2 of the Spanish LSSI-CE and the equivalent ePrivacy rules.",
        },
        {
          kind: "p",
          text: "If we ever add analytics or marketing technologies, we will publish a consent banner and ask you first, before activating them.",
        },
      ],
    },
    {
      heading: "5. Managing cookies",
      blocks: [
        {
          kind: "p",
          text: "You can delete or block cookies in your browser settings. Blocking these two only means the site will forget the language you chose.",
        },
        {
          kind: "p",
          text: "Cookie settings for the major browsers: Google Chrome (https://support.google.com/chrome), Mozilla Firefox (https://support.mozilla.org), Safari (https://support.apple.com/safari) and Microsoft Edge (https://support.microsoft.com/microsoft-edge).",
        },
      ],
    },
    {
      heading: "6. Changes, last updated and contact",
      blocks: [
        {
          kind: "p",
          text: "If we change the cookies we use, we will update this page.",
        },
        {
          kind: "p",
          text: `Last reviewed: ${LEGAL_UPDATED}. If you have any question about this policy, write to us at ${COMPANY.email}.`,
        },
        {
          kind: "p",
          text: "The Spanish version of this document is the binding one; versions in other languages are provided only to help you understand it.",
        },
      ],
    },
  ],
};
