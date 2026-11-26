import { NextResponse } from "next/server";
import { checkoutRequestSchema } from "@/types/forge";
import { getStore } from "@/lib/store";
import { createDownloadToken } from "@/lib/security/tokens";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { PRODUCT_COPY, getStripe, siteOrigin } from "@/lib/stripe/client";
import { fulfilPaidOrder } from "@/lib/stripe/fulfilment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "checkout"), 12, 3600);
  if (!limit.success) {
    return NextResponse.json({ error: "Demasiados intentos de compra. Espera unos minutos." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos de compra no válidos",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 400, headers: NO_STORE },
    );
  }

  const { product, designId, email } = parsed.data;
  const store = await getStore();
  const design = await store.getDesign(designId);
  if (!design) {
    return NextResponse.json({ error: "El diseño ya no está disponible. Vuelve a forjarlo." }, { status: 404, headers: NO_STORE });
  }

  const copy = PRODUCT_COPY[product];
  const origin = siteOrigin(request);

  const order = await store.createOrder({
    designId: design.id,
    product,
    amountCents: copy.amountCents,
    email,
    metadata: { initials: design.initials, style: design.style, origin },
  });

  const token = createDownloadToken({ d: design.id, o: order.id, p: product });

  const stripe = getStripe();
  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: copy.amountCents,
              product_data: { name: copy.name, description: copy.description },
            },
          },
        ],
        allowed_payment_method_types: ["card", "bizum"],
        success_url: `${origin}/descarga/${token}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/forjar?cancelado=1`,
        metadata: { orderId: order.id, designId: design.id, product },
      });

      await store.attachStripeSession(order.id, session.id);

      return NextResponse.json(
        {
          mode: "stripe",
          orderId: order.id,
          url: session.url ?? undefined,
          message: "Redirigiendo a Stripe Checkout.",
        },
        { status: 200, headers: NO_STORE },
      );
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 502, headers: NO_STORE });
      }
    }
  }

  const fulfilment = await fulfilPaidOrder(order.id, "simulated-local", origin);

  return NextResponse.json(
    {
      mode: "simulation",
      orderId: order.id,
      downloadUrl: `/descarga/${token}`,
      message:
        product === "premium"
          ? "Modo simulación local: pago aprobado y pack desbloqueado."
          : "Modo simulación local: informe registrado y aviso enviado al administrador.",
    },
    { status: 200, headers: NO_STORE },
  );
}
