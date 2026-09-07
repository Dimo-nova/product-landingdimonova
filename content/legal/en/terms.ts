import { COMPANY, LEGAL_UPDATED } from "@/lib/config";
import type { LegalDoc } from "../types";

export const terms: LegalDoc = {
  slug: "terms",
  title: "Legal notice and terms of use",
  description: "Who operates dimonova.com, what this site is for, and the terms of use that apply when you visit it.",
  intro:
    "This legal notice identifies who operates this website and sets out the terms that apply to using it, as required by article 10 of the Spanish LSSI-CE.",
  sections: [
    {
      heading: "1. Who owns this site",
      blocks: [
        {
          kind: "p",
          text: `This website is operated under the trading name "${COMPANY.tradingName}" by ${COMPANY.legalName} (${COMPANY.legalForm}), tax ID ${COMPANY.taxId}, registered address ${COMPANY.address}, registry details: ${COMPANY.registry}. You can contact us at ${COMPANY.email}.`,
        },
      ],
    },
    {
      heading: "2. What this site is for",
      blocks: [
        {
          kind: "p",
          text: "This site presents our digital-menu service and lets you request a demo. The information shown here, including any price displayed, is commercial information and not a binding offer.",
        },
        {
          kind: "p",
          text: "Any prices you see are indicative starting figures, exclusive of VAT or any equivalent tax, and the binding terms of any engagement are those set out in the written proposal each client signs.",
        },
      ],
    },
    {
      heading: "3. Using the site",
      blocks: [
        {
          kind: "p",
          text: "By using this site you agree to use it lawfully, not to attempt to disrupt its operation, not to extract its content by automated means for republication, and not to submit anyone else's personal data through our forms without a lawful basis for doing so.",
        },
      ],
    },
    {
      heading: "4. Intellectual property",
      blocks: [
        {
          kind: "p",
          text: `The design, text, code and images of this site belong to ${COMPANY.legalName} or are used with the permission of their owners. The Dimonova name and logo belong to the operator.`,
        },
        {
          kind: "p",
          text: "Client names and logos shown as references are the property of their respective owners and appear with their permission. Nothing on this site grants a licence to use them.",
        },
      ],
    },
    {
      heading: "5. Links and third-party services",
      blocks: [
        {
          kind: "p",
          text: "This site links to WhatsApp (operated by Meta) and to the client dashboard at menuadmin.dimonova.com. Following an outbound link takes you to a service with its own terms and privacy policy, over which we have no control.",
        },
      ],
    },
    {
      heading: "6. Availability and liability",
      blocks: [
        {
          kind: "p",
          text: "We work to keep the site available and its content accurate, but we do not guarantee either. To the extent permitted by law, we exclude liability for indirect or consequential loss arising from use of the site.",
        },
        {
          kind: "p",
          text: "Nothing in this notice excludes liability that cannot lawfully be excluded.",
        },
      ],
    },
    {
      heading: "7. Personal data",
      blocks: [
        {
          kind: "p",
          text: "How we process your personal data is explained in our privacy policy and our cookie policy.",
        },
      ],
    },
    {
      heading: "8. Changes",
      blocks: [
        {
          kind: "p",
          text: "We may update the site and these terms at any time. The version published on this page is the one in force.",
        },
      ],
    },
    {
      heading: "9. Governing law and jurisdiction",
      blocks: [
        {
          kind: "p",
          text: `These terms are governed by the law of ${COMPANY.jurisdiction}. Because our clients contract as businesses, both parties submit to the courts of ${COMPANY.jurisdiction}.`,
        },
        {
          kind: "p",
          text: "This clause does not apply to anyone contracting as a consumer, whose statutory forum is unaffected by the above.",
        },
      ],
    },
    {
      heading: "10. Contact, last updated and prevailing language",
      blocks: [
        {
          kind: "p",
          text: `If you have any question about this legal notice, write to us at ${COMPANY.email}. Last reviewed: ${LEGAL_UPDATED}.`,
        },
        {
          kind: "p",
          text: "The Spanish version of this document is the binding one; versions in other languages are provided only to help you understand it.",
        },
      ],
    },
  ],
};
