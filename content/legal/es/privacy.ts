import { COMPANY, LEGAL_UPDATED } from "@/lib/config";
import type { LegalDoc } from "../types";

export const privacy: LegalDoc = {
  slug: "privacy",
  title: "Política de privacidad",
  description: "Cómo tratamos tus datos personales cuando visitas dimonova.com o nos escribes a través del formulario de demo o de contacto.",
  intro:
    "Esta política explica qué datos personales recogemos en dimonova.com, para qué los usamos, con quién los compartimos y qué derechos tienes. Está escrita en un lenguaje sencillo; si algo no queda claro, escríbenos.",
  sections: [
    {
      heading: "1. Quién es el responsable del tratamiento",
      blocks: [
        {
          kind: "p",
          text: `El responsable del tratamiento de tus datos es ${COMPANY.legalName} (${COMPANY.legalForm}), con NIF/CIF ${COMPANY.taxId} y domicilio en ${COMPANY.address}. Datos registrales: ${COMPANY.registry}. Puedes contactarnos en ${COMPANY.email}.`,
        },
        {
          kind: "p",
          text: "No hemos designado un delegado de protección de datos (DPO). El tratamiento que realizamos no alcanza los umbrales del artículo 37 del RGPD que obligarían a nombrar uno: no tratamos datos a gran escala ni categorías especiales de datos como actividad principal.",
        },
      ],
    },
    {
      heading: "2. Qué cubre esta política",
      blocks: [
        {
          kind: "p",
          text: "Esta política cubre únicamente este sitio web, dimonova.com. El panel de gestión de los clientes y las cartas de cada restaurante que publicamos son servicios distintos, regulados por el contrato que firma cada cliente.",
        },
        {
          kind: "p",
          text: "Respecto a los datos de los comensales de un restaurante cliente (por ejemplo, quien escanea una carta digital), Dimonova actúa como encargado del tratamiento por cuenta de ese cliente, en los términos de un contrato de encargo de tratamiento independiente de esta política.",
        },
      ],
    },
    {
      heading: "3. Qué datos recogemos",
      blocks: [
        {
          kind: "p",
          text: "Recogemos datos personales en tres situaciones distintas.",
        },
        {
          kind: "p",
          text: "Lo que nos envías a través del formulario de demo o del formulario de contacto:",
        },
        {
          kind: "list",
          items: [
            "Nombre",
            "Correo electrónico",
            "Nombre del restaurante, bar o cafetería",
            "Teléfono (opcional)",
            "Número de locales",
            "Cómo publicas tu carta hoy",
            "Un mensaje en texto libre (solo en el formulario de contacto)",
            "Un enlace a tu carta actual (opcional)",
            "Un archivo de carta que subas (opcional)",
            "El idioma en el que estás viendo el sitio",
            "El botón o enlace desde el que nos escribiste",
          ],
        },
        {
          kind: "p",
          text: "Un archivo de carta que subas puede contener, sin que lo busquemos, datos personales de terceros (por ejemplo, nombres de tu personal en un documento interno). Te pedimos que no incluyas en él datos que no sean necesarios para preparar tu propuesta.",
        },
        {
          kind: "p",
          text: "Lo que registra automáticamente nuestro proveedor de hosting, en los registros estándar del servidor, con fines de seguridad y disponibilidad: dirección IP, agente de usuario del navegador, URL solicitada y fecha y hora de la petición.",
        },
        {
          kind: "p",
          text: "Cookies: solo usamos las dos cookies funcionales descritas en nuestra política de cookies. No utilizamos cookies de analítica, publicidad, perfilado o redes sociales, y no cargamos scripts, fuentes ni imágenes desde dominios de terceros.",
        },
      ],
    },
    {
      heading: "4. Por qué usamos tus datos y con qué base legal",
      blocks: [
        {
          kind: "table",
          head: ["Finalidad", "Datos", "Base legal"],
          rows: [
            [
              "Responder a tu consulta y preparar una propuesta",
              "Datos del formulario",
              "Art. 6.1.b RGPD: medidas precontractuales a tu solicitud, antes de firmar un contrato.",
            ],
            [
              "Conservar un registro de la consulta para poder hacerle seguimiento",
              "Datos del formulario",
              "Art. 6.1.a RGPD: el consentimiento que nos das al marcar la casilla del formulario.",
            ],
            [
              "Mantener el sitio seguro, disponible y libre de abusos",
              "Registros del servidor",
              "Art. 6.1.f RGPD: nuestro interés legítimo.",
            ],
            [
              "Recordar el idioma que elegiste",
              "Cookies funcionales",
              "Art. 6.1.f RGPD, para prestar un servicio que has solicitado expresamente.",
            ],
          ],
        },
      ],
    },
    {
      heading: "5. Quién más ve tus datos",
      blocks: [
        {
          kind: "table",
          head: ["Proveedor", "Qué hace", "Dónde", "Garantía"],
          rows: [
            [
              "Vercel Inc.",
              "Aloja el sitio web y conserva los registros del servidor",
              "Estados Unidos / Unión Europea",
              "Contrato de encargo de tratamiento y cláusulas contractuales tipo de la UE",
            ],
            [
              "Plus Five Five, Inc. (Resend)",
              "Envía el correo de notificación que nos avisa de tu consulta",
              "Estados Unidos",
              "Contrato de encargo de tratamiento y cláusulas contractuales tipo de la UE",
            ],
            [
              "Notion Labs, Inc.",
              "Guarda el registro de la consulta en nuestra base de datos interna",
              "Estados Unidos",
              "Contrato de encargo de tratamiento y cláusulas contractuales tipo de la UE",
            ],
          ],
        },
        {
          kind: "p",
          text: "No vendemos datos personales, no hacemos publicidad y no compartimos tus datos con nadie más. Solo los comunicamos a las autoridades públicas cuando la ley nos obliga a ello.",
        },
      ],
    },
    {
      heading: "6. Transferencias fuera del Espacio Económico Europeo",
      blocks: [
        {
          kind: "p",
          text: "Los tres proveedores mencionados en la sección anterior tratan datos en Estados Unidos. Estas transferencias se amparan en las cláusulas contractuales tipo de la Comisión Europea y, cuando el proveedor está certificado, en el marco de protección de datos UE-EE. UU. (EU-US Data Privacy Framework). Puedes solicitar una copia de las garantías aplicadas escribiendo a " +
            COMPANY.email +
            ".",
        },
      ],
    },
    {
      heading: "7. Cuánto tiempo conservamos tus datos",
      blocks: [
        {
          kind: "table",
          head: ["Datos", "Conservación"],
          rows: [
            ["Consultas que no llegan a convertirse en contrato", "12 meses desde el último contacto; después se eliminan."],
            ["Consultas que sí llegan a convertirse en contrato", "Durante la vigencia del contrato y 6 años después, por obligaciones mercantiles y fiscales."],
            ["Archivos de carta subidos", "Se eliminan al cerrarse la propuesta y, en todo caso, en un plazo máximo de 12 meses."],
            ["Registros del servidor", "El periodo de conservación aplicado por nuestro proveedor de hosting."],
          ],
        },
      ],
    },
    {
      heading: "8. Tus derechos",
      blocks: [
        {
          kind: "p",
          text: "Tienes derecho a acceder a tus datos, rectificarlos, solicitar su supresión, pedir la limitación de su tratamiento, la portabilidad de los datos, oponerte al tratamiento y retirar tu consentimiento en cualquier momento, sin que ello afecte a la licitud del tratamiento previo basado en el consentimiento.",
        },
        {
          kind: "p",
          text: `Puedes ejercer estos derechos escribiendo a ${COMPANY.email} desde la dirección que usaste para contactarnos, indicando qué derecho quieres ejercer. Te responderemos en el plazo máximo de un mes.`,
        },
        {
          kind: "p",
          text: "También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD), en https://www.aepd.es, o ante la autoridad de control del país donde vives o trabajas.",
        },
      ],
    },
    {
      heading: "9. Decisiones automatizadas",
      blocks: [
        {
          kind: "p",
          text: "No tomamos decisiones automatizadas ni elaboramos perfiles con los datos que recogemos a través de este sitio.",
        },
      ],
    },
    {
      heading: "10. Menores de edad",
      blocks: [
        {
          kind: "p",
          text: "Este servicio se vende a negocios y no está dirigido a menores de 18 años. No recogemos conscientemente datos de menores.",
        },
      ],
    },
    {
      heading: "11. Cambios, última actualización y contacto",
      blocks: [
        {
          kind: "p",
          text: "Si cambiamos esta política, publicaremos la nueva versión en esta misma página con la fecha de actualización. Si el cambio es significativo, intentaremos avisarte por los medios de contacto disponibles.",
        },
        {
          kind: "p",
          text: `Última revisión: ${LEGAL_UPDATED}. Para cualquier pregunta sobre esta política, escríbenos a ${COMPANY.email}.`,
        },
        {
          kind: "p",
          text: "La versión en español de este documento es la vinculante; las versiones en otros idiomas se ofrecen únicamente como ayuda para su comprensión.",
        },
      ],
    },
  ],
};
