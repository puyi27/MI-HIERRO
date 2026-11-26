import paper from "paper";
import { offsetStroke } from "paperjs-offset";
import type { AnchorPointKey, OrnamentV2Key } from "@/types/forge";
import type { LetterAnchors } from "@/lib/forge-engine/skeletons";

export interface InkBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function rectD(x: number, y: number, width: number, height: number): string {
  return `M${round(x)} ${round(y)}H${round(x + width)}V${round(y + height)}H${round(x)}Z`;
}

export function circleD(cx: number, cy: number, radius: number): string {
  const r = round(radius);
  return `M${round(cx - r)} ${round(cy)}A${r} ${r} 0 1 0 ${round(cx + r)} ${round(cy)}A${r} ${r} 0 1 0 ${round(cx - r)} ${round(cy)}Z`;
}

export function shieldD(cx: number, top: number, width: number, height: number): string {
  const left = round(cx - width / 2);
  const right = round(cx + width / 2);
  const shoulder = round(top + height * 0.42);
  const bottom = round(top + height);
  const mid = round(cx);
  return `M${left} ${round(top)}H${right}V${shoulder}Q${right} ${round(bottom - height * 0.08)} ${mid} ${bottom}Q${left} ${round(bottom - height * 0.08)} ${left} ${shoulder}Z`;
}

export function crownShape(cx: number, baseY: number, width: number): string {
  const barHeight = 8;
  const spikeHeight = 24;
  const half = width / 2;
  const parts: string[] = [rectD(cx - half, baseY - barHeight, width, barHeight)];

  const positions = [cx - half + width * 0.12, cx, cx + half - width * 0.12];
  for (const x of positions) {
    parts.push(rectD(x - 2.6, baseY - barHeight - spikeHeight, 5.2, spikeHeight));
    parts.push(circleD(x, baseY - barHeight - spikeHeight - 1, 5.4));
  }

  parts.push(circleD(cx - half, baseY - barHeight / 2, 4.2));
  parts.push(circleD(cx + half, baseY - barHeight / 2, 4.2));
  return parts.join("");
}

export function crossShape(cx: number, baseY: number, shaftWidth = 9, shaftHeight = 42): string {
  const armWidth = 32;
  const armHeight = 8;
  return [
    rectD(cx - shaftWidth / 2, baseY - shaftHeight, shaftWidth, shaftHeight),
    rectD(cx - armWidth / 2, baseY - shaftHeight + 12, armWidth, armHeight),
  ].join("");
}

export function starShape(cx: number, baseY: number, radius = 10): string {
  const tip = baseY - radius * 2;
  const low = baseY - radius;
  return `M${round(cx)} ${round(tip)}L${round(cx + radius * 0.34)} ${round(low)}L${round(cx + radius)} ${round(low)}L${round(cx + radius * 0.4)} ${round(baseY - radius * 0.45)}L${round(cx + radius * 0.62)} ${round(baseY)}L${round(cx)} ${round(baseY - radius * 0.6)}L${round(cx - radius * 0.62)} ${round(baseY)}L${round(cx - radius * 0.4)} ${round(baseY - radius * 0.45)}L${round(cx - radius)} ${round(low)}L${round(cx - radius * 0.34)} ${round(low)}Z`;
}

export function archMaskD(cx: number, cy: number, radius: number): string {
  return rectD(cx - radius - 6, cy - radius - 6, (radius + 6) * 2, radius + 6);
}

function strokePolyline(scope: paper.PaperScope, points: Array<[number, number]>, width: number, closed = false): paper.PathItem {
  const centerline = new scope.Path({
    segments: points.map(([x, y]) => new scope.Point(x, y)),
    closed,
    insert: false,
  });
  const half = Math.max(3, width / 2);
  const pletina = offsetStroke(centerline, half, {
    join: "round",
    cap: "round",
    limit: 6,
    insert: false,
    algorithm: "auto",
  }) as unknown as paper.PathItem;
  centerline.remove();
  return pletina;
}

function uniteAll(items: paper.PathItem[]): paper.PathItem {
  let acc = items[0];
  for (let i = 1; i < items.length; i += 1) {
    const next = acc.unite(items[i], { insert: false });
    acc.remove();
    items[i].remove();
    acc = next;
  }
  return acc;
}

