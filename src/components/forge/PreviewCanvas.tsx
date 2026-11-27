"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ForgeTexture } from "@/components/forge/types";

interface PreviewCanvasProps {
  previewUrl: string;
  texture: ForgeTexture;
  alt: string;
}

const SIZE = 900;

interface LightState {
  x: number;
  y: number;
  active: boolean;
}

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function drawLeatherGrain(
  context: CanvasRenderingContext2D,
  seed: number,
  strokeColor: string,
  count = 130,
): void {
  const random = seededRandom(seed);
  context.strokeStyle = strokeColor;
  for (let index = 0; index < count; index += 1) {
    const x = random() * SIZE;
    const y = random() * SIZE;
    context.lineWidth = random() * 1.4 + 0.4;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(x + 28, y + 10, x + 56, y - 12, x + 90, y + 6);
    context.stroke();
  }
}

function drawWovenTwill(
  context: CanvasRenderingContext2D,
  lineColor: string,
  step = 9,
): void {
  context.strokeStyle = lineColor;
  context.lineWidth = 1;
  for (let pos = 0; pos < SIZE; pos += step) {
    context.beginPath();
    context.moveTo(pos, 0);
    context.lineTo(pos, SIZE);
    context.stroke();
    context.beginPath();
    context.moveTo(0, pos);
    context.lineTo(SIZE, pos);
    context.stroke();
  }
}

