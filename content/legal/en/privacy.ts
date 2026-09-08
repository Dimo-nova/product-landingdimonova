import { COMPANY, LEGAL_UPDATED } from "@/lib/config";
import { registrySentence } from "../types";
import type { LegalDoc } from "../types";

export const privacy: LegalDoc = {
  slug: "privacy",
  title: "Privacy policy",
  description: "How we handle your personal data when you visit dimonova.com or write to us through the demo or contact form.",
  intro:
    "This policy explains what personal data we collect on dimonova.com, what we use it for, who we share it with, and what rights you have. It is written in plain language; if anything is unclear, write to us.",
  sections: [
    {
      heading: "1. Who is responsible for processing your data",
      blocks: [
        {
          kind: "p",
          text: `The controller of your data is ${COMPANY.legalName} (${COMPANY.legalForm}), tax ID ${COMPANY.taxId}, registered at ${COMPANY.address}.${registrySentence("Registry details")} You can contact us at ${COMPANY.email}.`,
        },
        {
          kind: "p",
          text: "We have not appointed a Data Protection Officer (DPO). The processing we carry out does not meet the thresholds in article 37 of the GDPR that would require appointing one: we do not process data at large scale or special categories of data as a core activity.",
        },
      ],
    },
    {
      heading: "2. What this policy covers",
      blocks: [
        {
          kind: "p",
          text: "This policy covers this website only, dimonova.com. The client dashboard and the published restaurant menus are separate services, governed by the contract each client signs.",
        },
        {
          kind: "p",
          text: "For data about a client's own diners (for example, someone scanning a digital menu), Dimonova acts as a processor on that client's behalf, under a separate data processing agreement not covered by this policy.",
        },
      ],
    },
    {
      heading: "3. What we collect",
      blocks: [
        {
          kind: "p",
          text: "We collect personal data in three different situations.",
        },
        {
          kind: "p",
          text: "What you send us through the demo form or the contact form:",
        },
        {
          kind: "list",
          items: [
            "Name",
            "Email address",
            "Restaurant, bar or café name",
            "Phone number (optional)",
            "Number of venues",
            "How your menu is published today",
            "A free-text message (contact form only)",
            "A link to your current menu (optional)",
            "An uploaded menu file (optional)",
            "The site language you are reading in",
            "The button or link you came from",
          ],
        },
        {
          kind: "p",
          text: "An uploaded menu file may unintentionally contain personal data about third parties (for example, staff names in an internal document). Please do not include data in it that is not necessary for us to prepare your proposal.",
        },
        {
          kind: "p",
          text: "What our hosting provider records automatically, in standard server logs, for security and availability: IP address, browser user agent, requested URL, and the date and time of the request.",
        },
        {
          kind: "p",
          text: "Cookies: we only use the two functional cookies described in our cookie policy. We use no analytics, advertising, profiling or social-media cookies, and load no scripts, fonts or images from third-party domains.",
        },
      ],
    },
    {
      heading: "4. Why we use your data and on what legal basis",
      blocks: [
        {
          kind: "table",
          head: ["Purpose", "Data", "Legal basis"],
          rows: [
            [
              "Answer your enquiry and prepare a proposal",
              "Form data",
              "Art. 6(1)(b) GDPR: steps taken at your request before entering into a contract.",
            ],
            [
              "Keep a record of the enquiry so we can follow it up",
              "Form data",
              "Art. 6(1)(a) GDPR: the consent you give by ticking the box on the form.",
            ],
            [
              "Keep the site secure, available and free of abuse",
              "Server logs",
              "Art. 6(1)(f) GDPR: our legitimate interest.",
            ],
            [
              "Remember the language you chose",
              "Functional cookies",
              "Art. 6(1)(f) GDPR, to provide a service you explicitly asked for.",
            ],
          ],
        },
      ],
    },
    {
      heading: "5. Who else sees it",
      blocks: [
        {
          kind: "table",
          head: ["Provider", "What they do", "Where", "Safeguard"],
          rows: [
            [
              "Vercel Inc.",
              "Hosts the website and keeps the server logs",
              "United States / European Union",
              "Data processing agreement and EU standard contractual clauses",
            ],
            [
              "Plus Five Five, Inc. (Resend)",
              "Delivers the notification email that tells us about your enquiry",
              "United States",
              "Data processing agreement and EU standard contractual clauses",
            ],
            [
              "Notion Labs, Inc.",
              "Stores the enquiry record in our internal database",
              "United States",
              "Data processing agreement and EU standard contractual clauses",
            ],
            [
              "Supabase Inc.",
              "Hosts the client review videos. It only receives your IP address if you press play on one of them; nothing of theirs is loaded when the page opens",
              "European Union (Ireland)",
              "Data processing agreement",
            ],
          ],
        },
        {
          kind: "p",
          text: "We never sell personal data, we run no advertising, and we do not share your data with anyone else. We disclose data to public authorities only where the law obliges us to.",
        },
      ],
    },
    {
      heading: "6. Transfers outside the European Economic Area",
      blocks: [
        {
          kind: "p",
          text: `The three providers listed above process data in the United States. These transfers rely on the European Commission's Standard Contractual Clauses and, where the provider is certified, the EU-US Data Privacy Framework. A copy of the safeguards can be requested at ${COMPANY.email}.`,
        },
      ],
    },
    {
      heading: "7. How long we keep it",
      blocks: [
        {
          kind: "table",
          head: ["Data", "Retention"],
          rows: [
            ["Enquiries that do not lead to a contract", "12 months from the last contact, then deleted."],
            ["Enquiries that lead to a contract", "For the life of the contract and 6 years afterwards, to meet commercial and tax record-keeping obligations."],
            ["Uploaded menu files", "Deleted once the proposal is closed, and in any case within 12 months."],
            ["Server logs", "The retention period applied by our hosting provider."],
          ],
        },
      ],
    },
    {
      heading: "8. Your rights",
      blocks: [
        {
          kind: "p",
          text: "You have the right to access, rectify and erase your data, to restrict or object to its processing, to data portability, and to withdraw your consent at any time without affecting the lawfulness of processing carried out before the withdrawal.",
        },
        {
          kind: "p",
          text: `You can exercise these rights by emailing ${COMPANY.email} from the address you used to contact us, stating what you want. We answer within one month.`,
        },
        {
          kind: "p",
          text: "You can also complain to the Spanish Data Protection Agency (Agencia Española de Protección de Datos, AEPD), at https://www.aepd.es, or to the supervisory authority where you live or work.",
        },
      ],
    },
    {
      heading: "9. Automated decisions",
      blocks: [
        {
          kind: "p",
          text: "We make no automated decisions and do no profiling with the data we collect through this site.",
        },
      ],
    },
    {
      heading: "10. Children",
      blocks: [
        {
          kind: "p",
          text: "This service is sold to businesses and is not directed at anyone under 18. We do not knowingly collect data from children.",
        },
      ],
    },
    {
      heading: "11. Changes, last update and contact",
      blocks: [
        {
          kind: "p",
          text: "If we change this policy, we will publish the new version on this same page with the updated date. If the change is significant, we will try to let you know through the contact channels available.",
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
