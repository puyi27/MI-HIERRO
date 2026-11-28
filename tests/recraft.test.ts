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

const geminiState = vi.hoisted(() => ({ response: "", fail: false, contents: "" }));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = {
      generateContent: async (request: { contents?: unknown }) => {
        geminiState.contents = String(request.contents ?? "");
        if (geminiState.fail) throw new Error("gemini unavailable");
        return { text: geminiState.response };
      },
    };
  },
}));

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
const { ART_RECIPES, buildDeterministicArtPrompt, buildVariantPrompts, generateArtDirections, sanitizeArtPrompt, selectArchetypes } = await import("@/lib/ai/gemini");
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
  remate: "cruz-forja",
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
  delete process.env.GEMINI_API_KEY;
  geminiState.response = "";
  geminiState.fail = false;
  geminiState.contents = "";
  process.env.RECRAFT_API_KEY = "test-recraft-key";
  process.env.RECRAFT_STYLE_TRADICIONAL = "style-tradicional";
  process.env.RECRAFT_STYLE_MONOGRAMA = "style-monograma";
  process.env.RECRAFT_STYLE_GEOMETRICO = "style-geometrico";
  process.env.RECRAFT_STYLE_HERALDICO = "style-heraldico";
});

describe("Director de Arte · prompt compacto", () => {
  const prompt = buildDeterministicArtPrompt({
    profile,
    initials,
    style: "heraldico",
    use: "fuego",
    notes: "Puerta de finca en Salamanca",
  });

  it("envía entre 45 y 55 palabras para que el style_id mande y no se deformen las letras", () => {
    const words = prompt.trim().split(/\s+/);
    expect(words.length).toBeGreaterThanOrEqual(45);
    expect(words.length).toBeLessThanOrEqual(55);
  });

  it("abre con las iniciales exactas y exige negro puro sobre blanco puro", () => {
    expect(prompt.startsWith('Featuring the exact bold capital letters "JG" clearly readable')).toBe(true);
    expect(prompt).toContain("#000000");
    expect(prompt).toContain("#FFFFFF");
    expect(prompt).toContain("uniform monoline wrought-iron");
    expect(prompt).toContain("razor-sharp symmetry");
    expect(prompt).toContain("no floating points");
    expect(prompt).not.toContain("<");
    expect(prompt.toLowerCase()).not.toContain("serif");
    expect(prompt.toLowerCase()).not.toContain("luxury");
    expect(prompt.toLowerCase()).not.toContain("primitive");
    expect(prompt.toLowerCase()).not.toContain("folk");
  });
});

