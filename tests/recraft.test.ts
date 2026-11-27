import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import JSZip from "jszip";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  initialsCombinationSchema,
  userProfileSchema,
  type ForgeStyle,
} from "@/types/forge";
import { buildDeterministicBlueprints } from "@/lib/forge-engine/presets";
import { renderStoryCard } from "@/lib/forge-engine/story";
import { buildDeliveryZip } from "@/lib/stripe/zip";
import type { DesignRecord } from "@/lib/store/types";

const storeFile = path.join(process.cwd(), ".data", `test-recraft-${process.pid}.json`);
process.env.MI_HIERRO_STORE_FILE = storeFile;
process.env.RECRAFT_API_KEY = "test-recraft-key";
process.env.RECRAFT_STYLE_TRADICIONAL = "style-tradicional";
process.env.RECRAFT_STYLE_MONOGRAMA = "style-monograma";
process.env.RECRAFT_STYLE_GEOMETRICO = "style-geometrico";
process.env.RECRAFT_STYLE_HERALDICO = "style-heraldico";
delete process.env.GEMINI_API_KEY;
delete process.env.DATABASE_URL;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

const { POST: generatePost } = await import("@/app/api/generate/route");
const { GET: previewGet } = await import("@/app/api/preview/route");
const { buildArtDirectionPrompt } = await import("@/lib/ai/gemini");
const { buildTransparentMask, generateRecraftRaster, vectorizeRecraftImage } = await import("@/lib/ai/recraft");
const { resetMemoryRateLimit } = await import("@/lib/security/rate-limit");

interface GeneratedBody {
  designId: string;
  tier: string;
  proposals: Array<{ id: string; previewUrl: string }>;
  remainingToday: number;
  error?: string;
}

const fetchMock = vi.fn();

const profile = userProfileSchema.parse({
  profile: "ganaderia",
  firstName: "Joaquín",
  lastName1: "García",
  lastName2: "Moreno",
  origin: "Salamanca",
  character: "senorial",
  remate: "corona",
});

const initials = initialsCombinationSchema.parse({
  id: "dos-JG",
  letters: ["J", "G"],
  label: "JG",
  kind: "dos",
  primary: "J",
  secondary: "G",
});

