import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUTPUT_DIR = path.resolve("public/images/styles");
const CLEAN_DIR = path.resolve("scripts/recraft-refs-clean");
const SOURCE = {
  tradicional: "tradicional/tradicional-4.png",
  monograma: "monograma/monograma-1.png",
  geometrico: "geometrico/geometrico-4.png",
  heraldico: "heraldico/heraldico-4.png",
};
const LETTERS = {
  tradicional: "H",
  monograma: "S",
  geometrico: "Z",
  heraldico: "V",
};
const STYLE_ENV = {
  tradicional: "RECRAFT_STYLE_TRADICIONAL",
  monograma: "RECRAFT_STYLE_MONOGRAMA",
  geometrico: "RECRAFT_STYLE_GEOMETRICO",
  heraldico: "RECRAFT_STYLE_HERALDICO",
};
const SIZE = 1024;
const INNER = Math.round(SIZE * 0.88);
const useRecraft = process.argv.includes("--recraft");

async function silhouetteFromImage(inputPath) {
  const flat = await sharp(inputPath)
    .flatten({ background: "#FFFFFF" })
    .greyscale()
    .threshold(175)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = flat.info;
  const rgba = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const alpha = flat.data[pixel] < 128 ? 255 : 0;
    const offset = pixel * 4;
    rgba[offset] = 0;
    rgba[offset + 1] = 0;
    rgba[offset + 2] = 0;
    rgba[offset + 3] = alpha;
  }

  return sharp(rgba, { raw: { width, height, channels: 4 } }).trim().png().toBuffer();
}

function recraftPrompt(style) {
  return [
    `Cattle brand emblem with the single letter ${LETTERS[style]}, ${style} style, welded forged iron silhouette.`,
    "Pure black #000000 shapes on a pure white #FFFFFF background, bold constant stroke, open internal cavities.",
    "One single centred emblem isolated with a generous white margin, flat 2D, vector ready.",
    "No gradients, no shading, no texture, no extra letters, no frame, no watermark.",
  ].join(" ");
}

async function silhouetteFromRecraft(style) {
  const apiKey = process.env.RECRAFT_API_KEY;
  const styleId = process.env[STYLE_ENV[style]];
  if (!apiKey || !styleId) {
    throw new Error(`Faltan RECRAFT_API_KEY o ${STYLE_ENV[style]} para el estilo ${style}`);
  }

  const response = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "recraftv4_styles",
      prompt: recraftPrompt(style),
      style_id: styleId,
      style_match: "precise",
      size: "1024x1024",
      n: 1,
      response_format: "b64_json",
      image_format: "png",
    }),
  });

  if (!response.ok) throw new Error(`Recraft ${response.status}: ${(await response.text()).slice(0, 400)}`);

  const payload = await response.json();
  const png = payload.data?.[0]?.b64_json ? Buffer.from(payload.data[0].b64_json, "base64") : null;
  if (!png) throw new Error(`Recraft no devolvió imagen para ${style}`);
  return silhouetteFromImage(png);
}

async function writeSample(style) {
  const silhouette = useRecraft
    ? await silhouetteFromRecraft(style)
    : await silhouetteFromImage(path.join(CLEAN_DIR, SOURCE[style]));

  const resized = await sharp(silhouette)
    .resize({ width: INNER, height: INNER, fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const composed = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  const target = path.join(OUTPUT_DIR, `${style}.png`);
  fs.writeFileSync(target, composed);
  const stats = await sharp(composed).stats();
  console.log(`${style}: ${target} · ${composed.length} bytes · alphaMax ${stats.channels[3]?.max ?? 0}`);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const style of Object.keys(SOURCE)) {
  await writeSample(style);
}

console.log(useRecraft ? "Láminas generadas con Recraft V4." : "Láminas generadas desde scripts/recraft-refs-clean.");
