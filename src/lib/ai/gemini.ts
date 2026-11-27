import { GoogleGenAI } from "@google/genai";
import {
  ARCHITECTURES,
  CHARACTER_TYPES,
  REMATE_TYPES,
  brandBlueprintSchema,
  type BrandBlueprint,
  type ForgeStyle,
  type GenerateRequest,
  type InitialsCombination,
  type ProfileType,
  type UseCaseKey,
  type UserProfileInput,
} from "@/types/forge";
import { buildDeterministicBlueprints, explainBlueprint } from "@/lib/forge-engine/presets";

export interface BlueprintBatch {
  blueprints: BrandBlueprint[];
  explanations: string[];
  source: "gemini" | "deterministic";
}

const SYSTEM_PROMPT = `Eres el maestro forjador de MI HIERRO, especialista en heráldica ganadera española, marcas de novilleros y hierros de yeguadas PRE.
Analiza la anatomía real de las letras proporcionadas (astas verticales, senos abiertos como C/G/O/U, vértices como A/V/M) y devuelve exactamente tres propuestas en JSON con la forma {"proposals":[{"blueprint":{...},"explanation":"..."}]}.
REGLA OBLIGATORIA: Las 3 propuestas deben tener valores de "architecture" DISTINTOS entre sí.
Cada blueprint respeta este contrato:
- combo (iniciales)
- style (tradicional|monograma|geometrico|heraldico)
- fontFamily (cinzel|cormorant|inter)
- layout (interlocked|stacked|shield|arc)
- frame (none|circle|arch|double-bar)
- ornament (none|cross|crown|arch|shield|star)
- strokeWidth (6-16)
- rotationDeg (-8 a 8)
- lore (frase de 20 a 240 caracteres)
- architecture (shared_stem|mirrored_crest|nested_cavity|interlock_knockout|integrated_arch|cauldron_handle)
- glyphSource ("skeleton")
- terminalStyle (forged_spur|flared_serif|chisel_bevel|teardrop|clean_bar)
- ornamentConfig: {"type": "none|corona_abierta|cruz_forja|asa_caldera|arco_portico|bocado_pre|herradura_limpia|horquilla|doble_barra", "anchor": "topApex|leftStem|rightStem|innerCavity|baseFoot|center", "welded": true}
- breathingGaps: true
FÍSICA DE FORJA INNEGOCIABLE: toda propuesta es un hierro ganadero español doblado de una sola pletina plana de hierro de grosor uniforme, con todas las piezas soldadas en un único troquel macizo.
Nunca propongas joyas, coronas de orfebrería con puntas flotantes, escudos de lujo, tipografía serif elegante ni piezas desconectadas.
La explicación debe ser una frase breve en español, personalizada con el nombre y la procedencia, distinta en cada propuesta, y nunca prometer registro ni exclusividad.`;

function fallbackBatch(input: GenerateRequest): BlueprintBatch {
  const blueprints = buildDeterministicBlueprints(input.profile, input.initials, input.style);
  return {
    blueprints,
    explanations: blueprints.map((blueprint) => explainBlueprint(blueprint, input.profile)),
    source: "deterministic",
  };
}

function coerceProposals(raw: unknown): { blueprint: BrandBlueprint; explanation: string }[] {
  if (!raw || typeof raw !== "object") return [];
  const proposals = (raw as { proposals?: unknown }).proposals;
  if (!Array.isArray(proposals)) return [];
  const parsed: { blueprint: BrandBlueprint; explanation: string }[] = [];
  for (const item of proposals) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as { blueprint?: unknown; explanation?: unknown };
    const blueprint = brandBlueprintSchema.safeParse(candidate.blueprint);
    if (!blueprint.success) continue;
    const explanation = typeof candidate.explanation === "string" ? candidate.explanation.slice(0, 400) : "";
    parsed.push({ blueprint: blueprint.data, explanation });
  }
  return parsed;
}

