import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { applySessionCookie, resolveForgeSession, sessionSnapshot } from "@/lib/security/session";
import { isAdminRequest } from "@/lib/security/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

export async function GET(request: Request) {
  try {
    const isAdmin = isAdminRequest(request);
    const store = await getStore();
    const session = await resolveForgeSession(request, store);
    const snapshot = sessionSnapshot(session.user);
    const user = isAdmin ? { ...snapshot, unlimited: true, creditsRemaining: null } : snapshot;
    const response = NextResponse.json({ user, isAdmin }, { status: 200, headers: NO_STORE });
    return applySessionCookie(response, session);
  } catch {
    return NextResponse.json({ error: "La sesión no está disponible ahora mismo." }, { status: 500, headers: NO_STORE });
  }
}
