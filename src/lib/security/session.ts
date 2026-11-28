import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";
import type { ActivePack, ForgeStore, ForgeUserRecord } from "@/lib/store/types";
import { tokenSecret } from "@/lib/security/tokens";

export const SESSION_COOKIE = "mihierro_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 365;

export interface SessionSnapshot {
  userId: string;
  activePack: ActivePack;
  creditsLimit: number;
  creditsUsed: number;
  creditsRemaining: number | null;
  unlimited: boolean;
}

export interface ForgeSession {
  user: ForgeUserRecord;
  cookieValue?: string;
  maxAge?: number;
}

function sessionSecret(): string {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 16) return configured;
  return tokenSecret();
}

function sign(token: string): string {
  return createHmac("sha256", sessionSecret()).update(`mi-hierro-session:${token}`).digest("base64url");
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function createSessionCookieValue(token: string): string {
  return `${token}.${sign(token)}`;
}

export function verifySessionCookieValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;
  const token = value.slice(0, separator);
  const provided = Buffer.from(value.slice(separator + 1));
  const expected = Buffer.from(sign(token));
  if (provided.length !== expected.length) return null;
  return timingSafeEqual(provided, expected) ? token : null;
}

export function readSessionCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${SESSION_COOKIE}=`)) continue;
    const raw = trimmed.slice(SESSION_COOKIE.length + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function creditsRemaining(user: ForgeUserRecord): number {
  if (user.unlimited) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, user.creditsLimit - user.creditsUsed);
}

export function sessionSnapshot(user: ForgeUserRecord): SessionSnapshot {
  return {
    userId: user.id,
    activePack: user.activePack,
    creditsLimit: user.creditsLimit,
    creditsUsed: user.creditsUsed,
    creditsRemaining: user.unlimited ? null : creditsRemaining(user),
    unlimited: user.unlimited,
  };
}

export async function resolveForgeSession(request: Request, store: ForgeStore): Promise<ForgeSession> {
  const token = verifySessionCookieValue(readSessionCookie(request));
  if (token) {
    const existing = await store.getForgeUserByToken(token);
    if (existing) return { user: existing };
    const adopted = await store.createForgeUser({ sessionToken: token });
    return { user: adopted, cookieValue: createSessionCookieValue(token), maxAge: SESSION_TTL_SECONDS };
  }

  const freshToken = createSessionToken();
  const user = await store.createForgeUser({ sessionToken: freshToken });
  return { user, cookieValue: createSessionCookieValue(freshToken), maxAge: SESSION_TTL_SECONDS };
}

export function applySessionCookie(response: NextResponse, session: ForgeSession): NextResponse {
  if (!session.cookieValue) return response;
  const options = sessionCookieOptions(session.maxAge ?? SESSION_TTL_SECONDS);
  response.cookies.set({
    name: options.name,
    value: session.cookieValue,
    httpOnly: options.httpOnly,
    sameSite: options.sameSite,
    secure: options.secure,
    path: options.path,
    maxAge: options.maxAge,
  });
  return response;
}
