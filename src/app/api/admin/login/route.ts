import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCookieOptions, createAdminSession, passwordMatches } from "@/lib/security/admin";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "admin-login"), 8, 900);
  if (!limit.success) {
    return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429, headers: NO_STORE });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Introduce la contraseña del panel." }, { status: 400, headers: NO_STORE });
  }

  if (!passwordMatches(parsed.data.password)) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401, headers: NO_STORE });
  }

  const session = createAdminSession();
  const options = adminCookieOptions(session.maxAge);
  const response = NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE });
  response.cookies.set({
    name: options.name,
    value: session.value,
    httpOnly: options.httpOnly,
    sameSite: options.sameSite,
    secure: options.secure,
    path: options.path,
    maxAge: options.maxAge,
  });
  return response;
}
