import paper from "paper";
import { SVGPathCommander } from "svg-path-commander";

export interface PostProcessResult {
  pathData: string;
  inkDensity: number;
  minStrokeValid: boolean;
  effectiveStroke: number;
  contours: number;
}

const VIEWBOX = 300;
const MARGIN_RATIO = 0.14;
const ACTIVE_SIZE = VIEWBOX * (1 - MARGIN_RATIO * 2);

export function applyBreathingGaps(
  scope: paper.PaperScope,
  item: paper.PathItem,
  strokeWidth: number,
): paper.PathItem {
  const b = item.bounds;
  if (b.width < 10 || b.height < 10) return item;

  const gapRadius = Math.max(1.8, Math.min(3.5, strokeWidth * 0.25));
  const notch = new scope.Path.Circle({
    center: [b.center.x, b.bottom - gapRadius * 0.6],
    radius: gapRadius * 0.7,
    insert: false,
  });

  if (item.intersects(notch)) {
    const carved = item.subtract(notch, { insert: false });
    notch.remove();
    if (carved.pathData && carved.pathData.length > 16) {
      item.remove();
      return carved;
    }
    carved.remove();
    return item;
  }

  notch.remove();
  return item;
}

export function postProcessForge(
  scope: paper.PaperScope,
  rawItem: paper.PathItem,
  nominalStroke: number,
  breathingGaps: boolean,
): PostProcessResult {
  let item = rawItem;

  if (breathingGaps) {
    item = applyBreathingGaps(scope, item, nominalStroke);
  }

  const rawBounds = item.bounds;
  const fitScale = Math.min(
    ACTIVE_SIZE / Math.max(rawBounds.width, 0.001),
    ACTIVE_SIZE / Math.max(rawBounds.height, 0.001),
  );
  item.scale(fitScale, new scope.Point(0, 0));

  const scaledBounds = item.bounds;
  const cx = VIEWBOX / 2;
  const cy = VIEWBOX / 2;
  const opticalYBias = scaledBounds.height * 0.015;
  item.translate(
    new scope.Point(cx - (scaledBounds.left + scaledBounds.right) / 2, cy - (scaledBounds.top + scaledBounds.bottom) / 2 - opticalYBias),
  );

  const commander = new SVGPathCommander(item.pathData);
  commander.toAbsolute().toCurve().optimize().toAbsolute();
  const pathData = commander.toString();

  const rawArea = (item as unknown as { area?: number }).area;
  const area = Math.abs(typeof rawArea === "number" && Number.isFinite(rawArea) ? rawArea : 0);
  const inkDensity = Math.min(1, Math.max(0, area / (VIEWBOX * VIEWBOX)));
  const effectiveStroke = Math.max(6, Math.round(nominalStroke * Math.min(1.5, fitScale) * 10) / 10);
  const minStrokeValid = effectiveStroke >= 6;
  const contours = (pathData.match(/[Mm]/g) ?? []).length;

  item.remove();

  return {
    pathData,
    inkDensity,
    minStrokeValid,
    effectiveStroke,
    contours,
  };
}
