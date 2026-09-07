import { COMPANY, LEGAL_UPDATED } from "@/lib/config";
import type { LegalDoc } from "../types";

export const refunds: LegalDoc = {
  slug: "refunds",
  title: "Refunds and cancellations",
  description: "Default commercial terms for cancelling the setup project and the monthly subscription.",
  intro:
    "These are the default commercial terms for refunds and cancellations. Where your signed proposal says something different, the signed proposal always prevails.",
  sections: [
    {
      heading: "1. Who this applies to",
      blocks: [
        {
          kind: "p",
          text: "These terms apply to clients contracting as a business: restaurants, bars, cafés and hospitality groups.",
        },
        {
          kind: "p",
          text: "The 14-day statutory right of withdrawal is a consumer right and does not apply to business-to-business contracts. If you are contracting as a consumer rather than as a business, tell us before signing and we will apply the relevant consumer rules.",
        },
      ],
    },
    {
      heading: "2. Setup and menu-build fee",
      blocks: [
        {
          kind: "table",
          head: ["When you cancel", "What we refund"],
          rows: [
            ["Before the project kick-off call", "100% of anything already paid."],
            ["After kick-off, before we deliver the menu for review", "50%."],
            ["After we deliver the menu for review", "Nothing, because the work is done."],
          ],
        },
      ],
    },
    {
      heading: "3. Monthly subscription",
      blocks: [
        {
          kind: "p",
          text: "You can cancel the monthly subscription at any time with 30 days' notice. The service runs to the end of the period already paid for, and we do not refund part-months.",
        },
        {
          kind: "p",
          text: "There is no cancellation fee and no minimum term, unless the signed proposal sets out a different minimum term in writing.",
        },
      ],
    },
    {
      heading: "4. If something is wrong on our side",
      blocks: [
        {
          kind: "p",
          text: "If we do not deliver what was agreed, tell us and we will fix it. If we cannot fix it within a reasonable time, we refund the periods affected.",
        },
      ],
    },
    {
      heading: "5. How to ask for a refund",
      blocks: [
        {
          kind: "p",
          text: `Email ${COMPANY.email} from the address on your account, within 14 days of the charge, saying what you are asking for and why.`,
        },
        {
          kind: "p",
          text: "We reply within 5 working days and, once a refund is approved, we pay it within 14 days to the original payment method.",
        },
      ],
    },
    {
      heading: "6. Chargebacks",
      blocks: [
        {
          kind: "p",
          text: "If you have a problem with a charge, contact us first. A chargeback raised without contacting us may suspend the service while the bank investigates.",
        },
      ],
    },
    {
      heading: "7. Contact, last updated and prevailing language",
      blocks: [
        {
          kind: "p",
          text: `If you have any question about these terms, write to us at ${COMPANY.email}. Last reviewed: ${LEGAL_UPDATED}.`,
        },
        {
          kind: "p",
          text: "The Spanish version of this document is the binding one; versions in other languages are provided only to help you understand it.",
        },
      ],
    },
  ],
};
