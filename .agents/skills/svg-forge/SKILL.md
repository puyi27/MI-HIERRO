---
name: svg-forge
description: Audita o mejora el motor vectorial garantizando trazos limpios, forjables y protegidos.
---

# SVG Forge

1. Comprueba ausencia total de etiquetas `<text>` en el SVG compilado.
2. Verifica grosor mínimo equivalente a 6 unidades en `viewBox` 300x300 y unión booleana con `paper`.
3. Confirma que el endpoint de vista previa solo retorna PNG/WebP con marca de agua generada por `sharp`.
4. Confirma que el SVG limpio no viaja en ninguna respuesta del plan gratuito ni se inyecta en el DOM.
5. Ejecuta `npx vitest run tests/svg.test.ts tests/security-free-plan.test.ts` tras cualquier cambio.

## Checklist de aceptación

- [ ] El SVG maestro contiene únicamente `<path>` (más `svg` raíz).
- [ ] No hay `<text>`, `<image>` ni referencias externas.
- [ ] La silueta resulta de unir glifos y ornamentos con operaciones booleanas.
- [ ] El stroke mínimo verificado es mayor o igual a 6 unidades.
