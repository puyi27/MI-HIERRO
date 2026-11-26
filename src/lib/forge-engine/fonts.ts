import fs from "node:fs";
import path from "node:path";
import { parse as parseFont, type Font } from "opentype.js";
import type { FontFamilyKey } from "@/types/forge";

const FONT_FILES: Record<FontFamilyKey, string> = {
  cinzel: "Cinzel-Bold.ttf",
  cormorant: "CormorantGaramond-Bold.ttf",
  inter: "Inter-Bold.ttf",
};

const cache = new Map<FontFamilyKey, Font>();

export function loadFont(family: FontFamilyKey): Font {
  const cached = cache.get(family);
  if (cached) return cached;
  const fontPath = path.join(process.cwd(), "src", "fonts", FONT_FILES[family]);
  const buffer = fs.readFileSync(fontPath);
  const font = parseFont(buffer as unknown as ArrayBuffer);
  cache.set(family, font);
  return font;
}

export function fontFamilyForStyle(style: string): FontFamilyKey {
  switch (style) {
    case "monograma":
      return "cormorant";
    case "geometrico":
      return "inter";
    case "heraldico":
      return "cinzel";
    default:
      return "cinzel";
  }
}
