"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  generateResponseSchema,
  remateForStyle,
  userProfileSchema,
  type ForgeProposal,
  type InitialsCombination,
  type LeadRequest,
  type ProfileType,
} from "@/types/forge";
import { buildInitialCombinations } from "@/lib/forge-engine/initials";
import {
  createDraft,
  defaultTextureForProfile,
  type CheckoutFeedback,
  type DemoPackMode,
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

export interface ForgeSessionInfo {
  userId: string;
  activePack: "FREE" | "PACK_999" | "PACK_1990" | "FORJA";
  creditsLimit: number;
  creditsUsed: number;
  creditsRemaining: number | null;
  unlimited: boolean;
}

export function useForgeWizard({ initialProfile, canceled = false }: UseForgeWizardOptions) {
  const [draft, setDraft] = useState<WizardDraft>(() => createDraft(initialProfile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateRateLimited, setGenerateRateLimited] = useState(false);
  const [remainingToday, setRemainingToday] = useState<number | null>(null);
  const [session, setSession] = useState<ForgeSessionInfo | null>(null);
  const [savedProposals, setSavedProposals] = useState<ForgeProposal[]>([]);
  const [texture, setTexture] = useState<ForgeTexture>(() => defaultTextureForProfile(initialProfile));
  const [demoMode, setDemoMode] = useState<DemoPackMode>("free");
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

  const previousProfileRef = useRef<ProfileType>(initialProfile);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/session", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { user?: ForgeSessionInfo };
      if (data.user) setSession(data.user);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (previousProfileRef.current !== initialProfile) {
      previousProfileRef.current = initialProfile;
      setDraft(createDraft(initialProfile));
      setErrors({});
      setGenerateError(null);
      setGenerateRateLimited(false);
      setCheckoutFeedback(null);
      setLeadFeedback(null);
      setTexture(defaultTextureForProfile(initialProfile));
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        return;
      }
      setHydrated(true);
      return;
    }

    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<WizardDraft>;
        if (parsed && parsed.profile && parsed.profile !== initialProfile) {
          window.sessionStorage.removeItem(STORAGE_KEY);
          setDraft(createDraft(initialProfile));
          setTexture(defaultTextureForProfile(initialProfile));
        } else if (parsed && typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 5) {
          const restored = { ...createDraft(initialProfile), ...parsed };
          restored.remate = remateForStyle(restored.style, restored.remate);
          setDraft(restored);
          if (restored.proposals.length > 0) {
            setSavedProposals(restored.proposals);
          }
          setTexture(defaultTextureForProfile(restored.profile));
        }
      }
    } catch {
      setDraft(createDraft(initialProfile));
      setTexture(defaultTextureForProfile(initialProfile));
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
      if (previous.proposals.length > 0) {
        setSavedProposals(previous.proposals);
      }
      const next = { ...previous, ...patch };
      if (patch.style) {
        next.remate = remateForStyle(patch.style, next.remate);
      }

      if ("profile" in patch && patch.profile !== previous.profile) {
        const fresh = createDraft(patch.profile!);
        fresh.step = previous.step;
        setTexture(defaultTextureForProfile(patch.profile!));
        return fresh;
      }

      const touchesIdentity = Object.keys(patch).some((key) => RESETTING_KEYS.includes(key as keyof WizardDraft));
      if (touchesIdentity) {
        next.proposals = [];
        next.selectedProposalId = null;
      }
      return next;
    });
    setGenerateError(null);
    setGenerateRateLimited(false);
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

  const restoreSavedProposals = useCallback(() => {
    if (savedProposals.length === 0) return;
    setDraft((previous) => ({
      ...previous,
      proposals: savedProposals,
      selectedProposalId: savedProposals[0].id,
    }));
    setGenerateError(null);
    setGenerateRateLimited(false);
    toast.success("Láminas guardadas recuperadas.");
  }, [savedProposals]);

  const selectDemoMode = useCallback(
    (mode: DemoPackMode) => {
      setDemoMode(mode);
      if (mode === "similarity" || mode === "forja") {
        setDraft((previous) => ({ ...previous, step: 5 }));
      }
    },
    [],
  );

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
      setGenerateRateLimited(false);
      return;
    }
    const parsedProfile = userProfileSchema.safeParse(profilePayload);
    if (!parsedProfile.success) {
      setGenerateError("Revisa tus datos antes de forjar.");
      setGenerateRateLimited(false);
      goToStep(1);
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setGenerateRateLimited(false);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: parsedProfile.data,
          initials: selectedCombination,
          style: draft.style,
          notes: draft.notes.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const isLimited = response.status === 429;
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : isLimited
              ? "Has alcanzado el cupo diario de láminas gratuitas con IA."
              : "No se pudo forjar. Inténtalo de nuevo.";
        setGenerateError(message);
        setGenerateRateLimited(isLimited);
        if (isLimited) setRemainingToday(0);
        void refreshSession();
        toast.error(message);
        return;
      }

      const parsed = generateResponseSchema.safeParse(data);
      if (!parsed.success) {
        setGenerateError("La respuesta de la fragua no era válida. Reinténtalo.");
        setGenerateRateLimited(false);
        toast.error("La fragua devolvió una respuesta inesperada.");
        return;
      }

      setRemainingToday(parsed.data.remainingToday);
      void refreshSession();
      setSavedProposals(parsed.data.proposals);
      setDraft((previous) => ({
        ...previous,
        proposals: parsed.data.proposals,
        selectedProposalId: parsed.data.proposals[0].id,
        combinationId: selectedCombination.id,
      }));
      toast.success(`${parsed.data.proposals.length} propuestas forjadas para ${selectedCombination.label}.`);
    } catch {
      setGenerateError("No hay conexión con la fragua. Comprueba tu red e inténtalo otra vez.");
      setGenerateRateLimited(false);
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
    const resolvedEmail = draft.email.trim() || (demoMode !== "free" ? "demo@mihierro.es" : "");
    if (!EMAIL_PATTERN.test(resolvedEmail)) {
      setCheckoutFeedback({ kind: "error", message: "Introduce un email válido para enviarte la entrega." });
      toast.error("Introduce un email válido para la entrega.");
      return;
    }

    if (!draft.email.trim() && resolvedEmail) {
      setEmail(resolvedEmail);
    }

    setBusyProduct(product);
    setCheckoutFeedback(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, designId: selectedProposal.id, email: resolvedEmail }),
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

  const reset = useCallback(() => {
    setDraft(createDraft(initialProfile));
    setErrors({});
    setGenerateError(null);
    setGenerateRateLimited(false);
    setCheckoutFeedback(null);
    setLeadFeedback(null);
    setTexture(defaultTextureForProfile(initialProfile));
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  }, [initialProfile]);

  return {
    draft,
    errors,
    generating,
    generateError,
    generateRateLimited,
    remainingToday,
    session,
    refreshSession,
    hasSavedProposals: savedProposals.length > 0 && draft.proposals.length === 0,
    texture,
    setTexture,
    demoMode,
    selectDemoMode,
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
    restoreSavedProposals,
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
