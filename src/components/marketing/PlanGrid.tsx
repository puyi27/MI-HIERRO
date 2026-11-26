import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

const PLANS = [
  {
    name: "Generación básica",
    price: "0 €",
    badge: "Incluido",
    description: "Primera experiencia gratuita con límites de propuestas.",
    features: ["Tres propuestas por forja", "Visor en tres materiales", "Story 9:16 con firma"],
    cta: "Forjar gratis",
    href: "/forjar",
  },
  {
    name: "Pack Digital Premium",
    price: "9,99 €",
    badge: "Pago único",
    description: "El archivo profesional para forjar, bordar o imprimir.",
    features: ["SVG limpio en curvas", "PNG transparente 2400 px", "Kit de redes y avatar", "Entrega por email"],
    cta: "Comprar pack",
    href: "/forjar",
  },
  {
    name: "Informe de Similitud",
    price: "19,90 €",
    badge: "Bajo pedido",
    description: "Búsqueda documental orientativa antes de fabricar.",
    features: ["Fuentes y coincidencias", "Limitaciones explicadas", "Entrega 24-48 h", "Revisión humana"],
    cta: "Solicitar informe",
    href: "/forjar",
  },
];

export function PlanGrid() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article key={plan.name} className="panel flex flex-col p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow-muted">{plan.badge}</span>
              <span className="font-display text-2xl text-forge-bronze">{plan.price}</span>
            </div>
            <h3 className="mt-4 font-display text-lg tracking-wide text-forge-ivory">{plan.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-forge-muted">{plan.description}</p>
            <ul className="mt-5 flex-1 space-y-2 text-xs text-forge-muted">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-bronze" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
            <Link href={plan.href} className="btn-ghost mt-6 w-full">
              {plan.cta}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-4 flex flex-col justify-between gap-3 border border-forge-line bg-forge-surface/60 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow-muted">Servicios profesionales</p>
          <p className="mt-1 font-display text-lg text-forge-ivory">Revisión 49–99 € · Forja física a presupuesto</p>
        </div>
        <Link href="/encargar-hierro-forjado" className="btn-ghost w-full sm:w-auto">
          Ver opciones
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <p className="mt-4 text-[0.65rem] leading-relaxed text-forge-muted/80">
        Tarifas orientativas para validar el mercado, no precios comprometidos ni previsiones financieras. El Pack Digital
        es un pago único. El pago se realiza dentro del flujo, después de ver tu propuesta.
      </p>
    </div>
  );
}
