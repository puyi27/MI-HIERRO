import { NextResponse } from "next/server";
import {
  generateRequestSchema,
  generateResponseSchema,
  type ForgeProposal,
  type GenerateRequest,
  type ProfileType,
  type UseCaseKey,
} from "@/types/forge";
import { generateArtDirections, generateBlueprints } from "@/lib/ai/gemini";
import { RecraftError, generateRecraftRaster, hasRecraft, recraftStyleId } from "@/lib/ai/recraft";
import { compileForge } from "@/lib/forge-engine/compiler";
import { buildDeterministicBlueprints, explainBlueprint } from "@/lib/forge-engine/presets";
import { getStore } from "@/lib/store";
import type { CreateDesignInput, ForgeStore, ForgeUserRecord } from "@/lib/store/types";
import {
  FREE_AI_DAILY_LIMIT,
  clientKey,
  consumeFreeAiGeneration,
  rateLimit,
  releaseFreeAiGeneration,
} from "@/lib/security/rate-limit";
import {
  applySessionCookie,
  creditsRemaining,
  resolveForgeSession,
  type ForgeSession,
} from "@/lib/security/session";
import { isAdminRequest } from "@/lib/security/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;
const UNLIMITED_REMAINING = 999;

const DEFAULT_USE: Record<ProfileType, UseCaseKey> = {
  novillero: "bordado_oro",
  ganaderia: "fuego",
  particular: "piel",
};

function resolveUse(input: GenerateRequest): UseCaseKey {
  return input.use ?? DEFAULT_USE[input.profile.profile];
}

function baseDesign(input: GenerateRequest, userId: string): Omit<CreateDesignInput, "style" | "blueprint" | "svgMaster" | "scores" | "lore"> {
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
    userId,
  };
}

function remainingFor(user: ForgeUserRecord, fallbacks: Array<number | null>, unlimited: boolean): number {
  if (unlimited) return UNLIMITED_REMAINING;
  const available = fallbacks.filter((value): value is number => typeof value === "number");
  return Math.max(0, Math.min(creditsRemaining(user), ...available));
}

