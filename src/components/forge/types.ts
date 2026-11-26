import type {
  CharacterType,
  ForgeProposal,
  ForgeStyle,
  ProfileType,
  RemateType,
} from "@/types/forge";

export type ForgeTexture = "hierro" | "bordado" | "cuero";

export interface CheckoutFeedback {
  kind: "success" | "error";
  message: string;
  downloadUrl?: string;
}

export interface LeadFeedback {
  kind: "success" | "error";
  message: string;
}

export interface WizardDraft {
  step: number;
  profile: ProfileType;
  firstName: string;
  lastName1: string;
  lastName2: string;
  nickname: string;
  origin: string;
  character: CharacterType;
  remate: RemateType;
  combinationId: string | null;
  style: ForgeStyle;
  proposals: ForgeProposal[];
  selectedProposalId: string | null;
  email: string;
}

export function createDraft(profile: ProfileType): WizardDraft {
  return {
    step: 1,
    profile,
    firstName: "",
    lastName1: "",
    lastName2: "",
    nickname: "",
    origin: "",
    character: "sobrio",
    remate: "sin-remate",
    combinationId: null,
    style: "tradicional",
    proposals: [],
    selectedProposalId: null,
    email: "",
  };
}

export const STEP_LABELS = ["Datos", "Iniciales", "Estilo", "Visor", "Entrega"] as const;

export const TEXTURE_OPTIONS: Array<{ id: ForgeTexture; label: string; hint: string }> = [
  { id: "hierro", label: "Hierro forjado", hint: "Negro carbón y bronce" },
  { id: "bordado", label: "Bordado", hint: "Capote y polo" },
  { id: "cuero", label: "Cuero quemado", hint: "Grabado y madera" },
];
