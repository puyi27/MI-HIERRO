import { GoogleGenAI } from "@google/genai";
import {
  ARCHITECTURES,
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
La explicación debe ser una frase breve en español, personalizada con el nombre y la procedencia, y nunca prometer registro ni exclusividad.`;

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

Genera tres variantes reales del estilo solicitado, con arquitecturas distintas entre sí.`;

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

const ART_CONTRACT = [
  "Pure black silhouette in #000000 only, on a pure white #FFFFFF background.",
  "Bold hand-forged iron stroke of constant weight, like a welded iron pletina.",
  "Open internal cavities: every counter and the light gap between initials stays clean white.",
  "One single emblem, centred, isolated, with a generous white margin on all four sides.",
  "Flat 2D, symmetrical, high contrast, vector-ready for tracing into one single-colour SVG path.",
  "No gradients, no shading, no highlights, no drop shadows, no bevels, no texture, no metallic render.",
  "No extra borders, frames, ornaments or background scene beyond the requested emblem.",
  "No additional letters, words, numbers, watermark or signature.",
].join(" ");

const ART_STYLE_BRIEF: Record<ForgeStyle, string> = {
  tradicional: "traditional Spanish ganaderia iron: rooted serifs, straight stems, one welded silhouette",
  monograma: "interlocking monogram: the initials fused into one continuous mark with a clean light gap",
  geometrico: "geometric mark: strict symmetry, constant stroke, straight cuts, no flourishes",
  heraldico: "heraldic emblem: crest-like balance with an open three-point crown kept as a single welded line",
};

const ART_USE_BRIEF: Record<UseCaseKey, string> = {
  fuego: "branding iron burnt into hide: heavy pletina, rounded weld joints, readable at 25 cm",
  nitrogeno: "freeze brand: single lighter line weight, wide counters that stay legible on dark hide",
  bordado_oro: "gold embroidery on capote and polo: filled shapes with holes wide enough for needle and thread",
  piel: "burnt leather stamp and carved wood: chunky counters that survive heat and compression",
};

const ART_PROFILE_BRIEF: Record<ProfileType, string> = {
  novillero: "personal mark of a bullfighter, readable at a distance on capote and polo",
  ganaderia: "livestock brand for a fighting bull ranch or a PRE stud farm",
  particular: "family seal for a country estate, its gate and its tack room",
};

const ART_DIRECTION_SYSTEM_PROMPT = `Eres el director de arte de MI HIERRO. Traduces una ficha de hierro a un prompt técnico en inglés para un generador de imágenes con estilo entrenado.
Devuelve únicamente el prompt en inglés, sin explicaciones, sin viñetas y sin comillas.
El prompt debe describir una única silueta plana de hierro forjado, exigiendo negro puro #000000 sobre blanco puro #FFFFFF, trazo contundente de pletina forjada, huecos internos abiertos, sin degradados, sin sombras, sin texturas, sin bordes extra y sin letras distintas a las iniciales.`;

const ART_PROMPT_TAIL =
  "Render it as a flat single-colour black ink mark ready for vector tracing, with no anti-aliased grey edges.";

function enforceArtContract(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  const complete = trimmed.includes("#000000") && trimmed.includes("#FFFFFF") && /no gradients/i.test(trimmed);
  if (complete) return trimmed;
  return `${trimmed.replace(/[.\s]+$/, "")}. ${ART_CONTRACT} ${ART_PROMPT_TAIL}`.replace(/\s+/g, " ").trim();
}

export function buildDeterministicArtPrompt(input: ArtDirectionInput): string {
  const letters = input.initials.letters.join(" ");
  const origin = input.profile.origin ? ` from ${input.profile.origin}` : "";
  const notes = input.notes ? ` Client notes: ${input.notes}.` : "";
  return [
    `Design a ${input.style} cattle-brand emblem for ${ART_PROFILE_BRIEF[input.profile.profile]}${origin}.`,
    `Initials: exactly ${letters}, nothing else.`,
    `Style direction: ${ART_STYLE_BRIEF[input.style]}.`,
    `Physical use: ${ART_USE_BRIEF[input.use]}.`,
    `Character: ${input.profile.character}, finishing with ${input.profile.remate === "sin-remate" ? "no top ornament" : `a ${input.profile.remate} top ornament`}.`,
    `${ART_CONTRACT} ${ART_PROMPT_TAIL}`,
    notes,
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
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
    return { prompt: enforceArtContract(text.slice(0, 1200)), source: "gemini" };
  } catch {
    return { prompt: fallbackPrompt, source: "deterministic" };
  }
}