async function forgeProposals(input: GenerateRequest, store: ForgeStore, userId: string): Promise<ForgeProposal[]> {
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
      ...baseDesign(input, userId),
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

async function rasterProposals(
  input: GenerateRequest,
  use: UseCaseKey,
  store: ForgeStore,
  userId: string,
): Promise<ForgeProposal[]> {
  const styleId = recraftStyleId(input.style);
  if (!styleId) {
    throw new RecraftError(
      `Falta RECRAFT_STYLE_${input.style.toUpperCase()} en el entorno`,
      0,
      "style_id vacío: reinicia el servidor tras configurar .env.local",
    );
  }

  const directions = await generateArtDirections({
    profile: input.profile,
    initials: input.initials,
    style: input.style,
    use,
    ornament: input.profile.remate,
    notes: input.notes,
  });
  const label = `${input.initials.label.toUpperCase()}|${input.style}|${use}`;

  if (process.env.NODE_ENV !== "production") {
    directions.forEach((direction) => {
      console.info(`[art-direction] ${label} · ${direction.recipeName}\n${direction.recraftPrompt}`);
    });
  }

  const batches = await Promise.all(
    directions.map((direction) =>
      generateRecraftRaster({
        prompt: direction.recraftPrompt,
        styleId,
        count: 1,
      }),
    ),
  );
  const rasters = batches.map((batch) => batch[0]);

  const blueprints = buildDeterministicBlueprints(input.profile, input.initials, input.style);
  const proposals: ForgeProposal[] = [];

  for (let index = 0; index < blueprints.length && index < rasters.length; index += 1) {
    const forged = { ...blueprints[index], lore: directions[index]?.lore ?? blueprints[index].lore };
    let compiled;
    try {
      compiled = compileForge(forged, input.initials);
    } catch {
      continue;
    }

    const design = await store.createDesign({
      ...baseDesign(input, userId),
      style: forged.style,
      blueprint: forged,
      svgMaster: compiled.svg,
      scores: compiled.scores,
      lore: forged.lore,
      rasterPng: rasters[index].mask.toString("base64"),
      generationKey: null,
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

function respond(proposals: ForgeProposal[], remainingToday: number, session: ForgeSession) {
  const payload = generateResponseSchema.parse({
    designId: proposals[0].id,
    tier: "free",
    proposals,
    remainingToday: Math.max(0, remainingToday),
  });
  return applySessionCookie(NextResponse.json(payload, { status: 200, headers: NO_STORE }), session);
}

function reject(body: Record<string, unknown>, status: number, session: ForgeSession, headers: Record<string, string> = {}) {
  return applySessionCookie(
    NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } }),
    session,
  );
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
    const store = await getStore();
    const session = await resolveForgeSession(request, store);
    let user = session.user;
    const unlimited = user.unlimited || isAdminRequest(request);

    if (!unlimited && creditsRemaining(user) <= 0) {
      return reject(
        {
          error: `Has agotado los ${user.creditsLimit} diseños de tu pack actual. Activa Generación Infinita o amplía créditos para seguir forjando.`,
          remainingToday: 0,
        },
        429,
        session,
      );
    }

    let hourlyRemaining: number | null = null;
    if (!unlimited) {
      const limitPerHour = Number(process.env.RATE_LIMIT_GENERATE_PER_HOUR ?? 20);
      const limit = await rateLimit(clientKey(request, "generate"), limitPerHour, 3600);
      if (!limit.success) {
        return reject(
          { error: "Has alcanzado el límite de forja por hora. Inténtalo más tarde." },
          429,
          session,
          { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
        );
      }
      hourlyRemaining = limit.remaining;
    }

    if (!hasRecraft()) {
      const proposals = await forgeProposals(input, store, user.id);
      if (proposals.length === 0) {
        return reject({ error: "No se pudo forjar ninguna propuesta. Revisa los datos." }, 500, session);
      }
      if (!unlimited) {
        const updated = await store.consumeForgeCredit(user.id);
        user = updated ?? { ...user, creditsUsed: user.creditsUsed + 1 };
      }
      return respond(proposals, remainingFor(user, [hourlyRemaining], unlimited), session);
    }

    let dailyRemaining: number | null = null;
    if (!unlimited) {
      const daily = await consumeFreeAiGeneration(request);
      if (!daily.success) {
        const retryAfter = Math.max(1, Math.ceil((daily.resetAt - Date.now()) / 1000));
        return reject(
          {
            error: `Has agotado tus ${FREE_AI_DAILY_LIMIT} láminas gratuitas con IA de hoy. Vuelve mañana o solicita una revisión profesional de tu hierro.`,
            remainingToday: 0,
          },
          429,
          session,
          { "Retry-After": String(retryAfter) },
        );
      }
      dailyRemaining = daily.remaining;
    }

    let proposals: ForgeProposal[];
    try {
      proposals = await rasterProposals(input, use, store, user.id);
    } catch (error) {
      if (!unlimited) await releaseFreeAiGeneration(request);
      const detail =
        error instanceof RecraftError
          ? `status ${error.status} · ${error.detail}`
          : error instanceof Error
            ? error.message
            : "error desconocido";
      console.error(`[recraft] fallo al forjar ${input.initials.label}|${input.style}|${use}: ${detail}`);
      return reject(
        {
          error:
            "Recraft no ha devuelto las láminas y no se ha consumido tu cupo diario. Reinténtalo en unos segundos; si persiste, avísanos.",
          remainingToday: unlimited ? UNLIMITED_REMAINING : (dailyRemaining ?? 0) + 1,
        },
        502,
        session,
      );
    }

    if (!unlimited) {
      const updated = await store.consumeForgeCredit(user.id);
      user = updated ?? { ...user, creditsUsed: user.creditsUsed + 1 };
    }

    return respond(proposals, remainingFor(user, [dailyRemaining], unlimited), session);
  } catch {
    return NextResponse.json({ error: "La fragua no está disponible ahora mismo." }, { status: 500, headers: NO_STORE });
  }
}
