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

export const FREE_AI_DAILY_LIMIT = 2;

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

function memoryPeek(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const existing = counters.get(key);
  if (!existing || existing.resetAt <= now) {
    return { success: true, remaining: limit, resetAt: now + windowSeconds * 1000, backend: "memory" };
  }
  return {
    success: existing.count < limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    backend: "memory",
  };
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

async function upstashPeek(
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
    body: JSON.stringify([["GET", key]]),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Upstash respondió ${response.status}`);
  const data = (await response.json()) as Array<{ result?: number | null; error?: string }>;
  const count = Number(data[0]?.result ?? 0);
  return {
    success: count < limit,
    remaining: Math.max(0, limit - count),
    resetAt: Date.now() + windowSeconds * 1000,
    backend: "upstash",
  };
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

export function deviceKey(request: Request, scope: string): string {
  const device = request.headers.get("x-device-id")?.trim().slice(0, 64);
  const base = clientKey(request, scope);
  return device ? `${base}:${device}` : base;
}

function secondsUntilUtcMidnight(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(60, Math.ceil((next - now.getTime()) / 1000));
}

function freeAiDailyKey(request: Request, now: Date): string {
  return `${deviceKey(request, "ia-diaria")}:${now.toISOString().slice(0, 10)}`;
}

export async function consumeFreeAiGeneration(request: Request, now = new Date()): Promise<RateLimitResult> {
  return rateLimit(freeAiDailyKey(request, now), FREE_AI_DAILY_LIMIT, secondsUntilUtcMidnight(now));
}

async function upstashRelease(key: string, url: string, token: string): Promise<void> {
  await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([["DECR", key]]),
    cache: "no-store",
  });
}

export async function releaseFreeAiGeneration(request: Request, now = new Date()): Promise<void> {
  const key = freeAiDailyKey(request, now);
  const memory = counters.get(key);
  if (memory) {
    memory.count = Math.max(0, memory.count - 1);
    if (memory.count === 0) counters.delete(key);
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await upstashRelease(`mi-hierro:${key}`, url, token);
  } catch {
    return;
  }
}

export async function peekFreeAiGeneration(request: Request, now = new Date()): Promise<RateLimitResult> {
  const key = freeAiDailyKey(request, now);
  const windowSeconds = secondsUntilUtcMidnight(now);
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await upstashPeek(`mi-hierro:${key}`, FREE_AI_DAILY_LIMIT, windowSeconds, url, token);
    } catch {
      return memoryPeek(key, FREE_AI_DAILY_LIMIT, windowSeconds);
    }
  }
  return memoryPeek(key, FREE_AI_DAILY_LIMIT, windowSeconds);
}

export function resetMemoryRateLimit(): void {
  counters.clear();
}
