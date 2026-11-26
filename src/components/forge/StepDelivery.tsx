"use client";

import { useState } from "react";
import { ArrowUpRight, Check, CreditCard, Download, FileText, Hammer, Loader2, Shield } from "lucide-react";
import { LegalNotice } from "@/components/layout/LegalNotice";
import { Field } from "@/components/ui/Field";
import type { ForgeProposal, LeadRequest } from "@/types/forge";
import type { CheckoutFeedback, LeadFeedback, WizardDraft } from "@/components/forge/types";
import { LeadDrawer } from "@/components/forge/LeadDrawer";

interface StepDeliveryProps {
  draft: WizardDraft;
  proposal: ForgeProposal | null;
  email: string;
  onEmailChange: (email: string) => void;
  onCheckout: (product: "premium" | "similarity") => void;
  busyProduct: "premium" | "similarity" | null;
  checkoutFeedback: CheckoutFeedback | null;
  onStory: () => void;
  storyBusy: boolean;
  onAvatar: () => void;
  avatarBusy: boolean;
  onLead: (payload: LeadRequest) => void;
  leadBusy: boolean;
  leadFeedback: LeadFeedback | null;
}

const PREMIUM_FEATURES = [
  "SVG limpio con trazados en curvas, listo para forja",
  "PNG transparente a 2400 px",
  "Avatar 1080x1080 y kit para redes",
  "Entrega inmediata por enlace firmado y email",
];

const SIMILARITY_FEATURES = [
  "Búsqueda documental orientativa",
  "Fuentes, coincidencias y limitaciones",
  "Informe por escrito en 24-48 h laborables",
  "Revisión humana de los casos dudosos",
];

