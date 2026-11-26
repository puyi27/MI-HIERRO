---
name: stripe-fulfillment
description: Verifica de punta a punta el cobro en Stripe, la idempotencia del webhook y la descarga del ZIP.
---

# Stripe Fulfillment

1. Verifica validación de firma `stripe-signature` con el cuerpo raw de la petición.
2. Comprueba que un mismo `checkout.session.completed` procesado dos veces no duplica registros ni correos.
3. Valida que `/descarga/[token]` rechaza tokens expirados o manipulados con HTTP 403.
4. Confirma que en local, sin claves reales, el checkout simulado emite un token firmado real y permite descargar el ZIP.
5. Ejecuta `npx vitest run tests/stripe.test.ts tests/download-token.test.ts`.

## Checklist de aceptación

- [ ] Firma inválida rechazada con 400.
- [ ] Evento repetido responde 200 sin reprocesar.
- [ ] Token manipulado o caducado responde 403.
- [ ] ZIP contiene SVG limpio, PNG transparente y avatar de redes.
