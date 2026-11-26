# MI HIERRO · Sprint Board

Orquestador: `forge-director`. Cada sprint se cierra solo con las cinco compuertas en verde.

## Estado real (26 nov 2026)

- Implementación funcional de los sprints 0 a 5 completa en el repositorio y verificada de punta a punta.
- G1: `npx tsc --noEmit` en verde y `npm run build` en verde con 14 rutas generadas sobre el árbol final.
- G2: `npx vitest run` en verde, 9 archivos y 77 pruebas.
- G3: `tests/security-free-plan.test.ts` en verde y auditoría sobre respuestas reales del servidor de producción: `/api/generate` sin `<svg>`, sin `d="M` y sin `<text>`; `/api/preview` y `/api/story` solo rasterizado con marca de agua.
- G4: cerrada. Chromium real vía CDP en 390x844 y 1440x900 con los perfiles Novillero y Ganadería. Los cinco pasos se completan, el canvas redibuja con las tres texturas y al cambiar de propuesta, la Story descarga PNG 1080x1920, el avatar PNG 1080x1080, el checkout simulado responde 200 con enlace firmado y el ZIP contiene SVG, PNG 2400, avatar, Story y LEEME. Cero errores de consola, de página y de red; sin scroll horizontal ni botones fuera del viewport; aviso legal visible en los pasos 1 y 5. Evidencia en `.data/g4/` y `.data/g4-report.json`.
- G5: commit inicial del repositorio con el árbol verificado.

## Incidencia corregida en G4

- `tokenSecret()` lanzaba en producción si faltaba `DOWNLOAD_TOKEN_SECRET`, de modo que `/api/checkout` devolvía 500 y rompía el flujo de pago, en contra de la regla de resiliencia local. Ahora genera y persiste un secreto local en `.data/download-token-secret`, avisa por consola y solo falla si no puede persistirlo. Cubierto por una prueba nueva en `tests/download-token.test.ts`.

## Sprint 0 · Esquema y contratos

- [x] `prisma/schema.prisma` con `Design`, `Order`, `SimilarityReportRequest`, `ForgeLead`
- [x] Contratos Zod estrictos en `src/types/forge.ts`
- [x] Tests de contrato en `tests/contracts.test.ts`
- [x] G1 `tsc --noEmit` + `next build`
- [x] G2 Vitest
- [x] G3 sin SVG filtrado ni secretos
- [x] G4 navegador 390x844 y 1440x900
- [x] G5 commit final

## Sprint 1 · Estética forjada y wizard de 5 pasos

- [x] Layout oscuro forjado con tokens `#0C0B0A`, `#151311`, `#2B2622`, `#C89B63`, `#F2E9DA`
- [x] Selector de perfil `?perfil=` Novillero / Ganadería / Particular
- [x] Paso 1 datos con validación Zod y persistencia entre pasos
- [x] Paso 2 combinaciones de iniciales sin duplicados
- [x] Paso 3 cuatro estilos y tres propuestas reales
- [x] Paso 4 visor Canvas con tres texturas
- [x] Paso 5 entrega y aviso legal siempre visible
- [x] G1 a G3
- [x] G4 navegador
- [x] G5 commit

## Sprint 2 · Motor IA y vectorial

- [x] `POST /api/generate` con `@google/genai` y fallback determinista
- [x] Compilador `opentype.js` + `paper` sin etiquetas `<text>`
- [x] `/api/preview` exclusivamente PNG/WebP con marca de agua
- [x] Rate limit Upstash con adaptador en memoria
- [x] Tests SVG y anti-fuga
- [x] G1 a G3
- [x] G4 navegador
- [x] G5 commit

## Sprint 3 · Visor realista y Story 9:16

- [x] Canvas con hierro forjado, bordado y cuero
- [x] Descarga Story 9:16 con firma MI HIERRO
- [x] Metadatos y aviso legal en la pieza
- [x] G1 a G3
- [x] G4 navegador
- [x] G5 commit

## Sprint 4 · Monetización y entrega

- [x] Checkout 9,99 € y 19,90 € con modo simulación local
- [x] Webhook idempotente con firma verificada
- [x] ZIP por token HMAC con caducidad en `/descarga/[token]`
- [x] Email Resend con adaptador de desarrollo
- [x] Leads de revisión 49–99 € y forja física
- [x] Tests de firma, idempotencia y tokens
- [x] G1 a G3
- [x] G4 navegador
- [x] G5 commit

## Sprint 5 · Home, SEO y legal

- [x] Home comercial
- [x] Cuatro landings SEO
- [x] Aviso Legal, RGPD y Alcance registral
- [x] `sitemap.ts` y `robots.ts`
- [x] G1 a G3
- [x] G4 auditoría final en móvil y escritorio
- [x] G5 commit
