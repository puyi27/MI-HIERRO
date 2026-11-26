import path from "node:path";
import fs from "node:fs/promises";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const storeFile = path.join(process.cwd(), ".data", `test-admin-panel-${process.pid}.json`);
process.env.MI_HIERRO_STORE_FILE = storeFile;
process.env.ADMIN_PASSWORD = "clave-panel-de-prueba";
delete process.env.DATABASE_URL;
delete process.env.VERCEL;

const { ADMIN_COOKIE, createAdminSession } = await import("@/lib/security/admin");
const { POST: loginPost } = await import("@/app/api/admin/login/route");
const { POST: reportsPost } = await import("@/app/api/admin/reports/route");
const { GET: designSvgGet } = await import("@/app/api/admin/designs/[id]/svg/route");
const { fileStore } = await import("@/lib/store/file-store");
const { resetMemoryRateLimit } = await import("@/lib/security/rate-limit");

const blueprint = {
  combo: "JGM",
  style: "tradicional" as const,
  fontFamily: "cinzel" as const,
  layout: "stacked" as const,
  frame: "none" as const,
  ornament: "none" as const,
  strokeWidth: 10,
  rotationDeg: 0,
  lore: "Hierro de prueba para el panel operativo.",
};

const svgMaster =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 10 L90 90" fill="none" stroke="#000"/></svg>';

let designId = "";
let reportId = "";

function loginRequest(password: string, ip = "10.9.0.10") {
  return loginPost(
    new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ password }),
    }),
  );
}

function sessionCookie(): string {
  return `${ADMIN_COOKIE}=${createAdminSession().value}`;
}

function reportsRequest(body: unknown, cookie?: string) {
  return reportsPost(
    new NextRequest("http://localhost:3000/api/admin/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    }),
  );
}

function svgRequest(id: string, cookie?: string) {
  return designSvgGet(
    new NextRequest(`http://localhost:3000/api/admin/designs/${id}/svg`, {
      headers: cookie ? { cookie } : {},
    }),
    { params: Promise.resolve({ id }) },
  );
}

beforeAll(async () => {
  await fs.rm(storeFile, { force: true });
  const design = await fileStore.createDesign({
    profile: "novillero",
    firstName: "Joaquín",
    lastName1: "García",
    lastName2: "Moreno",
    nickname: "El Sella",
    origin: "Sevilla",
    character: "sobrio",
    remate: "cruz",
    initials: "JGM",
    style: "tradicional",
    blueprint,
    svgMaster,
    scores: { legibility: 88, balance: 82, forgeability: 90 },
    lore: "Hierro de prueba para el panel operativo.",
  });
  designId = design.id;
  const report = await fileStore.createSimilarityRequest({
    designId,
    orderId: null,
    email: "panel@mihierro.es",
    name: "Joaquín García",
    stripeSessionId: null,
    notes: "Solicitud de prueba",
  });
  reportId = report.id;
});

beforeEach(() => {
  resetMemoryRateLimit();
});

afterAll(async () => {
  await fs.rm(storeFile, { force: true });
});

describe("acceso al panel operativo", () => {
  it("rechaza el SVG maestro sin cookie o con cookie manipulada", async () => {
    expect((await svgRequest(designId)).status).toBe(401);
    expect((await svgRequest(designId, `${ADMIN_COOKIE}=manipulada.firma`)).status).toBe(401);
  });

  it("rechaza cambiar el estado sin cookie o con cookie manipulada", async () => {
    const payload = { id: reportId, status: "delivered" };
    expect((await reportsRequest(payload)).status).toBe(401);
    expect((await reportsRequest(payload, `${ADMIN_COOKIE}=9999999999.firma`)).status).toBe(401);
  });

  it("limita a cinco intentos de login por ventana", async () => {
    const statuses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = await loginRequest("incorrecta", "10.9.1.20");
      statuses.push(response.status);
    }
    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses[5]).toBe(429);
  });

  it("entrega cookie HttpOnly con la contraseña correcta", async () => {
    const response = await loginRequest("clave-panel-de-prueba", "10.9.2.30");
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${ADMIN_COOKIE}=`);
    expect(cookie.toLowerCase()).toContain("httponly");
  });

  it("cambia el estado del informe con sesión válida", async () => {
    const response = await reportsRequest({ id: reportId, status: "delivered" }, sessionCookie());
    expect(response.status).toBe(200);
    const reports = await fileStore.listSimilarityRequests(10);
    expect(reports.find((item) => item.id === reportId)?.status).toBe("delivered");
  });

  it("descarga el SVG maestro con sesión válida", async () => {
    const response = await svgRequest(designId, sessionCookie());
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(await response.text()).toContain("<svg");
  });
});
