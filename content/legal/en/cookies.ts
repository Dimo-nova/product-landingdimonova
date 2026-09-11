import { COMPANY, LEGAL_UPDATED } from "@/lib/config";
import type { LegalDoc } from "../types";

export const cookies: LegalDoc = {
  slug: "cookies",
  title: "Cookie policy",
  description: "The one cookie dimonova.com uses, what it does, and why it doesn't need a consent banner.",
  intro:
    "This page explains what cookies dimonova.com uses. There is only one, first-party and strictly necessary for the site to work.",
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
              "Stores the language you pick in the language selector, so the rest of the pages are shown in it. It is only created if you change the language yourself: simply browsing the site does not set it",
              "Session: deleted when you close your browser",
            ],
          ],
        },
        {
          kind: "p",
          text: "This is the only cookie we use. It is first-party (set by dimonova.com), and it is not used to identify you or to track you across other websites.",
        },
      ],
    },
    {
      heading: "3. What we do not use",
      blocks: [
        {
          kind: "p",
          text: "We use no analytics, advertising or profiling cookies, no social-media cookies, and no tracking pixels or beacons. Opening any page loads nothing from a third-party domain: fonts, images and scripts are all served from dimonova.com. The one exception happens if you press play on a client review video: the video is then downloaded from our storage provider (Supabase, in the European Union), which receives your IP address in order to send it to you. That provider sets no cookies in your browser.",
        },
      ],
    },
    {
      heading: "4. Why there is no cookie banner",
      blocks: [
        {
          kind: "p",
          text: "The cookie we use is strictly necessary to provide a function you asked for (viewing the site in your language), so it is exempt from the prior-consent requirement in article 22.2 of the Spanish LSSI-CE and the equivalent ePrivacy rules.",
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
          text: "You can delete or block cookies in your browser settings. Blocking it only means the site will forget the language you chose.",
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