export function StepDelivery({
  draft,
  proposal,
  email,
  onEmailChange,
  onCheckout,
  busyProduct,
  checkoutFeedback,
  onStory,
  storyBusy,
  onAvatar,
  avatarBusy,
  onLead,
  leadBusy,
  leadFeedback,
}: StepDeliveryProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [leadType, setLeadType] = useState<"revision" | "forja">("revision");

  const openDrawer = (type: "revision" | "forja") => {
    setLeadType(type);
    setDrawerOpen(true);
  };

  return (
    <div>
      <p className="eyebrow">Paso 05 · Entrega</p>
      <h1 className="mt-4 font-display text-3xl leading-tight text-forge-ivory sm:text-4xl">Llévate tu hierro</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forge-muted">
        Empieza gratis con la Story 9:16. Si necesitas el archivo vectorial, el pack completo o una revisión profesional,
        aquí tienes las opciones.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-forge-bronze/40 bg-forge-surface p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Plan 0 €</span>
            <span className="border border-forge-bronze/60 px-2 py-1 text-[0.55rem] uppercase tracking-[0.18em] text-forge-bronze">
              Incluido
            </span>
          </div>
          <p className="mt-4 font-display text-2xl text-forge-ivory">Story 9:16</p>
          <p className="mt-2 text-xs leading-relaxed text-forge-muted">
            Tarjeta vertical 1080x1920 con tu hierro, tu nombre y la firma MI HIERRO. Pensada para Instagram y TikTok.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-forge-muted">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-bronze" aria-hidden />Story 9:16 y avatar 1:1 con
              firma MI HIERRO
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-bronze" aria-hidden />Marca de agua orientativa en
              ambas piezas
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-bronze" aria-hidden />Sin registro ni tarjeta
            </li>
          </ul>
          <button type="button" onClick={onStory} disabled={storyBusy || avatarBusy || !proposal} className="btn-ghost mt-5 w-full">
            {storyBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
            {storyBusy ? "Preparando" : "Descargar Story gratis"}
          </button>
          <button type="button" onClick={onAvatar} disabled={storyBusy || avatarBusy || !proposal} className="btn-ghost mt-3 w-full">
            {avatarBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
            {avatarBusy ? "Preparando" : "Descargar avatar 1:1 gratis"}
          </button>
        </div>

        <div className="border border-forge-line bg-forge-surface p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow-muted">Packs de pago</span>
            <Shield className="h-4 w-4 text-forge-bronze" aria-hidden />
          </div>
          <div className="mt-4">
            <Field
              id="checkoutEmail"
              label="Email de entrega"
              value={email}
              onChange={onEmailChange}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@correo.es"
              hint="Te enviamos el enlace de descarga y el justificante."
              required
            />
          </div>

          <div className="mt-5 grid gap-4">
            <div className="border border-forge-line p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-lg text-forge-ivory">Pack Digital Premium</p>
                <p className="font-display text-lg text-forge-bronze">9,99 €</p>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-forge-muted">
                {PREMIUM_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-bronze" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onCheckout("premium")}
                disabled={busyProduct !== null}
                className="btn-primary mt-4 w-full"
              >
                {busyProduct === "premium" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CreditCard className="h-4 w-4" aria-hidden />}
                {busyProduct === "premium" ? "Abriendo pago" : "Comprar pack · 9,99 €"}
              </button>
            </div>

            <div className="border border-forge-line p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-lg text-forge-ivory">Informe de Similitud</p>
                <p className="font-display text-lg text-forge-bronze">19,90 €</p>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-forge-muted">
                {SIMILARITY_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-bronze" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onCheckout("similarity")}
                disabled={busyProduct !== null}
                className="btn-ghost mt-4 w-full"
              >
                {busyProduct === "similarity" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileText className="h-4 w-4" aria-hidden />}
                {busyProduct === "similarity" ? "Abriendo pago" : "Solicitar informe · 19,90 €"}
              </button>
            </div>
          </div>

          {checkoutFeedback ? (
            <div
              role="status"
              className={`mt-4 border p-4 text-xs leading-relaxed ${
                checkoutFeedback.kind === "success"
                  ? "border-forge-bronze/60 bg-forge-bronze/10 text-forge-ivory"
                  : "border-[#6d3a2b] bg-[#251512] text-[#e6b4a1]"
              }`}
            >
              <p>{checkoutFeedback.message}</p>
              {checkoutFeedback.downloadUrl ? (
                <a
                  href={checkoutFeedback.downloadUrl}
                  className="mt-3 inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-forge-bronze"
                >
                  Abrir mi entrega
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 border border-forge-line bg-forge-surface/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow-muted">Servicios profesionales</p>
            <p className="mt-1 font-display text-xl text-forge-ivory">Revisión 49–99 € · Forja física</p>
          </div>
          <Hammer className="h-5 w-5 text-forge-bronze" aria-hidden />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-forge-muted">
          Adjuntamos tu diseño al expediente y te respondemos con alcance, presupuesto y plazo. La revisión profesional
          valora similitudes y viabilidad antes de fabricar.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => openDrawer("revision")} className="btn-ghost w-full">
            <FileText className="h-4 w-4" aria-hidden />
            Pedir revisión
          </button>
          <button type="button" onClick={() => openDrawer("forja")} className="btn-ghost w-full">
            <Hammer className="h-4 w-4" aria-hidden />
            Encargar forja física
          </button>
        </div>
        <p className="mt-3 text-[0.62rem] leading-relaxed text-forge-muted/80">
          Se abre un cajón deslizable con el formulario. Adjuntamos automáticamente tu diseño al expediente.
        </p>
      </div>

      <LeadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        type={leadType}
        onTypeChange={setLeadType}
        defaultName={`${draft.firstName} ${draft.lastName1}`.trim()}
        defaultEmail={email}
        onSubmit={onLead}
        busy={leadBusy}
        feedback={leadFeedback}
      />

      <LegalNotice variant="full" className="mt-6" />

      <p className="mt-4 text-[0.65rem] leading-relaxed text-forge-muted/80">
        Tarifas orientativas para validar el mercado, no precios comprometidos ni previsiones financieras. El Pack Digital
        es un pago único sin suscripción. Los enlaces de descarga caducan a las 72 horas.
      </p>
    </div>
  );
}
