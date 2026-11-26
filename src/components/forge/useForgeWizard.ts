"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  generateResponseSchema,
  userProfileSchema,
  type ForgeProposal,
  type InitialsCombination,
  type LeadRequest,
  type ProfileType,
} from "@/types/forge";
import { buildInitialCombinations } from "@/lib/forge-engine/initials";
import {
  createDraft,
  type CheckoutFeedback,
  type ForgeTexture,
  type LeadFeedback,
  type WizardDraft,
} from "@/components/forge/types";

const STORAGE_KEY = "mi-hierro-forge-v1";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const RESETTING_KEYS: Array<keyof WizardDraft> = [
  "firstName",
  "lastName1",
  "lastName2",
  "nickname",
  "origin",
  "character",
  "remate",
  "combinationId",
  "style",
  "profile",
];

interface UseForgeWizardOptions {
  initialProfile: ProfileType;
  canceled?: boolean;
}

export function useForgeWizard({ initialProfile, canceled = false }: UseForgeWizardOptions) {
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
      nickname: draft.nickname,
      origin: draft.origin,
      character: draft.character,
      remate: draft.remate,
    }),
    [
      draft.profile,
      draft.firstName,
      draft.lastName1,
      draft.lastName2,
      draft.nickname,
      draft.origin,
      draft.character,
      draft.remate,
    ],
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

  const goToStep = useCallback((step: number) => {
    setDraft((previous) => ({ ...previous, step }));
  }, []);

  const selectProposal = useCallback((proposalId: string) => {
    setDraft((previous) => ({ ...previous, selectedProposalId: proposalId }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setDraft((previous) => ({ ...previous, email }));
  }, []);

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
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "No se pudo forjar. Inténtalo de nuevo.";
        setGenerateError(message);
        toast.error(message);
        return;
      }

      const parsed = generateResponseSchema.safeParse(data);
      if (!parsed.success) {
        setGenerateError("La respuesta de la fragua no era válida. Reinténtalo.");
        toast.error("La fragua devolvió una respuesta inesperada.");
        return;
      }

      setDraft((previous) => ({
        ...previous,
        proposals: parsed.data.proposals,
        selectedProposalId: parsed.data.proposals[0].id,
        combinationId: selectedCombination.id,
      }));
      toast.success(`${parsed.data.proposals.length} propuestas forjadas para ${selectedCombination.label}.`);
    } catch {
      setGenerateError("No hay conexión con la fragua. Comprueba tu red e inténtalo otra vez.");
      toast.error("No hay conexión con la fragua.");
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
        toast.error(
          format === "avatar"
            ? "No se pudo preparar el avatar. Inténtalo de nuevo."
            : "No se pudo preparar la Story. Inténtalo de nuevo.",
        );
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
      toast.success(
        format === "avatar"
          ? "Avatar 1:1 descargado. Ya puedes usarlo en tus redes."
          : "Story 9:16 descargada. Compártela con #MiHierro.",
      );
    } catch {
      toast.error("No se pudo descargar la pieza.");
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
      toast.error("Introduce un email válido para la entrega.");
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
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "No se pudo iniciar el pago.";
        setCheckoutFeedback({ kind: "error", message });
        toast.error(message);
        return;
      }

      if (data && typeof data === "object" && "mode" in data && data.mode === "stripe" && "url" in data && typeof data.url === "string") {
        window.location.assign(data.url);
        return;
      }

      if (data && typeof data === "object" && "message" in data) {
        const message = String(data.message);
        setCheckoutFeedback({
          kind: "success",
          message,
          downloadUrl:
            "downloadUrl" in data && typeof data.downloadUrl === "string" ? data.downloadUrl : undefined,
        });
        toast.success(message);
      }
    } catch {
      setCheckoutFeedback({ kind: "error", message: "Error de conexión con la pasarela de pago." });
      toast.error("Error de conexión con la pasarela de pago.");
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
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "No se pudo enviar la solicitud.";
        setLeadFeedback({ kind: "error", message });
        toast.error(message);
        return;
      }
      const message =
        data && typeof data === "object" && "message" in data ? String(data.message) : "Solicitud recibida.";
      setLeadFeedback({ kind: "success", message });
      toast.success(message);
    } catch {
      setLeadFeedback({ kind: "error", message: "No hay conexión. Inténtalo de nuevo." });
      toast.error("No hay conexión. Inténtalo de nuevo.");
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

  return {
    draft,
    errors,
    generating,
    generateError,
    texture,
    setTexture,
    storyBusy,
    avatarBusy,
    busyProduct,
    checkoutFeedback,
    leadBusy,
    leadFeedback,
    combinations,
    selectedCombination,
    selectedProposal,
    update,
    goToStep,
    selectProposal,
    setEmail,
    advanceFromProfile,
    advanceFromInitials,
    generate,
    downloadStory,
    downloadAvatar,
    checkout,
    submitLead,
    reset,
  };
}

export type ForgeWizardController = ReturnType<typeof useForgeWizard>;
