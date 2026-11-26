# MI HIERRO · Constitución de Orquestación Autónoma

## Misión

Construir la Web App completa MI HIERRO (Next.js App Router + TypeScript estricto + Node.js) para diseñar hierros ganaderos, marcas personales de novilleros y emblemas de yeguadas PRE mediante IA ligera, motor SVG forjable y Stripe (0 €, 9,99 €, 19,90 € bajo pedido y solicitudes de forja física).

## Dirección Visual Obligatoria

Estética editorial taurina y de imprenta clásica —inspirada en programas de mano de la Maestranza, libros registro RUCTL/ANCCE, guarnicionería artesanal y sastrería taurina— sobre papel cal cálido `#F7F3EA` alternado con bandas solemnes en Negro Azabache `#161412`. Mobile-first (390×844). Geometría de imprenta (`rounded-[2px]` o `rounded-none`), doble filete `#D6C9B4`, acentos de divisa en Grana Burladero `#6B141E` y Oro Albero `#B8832E`. Prohibidos `rounded-2xl`/`rounded-3xl`, degradados artificiales y sombras pesadas.

| Token | Valor | Uso |
| --- | --- | --- |
| `--forge-paper` | `#F7F3EA` | Papel Cal · Fondo principal |
| `--forge-white` | `#FFFDF9` | Blanco Cal · Tarjetas y fichas |
| `--forge-stone` | `#EFE7D6` | Albero suave · Superficie secundaria |
| `--forge-border` | `#D6C9B4` | Piedra / Filete · Bordes finos y dobles filetes |
| `--forge-ink` | `#161412` | Negro Azabache · Tinta principal y bandas solemnes |
| `--forge-graphite` | `#4E473F` | Grafito Cálido · Tinta secundaria |
| `--forge-leather` | `#7D511E` | Bronce oscuro · Acento secundario (hover `#5E3C14`) |
| `--forge-gold` | `#B8832E` | Oro Albero · Filetes nobles y divisas |
| `--forge-grana` | `#6B141E` | Grana Burladero · Acento activo y divisas (hover `#530E16`) |

Titulares en serif editorial (Cinzel), interfaz en sans limpia (Inter), acentos en cursiva editorial (Cormorant Garamond). Fotografía real con corrección cromática uniforme (`.photo-editorial`). Textos concisos con vocabulario del sector (*Ficha de hierro*, *Avíos y trastos*, *Divisa*, *Lámina de prueba*): máximo 1 titular breve + 1-2 líneas de apoyo por sección.

## Reglas Técnicas Innegociables

1. Cero comentarios inline en archivos de código fuente y de tests.
2. En el plan gratuito (0 €) el SVG limpio y descargable NUNCA se envía en una respuesta HTTP ni queda inyectado en el DOM. Las vistas gratuitas se sirven rasterizadas con marca de agua vía `sharp` desde el servidor.
3. NUNCA incluir claves API reales ni secretos en prompts o archivos versionados. Solo `.env.example` y `process.env`.
4. El motor vectorial convierte iniciales con `opentype.js` (cero etiquetas `<text>` en el SVG maestro) y suelda piezas con `paper`.
5. Aviso legal siempre visible: MI HIERRO propone y orienta; no certifica disponibilidad ante RUCTL, OEPM, EUIPO ni OMPI (referencia RD 787/2023).
6. Estética editorial taurina clara obligatoria y diseño mobile-first (390x844).
7. Resiliencia local: si faltan `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL` o `DATABASE_URL`, se activan adaptadores de desarrollo seguros (fallback determinista, checkout simulado, correo registrado en `.data/mail.log`, rate limit en memoria y almacén de fichero local) sin romper ningún flujo.

## Stack

Next.js (App Router) · React · TypeScript estricto · Tailwind CSS · Framer Motion · Zod · Prisma · Lucide · Vitest · opentype.js · paper · sharp · jszip · Stripe · Resend · @google/genai · @upstash/redis.

## Propiedad Estricta de Directorios

| Propietario | Rutas |
| --- | --- |
| `forge-director` | `.agents/state/` |
| `forge-architect` | `prisma/`, `src/types/` |
| `forge-svg-engine` | `src/lib/ai/`, `src/lib/forge-engine/`, `src/lib/store/`, `src/app/api/generate/`, `src/app/api/preview/`, `src/app/api/story/` |
| `forge-ui-artisan` | `src/app/(app)/`, `src/components/`, `src/app/globals.css`, `src/app/layout.tsx` |
| `forge-payments-ops` | `src/lib/stripe/`, `src/lib/email/`, `src/lib/security/`, `src/app/api/checkout/`, `src/app/api/webhooks/`, `src/app/api/leads/`, `src/app/api/descarga/`, `src/app/descarga/` |
| `forge-seo-growth` | `src/app/(marketing)/`, `src/app/sitemap.ts`, `src/app/robots.ts` |
| `forge-qa-guard` | `tests/` |

## Protocolo de Coordinación y Autorreparación

- Todo trabajo se registra en `.agents/state/SPRINT_BOARD.md`.
- Todo especialista devuelve un bloque `HANDOFF_REPORT` al finalizar.
- Ningún sprint se cierra sin superar G1 (tsc + build), G2 (vitest), G3 (seguridad SVG y secretos), G4 (navegador real en 390x844 y 1440x900) y G5 (code review + commit limpio).
- Límite máximo: 3 reintentos automáticos por incidencia; al cuarto fallo, documentar en `.agents/state/BLOCKERS.md` y pausar.

## Skills Operativas

- `.agents/skills/svg-forge/SKILL.md`
- `.agents/skills/stripe-fulfillment/SKILL.md`
- `.agents/skills/visual-check/SKILL.md`

## Criterios de Producto Cerrados

- Flujo `/forjar` de 5 pasos: Perfil y datos, Combinaciones de iniciales, Estilos y propuestas IA, Visor de mockups, Entrega y pagos.
- Tres perfiles: Novillero / Torero, Ganadería / Yeguada, Finca / Particular. Entrada por `?perfil=novillero|ganaderia|particular`.
- Cuatro estilos: Tradicional, Monograma, Geométrico, Heráldico.
- Tres propuestas por generación con explicación del trazo y puntuaciones orientativas de legibilidad y equilibrio.
- Visor canvas con hierro forjado negro, bordado en capote/polo y cuero quemado.
- Descarga gratuita Story 9:16 con firma MI HIERRO.
- Pack Digital Premium 9,99 € (SVG limpio + PNG alta resolución + kit de redes en ZIP por token firmado y email).
- Informe de Similitud 19,90 € bajo pedido (ticket + aviso al administrador).
- Leads de revisión profesional 49–99 € y forja física.
- Home comercial, cuatro landings SEO, legales, `sitemap.ts` y `robots.ts`.
