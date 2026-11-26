import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStore } from "@/lib/store";
import { getStripe, siteOrigin } from "@/lib/stripe/client";
import { fulfilPaidOrder } from "@/lib/stripe/fulfilment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook de Stripe no configurado en este entorno." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Falta la firma de Stripe." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Firma de webhook no válida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ received: true, ignored: "sin orderId" }, { status: 200 });
    }
    const paymentIntent =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
    const result = await fulfilPaidOrder(orderId, paymentIntent, siteOrigin(request));
    return NextResponse.json({ received: true, duplicate: result?.duplicate ?? false }, { status: 200 });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const store = await getStore();
      await store.markOrderFailed(orderId);
    }
    return NextResponse.json({ received: true, expired: true }, { status: 200 });
  }

  return NextResponse.json({ received: true, ignored: event.type }, { status: 200 });
}
