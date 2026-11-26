# MI HIERRO · Sprint Board

Orquestador: `forge-director`. Cada sprint se cierra solo con las cinco compuertas en verde.

## Estado real (26 nov 2026) · Sprint 6 cerrado

- Implementación funcional de los sprints 0 a 6 completa en el repositorio y verificada de punta a punta.
- G1: `npx tsc --noEmit` en verde y `npm run build` en verde con 30 rutas generadas.
- G2: `npx vitest run` en verde, 13 archivos y 95 pruebas.
- G3: `/api/generate` sin `<svg>`, sin `d="M` ni `<text>` en las dos pasadas; `/api/preview` y `/api/story` solo PNG/WebP con marca de agua; sin secretos versionados (solo `.env.example`).
- G4: cerrada en Chromium real a 390x844 y 1440x900. Recorrido completo de los cinco pasos, carrusel móvil con tres propuestas, cajones `vaul` de revisión y forja, tres texturas de canvas con digest distinto, Story 1080x1920, avatar 1080x1080, checkout 9,99 € y 19,90 €, login y descarga del SVG maestro en `/admin` y cambio de estado del informe a ENVIADO. 21/21 comprobaciones del arnés nuevo, 0 errores de consola, 0 errores de página y 0 fallos de red. Evidencia en `.data/g4/`, `.data/g4-report.json` y `.data/g4-sprint6.json`.
- G5: revisión de código sin comentarios inline ni secretos y commit limpio.

## Blindaje de producción · Sprint 6

- `next.config.ts` con `serverExternalPackages` (`sharp`, `paper`, `opentype.js`, `@prisma/client`), `outputFileTracingIncludes` de `src/fonts/**/*` en las rutas API y cabeceras `X-Content-Type-Options`, `X-Frame-Options` y `Referrer-Policy` en todo el sitio.
- `tokens.ts` y `store/index.ts` solo usan el fallback en disco fuera de Vercel. Con `VERCEL=1` y sin `DOWNLOAD_TOKEN_SECRET` o `DATABASE_URL` lanzan un error explícito en lugar de escribir en un sistema de archivos efímero.
- Tipografías web servidas como WOFF2 vía `next/font/google` (Cinzel, Cormorant Garamond, Inter). Se elimina `public/fonts/` y queda una sola copia `.ttf` en `src/fonts/` para `opentype.js`.
- `GET /api/health` informa del store activo y del modo real o simulación de Gemini, Stripe, Resend, Redis, tokens de descarga y panel, sin exponer secretos. `ADMIN_PASSWORD` documentada en `.env.example`.

## Dinamismo y UX móvil · Sprint 6

- `useForgeWizard.ts` concentra el estado del flujo; `ForgeWizard.tsx` queda como capa de render.
- `vaul` mueve los formularios de revisión 49–99 € y forja física a cajones táctiles con altura máxima y scroll interno.
- `anime.js` v4 con `createScope` y `createDrawable` dibuja los cuatro glifos de estilo y escalona las tres propuestas; las barras de métricas entran con `scaleX`.
- `embla-carousel-react` desliza las tres propuestas y las tres texturas del visor en móvil.
- `lenis` activa scroll suave en marketing respetando `prefers-reduced-motion`.
- `sonner` sustituye el aviso propio con estética carbón y bronce.
- `PreviewCanvas` añade brillo especular que sigue al puntero, relieve de fibra en bordado y sombreado de quemado en cuero, siempre sobre la vista rasterizada con marca de agua.

## Identidad y operación · Sprint 6

- `icon.tsx` y `opengraph-image.tsx` generan el emblema y la tarjeta 1200x630 con `ImageResponse`.
- `/admin` protegido por cookie HMAC `HttpOnly` de 8 horas contra `ADMIN_PASSWORD`, con contraseña local de desarrollo cuando no está configurada. Lista pedidos, informes y leads; permite cambiar el estado del informe (`pending` → `in_progress` → `delivered`) y descargar el SVG maestro solo con sesión válida.
- El perfil Novillero acepta apodo opcional, validado y persistido con el diseño, y se muestra en el paso de iniciales.

## Cierre rápido · repositorio y scripts

- `docs/` sale del índice de Git y entra en `.gitignore`; los PDFs y referencias siguen en disco local.
- `package.json` incorpora `postinstall: prisma generate` y los scripts `db:migrate` y `db:studio` junto a `db:push`.
- `/api/admin/login` mantiene la comparación en tiempo constante con `crypto.timingSafeEqual` y baja el límite a 5 intentos por ventana de 15 minutos.
- `tests/admin.test.ts` cubre 401 sin cookie o con cookie manipulada, 429 al sexto intento, login válido con cookie `HttpOnly`, cambio de estado del informe y descarga del SVG maestro solo con sesión. Total: 95 pruebas en 13 archivos.
- G1 `tsc --noEmit` y G2 Vitest reejecutados sobre el árbol final.

