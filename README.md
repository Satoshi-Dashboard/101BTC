# 101 BTC — Landing "Bitcoin explicado para humanos"

Landing page de una sola página para el curso **101 BTC**. Construida con **Astro 5** + **Tailwind CSS 3**, tema oscuro, mobile-first, con scroll-reveal accesible y respeto a `prefers-reduced-motion`. Diseño extraído de Figma (ancho de diseño 1440px, fondo `#111`).

## Requisitos

- **Node.js 18+** (recomendado 18 LTS o superior)
- npm (incluido con Node)

## Puesta en marcha

```bash
npm install       # instala dependencias
npm run dev       # servidor de desarrollo (http://localhost:4321)
npm run build     # build de producción -> ./dist
npm run preview   # sirve el build de ./dist para verificación local
```

## Estructura de carpetas

```
.
├── astro.config.mjs        # config Astro + integración Tailwind
├── tailwind.config.mjs     # tokens de diseño (colores, fuentes, radios, breakpoints)
├── tsconfig.json
├── package.json
├── public/
│   └── img/                # assets raster (hero-bg, coin, instructor, mountain)
└── src/
    ├── pages/
    │   └── index.astro     # página raíz: ensambla secciones + JSON-LD FAQPage
    ├── layouts/
    │   └── Base.astro      # <html>/<head> (SEO, OG, Twitter, JSON-LD), carga reveal.ts
    ├── components/
    │   ├── Nav.astro       # pill flotante sticky + menú móvil hamburguesa
    │   ├── Hero.astro      # #inicio
    │   ├── Stats.astro     # franja de 4 métricas
    │   ├── Problema.astro  # #problema
    │   ├── Temario.astro   # #temario (Accordion single-open)
    │   ├── Instructor.astro# #instructor
    │   ├── Precio.astro    # #precio (3 planes)
    │   ├── Faq.astro       # #faq (Accordion single-open) — exporta FAQ para el JSON-LD
    │   ├── Footer.astro    # footer con navegación, legal, redes
    │   ├── Accordion.astro # primitivo acordeón accesible (aria-expanded/controls)
    │   ├── Button.astro    # primitivo botón/enlace
    │   ├── Section.astro   # wrapper de sección con max-width 1440
    │   └── Reveal.astro    # wrapper scroll-reveal (data-reveal-delay)
    ├── lib/
    │   └── reveal.ts       # IntersectionObserver -> .is-visible
    └── styles/
        └── global.css      # @fontsource, tokens en :root, reset, scroll-behavior smooth
```

### Orden de secciones (index.astro)

`Nav → Hero → Stats → Problema → Temario → Instructor → Precio → Faq → Footer`

Anclas de navegación: `#inicio`, `#problema`, `#temario`, `#instructor`, `#precio`, `#faq`.
`scroll-behavior: smooth` está definido en `src/styles/global.css` (`html`), desactivado bajo `prefers-reduced-motion`.

### JSON-LD FAQPage

`Faq.astro` **exporta** su array `FAQ`. `index.astro` lo importa, construye el objeto `FAQPage` (schema.org) y lo pasa a `Base.astro`, que lo inyecta **una sola vez** en el `<head>` como `application/ld+json`. Faq.astro ya **no** emite su propio bloque JSON-LD (evita duplicación).

---

## Decisiones (diseño no explícito)

Aspectos que el spec de Figma no definía explícitamente y se resolvieron por convención:

