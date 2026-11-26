import { z } from "zod";

export const PROFILE_TYPES = ["novillero", "ganaderia", "particular"] as const;
export const STYLE_TYPES = ["tradicional", "monograma", "geometrico", "heraldico"] as const;
export const CHARACTER_TYPES = ["sobrio", "senorial", "agresivo", "minimalista"] as const;
export const REMATE_TYPES = ["cruz", "corona", "arco", "sin-remate"] as const;
export const FONT_FAMILIES = ["cinzel", "cormorant", "inter"] as const;
export const LAYOUTS = ["interlocked", "stacked", "shield", "arc"] as const;
export const FRAMES = ["none", "circle", "arch", "double-bar"] as const;
export const ORNAMENTS = ["none", "cross", "crown", "arch", "shield", "star"] as const;

export type ProfileType = (typeof PROFILE_TYPES)[number];
export type ForgeStyle = (typeof STYLE_TYPES)[number];
export type CharacterType = (typeof CHARACTER_TYPES)[number];
export type RemateType = (typeof REMATE_TYPES)[number];
export type FontFamilyKey = (typeof FONT_FAMILIES)[number];
export type LayoutKey = (typeof LAYOUTS)[number];
export type FrameKey = (typeof FRAMES)[number];
export type OrnamentKey = (typeof ORNAMENTS)[number];

export const PROFILE_META: Record<ProfileType, { label: string; short: string; description: string }> = {
  novillero: {
    label: "Novillero / Torero",
    short: "Novillero",
    description: "Marca personal de figura del toreo: iniciales claras, remate noble y lectura inmediata en capote y polo.",
  },
  ganaderia: {
    label: "Ganadería / Yeguada",
    short: "Ganadería",
    description: "Hierro de explotación: peso visual, simetría heráldica y presencia sobre la puerta de la finca.",
  },
  particular: {
    label: "Finca / Particular",
    short: "Particular",
    description: "Emblema de familia para finca, portón o cuadra: sobriedad, monograma y memoria del apellido.",
  },
};

export const STYLE_META: Record<ForgeStyle, { label: string; tagline: string; description: string }> = {
  tradicional: {
    label: "Tradicional",
    tagline: "Clásico · Sobrio · Atemporal",
    description: "Formas sobrias y reconocibles, inspiradas en la estética histórica de la ganadería.",
  },
  monograma: {
    label: "Monograma",
    tagline: "Iniciales · Elegancia · Personalidad",
    description: "Tus iniciales fundidas en una sola marca, con lectura continua.",
  },
  geometrico: {
    label: "Geométrico",
    tagline: "Limpio · Equilibrado · Moderno",
    description: "Trazos simples y simétricos, fáciles de reproducir en forja y bordado.",
  },
  heraldico: {
    label: "Heráldico",
    tagline: "Distinción · Tradición · Legado",
    description: "Composición con estructura de emblema, sin confundirse con escudos oficiales.",
  },
};

export const CHARACTER_META: Record<CharacterType, string> = {
  sobrio: "Sobrio",
  senorial: "Señorial",
  agresivo: "Agresivo",
  minimalista: "Minimalista",
};

export const REMATE_META: Record<RemateType, string> = {
  cruz: "Cruz",
  corona: "Corona",
  arco: "Arco",
  "sin-remate": "Sin remate",
};

