import Stripe from "stripe";

export const PREMIUM_PRICE_CENTS = Number(process.env.PREMIUM_PRICE_CENTS ?? 999);
export const SIMILARITY_PRICE_CENTS = Number(process.env.SIMILARITY_PRICE_CENTS ?? 1990);

export const PRODUCT_COPY = {
  premium: {
    name: "Pack Digital Premium MI HIERRO",
    description: "SVG forjable, PNG transparente en alta resolución y kit de redes sociales.",
    amountCents: PREMIUM_PRICE_CENTS,
  },
  similarity: {
    name: "Informe de Similitud MI HIERRO",
    description: "Búsqueda documental orientativa con fuentes, coincidencias y limitaciones. Entrega 24-48 h.",
    amountCents: SIMILARITY_PRICE_CENTS,
  },
} as const;

export function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  return new Stripe(secret);
}

export function stripeIsConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export function siteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && configured.startsWith("http")) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}