export function buildOrnamentPletina(
  scope: paper.PaperScope,
  type: OrnamentV2Key,
  anchor: AnchorPointKey,
  anchors: LetterAnchors,
  bounds: paper.Rectangle,
  strokeWidth: number,
  welded: boolean,
): paper.PathItem | null {
  if (type === "none") return null;

  const w = Math.max(6, strokeWidth);
  const cx = (bounds.left + bounds.right) / 2;
  const topY = bounds.top;
  const bottomY = bounds.bottom;
  const span = Math.max(bounds.width * 0.72, 54);
  const weldOffset = welded ? w * 0.35 : -w * 0.8;

  if (type === "corona_abierta") {
    const baseY = topY - w / 2 - 2;
    const half = span * 0.48;
    const bar = strokePolyline(scope, [[cx - half, baseY], [cx + half, baseY]], w);
    const leftPeak = strokePolyline(scope, [[cx - half + w * 0.3, baseY], [cx - half - 4, baseY - 22]], w * 0.9);
    const midPeak = strokePolyline(scope, [[cx, baseY], [cx, baseY - 28]], w);
    const rightPeak = strokePolyline(scope, [[cx + half - w * 0.3, baseY], [cx + half + 4, baseY - 22]], w * 0.9);
    return uniteAll([bar, leftPeak, midPeak, rightPeak]);
  }

  if (type === "cruz_forja") {
    const baseY = topY - w / 2 - 2;
    const shaft = strokePolyline(scope, [[cx, baseY], [cx, baseY - 34]], w);
    const arms = strokePolyline(scope, [[cx - 18, baseY - 22], [cx + 18, baseY - 22]], w);
    return uniteAll([shaft, arms]);
  }

  if (type === "asa_caldera") {
    const sideX = anchor === "leftStem" ? bounds.left + weldOffset : bounds.right - weldOffset;
    const dir = anchor === "leftStem" ? -1 : 1;
    const midY = (bounds.top + bounds.bottom) / 2;
    const loopR = Math.min(28, Math.max(18, bounds.height * 0.28));
    const arc = new scope.Path.Arc({
      from: [sideX, midY - loopR],
      through: [sideX + dir * loopR * 1.15, midY],
      to: [sideX, midY + loopR],
      insert: false,
    });
    const body = offsetStroke(arc, w / 2, { join: "round", cap: "round", insert: false, algorithm: "auto" }) as unknown as paper.PathItem;
    arc.remove();
    return body;
  }

  if (type === "arco_portico") {
    const r = Math.max(bounds.width * 0.56, 48);
    const cy = bounds.top + bounds.height * 0.25;
    const arc = new scope.Path.Arc({
      from: [cx - r, cy],
      through: [cx, cy - r * 0.95],
      to: [cx + r, cy],
      insert: false,
    });
    const body = offsetStroke(arc, w / 2, { join: "round", cap: "round", insert: false, algorithm: "auto" }) as unknown as paper.PathItem;
    arc.remove();
    return body;
  }

  if (type === "bocado_pre") {
    const r = Math.max(bounds.width * 0.45, 36);
    const baseY = topY - 2 + weldOffset;
    const arch = new scope.Path.Arc({
      from: [cx - r * 0.8, baseY],
      through: [cx, baseY - r * 0.72],
      to: [cx + r * 0.8, baseY],
      insert: false,
    });
    const archBody = offsetStroke(arch, w / 2, { join: "round", cap: "round", insert: false, algorithm: "auto" }) as unknown as paper.PathItem;
    arch.remove();
    const ring = strokePolyline(scope, [[cx - 10, baseY - r * 0.72 - 4], [cx + 10, baseY - r * 0.72 - 4]], w * 0.9);
    return uniteAll([archBody, ring]);
  }

  if (type === "herradura_limpia") {
    const r = Math.max(bounds.width, bounds.height) * 0.58;
    const cy = (bounds.top + bounds.bottom) / 2;
    const arc = new scope.Path.Arc({
      from: [cx - r * 0.78, cy + r * 0.62],
      through: [cx, cy - r],
      to: [cx + r * 0.78, cy + r * 0.62],
      insert: false,
    });
    const body = offsetStroke(arc, w / 2, { join: "round", cap: "round", insert: false, algorithm: "auto" }) as unknown as paper.PathItem;
    arc.remove();
    return body;
  }

  if (type === "horquilla") {
    const baseY = topY - w / 2 - 2;
    const stem = strokePolyline(scope, [[cx, baseY], [cx, baseY - 14]], w);
    const leftProng = strokePolyline(scope, [[cx, baseY - 14], [cx - 16, baseY - 32]], w * 0.9);
    const rightProng = strokePolyline(scope, [[cx, baseY - 14], [cx + 16, baseY - 32]], w * 0.9);
    return uniteAll([stem, leftProng, rightProng]);
  }

  const barW = Math.max(bounds.width + 24, 72);
  const upper = strokePolyline(scope, [[cx - barW / 2, topY - 12], [cx + barW / 2, topY - 12]], w * 0.85);
  const lower = strokePolyline(scope, [[cx - barW / 2, bottomY + 12], [cx + barW / 2, bottomY + 12]], w * 0.85);
  return uniteAll([upper, lower]);
}
