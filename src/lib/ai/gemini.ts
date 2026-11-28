import { GoogleGenAI } from "@google/genai";
import {
  ARCHITECTURES,
  REMATE_META,
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
Remate deseado: ${describeRemate(profile.remate, "auto")}
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

function describeRemate(value: string | undefined, fallback: string): string {
  const remate = value || fallback;
  if (remate === "auto") {
    return "A criterio del maestro (libertad total para elegir el remate más noble y forjable)";
  }
  return remate in REMATE_META ? REMATE_META[remate as keyof typeof REMATE_META] : remate;
}

const CREATIVE_ANGLES = [
  "simetría axial estricta con eje vertical dominante y contadores abiertos",
  "asimetría controlada con un vástago maestro y un contrapeso soldado al flanco",
  "bloque compacto de perímetro cuadrado y huecos internos mínimos",
  "pieza esbelta, más alta que ancha, con lectura ascendente",
  "trazo abierto de contadores amplios y aire interior generoso",
  "perímetro casi circular continuo con lectura centrada",
  "dos cuerpos encontrados que se cruzan en una soldadura central",
  "remate prominente que ordena la silueta y equilibra la base",
] as const;

function creativeVariation(): string {
  const angle = CREATIVE_ANGLES[Math.floor(Math.random() * CREATIVE_ANGLES.length)];
  const seed = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  return `Semilla creativa ${seed} · enfoque de esta tirada: ${angle}.\nNo repitas el esqueleto, el encuadre ni el remate de forjas anteriores con estas mismas iniciales: las tres propuestas deben ser estructuras nuevas.`;
}

export interface ArtDirectionInput {
  profile: UserProfileInput;
  initials: InitialsCombination;
  style: ForgeStyle;
  use: UseCaseKey;
  ornament?: string;
  notes?: string;
}

export interface ArtDirection {
  recipeName: string;
  lore: string;
  recraftPrompt: string;
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

const tradicionalRecipes: readonly ArtRecipe[] = [
  {
    key: "asa_de_caldera",
    prompt: "Open iron horseshoe arch, small forge cross welded at the apex.",
    description:
      "Asa de caldera: las iniciales se inscriben en un arco de herradura de pletina soldada, rematado por una cruz de forja de dos palos.",
  },
  {
    key: "arco_ganadero",
    prompt: "Open arch over the letters, forked welds at the feet.",
    description:
      "Arco ganadero y espuela: un arco abierto de hierro monta sobre las iniciales y sus pies se abren en horquilla de forja.",
  },
  {
    key: "forja_de_yunque",
    prompt: "Thick bare initials on one central crossbar, flat anvil ends.",
    description:
      "Forja de yunque: iniciales desnudas de barra gruesa unidas por un travesaño central, con remates planos de yunque.",
  },
  {
    key: "espuela_de_remate",
    prompt: "Welded spur terminals flaring from each stem, single-piece forging.",
    description:
      "Espuela de remate: cada vástago termina en una espuela de forja abierta, soldada a la misma pletina sin piezas sueltas.",
  },
  {
    key: "pletina_retorcida",
    prompt: "Twisted flat bar linking both letters, hand-forged uniform thickness.",
    description:
      "Pletina retorcida: un tramo de barra plana girada en caliente une las dos iniciales manteniendo el grosor uniforme del hierro.",
  },
  {
    key: "media_luna_ganadera",
    prompt: "Shallow crescent bar beneath the initials, welded at both ends.",
    description:
      "Media luna ganadera: una barra en media luna sostiene las iniciales por su base y se suelda en ambos extremos.",
  },
];

const monogramaRecipes: readonly ArtRecipe[] = [
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
  {
    key: "nudo_de_pletina",
    prompt: "Flat bar looping between letters in one continuous welded knot.",
    description:
      "Nudo de pletina: la barra plana traza un nudo continuo entre ambas letras, sin cortes ni uniones atornilladas.",
  },
  {
    key: "seno_cruzado",
    prompt: "Second letter crossing the open counter of the first, welded.",
    description:
      "Seno cruzado: la segunda inicial atraviesa el hueco abierto de la primera y queda soldada en el cruce.",
  },
  {
    key: "eje_quebrado",
    prompt: "Shared stem stepping at mid-height, mirrored open counters.",
    description:
      "Eje quebrado: el palo común quiebra a media altura y ordena dos senos abiertos en espejo.",
  },
];

const geometricoRecipes: readonly ArtRecipe[] = [
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
  {
    key: "rombo_central",
    prompt: "Letters locked inside a diamond frame of welded square bar.",
    description:
      "Rombo central: un marco romboidal de barra cuadrada encierra las iniciales y las suelda en sus cuatro vértices.",
  },
  {
    key: "doble_barra",
    prompt: "Two parallel iron bars crossing the initials, equal open spacing.",
    description:
      "Doble barra: dos travesaños paralelos cruzan las iniciales con luz idéntica entre ambos y remates rectos.",
  },
  {
    key: "hexagono_forjado",
    prompt: "Hexagonal perimeter of flat bar around squared welded initials.",
    description:
      "Hexágono forjado: un perímetro hexagonal de pletina rodea las iniciales cuadradas y las integra en la misma pieza.",
  },
];

const heraldicoRecipes: readonly ArtRecipe[] = [
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
  {
    key: "corona_abierta",
    prompt: "Open three-point coronet bar welded above the initials, no jewels.",
    description:
      "Corona abierta: tres puntas de forja soldadas sobre las iniciales forman un remate heráldico sobrio, sin pedrería.",
  },
  {
    key: "cartela_ganadera",
    prompt: "Rolled cartouche bar enclosing the welded initials, open at the base.",
    description:
      "Cartela ganadera: una cartela de pletina enrollada abraza las iniciales y deja abierta la base para el desagüe.",
  },
  {
    key: "castillete",
    prompt: "Stepped castle battlement bar over welded initials, solid base.",
    description:
      "Castillete de forja: un remate escalonado de almenas descansa sobre las iniciales y apoya en una base maciza.",
  },
];

export const ART_RECIPES: Record<ForgeStyle, readonly ArtRecipe[]> = {
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

function shuffle<T>(items: readonly T[]): T[] {
  const pool = [...items];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  return pool;
}

export function selectArchetypes(style: ForgeStyle, count = 3): ArtRecipe[] {
  return shuffle(ART_RECIPES[style]).slice(0, count);
}

export function buildVariantPrompts(input: { initials: InitialsCombination; style: ForgeStyle; archetypes?: ArtRecipe[] }): string[] {
  const archetypes = input.archetypes ?? selectArchetypes(input.style, 3);
  return archetypes.map((recipe) => compactArtPrompt(input.initials.label, input.style, recipe.prompt));
}

export function buildDeterministicArtPrompt(input: ArtDirectionInput): string {
  return compactArtPrompt(input.initials.label, input.style, ART_RECIPES[input.style][0].prompt);
}

const ART_DIRECTION_SYSTEM = `Eres un maestro diseñador de hierros ganaderos españoles y marcas taurinas históricas, formado en los libros registro del RUCTL, en los hierros de ganadería brava andaluza y en las yeguadas PRE.
Debes diseñar exactamente 3 propuestas radicalmente distintas entre sí, elegantes, simétricas y con solera taurina real, pensando específicamente en la geometría de las iniciales exactas del cliente y respetando sus notas.
Devuelve exclusivamente un array JSON de 3 objetos con las claves recipeName, lore y recraftPrompt.
Cada recraftPrompt debe ir en inglés, tener entre 40 y 55 palabras y describir con precisión espacial cómo se funden o enmarcan esas iniciales concretas en una sola pieza de pletina de hierro forjado de grosor uniforme (bold uniform monoline wrought-iron strip), con huecos internos abiertos, silueta #000000 centrada sobre fondo #FFFFFF y sin piezas flotantes.
Adapta la morfología estrictamente al estilo:
- tradicional: asa de caldera, arco abierto, herradura, cruz de forja simple de dos palos, espuelas o remates de yunque. Nunca coronas ni escudos.
- monograma: únicamente las iniciales fundidas o enlazadas con maestría (asta compartida, inicial abrazada, eje vertical). Sin arcos envolventes, sin escudos, sin coronas.
- geometrico: síntesis geométrica pura y contundente (anillo cortado, óvalo apuntado, barras rectas simétricas). Sin ornamentos barrocos, sin escudos, sin coronas.
- heraldico: escudo español ganadero limpio o barra almenada de forja soldada. Nunca corona de joyería con puntas flotantes.
El campo lore va en español, con 1 o 2 frases editoriales sobrias, y debe explicar fielmente la composición real de esa propuesta concreta.
Prohibido usar luxury, royal, gold, embroidery, serif, crest o crown fuera de la familia heraldico. Nada de joyería, pedrería, piezas desconectadas ni estética de moda.
Si el remate solicitado es distinto de «A criterio del maestro», respétalo en las tres propuestas e intégralo soldado a la silueta. Si es «A criterio del maestro», decide tú el remate más noble y forjable para esa familia. El remate nunca puede ser una pieza flotante ni una pegatina superpuesta.`;

const MANDATORY_COLOURS = "pure solid black #000000 on pure white #FFFFFF";
const MANDATORY_STRIP = "uniform monoline wrought-iron strip";

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function seedFor(value: string): number {
  let seed = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    seed ^= value.charCodeAt(index);
    seed = Math.imul(seed, 16777619) >>> 0;
  }
  return seed;
}

function fallbackPrompt(label: string, style: ForgeStyle, recipe: string): string {
  const core =
    "Bold uniform monoline wrought-iron strip, clean symmetry, open internal counters, all pieces welded into one solid silhouette, pure solid black #000000 on pure white #FFFFFF.";
  return sanitizeArtPrompt(`${initialsClause(label)} ${core} ${recipe}`, style);
}

function fallbackArtDirections(input: ArtDirectionInput): ArtDirection[] {
  const bank = ART_RECIPES[input.style];
  const offset =
    seedFor(`${input.initials.label}|${input.style}|${input.use}|${input.ornament ?? ""}|${input.notes ?? ""}`) %
    bank.length;
  return [0, 1, 2].map((step) => {
    const recipe = bank[(offset + step) % bank.length];
    return {
      recipeName: recipe.key,
      lore: recipe.description,
      recraftPrompt: fallbackPrompt(input.initials.label, input.style, recipe.prompt),
    };
  });
}

function cleanLore(candidate: string | undefined, fallback: string): string {
  if (!candidate) return fallback;
  const clean = candidate.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280);
  return clean.length >= 20 ? clean : fallback;
}

function finalizeRecraftPrompt(
  candidate: string,
  fallback: string,
  style: ForgeStyle,
  label: string,
): string {
  let clean = sanitizeArtPrompt(candidate.slice(0, 900), style);
  const additions: string[] = [];
  if (!clean.includes(`"${label.toUpperCase()}"`)) {
    additions.push(`Featuring the exact bold capital letters "${label.toUpperCase()}" clearly readable`);
  }
  if (!clean.includes("#000000") || !clean.includes("#FFFFFF")) additions.push(MANDATORY_COLOURS);
  if (!clean.toLowerCase().includes("uniform monoline wrought-iron")) additions.push(MANDATORY_STRIP);
  if (additions.length > 0) {
    clean = `${clean.replace(/[.;\s]+$/, "")}. ${additions.join(", ")}.`;
  }
  const words = wordCount(clean);
  return words >= 40 && words <= 55 ? clean : fallback;
}

function coerceArtDirections(raw: unknown): Array<Partial<ArtDirection>> {
  const source = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { directions?: unknown }).directions)
      ? (raw as { directions: unknown[] }).directions
      : [];
  return source
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      recipeName: typeof item.recipeName === "string" ? item.recipeName : undefined,
      lore: typeof item.lore === "string" ? item.lore : undefined,
      recraftPrompt: typeof item.recraftPrompt === "string" ? item.recraftPrompt : undefined,
    }));
}

