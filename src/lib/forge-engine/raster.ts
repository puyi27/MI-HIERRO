import sharp from "sharp";
import { textToPath } from "@/lib/forge-engine/text-path";
import { extractPathData } from "@/lib/forge-engine/compiler";
import type { PreviewTexture } from "@/types/forge";

export interface PreviewOptions {
  width?: number;
  format?: "png" | "webp";
  backdrop?: PreviewTexture;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface MaterialFinish {
  startHex: string;
  midHex: string;
  endHex: string;
  bevelHex: string;
  shadowHex: string;
  startRgb: RgbColor;
  midRgb: RgbColor;
  endRgb: RgbColor;
  lightSurface: boolean;
}

const MATERIAL_FINISHES: Record<PreviewTexture, MaterialFinish> = {
  hierro: {
    startHex: "#F7F0E4",
    midHex: "#C89B63",
    endHex: "#8B5E34",
    bevelHex: "#F7F0E4",
    shadowHex: "#000000",
    startRgb: { r: 247, g: 240, b: 228 },
    midRgb: { r: 200, g: 155, b: 99 },
    endRgb: { r: 139, g: 94, b: 52 },
    lightSurface: false,
  },
  bordado: {
    startHex: "#FFF2C2",
    midHex: "#E2B55A",
    endHex: "#A87424",
    bevelHex: "#FFF8DC",
    shadowHex: "#06080A",
    startRgb: { r: 255, g: 242, b: 194 },
    midRgb: { r: 226, g: 181, b: 90 },
    endRgb: { r: 168, g: 116, b: 36 },
    lightSurface: false,
  },
  cuero: {
    startHex: "#3A2010",
    midHex: "#1E0F06",
    endHex: "#120803",
    bevelHex: "#DFA86B",
    shadowHex: "#080301",
    startRgb: { r: 58, g: 32, b: 16 },
    midRgb: { r: 30, g: 15, b: 6 },
    endRgb: { r: 18, g: 8, b: 3 },
    lightSurface: false,
  },
  capote: {
    startHex: "#FFF1BA",
    midHex: "#E8BA54",
    endHex: "#B57E20",
    bevelHex: "#FFF7D6",
    shadowHex: "#200407",
    startRgb: { r: 255, g: 241, b: 186 },
    midRgb: { r: 232, g: 186, b: 84 },
    endRgb: { r: 181, g: 126, b: 32 },
    lightSurface: false,
  },
  esporton: {
    startHex: "#2E170A",
    midHex: "#1A0C04",
    endHex: "#0E0602",
    bevelHex: "#E4B272",
    shadowHex: "#060201",
    startRgb: { r: 46, g: 23, b: 10 },
    midRgb: { r: 26, g: 12, b: 4 },
    endRgb: { r: 14, g: 6, b: 2 },
    lightSurface: false,
  },
  fundon: {
    startHex: "#FCECB8",
    midHex: "#DFB054",
    endHex: "#A67524",
    bevelHex: "#FFF5D4",
    shadowHex: "#120303",
    startRgb: { r: 252, g: 236, b: 184 },
    midRgb: { r: 223, g: 176, b: 84 },
    endRgb: { r: 166, g: 117, b: 36 },
    lightSurface: false,
  },
  maleta: {
    startHex: "#FBEEC0",
    midHex: "#D8A94E",
    endHex: "#9B6D22",
    bevelHex: "#FFF4D0",
    shadowHex: "#0A0502",
    startRgb: { r: 251, g: 238, b: 192 },
    midRgb: { r: 216, g: 169, b: 78 },
    endRgb: { r: 155, g: 109, b: 34 },
    lightSurface: false,
  },
  avatar: {
    startHex: "#161412",
    midHex: "#29231E",
    endHex: "#161412",
    bevelHex: "#B8832E",
    shadowHex: "#7D511E",
    startRgb: { r: 22, g: 20, b: 18 },
    midRgb: { r: 41, g: 35, b: 30 },
    endRgb: { r: 22, g: 20, b: 18 },
    lightSurface: true,
  },
  fragua: {
    startHex: "#FFE6AE",
    midHex: "#E8933C",
    endHex: "#AD4D1A",
    bevelHex: "#FFF3D1",
    shadowHex: "#000000",
    startRgb: { r: 255, g: 230, b: 174 },
    midRgb: { r: 232, g: 147, b: 60 },
    endRgb: { r: 173, g: 77, b: 26 },
    lightSurface: false,
  },
  montura: {
    startHex: "#2B1508",
    midHex: "#160A03",
    endHex: "#0C0501",
    bevelHex: "#E5B475",
    shadowHex: "#050201",
    startRgb: { r: 43, g: 21, b: 8 },
    midRgb: { r: 22, g: 10, b: 3 },
    endRgb: { r: 12, g: 5, b: 1 },
    lightSurface: false,
  },
  cancela: {
    startHex: "#161412",
    midHex: "#2D2824",
    endHex: "#100E0C",
    bevelHex: "#8C7D6B",
    shadowHex: "#4E473F",
    startRgb: { r: 22, g: 20, b: 18 },
    midRgb: { r: 45, g: 40, b: 36 },
    endRgb: { r: 16, g: 14, b: 12 },
    lightSurface: true,
  },
  polo: {
    startHex: "#7E1722",
    midHex: "#6B141E",
    endHex: "#490B12",
    bevelHex: "#B8832E",
    shadowHex: "#2B1517",
    startRgb: { r: 126, g: 23, b: 34 },
    midRgb: { r: 107, g: 20, b: 30 },
    endRgb: { r: 73, g: 11, b: 18 },
    lightSurface: true,
  },
};

function watermarkSvg(width: number, height: number, lightSurface: boolean): string {
  const label = "MI HIERRO · VISTA ORIENTATIVA";
  const { pathData, width: textWidth } = textToPath(label, "cinzel", { size: 15, tracking: 0.16 });
  const stepX = Math.max(360, textWidth + 140);
  const stepY = 132;
  const groups: string[] = [];
  const markFill = lightSurface ? "#4E473F" : "#C89B63";
  const markOpacity = lightSurface ? "0.18" : "0.18";
  const domainFill = lightSurface ? "#161412" : "#F2E9DA";

  for (let row = -1; row * stepY < height + stepY; row += 1) {
    const y = row * stepY + 90;
    const offset = row % 2 === 0 ? 0 : stepX / 2;
    for (let x = -stepX; x < width + stepX; x += stepX) {
      groups.push(
        `<g transform="translate(${Math.round(x + offset)} ${Math.round(y)}) rotate(-28)"><path d="${pathData}" fill="${markFill}" fill-opacity="${markOpacity}"/></g>`,
      );
    }
  }

  const domain = textToPath("mihierro.es", "cinzel", { size: 13, tracking: 0.24 });
  groups.push(
    `<g transform="translate(${Math.round(width - domain.width - 34)} ${Math.round(height - 34)})"><path d="${domain.pathData}" fill="${domainFill}" fill-opacity="0.52"/></g>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${groups.join("")}</svg>`;
}

function forgedScene(masterSvg: string, finish: MaterialFinish): string {
  const pathData = extractPathData(masterSvg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${finish.startHex}"/>
      <stop offset="0.5" stop-color="${finish.midHex}"/>
      <stop offset="1" stop-color="${finish.endHex}"/>
    </linearGradient>
    <filter id="soft" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="2.4"/>
    </filter>
    <filter id="edge" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="0.65"/>
    </filter>
  </defs>
  <g filter="url(#soft)" opacity="${finish.lightSurface ? "0.26" : "0.75"}"><path d="${pathData}" transform="translate(0 3.2)" fill="${finish.shadowHex}" fill-rule="evenodd"/></g>
  <g filter="url(#edge)"><path d="${pathData}" transform="translate(-0.9 -0.9)" fill="${finish.bevelHex}" fill-opacity="0.55" fill-rule="evenodd"/></g>
  <path d="${pathData}" transform="translate(0.7 0.7)" fill="${finish.shadowHex}" fill-opacity="0.45" fill-rule="evenodd"/>
  <path d="${pathData}" fill="url(#metal)" fill-rule="evenodd"/>
</svg>`;
}

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function gradientPixel(finish: MaterialFinish, progress: number): RgbColor {
  if (progress <= 0.5) {
    const local = progress * 2;
    return {
      r: lerpChannel(finish.startRgb.r, finish.midRgb.r, local),
      g: lerpChannel(finish.startRgb.g, finish.midRgb.g, local),
      b: lerpChannel(finish.startRgb.b, finish.midRgb.b, local),
    };
  }
  const local = (progress - 0.5) * 2;
  return {
    r: lerpChannel(finish.midRgb.r, finish.endRgb.r, local),
    g: lerpChannel(finish.midRgb.g, finish.endRgb.g, local),
    b: lerpChannel(finish.midRgb.b, finish.endRgb.b, local),
  };
}

function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace("#", "");
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

function colorizeAlphaBuffer(
  alphaSource: Buffer,
  width: number,
  height: number,
  finish: MaterialFinish,
): { main: Buffer; bevel: Buffer; shadow: Buffer } {
  const byteLength = width * height * 4;
  const main = Buffer.alloc(byteLength);
  const bevel = Buffer.alloc(byteLength);
  const shadow = Buffer.alloc(byteLength);
  const bevelRgb = hexToRgb(finish.bevelHex);
  const shadowRgb = hexToRgb(finish.shadowHex);
  const denom = Math.max(1, width + height - 2);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const alpha = alphaSource[idx + 3];
      if (alpha === 0) continue;

      const progress = (x + y) / denom;
      const color = gradientPixel(finish, progress);

      main[idx] = color.r;
      main[idx + 1] = color.g;
      main[idx + 2] = color.b;
      main[idx + 3] = alpha;

      bevel[idx] = bevelRgb.r;
      bevel[idx + 1] = bevelRgb.g;
      bevel[idx + 2] = bevelRgb.b;
      bevel[idx + 3] = Math.round(alpha * 0.55);

      shadow[idx] = shadowRgb.r;
      shadow[idx + 1] = shadowRgb.g;
      shadow[idx + 2] = shadowRgb.b;
      shadow[idx + 3] = Math.round(alpha * (finish.lightSurface ? 0.25 : 0.65));
    }
  }

  return { main, bevel, shadow };
}

export async function renderPreview(masterSvg: string, options: PreviewOptions = {}): Promise<Buffer> {
  const width = options.width ?? 900;
  const format = options.format ?? "png";
  const finish = MATERIAL_FINISHES[options.backdrop ?? "hierro"];
  const scene = forgedScene(masterSvg, finish);
  const rendered = await sharp(Buffer.from(scene), { density: 420 })
    .resize({ width, height: width, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const overlay = Buffer.from(watermarkSvg(width, width, finish.lightSurface));

  const composed = sharp(rendered).composite([{ input: overlay, top: 0, left: 0 }]);

  if (format === "webp") {
    return composed.webp({ quality: 88 }).toBuffer();
  }

  return composed.png().toBuffer();
}

export async function renderMaskPreview(maskPng: Buffer, options: PreviewOptions = {}): Promise<Buffer> {
  const width = options.width ?? 900;
  const format = options.format ?? "png";
  const finish = MATERIAL_FINISHES[options.backdrop ?? "hierro"];
  const inset = Math.round(width * 0.14);
  const innerSize = width - inset * 2;

  const resized = await sharp(maskPng)
    .ensureAlpha()
    .resize({
      width: innerSize,
      height: innerSize,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rw = resized.info.width;
  const rh = resized.info.height;
  const { main, bevel, shadow } = colorizeAlphaBuffer(resized.data, rw, rh, finish);

  const shadowPng = await sharp(shadow, { raw: { width: rw, height: rh, channels: 4 } })
    .blur(4)
    .png()
    .toBuffer();
  const bevelPng = await sharp(bevel, { raw: { width: rw, height: rh, channels: 4 } })
    .blur(1)
    .png()
    .toBuffer();
  const mainPng = await sharp(main, { raw: { width: rw, height: rh, channels: 4 } })
    .png()
    .toBuffer();

  const baseTop = Math.round((width - rh) / 2);
  const baseLeft = Math.round((width - rw) / 2);
  const overlay = Buffer.from(watermarkSvg(width, width, finish.lightSurface));

  const composed = sharp({
    create: {
      width,
      height: width,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite([
    { input: shadowPng, top: baseTop + 5, left: baseLeft },
    { input: bevelPng, top: Math.max(0, baseTop - 2), left: Math.max(0, baseLeft - 2) },
    { input: mainPng, top: baseTop, left: baseLeft },
    { input: overlay, top: 0, left: 0 },
  ]);

  if (format === "webp") {
    return composed.webp({ quality: 88 }).toBuffer();
  }

  return composed.png().toBuffer();
}

export async function renderHighResolutionPng(masterSvg: string, size = 2400): Promise<Buffer> {
  return sharp(Buffer.from(masterSvg), { density: 900 })
    .resize({ width: size, height: size, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}
