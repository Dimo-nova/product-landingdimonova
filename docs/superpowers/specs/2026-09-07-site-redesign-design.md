# Rediseño web Dimonova — spec de diseño

Fecha: 2026-09-07
Estado: aprobado en conversación, pendiente de revisión escrita
Alcance de este spec: sistema visual, header, footer, home, modales, banner de idioma, 404.
Fuera de alcance (specs posteriores): páginas interiores (features, pricing, cases, about, contact), proxy `/admin`.

Inspiración: [pos.toasttab.com](https://pos.toasttab.com/) (estructura, tono, hero, tarjetas, mega-menú, sección IA, comparativa con IA) y [last.app](https://www.last.app/) (showcase de cliente con móvil y píldoras flotantes, animaciones de scroll). Footer: [wealthsimple.com](https://www.wealthsimple.com/en-ca) (wordmark gigante al final).

---

## 1. Objetivo y mensaje

La web actual vende features. La nueva vende una **promesa de servicio**: llave en mano, para restaurantes que quieren escalar, buena imagen ante el cliente, y personas de confianza ("frikis") que lo gestionan 24/7.

Titular hero (ES / EN):

> **Nosotros nos ocupamos. Tú creces.**
> Carta digital, comandero y reseñas a medida de tu restaurante, montados y cuidados 24/7 por un equipo de frikis de confianza. Sin plantillas. Listo para escalar.

> **We take care of it. You grow.**
> Digital menu, ordering and reviews made to measure, built and looked after 24/7 by a team of geeks you can trust. No templates. Ready to scale.

Tono (Toast): frases cortas, verbos, confianza sin adjetivos huecos, humor seco puntual. Nunca "solución", "innovador", "revolucionario".

---

## 2. Decisiones técnicas

| Tema | Decisión |
|---|---|
| Estilos | **CSS Modules + custom properties** (tokens en `app/globals.css`). La regla "inline styles copiados de `archive/`" queda **obsoleta** para todo lo nuevo. `lib/style.ts` y `components/Hover.tsx` se mantienen solo para las páginas interiores hasta la fase de interiores; después se borran. |
| Animación | `motion` (Framer Motion) en islas cliente. `MotionConfig reducedMotion="user"` en el layout. Secciones = server components que envuelven islas `'use client'`. |
| Fuentes | `next/font/google`: **Bricolage Grotesque** (titulares, 600-800) + **Instrument Sans** (cuerpo, 400-600). Exportadas desde `lib/fonts.ts`, variables `--font-display` / `--font-body`. |
| i18n | Se mantiene `next-intl`, 5 locales, default `en` en `/`, `localePrefix: "as-needed"`. Copy nuevo en **EN y ES**; `de`, `fr`, `pt` copian EN (como hoy). |
| Detección idioma | Ya la hace el middleware de `next-intl` (`Accept-Language` → redirect + cookie `NEXT_LOCALE`). Se añade un **banner** no bloqueante para el caso de enlace compartido en otro idioma (§8). |
| Formulario demo | Reutiliza `POST /api/contact` (Notion + Resend). Se añaden campos `locations` y `menuToday`. |
| Reseñas Google | Estáticas en `data/reviews.json`. Sin Places API. |
| Vídeos | Bucket público de Supabase (mismo patrón que tutoriales de `panel-admin`). H.264 1080p + poster JPG. `<video>` se monta solo al abrir. |
| Comparativa IA | Deep-links con prompt en URL (como Toast). Sin backend. |
| SSG | Todas las rutas siguen siendo estáticas. Nada de lo nuevo requiere runtime salvo `/api/contact` (ya existe). |

Dependencias nuevas: `motion`. Nada más.

---

## 3. Sistema visual

### 3.1 Tokens (`app/globals.css`)

```css
:root {
  --brand: #FE5243;        /* coral del logo: CTAs, anotación, acentos */
  --brand-deep: #C93A2B;   /* fondo inferior de tarjetas (degradado coral→deep) */
  --brand-soft: #FFE9E5;   /* fondos de píldora, hover suave */
  --ink: #0F0E0D;          /* texto, hero, footer, sección IA */
  --ink-2: #4A4744;        /* texto secundario */
  --paper: #FFFFFF;
  --cream: #FAF7F2;        /* secciones alternas, inputs */
  --mist: #EDEAE4;         /* bordes, tarjetas neutras */
  --ok: #1DB36B;

  --font-display: var(--font-bricolage);
  --font-body: var(--font-instrument);

  --text-h1: clamp(44px, 7vw, 88px);
  --text-h2: clamp(32px, 4.5vw, 56px);
  --text-h3: clamp(22px, 2.2vw, 28px);
  --text-lead: clamp(17px, 1.4vw, 20px);

  --radius-card: 28px;
  --radius-panel: 32px;
  --radius-pill: 999px;

  --container: 1280px;
  --gutter: clamp(16px, 4vw, 48px);

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur: 0.6s;
}
```

Sombras solo en hover: `0 20px 40px -20px rgba(15,14,13,.35)`.

### 3.2 Movimiento (`lib/motion.ts`)

| Variant | Valor |
|---|---|
| `reveal` | `opacity 0→1`, `y 24→0`, `0.6s`, `--ease-out`, `viewport: { once: true, margin: "-10%" }` |
| `stagger` | `staggerChildren: 0.08` |
| `lift` | hover `y: -4`, sombra; tap `scale: 0.98` |
| `bob` | `y: [0,-6,0]`, `4-6s` loop, `easeInOut`, delay aleatorio por píldora |
| `draw` | SVG `pathLength 0→1`, `0.8s`, delay `0.4s` |

`prefers-reduced-motion`: `MotionConfig reducedMotion="user"` → transiciones instantáneas, marquees parados, Ken Burns desactivado.

### 3.3 Componentes UI (`components/ui/`)

`Container`, `Button` (variants `solid` coral / `outline` / `ghost`, sizes `md` / `lg`, `as` link o button), `Pill`, `Reveal` (wrapper `motion.div` con `reveal`), `Marquee` (duplica hijos, `animation: scroll linear infinite`, pausa en hover, dirección prop), `Modal` (shell compartido: overlay, `AnimatePresence`, focus trap, Esc, scroll-lock, `role="dialog"` + `aria-labelledby`), `DeviceFrame` (`phone` / `tablet`, envuelve una `<img>`).

---

## 4. Header y mega-menú

Barra blanca sticky, esquinas inferiores redondeadas (`0 0 24px 24px`). Altura 72px → 56px al hacer scroll > 24px, con sombra suave. Logo izquierda.

Navegación centro:

| Item | Comportamiento |
|---|---|
| Productos ▾ | Mega-panel: grid 4×2 con los 8 servicios (icono, título, una línea). Link a `/features#<slug>`. |
| Precios | Link directo `/pricing` |
| Clientes ▾ | Mega-panel: Bálamo destacado (captura + frase + "Ver caso") a la izquierda, lista de casos + "Reseñas en vídeo" (ancla `/#reviews`) a la derecha |
| Recursos ▾ | 4 links: Tutoriales (`/features#training`), FAQ (`/pricing#faq`), Compara con IA (`/#ai-compare`), Contacto (`/contact`) |
| Nosotros | Link directo `/about` |

Derecha: selector idioma (existente, restilado) · "Acceso clientes" (outline → `https://menuadmin.dimonova.com`, `target=_blank`) · "Pedir demo" (solid, dispara `demo:open`).

Mega-panel: ancho completo bajo la barra, fondo blanco, radio inferior 24px, sombra. Abre por hover con delay 120ms (evita parpadeo al cruzar), cierra 200ms tras salir del item + panel. `AnimatePresence`: `opacity 0→1`, `y -8→0`, `0.2s`. Solo un panel abierto a la vez; cambiar de item hace crossfade.

Teclado: los items con panel son `<button aria-expanded aria-controls>`. Enter/Space abre, Esc cierra y devuelve foco, Tab recorre el panel. Sin focus trap (es menú).

Móvil (< 960px): hamburguesa → panel a pantalla completa con acordeones por sección, CTAs abajo. Se reutiliza la lógica de `MobileNav.tsx` con el nuevo estilo.

Fuente única de datos: `lib/services.ts` exporta `SERVICES: { slug, icon, titleKey, lineKey, image }[]`. La usan tarjetas, mega-menú y footer.

---

## 5. Home

Orden de secciones y anclas:

1. `Hero`
2. `LogoStrip`
3. `ServiceCards` (`#services`)
4. `AiPanel` (`#ai`)
5. `BalamoShowcase` (`#balamo`)
6. `DifferentiatorBand`
7. `Reviews` (`#reviews`)
8. `AiCompare` (`#ai-compare`)
9. `FinalCta`
10. `Footer`

### 5.1 Hero

Tarjeta `--ink` inset 16px del viewport (8px en móvil), radio 32px, min-height `88vh` (auto en móvil). Contenido a la izquierda, máx 620px:

1. Píldora con icono play: "Cómo empezó Dimonova" → abre `VideoModal` con el vídeo del primer cliente (el mismo que irá en Nosotros).
2. `h1` titular. La palabra **"creces"** (EN: **"grow"**) lleva una anotación SVG coral dibujada a mano (elipse abierta, trazo 6px) que se dibuja con `draw` al cargar.
3. Subtítulo (`--text-lead`, color `rgba(255,255,255,.8)`).
4. `EmailCta`: píldora blanca con `<input type=email>` + botón coral "Pedir demo". Submit: valida email (misma regex de `archive/app.js`), dispara `demo:open` con `{ email }`. Enter envía.
5. Legal 12px: "Solo usamos tu email para contactarte. [Privacidad]".
6. Link: "¿Ya eres cliente? Acceder al panel →".

**Variantes de fondo** (para comparar; se elige una y se borra la otra):

- **B — foto** (`HeroBgPhoto`): imagen stock de sala o cocina, `object-fit: cover`, anclada a la derecha, degradado `--ink` 100% → 0% de izquierda a derecha (hasta ~60% del ancho) y de abajo arriba leve. Ken Burns `scale 1→1.06` en 20s alterno. Placeholder: `public/assets/hero/hero-stock.jpg` (se descarga una de Unsplash/Pexels con licencia libre; se anota fuente en `public/assets/hero/SOURCES.md`).
- **C — mock** (`HeroBgMock`): sin foto. A la derecha, `DeviceFrame phone` con captura real de una carta (por defecto Bálamo), rotación 3D suave que sigue el ratón (`rotateX/rotateY ±6°`, spring), detrás una tarjeta flotante del panel donde el asistente aplica "Sube un 5 % los vinos" con ticks apareciendo en cascada (loop cada 8s). Dos anillos concéntricos coral al 12% de opacidad. En móvil: sin parallax, mock estático debajo del texto.

Selección: `?hero=c` en la URL renderiza C; por defecto B. Se lee en un client component (`useSearchParams`) para no romper SSG. Cuando se elija, se elimina el parámetro y el componente descartado.

### 5.2 LogoStrip

Texto pequeño "Confían en nosotros" + `Marquee` con logos de `public/assets/Logos/` (Bálamo, La Pulpería, Calçot) y huecos placeholder hasta 8. Logos en `grayscale` + `opacity .6`, a color en hover. Altura 96px, fondo blanco.

### 5.3 ServiceCards

Titular `h2`: "Todo lo que necesita tu restaurante. Y alguien que lo gestione." / "Everything your restaurant needs. And someone to run it."

Grid 4 columnas × 2 filas (2 columnas en tablet, carrusel horizontal con scroll-snap en móvil). Tarjeta: `aspect-ratio 3/4` aprox, radio 28px, fondo degradado `--brand` → `--brand-deep` de arriba abajo, imagen ocupa el 70% superior (mock de dispositivo o ilustración), título `h3` blanco + línea 15px blanca al 85% abajo. Hover: `lift` + imagen `scale 1.04`. Reveal con `stagger`. Toda la tarjeta es un `<a href="/features#slug">`.

| slug | Título ES | Línea ES | Título EN | Línea EN |
|---|---|---|---|---|
| `menu` | Carta digital | En tu web, con tu estética, al píxel. | Digital menu | On your site, in your style, to the pixel. |
| `ai` | Panel + IA | Cambia toda la carta en una frase. | Dashboard + AI | Change the whole menu in one sentence. |
| `ordering` | Comandero | Integrado con tu TPV, impresoras y pago en mesa. | Ordering | Wired to your POS, printers and pay-at-table. |
| `training` | Formación y soporte | Ilimitado. Con vídeos de todo el panel. | Training & support | Unlimited. With videos of the whole dashboard. |
| `multi` | Multirestaurante | Un panel. Todos tus locales. | Multi-venue | One dashboard. All your venues. |
| `reviews` | Reseñas inteligentes | Las buenas a Google. Las malas, a ti primero. | Smart reviews | Good ones go to Google. Bad ones come to you first. |
| `daily` | Menú del día | Cámbialo cada mañana desde el móvil. | Daily menu | Change it every morning from your phone. |
| `translate` | Traducciones con IA | Toda la carta, todos los idiomas, un clic. | AI translations | Whole menu, every language, one click. |

Imágenes: capturas reales de `panel-admin` y de las cartas en `cartas/`, recortadas dentro de `DeviceFrame`. Donde no exista captura, ilustración generada. Hasta entonces, placeholder rayado (patrón actual `repeating-linear-gradient`).

### 5.4 AiPanel (Toast IQ)

Fondo `--ink`, texto claro, radio 32px inset como el hero. Dos columnas.

Izquierda: eyebrow "Panel + IA" · `h2` "Dile a la carta lo que quieres. Ya está." / "Tell the menu what you want. Done." · párrafo: tus empleados hacen cambios en bloque en segundos, tú revisas y aplicas, nada se escribe sin tu OK · 3 pasos numerados: **Escribe** · **Revisa el cambio** · **Aplica** · botón "Ver cómo funciona" → `/features#ai`.

Derecha: `AiDemo` (cliente). Mock de chat con tabs arriba (Cambios en bloque · Traducciones · Descripciones). Bucle automático por tab, 8s cada uno, pausa al hover:

1. El prompt se tipea carácter a carácter (40ms/char): "Sube un 5 % todos los vinos" / "Traduce la carta al alemán" / "Escribe la descripción del pulpo a la brasa".
2. Aparece tarjeta "Cambios propuestos" con 4-6 filas (antes → después) y checkboxes que se marcan en cascada (120ms).
3. Botón "Aplicar seleccionados" pulsa solo → toast "12 platos actualizados ✓".

Contenido de las filas en `messages/*.json` bajo `home.ai.demo.*`. Sin llamadas reales.

### 5.5 BalamoShowcase (Last.app)

Fondo `--cream`. Dos columnas.

Izquierda: `DeviceFrame phone` con captura real de `https://carta.balamorestaurante.es` (se toma con Playwright a 390×844 y se guarda en `public/assets/cases/balamo-phone.png`). Detrás, dos anillos concéntricos coral (`border 1px`, opacidad .25 y .12) con rotación lentísima. Alrededor, 5 píldoras blancas con sombra y `bob`, posiciones absolutas fijas (en móvil se apilan bajo el teléfono en fila con wrap):

Reseñas · Tablets VIP · Vinos de la semana · Integración bodega · Soporte ilimitado

Derecha: eyebrow "Caso: Bálamo Restaurante" · `h2` "Bálamo no quería una carta. Quería la suya." / "Bálamo didn't want a menu. They wanted theirs." · párrafo (carta en su web y en las tablets de la zona VIP, promoción semanal de vinos, reseñas filtradas, integración con su software de bodega, soporte sin límite) · link "Ver el caso →" (`/cases`) · separador · 3 cifras grandes con etiqueta. **Placeholder** hasta recibir datos reales: "—" con etiquetas "platos gestionados", "idiomas", "tiempo medio de cambio".

Logo Bálamo (`public/assets/Logos/balamo.svg`) pequeño junto al eyebrow.

### 5.6 DifferentiatorBand (Toast mid-shift)

Fondo blanco. `h2` centrado "Lo que nadie más hace." / "What nobody else does." + subtítulo una línea. Debajo, dos `Marquee` en direcciones opuestas con píldoras grandes (48px alto, borde `--mist`):

Personalización al píxel · Eventos y promociones · Soporte sin límite de consultas · Formación en tu local · Integración con tu software · Multirestaurante · Sin plantillas · Cambios el mismo día · Tablets, QR o web · Alguien al otro lado, siempre

Hover en píldora: el marquee se pausa, la píldora se expande (`layout` animation) mostrando una frase de 1 línea debajo del título. Textos en `home.diff.items[]` `{ title, body }`.

### 5.7 Reviews

`h2` "Lo dicen ellos." / "Their words, not ours." + badge "★ 4.9 en Google" (cifra de `data/reviews.json`, placeholder hasta dato real).

Carrusel horizontal arrastrable (`motion` `drag="x"` con constraints) + flechas + dots. Tarjetas:

- **Vídeo** (2): 9:16, radio 28px, poster con degradado y botón play grande, nombre + restaurante abajo. Click → `VideoModal`. `<video>` nunca se monta en la tarjeta.
- **Google** (4-6): fondo `--cream`, avatar inicial en círculo coral, nombre, 5 estrellas, texto (máx 4 líneas + "más" expande), logo Google pequeño + "Ver en Google" (link a la reseña o al perfil).

Orden: vídeo, google, google, vídeo, google, google, google.

`data/reviews.json`:

```json
{
  "rating": null,
  "profileUrl": "",
  "videos": [{ "id": "balamo", "name": "", "venue": "", "src": "", "poster": "" }],
  "google": [{ "name": "", "text": "", "url": "", "date": "" }]
}
```

Vacíos hasta contenido real; el componente renderiza placeholders si `videos`/`google` están vacíos.

### 5.8 AiCompare

Fondo `--brand` a sangre, texto blanco centrado, padding vertical grande.

`h2` "Pregúntale a quien no trabaja aquí." / "Ask someone who doesn't work here." · línea: "Abre la pregunta en tu IA favorita. Nosotros no tocamos la respuesta." · fila de 4 iconos redondeados (ChatGPT · Claude · Perplexity · Google AI) con hover lift · botón outline blanco "Copiar pregunta" (clipboard + tick 2s).

`lib/aiPrompt.ts`:

```ts
export const providers = {
  chatgpt:    (q) => `https://chat.openai.com/?q=${enc(q)}`,
  claude:     (q) => `https://claude.ai/new?q=${enc(q)}`,
  perplexity: (q) => `https://www.perplexity.ai/search/new?q=${enc(q)}`,
  google:     (q) => `https://www.google.com/search?udm=50&q=${enc(q)}`,
};
```

Prompt (clave `home.aiCompare.prompt`, ES y EN; el ES se usa en `/es`, el EN en el resto):

> Tengo un restaurante con [N] mesas y estoy valorando contratar Dimonova (dimonova.com). Es un servicio llave en mano: ellos montan la carta digital dentro de mi web con mi estética exacta (no plantillas), la mantienen, forman a mi equipo con vídeos y en persona, y el soporte es ilimitado sin contar consultas. Incluye panel con asistente de IA para cambios en bloque y traducciones, comandero integrado con mi TPV e impresoras con pago en mesa, sistema de reseñas que envía las buenas a Google y las malas a mí primero, menú del día, promociones y eventos, y gestión multirestaurante desde un panel. Compáralo con un generador de cartas QR self-service con plantillas. Dime con honestidad para qué tipo de restaurante compensa la inversión en un servicio gestionado como este y para cuál no, y qué preguntas debería hacerles antes de contratar.

Links `target="_blank" rel="noopener noreferrer"`.

### 5.9 FinalCta

Fondo `--cream`. `h2` grande repite el titular del hero. `EmailCta` (mismo componente) + debajo "o escríbenos por WhatsApp" con el número del locale (`CONTACT.whatsappES` en `es`, `whatsappIE` en el resto, lógica ya existente).

---

## 6. Footer (Wealthsimple)

Fondo `--ink`, texto `rgba(255,255,255,.7)`, links blancos en hover.

Fila superior, 5 columnas (2 en móvil):

| Producto | Empresa | Recursos | Legal | Contacto |
|---|---|---|---|---|
| los 8 servicios (`SERVICES`) | Nosotros · Clientes · Precios · Contacto | Tutoriales · FAQ · Compara con IA · Acceso clientes | Privacidad · Cookies · Términos (`/legal/*`, páginas placeholder hasta tener textos; ya está en TODO) | email · WhatsApp ES · WhatsApp IE · selector idioma |

Línea 1px `rgba(255,255,255,.12)`. Debajo, copyright y "Hecho en Dublín y Madrid" (texto pequeño).

Al final: wordmark **DIMONOVA** como SVG (`public/assets/wordmark.svg`, se genera a partir del logo horizontal) a `width: 100%`, ~18vw de alto, `margin-bottom: -4%` para que el borde inferior lo recorte, color `rgba(255,255,255,.95)`. `Reveal` sube 24px al entrar.

---

## 7. Modales

`components/ui/Modal.tsx` es el shell. Dos consumidores, ambos montados una vez en `app/[locale]/layout.tsx` y abiertos por eventos de `window`:

| Evento | Payload | Abre |
|---|---|---|
| `demo:open` | `{ email?: string; source?: string }` | `DemoModal` |
| `video:open` | `{ src: string; poster?: string; title: string }` | `VideoModal` |

Helper `lib/events.ts`: `openDemo(payload)`, `openVideo(payload)` (tipados, `window.dispatchEvent(new CustomEvent(...))`).

### 7.1 DemoModal

Tarjeta blanca 560px, radio 32px, título "Pide tu demo" / "Book your demo", subtítulo "Te escribimos hoy y la hacemos cuando te venga bien."

Campos (todos con label visible):

| name | tipo | obligatorio |
|---|---|---|
| `name` | text | sí |
| `email` | email | sí, prerrellenado si viene en el evento; entonces el foco inicial va a `name` |
| `venue` | text (nombre del restaurante) | sí |
| `phone` | tel | no |
| `locations` | radio pills: `1` · `2-5` · `6+` | sí, default `1` |
| `menuToday` | radio pills: `pdf` · `web` · `other-system` | no |
| `locale` | hidden | — |
| `source` | hidden (`hero` / `header` / `final-cta`) | — |

Envío: `fetch("/api/contact", { method: "POST", body: FormData })`. `vtype` se envía como `restaurant` (compatibilidad con el API actual). El API se amplía para leer `locations`, `menuToday` y `source` y volcarlos al mensaje de Notion y al email; sin cambios de esquema en Notion.

Estados: idle → sending (botón con spinner, campos disabled) → success (tick animado, "Hecho. Te escribimos hoy." + botón cerrar) → error ("No ha ido. Prueba otra vez o escríbenos por WhatsApp" + link WA + reintentar).

Validación cliente en blur y en submit; errores en línea bajo el campo; `aria-invalid` + `aria-describedby`.

### 7.2 VideoModal

Tarjeta negra, `max-width: min(90vw, 56.25vh × 16/9)` para horizontal o `min(90vw, 50vh × 9/16)` para vertical (prop `orientation`). `<video controls autoplay playsinline>` se monta al abrir y se desmonta al cerrar. Título en `aria-label`.

---

## 8. Banner de idioma

`components/layout/LocaleBanner.tsx` (cliente, montado en `[locale]/layout.tsx`).

Lógica en mount:

1. Si existe cookie `dim-lang-dismissed` → no renderiza.
2. `preferred = navigator.languages.map(l => l.slice(0,2)).find(l => routing.locales.includes(l))`.
3. Si `preferred` y `preferred !== locale actual` → muestra.

Barra fija arriba (bajo el header, empuja contenido, 44px), fondo `--brand-soft`, texto `--ink`: "¿Prefieres leerlo en español?" (texto en el **idioma preferido**, clave `banner.prompt` leída del bundle de ese locale mediante un mapa estático de 5 strings en `lib/bannerCopy.ts`, evita cargar otro bundle) · botón "Cambiar" · botón ✕ `aria-label`.

- Cambiar → `router.replace(pathname, { locale: preferred })` (wrapper de `lib/routing.ts`). El middleware fija la cookie `NEXT_LOCALE`.
- ✕ → cookie `dim-lang-dismissed=1; max-age=7776000; path=/`.

`role="status"`. Entra con `y -44→0`.

---

## 9. Página 404

`app/[locale]/not-found.tsx` + `app/[locale]/[...rest]/page.tsx` que llama `notFound()` (patrón de `next-intl` para que rutas desconocidas rendericen dentro del layout con locale y traducciones). Metadata: título "404 · Dimonova", `robots: noindex`.

Diseño: hereda header y footer. Sección centrada sobre `--cream`, min-height `70vh`:

- Número **404** enorme en `--font-display` con la anotación a mano coral tachándolo (mismo SVG del hero, variante "tachado").
- `h1`: "Este plato no está en la carta." / "This dish isn't on the menu."
- Párrafo: "Puede que lo hayamos cambiado de sitio, o que nunca existiera. Pasa esto." / "We may have moved it, or it never existed. Try one of these."
- Tres botones: "Volver al inicio" (solid) · "Ver productos" (outline → `/features`) · "Pedir demo" (ghost, `openDemo({ source: "404" })`).
- Debajo, en pequeño: "¿Buscabas tu carta? Las cartas viven en el dominio de cada restaurante, no aquí." (evita que clientes finales que teclean mal una URL de carta se pierdan).

Sin animaciones más allá del `reveal` y el `draw`.

---

## 10. Mensajes (`messages/*.json`)

Claves nuevas, agrupadas:

```
nav.*           items, mega-panels, CTAs
home.hero.*     title (con marcador de palabra anotada: "Nosotros nos ocupamos. Tú <mark>creces</mark>."), lead, emailPlaceholder, cta, legal, clientLink, playPill
home.logos.*
home.services.* title, lead
services.<slug>.{title,line}   (fuente para tarjetas, mega-menú, footer)
home.ai.*       title, lead, steps[], demo.{tabs[], prompts[], rows[][], toast}
home.balamo.*   eyebrow, title, body, cta, stats[]
home.diff.*     title, lead, items[]{title, body}
home.reviews.*  title, badge, more, less, viewOnGoogle
home.aiCompare.* title, lead, copy, copied, prompt
home.finalCta.* title, whatsapp
footer.*        columns, copyright, madeIn
modal.demo.*    title, lead, fields, errors, states
modal.video.*   close
banner.*        prompt (× 5 idiomas en lib/bannerCopy.ts), change, close
notFound.*      title, body, home, products, demo, menuHint
```

La palabra anotada del hero se marca con `<mark>` en el JSON y se renderiza con `t.rich("home.hero.title", { mark: (c) => <Annotated>{c}</Annotated> })`. No se usa `dangerouslySetInnerHTML` en nada nuevo.

`de`, `fr`, `pt`: copia literal de `en.json` para las claves nuevas (script `scripts/sync-messages.mjs` que añade a cada locale las claves que falten copiando de EN; se ejecuta a mano).

---

## 11. Estructura de archivos

```
app/
  globals.css                     tokens, reset, fuentes, utilidades
  [locale]/
    layout.tsx                    Header, Footer, LocaleBanner, DemoModal, VideoModal, WhatsAppWidget, MotionConfig
    page.tsx                      home: compone las secciones
    not-found.tsx
    [...rest]/page.tsx            notFound()
  api/contact/route.ts            + locations, menuToday, source
lib/
  fonts.ts                        next/font
  motion.ts                       variants
  services.ts                     SERVICES (slug, icon, image)
  aiPrompt.ts                     providers + buildUrl
  events.ts                       openDemo / openVideo
  bannerCopy.ts                   prompt del banner × 5
components/
  ui/       Container, Button, Pill, Reveal, Marquee, Modal, DeviceFrame, Annotated
  layout/   Header, MegaMenu, MobileNav, Footer, LocaleBanner
  home/     Hero, HeroBgPhoto, HeroBgMock, EmailCta, LogoStrip, ServiceCards, AiPanel, AiDemo,
            BalamoShowcase, DifferentiatorBand, Reviews, AiCompare, FinalCta
  DemoModal.tsx, VideoModal.tsx, WhatsAppWidget.tsx (restilado)
data/reviews.json
public/assets/
  hero/hero-stock.jpg + SOURCES.md
  cases/balamo-phone.png
  services/<slug>.png             (placeholders hasta capturas reales)
  ai/{chatgpt,claude,perplexity,google}.svg
  wordmark.svg
```

Cada componente lleva su `.module.css` al lado. Los `components/sections/*` y `Hover.tsx`/`style.ts` actuales se conservan **solo** para las páginas interiores hasta su rediseño; `Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `NavLink.tsx`, `OpenWAButton.tsx` viejos se borran cuando entren los nuevos.

`app/layout.tsx` raíz: solo añade las variables CSS de `next/font` al `<body>`. `MotionConfig` va en `[locale]/layout.tsx` dentro de un client wrapper.

---

## 12. Errores y resiliencia

| Caso | Comportamiento |
|---|---|
| Email inválido en `EmailCta` | Borde coral + mensaje bajo la píldora; no abre modal |
| `/api/contact` 4xx | Mensaje en línea con el error |
| `/api/contact` 5xx / red | Estado error del modal con WhatsApp de fallback |
| Imagen de servicio/caso ausente | `next/image` con `onError` → placeholder rayado |
| `reviews.json` vacío | Tarjetas placeholder con texto "Reseña pendiente" |
| Vídeo no carga | `<video onError>` → texto "No se puede reproducir ahora" + link directo |
| Clipboard API no disponible | Botón "Copiar" abre `<textarea readonly>` seleccionado |
| JS deshabilitado | Todo el contenido es SSR; mega-menú no abre (links directos siguen funcionando en el item padre → `/features`); modales no abren (el botón "Pedir demo" del header es un `<a href="/contact">` progresivo) |
| `prefers-reduced-motion` | `MotionConfig reducedMotion="user"` + `@media` en CSS para marquees y Ken Burns |

---

## 13. Accesibilidad

- Contraste: coral `#FE5243` sobre blanco **no** pasa AA para texto pequeño → coral solo en fondos con texto blanco (ratio 3.6, válido para texto ≥ 24px bold / UI) o en elementos decorativos. Texto pequeño sobre coral se evita; en `AiCompare` el texto va ≥ 18px semibold.
- Todos los iconos-botón con `aria-label`. Vídeos con `title`. Marquees `aria-hidden` en la copia duplicada.
- Foco visible: `outline: 3px solid var(--brand); outline-offset: 3px` global.
- `aria-current="page"` en el item activo del header.

---

## 14. SEO

- Metadata de home sin cambios de estructura (`pageMetadata`). Se reescriben `meta.title.home` y `meta.description.home` en EN/ES con el nuevo mensaje.
- `og:image` nueva (`public/og.png`, 1200×630, titular sobre `--ink` con anotación coral). Cierra el ítem de TODO.
- Fuentes self-hosted con `display: swap`. Imágenes con `next/image` y `sizes`. LCP objetivo: el `h1` del hero. La foto de la variante B lleva `priority` (preload) porque es above-the-fold; en móvil se sirve un recorte más pequeño vía `sizes`.

---

## 15. Testing (Playwright, `e2e/`)

Specs nuevos:

| Spec | Cubre |
|---|---|
| `header.spec.ts` | mega-menú abre por hover y por Enter, cierra con Esc, `aria-expanded`; compacta al scroll; móvil hamburguesa + acordeones |
| `hero.spec.ts` | email inválido muestra error; email válido abre `DemoModal` con el campo relleno y foco en `name`; píldora play abre `VideoModal`; `?hero=c` renderiza `HeroBgMock` |
| `demo-modal.spec.ts` | validación, envío con `/api/contact` interceptado (200 y 500), estados success/error, Esc cierra, focus vuelve al disparador |
| `locale-banner.spec.ts` | con `Accept-Language: es` en `/en` aparece; "Cambiar" navega a `/es`; ✕ fija cookie y no reaparece |
| `home-sections.spec.ts` | 8 tarjetas con links correctos; `AiDemo` cicla tabs; carrusel de reseñas navega con flechas; deep-links IA contienen el prompt codificado; botón copiar cambia a "Copiado" |
| `footer.spec.ts` | columnas, wordmark visible, links de servicios |
| `not-found.spec.ts` | `/en/esto-no-existe` y `/es/esto-no-existe` devuelven 404 con header/footer y textos del locale |

La suite existente de interiores se mantiene. Los tests de header/footer/WA antiguos se reescriben contra los componentes nuevos.

---

## 16. Fases de implementación

1. **Base**: `motion`, tokens, fuentes, `components/ui/*`, `lib/motion.ts`, `lib/events.ts`, `lib/services.ts`. Header + MegaMenu + MobileNav + Footer nuevos, `LocaleBanner`, `DemoModal`, `VideoModal`, API ampliada, 404. Interiores viejas heredan header/footer nuevos.
2. **Home**: las 9 secciones, ambas variantes de hero, `AiDemo`, `data/reviews.json` vacío con placeholders, `og.png`.
3. **Contenido**: foto stock, capturas de servicios y Bálamo, wordmark SVG, iconos IA, reseñas al JSON, vídeos al bucket, cifras. Elegir hero B o C y borrar la otra.
4. **Interiores** (spec aparte): features, pricing, cases, about (con vídeo del primer cliente en su hero), contact, legales. Borrar `style.ts`, `Hover.tsx`, `components/sections/*`.
5. **`/admin` proxy** (tarea aparte, ver conversación: `basePath` en panel-admin + rewrite con `basePath: false` para webhooks + rewrite en esta web).

Cada fase = un plan de implementación propio.

---

## 17. Pendiente de contenido (no bloquea el desarrollo)

- Cifra de confianza del hero (nº restaurantes / platos / pedidos).
- 3 cifras de Bálamo.
- Nota Google y URL del perfil; 4-6 reseñas copiadas.
- 2 vídeos de reseña + vídeo del primer cliente (subir al bucket, rellenar `reviews.json`).
- Logos de más clientes para la franja.
- Textos legales para `/legal/*`.
