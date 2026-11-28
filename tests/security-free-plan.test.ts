import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const storeFile = path.join(process.cwd(), ".data", `test-security-${process.pid}.json`);
process.env.MI_HIERRO_STORE_FILE = storeFile;
delete process.env.GEMINI_API_KEY;
delete process.env.DATABASE_URL;

const { POST: generatePost } = await import("@/app/api/generate/route");
const { GET: previewGet } = await import("@/app/api/preview/route");
const { POST: storyPost } = await import("@/app/api/story/route");

const payload = {
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
    id: "dos-JG",
    letters: ["J", "G"],
    label: "JG",
    kind: "dos",
    primary: "J",
    secondary: "G",
  },
  style: "heraldico",
};

let designId = "";
let previewUrl = "";

async function generate() {
  const request = new Request("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.9" },
    body: JSON.stringify(payload),
  });
  return generatePost(request);
}

beforeAll(async () => {
  await fs.rm(storeFile, { force: true });
});

afterAll(async () => {
  await fs.rm(storeFile, { force: true });
});

describe("plan gratuito sin fuga de SVG", () => {
  it("genera propuestas sin enviar SVG limpio ni rutas vectoriales", async () => {
    const response = await generate();
    expect(response.status).toBe(200);
    const text = await response.text();

    expect(text).not.toContain("<svg");
    expect(text).not.toContain("<path");
    expect(text).not.toContain("svgMaster");
    expect(text).not.toContain("pathData");
    expect(text).not.toContain('d="M');

    const data = JSON.parse(text) as {
      designId: string;
      tier: string;
      proposals: Array<{ id: string; previewUrl: string }>;
    };
    expect(data.tier).toBe("free");
    expect(data.proposals).toHaveLength(3);
    designId = data.proposals[0].id;
    previewUrl = data.proposals[0].previewUrl;
    expect(previewUrl.startsWith("/api/preview")).toBe(true);
    expect(previewUrl).not.toContain("svg");
  });

  it("sirve la vista previa únicamente como PNG rasterizado", async () => {
    const response = await previewGet(new Request(`http://localhost:3000${previewUrl}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("content-disposition")).toContain("inline");
    expect(response.headers.get("cache-control")).toContain("no-store");

    const buffer = Buffer.from(await response.arrayBuffer());
    const text = buffer.toString("utf8");
    expect(text.includes("<svg")).toBe(false);
    expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

    const metadata = await sharp(buffer).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(900);
  });

  it("sirve WebP sin filtrar el vector", async () => {
    const response = await previewGet(new Request(`http://localhost:3000/api/preview?d=${designId}&f=webp`));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    const buffer = Buffer.from(await response.arrayBuffer());
    expect(buffer.toString("utf8").includes("<svg")).toBe(false);
    const metadata = await sharp(buffer).metadata();
    expect(metadata.format).toBe("webp");
  });

  it("rechaza vistas previas de diseños inexistentes", async () => {
    const response = await previewGet(new Request("http://localhost:3000/api/preview?d=no-existe"));
    expect(response.status).toBe(404);
  });

  it("entrega el avatar 1:1 gratuito como PNG 1080x1080 con marca de agua", async () => {
    const response = await storyPost(
      new Request("http://localhost:3000/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId, variant: "bordado", format: "avatar" }),
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("content-disposition")).toContain("mi-hierro-avatar-1x1.png");
    const buffer = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1080);
    const text = buffer.toString("utf8");
    expect(text.includes("<svg")).toBe(false);
    expect(text.includes("<path")).toBe(false);
    expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("entrega la Story 9:16 como PNG 1080x1920", async () => {
    const response = await storyPost(
      new Request("http://localhost:3000/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId, variant: "hierro" }),
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    const buffer = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(1920);
    expect(buffer.toString("utf8").includes("<svg")).toBe(false);
  });

  it("valida el cuerpo de generación", async () => {
    const response = await generatePost(
      new Request("http://localhost:3000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { firstName: "" } }),
      }),
    );
    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).not.toContain("<svg");
  });
});
