import path from "node:path";
import fs from "node:fs/promises";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const storeFile = path.join(process.cwd(), ".data", `test-admin-${process.pid}.json`);
process.env.MI_HIERRO_STORE_FILE = storeFile;
process.env.ADMIN_PASSWORD = "clave-segura-de-prueba";
delete process.env.DATABASE_URL;
delete process.env.VERCEL;

const { ADMIN_COOKIE, createAdminSession, passwordMatches, verifyAdminSession } = await import(
  "@/lib/security/admin"
);
const { GET: designSvgGet } = await import("@/app/api/admin/designs/[id]/svg/route");
const { POST: reportsPost } = await import("@/app/api/admin/reports/route");
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

const scores = { legibility: 88, balance: 82, forgeability: 90 };

const svgMaster =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 10 L90 90" fill="none" stroke="#000"/></svg>';

let designId = "";

beforeAll(async () => {
  await fs.rm(storeFile, { force: true });
  resetMemoryRateLimit();
  const design = await fileStore.createDesign({
    profile: "novillero",
    firstName: "Joaquín",
    lastName1: "García",
    lastName2: "Moreno",
    nickname: "",
    origin: "Sevilla",
    character: "sobrio",
    remate: "cruz",
    initials: "JGM",
    style: "tradicional",
    blueprint,
    svgMaster,
    scores,
    lore: "Hierro de prueba para el panel operativo.",
  });
  designId = design.id;
});

afterAll(async () => {
  await fs.rm(storeFile, { force: true });
});

describe("sesión de administración", () => {
  it("firma y verifica una sesión recién creada", () => {
    const session = createAdminSession();
    expect(verifyAdminSession(session.value)).toBe(true);
    expect(session.maxAge).toBeGreaterThan(0);
  });

  it("rechaza firmas manipuladas y cookies ausentes", () => {
    const session = createAdminSession();
    const [expires, signature] = session.value.split(".");
    expect(verifyAdminSession(`${expires}.${signature.slice(0, -2)}AA`)).toBe(false);
    expect(verifyAdminSession(undefined)).toBe(false);
    expect(verifyAdminSession("")).toBe(false);
    expect(verifyAdminSession("sin-punto")).toBe(false);
  });

  it("caduca la sesión pasado el plazo", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01T08:00:00Z"));
      const session = createAdminSession();
      expect(verifyAdminSession(session.value)).toBe(true);
      vi.setSystemTime(new Date("2026-01-01T17:00:00Z"));
      expect(verifyAdminSession(session.value)).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("solo acepta la contraseña exacta", () => {
    expect(passwordMatches("clave-segura-de-prueba")).toBe(true);
    expect(passwordMatches("clave-segura-de-prueb")).toBe(false);
    expect(passwordMatches("")).toBe(false);
  });
});

describe("bloqueo del panel sin sesión", () => {
  it("rechaza la descarga del SVG maestro sin cookie", async () => {
    const request = new NextRequest(`http://localhost:3000/api/admin/designs/${designId}/svg`);
    const response = await designSvgGet(request, { params: Promise.resolve({ id: designId }) });
    expect(response.status).toBe(401);
  });

  it("rechaza cambiar el estado de un informe sin cookie", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "cualquiera", status: "delivered" }),
    });
    const response = await reportsPost(request);
    expect(response.status).toBe(401);
  });

  it("sirve el SVG maestro con una sesión válida", async () => {
    const session = createAdminSession();
    const request = new NextRequest(`http://localhost:3000/api/admin/designs/${designId}/svg`, {
      headers: { cookie: `${ADMIN_COOKIE}=${session.value}` },
    });
    const response = await designSvgGet(request, { params: Promise.resolve({ id: designId }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(response.headers.get("content-disposition")).toContain("attachment");
    const body = await response.text();
    expect(body).toContain("<svg");
  });
});