function ensureDistinctArchitectures(blueprints: BrandBlueprint[]): BrandBlueprint[] {
  const used = new Set<string>();
  return blueprints.map((bp) => {
    let arch = bp.architecture ?? "shared_stem";
    if (used.has(arch)) {
      arch = ARCHITECTURES.find((candidate) => !used.has(candidate)) ?? arch;
    }
    used.add(arch);
    return {
      ...bp,
      architecture: arch,
      glyphSource: bp.glyphSource ?? "skeleton",
      terminalStyle: bp.terminalStyle ?? "forged_spur",
      breathingGaps: bp.breathingGaps ?? true,
    };
  });
}

export async function generateBlueprints(input: GenerateRequest): Promise<BlueprintBatch> {
  const fallback = fallbackBatch(input);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  try {
    const client = new GoogleGenAI({ apiKey });
    const profile = input.profile;
    const prompt = `${SYSTEM_PROMPT}

Perfil: ${profile.profile}
Nombre: ${profile.firstName}
Apellidos: ${profile.lastName1} ${profile.lastName2}
Procedencia: ${profile.origin || "no indicada"}
Carácter: ${profile.character}
Remate deseado: ${profile.remate}
Iniciales seleccionadas: ${input.initials.letters.join("")} (${input.initials.kind})
Estilo solicitado: ${input.style}

Genera tres variantes reales del estilo solicitado, con arquitecturas distintas entre sí y trazos soldados de pletina uniforme.`;

    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
        maxOutputTokens: 1600,
      },
    });

    const text = response.text ?? "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd <= jsonStart) return fallback;
    const parsed = coerceProposals(JSON.parse(text.slice(jsonStart, jsonEnd + 1)));

    if (parsed.length === 0) return fallback;

    const blueprints = [...parsed.map((item) => item.blueprint)];
    const explanations = [...parsed.map((item) => item.explanation)];
    while (blueprints.length < 3) {
      const index = blueprints.length;
      blueprints.push(fallback.blueprints[index]);
      explanations.push(fallback.explanations[index]);
    }

    return {
      blueprints: ensureDistinctArchitectures(blueprints.slice(0, 3)),
      explanations: explanations.slice(0, 3),
      source: "gemini",
    };
  } catch {
    return fallback;
  }
}

export interface ArtDirectionInput {
  profile: UserProfileInput;
  initials: InitialsCombination;
  style: ForgeStyle;
  use: UseCaseKey;
  notes?: string;
}

export interface ArtDirection {
  prompt: string;
  source: "gemini" | "deterministic";
}

export interface ArtRecipe {
  key: string;
  prompt: string;
  description: string;
}

const FORGE_PHYSICS = [
  "Authentic 19th-century Spanish cattle branding iron mark (hierro ganadero) from an official Andalusian livestock registry book.",
  "Bent from a single thick flat wrought-iron metal strip (pletina de forja) with strictly uniform monoline stroke width throughout the entire mark.",
  "All metal strokes physically welded together into one solid blacksmith stamp, zero floating disconnected pieces, zero tapered calligraphic serifs, stark primitive folk metalwork silhouette.",
  "Pure solid black (#000000) centered on pure solid white (#FFFFFF), generous open internal spaces so hot iron does not blotch skin.",
];

const ART_CONTRACT = [
  ...FORGE_PHYSICS,
  "Every counter and the light gap between initials stays clean white: open internal cavities are mandatory.",
  "Flat 2D silhouette from a bold hand-forged iron stroke of constant width, drawn as plain folk metalwork and never as a typographic lettering sample.",
  "One single emblem, centred, isolated, with a generous white margin on all four sides.",
  "No gradients, no shading, no highlights, no drop shadows, no bevels, no texture, no metallic render.",
  "No refined styling, no polished jewellery finish, no fine stationery lettering, no decorative flourish of any kind.",
  "No extra borders, frames, ornaments or background scene beyond the requested emblem.",
  "No additional letters, words, numbers, watermark or signature.",
].join(" ");

const ART_HERALDIC_NOTE =
  "This heraldic family is the only one allowed a shield or a top element, and both stay cattle-breeding forge work: any top piece is a welded horizontal iron bar with square merlons cut from the same pletina, a solid black metal bar with no floating points, no pearls and no rounded spikes.";

