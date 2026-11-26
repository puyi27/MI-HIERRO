import { GoogleGenAI } from "@google/genai";
import {
  ARCHITECTURES,
  brandBlueprintSchema,
  type BrandBlueprint,
  type GenerateRequest,
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
