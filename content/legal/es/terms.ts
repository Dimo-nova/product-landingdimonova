import { COMPANY, LEGAL_UPDATED } from "@/lib/config";
import type { LegalDoc } from "../types";

export const terms: LegalDoc = {
  slug: "terms",
  title: "Aviso legal y condiciones de uso",
  description: "Quién opera dimonova.com, para qué sirve este sitio y las condiciones de uso que se aplican al visitarlo.",
  intro:
    "Este aviso legal identifica a quién opera este sitio web y establece las condiciones que se aplican a su uso, tal como exige el artículo 10 de la LSSI-CE.",
  sections: [
    {
      heading: "1. Quién es el titular de este sitio",
      blocks: [
        {
          kind: "p",
          text: `Este sitio web es operado bajo el nombre comercial "${COMPANY.tradingName}" por ${COMPANY.legalName} (${COMPANY.legalForm}), con NIF/CIF ${COMPANY.taxId}, domicilio social en ${COMPANY.address} y datos registrales: ${COMPANY.registry}. Puedes contactarnos en ${COMPANY.email}.`,
        },
      ],
    },
    {
      heading: "2. Para qué sirve este sitio",
      blocks: [
        {
          kind: "p",
          text: "Este sitio presenta nuestro servicio de cartas digitales y te permite solicitar una demo. La información que aparece aquí, incluido cualquier precio mostrado, es información comercial y no constituye una oferta vinculante.",
        },
        {
          kind: "p",
          text: "Los precios que puedas ver son cifras orientativas de partida, no incluyen IVA ni ningún impuesto equivalente, y las condiciones vinculantes de cualquier contratación son las que se recogen en la propuesta escrita que firma cada cliente.",
        },
      ],
    },
    {
      heading: "3. Uso del sitio",
      blocks: [
        {
          kind: "p",
          text: "Al usar este sitio te comprometes a hacerlo de forma lícita, a no intentar perturbar su funcionamiento, a no extraer su contenido por medios automatizados para republicarlo, y a no enviar a través de nuestros formularios datos personales de otra persona sin tener una base legal para hacerlo.",
        },
      ],
    },
    {
      heading: "4. Propiedad intelectual",
      blocks: [
        {
          kind: "p",
          text: `El diseño, los textos, el código y las imágenes de este sitio pertenecen a ${COMPANY.legalName} o se usan con autorización de sus titulares. El nombre y el logotipo de Dimonova son propiedad del operador.`,
        },
        {
          kind: "p",
          text: "Los nombres y logotipos de clientes que se muestran como referencias son propiedad de sus respectivos titulares y aparecen con su permiso. Nada en este sitio concede una licencia para usarlos.",
        },
      ],
    },
    {
      heading: "5. Enlaces y servicios de terceros",
      blocks: [
        {
          kind: "p",
          text: "Este sitio enlaza a WhatsApp (operado por Meta) y al panel de gestión para clientes en menuadmin.dimonova.com. Seguir un enlace externo te lleva a un servicio con sus propios términos y política de privacidad, sobre el que no tenemos control.",
        },
      ],
    },
    {
      heading: "6. Disponibilidad y responsabilidad",
      blocks: [
        {
          kind: "p",
          text: "Trabajamos para mantener el sitio disponible y su contenido actualizado, pero no lo garantizamos. En la medida en que lo permita la ley, excluimos la responsabilidad por daños indirectos o consecuentes derivados del uso del sitio.",
        },
        {
          kind: "p",
          text: "Nada en este aviso excluye una responsabilidad que no pueda excluirse legalmente.",
        },
      ],
    },
    {
      heading: "7. Datos personales",
      blocks: [
        {
          kind: "p",
          text: "El tratamiento de tus datos personales se explica en nuestra política de privacidad y en nuestra política de cookies.",
        },
      ],
    },
    {
      heading: "8. Cambios",
      blocks: [
        {
          kind: "p",
          text: "Podemos actualizar el sitio y estas condiciones en cualquier momento. La versión publicada en esta página es la que está en vigor.",
        },
      ],
    },
    {
      heading: "9. Ley aplicable y jurisdicción",
      blocks: [
        {
          kind: "p",
          text: `Estas condiciones se rigen por la ley de ${COMPANY.jurisdiction}. Como nuestros clientes contratan en condición de empresa, ambas partes se someten a los tribunales de ${COMPANY.jurisdiction}.`,
        },
        {
          kind: "p",
          text: "Esta cláusula no se aplica a quien contrate como consumidor, cuyo fuero legal no se ve afectado por lo anterior.",
        },
      ],
    },
    {
      heading: "10. Contacto, última actualización y prevalencia del idioma",
      blocks: [
        {
          kind: "p",
          text: `Para cualquier pregunta sobre este aviso legal, escríbenos a ${COMPANY.email}. Última revisión: ${LEGAL_UPDATED}.`,
        },
        {
          kind: "p",
          text: "La versión en español de este documento es la vinculante; las versiones en otros idiomas se ofrecen únicamente como ayuda para su comprensión.",
        },
      ],
    },
  ],
};
