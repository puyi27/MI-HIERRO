import paper from "paper";
import { offsetStroke } from "paperjs-offset";
import type { ArchitectureKey, TerminalStyleKey } from "@/types/forge";
import {
  expandSkeleton,
  getLetterSkeleton,
  type LetterAnchors,
  type LetterSkeleton,
} from "@/lib/forge-engine/skeletons";

export interface ArchitectureResult {
  item: paper.PathItem;
  anchors: LetterAnchors;
  architecture: ArchitectureKey;
}

function safeUnite(a: paper.PathItem, b: paper.PathItem): paper.PathItem {
  const united = a.unite(b, { insert: false });
  a.remove();
  b.remove();
  return united;
}

function safeSubtract(target: paper.PathItem, cutter: paper.PathItem): paper.PathItem {
  const result = target.subtract(cutter, { insert: false });
  target.remove();
  return result;
}

function buildLetterItem(
  scope: paper.PaperScope,
  letter: string,
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): { item: paper.PathItem; skeleton: LetterSkeleton } {
  const skeleton = getLetterSkeleton(letter);
  const item = expandSkeleton(scope, skeleton, strokeWidth, terminalStyle);
  return { item, skeleton };
}

function composeSharedStem(
  scope: paper.PaperScope,
  letters: string[],
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): ArchitectureResult {
  const first = buildLetterItem(scope, letters[0], strokeWidth, terminalStyle);
  if (letters.length === 1) {
    const lance = new scope.Path.Rectangle({
      point: [first.skeleton.anchors.topApex.x - strokeWidth / 2, 4],
      size: [strokeWidth, 92],
      insert: false,
    });
    const combined = safeUnite(first.item, lance);
    return { item: combined, anchors: first.skeleton.anchors, architecture: "shared_stem" };
  }

  const second = buildLetterItem(scope, letters[1], strokeWidth, terminalStyle);
  const overlap = Math.max(strokeWidth * 1.1, 14);
  const shiftX = first.item.bounds.right - second.item.bounds.left - overlap;
  second.item.translate(new scope.Point(shiftX, 0));

  let combined = safeUnite(first.item, second.item);

  if (letters.length >= 3) {
    const third = buildLetterItem(scope, letters[2], strokeWidth, terminalStyle);
    const shift3 = combined.bounds.right - third.item.bounds.left - overlap * 0.75;
    third.item.translate(new scope.Point(shift3, 0));
    combined = safeUnite(combined, third.item);
  }

  const b = combined.bounds;
  return {
    item: combined,
    anchors: {
      topApex: { x: (b.left + b.right) / 2, y: b.top },
      leftStem: { x: b.left, y: (b.top + b.bottom) / 2 },
      rightStem: { x: b.right, y: (b.top + b.bottom) / 2 },
      innerCavity: first.skeleton.anchors.innerCavity,
      baseFoot: { x: (b.left + b.right) / 2, y: b.bottom },
    },
    architecture: "shared_stem",
  };
}

function composeMirroredCrest(
  scope: paper.PaperScope,
  letters: string[],
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): ArchitectureResult {
  const primary = buildLetterItem(scope, letters[0], strokeWidth, terminalStyle);
  const partnerChar = letters.length >= 2 ? letters[1] : letters[0];
  const secondary = buildLetterItem(scope, partnerChar, strokeWidth, terminalStyle);

  const mirroredLeft = primary.item.clone({ insert: false }) as paper.PathItem;
  mirroredLeft.scale(-1, 1, new scope.Point(50, 50));
  primary.item.remove();

  const spineX = 50;
  mirroredLeft.position = new scope.Point(spineX - mirroredLeft.bounds.width * 0.44, 50);
  secondary.item.position = new scope.Point(spineX + secondary.item.bounds.width * 0.44, 50);

  const spine = new scope.Path.Rectangle({
    point: [spineX - strokeWidth / 2, 10],
    size: [strokeWidth, 80],
    insert: false,
  });

  let combined = safeUnite(mirroredLeft, secondary.item);
  combined = safeUnite(combined, spine);

  if (letters.length >= 3) {
    const third = buildLetterItem(scope, letters[2], strokeWidth * 0.85, terminalStyle);
    third.item.scale(0.48, new scope.Point(50, 50));
    third.item.position = new scope.Point(spineX, combined.bounds.bottom + 14);
    combined = safeUnite(combined, third.item);
  }

  const b = combined.bounds;
  return {
    item: combined,
    anchors: {
      topApex: { x: spineX, y: b.top },
      leftStem: { x: b.left, y: (b.top + b.bottom) / 2 },
      rightStem: { x: b.right, y: (b.top + b.bottom) / 2 },
      innerCavity: null,
      baseFoot: { x: spineX, y: b.bottom },
    },
    architecture: "mirrored_crest",
  };
}