## Incidencias corregidas en G4

- `tokenSecret()` lanzaba en producción si faltaba `DOWNLOAD_TOKEN_SECRET`, de modo que `/api/checkout` devolvía 500. Ahora genera y persiste un secreto local fuera de serverless y falla con mensaje claro en Vercel. Cubierto en `tests/download-token.test.ts` y `tests/serverless-guard.test.ts`.
- El arnés de G4 buscaba `Ingresos cobrados` con esa capitalización, pero `innerText` devuelve el texto con `text-transform: uppercase`. Corregida la aserción, no la interfaz.
- El cajón de servicios podía exceder el alto del viewport en móvil; se limita a `92dvh` con scroll interno.

## Sprint 0 · Esquema y contratos

- [x] `prisma/schema.prisma` con `Design`, `Order`, `SimilarityReportRequest`, `ForgeLead`
- [x] Contratos Zod estrictos en `src/types/forge.ts`
- [x] Tests de contrato en `tests/contracts.test.ts`
- [x] G1 a G5

## Sprint 1 · Estética forjada y wizard de 5 pasos

- [x] Layout oscuro forjado con tokens `#0C0B0A`, `#151311`, `#2B2622`, `#C89B63`, `#F2E9DA`
- [x] Selector de perfil `?perfil=` Novillero / Ganadería / Particular
- [x] Paso 1 datos con validación Zod, apodo opcional y persistencia entre pasos
- [x] Paso 2 combinaciones de iniciales sin duplicados
- [x] Paso 3 cuatro estilos y tres propuestas reales
- [x] Paso 4 visor Canvas con tres texturas
- [x] Paso 5 entrega y aviso legal siempre visible
- [x] G1 a G5

## Sprint 2 · Motor IA y vectorial

- [x] `POST /api/generate` con `@google/genai` y fallback determinista
- [x] Compilador `opentype.js` + `paper` sin etiquetas `<text>`
- [x] `/api/preview` exclusivamente PNG/WebP con marca de agua
- [x] Rate limit Upstash con adaptador en memoria
- [x] Tests SVG y anti-fuga
- [x] G1 a G5

## Sprint 3 · Visor realista y Story 9:16

- [x] Canvas con hierro forjado, bordado y cuero
- [x] Luz interactiva, relieve de hilo y sombreado a fuego
- [x] Descarga Story 9:16 con firma MI HIERRO
- [x] Metadatos y aviso legal en la pieza
- [x] G1 a G5

## Sprint 4 · Monetización y entrega

- [x] Checkout 9,99 € y 19,90 € con modo simulación local
- [x] Webhook idempotente con firma verificada
- [x] ZIP por token HMAC con caducidad en `/descarga/[token]`
- [x] Email Resend con adaptador de desarrollo
- [x] Leads de revisión 49–99 € y forja física
- [x] Tests de firma, idempotencia y tokens
- [x] G1 a G5

## Sprint 5 · Home, SEO y legal

- [x] Home comercial
- [x] Cuatro landings SEO
- [x] Aviso Legal, RGPD y Alcance registral
- [x] `sitemap.ts` y `robots.ts`
- [x] G1 a G5

## Sprint 6 · Endurecimiento, dinamismo y panel operativo

- [x] `next.config.ts` serverless, trazado de fuentes y cabeceras de seguridad
- [x] Fail-fast en Vercel para `DOWNLOAD_TOKEN_SECRET`, `DATABASE_URL` y `ADMIN_PASSWORD`
- [x] `src/fonts/` única y `next/font/google` para la interfaz
- [x] `GET /api/health` sin secretos
- [x] `useForgeWizard` y wizard desacoplado
- [x] `vaul`, `anime.js`, `embla-carousel-react`, `lenis` y `sonner` integrados
- [x] `icon.tsx` y `opengraph-image.tsx`
- [x] `/admin` con cookie HMAC, estados de informe y descarga del SVG maestro
- [x] Apodo opcional del novillero
- [x] G1 `tsc` + `next build`
- [x] G2 89 pruebas
- [x] G3 seguridad SVG y secretos
- [x] G4 navegador real 390x844 y 1440x900
- [x] G5 revisión y commit limpio
