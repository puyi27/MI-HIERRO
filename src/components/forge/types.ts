import type {
  CharacterType,
  ForgeProposal,
  ForgeStyle,
  ProfileType,
  RemateType,
} from "@/types/forge";

export type ForgeTexture = "hierro" | "bordado" | "cuero";

export interface DivisaOption {
  id: string;
  label: string;
  colors: [string, string];
}

export const DIVISA_OPTIONS: DivisaOption[] = [
  { id: "encarnada-blanca", label: "Encarnada y blanca", colors: ["#6B141E", "#F7F3EA"] },
  { id: "azul-encarnada", label: "Azul y encarnada", colors: ["#1B365D", "#6B141E"] },
  { id: "verde-grana", label: "Verde y grana", colors: ["#2E4433", "#6B141E"] },
  { id: "gualda-negra", label: "Gualda y negra", colors: ["#B8832E", "#161412"] },
  { id: "morada-cana", label: "Morada y caña", colors: ["#4E234B", "#CBB98A"] },
  { id: "celeste-blanca", label: "Celeste y blanca", colors: ["#5B89B5", "#F7F3EA"] },
];

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
  divisaId: string;
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
    divisaId: DIVISA_OPTIONS[0].id,
    proposals: [],
    selectedProposalId: null,
    email: "",
  };
}

export const STEP_LABELS = ["Perfil", "Iniciales", "Estilo", "Visor", "Entrega"] as const;

export const TEXTURE_OPTIONS: Array<{ id: ForgeTexture; label: string; hint: string }> = [
  { id: "hierro", label: "Hierro forjado", hint: "Acero y bronce" },
  { id: "bordado", label: "Bordado en avíos", hint: "Capote y esportón" },
  { id: "cuero", label: "Cuero quemado", hint: "Vaquetilla y cuño" },
];