const POISON_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bcoat of arms\b/gi, "emblem"],
  [/\bcrested\b/gi, "topped"],
  [/\bcrest\b/gi, "emblem"],
  [/\bluxurious\b/gi, "plain"],
  [/\bluxury\b/gi, "plain"],
  [/\broyal\b/gi, "traditional"],
  [/\bking\b/gi, "rancher"],
  [/\bqueen\b/gi, "rancher"],
  [/\bboutique\b/gi, "forge workshop"],
  [/\bfashion\b/gi, "identity"],
  [/\bgolden\b/gi, "single-colour"],
  [/\bgold\b/gi, "single-colour"],
  [/\bembroidery\b/gi, "stitched thread work"],
  [/\bmatador\b/gi, "bullfighter"],
  [/\bserifs\b/gi, "terminals"],
  [/\bserif\b/gi, "terminal"],
  [/\bornate\b/gi, "plain"],
  [/\bornamented\b/gi, "plain"],
  [/\bbadge\b/gi, "mark"],
];

export function sanitizeArtPrompt(prompt: string, style: ForgeStyle): string {
  let clean = prompt.replace(/\s+/g, " ").trim();
  for (const [pattern, replacement] of POISON_REPLACEMENTS) {
    clean = clean.replace(pattern, replacement);
  }
  if (style !== "heraldico") {
    clean = clean.replace(/\bcrown(?:s|ed)?\b/gi, "welded top bar");
  }
  return clean.replace(/\s+/g, " ").trim();
}

const ART_STYLE_BRIEF: Record<ForgeStyle, string> = {
  tradicional:
    "traditional Spanish ganaderia iron: thick uniform pletina, straight stems, one welded silhouette, no outer frame",
  monograma:
    "bare interlocking monogram: the initials fused into one continuous welded mark, no outer frame, no arch over the letters, no top element",
  geometrico:
    "dry industrial ranch geometry: straight monoline bars, strict mirror symmetry, every junction welded and every terminal cut square",
  heraldico:
    "forged cattle shield: one welded iron outline with a crenellated top bar cut from the same strip, solid black metalwork, never a jewellery crown",
};

const ART_USE_BRIEF: Record<UseCaseKey, string> = {
  fuego: "branding iron burnt into hide: heavy pletina, rounded weld joints, readable at 25 cm",
  nitrogeno: "freeze brand: single lighter line weight, wide counters that stay legible on dark hide",
  bordado_oro: "stitched thread work on a bullfighter's cape and polo shirt: filled shapes with holes wide enough for needle and thread",
  piel: "burnt leather stamp and carved wood: chunky counters that survive heat and compression",
};

const ART_PROFILE_BRIEF: Record<ProfileType, string> = {
  novillero: "personal mark of a bullfighter, readable at a distance on cape and polo shirt",
  ganaderia: "livestock brand for a fighting bull ranch or a PRE stud farm",
  particular: "family seal for a country estate, its gate and its tack room",
};

const ART_CHARACTER_BRIEF: Record<(typeof CHARACTER_TYPES)[number], string> = {
  sobrio: "sober and plain",
  senorial: "solemn and grounded",
  agresivo: "harsh and angular",
  minimalista: "pared down to bare iron bars",
};

const ART_REMATE_BRIEF: Record<(typeof REMATE_TYPES)[number], string> = {
  cruz: "a small forge cross of two welded bars on top",
  corona: "a welded crenellated iron bar on top with four square merlons cut from the same strip",
  arco: "one open welded iron arch over the initials",
  "sin-remate": "no top element, bare initials only",
};

const tradicionalRecipes: readonly [ArtRecipe, ArtRecipe, ArtRecipe] = [
  {
    key: "asa_de_caldera",
    prompt:
      "Morphology (Asa de caldera): the initials sit inside one inverted omega arch of welded iron strip that leaves a wide open mouth at the base, with a small simple forge cross of two welded bars at the apex, all cut from the same uniform strip and welded as one troquel, no outer frame.",
    description:
      "Asa de caldera: las iniciales se inscriben en un arco de herradura de pletina soldada, rematado por una cruz de forja de dos palos.",
  },
  {
    key: "arco_ganadero",
    prompt:
      "Morphology (Arco ganadero): a single open iron arch bridges over the top of the initials, its two feet opening into plain fork or fish-tail welds, the letters welded hanging from the arch, no frame and nothing above the arch.",
    description:
      "Arco ganadero y espuela: un arco abierto de hierro monta sobre las iniciales y sus pies se abren en horquilla de forja.",
  },
  {
    key: "forja_de_yunque",
    prompt:
      "Morphology (Forja de yunque): bare thick initials of uniform iron bar joined by one central crossbar, every bar end cut into a flat anvil flare, no arch, no frame, no top element.",
    description:
      "Forja de yunque: iniciales desnudas de barra gruesa unidas por un travesaño central, con remates planos de yunque.",
  },
];

