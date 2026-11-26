import { NextResponse } from "next/server";
import { getStore, usesDatabase } from "@/lib/store";
import { isServerlessRuntime } from "@/lib/runtime";
import { isAdminConfigured } from "@/lib/security/admin";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

function configured(name: string): boolean {
  const value = process.env[name];
  return Boolean(value && value.trim().length > 0);
}

export async function GET() {
  const startedAt = Date.now();

  let storeReachable = false;
  let storeError: string | null = null;
  try {
    const store = await getStore();
    await store.getOrder("__health_probe__");
    storeReachable = true;
  } catch {
    storeError = "store_unavailable";
  }

  let stripeLive = false;
  try {
    stripeLive = Boolean(getStripe());
  } catch {
    stripeLive = false;
  }

  const storeDriver = usesDatabase() ? "prisma" : "file";

  return NextResponse.json(
    {
      status: storeReachable ? "ok" : "degraded",
      service: "mi-hierro",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      runtime: {
        serverless: isServerlessRuntime(),
        node: process.version,
      },
      store: {
        driver: storeDriver,
        reachable: storeReachable,
        error: storeError,
      },
      integrations: {
        database: usesDatabase() ? "live" : "file",
        gemini: configured("GEMINI_API_KEY") ? "live" : "fallback",
        stripe: stripeLive ? "live" : "simulation",
        resend: configured("RESEND_API_KEY") ? "live" : "log",
        redis:
          configured("UPSTASH_REDIS_REST_URL") && configured("UPSTASH_REDIS_REST_TOKEN")
            ? "live"
            : "memory",
        downloadTokens: configured("DOWNLOAD_TOKEN_SECRET") ? "configured" : "local-fallback",
        admin: isAdminConfigured() ? "configured" : isServerlessRuntime() ? "missing" : "local-fallback",
      },
    },
    { status: 200, headers: NO_STORE },
  );
}
