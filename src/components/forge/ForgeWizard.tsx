"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, RotateCcw, X } from "lucide-react";
import {
  generateResponseSchema,
  userProfileSchema,
  type ForgeProposal,
  type InitialsCombination,
  type LeadRequest,
  type ProfileType,
} from "@/types/forge";
import { buildInitialCombinations } from "@/lib/forge-engine/initials";
import { StepIndicator } from "@/components/forge/StepIndicator";
import { StepProfile } from "@/components/forge/StepProfile";
import { StepInitials } from "@/components/forge/StepInitials";
import { StepStyle } from "@/components/forge/StepStyle";
import { StepWorld } from "@/components/forge/StepWorld";
import { StepDelivery, type CheckoutFeedback } from "@/components/forge/StepDelivery";
import { createDraft, type ForgeTexture, type WizardDraft } from "@/components/forge/types";

const STORAGE_KEY = "mi-hierro-forge-v1";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface ForgeWizardProps {
  initialProfile: ProfileType;
  canceled?: boolean;
}

interface LeadFeedback {
  kind: "success" | "error";
  message: string;
}

const RESETTING_KEYS: Array<keyof WizardDraft> = [
  "firstName",
  "lastName1",
  "lastName2",
  "origin",
  "character",
  "remate",
  "combinationId",
  "style",
  "profile",
];

