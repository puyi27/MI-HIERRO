export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  backend: "upstash" | "memory";
}

interface Counter {
  count: number;
  resetAt: number;
}

const counters = new Map<string, Counter>();

function memoryLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const existing = counters.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000;
    counters.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt, backend: "memory" };
  }
  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  if (counters.size > 5000) {
    for (const [entryKey, counter] of counters) {
      if (counter.resetAt <= now) counters.delete(entryKey);
    }
  }
  return { success: existing.count <= limit, remaining, resetAt: existing.resetAt, backend: "memory" };
}

async function upstashLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  url: string,
  token: string,
): Promise<RateLimitResult> {
  const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSeconds), "NX"],
    ]),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Upstash respondió ${response.status}`);
  const data = (await response.json()) as Array<{ result?: number; error?: string }>;
  const count = Number(data[0]?.result ?? 1);
  const resetAt = Date.now() + windowSeconds * 1000;
  return { success: count <= limit, remaining: Math.max(0, limit - count), resetAt, backend: "upstash" };
}

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await upstashLimit(`mi-hierro:${key}`, limit, windowSeconds, url, token);
    } catch {
      return memoryLimit(key, limit, windowSeconds);
    }
  }
  return memoryLimit(key, limit, windowSeconds);
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const address = forwarded?.split(",")[0]?.trim() || realIp || "local";
  return `${scope}:${address}`;
}

export function resetMemoryRateLimit(): void {
  counters.clear();
}
