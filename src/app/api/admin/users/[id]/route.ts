import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/security/admin";
import { getStore } from "@/lib/store";
import { ACTIVE_PACKS } from "@/lib/store/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

const patchSchema = z.object({
  activePack: z.enum(ACTIVE_PACKS).optional(),
  creditsLimit: z.number().int().min(0).max(10000).optional(),
  creditsUsed: z.number().int().min(0).max(100000).optional(),
  addCredits: z.number().int().min(1).max(100).optional(),
  resetCredits: z.boolean().optional(),
  unlimited: z.boolean().optional(),
  email: z.union([z.email(), z.literal(""), z.null()]).optional(),
  name: z.union([z.string().trim().max(80), z.literal(""), z.null()]).optional(),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: NO_STORE });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Cambios no válidos" }, { status: 400, headers: NO_STORE });
  }

  try {
    const store = await getStore();
    const current = await store.getForgeUser(id);
    if (!current) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404, headers: NO_STORE });
    }

    const patch = parsed.data;
    const creditsLimit =
      patch.creditsLimit !== undefined
        ? patch.creditsLimit
        : patch.addCredits !== undefined
          ? Math.min(10000, current.creditsLimit + patch.addCredits)
          : undefined;
    const creditsUsed = patch.resetCredits ? 0 : patch.creditsUsed;

    const user = await store.updateForgeUser(id, {
      activePack: patch.activePack,
      creditsLimit,
      creditsUsed,
      unlimited: patch.unlimited,
      email: patch.email === undefined ? undefined : patch.email === "" ? null : patch.email,
      name: patch.name === undefined ? undefined : patch.name === "" ? null : patch.name,
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404, headers: NO_STORE });
    }
    return NextResponse.json({ user }, { status: 200, headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el usuario" }, { status: 500, headers: NO_STORE });
  }
}