function composeNestedCavity(
  scope: paper.PaperScope,
  letters: string[],
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): ArchitectureResult {
  const outer = buildLetterItem(scope, letters[0], strokeWidth, terminalStyle);
  outer.item.scale(1.22, new scope.Point(50, 50));

  let combined = outer.item;
  const cavity = outer.skeleton.anchors.innerCavity ?? { x: 50, y: 50 };

  if (letters.length >= 2) {
    const inner = buildLetterItem(scope, letters[1], strokeWidth * 0.9, terminalStyle);
    inner.item.scale(0.46, new scope.Point(50, 50));
    inner.item.position = new scope.Point(
      50 + (cavity.x - 50) * 1.15,
      50 + (cavity.y - 50) * 1.15,
    );
    combined = safeUnite(combined, inner.item);
  }

  if (letters.length >= 3) {
    const third = buildLetterItem(scope, letters[2], strokeWidth * 0.85, terminalStyle);
    third.item.scale(0.42, new scope.Point(50, 50));
    third.item.position = new scope.Point(combined.bounds.center.x, combined.bounds.bottom + 16);
    combined = safeUnite(combined, third.item);
  }

  const b = combined.bounds;
  return {
    item: combined,
    anchors: {
      topApex: { x: (b.left + b.right) / 2, y: b.top },
      leftStem: { x: b.left, y: (b.top + b.bottom) / 2 },
      rightStem: { x: b.right, y: (b.top + b.bottom) / 2 },
      innerCavity: cavity,
      baseFoot: { x: (b.left + b.right) / 2, y: b.bottom },
    },
    architecture: "nested_cavity",
  };
}

function composeInterlockKnockout(
  scope: paper.PaperScope,
  letters: string[],
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): ArchitectureResult {
  const first = buildLetterItem(scope, letters[0], strokeWidth, terminalStyle);
  if (letters.length === 1) {
    const bar = new scope.Path.Rectangle({
      point: [14, 46],
      size: [72, Math.max(6, strokeWidth * 0.85)],
      insert: false,
    });
    const combined = safeUnite(first.item, bar);
    return { item: combined, anchors: first.skeleton.anchors, architecture: "interlock_knockout" };
  }

  const second = buildLetterItem(scope, letters[1], strokeWidth, terminalStyle);
  second.item.translate(new scope.Point(24, 14));

  const haloWidth = Math.max(3.5, strokeWidth * 0.45);
  const halo = offsetStroke(second.item as paper.Path, haloWidth, {
    join: "round",
    cap: "round",
    insert: false,
    algorithm: "auto",
  }) as unknown as paper.PathItem;

  const carvedFirst = safeSubtract(first.item, halo);
  halo.remove();

  let combined = safeUnite(carvedFirst, second.item);

  if (letters.length >= 3) {
    const third = buildLetterItem(scope, letters[2], strokeWidth * 0.9, terminalStyle);
    third.item.scale(0.65, new scope.Point(50, 50));
    third.item.position = new scope.Point(combined.bounds.right + 10, combined.bounds.center.y);
    combined = safeUnite(combined, third.item);
  }

  const b = combined.bounds;
  return {
    item: combined,
    anchors: {
      topApex: { x: (b.left + b.right) / 2, y: b.top },
      leftStem: { x: b.left, y: (b.top + b.bottom) / 2 },
      rightStem: { x: b.right, y: (b.top + b.bottom) / 2 },
      innerCavity: null,
      baseFoot: { x: (b.left + b.right) / 2, y: b.bottom },
    },
    architecture: "interlock_knockout",
  };
}

