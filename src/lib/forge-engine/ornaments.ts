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
