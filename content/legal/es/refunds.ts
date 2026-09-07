import { COMPANY, LEGAL_UPDATED } from "@/lib/config";
import type { LegalDoc } from "../types";

export const refunds: LegalDoc = {
  slug: "refunds",
  title: "Reembolsos y cancelaciones",
  description: "Condiciones comerciales por defecto para la cancelación del proyecto de puesta en marcha y de la suscripción mensual.",
  intro:
    "Estas son las condiciones comerciales por defecto para reembolsos y cancelaciones. Si la propuesta firmada contigo dice algo distinto, prevalece siempre la propuesta firmada.",
  sections: [
    {
      heading: "1. A quién se aplica",
      blocks: [
        {
          kind: "p",
          text: "Estas condiciones se aplican a clientes que contratan en condición de empresa: restaurantes, bares, cafeterías y grupos de hostelería.",
        },
        {
          kind: "p",
          text: "El derecho de desistimiento de 14 días es un derecho reconocido a los consumidores y no se aplica a los contratos entre empresas. Si vas a contratar como consumidor y no como empresa, dínoslo antes de firmar y aplicaremos las normas de consumo que correspondan.",
        },
      ],
    },
    {
      heading: "2. Cuota de puesta en marcha y creación de la carta",
      blocks: [
        {
          kind: "table",
          head: ["Cuándo cancelas", "Qué reembolsamos"],
          rows: [
            ["Antes de la llamada de arranque del proyecto", "100% de lo pagado hasta ese momento."],
            ["Después del arranque, antes de entregarte la carta para revisión", "50%."],
            ["Después de entregarte la carta para revisión", "Nada, porque el trabajo ya está hecho."],
          ],
        },
      ],
    },
    {
      heading: "3. Suscripción mensual",
      blocks: [
        {
          kind: "p",
          text: "Puedes cancelar la suscripción mensual en cualquier momento con 30 días de preaviso. El servicio sigue activo hasta el final del periodo ya pagado y no reembolsamos meses parciales.",
        },
        {
          kind: "p",
          text: "No hay cuota de cancelación ni permanencia mínima, salvo que la propuesta firmada recoja por escrito un plazo mínimo distinto.",
        },
      ],
    },
    {
      heading: "4. Si algo falla por nuestra parte",
      blocks: [
        {
          kind: "p",
          text: "Si no te entregamos lo acordado, dínoslo y lo arreglaremos. Si no podemos solucionarlo en un plazo razonable, te reembolsamos los periodos afectados.",
        },
      ],
    },
    {
      heading: "5. Cómo solicitar un reembolso",
      blocks: [
        {
          kind: "p",
          text: `Escríbenos a ${COMPANY.email} desde la dirección asociada a tu cuenta, dentro de los 14 días siguientes al cargo, indicando qué solicitas y por qué.`,
        },
        {
          kind: "p",
          text: "Te respondemos en un plazo máximo de 5 días laborables y, si el reembolso se aprueba, lo abonamos en un plazo máximo de 14 días al mismo medio de pago que usaste.",
        },
      ],
    },
    {
      heading: "6. Devoluciones de cargo (chargebacks)",
      blocks: [
        {
          kind: "p",
          text: "Si tienes un problema con un cargo, contáctanos primero. Una devolución de cargo iniciada sin avisarnos puede suponer la suspensión del servicio mientras el banco investiga.",
        },
      ],
    },
    {
      heading: "7. Contacto, última actualización y prevalencia del idioma",
      blocks: [
        {
          kind: "p",
          text: `Para cualquier pregunta sobre estas condiciones, escríbenos a ${COMPANY.email}. Última revisión: ${LEGAL_UPDATED}.`,
        },
        {
          kind: "p",
          text: "La versión en español de este documento es la vinculante; las versiones en otros idiomas se ofrecen únicamente como ayuda para su comprensión.",
        },
      ],
    },
  ],
};
