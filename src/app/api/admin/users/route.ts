import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/security/admin";
import { createSessionCookieValue, createSessionToken } from "@/lib/security/session";
import { getStore } from "@/lib/store";
import { ACTIVE_PACKS } from "@/lib/store/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

const createSchema = z.object({
  email: z.union([z.email(), z.literal("")]).optional(),
  name: z.string().trim().max(80).optional(),
  activePack: z.enum(ACTIVE_PACKS).optional(),
  creditsLimit: z.number().int().min(0).max(10000).optional(),
  unlimited: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: NO_STORE });
  }

  try {
    const store = await getStore();
    const users = await store.listForgeUsers(200);
    const withDesigns = await Promise.all(
      users.map(async (user) => {
        const designs = await store.listDesignsForUser(user.id, 20);
        return {
          ...user,
          designs: designs.map((design) => ({
            id: design.id,
            initials: design.initials,
            style: design.style,
            createdAt: design.createdAt,
          })),
        };
      }),
    );
    return NextResponse.json({ users: withDesigns }, { status: 200, headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: "No se pudo leer el almacén de usuarios" }, { status: 500, headers: NO_STORE });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: NO_STORE });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de usuario no válidos" }, { status: 400, headers: NO_STORE });
  }

  try {
    const store = await getStore();
    const token = createSessionToken();
    const user = await store.createForgeUser({
      sessionToken: token,
      email: parsed.data.email ? parsed.data.email : null,
      name: parsed.data.name ? parsed.data.name : null,
      activePack: parsed.data.activePack ?? "FREE",
      creditsLimit: parsed.data.creditsLimit ?? 2,
      unlimited: parsed.data.unlimited ?? false,
    });
    return NextResponse.json(
      { user, sessionToken: token, sessionCookie: createSessionCookieValue(token) },
      { status: 201, headers: NO_STORE },
    );
  } catch {
    return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500, headers: NO_STORE });
  }
}
