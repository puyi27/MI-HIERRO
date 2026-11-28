import { GoogleGenAI } from "@google/genai";
import {
  ARCHITECTURES,
  brandBlueprintSchema,
  type BrandBlueprint,
  type ForgeStyle,
  type GenerateRequest,
  type InitialsCombination,
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

export interface ArtRecipe {
  key: string;
  prompt: string;
  description: string;
}

const ART_DIRECTION_CORE =
  "Iconic, masterfully balanced Spanish bullfighting branding iron (hierro ganadero). Bold uniform monoline wrought-iron silhouette, razor-sharp symmetry, crisp proportions, pure solid black (#000000) centered on pure white (#FFFFFF), all strokes cleanly welded together.";

const ART_HERALDIC_CORE = ART_DIRECTION_CORE.replace(/\.$/, ", no floating points.");

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

const tradicionalRecipes: readonly [ArtRecipe, ArtRecipe, ArtRecipe] = [
  {
    key: "asa_de_caldera",
    prompt: "Open iron horseshoe arch, small forge cross welded at the apex.",
    description:
      "Asa de caldera: las iniciales se inscriben en un arco de herradura de pletina soldada, rematado por una cruz de forja de dos palos.",
  },
  {
    key: "arco_ganadero",
    prompt: "Single open arch over the letters, feet opening into forked welds.",
    description:
      "Arco ganadero y espuela: un arco abierto de hierro monta sobre las iniciales y sus pies se abren en horquilla de forja.",
  },
  {
    key: "forja_de_yunque",
    prompt: "Thick bare initials joined by one central crossbar, flat anvil ends.",
    description:
      "Forja de yunque: iniciales desnudas de barra gruesa unidas por un travesaño central, con remates planos de yunque.",
  },
];

const monogramaRecipes: readonly [ArtRecipe, ArtRecipe, ArtRecipe] = [
  {
    key: "asta_compartida",
    prompt: "Both initials sharing one continuous vertical stem, a single welded line.",
    description:
      "Asta compartida: las iniciales se funden compartiendo un mismo palo vertical de hierro continuo.",
  },
  {
    key: "inicial_abrazada",
    prompt: "First letter curving open to wrap the second inside its bowl.",
    description:
      "Inicial abrazada: la primera letra crece en curva abierta y abraza a la segunda dentro de su seno.",
  },
  {
    key: "enlazado_vertical",
    prompt: "Initials stacked on one vertical axis, linked by a welded stroke.",
    description:
      "Enlazado vertical: las letras se encadenan en eje vertical mediante un único trazo soldado.",
  },
];

const geometricoRecipes: readonly [ArtRecipe, ArtRecipe, ArtRecipe] = [
  {
    key: "circulo_cortado",
    prompt: "Straight-bar initials inside one iron ring cut by four gaps.",
    description:
      "Círculo cortado: iniciales en barra recta dentro de un anillo de hierro con cuatro cortes simétricos.",
  },
  {
    key: "ovalo_y_barra",
    prompt: "Pointed oval closing symmetrical initials with one horizontal forged crossbar.",
    description:
      "Óvalo y barra: composición simétrica cerrada por un óvalo apuntado y un travesaño horizontal de forja.",
  },
  {
    key: "trazo_anguloso",
    prompt: "Pure straight iron bars, square-cut terminals, rigorous mirror symmetry.",
    description:
      "Trazo anguloso: fusión de barras rectas con remates cortados en seco y simetría rigurosa.",
  },
];

const heraldicoRecipes: readonly [ArtRecipe, ArtRecipe, ArtRecipe] = [
  {
    key: "escudo_almenado",
    prompt: "Round-bottom shield, three square welded merlons on top.",
    description:
      "Escudo español almenado: escudo de base redondeada en barra de hierro con tres almenas rectas soldadas en su remate.",
  },
  {
    key: "escudo_apuntado",
    prompt: "Pointed cattle shield framing welded initials, open counters.",
    description:
      "Escudo apuntado: escudo ganadero de punta inferior en trazo grueso continuo que enmarca las iniciales.",
  },
  {
    key: "almenado_sin_escudo",
    prompt: "Welded initials under a four-merlon bar, no shield.",
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

function initialsClause(label: string): string {
  return `Featuring the exact bold capital letters "${label.toUpperCase()}" clearly readable and harmoniously integrated.`;
}

function compactArtPrompt(label: string, style: ForgeStyle, recipe: string): string {
  const core = style === "heraldico" ? ART_HERALDIC_CORE : ART_DIRECTION_CORE;
  return sanitizeArtPrompt(`${initialsClause(label)} ${core} ${recipe}`, style);
}

export function buildVariantPrompts(input: { initials: InitialsCombination; style: ForgeStyle }): string[] {
  return ART_RECIPES[input.style].map((recipe) => compactArtPrompt(input.initials.label, input.style, recipe.prompt));
}

export function buildDeterministicArtPrompt(input: ArtDirectionInput): string {
  return compactArtPrompt(input.initials.label, input.style, ART_RECIPES[input.style][0].prompt);
}
