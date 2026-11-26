import paper from "paper";
import type { BrandBlueprint, DesignScores, FontFamilyKey, InitialsCombination } from "@/types/forge";
import { loadFont } from "@/lib/forge-engine/fonts";
import { letterTrackingForStyle } from "@/lib/forge-engine/text-path";
import { archMaskD, circleD, crownShape, crossShape, shieldD, starShape } from "@/lib/forge-engine/ornaments";
import {
  centerAndOptimizePath,
  combineQuality,
  contourCount,
  hollowFromCenterline,
  qualityPenalty,
  type ForgeQuality,
} from "@/lib/forge-engine/precision";

export interface ForgeBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface ForgeGeometry {
  glyph: ForgeBox;
  frame: ForgeBox | null;
  ornament: ForgeBox | null;
  contours: number;
  frameContours: number;
}

export interface CompiledForge {
  svg: string;
  pathData: string;
  scores: DesignScores;
  minStroke: number;
  quality: ForgeQuality | null;
  geometry: ForgeGeometry;
}

const VIEWBOX = 300;
const CENTER = VIEWBOX / 2;
const MARGIN = 8;
const FRAME_WIDTH = 7;
const METAL_DEFS = `<defs><linearGradient id="forge-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2E9DA"/><stop offset="0.28" stop-color="#C89B63"/><stop offset="0.52" stop-color="#7E5C39"/><stop offset="0.76" stop-color="#C89B63"/><stop offset="1" stop-color="#E2C6A0"/></linearGradient></defs>`;

function clampScore(value: number): number {
  return Math.max(0, Math.min(99, Math.round(value)));
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return map[character] ?? character;
  });
}

function boxOf(item: paper.PathItem): ForgeBox {
  const bounds = item.bounds;
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom,
    width: bounds.width,
    height: bounds.height,
  };
}

function transformBox(box: ForgeBox, scale: number, dx: number, dy: number): ForgeBox {
  return {
    left: box.left * scale + dx,
    top: box.top * scale + dy,
    right: box.right * scale + dx,
    bottom: box.bottom * scale + dy,
    width: box.width * scale,
    height: box.height * scale,
  };
}

function countContours(pathData: string): number {
  return (pathData.match(/[Mm]/g) ?? []).length;
}

function buildGlyphs(
  scope: paper.PaperScope,
  letters: string[],
  family: FontFamilyKey,
  style: string,
  targetWidth: number,
  targetHeight: number,
): paper.CompoundPath {
  const font = loadFont(family);
  const size = 100;
  const tracking = letterTrackingForStyle(style) * size;
  const normalized = letters.length > 0 ? letters : ["M"];
  let penX = 0;
  let data = "";

  for (const letter of normalized) {
    const glyph = font.charToGlyph(letter);
    const glyphPath = glyph.getPath(penX, 0, size);
    data += glyphPath.toPathData(2);
    penX += ((glyph.advanceWidth || 0) * size) / (font.unitsPerEm || 1000) + tracking;
  }

  const compound = new scope.CompoundPath(data);
  const bounds = compound.bounds;
  const scale = Math.min(
    targetWidth / Math.max(bounds.width, 0.001),
    targetHeight / Math.max(bounds.height, 0.001),
  );
  compound.scale(scale, new scope.Point(0, 0));
  compound.position = new scope.Point(CENTER, CENTER);
  return compound;
}

function uniteShape(scope: paper.PaperScope, data: string): paper.PathItem {
  const compound = new scope.CompoundPath(data);
  let merged: paper.PathItem | null = null;
  for (const child of compound.children) {
    const piece = child.clone({ insert: false }) as paper.Path;
    merged = merged ? merged.unite(piece, { insert: false }) : piece;
  }
  const result = merged ?? compound;
  if (result.parent) result.remove();
  return result;
}

function ringFallback(scope: paper.PaperScope, cx: number, cy: number, outerRadius: number): paper.PathItem {
  const outer = new scope.Path(circleD(cx, cy, outerRadius));
  const inner = new scope.Path(circleD(cx, cy, Math.max(2, outerRadius - FRAME_WIDTH)));
  const ring = outer.subtract(inner, { insert: false });
  outer.remove();
  inner.remove();
  return ring;
}

function hollowRing(scope: paper.PaperScope, cx: number, cy: number, outerRadius: number): { item: paper.PathItem; quality: ForgeQuality } {
  const centerline = new scope.Path(circleD(cx, cy, Math.max(6, outerRadius - FRAME_WIDTH / 2)));
  const hollow = hollowFromCenterline(centerline, FRAME_WIDTH);
  centerline.remove();
  const item = contourCount(hollow.item) >= 2 ? hollow.item : ringFallback(scope, cx, cy, outerRadius);
  return { item, quality: hollow.quality };
}

