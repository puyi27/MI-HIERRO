import sharp from "sharp";
import { extractPathData } from "@/lib/forge-engine/compiler";
import { textToPath } from "@/lib/forge-engine/text-path";
import type { DesignRecord } from "@/lib/store/types";
import type { PreviewTexture } from "@/types/forge";

type StorySurface = "hierro" | "bordado" | "cuero";

interface TextureTheme {
  surface: StorySurface;
  backgroundTop: string;
  backgroundBottom: string;
  glow: string;
  accent: string;
  pattern: string;
  hint: string;
}

const THEMES: Record<PreviewTexture, TextureTheme> = {
  hierro: {
    surface: "hierro",
    backgroundTop: "#0C0B0A",
    backgroundBottom: "#151311",
    glow: "#C89B63",
    accent: "#C89B63",
    pattern: `<pattern id="grain-lines" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 0 L0 26" stroke="#F2E9DA" stroke-opacity="0.035" stroke-width="2"/></pattern>`,
    hint: "HIERRO FORJADO NEGRO",
  },
  bordado: {
    surface: "bordado",
    backgroundTop: "#0B0D10",
    backgroundBottom: "#141A20",
    glow: "#8FA6B8",
    accent: "#C89B63",
    pattern: `<pattern id="weave" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M0 0 H18" stroke="#F2E9DA" stroke-opacity="0.06" stroke-width="1.5"/><path d="M0 0 V18" stroke="#F2E9DA" stroke-opacity="0.04" stroke-width="1.5"/></pattern>`,
    hint: "BORDADO SOBRE CAPOTE Y POLO",
  },
  cuero: {
    surface: "cuero",
    backgroundTop: "#150F0A",
    backgroundBottom: "#241812",
    glow: "#C89B63",
    accent: "#C89B63",
    pattern: `<pattern id="grain" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M6 18 Q16 10 26 20 T44 22" stroke="#C89B63" stroke-opacity="0.08" stroke-width="1.4" fill="none"/></pattern>`,
    hint: "GRABADO EN CUERO Y MADERA QUEMADA",
  },
  capote: {
    surface: "bordado",
    backgroundTop: "#2A070B",
    backgroundBottom: "#460E15",
    glow: "#C89B63",
    accent: "#E2BA64",
    pattern: `<pattern id="weave" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 0 H16" stroke="#F2E9DA" stroke-opacity="0.06" stroke-width="1.2"/><path d="M0 0 V16" stroke="#F2E9DA" stroke-opacity="0.04" stroke-width="1.2"/></pattern>`,
    hint: "BORDADO EN HILO DE ORO · CAPOTE",
  },
  esporton: {
    surface: "cuero",
    backgroundTop: "#1B0F08",
    backgroundBottom: "#2C190E",
    glow: "#C89B63",
    accent: "#D9A868",
    pattern: `<pattern id="grain" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M6 18 Q16 10 26 20 T44 22" stroke="#C89B63" stroke-opacity="0.08" stroke-width="1.4" fill="none"/></pattern>`,
    hint: "ESPORTÓN DE PIEL · GUARNICIONERÍA",
  },
  fundon: {
    surface: "cuero",
    backgroundTop: "#1D0B0B",
    backgroundBottom: "#2F1213",
    glow: "#C89B63",
    accent: "#E2BA64",
    pattern: `<pattern id="grain" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M6 18 Q16 10 26 20 T44 22" stroke="#C89B63" stroke-opacity="0.08" stroke-width="1.4" fill="none"/></pattern>`,
    hint: "FUNDÓN DE ESPADAS · TAFILETE",
  },
  maleta: {
    surface: "cuero",
    backgroundTop: "#140D09",
    backgroundBottom: "#21150E",
    glow: "#C89B63",
    accent: "#D9A868",
    pattern: `<pattern id="grain" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M6 18 Q16 10 26 20 T44 22" stroke="#C89B63" stroke-opacity="0.08" stroke-width="1.4" fill="none"/></pattern>`,
    hint: "MALETA DEL MOZO DE ESPADAS",
  },
  avatar: {
    surface: "hierro",
    backgroundTop: "#11100E",
    backgroundBottom: "#1A1714",
    glow: "#C89B63",
    accent: "#C89B63",
    pattern: `<pattern id="grain-lines" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 0 L0 26" stroke="#F2E9DA" stroke-opacity="0.035" stroke-width="2"/></pattern>`,
    hint: "SELLO DIGITAL Y AVATAR DE REDES",
  },
  fragua: {
    surface: "hierro",
    backgroundTop: "#0E0B09",
    backgroundBottom: "#1C130E",
    glow: "#E0873E",
    accent: "#E2A65C",
    pattern: `<pattern id="grain-lines" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 0 L0 26" stroke="#F2E9DA" stroke-opacity="0.035" stroke-width="2"/></pattern>`,
    hint: "HIERRO FORJADO EN FRAGUA",
  },
  montura: {
    surface: "cuero",
    backgroundTop: "#191009",
    backgroundBottom: "#2A1A0E",
    glow: "#C89B63",
    accent: "#DFAD6E",
    pattern: `<pattern id="grain" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M6 18 Q16 10 26 20 T44 22" stroke="#C89B63" stroke-opacity="0.08" stroke-width="1.4" fill="none"/></pattern>`,
    hint: "MONTURA Y CUERO VAQUERO",
  },
  cancela: {
    surface: "hierro",
    backgroundTop: "#12100E",
    backgroundBottom: "#1B1814",
    glow: "#C89B63",
    accent: "#C89B63",
    pattern: `<pattern id="grain-lines" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 0 L0 26" stroke="#F2E9DA" stroke-opacity="0.035" stroke-width="2"/></pattern>`,
    hint: "CANCELA DE FINCA Y PORTÓN",
  },
  polo: {
    surface: "bordado",
    backgroundTop: "#121417",
    backgroundBottom: "#1E2228",
    glow: "#C89B63",
    accent: "#D9AE68",
    pattern: `<pattern id="weave" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M0 0 H18" stroke="#F2E9DA" stroke-opacity="0.06" stroke-width="1.5"/><path d="M0 0 V18" stroke="#F2E9DA" stroke-opacity="0.04" stroke-width="1.5"/></pattern>`,
    hint: "BORDADO EN POLO DE CAMPO",
  },
};

