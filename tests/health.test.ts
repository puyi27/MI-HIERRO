import path from "node:path";
import fs from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const storeFile = path.join(process.cwd(), ".data", `test-health-${process.pid}.json`);
process.env.MI_HIERRO_STORE_FILE = storeFile;
delete process.env.DATABASE_URL;
delete process.env.GEMINI_API_KEY;
delete process.env.STRIPE_SECRET_KEY;
delete process.env.RESEND_API_KEY;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
delete process.env.ADMIN_PASSWORD;
delete process.env.DOWNLOAD_TOKEN_SECRET;
delete process.env.VERCEL;

const { GET: healthGet } = await import("@/app/api/health/route");

beforeAll(async () => {
  await fs.rm(storeFile, { force: true });
});

afterAll(async () => {
  await fs.rm(storeFile, { force: true });
});

describe("salud del sistema", () => {
  it("declara los adaptadores locales activos sin exponer secretos", async () => {
    const response = await healthGet();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");

    const text = await response.text();
    expect(text).not.toMatch(/sk_live|sk_test_[A-Za-z0-9]{12}|AIza[0-9A-Za-z_-]{20}|re_[A-Za-z0-9]{20}/);

    const data = JSON.parse(text) as {
      service: string;
      status: string;
      store: { driver: string; reachable: boolean; error: string | null };
      integrations: Record<string, string>;
    };

    expect(data.service).toBe("mi-hierro");
    expect(data.status).toBe("ok");
    expect(data.store.driver).toBe("file");
    expect(data.store.reachable).toBe(true);
    expect(data.store.error).toBeNull();
    expect(data.integrations.database).toBe("file");
    expect(data.integrations.gemini).toBe("fallback");
    expect(data.integrations.stripe).toBe("simulation");
    expect(data.integrations.resend).toBe("log");
    expect(data.integrations.redis).toBe("memory");
    expect(data.integrations.downloadTokens).toBe("local-fallback");
    expect(data.integrations.admin).toBe("local-fallback");
  });
});
