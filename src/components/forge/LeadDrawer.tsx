"use client";

import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { BadgeCheck, Loader2, Mail, X } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import type { LeadRequest } from "@/types/forge";
import type { LeadFeedback } from "@/components/forge/types";

interface LeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "revision" | "forja";
  onTypeChange: (type: "revision" | "forja") => void;
  defaultName: string;
  defaultEmail: string;
  onSubmit: (payload: LeadRequest) => void;
  busy: boolean;
  feedback: LeadFeedback | null;
}

export function LeadDrawer({
  open,
  onOpenChange,
  type,
  onTypeChange,
  defaultName,
  defaultEmail,
  onSubmit,
  busy,
  feedback,
}: LeadDrawerProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (!name) setName(defaultName);
    if (!email) setEmail(defaultEmail);
  }, [open, name, email, defaultName, defaultEmail]);

  const submit = () => {
    if (message.trim().length < 10) {
      setError("Cuéntanos un poco más (mínimo 10 caracteres).");
      return;
    }
    setError(null);
    onSubmit({
      type,
      name,
      email,
      phone,
      message,
      budget: type === "revision" ? "49-99" : "forja",
    });
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-forge-ink/50" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] w-full max-w-xl overflow-y-auto overscroll-contain border-t border-forge-border bg-forge-white px-5 pb-8 pt-3 outline-none"
          aria-describedby={undefined}
        >
          <div className="mx-auto mb-4 h-1 w-12 bg-forge-border" aria-hidden />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow-muted">Servicios profesionales</p>
              <Drawer.Title className="mt-2 font-display text-2xl leading-tight text-forge-ink">
                {type === "revision" ? "Revisión 49–99 €" : "Forja física"}
              </Drawer.Title>
            </div>
            <Drawer.Close asChild>
              <button
                type="button"
                aria-label="Cerrar solicitud"
                className="border border-forge-border p-2 text-forge-graphite transition hover:border-forge-grana hover:text-forge-grana"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </Drawer.Close>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-forge-graphite">
            {type === "revision"
              ? "Adjuntamos tu diseño al expediente y valoramos similitudes, viabilidad y alcance registral orientativo."
              : "Te respondemos con presupuesto, herraje y plazo de entrega para llevar el hierro al taller."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip label="Revisión 49–99 €" selected={type === "revision"} onSelect={() => onTypeChange("revision")} />
            <Chip label="Forja física" selected={type === "forja"} onSelect={() => onTypeChange("forja")} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2" data-vaul-no-drag>
            <Field id="leadName" label="Nombre" value={name} onChange={setName} autoComplete="name" required />
            <Field
              id="leadEmail"
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
            />
            <div className="sm:col-span-2">
              <Field
                id="leadPhone"
                label="Teléfono"
                value={phone}
                onChange={setPhone}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                optionalLabel="opcional"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="leadMessage" className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-forge-graphite">
                Cuéntanos qué necesitas <span className="text-forge-grana">*</span>
              </label>
              <textarea
                id="leadMessage"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                maxLength={1200}
                className="field resize-y"
                placeholder="Quiero revisar si este hierro se parece a alguno existente y pedir presupuesto de forja."
              />
              {error ? (
                <p role="alert" className="mt-2 text-xs text-forge-grana">
                  {error}
                </p>
              ) : null}
            </div>
          </div>

          <button type="button" onClick={submit} disabled={busy} className="btn-primary mt-5 w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Mail className="h-4 w-4" aria-hidden />}
            {busy ? "Enviando" : "Enviar solicitud"}
          </button>

          {feedback ? (
            <p
              role="status"
              className={`mt-4 flex items-start gap-2 text-xs leading-relaxed ${
                feedback.kind === "success" ? "text-forge-leather" : "text-forge-grana"
              }`}
            >
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {feedback.message}
            </p>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
