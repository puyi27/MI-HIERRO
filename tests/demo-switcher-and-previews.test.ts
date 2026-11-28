import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isDemoSwitcherEnabled, isLocalBrowserHost } from "@/lib/demo-switcher";
import { getTextureOptionsForProfile } from "@/components/forge/types";
import { buildDeterministicBlueprints } from "@/lib/forge-engine/presets";
import { buildTransparentMask } from "@/lib/ai/recraft";
import { getStore } from "@/lib/store";
import { initialsCombinationSchema, userProfileSchema, type PreviewTexture } from "@/types/forge";

const storeFile = path.join(process.cwd(), ".data", `test-carriers-${process.pid}.json`);
process.env.MI_HIERRO_STORE_FILE = storeFile;
delete process.env.DATABASE_URL;
delete process.env.GEMINI_API_KEY;
delete process.env.RECRAFT_API_KEY;

const { GET: previewGet } = await import("@/app/api/preview/route");

const NOVILLERO_CARRIERS: PreviewTexture[] = ["capote", "esporton", "fundon", "maleta", "avatar"];
const GANADERIA_CARRIERS: PreviewTexture[] = ["fragua", "montura", "cancela", "polo"];
const ALL_NEW_CARRIERS: PreviewTexture[] = [...NOVILLERO_CARRIERS, ...GANADERIA_CARRIERS];

let svgDesignId = "";
let maskDesignId = "";

async function solidCenterSilhouettePng(): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#FFFFFF"/><rect x="110" y="110" width="292" height="292" fill="#000000"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

beforeAll(async () => {
  await fs.rm(storeFile, { force: true });
  const store = await getStore();
  const profile = userProfileSchema.parse({
    profile: "novillero",
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
  const blueprint = buildDeterministicBlueprints(profile, initials, "tradicional")[0];
  const svgMaster = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M50 50H250V250H50Z" fill="#000000"/></svg>`;

  const svgDesign = await store.createDesign({
    profile: profile.profile,
    firstName: profile.firstName,
    lastName1: profile.lastName1,
    lastName2: profile.lastName2,
    nickname: profile.nickname,
    origin: profile.origin,
    character: profile.character,
    remate: profile.remate,
    initials: initials.label,
    style: blueprint.style,
    blueprint,
    svgMaster,
    scores: { legibility: 90, balance: 88, forgeability: 92 },
    lore: blueprint.lore,
    rasterPng: null,
    generationKey: null,
  });
  svgDesignId = svgDesign.id;

  const mask = await buildTransparentMask(await solidCenterSilhouettePng());
  const maskDesign = await store.createDesign({
    profile: "ganaderia",
    firstName: "Alvaro",
    lastName1: "Domecq",
    lastName2: "",
    nickname: "",
    origin: "Jerez",
    character: "sobrio",
    remate: "cruz-forja",
    initials: "AD",
    style: "heraldico",
    blueprint,
    svgMaster,
    scores: { legibility: 92, balance: 91, forgeability: 89 },
    lore: blueprint.lore,
    rasterPng: mask.toString("base64"),
    generationKey: null,
  });
  maskDesignId = maskDesign.id;
});

afterAll(async () => {
  await fs.rm(storeFile, { force: true });
});

describe("Demo Switcher · bloqueo estricto en producción", () => {
  it("queda desactivado cuando NODE_ENV === production", () => {
    expect(isDemoSwitcherEnabled({ NODE_ENV: "production" })).toBe(false);
    expect(isDemoSwitcherEnabled({ NODE_ENV: "production", NEXT_PUBLIC_DEMO_SWITCHER: "false" })).toBe(false);
    expect(
      isDemoSwitcherEnabled({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        NEXT_PUBLIC_DEMO_SWITCHER: "true",
      }),
    ).toBe(false);
  });

  it("permite uso local en desarrollo o flag local sin Vercel production", () => {
    expect(isDemoSwitcherEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(isDemoSwitcherEnabled({ NODE_ENV: "test" })).toBe(true);
    expect(isDemoSwitcherEnabled({ NODE_ENV: "production", NEXT_PUBLIC_DEMO_SWITCHER: "true" })).toBe(true);
    expect(isLocalBrowserHost("localhost")).toBe(true);
    expect(isLocalBrowserHost("127.0.0.1")).toBe(true);
    expect(isLocalBrowserHost("mihierro.es")).toBe(false);
  });
});

describe("Soportes por perfil y previews rasterizados sin fuga", () => {
  it("devuelve los soportes específicos para Novillero y Ganadería", () => {
    const novillero = getTextureOptionsForProfile("novillero").map((o) => o.id);
    const ganaderia = getTextureOptionsForProfile("ganaderia").map((o) => o.id);

    expect(novillero).toEqual(NOVILLERO_CARRIERS);
    expect(ganaderia).toEqual(GANADERIA_CARRIERS);
  });

  it("sirve raster PNG 900x900 con marca de agua y contraste correcto para máscara Recraft en todos los soportes", async () => {
    for (const carrier of ALL_NEW_CARRIERS) {
      const response = await previewGet(
        new Request(`http://localhost:3000/api/preview?d=${maskDesignId}&v=0&t=${carrier}`),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/png");

      const buffer = Buffer.from(await response.arrayBuffer());
      expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(buffer.toString("utf8")).not.toContain("<svg");
      expect(buffer.toString("utf8")).not.toContain("<path");

      const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect(info.width).toBe(900);
      expect(info.height).toBe(900);

      const centerOffset = (450 * info.width + 450) * 4;
      const centerAlpha = data[centerOffset + 3];
      const centerR = data[centerOffset];
      expect(centerAlpha).toBeGreaterThan(200);

      if (carrier === "capote" || carrier === "fragua") {
        expect(centerR).toBeGreaterThan(170);
      }
      if (carrier === "cancela" || carrier === "avatar") {
        expect(centerR).toBeLessThan(70);
      }
      if (carrier === "polo") {
        expect(centerR).toBeGreaterThan(70);
        expect(centerR).toBeLessThan(160);
      }
    }
  });

  it("sirve raster PNG 900x900 sin fuga de SVG para el motor SVG de respaldo en todos los soportes", async () => {
    for (const carrier of ALL_NEW_CARRIERS) {
      const response = await previewGet(
        new Request(`http://localhost:3000/api/preview?d=${svgDesignId}&v=0&t=${carrier}`),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/png");

      const buffer = Buffer.from(await response.arrayBuffer());
      expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(buffer.toString("utf8")).not.toContain("<svg");

      const metadata = await sharp(buffer).metadata();
      expect(metadata.width).toBe(900);
      expect(metadata.height).toBe(900);
    }
  });
});