const monogramaRecipes: readonly [ArtRecipe, ArtRecipe, ArtRecipe] = [
  {
    key: "asta_compartida",
    prompt:
      "Morphology (Asta compartida): both initials fused so they share one continuous vertical or diagonal iron stem, one single welded line for the whole lock-up, no frame, no top element.",
    description:
      "Asta compartida: las iniciales se funden compartiendo un mismo palo vertical de hierro continuo.",
  },
  {
    key: "inicial_abrazada",
    prompt:
      "Morphology (Inicial abrazada): the first letter enlarged in an open curve that wraps the second letter inside its open bowl, both welded at two contact points, bare initials only, no frame, no top element.",
    description:
      "Inicial abrazada: la primera letra crece en curva abierta y abraza a la segunda dentro de su seno.",
  },
  {
    key: "enlazado_vertical",
    prompt:
      "Morphology (Enlazado vertical): the initials stacked down one vertical axis and linked by a single continuous welded stroke, no frame, no outer shape, no top element.",
    description:
      "Enlazado vertical: las letras se encadenan en eje vertical mediante un único trazo soldado.",
  },
];

const geometricoRecipes: readonly [ArtRecipe, ArtRecipe, ArtRecipe] = [
  {
    key: "circulo_cortado",
    prompt:
      "Morphology (Circulo cortado): monoline initials in straight iron bars inside a single iron ring interrupted by four symmetrical cuts, ring and letters welded as one piece, every stroke the same width.",
    description:
      "Círculo cortado: iniciales en barra recta dentro de un anillo de hierro con cuatro cortes simétricos.",
  },
  {
    key: "ovalo_y_barra",
    prompt:
      "Morphology (Ovalo y barra): symmetrical composition enclosed by a pointed oval or closed by one horizontal forged crossbar, everything on a strict centre axis with square-cut welds.",
    description:
      "Óvalo y barra: composición simétrica cerrada por un óvalo apuntado y un travesaño horizontal de forja.",
  },
  {
    key: "trazo_anguloso",
    prompt:
      "Morphology (Trazo anguloso): purely geometric fusion of straight iron bars, every terminal cut dead square, rigorous mirror symmetry, no curve at all.",
    description:
      "Trazo anguloso: fusión de barras rectas con remates cortados en seco y simetría rigurosa.",
  },
];

const heraldicoRecipes: readonly [ArtRecipe, ArtRecipe, ArtRecipe] = [
  {
    key: "escudo_almenado",
    prompt:
      "Morphology (Escudo almenado): a classic round-bottom Spanish shield outlined in uniform iron bar, closed at the top by a welded horizontal bar carrying three straight rectangular merlons, the initials welded inside the shield.",
    description:
      "Escudo español almenado: escudo de base redondeada en barra de hierro con tres almenas rectas soldadas en su remate.",
  },
  {
    key: "escudo_apuntado",
    prompt:
      "Morphology (Escudo apuntado): a pointed-bottom cattle shield drawn in one continuous thick stroke that frames the welded initials, closed solid silhouette with open counters.",
    description:
      "Escudo apuntado: escudo ganadero de punta inferior en trazo grueso continuo que enmarca las iniciales.",
  },
  {
    key: "almenado_sin_escudo",
    prompt:
      "Morphology (Hierro almenado sin escudo): free forged initials topped directly by a crenellated iron crown bar of four square merlons welded onto the top stroke, no shield outline.",
    description:
      "Hierro almenado sin escudo: iniciales forjadas libres rematadas por una barra de cuatro almenas cuadradas.",
  },
];

export const ART_RECIPES: Record<ForgeStyle, readonly [ArtRecipe, ArtRecipe, ArtRecipe]> = {
  tradicional: tradicionalRecipes,
  monograma: monogramaRecipes,
  geometrico: geometricoRecipes,
  heraldico: heraldicoRecipes,
};

