import { NextResponse } from "next/server";
import {
  generateRequestSchema,
  generateResponseSchema,
  type ForgeProposal,
  type GenerateRequest,
  type ProfileType,
  type UseCaseKey,
} from "@/types/forge";
import { buildArtDirectionPrompt, generateBlueprints } from "@/lib/ai/gemini";
import { RecraftError, generateRecraftRaster, hasRecraft, recraftStyleId } from "@/lib/ai/recraft";
import { compileForge } from "@/lib/forge-engine/compiler";
import { buildDeterministicBlueprints, explainBlueprint } from "@/lib/forge-engine/presets";
import { getStore } from "@/lib/store";
import type { CreateDesignInput, DesignRecord, ForgeStore } from "@/lib/store/types";
import {
  FREE_AI_DAILY_LIMIT,
  clientKey,
  consumeFreeAiGeneration,
  peekFreeAiGeneration,
  rateLimit,
  releaseFreeAiGeneration,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

const DEFAULT_USE: Record<ProfileType, UseCaseKey> = {
  novillero: "bordado_oro",
  ganaderia: "fuego",
  particular: "piel",
};

const RASTER_VARIANTS = [
  {
    suffix:
      "Composition variant: one classic centred lock-up, both initials sharing a single vertical axis and a strictly symmetrical silhouette.",
    description:
      "Clásico centrado: las dos iniciales comparten un mismo eje vertical y la silueta queda simétrica, con el trazo de pletina continuo.",
  },
  {
    suffix:
      "Composition variant: vertically interlocked initials, one continuous welded stroke joining both letters, a clean open counter between them.",
    description:
      "Enlazado vertical: un solo trazo suelda las iniciales y deja abierto el hueco interior para que el bordado respire.",
  },
  {
    suffix:
      "Composition variant: crowned forge finish, an open arch ornament welded above the initials and the terminal ends cut as forged spurs.",
    description:
      "Remate forjado: el cuerpo central se corona con un arco abierto y los extremos se rematan en espuela de forja.",
  },
] as const;

function resolveUse(input: GenerateRequest): UseCaseKey {
  return input.use ?? DEFAULT_USE[input.profile.profile];
}

function generationKeyFor(input: GenerateRequest, use: UseCaseKey): string {
  return `${input.initials.label.toUpperCase()}|${input.style}|${use}`;
}

function baseDesign(input: GenerateRequest): Omit<CreateDesignInput, "style" | "blueprint" | "svgMaster" | "scores" | "lore"> {
  return {
    profile: input.profile.profile,
    firstName: input.profile.firstName,
    lastName1: input.profile.lastName1,
    lastName2: input.profile.lastName2,
    nickname: input.profile.nickname,
    origin: input.profile.origin,
    character: input.profile.character,
    remate: input.profile.remate,
    initials: input.initials.label,
  };
}

function proposalFor(design: DesignRecord, input: GenerateRequest): ForgeProposal {
  return {
    id: design.id,
    blueprint: design.blueprint,
    previewUrl: `/api/preview?d=${design.id}&v=0&t=hierro`,
    scores: design.scores,
    explanation: explainBlueprint(design.blueprint, input.profile),
    engine: design.rasterPng ? "ia" : "local",
  };
}

async function forgeProposals(input: GenerateRequest, store: ForgeStore): Promise<ForgeProposal[]> {
  const batch = await generateBlueprints(input);
  const proposals: ForgeProposal[] = [];

  for (let index = 0; index < batch.blueprints.length; index += 1) {
    const blueprint = batch.blueprints[index];
    let compiled;
    try {
      compiled = compileForge(blueprint, input.initials);
    } catch {
      continue;
    }

    const design = await store.createDesign({
      ...baseDesign(input),
      style: blueprint.style,
      blueprint,
      svgMaster: compiled.svg,
      scores: compiled.scores,
      lore: blueprint.lore,
      rasterPng: null,
      generationKey: null,
    });

    proposals.push({
      id: design.id,
      blueprint,
      previewUrl: `/api/preview?d=${design.id}&v=0&t=hierro`,
      scores: compiled.scores,
      explanation: batch.explanations[index] ?? "",
      engine: "local",
    });
  }

  return proposals;
}

async function rasterProposals(input: GenerateRequest, use: UseCaseKey, store: ForgeStore): Promise<ForgeProposal[]> {
  const styleId = recraftStyleId(input.style);
  if (!styleId) {
    throw new RecraftError(
      `Falta RECRAFT_STYLE_${input.style.toUpperCase()} en el entorno`,
      0,
      "style_id vacío: reinicia el servidor tras configurar .env.local",
    );
  }

  const direction = await buildArtDirectionPrompt({
    profile: input.profile,
    initials: input.initials,
    style: input.style,
    use,
    notes: input.notes,
  });

  const batches = await Promise.all(
    RASTER_VARIANTS.map((variant) =>
      generateRecraftRaster({
        prompt: `${direction.prompt} ${variant.suffix}`,
        styleId,
        count: 1,
      }),
    ),
  );
  const rasters = batches.map((batch) => batch[0]);

  const blueprints = buildDeterministicBlueprints(input.profile, input.initials, input.style);
  const generationKey = generationKeyFor(input, use);
  const proposals: ForgeProposal[] = [];

  for (let index = 0; index < blueprints.length && index < rasters.length; index += 1) {
    const forged = { ...blueprints[index], lore: RASTER_VARIANTS[index].description };
    let compiled;
    try {
      compiled = compileForge(forged, input.initials);
    } catch {
      continue;
    }

    const design = await store.createDesign({
      ...baseDesign(input),
      style: forged.style,
      blueprint: forged,
      svgMaster: compiled.svg,
      scores: compiled.scores,
      lore: forged.lore,
      rasterPng: rasters[index].mask.toString("base64"),
      generationKey,
    });

    proposals.push({
      id: design.id,
      blueprint: forged,
      previewUrl: `/api/preview?d=${design.id}&v=0&t=hierro`,
      scores: compiled.scores,
      explanation: forged.lore,
      engine: "ia",
    });
  }

  if (proposals.length === 0) {
    throw new RecraftError("Recraft devolvió láminas no forjables", 0, "ninguna máscara pudo compilarse");
  }

  return proposals;
}

async function replayCached(cached: DesignRecord[], input: GenerateRequest, store: ForgeStore): Promise<ForgeProposal[]> {
  const proposals: ForgeProposal[] = [];

  for (const entry of cached) {
    const design = await store.createDesign({
      ...baseDesign(input),
      style: entry.style,
      blueprint: entry.blueprint,
      svgMaster: entry.svgMaster,
      scores: entry.scores,
      lore: entry.lore,
      rasterPng: entry.rasterPng,
      generationKey: entry.generationKey,
    });
    proposals.push({
      ...proposalFor(design, input),
      explanation: entry.rasterPng ? entry.blueprint.lore : explainBlueprint(entry.blueprint, input.profile),
    });
  }

  return proposals;
}

function respond(proposals: ForgeProposal[], remainingToday: number) {
  const payload = generateResponseSchema.parse({
    designId: proposals[0].id,
    tier: "free",
    proposals,
    remainingToday: Math.max(0, remainingToday),
  });
  return NextResponse.json(payload, { status: 200, headers: NO_STORE });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = generateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos de forja no válidos",
          issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        },
        { status: 400, headers: NO_STORE },
      );
    }

    const input = parsed.data;
    const use = resolveUse(input);
    const generationKey = generationKeyFor(input, use);
    const store = await getStore();

    const cached = await store.findGeneration(generationKey);
    if (cached.length > 0) {
      const proposals = await replayCached(cached, input, store);
      if (proposals.length > 0) {
        const remaining = await peekFreeAiGeneration(request);
        return respond(proposals, remaining.remaining);
      }
    }

    const limitPerHour = Number(process.env.RATE_LIMIT_GENERATE_PER_HOUR ?? 20);
    const limit = await rateLimit(clientKey(request, "generate"), limitPerHour, 3600);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de forja por hora. Inténtalo más tarde." },
        {
          status: 429,
          headers: { ...NO_STORE, "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
        },
      );
    }

    if (!hasRecraft()) {
      const proposals = await forgeProposals(input, store);
      if (proposals.length === 0) {
        return NextResponse.json(
          { error: "No se pudo forjar ninguna propuesta. Revisa los datos." },
          { status: 500, headers: NO_STORE },
        );
      }
      return respond(proposals, limit.remaining);
    }

    const daily = await consumeFreeAiGeneration(request);
    if (!daily.success) {
      const retryAfter = Math.max(1, Math.ceil((daily.resetAt - Date.now()) / 1000));
      return NextResponse.json(
        {
          error: `Has agotado tus ${FREE_AI_DAILY_LIMIT} láminas gratuitas con IA de hoy. Vuelve mañana o solicita una revisión profesional de tu hierro.`,
          remainingToday: 0,
        },
        { status: 429, headers: { ...NO_STORE, "Retry-After": String(retryAfter) } },
      );
    }

    let proposals: ForgeProposal[];
    try {
      proposals = await rasterProposals(input, use, store);
    } catch (error) {
      await releaseFreeAiGeneration(request);
      const detail =
        error instanceof RecraftError
          ? `status ${error.status} · ${error.detail}`
          : error instanceof Error
            ? error.message
            : "error desconocido";
      console.error(`[recraft] fallo al forjar ${generationKey}: ${detail}`);
      return NextResponse.json(
        {
          error:
            "Recraft no ha devuelto las láminas y no se ha consumido tu cupo diario. Reinténtalo en unos segundos; si persiste, avísanos.",
          remainingToday: daily.remaining + 1,
        },
        { status: 502, headers: NO_STORE },
      );
    }

    return respond(proposals, daily.remaining);
  } catch {
    return NextResponse.json({ error: "La fragua no está disponible ahora mismo." }, { status: 500, headers: NO_STORE });
  }
}
