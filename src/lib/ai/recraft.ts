import sharp from "sharp";
import type { ForgeStyle } from "@/types/forge";

const RECRAFT_BASE_URL = "https://external.api.recraft.ai/v1";
const RECRAFT_MODEL = "recraftv4_styles";
const MASK_SIZE = 1024;

const STYLE_ENV: Record<ForgeStyle, string> = {
  tradicional: "RECRAFT_STYLE_TRADICIONAL",
  monograma: "RECRAFT_STYLE_MONOGRAMA",
  geometrico: "RECRAFT_STYLE_GEOMETRICO",
  heraldico: "RECRAFT_STYLE_HERALDICO",
};

export class RecraftError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(message: string, status: number, detail: string) {
    super(message);
    this.name = "RecraftError";
    this.status = status;
    this.detail = detail;
  }
}

export interface RecraftRaster {
  png: Buffer;
  mask: Buffer;
}

export interface RecraftRasterRequest {
  prompt: string;
  styleId: string;
  count?: number;
}

interface RecraftImageEntry {
  b64_json?: string;
  url?: string;
}

interface RecraftImageResponse {
  data?: RecraftImageEntry[];
  image?: RecraftImageEntry;
}

export function hasRecraft(): boolean {
  return Boolean(process.env.RECRAFT_API_KEY);
}

export function recraftStyleId(style: ForgeStyle): string | null {
  const value = process.env[STYLE_ENV[style]];
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function buildTransparentMask(png: Buffer, size = MASK_SIZE): Promise<Buffer> {
  const thresholded = await sharp(png)
    .flatten({ background: "#FFFFFF" })
    .greyscale()
    .threshold(180)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = thresholded.info;
  const rgba = Buffer.alloc(width * height * 4);

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const alpha = thresholded.data[pixel] < 128 ? 255 : 0;
    const offset = pixel * 4;
    rgba[offset] = 0;
    rgba[offset + 1] = 0;
    rgba[offset + 2] = 0;
    rgba[offset + 3] = alpha;
  }

  const trimmed = await sharp(rgba, { raw: { width, height, channels: 4 } }).trim().png().toBuffer();
  const metadata = await sharp(trimmed).metadata();
  const inner = Math.round(size * 0.88);
  const resized = await sharp(trimmed)
    .resize({
      width: inner,
      height: inner,
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toBuffer();
}

function requireApiKey(): string {
  const apiKey = process.env.RECRAFT_API_KEY;
  if (!apiKey) throw new Error("RECRAFT_API_KEY no configurada");
  return apiKey;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.length > 0 ? buffer : null;
}

export async function generateRecraftRaster(input: RecraftRasterRequest): Promise<RecraftRaster[]> {
  const apiKey = requireApiKey();
  const count = Math.min(3, Math.max(1, input.count ?? 3));

  const response = await fetch(`${RECRAFT_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: RECRAFT_MODEL,
      prompt: input.prompt,
      style_id: input.styleId,
      style_match: "precise",
      size: "1024x1024",
      n: count,
      response_format: "b64_json",
      image_format: "png",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 600);
    throw new RecraftError(`Recraft respondió ${response.status}`, response.status, detail);
  }

  const payload = (await response.json()) as RecraftImageResponse;
  const entries = Array.isArray(payload.data) ? payload.data : [];
  const rasters: RecraftRaster[] = [];

  for (const entry of entries.slice(0, count)) {
    const png = entry.b64_json
      ? Buffer.from(entry.b64_json, "base64")
      : entry.url
        ? await downloadImage(entry.url)
        : null;
    if (!png || png.length === 0) continue;
    rasters.push({ png, mask: await buildTransparentMask(png) });
  }

  if (rasters.length === 0) {
    throw new RecraftError("Recraft no devolvió ninguna imagen utilizable", response.status, "respuesta sin b64_json ni url válidos");
  }
  return rasters;
}

export async function vectorizeRecraftImage(maskPng: Buffer): Promise<string> {
  const apiKey = requireApiKey();

  const response = await fetch(`${RECRAFT_BASE_URL}/images/vectorize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: `data:image/png;base64,${maskPng.toString("base64")}`,
      response_format: "b64_json",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 600);
    throw new RecraftError(`Recraft respondió ${response.status}`, response.status, detail);
  }

  const payload = (await response.json()) as RecraftImageResponse;
  let svg = payload.image?.b64_json ? Buffer.from(payload.image.b64_json, "base64").toString("utf8") : "";
  if (!svg && payload.image?.url) {
    const downloaded = await fetch(payload.image.url, { cache: "no-store" });
    if (downloaded.ok) svg = await downloaded.text();
  }

  const trimmed = svg.trim();
  if (!trimmed.startsWith("<svg")) throw new Error("Recraft no devolvió un SVG vectorial");
  if (/<text[\s>]/.test(trimmed)) throw new Error("El SVG vectorizado contiene etiquetas de texto");
  return trimmed;
}

export function rasterBackedSvg(maskBase64: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300" width="300" height="300" role="img"><image width="300" height="300" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${maskBase64}"/></svg>`;
}