function centeredText(
  text: string,
  family: "cinzel" | "cormorant" | "inter",
  size: number,
  tracking: number,
  centerX: number,
  baselineY: number,
  fill: string,
  maxWidth: number,
  opacity = 1,
): string {
  const path = textToPath(text, family, { size, tracking });
  const scale = Math.min(1, maxWidth / Math.max(path.width, 1));
  const dx = centerX - (path.width * scale) / 2;
  return `<g transform="translate(${dx.toFixed(2)} ${baselineY}) scale(${scale.toFixed(3)})"><path d="${path.pathData}" fill="${fill}" fill-opacity="${opacity}"/></g>`;
}

function baseSvg(width: number, height: number, texture: PreviewTexture, body: string): string {
  const theme = THEMES[texture];
  const patternId = theme.surface === "bordado" ? "weave" : theme.surface === "cuero" ? "grain" : "grain-lines";
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="${theme.backgroundTop}"/>
      <stop offset="55%" stop-color="${theme.backgroundBottom}"/>
      <stop offset="100%" stop-color="${theme.backgroundTop}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="34%" r="62%">
      <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="${theme.glow}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${theme.glow}" stop-opacity="0"/>
    </radialGradient>
    ${theme.pattern}
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect width="${width}" height="${height}" fill="url(#${patternId})"/>
  ${body}
</svg>`;
}

function brandSignature(centerX: number, baselineY: number, scale = 1): string {
  const wordmark = textToPath("MI HIERRO", "cinzel", { size: 30, tracking: 0.34 });
  const tagline = textToPath("FORJA TU LEGADO", "inter", { size: 13, tracking: 0.42 });
  const wordmarkWidth = wordmark.width * scale;
  const lineWidth = Math.max(wordmarkWidth * 0.42, 90);
  const lineY = baselineY - 34;
  return `<g>
    <path d="M${centerX - wordmarkWidth / 2 - lineWidth - 22} ${lineY} H${centerX - wordmarkWidth / 2 - 22}" stroke="#C89B63" stroke-opacity="0.55" stroke-width="1.4"/>
    <path d="M${centerX + wordmarkWidth / 2 + 22} ${lineY} H${centerX + wordmarkWidth / 2 + lineWidth + 22}" stroke="#C89B63" stroke-opacity="0.55" stroke-width="1.4"/>
    <g transform="translate(${(centerX - wordmarkWidth / 2).toFixed(2)} ${baselineY}) scale(${scale})"><path d="${wordmark.pathData}" fill="#F2E9DA"/></g>
    <g transform="translate(${(centerX - (tagline.width * scale) / 2).toFixed(2)} ${baselineY + 30}) scale(${scale})"><path d="${tagline.pathData}" fill="#C89B63" fill-opacity="0.85"/></g>
  </g>`;
}

function clientName(design: DesignRecord, centerX: number, baselineY: number, maxWidth: number): string {
  const fullName = [design.firstName, design.lastName1, design.lastName2].filter(Boolean).join(" ");
  return centeredText(fullName, "cormorant", 58, 0.04, centerX, baselineY, "#F2E9DA", maxWidth);
}

function legalMicrocopy(centerX: number, baselineY: number, width: number): string {
  return `<g>
    ${centeredText("VISTA ORIENTATIVA · NO CERTIFICA DISPONIBILIDAD", "inter", 12, 0.2, centerX, baselineY, "#F2E9DA", width, 0.5)}
    ${centeredText("ANTE RUCTL, OEPM, EUIPO NI OMPI · RD 787/2023", "inter", 11, 0.16, centerX, baselineY + 26, "#F2E9DA", width, 0.42)}
  </g>`;
}

async function tintGoldMask(maskBase64: string, size: number): Promise<string> {
  const { data, info } = await sharp(Buffer.from(maskBase64, "base64"))
    .ensureAlpha()
    .resize({ width: size, height: size, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const tinted = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i += 1) {
    const idx = i * 4;
    const alpha = data[idx + 3];
    if (alpha === 0) continue;
    tinted[idx] = 216;
    tinted[idx + 1] = 169;
    tinted[idx + 2] = 94;
    tinted[idx + 3] = alpha;
  }

  const out = await sharp(tinted, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  return out.toString("base64");
}

async function logoBlock(design: DesignRecord, size: number, centerX: number, topY: number): Promise<string> {
  const scale = size / 300;
  const x = centerX - size / 2;
  if (design.rasterPng) {
    const goldBase64 = await tintGoldMask(design.rasterPng, size);
    return `<image href="data:image/png;base64,${goldBase64}" xlink:href="data:image/png;base64,${goldBase64}" x="${x.toFixed(2)}" y="${topY}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`;
  }
  const pathData = extractPathData(design.svgMaster);
  return `<g transform="translate(${x.toFixed(2)} ${topY}) scale(${scale.toFixed(3)})"><path d="${pathData}" fill="#C89B63" fill-rule="evenodd"/></g>`;
}

