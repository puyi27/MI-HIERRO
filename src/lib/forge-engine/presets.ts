import type {
  ArchitectureKey,
  BrandBlueprint,
  CharacterType,
  ForgeStyle,
  InitialsCombination,
  OrnamentKey,
  OrnamentV2Key,
  ProfileType,
  RemateType,
  TerminalStyleKey,
  UserProfileInput,
} from "@/types/forge";
import { getLetterSkeleton } from "@/lib/forge-engine/skeletons";

interface PresetVariant {
  layout: BrandBlueprint["layout"];
  frame: BrandBlueprint["frame"];
  ornament: OrnamentKey;
  architecture: ArchitectureKey;
  terminalStyle: TerminalStyleKey;
  ornamentV2: OrnamentV2Key;
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
      { layout: "stacked", frame: "none", ornament: "none", architecture: "shared_stem", terminalStyle: "forged_spur", ornamentV2: "cruz_forja", rotationDeg: 0 },
      { layout: "interlocked", frame: "none", ornament: "cross", architecture: "cauldron_handle", terminalStyle: "flared_serif", ornamentV2: "cruz_forja", rotationDeg: 0 },
      { layout: "arc", frame: "none", ornament: "arch", architecture: "integrated_arch", terminalStyle: "chisel_bevel", ornamentV2: "horquilla", rotationDeg: 0 },
    ],
  },
  monograma: {
    fontFamily: "cormorant",
    strokeBase: 10,
    variants: [
      { layout: "interlocked", frame: "circle", ornament: "none", architecture: "interlock_knockout", terminalStyle: "teardrop", ornamentV2: "none", rotationDeg: 0 },
      { layout: "interlocked", frame: "none", ornament: "crown", architecture: "nested_cavity", terminalStyle: "flared_serif", ornamentV2: "corona_abierta", rotationDeg: -2 },
      { layout: "stacked", frame: "none", ornament: "star", architecture: "mirrored_crest", terminalStyle: "forged_spur", ornamentV2: "horquilla", rotationDeg: 0 },
    ],
  },
  geometrico: {
    fontFamily: "inter",
    strokeBase: 10,
    variants: [
      { layout: "stacked", frame: "none", ornament: "none", architecture: "integrated_arch", terminalStyle: "clean_bar", ornamentV2: "none", rotationDeg: 0 },
      { layout: "interlocked", frame: "none", ornament: "star", architecture: "shared_stem", terminalStyle: "chisel_bevel", ornamentV2: "horquilla", rotationDeg: 0 },
      { layout: "stacked", frame: "none", ornament: "none", architecture: "interlock_knockout", terminalStyle: "clean_bar", ornamentV2: "none", rotationDeg: 0 },
    ],
  },
  heraldico: {
    fontFamily: "cinzel",
    strokeBase: 9,
    variants: [
      { layout: "shield", frame: "none", ornament: "crown", architecture: "mirrored_crest", terminalStyle: "flared_serif", ornamentV2: "corona_abierta", rotationDeg: 0 },
      { layout: "interlocked", frame: "none", ornament: "crown", architecture: "cauldron_handle", terminalStyle: "forged_spur", ornamentV2: "corona_abierta", rotationDeg: 0 },
      { layout: "stacked", frame: "circle", ornament: "shield", architecture: "nested_cavity", terminalStyle: "chisel_bevel", ornamentV2: "bocado_pre", rotationDeg: 0 },
    ],
  },
};