function drawBase(context: CanvasRenderingContext2D, texture: ForgeTexture): void {
  context.clearRect(0, 0, SIZE, SIZE);

  if (texture === "capote") {
    const grana = context.createRadialGradient(SIZE * 0.5, SIZE * 0.42, 30, SIZE * 0.5, SIZE * 0.5, SIZE * 0.8);
    grana.addColorStop(0, "#751722");
    grana.addColorStop(0.58, "#5A1018");
    grana.addColorStop(1, "#32070C");
    context.fillStyle = grana;
    context.fillRect(0, 0, SIZE, SIZE);

    drawWovenTwill(context, "rgba(255, 226, 170, 0.055)", 8);

    context.strokeStyle = "rgba(232, 186, 84, 0.48)";
    context.lineWidth = 3;
    context.strokeRect(56, 56, SIZE - 112, SIZE - 112);
    context.strokeStyle = "rgba(232, 186, 84, 0.25)";
    context.lineWidth = 1.5;
    context.strokeRect(70, 70, SIZE - 140, SIZE - 140);
    return;
  }

  if (texture === "esporton") {
    const tan = context.createRadialGradient(SIZE * 0.48, SIZE * 0.4, 50, SIZE * 0.5, SIZE * 0.5, SIZE * 0.85);
    tan.addColorStop(0, "#B47D4E");
    tan.addColorStop(0.55, "#8E5B32");
    tan.addColorStop(1, "#5E381B");
    context.fillStyle = tan;
    context.fillRect(0, 0, SIZE, SIZE);

    drawLeatherGrain(context, 41, "rgba(44, 22, 8, 0.11)", 150);

    context.setLineDash([12, 9]);
    context.strokeStyle = "rgba(247, 232, 200, 0.42)";
    context.lineWidth = 2.2;
    context.strokeRect(64, 64, SIZE - 128, SIZE - 128);
    context.setLineDash([]);
    return;
  }

  if (texture === "fundon") {
    const oxblood = context.createRadialGradient(SIZE * 0.5, SIZE * 0.44, 40, SIZE * 0.5, SIZE * 0.5, SIZE * 0.82);
    oxblood.addColorStop(0, "#4F1D1F");
    oxblood.addColorStop(0.58, "#351113");
    oxblood.addColorStop(1, "#1B0708");
    context.fillStyle = oxblood;
    context.fillRect(0, 0, SIZE, SIZE);

    drawLeatherGrain(context, 53, "rgba(245, 210, 150, 0.065)", 120);

    context.strokeStyle = "rgba(223, 176, 84, 0.42)";
    context.lineWidth = 2;
    context.strokeRect(68, 68, SIZE - 136, SIZE - 136);
    return;
  }

  if (texture === "maleta") {
    const espresso = context.createRadialGradient(SIZE * 0.5, SIZE * 0.42, 40, SIZE * 0.5, SIZE * 0.5, SIZE * 0.85);
    espresso.addColorStop(0, "#382419");
    espresso.addColorStop(0.6, "#23150E");
    espresso.addColorStop(1, "#110906");
    context.fillStyle = espresso;
    context.fillRect(0, 0, SIZE, SIZE);

    drawLeatherGrain(context, 67, "rgba(216, 169, 78, 0.075)", 110);

    context.fillStyle = "rgba(18, 10, 6, 0.55)";
    context.fillRect(92, 0, 38, SIZE);
    context.fillRect(SIZE - 130, 0, 38, SIZE);
    context.strokeStyle = "rgba(216, 169, 78, 0.45)";
    context.lineWidth = 1.5;
    context.strokeRect(92, 0, 38, SIZE);
    context.strokeRect(SIZE - 130, 0, 38, SIZE);
    return;
  }

  if (texture === "avatar") {
    context.fillStyle = "#F7F3EA";
    context.fillRect(0, 0, SIZE, SIZE);

    const random = seededRandom(89);
    context.fillStyle = "rgba(78, 71, 63, 0.03)";
    for (let index = 0; index < 2200; index += 1) {
      context.fillRect(random() * SIZE, random() * SIZE, 1.4, 1.4);
    }

    context.strokeStyle = "#D6C9B4";
    context.lineWidth = 2;
    context.strokeRect(48, 48, SIZE - 96, SIZE - 96);
    context.strokeStyle = "#D6C9B4";
    context.lineWidth = 1;
    context.strokeRect(58, 58, SIZE - 116, SIZE - 116);

    context.beginPath();
    context.arc(SIZE / 2, SIZE / 2, SIZE * 0.36, 0, Math.PI * 2);
    context.strokeStyle = "rgba(184, 131, 46, 0.35)";
    context.lineWidth = 1.5;
    context.stroke();
    return;
  }

  if (texture === "fragua" || texture === "hierro") {
    const gradient = context.createRadialGradient(SIZE * 0.5, SIZE * 0.42, SIZE * 0.05, SIZE * 0.5, SIZE * 0.5, SIZE * 0.78);
    gradient.addColorStop(0, texture === "fragua" ? "#32251E" : "#2C2825");
    gradient.addColorStop(0.55, "#191614");
    gradient.addColorStop(1, "#080706");
    context.fillStyle = gradient;
    context.fillRect(0, 0, SIZE, SIZE);

    if (texture === "fragua") {
      const ember = context.createRadialGradient(SIZE * 0.5, SIZE * 0.52, SIZE * 0.1, SIZE * 0.5, SIZE * 0.5, SIZE * 0.65);
      ember.addColorStop(0, "rgba(232, 120, 42, 0.16)");
      ember.addColorStop(0.6, "rgba(180, 68, 22, 0.06)");
      ember.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = ember;
      context.fillRect(0, 0, SIZE, SIZE);
    }

    const random = seededRandom(7);
    context.fillStyle = "rgba(255, 255, 255, 0.035)";
    for (let index = 0; index < 2600; index += 1) {
      const radius = random() * 1.6 + 0.3;
      context.beginPath();
      context.arc(random() * SIZE, random() * SIZE, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.strokeStyle = texture === "fragua" ? "rgba(232, 147, 60, 0.08)" : "rgba(200, 155, 99, 0.05)";
    context.lineWidth = 2;
    for (let index = 0; index < 26; index += 1) {
      const y = random() * SIZE;
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(SIZE * 0.3, y - 18, SIZE * 0.65, y + 16, SIZE, y - 4);
      context.stroke();
    }
    return;
  }

  if (texture === "montura") {
    const saddle = context.createRadialGradient(SIZE * 0.48, SIZE * 0.38, 45, SIZE * 0.5, SIZE * 0.52, SIZE * 0.85);
    saddle.addColorStop(0, "#BC834E");
    saddle.addColorStop(0.55, "#925E30");
    saddle.addColorStop(1, "#623B1A");
    context.fillStyle = saddle;
    context.fillRect(0, 0, SIZE, SIZE);

    drawLeatherGrain(context, 101, "rgba(42, 20, 7, 0.12)", 140);

    context.strokeStyle = "rgba(52, 26, 10, 0.45)";
    context.lineWidth = 3;
    context.strokeRect(58, 58, SIZE - 116, SIZE - 116);
    context.setLineDash([10, 8]);
    context.strokeStyle = "rgba(247, 232, 200, 0.36)";
    context.lineWidth = 1.6;
    context.strokeRect(74, 74, SIZE - 148, SIZE - 148);
    context.setLineDash([]);
    return;
  }

  if (texture === "cancela") {
    const limestone = context.createRadialGradient(SIZE * 0.5, SIZE * 0.45, 50, SIZE * 0.5, SIZE * 0.5, SIZE * 0.82);
    limestone.addColorStop(0, "#F5EFE2");
    limestone.addColorStop(0.6, "#EAE0CC");
    limestone.addColorStop(1, "#D8CBB3");
    context.fillStyle = limestone;
    context.fillRect(0, 0, SIZE, SIZE);

    const random = seededRandom(113);
    context.fillStyle = "rgba(78, 71, 63, 0.04)";
    for (let index = 0; index < 2400; index += 1) {
      context.fillRect(random() * SIZE, random() * SIZE, 1.5, 1.5);
    }

    context.fillStyle = "#1F1C19";
    for (const x of [72, 114, SIZE - 126, SIZE - 84]) {
      context.fillRect(x, 48, 12, SIZE - 96);
    }
    context.fillRect(54, 72, SIZE - 108, 10);
    context.fillRect(54, SIZE - 82, SIZE - 108, 10);

    context.beginPath();
    context.arc(SIZE / 2, SIZE / 2, SIZE * 0.34, 0, Math.PI * 2);
    context.strokeStyle = "#1F1C19";
    context.lineWidth = 6;
    context.stroke();
    return;
  }

  if (texture === "polo") {
    context.fillStyle = "#F6F2E8";
    context.fillRect(0, 0, SIZE, SIZE);
    drawWovenTwill(context, "rgba(78, 71, 63, 0.06)", 7);

    context.fillStyle = "#6B141E";
    context.fillRect(0, 44, SIZE, 16);
    context.fillStyle = "#B8832E";
    context.fillRect(0, 66, SIZE, 5);

    context.setLineDash([5, 6]);
    context.strokeStyle = "rgba(107, 20, 30, 0.25)";
    context.lineWidth = 1.5;
    context.strokeRect(110, 120, SIZE - 220, SIZE - 220);
    context.setLineDash([]);
    return;
  }

  if (texture === "bordado") {
    context.fillStyle = "#0E1318";
    context.fillRect(0, 0, SIZE, SIZE);
    drawWovenTwill(context, "rgba(220, 226, 232, 0.055)", 9);
    const glow = context.createRadialGradient(SIZE * 0.5, SIZE * 0.4, 20, SIZE * 0.5, SIZE * 0.5, SIZE * 0.7);
    glow.addColorStop(0, "rgba(143, 166, 184, 0.16)");
    glow.addColorStop(1, "rgba(4, 6, 8, 0.55)");
    context.fillStyle = glow;
    context.fillRect(0, 0, SIZE, SIZE);
    context.setLineDash([7, 9]);
    context.strokeStyle = "rgba(200, 155, 99, 0.5)";
    context.lineWidth = 2;
    context.strokeRect(76, 76, SIZE - 152, SIZE - 152);
    context.setLineDash([]);
    return;
  }

  const leather = context.createRadialGradient(SIZE * 0.45, SIZE * 0.35, 40, SIZE * 0.5, SIZE * 0.6, SIZE * 0.85);
  leather.addColorStop(0, "#8B5832");
  leather.addColorStop(0.55, "#683F20");
  leather.addColorStop(1, "#442812");
  context.fillStyle = leather;
  context.fillRect(0, 0, SIZE, SIZE);
  drawLeatherGrain(context, 19, "rgba(38, 18, 6, 0.12)", 120);
}

function drawSpecular(context: CanvasRenderingContext2D, offset: number, size: number, light: LightState): void {
  context.save();
  context.beginPath();
  context.rect(offset, offset, size, size);
  context.clip();
  context.globalCompositeOperation = "screen";

  const centerX = offset + light.x * size;
  const centerY = offset + light.y * size;
  const gradient = context.createRadialGradient(centerX, centerY, size * 0.01, centerX, centerY, size * (light.active ? 0.64 : 0.78));
  gradient.addColorStop(0, light.active ? "rgba(242, 233, 218, 0.22)" : "rgba(242, 233, 218, 0.08)");
  gradient.addColorStop(0.28, "rgba(200, 155, 99, 0.12)");
  gradient.addColorStop(0.65, "rgba(200, 155, 99, 0.03)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = gradient;
  context.fillRect(offset, offset, size, size);
  context.restore();
}

function drawStitchRelief(context: CanvasRenderingContext2D, offset: number, size: number, light: LightState): void {
  context.save();
  context.beginPath();
  context.rect(offset, offset, size, size);
  context.clip();
  context.globalCompositeOperation = "soft-light";

  const step = 10;
  for (let position = 0; position < size; position += step) {
    const distance = Math.abs(position / size - light.y);
    const alpha = Math.max(0.02, 0.14 - distance * 0.1);
    context.strokeStyle = `rgba(242, 233, 218, ${alpha.toFixed(3)})`;
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(offset + position, offset);
    context.lineTo(offset + position, offset + size);
    context.stroke();
  }
  context.restore();
}

function drawBurnRim(context: CanvasRenderingContext2D, offset: number, size: number, light: LightState): void {
  context.save();
  context.beginPath();
  context.rect(offset, offset, size, size);
  context.clip();
  const centerX = offset + light.x * size;
  const centerY = offset + light.y * size;
  const glow = context.createRadialGradient(centerX, centerY, size * 0.02, centerX, centerY, size * 0.65);
  glow.addColorStop(0, light.active ? "rgba(255, 224, 178, 0.16)" : "rgba(255, 224, 178, 0.05)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.globalCompositeOperation = "screen";
  context.fillStyle = glow;
  context.fillRect(offset, offset, size, size);
  context.restore();
}

export function PreviewCanvas({ previewUrl, texture, alt }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scheduleRef = useRef<() => void>(() => {});
  const lightRef = useRef<LightState>({ x: 0.5, y: 0.38, active: false });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.decoding = "async";
    let disposed = false;
    let frame: number | null = null;

    const paint = () => {
      frame = null;
      if (disposed) return;
      const light = lightRef.current;
      drawBase(context, texture);
      if (!image.complete || image.naturalWidth === 0) return;

      const isEmbroidery = texture === "bordado" || texture === "capote" || texture === "polo";
      const isSeal = texture === "avatar" || texture === "cancela";
      const size = SIZE * (isEmbroidery ? 0.54 : isSeal ? 0.52 : 0.6);
      const offset = (SIZE - size) / 2;

      context.save();
      if (texture === "avatar" || texture === "cancela" || texture === "polo") {
        context.shadowColor = "rgba(22, 20, 18, 0.2)";
        context.shadowBlur = 10;
        context.shadowOffsetY = 3;
        context.drawImage(image, offset, offset, size, size);
      } else if (isEmbroidery) {
        context.shadowColor = "rgba(0, 0, 0, 0.65)";
        context.shadowBlur = 16;
        context.shadowOffsetY = 5;
        context.drawImage(image, offset, offset, size, size);
      } else if (texture === "hierro" || texture === "fragua" || texture === "fundon" || texture === "maleta") {
        context.shadowColor = "rgba(0, 0, 0, 0.85)";
        context.shadowBlur = 28;
        context.shadowOffsetY = 10;
        context.drawImage(image, offset, offset, size, size);
      } else {
        context.shadowColor = "rgba(225, 165, 95, 0.38)";
        context.shadowBlur = 12;
        context.shadowOffsetY = 2;
        context.drawImage(image, offset, offset, size, size);
      }
      context.restore();

      if (texture === "hierro" || texture === "fragua" || texture === "fundon" || texture === "maleta") {
        drawSpecular(context, offset, size, light);
      } else if (isEmbroidery) {
        drawStitchRelief(context, offset, size, light);
      } else if (texture === "esporton" || texture === "montura" || texture === "cuero") {
        drawBurnRim(context, offset, size, light);
      }
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(paint);
    };
    scheduleRef.current = schedule;

    const handleLoad = () => {
      setFailed(false);
      schedule();
    };
    const handleError = () => setFailed(true);

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    image.src = previewUrl;
    schedule();

    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      scheduleRef.current = () => {};
    };
  }, [previewUrl, texture]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    lightRef.current = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
      active: true,
    };
    scheduleRef.current();
  }, []);

  const handlePointerLeave = useCallback(() => {
    lightRef.current = { x: 0.5, y: 0.38, active: false };
    scheduleRef.current();
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={alt}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="forge-canvas"
      />
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-forge-void/85 p-6 text-center text-sm text-forge-paper">
          No hemos podido cargar la vista previa. Vuelve a forjar la propuesta.
        </div>
      ) : null}
    </div>
  );
}
