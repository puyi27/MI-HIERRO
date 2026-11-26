# Blockers

## B-001 · Ejecutor de terminal sin bash empaquetado · CERRADO el 26 nov 2026

- Resuelto al reiniciar el entorno: el terminal vuelve a responder (`node`, `npm` y `git` operativos).
- G4 ejecutada en Chromium real (390x844 y 1440x900, perfiles Novillero y Ganadería) y G5 cerrado con el commit inicial.
- El refactor del motor vectorial y el avatar 1:1 gratuito quedaron verificados: `tsc` y `next build` en verde, 77 pruebas en verde y Story 1080x1920 / avatar 1080x1080 en el navegador.
- Incidencia detectada y corregida durante G4: `/api/checkout` devolvía 500 sin `DOWNLOAD_TOKEN_SECRET`; ahora usa un secreto local persistente.

## Histórico · B-001 · Ejecutor de terminal sin bash empaquetado

- Reintento del 25 nov 2026, tras aviso de shell restaurado: `git --version` y `npm -v` siguen fallando con la misma ruta ausente. La pestaña de terminal de la aplicación tampoco crea sesión (`terminal_list` vacío). El chat reutiliza el runner con la ruta antigua; hace falta cerrar por completo Freebuff Desktop (incluida la bandeja del sistema) y reabrir.
- Cambios escritos pendientes de verificación por este bloqueo: avatar 1:1 gratuito con marca de agua en `/api/story` (`format: "avatar"`), botón en el paso 5 y test anti-fuga añadido a `tests/security-free-plan.test.ts`.
- Refactor del motor vectorial escrito y pendiente de compilar y mirar: marcos por `outer.subtract(inner)`, glifos en `CompoundPath` sin engrosado, composición por estilo, degradado metálico con bisel en preview y nueva suite `tests/geometry.test.ts` (G/AP/CR/JMR × 4 estilos). No se ha podido ejecutar `tsc`, `next build`, Vitest ni `npm run start`.

- Fecha: 25 de noviembre de 2026.
- Estado: abierto, bloqueo externo.
- Síntoma: toda ejecución de terminal falla con `Skipping command-line '...resources\git\bin\..\usr\bin\bash.exe' (not found)`. Afecta a `run_terminal_command` y a `process_start`, incluidos comandos de PowerShell, porque el arnés reescribe la invocación hacia ese binario.
- Momento: apareció tras arrancar `next dev` en segundo plano. Antes de ese punto se ejecutaron instalación, `prisma generate`, `tsc`, `next build` y 49 pruebas.
- Hipótesis: el binario empaquetado de Git Bash desapareció o cambió de ruta (actualización de la aplicación de escritorio, cuarentena de antivirus o sincronización de OneDrive).
- Impacto: no se puede relanzar el servidor de desarrollo ni ejecutar `git`, por lo que quedan pendientes G4 (recorrido real en Chromium) y G5 (commit limpio por sprint).
- Mitigación: reiniciar Freebuff Desktop para que vuelva a desplegar su Git empaquetado y repetir `npm run dev`, la compuerta de navegador y los commits.
- Sin cambios destructivos pendientes: el código, los tests y el build están guardados en disco.