describe("Director de Arte · Gemini estructurado", () => {
  const promptA =
    'Featuring the exact bold capital letters "JG" clearly readable and harmoniously integrated. Bold uniform monoline wrought-iron strip, clean symmetry, open internal counters, all pieces welded into one solid silhouette, pure solid black #000000 on pure white #FFFFFF. Open iron horseshoe arch with a simple forge cross at the apex.';
  const promptB =
    'Featuring the exact bold capital letters "JG" clearly readable and harmoniously integrated. Bold uniform monoline wrought-iron strip, mirrored proportions, open internal counters, every joint welded into one solid piece, pure solid black #000000 on pure white #FFFFFF. Central anvil crossbar with flat forked ends.';
  const promptC =
    'Featuring the exact bold capital letters "JG" clearly readable and harmoniously integrated. Bold uniform monoline wrought-iron strip, crisp sculptural symmetry, open internal counters, all strokes welded into one solid emblem, pure solid black #000000 on pure white #FFFFFF. Shallow crescent base with forged spur terminals.';

  const baseInput = {
    profile,
    initials,
    style: "tradicional" as const,
    use: "fuego" as const,
    ornament: "cruz-forja",
    notes: "Hierro para la puerta de la finca en Salamanca",
  };

  it("recibe un array JSON de tres direcciones y las entrega listas para Recraft", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    geminiState.response = JSON.stringify([
      { recipeName: "asa_gemini", lore: "Arco de herradura con cruz de forja simple sobre las iniciales.", recraftPrompt: promptA },
      { recipeName: "arco_gemini", lore: "Arco abierto con travesaño central y remates de yunque planos.", recraftPrompt: promptB },
      { recipeName: "yunque_gemini", lore: "Base en media luna con espuelas forjadas en los extremos.", recraftPrompt: promptC },
    ]);

    const directions = await generateArtDirections(baseInput);

    expect(directions).toHaveLength(3);
    expect(directions.map((direction) => direction.recipeName)).toEqual([
      "asa_gemini",
      "arco_gemini",
      "yunque_gemini",
    ]);
    for (const direction of directions) {
      const words = direction.recraftPrompt.trim().split(/\s+/);
      expect(words.length).toBeGreaterThanOrEqual(40);
      expect(words.length).toBeLessThanOrEqual(55);
      expect(direction.recraftPrompt.startsWith('Featuring the exact bold capital letters "JG"')).toBe(true);
      expect(direction.recraftPrompt).toContain("#000000");
      expect(direction.recraftPrompt).toContain("#FFFFFF");
      expect(direction.recraftPrompt).toContain("uniform monoline wrought-iron");
      expect(direction.lore.length).toBeGreaterThan(20);
    }
    expect(new Set(directions.map((direction) => direction.recraftPrompt)).size).toBe(3);
  });

  it("envía el remate elegido a Gemini y libera al maestro cuando es auto", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    geminiState.response = JSON.stringify([
      { recipeName: "asa_gemini", lore: "Arco de herradura con cruz de forja simple sobre las iniciales.", recraftPrompt: promptA },
    ]);

    await generateArtDirections({ ...baseInput, ornament: "asa-caldera" });
    expect(geminiState.contents).toContain("Asa de caldera");

    await generateArtDirections({ ...baseInput, ornament: "auto" });
    expect(geminiState.contents).toContain("libertad total");
    expect(geminiState.contents).not.toContain("Asa de caldera");
  });

  it("cambia la semilla creativa en cada llamada para no repetir estructuras", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    geminiState.response = JSON.stringify([
      { recipeName: "asa_gemini", lore: "Arco de herradura con cruz de forja simple sobre las iniciales.", recraftPrompt: promptA },
      { recipeName: "arco_gemini", lore: "Arco abierto con travesaño central y remates de yunque planos.", recraftPrompt: promptB },
      { recipeName: "yunque_gemini", lore: "Base en media luna con espuelas forjadas en los extremos.", recraftPrompt: promptC },
    ]);

    await generateArtDirections(baseInput);
    const first = geminiState.contents;
    await generateArtDirections(baseInput);
    const second = geminiState.contents;

    expect(first).toContain("Semilla creativa");
    expect(second).toContain("Semilla creativa");
    expect(second).not.toBe(first);
  });

  it("sanea lujo, joyería y tipografía serif del prompt devuelto por Gemini", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    const dirty =
      'Featuring the exact bold capital letters "JG" clearly readable and harmoniously integrated. Luxury royal gold embroidery serif crest crown badge, bold uniform monoline wrought-iron strip, clean symmetry, open internal counters, welded into one solid piece, pure solid black #000000 on pure white #FFFFFF, boutique fashion ornament.';
    geminiState.response = JSON.stringify([
      { recipeName: "dirty_recipe", lore: "Propuesta saneada para la puerta de la finca.", recraftPrompt: dirty },
    ]);

    const [direction] = await generateArtDirections(baseInput);
    const lower = direction.recraftPrompt.toLowerCase();

    for (const word of ["luxury", "royal", "gold", "embroidery", "serif", "crest", "crown", "badge", "boutique"]) {
      expect(lower).not.toContain(word);
    }
    expect(lower).toContain("#000000");
    expect(lower).toContain("#ffffff");
    expect(lower).toContain("uniform monoline wrought-iron");
  });

  it("cae a tres variantes deterministas distintas sin GEMINI_API_KEY", async () => {
    const input = { ...baseInput, style: "heraldico" as const, ornament: "escudo-espanol" };

    const first = await generateArtDirections(input);
    const second = await generateArtDirections(input);

    expect(first).toHaveLength(3);
    expect(new Set(first.map((direction) => direction.recipeName)).size).toBe(3);
    expect(new Set(first.map((direction) => direction.recraftPrompt)).size).toBe(3);
    expect(second).toEqual(first);
    for (const direction of first) {
      const words = direction.recraftPrompt.trim().split(/\s+/);
      expect(words.length).toBeGreaterThanOrEqual(40);
      expect(words.length).toBeLessThanOrEqual(55);
      expect(direction.recraftPrompt.startsWith('Featuring the exact bold capital letters "JG"')).toBe(true);
      expect(direction.recraftPrompt).toContain("#000000");
      expect(direction.recraftPrompt).toContain("#FFFFFF");
      expect(direction.recraftPrompt.toLowerCase()).not.toContain("crown");
    }
  });

  it("cae al fallback determinista si la llamada a Gemini falla", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    geminiState.fail = true;

    const directions = await generateArtDirections(baseInput);

    expect(directions).toHaveLength(3);
    expect(new Set(directions.map((direction) => direction.recraftPrompt)).size).toBe(3);
    for (const direction of directions) {
      expect(direction.recraftPrompt).toContain("#000000");
      expect(direction.recraftPrompt).toContain("#FFFFFF");
    }
  });
});

