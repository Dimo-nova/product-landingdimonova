import { COMPANY, LEGAL_UPDATED } from "@/lib/config";
import type { LegalDoc } from "../types";

export const cookies: LegalDoc = {
  slug: "cookies",
  title: "Política de cookies",
  description: "Las dos cookies que usa dimonova.com, para qué sirven y por qué no necesitas un banner de consentimiento para ellas.",
  intro:
    "Esta página explica qué cookies usa dimonova.com. Son solo dos, ambas propias y estrictamente necesarias para el funcionamiento del sitio.",
  sections: [
    {
      heading: "1. Qué es una cookie",
      blocks: [
        {
          kind: "p",
          text: "Una cookie es un pequeño archivo de texto que un sitio web guarda en tu navegador para recordar información entre visitas, como una preferencia de idioma.",
        },
      ],
    },
    {
      heading: "2. Las cookies que usa este sitio",
      blocks: [
        {
          kind: "table",
          head: ["Cookie", "Tipo", "Qué hace", "Duración"],
          rows: [
            [
              "NEXT_LOCALE",
              "Propia, técnica/preferencia",
              "Guarda el idioma que eliges con el selector de idiomas, para que el resto de páginas se muestren en ese idioma. Solo se crea si cambias el idioma a mano: si te limitas a navegar, no se instala",
              "De sesión: se borra al cerrar el navegador",
            ],
            [
              "dim-lang-dismissed",
              "Propia, técnica/preferencia",
              "Recuerda que cerraste el aviso que te ofrecía ver el sitio en el idioma de tu navegador, para no volver a mostrarlo",
              "90 días",
            ],
          ],
        },
        {
          kind: "p",
          text: "Estas son las únicas dos cookies que usamos. Ambas son propias (de dimonova.com) y ninguna se utiliza para identificarte ni para seguirte entre distintos sitios web.",
        },
      ],
    },
    {
      heading: "3. Lo que no usamos",
      blocks: [
        {
          kind: "p",
          text: "No usamos cookies de analítica, publicidad ni perfilado, ni cookies de redes sociales, ni píxeles o balizas de seguimiento. Tampoco cargamos fuentes, imágenes ni scripts desde dominios de terceros.",
        },
      ],
    },
    {
      heading: "4. Por qué no hay un banner de cookies",
      blocks: [
        {
          kind: "p",
          text: "Las dos cookies que usamos son estrictamente necesarias para prestar una función que has solicitado (ver el sitio en tu idioma), por lo que están exentas del deber de consentimiento previo que establecen el artículo 22.2 de la LSSI-CE y la normativa ePrivacy equivalente.",
        },
        {
          kind: "p",
          text: "Si en el futuro añadimos analítica o tecnologías de marketing, publicaremos un banner de consentimiento y te lo pediremos antes de activarlas.",
        },
      ],
    },
    {
      heading: "5. Cómo gestionar las cookies",
      blocks: [
        {
          kind: "p",
          text: "Puedes eliminar o bloquear las cookies desde la configuración de tu navegador. Bloquear estas dos únicamente hará que el sitio olvide el idioma que elegiste.",
        },
        {
          kind: "p",
          text: "Configuración de cookies de los navegadores más habituales: Google Chrome (https://support.google.com/chrome), Mozilla Firefox (https://support.mozilla.org), Safari (https://support.apple.com/safari) y Microsoft Edge (https://support.microsoft.com/microsoft-edge).",
        },
      ],
    },
    {
      heading: "6. Cambios, última actualización y contacto",
      blocks: [
        {
          kind: "p",
          text: "Si cambiamos las cookies que usamos, actualizaremos esta página.",
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