const CHARACTER_STROKE: Record<CharacterType, number> = {
  sobrio: 0,
  senorial: 1,
  agresivo: 2,
  minimalista: -2,
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

export function ornamentV2ForRemate(remate: RemateType): OrnamentV2Key {
  switch (remate) {
    case "cruz":
      return "cruz_forja";
    case "corona":
      return "corona_abierta";
    case "arco":
      return "arco_portico";
    default:
      return "none";
  }
}

function selectArchitectureForLetters(
  preferred: ArchitectureKey,
  combination: InitialsCombination,
  variantIndex: number,
): ArchitectureKey {
  const letters = combination.letters.length > 0 ? combination.letters : [combination.primary];
  const firstSk = getLetterSkeleton(letters[0]);
  const pool: ArchitectureKey[] = [
    preferred,
    firstSk.hasInnerCavity ? "nested_cavity" : "shared_stem",
    "interlock_knockout",
    "cauldron_handle",
    "integrated_arch",
    "mirrored_crest",
  ];
  const unique = [...new Set(pool)];
  return unique[variantIndex % unique.length] ?? preferred;
}

function loreFor(profile: ProfileType, style: ForgeStyle, origin: string, letters: string): string {
  const place = origin || "tu tierra";
  const base: Record<ProfileType, string> = {
    novillero: "Marca personal pensada para el capote, el polo y la puerta grande.",
    ganaderia: "Emblema de explotación con peso visual y lectura de hierro tradicional.",
    particular: "Sello de familia para la finca, el portón y la memoria del apellido.",
  };
  const styleText: Record<ForgeStyle, string> = {
    tradicional: "Pletinas forjadas con remates clásicos, soldadas en una sola silueta.",
    monograma: "Iniciales fundidas en lectura continua, con paso de luz limpio.",
    geometrico: "Geometría limpia y simétrica, apta para forja y bordado.",
    heraldico: "Estructura de emblema con corona abierta y proporción heráldica.",
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
  const remateV2 = ornamentV2ForRemate(profile.remate);
  const ornament = variant.ornament === "none" ? remateOrnament : variant.ornament;
  const ornamentV2 = variant.ornamentV2 === "none" ? remateV2 : variant.ornamentV2;
  const architecture = selectArchitectureForLetters(variant.architecture, combination, variantIndex);
  const strokeWidth = Math.max(
    6,
    Math.min(16, preset.strokeBase + CHARACTER_STROKE[profile.character] + (variantIndex === 1 ? 1 : 0)),
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
    architecture,
    glyphSource: "skeleton",
    terminalStyle: variant.terminalStyle,
    ornamentConfig: {
      type: ornamentV2,
      anchor: ornamentV2 === "asa_caldera" ? "rightStem" : "topApex",
      welded: true,
    },
    breathingGaps: true,
  };
}

export function buildDeterministicBlueprints(
  profile: UserProfileInput,
  combination: InitialsCombination,
  style: ForgeStyle,
): BrandBlueprint[] {
  const raw = [0, 1, 2].map((index) => resolveBlueprint(profile, combination, style, index));
  const usedArch = new Set<string>();
  const allArchs: ArchitectureKey[] = [
    "shared_stem",
    "cauldron_handle",
    "integrated_arch",
    "interlock_knockout",
    "nested_cavity",
    "mirrored_crest",
  ];

  return raw.map((bp) => {
    let arch = bp.architecture!;
    if (usedArch.has(arch)) {
      arch = allArchs.find((candidate) => !usedArch.has(candidate)) ?? arch;
    }
    usedArch.add(arch);
    return { ...bp, architecture: arch };
  });
}

export function explainBlueprint(blueprint: BrandBlueprint, profile: UserProfileInput): string {
  const archText: Record<ArchitectureKey, string> = {
    shared_stem: "iniciales unidas por asta vertical compartida",
    mirrored_crest: "composición en espejo sobre eje central",
    nested_cavity: "inicial secundaria inscrita en el seno principal",
    interlock_knockout: "entrelazado con paso de luz para evitar borrón",
    integrated_arch: "pórtico continuo soldado a los vástagos",
    cauldron_handle: "asa de caldera soldada al flanco derecho",
  };
  const layoutText: Record<BrandBlueprint["layout"], string> = {
    interlocked: "iniciales encajadas y soldadas en una sola pieza",
    stacked: "letras apiladas con eje vertical estable",
    shield: "composición cerrada de emblema",
    arc: "letras dispuestas sobre un arco suave",
  };
  const ornamentText: Record<OrnamentKey, string> = {
    none: "sin remate superior",
    cross: "con remate de cruz forjada",
    crown: "con corona abierta de tres puntas",
    arch: "con arco de herradura",
    shield: "con perímetro de escudo",
    star: "con estrella de cuatro puntas",
  };
  const audience: Record<ProfileType, string> = {
    novillero: "Se lee bien en capote y polo",
    ganaderia: "Aguanta escala de portón y hierro físico",
    particular: "Funciona como sello de familia",
  };
  const structureDesc = blueprint.architecture
    ? archText[blueprint.architecture]
    : layoutText[blueprint.layout];
  return `${profile.firstName}, esta propuesta usa ${structureDesc} ${ornamentText[blueprint.ornament]}. ${audience[profile.profile]}.`;
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