export async function renderStoryCard(design: DesignRecord, texture: PreviewTexture): Promise<Buffer> {
  const width = 1080;
  const height = 1920;
  const centerX = width / 2;
  const theme = THEMES[texture];
  const logo = await logoBlock(design, 420, centerX, 400);
  const body = `
    <rect x="56" y="56" width="${width - 112}" height="${height - 112}" fill="none" stroke="#2B2622" stroke-width="2"/>
    <rect x="72" y="72" width="${width - 144}" height="${height - 144}" fill="none" stroke="#C89B63" stroke-opacity="0.18" stroke-width="1"/>
    ${centeredText(theme.hint, "inter", 13, 0.34, centerX, 190, theme.accent, 820, 0.85)}
    ${logo}
    ${clientName(design, centerX, 980, 900)}
    ${centeredText(
      [design.origin ? design.origin.toUpperCase() : "", design.style.toUpperCase()].filter(Boolean).join(" · "),
      "inter",
      14,
      0.28,
      centerX,
      1032,
      "#C89B63",
      760,
      0.8,
    )}
    <path d="M${centerX - 60} 1110 H${centerX + 60}" stroke="#C89B63" stroke-opacity="0.5" stroke-width="1.4"/>
    ${centeredText(design.lore, "cormorant", 30, 0.02, centerX, 1196, "#F2E9DA", 780, 0.8)}
    ${brandSignature(centerX, 1580)}
    ${legalMicrocopy(centerX, 1740, 780)}
  `;
  return sharp(Buffer.from(baseSvg(width, height, texture, body)), { density: 96 }).resize(width, height).png().toBuffer();
}

export async function renderAvatar(
  design: DesignRecord,
  texture: PreviewTexture = "hierro",
  watermark = false,
): Promise<Buffer> {
  const size = 1080;
  const centerX = size / 2;
  const mark = textToPath("MI HIERRO · VISTA ORIENTATIVA", "cinzel", { size: 24, tracking: 0.2 });
  const diagonal = watermark
    ? `<g transform="translate(${centerX} 500) rotate(-24) translate(${-mark.width / 2} 0)" opacity="0.1"><path d="${mark.pathData}" fill="#F2E9DA"/></g>
       <g transform="translate(${centerX} 760) rotate(-24) translate(${-mark.width / 2} 0)" opacity="0.08"><path d="${mark.pathData}" fill="#F2E9DA"/></g>`
    : "";
  const logo = await logoBlock(design, 560, centerX, 250);
  const body = `
    <rect x="44" y="44" width="${size - 88}" height="${size - 88}" fill="none" stroke="#2B2622" stroke-width="2"/>
    ${logo}
    ${diagonal}
    ${brandSignature(centerX, 908, 0.9)}
  `;
  return sharp(Buffer.from(baseSvg(size, size, texture, body)), { density: 96 }).resize(size, size).png().toBuffer();
}
