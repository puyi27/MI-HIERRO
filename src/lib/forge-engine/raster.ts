import sharp from "sharp";
import { textToPath } from "@/lib/forge-engine/text-path";
import { extractPathData } from "@/lib/forge-engine/compiler";

export interface PreviewOptions {
  width?: number;
  format?: "png" | "webp";
}

function watermarkSvg(width: number, height: number): string {
  const label = "MI HIERRO · VISTA ORIENTATIVA";
  const { pathData, width: textWidth } = textToPath(label, "cinzel", { size: 15, tracking: 0.16 });
  const stepX = Math.max(360, textWidth + 140);
  const stepY = 132;
  const groups: string[] = [];

  for (let row = -1; row * stepY < height + stepY; row += 1) {
    const y = row * stepY + 90;
    const offset = row % 2 === 0 ? 0 : stepX / 2;
    for (let x = -stepX; x < width + stepX; x += stepX) {
      groups.push(
        `<g transform="translate(${Math.round(x + offset)} ${Math.round(y)}) rotate(-28)"><path d="${pathData}" fill="#C89B63" fill-opacity="0.16"/></g>`,
      );
    }
  }

  const domain = textToPath("mihierro.es", "cinzel", { size: 13, tracking: 0.24 });
  groups.push(
    `<g transform="translate(${Math.round(width - domain.width - 34)} ${Math.round(height - 34)})"><path d="${domain.pathData}" fill="#F2E9DA" fill-opacity="0.5"/></g>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${groups.join("")}</svg>`;
}

function forgedScene(masterSvg: string): string {
  const pathData = extractPathData(masterSvg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F7F0E4"/>
      <stop offset="0.24" stop-color="#E2C6A0"/>
      <stop offset="0.44" stop-color="#C89B63"/>
      <stop offset="0.6" stop-color="#7B5836"/>
      <stop offset="0.78" stop-color="#C89B63"/>
      <stop offset="1" stop-color="#EFE0C8"/>
    </linearGradient>
    <filter id="soft" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="2.6"/>
    </filter>
    <filter id="edge" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="0.7"/>
    </filter>
  </defs>
  <g filter="url(#soft)" opacity="0.8"><path d="${pathData}" transform="translate(0 3.6)" fill="#000000" fill-rule="evenodd"/></g>
  <g filter="url(#edge)"><path d="${pathData}" transform="translate(-0.9 -0.9)" fill="#F7F0E4" fill-opacity="0.4" fill-rule="evenodd"/></g>
  <path d="${pathData}" transform="translate(0.7 0.7)" fill="#4A3524" fill-opacity="0.6" fill-rule="evenodd"/>
  <path d="${pathData}" fill="url(#metal)" fill-rule="evenodd"/>
</svg>`;
}

export async function renderPreview(masterSvg: string, options: PreviewOptions = {}): Promise<Buffer> {
  const width = options.width ?? 900;
  const format = options.format ?? "png";
  const scene = forgedScene(masterSvg);
  const rendered = await sharp(Buffer.from(scene), { density: 420 }).resize({ width }).png().toBuffer();
  const metadata = await sharp(rendered).metadata();
  const height = metadata.height ?? width;
  const overlay = Buffer.from(watermarkSvg(width, height));

  const composed = sharp(rendered).composite([{ input: overlay, top: 0, left: 0 }]);

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
