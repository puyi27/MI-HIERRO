import paper from "paper";
import { analyze, offsetStroke, type OffsetQuality } from "paperjs-offset";
import { SVGPathCommander } from "svg-path-commander";

export interface ForgeQuality {
  score: number;
  selfIntersections: number;
  containmentErrors: number;
  distanceErrors: number;
  warnings: string[];
  segmentCount: number;
  area: number;
}

export interface HollowFrame {
  item: paper.PathItem;
  quality: ForgeQuality;
}

export interface CenteredPath {
  pathData: string;
  length: number;
  bbox: { x: number; y: number; width: number; height: number };
}

function toForgeQuality(quality: OffsetQuality): ForgeQuality {
  return {
    score: Number.isFinite(quality.score) ? quality.score : 0,
    selfIntersections: quality.selfIntersections,
    containmentErrors: quality.containmentErrors,
    distanceErrors: quality.distanceErrors,
    warnings: [...quality.warnings],
    segmentCount: quality.segmentCount,
    area: Number.isFinite(quality.area) ? quality.area : 0,
  };
}

export function hollowFromCenterline(
  centerline: paper.Path | paper.CompoundPath,
  strokeWidth: number,
): HollowFrame {
  const half = Math.max(1.5, strokeWidth / 2);
  const outline = offsetStroke(centerline, half, {
    join: "miter",
    cap: "butt",
    limit: 8,
    insert: false,
    algorithm: "auto",
  }) as unknown as paper.PathItem;
  const quality = analyze(centerline, outline as unknown as paper.Path, half, {
    stroke: true,
    join: "miter",
    cap: "butt",
  });
  const contours = outline.children ? outline.children.length : 1;
  const normalized = toForgeQuality(quality);
  if (contours < 2) {
    normalized.warnings = [...normalized.warnings, "open-contour"];
    normalized.segmentCount = Math.max(normalized.segmentCount, 1);
  }
  return { item: outline, quality: normalized };
}

export function contourCount(item: paper.PathItem): number {
  if (item.className === "CompoundPath") {
    return (item as paper.CompoundPath).children.length;
  }
  return (item as paper.Path).segments.length > 0 ? 1 : 0;
}

export function combineQuality(list: ForgeQuality[]): ForgeQuality | null {
  if (list.length === 0) return null;
  const warnings = new Set<string>();
  let score = 0;
  let selfIntersections = 0;
  let containmentErrors = 0;
  let distanceErrors = 0;
  let segmentCount = 0;
  let area = 0;
  for (const quality of list) {
    score += quality.score;
    selfIntersections += quality.selfIntersections;
    containmentErrors += quality.containmentErrors;
    distanceErrors += quality.distanceErrors;
    segmentCount += quality.segmentCount;
    area += quality.area;
    for (const warning of quality.warnings) warnings.add(warning);
  }
  return {
    score,
    selfIntersections,
    containmentErrors,
    distanceErrors,
    warnings: [...warnings],
    segmentCount,
    area,
  };
}

export function qualityPenalty(quality: ForgeQuality | null): number {
  if (!quality) return 0;
  const structural = quality.selfIntersections * 5 + quality.containmentErrors * 7 + quality.distanceErrors * 3;
  const warnings = quality.warnings.length * 3;
  const complexity = quality.segmentCount > 140 ? 4 : quality.segmentCount > 80 ? 2 : 0;
  return Math.min(26, structural + warnings + complexity);
}

export function centerAndOptimizePath(pathData: string, size: number): CenteredPath {
  const path = new SVGPathCommander(pathData);
  path.toAbsolute().toCurve();
  const initial = path.bbox;
  const dx = size / 2 - initial.cx;
  const dy = size / 2 - initial.cy;
  if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
    path.transform({ translate: [dx, dy] });
  }
  path.optimize();
  path.toAbsolute();
  const bbox = path.bbox;
  return {
    pathData: path.toString(),
    length: path.length,
    bbox: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
  };
}