export function ForgeWizard({ initialProfile, canceled = false }: ForgeWizardProps) {
  const [draft, setDraft] = useState<WizardDraft>(() => createDraft(initialProfile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [texture, setTexture] = useState<ForgeTexture>("hierro");
  const [storyBusy, setStoryBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [busyProduct, setBusyProduct] = useState<"premium" | "similarity" | null>(null);
  const [checkoutFeedback, setCheckoutFeedback] = useState<CheckoutFeedback | null>(
    canceled
      ? { kind: "error", message: "Has cancelado el pago. Puedes reintentarlo cuando quieras; tu diseño sigue guardado." }
      : null,
  );
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState<LeadFeedback | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<WizardDraft>;
        if (parsed && typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 5) {
          setDraft({ ...createDraft(initialProfile), ...parsed });
        }
      }
    } catch {
      setDraft(createDraft(initialProfile));
    }
    setHydrated(true);
  }, [initialProfile]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      return;
    }
  }, [draft, hydrated]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [draft.step]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const combinations = useMemo(
    () =>
      buildInitialCombinations({
        firstName: draft.firstName,
        lastName1: draft.lastName1,
        lastName2: draft.lastName2,
      }),
    [draft.firstName, draft.lastName1, draft.lastName2],
  );

  const selectedCombination = useMemo<InitialsCombination | null>(() => {
    if (combinations.length === 0) return null;
    return combinations.find((combination) => combination.id === draft.combinationId) ?? combinations[0];
  }, [combinations, draft.combinationId]);

  const selectedProposal = useMemo<ForgeProposal | null>(() => {
    if (draft.proposals.length === 0) return null;
    return draft.proposals.find((proposal) => proposal.id === draft.selectedProposalId) ?? draft.proposals[0];
  }, [draft.proposals, draft.selectedProposalId]);

  const profilePayload = useMemo(
    () => ({
      profile: draft.profile,
      firstName: draft.firstName,
      lastName1: draft.lastName1,
      lastName2: draft.lastName2,
      origin: draft.origin,
      character: draft.character,
      remate: draft.remate,
    }),
    [draft.profile, draft.firstName, draft.lastName1, draft.lastName2, draft.origin, draft.character, draft.remate],
  );

  const update = useCallback((patch: Partial<WizardDraft>) => {
    setDraft((previous) => {
      const next = { ...previous, ...patch };
      const touchesIdentity = Object.keys(patch).some((key) => RESETTING_KEYS.includes(key as keyof WizardDraft));
      if (touchesIdentity) {
        next.proposals = [];
        next.selectedProposalId = null;
      }
      return next;
    });
    setGenerateError(null);
  }, []);

  const goToStep = (step: number) => {
    setDraft((previous) => ({ ...previous, step }));
  };

  const validateIdentity = (): boolean => {
    const parsed = userProfileSchema.safeParse(profilePayload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const advanceFromProfile = () => {
    if (!validateIdentity()) return;
    const parsed = userProfileSchema.parse(profilePayload);
    setDraft((previous) => ({
      ...previous,
      firstName: parsed.firstName,
      lastName1: parsed.lastName1,
      lastName2: parsed.lastName2,
      origin: parsed.origin,
      step: 2,
    }));
  };

  const advanceFromInitials = () => {
    if (!selectedCombination) {
      setErrors({ combination: "Necesitamos un nombre y un primer apellido válidos para generar iniciales." });
      return;
    }
    setErrors({});
    setDraft((previous) => ({ ...previous, combinationId: selectedCombination.id, step: 3 }));
  };

  const generate = async () => {
    if (!selectedCombination) {
      setGenerateError("Vuelve al paso de iniciales para elegir una combinación.");
      return;
    }
    const parsedProfile = userProfileSchema.safeParse(profilePayload);
    if (!parsedProfile.success) {
      setGenerateError("Revisa tus datos antes de forjar.");
      goToStep(1);
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: parsedProfile.data,
          initials: selectedCombination,
          style: draft.style,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data ? String((data as { error: unknown }).error) : "No se pudo forjar. Inténtalo de nuevo.";
        setGenerateError(message);
        return;
      }

      const parsed = generateResponseSchema.safeParse(data);
      if (!parsed.success) {
        setGenerateError("La respuesta de la fragua no era válida. Reinténtalo.");
        return;
      }

      setDraft((previous) => ({
        ...previous,
        proposals: parsed.data.proposals,
        selectedProposalId: parsed.data.proposals[0].id,
        combinationId: selectedCombination.id,
      }));
    } catch {
      setGenerateError("No hay conexión con la fragua. Comprueba tu red e inténtalo otra vez.");
    } finally {
      setGenerating(false);
    }
  };

  const downloadAsset = async (format: "story" | "avatar") => {
    if (!selectedProposal) return;
    const setBusy = format === "avatar" ? setAvatarBusy : setStoryBusy;
    setBusy(true);
    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId: selectedProposal.id, variant: texture, format }),
      });
      if (!response.ok) {
        setToast(format === "avatar" ? "No se pudo preparar el avatar. Inténtalo de nuevo." : "No se pudo preparar la Story. Inténtalo de nuevo.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = format === "avatar" ? "mi-hierro-avatar-1x1.png" : "mi-hierro-story-9x16.png";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setToast(
        format === "avatar"
          ? "Avatar 1:1 descargado. Ya puedes usarlo en tus redes."
          : "Story 9:16 descargada. Compártela con #MiHierro.",
      );
    } catch {
      setToast("No se pudo descargar la pieza.");
    } finally {
      setBusy(false);
    }
  };

  const downloadStory = () => downloadAsset("story");
  const downloadAvatar = () => downloadAsset("avatar");

  const checkout = async (product: "premium" | "similarity") => {
    if (!selectedProposal) {
      setCheckoutFeedback({ kind: "error", message: "Necesitas un diseño forjado antes de comprar." });
      return;
    }
    const email = draft.email.trim();
    if (!EMAIL_PATTERN.test(email)) {
      setCheckoutFeedback({ kind: "error", message: "Introduce un email válido para enviarte la entrega." });
      return;
    }

    setBusyProduct(product);
    setCheckoutFeedback(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, designId: selectedProposal.id, email }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data ? String((data as { error: unknown }).error) : "No se pudo iniciar el pago.";
        setCheckoutFeedback({ kind: "error", message });
        return;
      }

      if (data && typeof data === "object" && "mode" in data && data.mode === "stripe" && "url" in data && typeof data.url === "string") {
        window.location.assign(data.url);
        return;
      }

      if (data && typeof data === "object" && "message" in data) {
        setCheckoutFeedback({
          kind: "success",
          message: String(data.message),
          downloadUrl:
            "downloadUrl" in data && typeof data.downloadUrl === "string" ? data.downloadUrl : undefined,
        });
      }
    } catch {
      setCheckoutFeedback({ kind: "error", message: "Error de conexión con la pasarela de pago." });
    } finally {
      setBusyProduct(null);
    }
  };

  const submitLead = async (payload: LeadRequest) => {
    setLeadBusy(true);
    setLeadFeedback(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data ? String((data as { error: unknown }).error) : "No se pudo enviar la solicitud.";
        setLeadFeedback({ kind: "error", message });
        return;
      }
      setLeadFeedback({
        kind: "success",
        message: data && typeof data === "object" && "message" in data ? String(data.message) : "Solicitud recibida.",
      });
    } catch {
      setLeadFeedback({ kind: "error", message: "No hay conexión. Inténtalo de nuevo." });
    } finally {
      setLeadBusy(false);
    }
  };

  const reset = () => {
    setDraft(createDraft(initialProfile));
    setErrors({});
    setGenerateError(null);
    setCheckoutFeedback(null);
    setLeadFeedback(null);
    setTexture("hierro");
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24 pt-8 sm:px-8">
      <StepIndicator current={draft.step} />

      <motion.div
        key={draft.step}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mt-10"
      >
        {draft.step === 1 ? <StepProfile draft={draft} errors={errors} onChange={update} /> : null}

        {draft.step === 2 ? (
          <>
            {errors.combination ? (
              <div role="alert" className="mb-6 flex gap-3 border border-[#6d3a2b] bg-[#251512] p-4 text-sm text-[#e6b4a1]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>{errors.combination}</p>
              </div>
            ) : null}
            <StepInitials draft={draft} combinations={combinations} selected={selectedCombination} onSelect={(combination) => update({ combinationId: combination.id })} />
          </>
        ) : null}

        {draft.step === 3 ? (
          <StepStyle
            style={draft.style}
            onStyleChange={(style) => update({ style })}
            onGenerate={generate}
            generating={generating}
            error={generateError}
            proposals={draft.proposals}
            selectedProposalId={selectedProposal?.id ?? null}
            onSelectProposal={(proposalId) => setDraft((previous) => ({ ...previous, selectedProposalId: proposalId }))}
            initialsLabel={selectedCombination?.label ?? ""}
          />
        ) : null}

        {draft.step === 4 ? (
          <StepWorld
            proposals={draft.proposals}
            selectedProposal={selectedProposal}
            texture={texture}
            onTextureChange={setTexture}
            onSelectProposal={(proposalId) => setDraft((previous) => ({ ...previous, selectedProposalId: proposalId }))}
            onStory={downloadStory}
            storyBusy={storyBusy}
          />
        ) : null}

        {draft.step === 5 ? (
          <StepDelivery
            draft={draft}
            proposal={selectedProposal}
            email={draft.email}
            onEmailChange={(email) => setDraft((previous) => ({ ...previous, email }))}
            onCheckout={checkout}
            busyProduct={busyProduct}
            checkoutFeedback={checkoutFeedback}
            onStory={downloadStory}
            storyBusy={storyBusy}
            onAvatar={downloadAvatar}
            avatarBusy={avatarBusy}
            onLead={submitLead}
            leadBusy={leadBusy}
            leadFeedback={leadFeedback}
          />
        ) : null}
      </motion.div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-forge-line pt-6">
        <div>
          {draft.step > 1 ? (
            <button type="button" onClick={() => goToStep(draft.step - 1)} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Atrás
            </button>
          ) : (
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-forge-muted transition hover:text-forge-ivory">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Empezar de nuevo
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {draft.step === 1 ? (
            <button type="button" onClick={advanceFromProfile} className="btn-primary">
              Continuar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {draft.step === 2 ? (
            <button type="button" onClick={advanceFromInitials} className="btn-primary">
              Elegir estilo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {draft.step === 3 ? (
            <button
              type="button"
              onClick={() => goToStep(4)}
              disabled={!selectedProposal}
              className="btn-primary"
            >
              Ver en el visor
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {draft.step === 4 ? (
            <button type="button" onClick={() => goToStep(5)} disabled={!selectedProposal} className="btn-primary">
              Continuar a entrega
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : null}

          {draft.step === 5 ? (
            <button type="button" onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Forjar otro hierro
            </button>
          ) : null}
        </div>
      </div>

      {toast ? (
        <div role="status" className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-md items-start gap-3 border border-forge-bronze/60 bg-forge-surface p-4 text-sm text-forge-ivory shadow-2xl">
          <p className="flex-1">{toast}</p>
          <button type="button" onClick={() => setToast(null)} aria-label="Cerrar aviso" className="text-forge-muted transition hover:text-forge-ivory">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
