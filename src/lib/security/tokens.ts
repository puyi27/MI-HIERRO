import fs from "node:fs";
import path from "node:path";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { downloadTokenPayloadSchema, type DownloadTokenPayload } from "@/types/forge";

const DEV_SECRET = "mi-hierro-local-development-secret-do-not-use-in-production";
const DEFAULT_TTL_SECONDS = 60 * 60 * 72;

let localSecretCache: string | null = null;
let warnedAboutFallback = false;

function localSecretFile(): string {
  return path.resolve(process.cwd(), ".data/download-token-secret");
}

function productionFallbackSecret(): string {
  if (localSecretCache) return localSecretCache;
  if (!warnedAboutFallback) {
    warnedAboutFallback = true;
    console.warn(
      "[mi-hierro] DOWNLOAD_TOKEN_SECRET no configurado: se usa un secreto local persistente. Configúralo antes de desplegar en varios nodos.",
    );
  }
  const target = localSecretFile();
  try {
    if (fs.existsSync(target)) {
      const stored = fs.readFileSync(target, "utf8").trim();
      if (stored.length >= 16) {
        localSecretCache = stored;
        return stored;
      }
    }
    const generated = randomBytes(32).toString("base64url");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, generated, "utf8");
    localSecretCache = generated;
    return generated;
  } catch {
    throw new Error("DOWNLOAD_TOKEN_SECRET es obligatorio: no se pudo persistir un secreto local en este entorno");
  }
}

export function tokenSecret(): string {
  const configured = process.env.DOWNLOAD_TOKEN_SECRET;
  if (configured && configured.length >= 16) return configured;
  if (process.env.NODE_ENV === "production") return productionFallbackSecret();
  return DEV_SECRET;
}

function sign(value: string): string {
  return createHmac("sha256", tokenSecret()).update(value).digest("base64url");
}

export function createDownloadToken(
  payload: Omit<DownloadTokenPayload, "x">,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): string {
  const fullPayload: DownloadTokenPayload = {
    ...payload,
    x: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload), "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export type TokenVerification =
  | { ok: true; payload: DownloadTokenPayload }
  | { ok: false; reason: "malformed" | "signature" | "expired" | "payload" };

export function verifyDownloadToken(token: string): TokenVerification {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "malformed" };

  const [encoded, signature] = parts;
  const expected = sign(encoded);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return { ok: false, reason: "signature" };
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return { ok: false, reason: "signature" };

  try {
    const decoded = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    const parsed = downloadTokenPayloadSchema.safeParse(decoded);
    if (!parsed.success) return { ok: false, reason: "payload" };
    if (parsed.data.x * 1000 < Date.now()) return { ok: false, reason: "expired" };
    return { ok: true, payload: parsed.data };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}
