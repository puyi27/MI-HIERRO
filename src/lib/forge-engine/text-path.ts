import { loadFont } from "@/lib/forge-engine/fonts";
import type { FontFamilyKey } from "@/types/forge";

export interface TextPathResult {
  pathData: string;
  width: number;
  height: number;
}

interface TextPathOptions {
  tracking?: number;
  size?: number;
}

export function textToPath(text: string, family: FontFamilyKey, options: TextPathOptions = {}): TextPathResult {
  const font = loadFont(family);
  const size = options.size ?? 200;
  const tracking = (options.tracking ?? 0) * size;
  const unitsPerEm = font.unitsPerEm || 1000;

  let penX = 0;
  let pathData = "";
  let previousGlyphIndex: number | null = null;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const character of text) {
    const glyph = font.charToGlyph(character);
    if (previousGlyphIndex !== null && glyph.advanceWidth) {
      penX += font.getKerningValue(font.glyphs.get(previousGlyphIndex), glyph) * (size / unitsPerEm);
    }
    const glyphPath = glyph.getPath(penX, 0, size);
    pathData += glyphPath.toPathData(2);
    const box = glyphPath.getBoundingBox();
    if (Number.isFinite(box.y1)) minY = Math.min(minY, box.y1);
    if (Number.isFinite(box.y2)) maxY = Math.max(maxY, box.y2);
    penX += ((glyph.advanceWidth || 0) * size) / unitsPerEm + tracking;
    previousGlyphIndex = glyph.index;
  }

  const width = Math.max(0, penX - tracking);
  const height = Number.isFinite(minY) && Number.isFinite(maxY) ? maxY - minY : size;

  return { pathData, width, height };
}

export function letterTrackingForStyle(style: string): number {
  switch (style) {
    case "tradicional":
      return 0.05;
    case "heraldico":
      return 0.04;
    case "geometrico":
      return 0.02;
    default:
      return 0;
  }
}
