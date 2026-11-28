import path from "node:path";
import fs from "node:fs/promises";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ForgeStyle } from "@/types/forge";

const storeFile = path.join(process.cwd(), ".data", `test-session-${process.pid}.json`);
process.env.MI_HIERRO_STORE_FILE = storeFile;
process.env.ADMIN_PASSWORD = "clave-panel-sesiones-prueba";
process.env.RECRAFT_API_KEY = "test-recraft-key";
process.env.RECRAFT_STYLE_TRADICIONAL = "style-tradicional";
process.env.RECRAFT_STYLE_MONOGRAMA = "style-monograma";
process.env.RECRAFT_STYLE_GEOMETRICO = "style-geometrico";
process.env.RECRAFT_STYLE_HERALDICO = "style-heraldico";
delete process.env.GEMINI_API_KEY;
delete process.env.DATABASE_URL;
delete process.env.VERCEL;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

const { POST: generatePost } = await import("@/app/api/generate/route");
const { GET: sessionGet } = await import("@/app/api/session/route");
const { GET: usersGet, POST: usersPost } = await import("@/app/api/admin/users/route");
const { PATCH: userPatch } = await import("@/app/api/admin/users/[id]/route");
const { fileStore } = await import("@/lib/store/file-store");
const { ADMIN_COOKIE, createAdminSession } = await import("@/lib/security/admin");
const { resetMemoryRateLimit } = await import("@/lib/security/rate-limit");

interface GenerateBody {
  designId: string;
  proposals: Array<{ id: string }>;
  remainingToday: number;
  error?: string;
}

interface SessionBody {
  user: {
    userId: string;
    activePack: string;
    creditsLimit: number;
    creditsUsed: number;
    creditsRemaining: number | null;
    unlimited: boolean;
  };
  isAdmin: boolean;
}

interface AdminUserBody {
  id: string;
  activePack: string;
  creditsLimit: number;
  creditsUsed: number;
  unlimited: boolean;
}

const fetchMock = vi.fn();
let adminUserId = "";

