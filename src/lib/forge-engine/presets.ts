import type {
  BrandBlueprint,
  CharacterType,
  ForgeStyle,
  InitialsCombination,
  OrnamentKey,
  ProfileType,
  RemateType,
  UserProfileInput,
} from "@/types/forge";

interface PresetVariant {
  layout: BrandBlueprint["layout"];
  frame: BrandBlueprint["frame"];
  ornament: OrnamentKey;
  rotationDeg: number;
}

interface StylePreset {
  fontFamily: BrandBlueprint["fontFamily"];
  variants: PresetVariant[];
  strokeBase: number;
}

const STYLE_PRESETS: Record<ForgeStyle, StylePreset> = {
  tradicional: {
    fontFamily: "cinzel",
    strokeBase: 9,
    variants: [
      { layout: "stacked", frame: "none", ornament: "none", rotationDeg: 0 },
      { layout: "interlocked", frame: "double-bar", ornament: "cross", rotationDeg: 0 },
      { layout: "stacked", frame: "arch", ornament: "cross", rotationDeg: 0 },
    ],
  },
  monograma: {
    fontFamily: "cormorant",
    strokeBase: 10,
    variants: [
      { layout: "interlocked", frame: "circle", ornament: "none", rotationDeg: 0 },
      { layout: "interlocked", frame: "none", ornament: "crown", rotationDeg: -4 },
      { layout: "stacked", frame: "arch", ornament: "star", rotationDeg: 0 },
    ],
  },
  geometrico: {
    fontFamily: "inter",
    strokeBase: 11,
    variants: [
      { layout: "stacked", frame: "arch", ornament: "none", rotationDeg: 0 },
      { layout: "interlocked", frame: "none", ornament: "star", rotationDeg: 0 },
      { layout: "stacked", frame: "double-bar", ornament: "none", rotationDeg: 0 },
    ],
  },
  heraldico: {
    fontFamily: "cinzel",
    strokeBase: 10,
    variants: [
      { layout: "shield", frame: "double-bar", ornament: "crown", rotationDeg: 0 },
      { layout: "interlocked", frame: "arch", ornament: "crown", rotationDeg: 0 },
      { layout: "stacked", frame: "circle", ornament: "shield", rotationDeg: 0 },
    ],
  },
};

const CHARACTER_STROKE: Record<CharacterType, number> = {
  sobrio: 0,
  senorial: 1,
  agresivo: 3,
  minimalista: -3,
};

export function ornamentForRemate(remate: RemateType): OrnamentKey {
  switch (remate) {
    case "cruz":
      return "cross";
    case "corona":
      return "crown";
    case "arco":
      return "arch";
    default:
      return "none";
  }
}

function loreFor(profile: ProfileType, style: ForgeStyle, origin: string, letters: string): string {
  const place = origin || "tu tierra";
  const base: Record<ProfileType, string> = {
    novillero: "Marca personal pensada para el capote, el polo y la puerta grande.",
    ganaderia: "Emblema de explotación con peso visual y lectura de hierro tradicional.",
    particular: "Sello de familia para la finca, el portón y la memoria del apellido.",
  };
  const styleText: Record<ForgeStyle, string> = {
    tradicional: "Trazos serif de inspiración histórica, soldados en una sola silueta.",
    monograma: "Iniciales fundidas en lectura continua, con remate noble.",
    geometrico: "Geometría limpia y simétrica, apta para forja y bordado.",
    heraldico: "Estructura de emblema con corona y proporción heráldica.",
  };
  return `${letters} · ${base[profile]} ${styleText[style]} Procedencia: ${place}.`;
}

export function resolveBlueprint(
  profile: UserProfileInput,
  combination: InitialsCombination,
  style: ForgeStyle,
  variantIndex: number,
): BrandBlueprint {
  const preset = STYLE_PRESETS[style];
  const variant = preset.variants[variantIndex % preset.variants.length];
  const remateOrnament = ornamentForRemate(profile.remate);
  const ornament = variant.ornament === "none" ? remateOrnament : variant.ornament;
  const characters: CharacterType = profile.character;
  const strokeWidth = Math.max(
    6,
    Math.min(16, preset.strokeBase + CHARACTER_STROKE[characters] + (variantIndex === 1 ? 1 : 0)),
  );

  return {
    combo: combination.label,
    style,
    fontFamily: preset.fontFamily,
    layout: variant.layout,
    frame: variant.frame,
    ornament,
    strokeWidth,
    rotationDeg: variant.rotationDeg,
    lore: loreFor(profile.profile, style, profile.origin, combination.letters.join("")),
  };
}

export function buildDeterministicBlueprints(
  profile: UserProfileInput,
  combination: InitialsCombination,
  style: ForgeStyle,
): BrandBlueprint[] {
  return [0, 1, 2].map((index) => resolveBlueprint(profile, combination, style, index));
}

export function explainBlueprint(blueprint: BrandBlueprint, profile: UserProfileInput): string {
  const layoutText: Record<BrandBlueprint["layout"], string> = {
    interlocked: "iniciales encajadas y soldadas en una sola pieza",
    stacked: "letras apiladas con eje vertical estable",
    shield: "composición cerrada de emblema",
    arc: "letras dispuestas sobre un arco suave",
  };
  const ornamentText: Record<OrnamentKey, string> = {
    none: "sin remate superior",
    cross: "remate de cruz forjada",
    crown: "corona de tres puntas",
    arch: "arco de herradura",
    shield: "perímetro de escudo",
    star: "estrella de cuatro puntas",
  };
  const audience: Record<ProfileType, string> = {
    novillero: "Se lee bien en capote y polo",
    ganaderia: "Aguanta escala de portón y hierro físico",
    particular: "Funciona como sello de familia",
  };
  return `${profile.firstName}, esta propuesta usa ${layoutText[blueprint.layout]} con ${ornamentText[blueprint.ornament]}. ${audience[profile.profile]}.`;
}

export function stylePresetLabel(style: ForgeStyle): string {
  const labels: Record<ForgeStyle, string> = {
    tradicional: "Tradicional",
    monograma: "Monograma",
    geometrico: "Geométrico",
    heraldico: "Heráldico",
  };
  return labels[style];
}