- **Breakpoints inventados**: Tailwind se configuró con `sm 480 / md 768 / lg 1024 / xl 1440 / 2xl 1920` (según spec). Los cambios de layout intermedios (cuándo apilan las columnas 2-col, cuándo el Nav pasa a hamburguesa en `lg`, la rejilla de Stats 1→2→4) se eligieron dentro de esos breakpoints para garantizar ausencia de scroll horizontal de 320px a 2560px y áreas táctiles ≥44px en móvil.
- **FAQ (sección nueva, no existía en Figma)**: acordeón **single-open** reutilizando `Accordion.astro`, mismo patrón visual que el Temario (fila + chevron naranja que rota 180°). Se usan **7 preguntas placeholder** con respuestas marcadas `[REEMPLAZAR]`. Encabezado propio (eyebrow naranja "Preguntas frecuentes" + título + subtítulo) y bloque CTA final "¿No encontraste tu respuesta?" con botón "Escríbenos".
- **Footer (columnas inventadas)**: el spec pedía columnas agrupadas sin listar todos los enlaces. Se definieron 3 grupos — **Curso** (Temario, Precio, Instructor), **Recursos** (Problema, Preguntas, Blog) y **Legal** (Términos, Privacidad, Aviso legal) — más marca, redes (X, YouTube, Telegram, Instagram) y fila inferior con año dinámico (`new Date().getFullYear()`).
- **Stats labels**: los textos de las 4 métricas provienen del spec (`500+` Total de alumnos, `10` Modulos, `34` Clases, `0%` Conocimiento previo requerido). "Modulos" se mantiene tal cual el spec (sin tilde).

---

## Pendientes / [REEMPLAZAR]

Contenido y enlaces placeholder que deben sustituirse antes de producción:

**Respuestas FAQ** (`src/components/Faq.astro`) — las 7 respuestas son placeholder `[REEMPLAZAR: respuesta ...]`:
1. ¿Necesito conocimientos técnicos previos?
2. ¿Cuánto dura el acceso al curso?
3. ¿Cómo recibo el material?
4. ¿Hay garantía de devolución?
5. ¿Puedo pagar en cuotas?
6. ¿El curso está actualizado?
7. ¿Ofrecen soporte o comunidad?

**Temario** (`src/components/Temario.astro`) — 9 de los 10 módulos usan cuerpo placeholder `[REEMPLAZAR: descripción de clases]` (solo el módulo 2 "Historia del dinero fiduciario" trae contenido real del spec).

**Contacto / mailto** (`src/components/Faq.astro`) — botón "Escríbenos" apunta a `[REEMPLAZAR: mailto:contacto@101btc.com]`.

**URLs de redes sociales** (`src/components/Footer.astro`) — X (Twitter), YouTube, Telegram e Instagram apuntan a `#` `[REEMPLAZAR]`.

**Legal y enlaces del Footer** (`src/components/Footer.astro`):
- Términos, Privacidad, Aviso legal → `#` `[REEMPLAZAR]`
- Blog → `#` `[REEMPLAZAR blog]`
- Tagline de marca → `[REEMPLAZAR tagline]`
- Copyright → `[REEMPLAZAR]` en la fila inferior

**CTA de precios** (`src/components/Precio.astro`) — los 3 botones "Quiero mi acceso" ya no navegan: abren el modal de leads (ver más abajo). El `href="#precio"` queda como fallback sin JS.

---

## Sistema de captura de leads

Todo CTA abre un modal de registro, guarda el lead en Supabase y redirige a WhatsApp
con un mensaje distinto según el botón pulsado.

### Archivos

| Ruta | Qué hace |
|---|---|
| `supabase/migrations/0001_sistema_leads.sql` | Tablas `leads` y `lead_interactions`, RLS y la RPC `registrar_lead`. Pegable en el SQL Editor. |
| `src/lib/leads/config.ts` | Credenciales desde `.env`, lista de países con prefijo, mensajes por CTA y copy del modal. |
| `src/lib/leads/supabase.ts` | Cliente. Si faltan credenciales devuelve `null` y el flujo cae al respaldo local. |
| `src/lib/leads/validacion.ts` | Validación de nombre, país, teléfono y correo (incluye dominios desechables). |
| `src/lib/leads/registro.ts` | Llama a la RPC, respalda en localStorage y construye la URL de WhatsApp. |
| `src/lib/leads/almacenamiento.ts` | Claves `lead_email`, `lead_perfil` y `leads_backup`. |
| `src/lib/leads/exportar.ts` | `window.exportarLeads()` — descarga el respaldo local en CSV. |
| `src/lib/leads/controlador.ts` | Intercepta los CTAs, gobierna el modal y el envío. |
| `src/components/LeadModal.astro` | Markup, estilos y animaciones del modal. |

