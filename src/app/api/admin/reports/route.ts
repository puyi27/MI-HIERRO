import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/security/admin";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

const updateSchema = z.object({
  id: z.string().min(1).max(64),
  status: z.enum(["pending", "in_progress", "delivered"]),
});

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: NO_STORE });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado no válido" }, { status: 400, headers: NO_STORE });
  }

  const store = await getStore();
  const updated = await store.updateSimilarityStatus(parsed.data.id, parsed.data.status);
  if (!updated) {
    return NextResponse.json({ error: "Informe no encontrado" }, { status: 404, headers: NO_STORE });
  }

  return NextResponse.json({ ok: true, report: updated }, { status: 200, headers: NO_STORE });
}
