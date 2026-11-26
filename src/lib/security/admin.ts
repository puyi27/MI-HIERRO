import { createHmac, timingSafeEqual } from "node:crypto";
import { isServerlessRuntime } from "@/lib/runtime";

export const ADMIN_COOKIE = "mi_hierro_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const LOCAL_ADMIN_PASSWORD = "mi-hierro-local-admin";

let warnedAboutLocalPassword = false;

export function isAdminConfigured(): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  return Boolean(configured && configured.length >= 8);
}

export function adminPassword(): string {
  const configured = process.env.ADMIN_PASSWORD;
  if (configured && configured.length >= 8) return configured;
  if (isServerlessRuntime()) {
    throw new Error("ADMIN_PASSWORD es obligatorio en Vercel: define una contraseña de al menos 8 caracteres.");
  }
  if (!warnedAboutLocalPassword) {
    warnedAboutLocalPassword = true;
    console.warn("[mi-hierro] ADMIN_PASSWORD no configurada: se usa la contraseña local de desarrollo en /admin.");
  }
  return LOCAL_ADMIN_PASSWORD;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", adminPassword()).update(`mi-hierro-admin:${expiresAt}`).digest("base64url");
}

export function createAdminSession(): { value: string; maxAge: number } {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return { value: `${expiresAt}.${sign(expiresAt)}`, maxAge: SESSION_TTL_SECONDS };
}

export function verifyAdminSession(value: string | undefined | null): boolean {
  if (!value) return false;
  try {
    const [rawExpires, signature] = value.split(".");
    const expiresAt = Number(rawExpires);
    if (!Number.isInteger(expiresAt) || !signature) return false;
    if (expiresAt * 1000 < Date.now()) return false;
    const expected = Buffer.from(sign(expiresAt));
    const provided = Buffer.from(signature);
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

export function passwordMatches(candidate: string): boolean {
  try {
    const expected = Buffer.from(adminPassword());
    const provided = Buffer.from(candidate);
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

export function adminCookieOptions(maxAge: number) {
  return {
    name: ADMIN_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