export function buildVariantPrompts(base: string, style: ForgeStyle): string[] {
  return ART_RECIPES[style].map((recipe) => enforceArtContract(`${base} ${recipe.prompt}`, style));
}

const ART_DIRECTION_SYSTEM_PROMPT = `Eres el director de arte de MI HIERRO. Traduces una ficha de hierro a un prompt técnico en inglés para un generador de imágenes con estilo entrenado.
Devuelve únicamente el prompt en inglés, sin explicaciones, sin viñetas y sin comillas.
Describe una única silueta plana de hierro ganadero español forjado, nunca un logotipo de hotel, moda o joyería.
Contrato físico obligatorio del prompt: ${FORGE_PHYSICS.join(" ")}
Exige negro puro #000000 sobre blanco puro #FFFFFF, pletina de grosor uniforme, piezas soldadas en un solo troquel, huecos internos abiertos, sin degradados, sin sombras, sin texturas, sin bordes extra y sin letras distintas a las iniciales.
Nunca escribas palabras de lujo o joyería: nada de luxury, royal, king, queen, boutique, fashion, crest, coat of arms, gold, embroidery, matador, serif, ornate ni badge, y tampoco coronas salvo en un hierro heráldico almenado.`;

const ART_PROMPT_TAIL =
  "Render it as a flat single-colour black ink mark ready for vector tracing, with no anti-aliased grey edges.";

function enforceArtContract(prompt: string, style: ForgeStyle): string {
  const base = sanitizeArtPrompt(prompt, style);
  const physics = style === "heraldico" ? `${ART_CONTRACT} ${ART_HERALDIC_NOTE}` : ART_CONTRACT;
  const heraldicReady = style !== "heraldico" || base.includes("no floating points");
  if (base.includes("wrought-iron metal strip") && base.includes("pletina de forja") && heraldicReady) return base;
  return sanitizeArtPrompt(`${base.replace(/[.\s]+$/, "")}. ${physics} ${ART_PROMPT_TAIL}`, style);
}

export function buildDeterministicArtPrompt(input: ArtDirectionInput): string {
  const letters = input.initials.letters.join(" ");
  const origin = input.profile.origin ? ` from ${input.profile.origin}` : "";
  const notes = input.notes ? ` Client notes: ${input.notes}.` : "";
  const remate =
    input.style === "monograma" || input.style === "geometrico"
      ? ART_REMATE_BRIEF["sin-remate"]
      : ART_REMATE_BRIEF[input.profile.remate];
  const core = [
    `Design a ${input.style} cattle branding iron mark for ${ART_PROFILE_BRIEF[input.profile.profile]}${origin}.`,
    `Initials: exactly ${letters}, nothing else.`,
    `Style direction: ${ART_STYLE_BRIEF[input.style]}.`,
    `Physical use: ${ART_USE_BRIEF[input.use]}.`,
    `Temperament: ${ART_CHARACTER_BRIEF[input.profile.character]}, finished with ${remate}.`,
    notes,
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return enforceArtContract(core, input.style);
}

export async function buildArtDirectionPrompt(input: ArtDirectionInput): Promise<ArtDirection> {
  const fallbackPrompt = buildDeterministicArtPrompt(input);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { prompt: fallbackPrompt, source: "deterministic" };

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: `${ART_DIRECTION_SYSTEM_PROMPT}

Ficha de hierro:
Perfil: ${input.profile.profile}
Nombre: ${input.profile.firstName} ${input.profile.lastName1}
Procedencia: ${input.profile.origin || "no indicada"}
Carácter: ${input.profile.character}
Remate: ${input.profile.remate}
Iniciales: ${input.initials.letters.join("")}
Estilo: ${input.style}
Uso físico: ${input.use}
Notas: ${input.notes || "ninguna"}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const text = (response.text ?? "").trim();
    if (text.length < 60) return { prompt: fallbackPrompt, source: "deterministic" };
    return { prompt: enforceArtContract(text.slice(0, 1200), input.style), source: "gemini" };
  } catch {
    return { prompt: fallbackPrompt, source: "deterministic" };
  }
}
