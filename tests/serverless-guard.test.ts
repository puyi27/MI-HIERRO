import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("DOWNLOAD_TOKEN_SECRET", "");
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("ADMIN_PASSWORD", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("guardas serverless", () => {
  it("exige DOWNLOAD_TOKEN_SECRET en Vercel", async () => {
    const { tokenSecret, createDownloadToken } = await import("@/lib/security/tokens");
    expect(() => tokenSecret()).toThrow(/DOWNLOAD_TOKEN_SECRET/);
    expect(() => createDownloadToken({ d: "diseno", o: "pedido", p: "premium" })).toThrow(/DOWNLOAD_TOKEN_SECRET/);
  });

  it("no permite el almacén de fichero en Vercel sin DATABASE_URL", async () => {
    const { getStore } = await import("@/lib/store");
    await expect(getStore()).rejects.toThrow(/DATABASE_URL/);
  });

  it("exige ADMIN_PASSWORD en Vercel", async () => {
    const { adminPassword, passwordMatches } = await import("@/lib/security/admin");
    expect(() => adminPassword()).toThrow(/ADMIN_PASSWORD/);
    expect(passwordMatches("mi-hierro-local-admin")).toBe(false);
  });

  it("/api/health responde degradado sin intentar escribir en disco", async () => {
    const { GET: healthGet } = await import("@/app/api/health/route");
    const response = await healthGet();
    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      status: string;
      runtime: { serverless: boolean };
      store: { driver: string; reachable: boolean; error: string | null };
      integrations: Record<string, string>;
    };
    expect(data.status).toBe("degraded");
    expect(data.runtime.serverless).toBe(true);
    expect(data.store.reachable).toBe(false);
    expect(data.store.error).toBe("store_unavailable");
    expect(data.integrations.admin).toBe("missing");
  });
});
