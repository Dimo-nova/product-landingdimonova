export const CONTACT = {
  email: "pablo@dimonova.com",
  phoneIE: "+353 085 268 0856",
  phoneES: "+34 622 040 285",
  whatsappES: "https://wa.me/34622040285", // Pablo
  whatsappIE: "https://wa.me/353852680856", // Sergio
} as const;

/** Client dashboard (panel-admin). Linked from the header, mobile nav and footer. */
export const ADMIN_URL = "https://menuadmin.dimonova.com";

/**
 * Legal identity of the operator, required by art. 10 LSSI-CE and GDPR art. 13.
 * PENDING: every «...» value must be replaced with the real registered data before deploy.
 */
export const COMPANY = {
  tradingName: "Dimonova",
  legalName: "«PENDIENTE: razón social»",
  legalForm: "«PENDIENTE: forma jurídica»",
  taxId: "«PENDIENTE: NIF/CIF/VAT»",
  address: "«PENDIENTE: domicilio social completo»",
  registry: "«PENDIENTE: datos registrales»",
  jurisdiction: "«PENDIENTE: país y tribunales competentes»",
  email: CONTACT.email,
} as const;

/** Last review date of the legal documents (ISO). Bump when you change their content. */
export const LEGAL_UPDATED = "2026-09-07";