async function silhouettePng(): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#FFFFFF"/><path d="M120 96H392V176H300V416H212V176H120Z" fill="#000000"/></svg>';
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function installFetch() {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/images/generations")) {
      const png = await silhouettePng();
      return new Response(JSON.stringify({ data: [{ b64_json: png.toString("base64") }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
}

function generationCalls(): number {
  return fetchMock.mock.calls.filter((call) => String(call[0]).includes("/images/generations")).length;
}

function bodyFor(letters: string[], style: ForgeStyle) {
  return JSON.stringify({
    profile: {
      profile: "ganaderia",
      firstName: "Joaquín",
      lastName1: "García",
      lastName2: "Moreno",
      origin: "Salamanca",
      character: "senorial",
      remate: "cruz-forja",
    },
    initials: {
      id: `dos-${letters.join("")}`,
      letters,
      label: letters.join(""),
      kind: "dos",
      primary: letters[0],
      secondary: letters[1],
    },
    style,
    use: "fuego",
  });
}

async function generate(letters: string[], style: ForgeStyle, ip: string, cookie?: string) {
  const response = await generatePost(
    new Request("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
        ...(cookie ? { cookie } : {}),
      },
      body: bodyFor(letters, style),
    }),
  );
  const text = await response.text();
  return { response, data: JSON.parse(text) as GenerateBody, cookie: response.headers.get("set-cookie") ?? "" };
}

async function readSession(cookie: string) {
  const response = await sessionGet(
    new Request("http://localhost:3000/api/session", { headers: { cookie } }),
  );
  const data = (await response.json()) as SessionBody;
  return { response, data };
}

function cookiePair(setCookie: string): string {
  return setCookie.split(";")[0];
}

function adminCookie(): string {
  return `${ADMIN_COOKIE}=${createAdminSession().value}`;
}

function adminList(cookie?: string) {
  return usersGet(
    new NextRequest("http://localhost:3000/api/admin/users", {
      headers: cookie ? { cookie } : {},
    }),
  );
}

function adminCreate(body: unknown, cookie?: string) {
  return usersPost(
    new NextRequest("http://localhost:3000/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    }),
  );
}

function adminUpdate(id: string, body: unknown, cookie?: string) {
  return userPatch(
    new NextRequest(`http://localhost:3000/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

beforeAll(async () => {
  await fs.rm(storeFile, { force: true });
  installFetch();
  const user = await fileStore.createForgeUser({
    sessionToken: "panel-target-session-token",
    name: "Cliente Panel",
    email: "panel@mihierro.es",
    activePack: "FREE",
    creditsLimit: 2,
  });
  adminUserId = user.id;
});

afterAll(async () => {
  await fs.rm(storeFile, { force: true });
  vi.unstubAllGlobals();
});

beforeEach(() => {
  resetMemoryRateLimit();
  fetchMock.mockClear();
  process.env.RECRAFT_API_KEY = "test-recraft-key";
  process.env.RECRAFT_STYLE_TRADICIONAL = "style-tradicional";
  process.env.RECRAFT_STYLE_MONOGRAMA = "style-monograma";
  process.env.RECRAFT_STYLE_GEOMETRICO = "style-geometrico";
  process.env.RECRAFT_STYLE_HERALDICO = "style-heraldico";
});

describe("Generación sin caché compartida", () => {
  it("dos llamadas con las mismas iniciales producen láminas distintas y vuelven a facturar", async () => {
    const first = await generate(["J", "G"], "heraldico", "203.0.114.10");
    const second = await generate(["J", "G"], "heraldico", "203.0.114.11");

    expect(first.response.status).toBe(200);
    expect(second.response.status).toBe(200);
    expect(generationCalls()).toBe(6);
    expect(second.data.proposals).toHaveLength(3);
    expect(second.data.designId).not.toBe(first.data.designId);
    expect(second.data.proposals.map((proposal) => proposal.id)).not.toEqual(
      first.data.proposals.map((proposal) => proposal.id),
    );
  });
});

describe("Sesión persistente y cupos", () => {
  it("asigna cookie HttpOnly y persiste los créditos entre peticiones", async () => {
    const first = await generate(["C", "R"], "monograma", "203.0.114.20");
    expect(first.response.status).toBe(200);
    expect(first.cookie.toLowerCase()).toContain("httponly");
    expect(first.cookie.toLowerCase()).toContain("samesite=lax");

    const cookie = cookiePair(first.cookie);
    expect(cookie.startsWith("mihierro_session=")).toBe(true);

    const afterFirst = await readSession(cookie);
    expect(afterFirst.data.user.creditsLimit).toBe(2);
    expect(afterFirst.data.user.creditsUsed).toBe(1);
    expect(afterFirst.data.user.creditsRemaining).toBe(1);
    expect(afterFirst.data.user.unlimited).toBe(false);

    const second = await generate(["C", "R"], "monograma", "203.0.114.20", cookie);
    expect(second.response.status).toBe(200);
    expect(second.data.remainingToday).toBe(0);

    const afterSecond = await readSession(cookie);
    expect(afterSecond.data.user.creditsUsed).toBe(2);
    expect(afterSecond.data.user.creditsRemaining).toBe(0);

    const third = await generate(["C", "R"], "monograma", "203.0.114.20", cookie);
    expect(third.response.status).toBe(429);
    expect(third.data.error).toContain("Has agotado los 2 diseños");
    expect(generationCalls()).toBe(6);
  });

  it("mantiene el cupo tras recrear la petición y lo libera con unlimited", async () => {
    const first = await generate(["V", "M"], "tradicional", "203.0.114.30");
    const cookie = cookiePair(first.cookie);
    const session = await readSession(cookie);
    const userId = session.data.user.userId;

    await generate(["V", "M"], "tradicional", "203.0.114.30", cookie);
    const blocked = await generate(["V", "M"], "tradicional", "203.0.114.30", cookie);
    expect(blocked.response.status).toBe(429);

    const update = await adminUpdate(userId, { unlimited: true }, adminCookie());
    expect(update.status).toBe(200);
    expect(((await update.json()) as { user: AdminUserBody }).user.unlimited).toBe(true);

    const freed = await generate(["V", "M"], "tradicional", "203.0.114.30", cookie);
    expect(freed.response.status).toBe(200);
    expect(freed.data.proposals).toHaveLength(3);
    expect(generationCalls()).toBe(9);

    const stored = await fileStore.getForgeUser(userId);
    expect(stored?.unlimited).toBe(true);
    expect(stored?.creditsUsed).toBe(2);
  });

  it("el administrador forja sin cupo mientras una sesión normal sigue bloqueada a los 2 diseños", async () => {
    const admin = adminCookie();
    const first = await generate(["J", "G"], "heraldico", "203.0.114.40", admin);
    expect(first.response.status).toBe(200);
    expect(first.data.remainingToday).toBe(999);

    const sessionCookie = cookiePair(first.cookie);
    const bothCookies = `${admin}; ${sessionCookie}`;

    const second = await generate(["J", "G"], "heraldico", "203.0.114.40", bothCookies);
    const third = await generate(["J", "G"], "heraldico", "203.0.114.40", bothCookies);
    const fourth = await generate(["J", "G"], "heraldico", "203.0.114.40", bothCookies);
    expect(second.response.status).toBe(200);
    expect(third.response.status).toBe(200);
    expect(fourth.response.status).toBe(200);
    expect(fourth.data.remainingToday).toBe(999);
    expect(generationCalls()).toBe(12);

    const session = await readSession(bothCookies);
    expect(session.data.isAdmin).toBe(true);
    expect(session.data.user.unlimited).toBe(true);
    expect(session.data.user.creditsRemaining).toBeNull();
    expect(session.data.user.creditsUsed).toBe(0);

    const normalFirst = await generate(["J", "G"], "heraldico", "203.0.114.41");
    const normalCookie = cookiePair(normalFirst.cookie);
    const normalSecond = await generate(["J", "G"], "heraldico", "203.0.114.41", normalCookie);
    const normalThird = await generate(["J", "G"], "heraldico", "203.0.114.41", normalCookie);
    expect(normalFirst.response.status).toBe(200);
    expect(normalSecond.response.status).toBe(200);
    expect(normalThird.response.status).toBe(429);
    expect(normalThird.data.error).toContain("Has agotado los 2 diseños");

    const normalSession = await readSession(normalCookie);
    expect(normalSession.data.isAdmin).toBe(false);
    expect(normalSession.data.user.creditsUsed).toBe(2);
  });

  it("crea la sesión al consultar /api/session sin cookie", async () => {
    const response = await sessionGet(new Request("http://localhost:3000/api/session"));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie") ?? "").toContain("mihierro_session=");
    const data = (await response.json()) as SessionBody;
    expect(data.user.creditsRemaining).toBe(2);
  });
});

describe("Panel admin de usuarios y packs", () => {
  it("exige sesión de admin en listar, crear y actualizar", async () => {
    expect((await adminList()).status).toBe(401);
    expect((await adminCreate({ name: "Sin permiso" })).status).toBe(401);
    expect((await adminUpdate(adminUserId, { unlimited: true })).status).toBe(401);
  });

  it("lista los usuarios con pack, créditos y diseños", async () => {
    const response = await adminList(adminCookie());
    expect(response.status).toBe(200);
    const data = (await response.json()) as { users: Array<AdminUserBody & { designs: unknown[] }> };
    const target = data.users.find((user) => user.id === adminUserId);
    expect(target).toBeDefined();
    expect(target?.activePack).toBe("FREE");
    expect(target?.creditsUsed).toBe(0);
    expect(Array.isArray(target?.designs)).toBe(true);
  });

  it("actualiza pack, límite, créditos y modo infinito", async () => {
    const cookie = adminCookie();

    const pack = await adminUpdate(
      adminUserId,
      { activePack: "PACK_1990", creditsLimit: 8, resetCredits: true },
      cookie,
    );
    expect(pack.status).toBe(200);
    const afterPack = ((await pack.json()) as { user: AdminUserBody }).user;
    expect(afterPack.activePack).toBe("PACK_1990");
    expect(afterPack.creditsLimit).toBe(8);
    expect(afterPack.creditsUsed).toBe(0);

    const extra = await adminUpdate(adminUserId, { addCredits: 5 }, cookie);
    expect(((await extra.json()) as { user: AdminUserBody }).user.creditsLimit).toBe(13);

    const unlimited = await adminUpdate(adminUserId, { unlimited: true }, cookie);
    expect(((await unlimited.json()) as { user: AdminUserBody }).user.unlimited).toBe(true);

    const off = await adminUpdate(adminUserId, { unlimited: false }, cookie);
    expect(((await off.json()) as { user: AdminUserBody }).user.unlimited).toBe(false);
  });

  it("crea una sesión VIP con pack e infinito preasignados", async () => {
    const response = await adminCreate(
      {
        name: "Cliente VIP",
        email: "vip@mihierro.es",
        activePack: "FORJA",
        creditsLimit: 5,
        unlimited: true,
      },
      adminCookie(),
    );
    expect(response.status).toBe(201);
    const data = (await response.json()) as { user: AdminUserBody; sessionToken: string };
    expect(data.user.activePack).toBe("FORJA");
    expect(data.user.unlimited).toBe(true);
    expect(data.user.creditsLimit).toBe(5);
    expect(data.sessionToken.length).toBeGreaterThan(20);
  });
});