function hollowShield(
  scope: paper.PaperScope,
  cx: number,
  top: number,
  width: number,
  height: number,
): { item: paper.PathItem; quality: ForgeQuality } {
  const inset = FRAME_WIDTH / 2;
  const centerline = new scope.Path(shieldD(cx, top + inset, width - FRAME_WIDTH, height - FRAME_WIDTH));
  const hollow = hollowFromCenterline(centerline, FRAME_WIDTH);
  centerline.remove();
  if (contourCount(hollow.item) >= 2) {
    return { item: hollow.item, quality: hollow.quality };
  }
  const outer = new scope.Path(shieldD(cx, top, width, height));
  const inner = new scope.Path(shieldD(cx, top + FRAME_WIDTH, width - FRAME_WIDTH * 2, height - FRAME_WIDTH * 1.9));
  const shield = outer.subtract(inner, { insert: false });
  outer.remove();
  inner.remove();
  return { item: shield, quality: hollow.quality };
}

function hollowArch(
  scope: paper.PaperScope,
  cx: number,
  arcY: number,
  outerRadius: number,
): { item: paper.PathItem; quality: ForgeQuality } {
  const ring = hollowRing(scope, cx, arcY, outerRadius);
  const mask = new scope.Path(archMaskD(cx, arcY, outerRadius));
  const arch = ring.item.intersect(mask, { insert: false });
  mask.remove();
  return { item: arch, quality: ring.quality };
}

function computeScores(
  blueprint: BrandBlueprint,
  letters: number,
  framed: boolean,
  quality: ForgeQuality | null,
): DesignScores {
  const legibilityBase: Record<string, number> = {
    tradicional: 93,
    monograma: 88,
    geometrico: 94,
    heraldico: 90,
  };
  const balanceBase: Record<string, number> = {
    tradicional: 93,
    monograma: 92,
    geometrico: 95,
    heraldico: 94,
  };

  const legibility =
    (legibilityBase[blueprint.style] ?? 90) +
    (letters <= 2 ? 3 : 0) -
    (blueprint.ornament === "crown" ? 1 : 0);
  const balance = (balanceBase[blueprint.style] ?? 92) + (framed ? 2 : 0);
  const forgeabilityBase =
    86 + (letters <= 2 ? 6 : 0) - (blueprint.ornament === "crown" ? 3 : 0) + (framed ? 4 : 0);
  const forgeability = forgeabilityBase - qualityPenalty(quality);

  return {
    legibility: clampScore(legibility),
    balance: clampScore(balance),
    forgeability: clampScore(Math.max(60, forgeability)),
  };
}