describe("Recetas morfológicas · física de forja", () => {
  it("acota cada prompt final a 45-60 palabras con las iniciales al frente", () => {
    for (const style of ["tradicional", "monograma", "geometrico", "heraldico"] as const) {
      for (const prompt of buildVariantPrompts({ initials, style })) {
        const words = prompt.trim().split(/\s+/);
        expect(words.length).toBeGreaterThanOrEqual(45);
        expect(words.length).toBeLessThanOrEqual(60);
        expect(prompt.startsWith('Featuring the exact bold capital letters "JG" clearly readable')).toBe(true);
      }
    }
  });

  it("prohíbe palabras de lujo y exige pletina monoline en tradicional, monograma y geométrico", () => {
    for (const style of ["tradicional", "monograma", "geometrico"] as const) {
      const prompts = buildVariantPrompts({ initials, style });
      expect(prompts).toHaveLength(3);
      expect(new Set(prompts).size).toBe(3);
      for (const prompt of prompts) {
        const lower = prompt.toLowerCase();
        expect(lower).not.toContain("crown");
        expect(lower).not.toContain("luxury");
        expect(lower).not.toContain("serif");
        expect(lower).not.toContain("gold");
        expect(lower).not.toContain("crest");
        expect(lower).toContain("uniform monoline");
        expect(lower).toContain("wrought-iron");
      }
    }
  });

  it("reserva el remate almenado de forja para el banco heráldico", () => {
    const heraldic = buildVariantPrompts({ initials, style: "heraldico" });
    const bank = ART_RECIPES.heraldico.map((recipe) => recipe.prompt.toLowerCase()).join(" ");
    expect(bank).toContain("merlons");
    expect(bank).toContain("four-merlon");
    expect(bank).toContain("no shield");
    expect(heraldic.join(" ").toLowerCase()).not.toContain("luxury");
    expect(heraldic.join(" ").toLowerCase()).not.toContain("crown");
    expect(heraldic.join(" ").toLowerCase()).toContain("no floating points");
  });

  it("da al menos seis arquetipos y descripciones propias a cada familia", () => {
    const descriptions = new Set<string>();
    for (const style of ["tradicional", "monograma", "geometrico", "heraldico"] as const) {
      expect(ART_RECIPES[style].length).toBeGreaterThanOrEqual(6);
      for (const recipe of ART_RECIPES[style]) {
        expect(recipe.description.length).toBeGreaterThan(40);
        expect(recipe.description).not.toContain("se corona");
        expect(descriptions.has(recipe.description)).toBe(false);
        descriptions.add(recipe.description);
      }
    }
    expect(descriptions.size).toBe(24);
  });

  it("elige tres arquetipos distintos al azar sin repetir familia morfológica", () => {
    const seen = new Set<string>();
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const archetypes = selectArchetypes("tradicional", 3);
      expect(archetypes).toHaveLength(3);
      expect(new Set(archetypes.map((item) => item.key)).size).toBe(3);
      archetypes.forEach((item) => seen.add(item.key));
    }
    expect(seen.size).toBeGreaterThan(3);
  });

  it("sanea el prompt cuando Gemini o el cliente cuelan palabras de lujo", () => {
    const dirty =
      "A luxury royal gold crown crest badge for a matador, ornate serif lettering with embroidery on a boutique jacket.";
    const clean = sanitizeArtPrompt(dirty, "tradicional").toLowerCase();
    for (const word of [
      "luxury",
      "royal",
      "gold",
      "crown",
      "crest",
      "badge",
      "matador",
      "serif",
      "ornate",
      "embroidery",
      "boutique",
    ]) {
      expect(clean).not.toContain(word);
    }
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

  it("forja láminas nuevas en cada llamada aunque repita iniciales, estilo y uso", async () => {
    const first = await generate(["C", "R"], "monograma", "203.0.113.21");
    expect(first.response.status).toBe(200);
    expect(first.data.proposals).toHaveLength(3);
    expect(generationCalls()).toBe(3);

    const second = await generate(["C", "R"], "monograma", "203.0.113.22");
    expect(second.response.status).toBe(200);
    expect(second.data.proposals).toHaveLength(3);
    expect(generationCalls()).toBe(6);

    const firstIds = first.data.proposals.map((proposal) => proposal.id);
    const secondIds = second.data.proposals.map((proposal) => proposal.id);
    expect(new Set(firstIds).size).toBe(3);
    expect(new Set(secondIds).size).toBe(3);
    expect(secondIds.some((id) => firstIds.includes(id))).toBe(false);
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
      remate: "cruz-forja",
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