export async function generateArtDirections(input: ArtDirectionInput): Promise<ArtDirection[]> {
  const fallback = fallbackArtDirections(input);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  try {
    const client = new GoogleGenAI({ apiKey });
    const contents = `${ART_DIRECTION_SYSTEM}

Iniciales exactas: ${input.initials.label.toUpperCase()} (${input.initials.kind})
Letras: ${input.initials.letters.join(", ")}
Perfil: ${input.profile.profile}
Nombre: ${input.profile.firstName} ${input.profile.lastName1} ${input.profile.lastName2}
Procedencia: ${input.profile.origin || "no indicada"}
Carácter: ${input.profile.character}
Uso del hierro: ${input.use}
Remate solicitado: ${describeRemate(input.ornament, input.profile.remate)}
Notas del cliente: ${input.notes?.trim() || "sin notas"}
Estilo: ${input.style}
Variación creativa obligatoria: ${creativeVariation()}`;

    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        temperature: 0.75,
        maxOutputTokens: 1200,
      },
    });

    const text = response.text ?? "";
    const jsonStart = text.search(/[\[{]/);
    const jsonEnd = Math.max(text.lastIndexOf("]"), text.lastIndexOf("}"));
    if (jsonStart === -1 || jsonEnd <= jsonStart) return fallback;
    const drafts = coerceArtDirections(JSON.parse(text.slice(jsonStart, jsonEnd + 1)));
    if (drafts.length === 0) return fallback;

    const usedPrompts = new Set<string>();
    const usedNames = new Set<string>();
    return [0, 1, 2].map((index) => {
      const draft = drafts[index];
      const base = fallback[index];
      if (!draft?.recraftPrompt) return base;

      let recipeName = draft.recipeName?.replace(/\s+/g, " ").trim().slice(0, 60) || base.recipeName;
      if (usedNames.has(recipeName)) recipeName = base.recipeName;
      usedNames.add(recipeName);

      const finalized = finalizeRecraftPrompt(
        draft.recraftPrompt,
        base.recraftPrompt,
        input.style,
        input.initials.label,
      );
      const recraftPrompt = usedPrompts.has(finalized) ? base.recraftPrompt : finalized;
      usedPrompts.add(recraftPrompt);

      return {
        recipeName,
        lore: cleanLore(draft.lore, base.lore),
        recraftPrompt,
      };
    });
  } catch {
    return fallback;
  }
}
