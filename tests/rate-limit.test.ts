import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetMemoryRateLimit } from "@/lib/security/rate-limit";

beforeEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  resetMemoryRateLimit();
});

describe("rate limit local", () => {
  it("permite hasta el límite y bloquea después", async () => {
    const first = await rateLimit("test:a", 2, 60);
    const second = await rateLimit("test:a", 2, 60);
    const third = await rateLimit("test:a", 2, 60);
    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(second.remaining).toBe(0);
    expect(third.success).toBe(false);
    expect(first.backend).toBe("memory");
  });

  it("aísla contadores por clave", async () => {
    await rateLimit("test:b", 1, 60);
    const blocked = await rateLimit("test:b", 1, 60);
    const other = await rateLimit("test:c", 1, 60);
    expect(blocked.success).toBe(false);
    expect(other.success).toBe(true);
  });
});
