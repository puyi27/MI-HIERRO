import { NextResponse } from "next/server";
import { generateRequestSchema, generateResponseSchema, type ForgeProposal } from "@/types/forge";
import { generateBlueprints } from "@/lib/ai/gemini";
import { compileForge } from "@/lib/forge-engine/compiler";
import { getStore } from "@/lib/store";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

export async function POST(request: Request) {
  try {
    const limitPerHour = Number(process.env.RATE_LIMIT_GENERATE_PER_HOUR ?? 20);
    const limit = await rateLimit(clientKey(request, "generate"), limitPerHour, 3600);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de forja por hora. Inténtalo más tarde." },
        { status: 429, headers: { ...NO_STORE, "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } },
      );
    }

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
    const batch = await generateBlueprints(input);
    const store = await getStore();

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
        profile: input.profile.profile,
        firstName: input.profile.firstName,
        lastName1: input.profile.lastName1,
        lastName2: input.profile.lastName2,
        nickname: input.profile.nickname,
        origin: input.profile.origin,
        character: input.profile.character,
        remate: input.profile.remate,
        initials: input.initials.label,
        style: blueprint.style,
        blueprint,
        svgMaster: compiled.svg,
        scores: compiled.scores,
        lore: blueprint.lore,
      });

      proposals.push({
        id: design.id,
        blueprint,
        previewUrl: `/api/preview?d=${design.id}&v=0&t=hierro`,
        scores: compiled.scores,
        explanation: batch.explanations[index] ?? "",
      });
    }

    if (proposals.length === 0) {
      return NextResponse.json({ error: "No se pudo forjar ninguna propuesta. Revisa los datos." }, { status: 500, headers: NO_STORE });
    }

    const payload = generateResponseSchema.parse({
      designId: proposals[0].id,
      tier: "free",
      proposals,
      remainingToday: Math.max(0, limit.remaining),
    });

    return NextResponse.json(payload, { status: 200, headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: "La fragua no está disponible ahora mismo." }, { status: 500, headers: NO_STORE });
  }
}