const NAME_REGEX = /^[\p{L}][\p{L}\p{M}'\u2019\-.\s]{1,39}$/u;
const NICKNAME_REGEX = /^[\p{L}][\p{L}\p{M}'\u2019\-.\s]{0,29}$/u;
const ORIGIN_REGEX = /^[\p{L}][\p{L}\p{M}'\u2019\-.,\s]{1,59}$/u;

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} debe tener al menos 2 caracteres`)
    .max(40, `${label} no puede superar 40 caracteres`)
    .regex(NAME_REGEX, `${label} solo admite letras, espacios, guiones y apóstrofes`)
    .refine((value) => !/\s{2,}/.test(value), `${label} no admite espacios dobles`);

export const userProfileSchema = z.object({
  profile: z.enum(PROFILE_TYPES),
  firstName: nameField("El nombre"),
  lastName1: nameField("El primer apellido"),
  lastName2: z
    .union([nameField("El segundo apellido"), z.literal("")])
    .optional()
    .transform((value) => value ?? ""),
  nickname: z
    .union([
      z
        .string()
        .trim()
        .min(2, "El apodo debe tener al menos 2 caracteres")
        .max(30, "El apodo no puede superar 30 caracteres")
        .regex(NICKNAME_REGEX, "El apodo solo admite letras, espacios, guiones y apóstrofes"),
      z.literal(""),
    ])
    .optional()
    .transform((value) => value ?? ""),
  origin: z
    .union([
      z
        .string()
        .trim()
        .min(2, "La procedencia debe tener al menos 2 caracteres")
        .max(60, "La procedencia no puede superar 60 caracteres")
        .regex(ORIGIN_REGEX, "La procedencia solo admite letras, comas, puntos y guiones"),
      z.literal(""),
    ])
    .optional()
    .transform((value) => value ?? ""),
  character: z.enum(CHARACTER_TYPES),
  remate: z.enum(REMATE_TYPES),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

export const initialsCombinationSchema = z.object({
  id: z.string().min(1).max(40),
  letters: z.array(z.string().min(1).max(2)).min(1).max(3),
  label: z.string().min(1).max(12),
  kind: z.enum(["dos", "tres", "monograma"]),
  primary: z.string().min(1).max(2),
  secondary: z.string().max(2).optional(),
});

export type InitialsCombination = z.infer<typeof initialsCombinationSchema>;

export const scoreSchema = z.object({
  legibility: z.number().int().min(0).max(100),
  balance: z.number().int().min(0).max(100),
  forgeability: z.number().int().min(0).max(100),
});

export type DesignScores = z.infer<typeof scoreSchema>;

export const brandBlueprintSchema = z.object({
  combo: z.string().min(1).max(6),
  style: z.enum(STYLE_TYPES),
  fontFamily: z.enum(FONT_FAMILIES),
  layout: z.enum(LAYOUTS),
  frame: z.enum(FRAMES),
  ornament: z.enum(ORNAMENTS),
  strokeWidth: z.number().min(6).max(16),
  rotationDeg: z.number().min(-10).max(10),
  lore: z.string().min(10).max(280),
});

export type BrandBlueprint = z.infer<typeof brandBlueprintSchema>;

export const proposalSchema = z
  .object({
    id: z.string().min(1),
    blueprint: brandBlueprintSchema,
    previewUrl: z.string().startsWith("/api/preview"),
    scores: scoreSchema,
    explanation: z.string().min(10).max(400),
  })
  .strict();

export type ForgeProposal = z.infer<typeof proposalSchema>;

export const generateRequestSchema = z.object({
  profile: userProfileSchema,
  initials: initialsCombinationSchema,
  style: z.enum(STYLE_TYPES),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generateResponseSchema = z
  .object({
    designId: z.string().min(1),
    tier: z.literal("free"),
    proposals: z.array(proposalSchema).min(1).max(3),
    remainingToday: z.number().int().min(0),
  })
  .strict();

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

export const previewQuerySchema = z.object({
  d: z.string().min(1).max(64),
  v: z.coerce.number().int().min(0).max(2).default(0),
  t: z.enum(["hierro", "bordado", "cuero"]).default("hierro"),
  f: z.enum(["png", "webp"]).default("png"),
});

export type PreviewQuery = z.infer<typeof previewQuerySchema>;

export const storyRequestSchema = z.object({
  designId: z.string().min(1).max(64),
  variant: z.enum(["hierro", "bordado", "cuero"]).default("hierro"),
  format: z.enum(["story", "avatar"]).default("story"),
});

export type StoryRequest = z.infer<typeof storyRequestSchema>;

export const checkoutRequestSchema = z.object({
  product: z.enum(["premium", "similarity"]),
  designId: z.string().min(1).max(64),
  email: z.email("Introduce un email válido"),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const checkoutResponseSchema = z.object({
  mode: z.enum(["stripe", "simulation"]),
  orderId: z.string().min(1),
  url: z.string().optional(),
  downloadUrl: z.string().optional(),
  message: z.string().min(1),
});

export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;

export const leadRequestSchema = z.object({
  type: z.enum(["revision", "forja"]),
  name: nameField("El nombre"),
  email: z.email("Introduce un email válido"),
  phone: z
    .union([
      z
        .string()
        .trim()
        .min(6, "El teléfono debe tener al menos 6 caracteres")
        .max(24, "El teléfono no puede superar 24 caracteres")
        .regex(/^[+0-9\s().-]+$/, "El teléfono solo admite números y signos de marcado"),
      z.literal(""),
    ])
    .optional()
    .transform((value) => value ?? ""),
  message: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
    .max(1200, "El mensaje no puede superar 1200 caracteres"),
  budget: z.enum(["49-99", "forja"]).optional(),
  designId: z.string().min(1).max(64).optional(),
});

export type LeadRequest = z.infer<typeof leadRequestSchema>;

export const leadResponseSchema = z.object({
  ok: z.literal(true),
  leadId: z.string().min(1),
  message: z.string().min(1),
});

export const downloadTokenPayloadSchema = z.object({
  d: z.string().min(1),
  o: z.string().min(1),
  p: z.enum(["premium", "similarity"]),
  x: z.number().int().positive(),
});

export type DownloadTokenPayload = z.infer<typeof downloadTokenPayloadSchema>;

export const similarityRequestSchema = z.object({
  designId: z.string().min(1).max(64),
  email: z.email("Introduce un email válido"),
  name: z
    .union([nameField("El nombre"), z.literal("")])
    .optional()
    .transform((value) => value ?? ""),
  notes: z.string().trim().max(600).optional(),
});

export type SimilarityRequest = z.infer<typeof similarityRequestSchema>;
