import { describe, expect, it, vi } from "vitest";
import { createDownloadToken, verifyDownloadToken } from "@/lib/security/tokens";

const payload = { d: "design-1", o: "order-1", p: "premium" as const };

describe("tokens de descarga", () => {
  it("firma y verifica un token válido", () => {
    const token = createDownloadToken(payload, 3600);
    const verified = verifyDownloadToken(token);
    expect(verified.ok).toBe(true);
    if (verified.ok) {
      expect(verified.payload.d).toBe("design-1");
      expect(verified.payload.o).toBe("order-1");
      expect(verified.payload.p).toBe("premium");
    }
  });

  it("rechaza un token manipulado", () => {
    const token = createDownloadToken(payload, 3600);
    const tampered = `${token.slice(0, -2)}xx`;
    const verified = verifyDownloadToken(tampered);
    expect(verified.ok).toBe(false);
    if (!verified.ok) expect(verified.reason).toBe("signature");
  });

  it("rechaza un payload alterado sin firma nueva", () => {
    const token = createDownloadToken(payload, 3600);
    const [encoded, signature] = token.split(".");
    const forgedPayload = Buffer.from(JSON.stringify({ ...payload, p: "similarity" })).toString("base64url");
    const verified = verifyDownloadToken(`${forgedPayload}.${signature}`);
    expect(verified.ok).toBe(false);
    if (!verified.ok) expect(verified.reason).toBe("signature");
    expect(encoded.length).toBeGreaterThan(10);
  });

  it("rechaza tokens caducados", () => {
    const token = createDownloadToken(payload, -60);
    const verified = verifyDownloadToken(token);
    expect(verified.ok).toBe(false);
    if (!verified.ok) expect(verified.reason).toBe("expired");
  });

  it("firma y verifica en producción sin DOWNLOAD_TOKEN_SECRET configurado", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DOWNLOAD_TOKEN_SECRET", "");
    try {
      const token = createDownloadToken(payload, 3600);
      const verified = verifyDownloadToken(token);
      expect(verified.ok).toBe(true);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("rechaza formatos malformados", () => {
    expect(verifyDownloadToken("sin-punto").ok).toBe(false);
    expect(verifyDownloadToken("").ok).toBe(false);
    expect(verifyDownloadToken("a.b.c").ok).toBe(false);
  });
});