export function compileForge(blueprint: BrandBlueprint, combination: InitialsCombination): CompiledForge {
  const scope = paper as unknown as paper.PaperScope;
  scope.setup(new paper.Size(VIEWBOX, VIEWBOX));

  const letters = combination.letters.length > 0 ? combination.letters : [combination.primary];
  const style = blueprint.style;
  const frameKind = style === "heraldico" ? "shield" : blueprint.frame;

  const glyphTarget =
    frameKind === "circle" ? 146 : frameKind === "shield" ? 132 : style === "geometrico" ? 196 : 188;

  const glyphs = buildGlyphs(scope, letters, blueprint.fontFamily, style, glyphTarget, glyphTarget);
  const glyphBox = boxOf(glyphs);
  const pieces: string[] = [glyphs.pathData];
  const qualities: ForgeQuality[] = [];

  let frame: paper.PathItem | null = null;
  let ornamentItem: paper.PathItem | null = null;
  const glyphBounds = glyphs.bounds;

  if (frameKind === "circle") {
    const outerRadius = Math.min(
      138,
      Math.max(glyphBounds.width, glyphBounds.height) / 2 / 0.55 + FRAME_WIDTH / 2,
    );
    const ring = hollowRing(scope, CENTER, CENTER, outerRadius);
    frame = ring.item;
    qualities.push(ring.quality);
  } else if (frameKind === "shield") {
    const width = Math.max(196, glyphBounds.width + 74);
    const height = Math.max(198, glyphBounds.height + 82);
    const top = CENTER - height / 2;
    const shield = hollowShield(scope, CENTER, top, width, height);
    frame = shield.item;
    qualities.push(shield.quality);
  } else if (frameKind === "arch") {
    const outerRadius = Math.max(glyphBounds.width, glyphBounds.height) / 2 + 26;
    const arch = hollowArch(scope, CENTER, glyphBounds.y - 4, outerRadius);
    frame = arch.item;
    qualities.push(arch.quality);
  } else if (frameKind === "double-bar") {
    const barWidth = Math.min(232, Math.max(glyphBounds.width + 64, 150));
    const barLeft = CENTER - barWidth / 2;
    const barTop = glyphBounds.y - 18;
    const barBottom = glyphBounds.y + glyphBounds.height + 12;
    const upper = uniteShape(scope, `M${barLeft} ${barTop}H${barLeft + barWidth}V${barTop + 6}H${barLeft}Z`);
    const lower = uniteShape(scope, `M${barLeft} ${barBottom}H${barLeft + barWidth}V${barBottom + 6}H${barLeft}Z`);
    frame = new scope.CompoundPath({ children: [upper, lower], insert: false });
    pieces.push(upper.pathData, lower.pathData);
  }

  if (frame) pieces.push(frame.pathData);

  const frameBounds = frame ? frame.bounds : null;
  let anchorY = frameBounds ? frameBounds.top : glyphBounds.top;
  if (frameKind === "double-bar") anchorY = glyphBounds.y - 18;
  const ornament = blueprint.ornament;
  const ornamentWidth = Math.min(168, Math.max(glyphBounds.width + 44, 96));
  let ornamentData = "";

  if (ornament === "crown") {
    ornamentData = crownShape(CENTER, anchorY - 4, ornamentWidth);
  } else if (ornament === "cross") {
    ornamentData = crossShape(CENTER, anchorY - 4, 9, 42);
  } else if (ornament === "star") {
    ornamentData = starShape(CENTER, anchorY - 6, 10);
  } else if (ornament === "shield" && frameKind !== "shield") {
    const shieldWidth = Math.max(glyphBounds.width + 46, 140);
    const shieldHeight = Math.max(glyphBounds.height + 52, 160);
    const shieldTop = CENTER - shieldHeight / 2;
    const shield = hollowShield(scope, CENTER, shieldTop, shieldWidth, shieldHeight);
    qualities.push(shield.quality);
    ornamentData = shield.item.pathData;
  } else if (ornament === "arch" && frameKind !== "arch") {
    const archRadius = Math.max(glyphBounds.width, glyphBounds.height) / 2 + 22;
    const arch = hollowArch(scope, CENTER, glyphBounds.y - 4, archRadius);
    qualities.push(arch.quality);
    ornamentData = arch.item.pathData;
  }

  if (ornamentData) {
    ornamentItem = uniteShape(scope, ornamentData);
    pieces.push(ornamentItem.pathData);
  }

  const combined = new scope.CompoundPath(pieces.join(""));

  const rawBounds = combined.bounds;
  const fitScale = Math.min(
    1,
    (VIEWBOX - MARGIN * 2) / Math.max(rawBounds.width, 0.001),
    (VIEWBOX - MARGIN * 2) / Math.max(rawBounds.height, 0.001),
  );
  if (fitScale < 1) combined.scale(fitScale, new scope.Point(0, 0));

  const fitted = combined.bounds;
  const dx = CENTER - (fitted.left + fitted.right) / 2;
  const dy = CENTER - (fitted.top + fitted.bottom) / 2;
  combined.translate(dx, dy);

  const centered = centerAndOptimizePath(combined.pathData, VIEWBOX);
  const pathData = centered.pathData;

  if (!pathData || pathData.length < 8) {
    throw new Error("El compilador generó un trazado vacío");
  }

  if (/<text[\s>]/.test(pathData)) {
    throw new Error("El compilador no debe producir etiquetas de texto");
  }

  if (/NaN|Infinity/.test(pathData)) {
    throw new Error("El compilador generó coordenadas no finitas");
  }

  const quality = combineQuality(qualities);
  const effectiveStroke = Math.max(6, Math.round(FRAME_WIDTH * Math.min(1, fitScale) * 10) / 10);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" width="${VIEWBOX}" height="${VIEWBOX}" role="img"><title>MI HIERRO ${escapeXml(combination.label)}</title>${METAL_DEFS}<path d="${pathData}" fill="url(#forge-metal)" fill-rule="evenodd" clip-rule="evenodd"/></svg>`;

  return {
    svg,
    pathData,
    scores: computeScores(blueprint, letters.length, frameKind !== "none", quality),
    minStroke: frameKind === "none" ? 9 : effectiveStroke,
    quality,
    geometry: {
      glyph: transformBox(glyphBox, fitScale, dx, dy),
      frame: frame ? transformBox(boxOf(frame), fitScale, dx, dy) : null,
      ornament: ornamentItem ? transformBox(boxOf(ornamentItem), fitScale, dx, dy) : null,
      contours: countContours(pathData),
      frameContours: frame ? contourCount(frame) : 0,
    },
  };
}

export function extractPathData(svg: string): string {
  const match = svg.match(/<path[^>]*d="([^"]+)"/);
  return match ? match[1] : "";
}

export function svgHasTextTag(svg: string): boolean {
  return /<text[\s>]/.test(svg);
}
