"use client";

import { useState } from "react";
import { ArrowUpRight, Check, CreditCard, Download, FileText, Hammer, Loader2, Lock, Shield } from "lucide-react";
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
      <p className="eyebrow">V. Pliego y entrega</p>
      <h1 className="mt-3 font-display text-3xl leading-tight text-forge-ink sm:text-4xl">Llévate tu hierro</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forge-graphite">
        Descarga gratis la lámina Story 9:16 o solicita el pliego vectorial maestro para taller y bordado.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-forge-border bg-forge-white p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Plan 0 €</span>
            <span className="border border-forge-border px-2 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-forge-leather">
              Incluido
            </span>
          </div>
          <p className="mt-4 font-display text-2xl text-forge-ink">Lámina Story 9:16</p>
          <p className="mt-2 text-xs leading-relaxed text-forge-graphite">
            Tarjeta vertical 1080x1920 y avatar 1:1 con tu hierro, tu nombre y la firma discreta MI HIERRO.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-forge-graphite">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-leather" aria-hidden />Story 9:16 y avatar 1:1 con firma
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-leather" aria-hidden />Marca de agua orientativa
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-leather" aria-hidden />Sin registro ni tarjeta
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

        <div className="border border-forge-border bg-forge-white p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow-muted">Pliego vectorial y estudio</span>
            <Shield className="h-4 w-4 text-forge-leather" aria-hidden />
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
            <div className="border border-forge-border bg-forge-paper/50 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-lg text-forge-ink">Pack Digital Premium</p>
                <p className="font-display text-lg text-forge-grana">9,99 €</p>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-forge-graphite">
                {PREMIUM_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-leather" aria-hidden />
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

            <div className="border border-forge-border p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-lg text-forge-ink">Informe de Similitud</p>
                <p className="font-display text-lg text-forge-leather">19,90 €</p>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-forge-graphite">
                {SIMILARITY_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forge-leather" aria-hidden />
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

          <p className="mt-3 text-[0.65rem] text-forge-graphite">
            Pago seguro mediante Stripe (Tarjeta, Apple Pay, Google Pay y Bizum).
          </p>

          {checkoutFeedback ? (
            <div
              role="status"
              className={`mt-4 border p-4 text-xs leading-relaxed ${
                checkoutFeedback.kind === "success"
                  ? "border-forge-gold bg-forge-stone text-forge-ink"
                  : "border-forge-grana/50 bg-forge-grana/5 text-forge-grana"
              }`}
            >
              <p>{checkoutFeedback.message}</p>
              {checkoutFeedback.downloadUrl ? (
                <a
                  href={checkoutFeedback.downloadUrl}
                  className="mt-3 inline-flex items-center gap-2 font-semibold uppercase tracking-[0.14em] text-forge-grana underline underline-offset-2"
                >
                  Abrir mi entrega
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 border border-forge-border bg-forge-stone p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow-muted">Servicios profesionales</p>
            <p className="mt-1 font-display text-xl text-forge-ink">Revisión 49–99 € · Forja física</p>
          </div>
          <Hammer className="h-5 w-5 text-forge-leather" aria-hidden />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-forge-graphite">
          Adjuntamos tu diseño al expediente y te respondemos con alcance, presupuesto y plazo para acero inoxidable o bronce.
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

      <div className="mt-6 flex items-center gap-2 border-l-2 border-forge-grana pl-3 text-xs text-forge-graphite">
        <Lock className="h-3.5 w-3.5 shrink-0 text-forge-leather" aria-hidden />
        <span>Discreción absoluta: tus pruebas no se publican en galerías ni se ceden a terceros.</span>
      </div>

      <LegalNotice variant="full" className="mt-4" />
    </div>
  );
}
