import paper from "paper";
import { offsetStroke } from "paperjs-offset";
import type { TerminalStyleKey } from "@/types/forge";

export interface SkPoint {
  x: number;
  y: number;
}

export interface SkStroke {
  points: SkPoint[];
  closed?: boolean;
  smooth?: boolean;
}

export interface LetterAnchors {
  topApex: SkPoint;
  leftStem: SkPoint;
  rightStem: SkPoint;
  innerCavity: SkPoint | null;
  baseFoot: SkPoint;
}

export interface LetterSkeleton {
  letter: string;
  strokes: SkStroke[];
  anchors: LetterAnchors;
  hasLeftStem: boolean;
  hasRightStem: boolean;
  hasInnerCavity: boolean;
  hasCrossbar: boolean;
}

const DEFAULT_ANCHORS: LetterAnchors = {
  topApex: { x: 50, y: 10 },
  leftStem: { x: 20, y: 50 },
  rightStem: { x: 80, y: 50 },
  innerCavity: null,
  baseFoot: { x: 50, y: 90 },
};

const SKELETON_MAP: Record<string, Omit<LetterSkeleton, "letter">> = {
  A: {
    strokes: [
      { points: [{ x: 18, y: 90 }, { x: 50, y: 10 }, { x: 82, y: 90 }] },
      { points: [{ x: 30, y: 62 }, { x: 70, y: 62 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 34, y: 50 }, rightStem: { x: 66, y: 50 }, innerCavity: { x: 50, y: 44 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: true, hasCrossbar: true,
  },
  B: {
    strokes: [
      { points: [{ x: 24, y: 10 }, { x: 24, y: 90 }] },
      { points: [{ x: 24, y: 10 }, { x: 60, y: 10 }, { x: 74, y: 20 }, { x: 74, y: 38 }, { x: 60, y: 48 }, { x: 24, y: 48 }], smooth: true },
      { points: [{ x: 24, y: 48 }, { x: 64, y: 48 }, { x: 78, y: 60 }, { x: 78, y: 78 }, { x: 64, y: 90 }, { x: 24, y: 90 }], smooth: true },
    ],
    anchors: { topApex: { x: 48, y: 10 }, leftStem: { x: 24, y: 50 }, rightStem: { x: 76, y: 68 }, innerCavity: { x: 50, y: 70 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: false, hasInnerCavity: true, hasCrossbar: true,
  },
  C: {
    strokes: [
      { points: [{ x: 78, y: 24 }, { x: 64, y: 10 }, { x: 38, y: 10 }, { x: 22, y: 28 }, { x: 22, y: 72 }, { x: 38, y: 90 }, { x: 64, y: 90 }, { x: 78, y: 76 }], smooth: true },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 22, y: 50 }, rightStem: { x: 78, y: 50 }, innerCavity: { x: 56, y: 50 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: true, hasCrossbar: false,
  },
  D: {
    strokes: [
      { points: [{ x: 24, y: 10 }, { x: 24, y: 90 }] },
      { points: [{ x: 24, y: 10 }, { x: 58, y: 10 }, { x: 78, y: 28 }, { x: 78, y: 72 }, { x: 58, y: 90 }, { x: 24, y: 90 }], smooth: true },
    ],
    anchors: { topApex: { x: 48, y: 10 }, leftStem: { x: 24, y: 50 }, rightStem: { x: 78, y: 50 }, innerCavity: { x: 52, y: 50 }, baseFoot: { x: 48, y: 90 } },
    hasLeftStem: true, hasRightStem: false, hasInnerCavity: true, hasCrossbar: false,
  },
  E: {
    strokes: [
      { points: [{ x: 26, y: 10 }, { x: 26, y: 90 }] },
      { points: [{ x: 26, y: 10 }, { x: 76, y: 10 }] },
      { points: [{ x: 26, y: 50 }, { x: 68, y: 50 }] },
      { points: [{ x: 26, y: 90 }, { x: 76, y: 90 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 26, y: 50 }, rightStem: { x: 74, y: 50 }, innerCavity: { x: 56, y: 30 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: false, hasInnerCavity: false, hasCrossbar: true,
  },
  F: {
    strokes: [
      { points: [{ x: 26, y: 10 }, { x: 26, y: 90 }] },
      { points: [{ x: 26, y: 10 }, { x: 78, y: 10 }] },
      { points: [{ x: 26, y: 50 }, { x: 68, y: 50 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 26, y: 50 }, rightStem: { x: 74, y: 30 }, innerCavity: { x: 56, y: 70 }, baseFoot: { x: 26, y: 90 } },
    hasLeftStem: true, hasRightStem: false, hasInnerCavity: false, hasCrossbar: true,
  },
  G: {
    strokes: [
      { points: [{ x: 78, y: 24 }, { x: 64, y: 10 }, { x: 38, y: 10 }, { x: 22, y: 28 }, { x: 22, y: 72 }, { x: 38, y: 90 }, { x: 66, y: 90 }, { x: 78, y: 74 }, { x: 78, y: 52 }], smooth: true },
      { points: [{ x: 54, y: 52 }, { x: 78, y: 52 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 22, y: 50 }, rightStem: { x: 78, y: 64 }, innerCavity: { x: 48, y: 46 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: true, hasInnerCavity: true, hasCrossbar: true,
  },
  H: {
    strokes: [
      { points: [{ x: 22, y: 10 }, { x: 22, y: 90 }] },
      { points: [{ x: 78, y: 10 }, { x: 78, y: 90 }] },
      { points: [{ x: 22, y: 50 }, { x: 78, y: 50 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 22, y: 50 }, rightStem: { x: 78, y: 50 }, innerCavity: { x: 50, y: 30 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: true, hasInnerCavity: false, hasCrossbar: true,
  },
  I: {
    strokes: [
      { points: [{ x: 50, y: 10 }, { x: 50, y: 90 }] },
      { points: [{ x: 32, y: 10 }, { x: 68, y: 10 }] },
      { points: [{ x: 32, y: 90 }, { x: 68, y: 90 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 50, y: 50 }, rightStem: { x: 50, y: 50 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: true, hasInnerCavity: false, hasCrossbar: false,
  },
  J: {
    strokes: [
      { points: [{ x: 70, y: 10 }, { x: 70, y: 68 }, { x: 58, y: 88 }, { x: 38, y: 90 }, { x: 24, y: 76 }], smooth: true },
      { points: [{ x: 52, y: 10 }, { x: 82, y: 10 }] },
    ],
    anchors: { topApex: { x: 70, y: 10 }, leftStem: { x: 30, y: 60 }, rightStem: { x: 70, y: 45 }, innerCavity: { x: 46, y: 48 }, baseFoot: { x: 48, y: 90 } },
    hasLeftStem: false, hasRightStem: true, hasInnerCavity: false, hasCrossbar: false,
  },
  K: {
    strokes: [
      { points: [{ x: 24, y: 10 }, { x: 24, y: 90 }] },
      { points: [{ x: 78, y: 10 }, { x: 26, y: 52 }, { x: 80, y: 90 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 24, y: 50 }, rightStem: { x: 78, y: 50 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: false, hasInnerCavity: false, hasCrossbar: false,
  },
  L: {
    strokes: [
      { points: [{ x: 26, y: 10 }, { x: 26, y: 90 }, { x: 78, y: 90 }] },
    ],
    anchors: { topApex: { x: 26, y: 10 }, leftStem: { x: 26, y: 50 }, rightStem: { x: 74, y: 80 }, innerCavity: { x: 56, y: 50 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: false, hasInnerCavity: true, hasCrossbar: false,
  },
  M: {
    strokes: [
      { points: [{ x: 18, y: 90 }, { x: 18, y: 10 }, { x: 50, y: 56 }, { x: 82, y: 10 }, { x: 82, y: 90 }] },
    ],
    anchors: { topApex: { x: 50, y: 12 }, leftStem: { x: 18, y: 50 }, rightStem: { x: 82, y: 50 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: true, hasInnerCavity: false, hasCrossbar: false,
  },
  N: {
    strokes: [
      { points: [{ x: 22, y: 90 }, { x: 22, y: 10 }, { x: 78, y: 90 }, { x: 78, y: 10 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 22, y: 50 }, rightStem: { x: 78, y: 50 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: true, hasInnerCavity: false, hasCrossbar: false,
  },
  Ñ: {
    strokes: [
      { points: [{ x: 22, y: 90 }, { x: 22, y: 22 }, { x: 78, y: 90 }, { x: 78, y: 22 }] },
      { points: [{ x: 30, y: 10 }, { x: 44, y: 6 }, { x: 56, y: 12 }, { x: 70, y: 8 }], smooth: true },
    ],
    anchors: { topApex: { x: 50, y: 8 }, leftStem: { x: 22, y: 56 }, rightStem: { x: 78, y: 56 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: true, hasInnerCavity: false, hasCrossbar: false,
  },
  O: {
    strokes: [
      { points: [{ x: 50, y: 10 }, { x: 78, y: 24 }, { x: 82, y: 50 }, { x: 78, y: 76 }, { x: 50, y: 90 }, { x: 22, y: 76 }, { x: 18, y: 50 }, { x: 22, y: 24 }], closed: true, smooth: true },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 18, y: 50 }, rightStem: { x: 82, y: 50 }, innerCavity: { x: 50, y: 50 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: true, hasCrossbar: false,
  },
  P: {
    strokes: [
      { points: [{ x: 26, y: 10 }, { x: 26, y: 90 }] },
      { points: [{ x: 26, y: 10 }, { x: 64, y: 10 }, { x: 78, y: 24 }, { x: 78, y: 40 }, { x: 64, y: 52 }, { x: 26, y: 52 }], smooth: true },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 26, y: 50 }, rightStem: { x: 78, y: 32 }, innerCavity: { x: 52, y: 31 }, baseFoot: { x: 26, y: 90 } },
    hasLeftStem: true, hasRightStem: false, hasInnerCavity: true, hasCrossbar: true,
  },
  Q: {
    strokes: [
      { points: [{ x: 50, y: 10 }, { x: 78, y: 24 }, { x: 82, y: 50 }, { x: 78, y: 76 }, { x: 50, y: 90 }, { x: 22, y: 76 }, { x: 18, y: 50 }, { x: 22, y: 24 }], closed: true, smooth: true },
      { points: [{ x: 56, y: 68 }, { x: 84, y: 94 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 18, y: 50 }, rightStem: { x: 82, y: 50 }, innerCavity: { x: 50, y: 48 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: true, hasCrossbar: false,
  },
  R: {
    strokes: [
      { points: [{ x: 24, y: 10 }, { x: 24, y: 90 }] },
      { points: [{ x: 24, y: 10 }, { x: 62, y: 10 }, { x: 76, y: 22 }, { x: 76, y: 38 }, { x: 62, y: 50 }, { x: 24, y: 50 }], smooth: true },
      { points: [{ x: 48, y: 50 }, { x: 78, y: 90 }] },
    ],
    anchors: { topApex: { x: 48, y: 10 }, leftStem: { x: 24, y: 50 }, rightStem: { x: 76, y: 30 }, innerCavity: { x: 50, y: 30 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: true, hasRightStem: false, hasInnerCavity: true, hasCrossbar: true,
  },
  S: {
    strokes: [
      { points: [{ x: 74, y: 22 }, { x: 58, y: 10 }, { x: 34, y: 12 }, { x: 24, y: 28 }, { x: 38, y: 46 }, { x: 64, y: 54 }, { x: 78, y: 72 }, { x: 66, y: 88 }, { x: 38, y: 90 }, { x: 22, y: 76 }], smooth: true },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 24, y: 50 }, rightStem: { x: 76, y: 50 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: false, hasCrossbar: false,
  },
  T: {
    strokes: [
      { points: [{ x: 16, y: 10 }, { x: 84, y: 10 }] },
      { points: [{ x: 50, y: 10 }, { x: 50, y: 90 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 50, y: 50 }, rightStem: { x: 50, y: 50 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: false, hasCrossbar: true,
  },
  U: {
    strokes: [
      { points: [{ x: 22, y: 10 }, { x: 22, y: 66 }, { x: 36, y: 88 }, { x: 64, y: 88 }, { x: 78, y: 66 }, { x: 78, y: 10 }], smooth: true },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 22, y: 45 }, rightStem: { x: 78, y: 45 }, innerCavity: { x: 50, y: 48 }, baseFoot: { x: 50, y: 88 } },
    hasLeftStem: true, hasRightStem: true, hasInnerCavity: true, hasCrossbar: false,
  },
  V: {
    strokes: [
      { points: [{ x: 18, y: 10 }, { x: 50, y: 90 }, { x: 82, y: 10 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 30, y: 45 }, rightStem: { x: 70, y: 45 }, innerCavity: { x: 50, y: 40 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: true, hasCrossbar: false,
  },
  W: {
    strokes: [
      { points: [{ x: 12, y: 10 }, { x: 30, y: 90 }, { x: 50, y: 44 }, { x: 70, y: 90 }, { x: 88, y: 10 }] },
    ],
    anchors: { topApex: { x: 50, y: 12 }, leftStem: { x: 20, y: 50 }, rightStem: { x: 80, y: 50 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: false, hasCrossbar: false,
  },
  X: {
    strokes: [
      { points: [{ x: 20, y: 10 }, { x: 80, y: 90 }] },
      { points: [{ x: 80, y: 10 }, { x: 20, y: 90 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 24, y: 50 }, rightStem: { x: 76, y: 50 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: false, hasCrossbar: false,
  },
  Y: {
    strokes: [
      { points: [{ x: 20, y: 10 }, { x: 50, y: 50 }, { x: 80, y: 10 }] },
      { points: [{ x: 50, y: 50 }, { x: 50, y: 90 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 50, y: 70 }, rightStem: { x: 50, y: 70 }, innerCavity: { x: 50, y: 26 }, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: false, hasCrossbar: false,
  },
  Z: {
    strokes: [
      { points: [{ x: 20, y: 10 }, { x: 80, y: 10 }, { x: 20, y: 90 }, { x: 80, y: 90 }] },
    ],
    anchors: { topApex: { x: 50, y: 10 }, leftStem: { x: 24, y: 50 }, rightStem: { x: 76, y: 50 }, innerCavity: null, baseFoot: { x: 50, y: 90 } },
    hasLeftStem: false, hasRightStem: false, hasInnerCavity: false, hasCrossbar: true,
  },
};

export function getLetterSkeleton(rawLetter: string): LetterSkeleton {
  const normalized = rawLetter.trim().toUpperCase().slice(0, 1);
  const found = SKELETON_MAP[normalized] ?? SKELETON_MAP.M;
  return {
    letter: normalized || "M",
    strokes: found.strokes.map((stroke) => ({
      ...stroke,
      points: stroke.points.map((pt) => ({ ...pt })),
    })),
    anchors: {
      topApex: { ...found.anchors.topApex },
      leftStem: { ...found.anchors.leftStem },
      rightStem: { ...found.anchors.rightStem },
      innerCavity: found.anchors.innerCavity ? { ...found.anchors.innerCavity } : null,
      baseFoot: { ...found.anchors.baseFoot },
    },
    hasLeftStem: found.hasLeftStem,
    hasRightStem: found.hasRightStem,
    hasInnerCavity: found.hasInnerCavity,
    hasCrossbar: found.hasCrossbar,
  };
}

function addTerminalCap(
  scope: paper.PaperScope,
  pt: SkPoint,
  dir: SkPoint,
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): paper.PathItem | null {
  const len = Math.hypot(dir.x, dir.y) || 1;
  const nx = dir.x / len;
  const ny = dir.y / len;
  const px = -ny;
  const py = nx;
  const half = strokeWidth / 2;

  if (terminalStyle === "clean_bar") {
    return null;
  }

  if (terminalStyle === "teardrop") {
    const circle = new scope.Path.Circle({
      center: [pt.x + nx * half * 0.35, pt.y + ny * half * 0.35],
      radius: half * 1.18,
      insert: false,
    });
    return circle;
  }

  if (terminalStyle === "flared_serif") {
    const flare = half * 1.65;
    const depth = half * 0.9;
    const p1 = new scope.Point(pt.x + px * flare, pt.y + py * flare);
    const p2 = new scope.Point(pt.x - px * flare, pt.y - py * flare);
    const p3 = new scope.Point(pt.x - nx * depth - px * half, pt.y - ny * depth - py * half);
    const p4 = new scope.Point(pt.x - nx * depth + px * half, pt.y - ny * depth + py * half);
    return new scope.Path({ segments: [p1, p2, p3, p4], closed: true, insert: false });
  }

  if (terminalStyle === "chisel_bevel") {
    const tip = new scope.Point(pt.x + nx * half * 1.1, pt.y + ny * half * 1.1);
    const left = new scope.Point(pt.x - nx * half * 0.3 + px * half * 1.25, pt.y - ny * half * 0.3 + py * half * 1.25);
    const right = new scope.Point(pt.x - nx * half * 0.3 - px * half * 1.25, pt.y - ny * half * 0.3 - py * half * 1.25);
    return new scope.Path({ segments: [left, tip, right], closed: true, insert: false });
  }

  const spurLen = half * 1.45;
  const spurBase = half * 1.35;
  const p1 = new scope.Point(pt.x + px * spurBase, pt.y + py * spurBase);
  const p2 = new scope.Point(pt.x + nx * spurLen, pt.y + ny * spurLen);
  const p3 = new scope.Point(pt.x - px * spurBase, pt.y - py * spurBase);
  const p4 = new scope.Point(pt.x - nx * half * 0.5, pt.y - ny * half * 0.5);
  return new scope.Path({ segments: [p1, p2, p3, p4], closed: true, insert: false });
}

export function expandStroke(
  scope: paper.PaperScope,
  stroke: SkStroke,
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): paper.PathItem {
  const centerline = new scope.Path({
    segments: stroke.points.map((pt) => new scope.Point(pt.x, pt.y)),
    closed: Boolean(stroke.closed),
    insert: false,
  });

  if (stroke.smooth) {
    centerline.smooth({ type: "catmull-rom", factor: 0.45 });
  }

  const half = Math.max(3, strokeWidth / 2);
  let body = offsetStroke(centerline, half, {
    join: "round",
    cap: terminalStyle === "clean_bar" ? "butt" : "round",
    limit: 6,
    insert: false,
    algorithm: "auto",
  }) as unknown as paper.PathItem;

  if (!stroke.closed && stroke.points.length >= 2) {
    const startPt = stroke.points[0];
    const nextPt = stroke.points[1];
    const startCap = addTerminalCap(
      scope,
      startPt,
      { x: startPt.x - nextPt.x, y: startPt.y - nextPt.y },
      strokeWidth,
      terminalStyle,
    );
    if (startCap) {
      const united = body.unite(startCap, { insert: false });
      body.remove();
      startCap.remove();
      body = united;
    }

    const endPt = stroke.points[stroke.points.length - 1];
    const prevPt = stroke.points[stroke.points.length - 2];
    const endCap = addTerminalCap(
      scope,
      endPt,
      { x: endPt.x - prevPt.x, y: endPt.y - prevPt.y },
      strokeWidth,
      terminalStyle,
    );
    if (endCap) {
      const united = body.unite(endCap, { insert: false });
      body.remove();
      endCap.remove();
      body = united;
    }
  }

  centerline.remove();
  return body;
}

export function expandSkeleton(
  scope: paper.PaperScope,
  skeleton: LetterSkeleton,
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): paper.PathItem {
  let merged: paper.PathItem | null = null;
  for (const stroke of skeleton.strokes) {
    const expanded = expandStroke(scope, stroke, strokeWidth, terminalStyle);
    if (!merged) {
      merged = expanded;
    } else {
      const united: paper.PathItem = merged.unite(expanded, { insert: false });
      merged.remove();
      expanded.remove();
      merged = united;
    }
  }
  return merged ?? new scope.Path.Rectangle({ point: [20, 20], size: [60, 60], insert: false });
}

export function fallbackAnchors(): LetterAnchors {
  return {
    topApex: { ...DEFAULT_ANCHORS.topApex },
    leftStem: { ...DEFAULT_ANCHORS.leftStem },
    rightStem: { ...DEFAULT_ANCHORS.rightStem },
    innerCavity: null,
    baseFoot: { ...DEFAULT_ANCHORS.baseFoot },
  };
}