function composeIntegratedArch(
  scope: paper.PaperScope,
  letters: string[],
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): ArchitectureResult {
  let combined: paper.PathItem | null = null;
  let offsetX = 0;

  for (let i = 0; i < letters.length; i += 1) {
    const { item } = buildLetterItem(scope, letters[i], strokeWidth, terminalStyle);
    item.translate(new scope.Point(offsetX, 0));
    offsetX += item.bounds.width + Math.max(8, strokeWidth * 0.9);
    combined = combined ? safeUnite(combined, item) : item;
  }

  const glyphs = combined!;
  const b = glyphs.bounds;
  const cx = (b.left + b.right) / 2;
  const archSpan = Math.max(b.width * 0.62, 54);
  const archTopY = b.top - Math.max(26, b.height * 0.32);

  const archPath = new scope.Path.Arc({
    from: [cx - archSpan, b.top + strokeWidth * 0.4],
    through: [cx, archTopY],
    to: [cx + archSpan, b.top + strokeWidth * 0.4],
    insert: false,
  });

  const archPletina = offsetStroke(archPath, strokeWidth / 2, {
    join: "round",
    cap: "round",
    insert: false,
    algorithm: "auto",
  }) as unknown as paper.PathItem;
  archPath.remove();

  const finalItem = safeUnite(glyphs, archPletina);
  const fb = finalItem.bounds;

  return {
    item: finalItem,
    anchors: {
      topApex: { x: cx, y: fb.top },
      leftStem: { x: fb.left, y: (fb.top + fb.bottom) / 2 },
      rightStem: { x: fb.right, y: (fb.top + fb.bottom) / 2 },
      innerCavity: null,
      baseFoot: { x: cx, y: fb.bottom },
    },
    architecture: "integrated_arch",
  };
}

function composeCauldronHandle(
  scope: paper.PaperScope,
  letters: string[],
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): ArchitectureResult {
  let combined: paper.PathItem | null = null;
  let offsetX = 0;

  for (let i = 0; i < letters.length; i += 1) {
    const { item } = buildLetterItem(scope, letters[i], strokeWidth, terminalStyle);
    item.translate(new scope.Point(offsetX, 0));
    offsetX += item.bounds.width + Math.max(6, strokeWidth * 0.65);
    combined = combined ? safeUnite(combined, item) : item;
  }

  const glyphs = combined!;
  const b = glyphs.bounds;
  const midY = (b.top + b.bottom) / 2;
  const handleR = Math.min(30, Math.max(20, b.height * 0.3));
  const attachX = b.right - strokeWidth * 0.35;

  const handleArc = new scope.Path.Arc({
    from: [attachX, midY - handleR],
    through: [attachX + handleR * 1.25, midY],
    to: [attachX, midY + handleR],
    insert: false,
  });

  const handlePletina = offsetStroke(handleArc, strokeWidth / 2, {
    join: "round",
    cap: "round",
    insert: false,
    algorithm: "auto",
  }) as unknown as paper.PathItem;
  handleArc.remove();

  const finalItem = safeUnite(glyphs, handlePletina);
  const fb = finalItem.bounds;

  return {
    item: finalItem,
    anchors: {
      topApex: { x: (b.left + b.right) / 2, y: fb.top },
      leftStem: { x: fb.left, y: (fb.top + fb.bottom) / 2 },
      rightStem: { x: fb.right, y: (fb.top + fb.bottom) / 2 },
      innerCavity: null,
      baseFoot: { x: (fb.left + fb.right) / 2, y: fb.bottom },
    },
    architecture: "cauldron_handle",
  };
}

export function composeArchitecture(
  scope: paper.PaperScope,
  architecture: ArchitectureKey,
  letters: string[],
  strokeWidth: number,
  terminalStyle: TerminalStyleKey,
): ArchitectureResult {
  const normalized = letters.length > 0 ? letters.slice(0, 3) : ["M"];
  switch (architecture) {
    case "shared_stem":
      return composeSharedStem(scope, normalized, strokeWidth, terminalStyle);
    case "mirrored_crest":
      return composeMirroredCrest(scope, normalized, strokeWidth, terminalStyle);
    case "nested_cavity":
      return composeNestedCavity(scope, normalized, strokeWidth, terminalStyle);
    case "interlock_knockout":
      return composeInterlockKnockout(scope, normalized, strokeWidth, terminalStyle);
    case "integrated_arch":
      return composeIntegratedArch(scope, normalized, strokeWidth, terminalStyle);
    case "cauldron_handle":
      return composeCauldronHandle(scope, normalized, strokeWidth, terminalStyle);
  }
}
