import type {
  CharacterType,
  ForgeProposal,
  ForgeStyle,
  PreviewTexture,
  ProfileType,
  RemateType,
} from "@/types/forge";

export type ForgeTexture = PreviewTexture;

export type DemoPackMode = "free" | "premium" | "similarity" | "forja";

export interface TextureOption {
  id: ForgeTexture;
  label: string;
  hint: string;
}

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

export const NOVILLERO_TEXTURE_OPTIONS: TextureOption[] = [
  { id: "capote", label: "Capote", hint: "Bordado en hilo de oro" },
  { id: "esporton", label: "Esportón de piel", hint: "Cuero y tafilete" },
  { id: "fundon", label: "Fundón de espadas", hint: "Piel y latón" },
  { id: "maleta", label: "Maleta del mozo", hint: "Grabado en piel" },
  { id: "avatar", label: "Avatar redes", hint: "Sello editorial 1:1" },
];

export const GANADERIA_TEXTURE_OPTIONS: TextureOption[] = [
  { id: "fragua", label: "Hierro en fragua", hint: "Forja y acero vivo" },
  { id: "montura", label: "Montura vaquera", hint: "Cuero quemado" },
  { id: "cancela", label: "Cancela de finca", hint: "Forja sobre albero" },
  { id: "polo", label: "Polo de campo", hint: "Bordado en pecho" },
];

export const TEXTURE_OPTIONS: TextureOption[] = GANADERIA_TEXTURE_OPTIONS;

export function getTextureOptionsForProfile(profile: ProfileType): TextureOption[] {
  if (profile === "novillero") return NOVILLERO_TEXTURE_OPTIONS;
  return GANADERIA_TEXTURE_OPTIONS;
}

export function defaultTextureForProfile(profile: ProfileType): ForgeTexture {
  return profile === "novillero" ? "capote" : "fragua";
}

export function previewUrlForTexture(basePreviewUrl: string, texture: ForgeTexture): string {
  const separator = basePreviewUrl.includes("?") ? "&" : "?";
  if (/[?&]t=[^&]+/.test(basePreviewUrl)) {
    return basePreviewUrl.replace(/([?&]t=)[^&]+/, `$1${texture}`);
  }
  return `${basePreviewUrl}${separator}t=${texture}`;
}