async function silhouettePng(): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#FFFFFF"/><path d="M120 96H392V176H300V416H212V176H120Z" fill="#000000"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function installFetch() {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/images/generations")) {
      const png = await silhouettePng();
      const entry = { b64_json: png.toString("base64") };
      return new Response(JSON.stringify({ data: [entry, entry, entry] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/images/vectorize")) {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M20 20H280V280H20Z" fill="#000000"/></svg>';
      return new Response(JSON.stringify({ image: { b64_json: Buffer.from(svg).toString("base64") } }), { status: 200 });
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
}

function generationCalls(): number {
  return fetchMock.mock.calls.filter((call) => String(call[0]).includes("/images/generations")).length;
}

function bodyFor(letters: string[], style: ForgeStyle) {
  return {
    profile: {
      profile: "ganaderia",
      firstName: "Joaquín",
      lastName1: "García",
      lastName2: "Moreno",
      origin: "Salamanca",
      character: "senorial",
      remate: "corona",
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
    notes: "Hierro para la puerta de la finca",
  };
}

async function generate(letters: string[], style: ForgeStyle, ip: string) {
  const response = await generatePost(
    new Request("http://localhost:3000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(bodyFor(letters, style)),
    }),
  );
  const text = await response.text();
  return { response, text, data: JSON.parse(text) as GeneratedBody };
}

beforeAll(async () => {
  await fs.rm(storeFile, { force: true });
  installFetch();
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

describe("Director de Arte · prompt técnico", () => {
  it("construye un prompt determinista en inglés con negro puro sobre blanco puro", async () => {
    const direction = await buildArtDirectionPrompt({
      profile,
      initials,
      style: "heraldico",
      use: "fuego",
      notes: "Puerta de finca en Salamanca",
    });

    expect(direction.source).toBe("deterministic");
    expect(direction.prompt).toContain("#000000");
    expect(direction.prompt).toContain("#FFFFFF");
    expect(direction.prompt).toContain("forged iron stroke");
    expect(direction.prompt).toMatch(/open internal cavities/i);
    expect(direction.prompt).toMatch(/no gradients/i);
    expect(direction.prompt).toContain("J G");
    expect(direction.prompt).not.toContain("<");
  });
});

describe("Recraft · raster y vector", () => {
  it("envía style_id, style_match y b64_json y devuelve una máscara transparente", async () => {
    const rasters = await generateRecraftRaster({
      prompt: "technical forged iron emblem",
      styleId: "style-heraldico",
      count: 3,
    });

    expect(rasters).toHaveLength(3);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://external.api.recraft.ai/v1/images/generations");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-recraft-key");

    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload).toMatchObject({
      model: "recraftv4_styles",
      style_id: "style-heraldico",
      style_match: "precise",
      size: "1024x1024",
      response_format: "b64_json",
      image_format: "png",
      n: 3,
    });

    const mask = rasters[0].mask;
    const metadata = await sharp(mask).metadata();
    expect(metadata.hasAlpha).toBe(true);
    expect(metadata.width).toBe(1024);
    expect(metadata.height).toBe(1024);

    const statistics = await sharp(mask).stats();
    expect(statistics.channels[3].min).toBe(0);
    expect(statistics.channels[3].max).toBe(255);

    const corner = await sharp(mask).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
    expect(corner[3]).toBe(0);
  });

  it("vectoriza la máscara elegida con el token del servidor", async () => {
    const mask = await buildTransparentMask(await silhouettePng());
    const svg = await vectorizeRecraftImage(mask);

    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).not.toContain("<text");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://external.api.recraft.ai/v1/images/vectorize");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-recraft-key");

    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload.response_format).toBe("b64_json");
    expect(String(payload.image_url).startsWith("data:image/png;base64,")).toBe(true);
  });
});

describe("Plan gratuito · cupo y caché", () => {
  it("permite dos generaciones con IA al día y bloquea la tercera con aviso claro", async () => {
    const ip = "203.0.113.10";

    const first = await generate(["J", "G"], "heraldico", ip);
    expect(first.response.status).toBe(200);
    expect(first.data.tier).toBe("free");
    expect(first.data.proposals).toHaveLength(3);
    expect(first.data.remainingToday).toBe(1);
    expect(generationCalls()).toBe(3);

    const second = await generate(["V", "M"], "tradicional", ip);
    expect(second.response.status).toBe(200);
    expect(second.data.remainingToday).toBe(0);
    expect(generationCalls()).toBe(6);

    const third = await generate(["A", "L"], "geometrico", ip);
    expect(third.response.status).toBe(429);
    expect(third.data.error).toContain("2 láminas gratuitas");
    expect(generationCalls()).toBe(6);
  });

  it("reutiliza la caché de iniciales, estilo y uso idénticos sin volver a facturar", async () => {
    const ip = "203.0.113.20";

    const first = await generate(["C", "R"], "monograma", ip);
    expect(first.response.status).toBe(200);
    expect(generationCalls()).toBe(3);

    const second = await generate(["C", "R"], "monograma", ip);
    expect(second.response.status).toBe(200);
    expect(second.data.proposals).toHaveLength(3);
    expect(generationCalls()).toBe(3);
    expect(second.data.remainingToday).toBe(first.data.remainingToday);
    expect(second.data.proposals[0].id).not.toBe(first.data.proposals[0].id);
  });

  it("no filtra SVG limpio, base64 ni datos de Recraft al cliente", async () => {
    const result = await generate(["E", "M"], "heraldico", "203.0.113.40");

    expect(result.response.status).toBe(200);
    expect(result.text).not.toContain("<svg");
    expect(result.text).not.toContain("<path");
    expect(result.text).not.toContain("pathData");
    expect(result.text).not.toContain("rasterPng");
    expect(result.text.toLowerCase()).not.toContain("base64");
    expect(result.text.toLowerCase()).not.toContain("recraft");

    const preview = await previewGet(new Request(`http://localhost:3000${result.data.proposals[0].previewUrl}`));
    expect(preview.status).toBe(200);
    expect(preview.headers.get("content-type")).toBe("image/png");

    const buffer = Buffer.from(await preview.arrayBuffer());
    expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(buffer.toString("utf8").includes("<svg")).toBe(false);

    const metadata = await sharp(buffer).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(900);
  });

  it("vectoriza el diseño elegido al entregar el Pack Premium y compone la Story", async () => {
    const mask = await buildTransparentMask(await silhouettePng());
    const blueprint = buildDeterministicBlueprints(profile, initials, "heraldico")[0];
    const design: DesignRecord = {
      id: "design-recraft-test",
      profile: "ganaderia",
      firstName: "Joaquín",
      lastName1: "García",
      lastName2: "Moreno",
      nickname: "",
      origin: "Salamanca",
      character: "senorial",
      remate: "corona",
      initials: "JG",
      style: "heraldico",
      blueprint,
      svgMaster: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M10 10H290V290H10Z"/></svg>',
      rasterPng: mask.toString("base64"),
      generationKey: "JG|heraldico|fuego",
      previewKey: null,
      scores: { legibility: 92, balance: 94, forgeability: 90 },
      lore: "Hierro forjado en una sola silueta para la puerta de la finca.",
      createdAt: new Date().toISOString(),
    };

    fetchMock.mockClear();
    const { buffer, filename } = await buildDeliveryZip(design);
    expect(filename).toContain("premium.zip");

    const archive = await JSZip.loadAsync(buffer);
    const svgFile = archive.file("joaquin-garcia-moreno-mi-hierro.svg");
    expect(svgFile).not.toBeNull();
    const svg = await svgFile!.async("string");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(fetchMock.mock.calls.filter((call) => String(call[0]).includes("/images/vectorize"))).toHaveLength(1);

    const story = await renderStoryCard(design, "hierro");
    const storyMetadata = await sharp(story).metadata();
    expect(storyMetadata.width).toBe(1080);
    expect(storyMetadata.height).toBe(1920);
  });

  it("devuelve 502 sin consumir cupo cuando Recraft falla y no cachea nada", async () => {
    const ip = "203.0.113.50";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchMock.mockImplementation(async () => new Response("invalid style reference", { status: 400 }));

    const failed = await generate(["T", "R"], "tradicional", ip);
    expect(failed.response.status).toBe(502);
    expect(failed.data.error).toContain("no se ha consumido");
    expect(failed.data.remainingToday).toBe(2);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("[recraft] fallo al forjar"));

    installFetch();
    errorSpy.mockRestore();
    const retry = await generate(["T", "R"], "tradicional", ip);
    expect(retry.response.status).toBe(200);
    expect(retry.data.remainingToday).toBe(1);
  });

  it("no cae al motor local cuando falta el style_id del estilo elegido", async () => {
    delete process.env.RECRAFT_STYLE_GEOMETRICO;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await generate(["N", "S"], "geometrico", "203.0.113.60");
    expect(result.response.status).toBe(502);
    expect(result.data.error).toContain("no se ha consumido");
    expect(generationCalls()).toBe(0);

    errorSpy.mockRestore();
    process.env.RECRAFT_STYLE_GEOMETRICO = "style-geometrico";
  });

  it("sin RECRAFT_API_KEY forja con el motor local sin hacer red", async () => {
    delete process.env.RECRAFT_API_KEY;
    fetchMock.mockClear();

    const result = await generate(["M", "P"], "tradicional", "203.0.113.30");

    expect(result.response.status).toBe(200);
    expect(result.data.proposals).toHaveLength(3);
    expect(generationCalls()).toBe(0);
  });
});