### Mapa de CTAs

Un CTA se declara con `data-cta-id`; el mensaje sale de `MENSAJES_CTA` en `config.ts`.
Para añadir uno nuevo basta con el atributo (o el prop `ctaId` de `Button.astro`) y una
entrada en el mapa. Sin entrada cae en `cta_general`.

| Botón | `data-cta-id` | Dónde |
|---|---|---|
| Quiero aprender | `quiero_aprender` | `Hero.astro` |
| Empezar a entender | `empezar_entender` | `Problema.astro` |
| Quiero mi acceso (BÁSICO $47) | `plan_basico` | `Precio.astro` |
| Quiero mi acceso (COMPLETO $77) | `plan_completo` | `Precio.astro` |
| Quiero mi acceso (MENTOR 1 a 1 $500) | `plan_mentor` | `Precio.astro` |
| Escríbenos | `escribenos` | `Faq.astro` |
| — | `cta_general` | fallback |

Los enlaces del Nav y del Footer son navegación, no CTAs: siguen funcionando igual.

### Flujo

1. Click en un CTA → `preventDefault()` y se abre el modal con el `cta_origen`.
2. Si `lead_perfil` existe en localStorage se salta el formulario, se registra la
   interacción y se va directo a WhatsApp.
3. Envío → validación en el navegador → RPC `registrar_lead` → respaldo en
   localStorage → WhatsApp (`window.open`, con `location.href` de reserva).
4. Si Supabase falla, el lead queda en localStorage y el visitante llega a WhatsApp
   igual. Nunca se pierde un lead ni se bloquea la experiencia.

### Seguridad

La anon key solo puede `INSERT` y ejecutar la RPC: el RLS niega `SELECT`, `UPDATE` y
`DELETE`. `ultima_interaccion` y `total_interacciones` solo se tocan dentro de
`registrar_lead` (`SECURITY DEFINER`, `search_path` fijo), que además revalida todo en
el servidor. `SELECT` queda reservado a la `service_role` key, que nunca sale del
dashboard. La IP se lee de la cabecera `x-forwarded-for` en el servidor, no del
navegador. Leer `SECURITY.md` no es necesario: la anon key es pública por diseño y lo
que protege los datos es el RLS.

### Pendientes de este sistema

1. **`PUBLIC_SUPABASE_ANON_KEY` en `.env`** — copiar la publishable key del proyecto
   `uruedheuqpihdbemfgai` (Dashboard → Project Settings → API Keys).
2. **`PUBLIC_WHATSAPP_NUMERO` en `.env`** — código de país + número, solo dígitos.
   Sin él la URL de WhatsApp sale sin destinatario.
3. **Aplicar el SQL** — pegar `supabase/migrations/0001_sistema_leads.sql` en el SQL
   Editor del proyecto, o `supabase login && supabase db push`.

---

**Assets**: las 4 imágenes se descargaron correctamente a `public/img/` (`hero-bg.png`, `coin.png`, `instructor.png`, `mountain.png`). No quedan URLs remotas pendientes. URLs Figma de origen por si hiciera falta re-descargar:
- hero-bg.png → `https://www.figma.com/api/mcp/asset/f7b940af-f123-42a1-a744-4051dfc5aeec`
- coin.png → `https://www.figma.com/api/mcp/asset/328a7fc7-9b22-43b4-abbd-b43a9fba7e5b`
- instructor.png → `https://www.figma.com/api/mcp/asset/6b49c96f-b825-4c07-9697-cafcaac5fe9d`
- mountain.png → `https://www.figma.com/api/mcp/asset/cdaf4d31-0539-462d-988c-85ecac6e524a`
