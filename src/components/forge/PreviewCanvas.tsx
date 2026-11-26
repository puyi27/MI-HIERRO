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

function drawBase(context: CanvasRenderingContext2D, texture: ForgeTexture): void {
  context.clearRect(0, 0, SIZE, SIZE);

  if (texture === "hierro") {
    const gradient = context.createRadialGradient(SIZE * 0.5, SIZE * 0.42, SIZE * 0.05, SIZE * 0.5, SIZE * 0.5, SIZE * 0.78);
    gradient.addColorStop(0, "#2C2825");
    gradient.addColorStop(0.55, "#191614");
    gradient.addColorStop(1, "#080706");
    context.fillStyle = gradient;
    context.fillRect(0, 0, SIZE, SIZE);

    const random = seededRandom(7);
    context.fillStyle = "rgba(255, 255, 255, 0.035)";
    for (let index = 0; index < 2600; index += 1) {
      const radius = random() * 1.6 + 0.3;
      context.beginPath();
      context.arc(random() * SIZE, random() * SIZE, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.strokeStyle = "rgba(200, 155, 99, 0.05)";
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

  if (texture === "bordado") {
    context.fillStyle = "#0E1318";
    context.fillRect(0, 0, SIZE, SIZE);
    context.strokeStyle = "rgba(220, 226, 232, 0.055)";
    context.lineWidth = 1;
    for (let position = 0; position < SIZE; position += 9) {
      context.beginPath();
      context.moveTo(position, 0);
      context.lineTo(position, SIZE);
      context.stroke();
      context.beginPath();
      context.moveTo(0, position);
      context.lineTo(SIZE, position);
      context.stroke();
    }
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
  leather.addColorStop(0, "#3A2619");
  leather.addColorStop(0.5, "#241610");
  leather.addColorStop(1, "#120B07");
  context.fillStyle = leather;
  context.fillRect(0, 0, SIZE, SIZE);

  const random = seededRandom(19);
  context.strokeStyle = "rgba(200, 155, 99, 0.09)";
  for (let index = 0; index < 120; index += 1) {
    const x = random() * SIZE;
    const y = random() * SIZE;
    context.lineWidth = random() * 1.6 + 0.4;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(x + 30, y + 12, x + 60, y - 14, x + 96, y + 6);
    context.stroke();
  }
}

function drawSpecular(context: CanvasRenderingContext2D, offset: number, size: number, light: LightState): void {
  context.save();
  context.beginPath();
  context.rect(offset, offset, size, size);
  context.clip();
  context.globalCompositeOperation = "screen";

  const centerX = offset + light.x * size;
  const centerY = offset + light.y * size;
  const gradient = context.createRadialGradient(centerX, centerY, size * 0.01, centerX, centerY, size * (light.active ? 0.66 : 0.82));
  gradient.addColorStop(0, light.active ? "rgba(242, 233, 218, 0.26)" : "rgba(242, 233, 218, 0.09)");
  gradient.addColorStop(0.26, "rgba(200, 155, 99, 0.14)");
  gradient.addColorStop(0.62, "rgba(200, 155, 99, 0.035)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = gradient;
  context.fillRect(offset, offset, size, size);

  const shift = (light.x - 0.5) * 0.4;
  const sheen = context.createLinearGradient(offset, offset, offset + size, offset + size);
  sheen.addColorStop(Math.max(0, 0.3 + shift), "rgba(242, 233, 218, 0)");
  sheen.addColorStop(Math.max(0, 0.42 + shift), "rgba(242, 233, 218, 0.08)");
  sheen.addColorStop(Math.min(1, 0.54 + shift), "rgba(242, 233, 218, 0)");
  context.fillStyle = sheen;
  context.fillRect(offset, offset, size, size);

  const hammer = context.createLinearGradient(offset, offset + size, offset + size, offset);
  hammer.addColorStop(0, "rgba(0, 0, 0, 0.16)");
  hammer.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  hammer.addColorStop(1, "rgba(242, 233, 218, 0.05)");
  context.globalCompositeOperation = "overlay";
  context.fillStyle = hammer;
  context.fillRect(offset, offset, size, size);
  context.restore();
}

function drawStitchRelief(context: CanvasRenderingContext2D, offset: number, size: number, light: LightState): void {
  context.save();
  context.beginPath();
  context.rect(offset, offset, size, size);
  context.clip();
  context.globalCompositeOperation = "soft-light";

  const step = 11;
  for (let position = 0; position < size; position += step) {
    const distance = Math.abs(position / size - light.y);
    const alpha = Math.max(0.02, 0.17 - distance * 0.13);
    context.strokeStyle = `rgba(242, 233, 218, ${alpha.toFixed(3)})`;
    context.lineWidth = 1.4;
    context.beginPath();
    context.moveTo(offset + position, offset);
    context.lineTo(offset + position, offset + size);
    context.stroke();
  }

  context.globalCompositeOperation = "overlay";
  const centerX = offset + light.x * size;
  const centerY = offset + light.y * size;
  const glow = context.createRadialGradient(centerX, centerY, size * 0.02, centerX, centerY, size * 0.62);
  glow.addColorStop(0, "rgba(200, 155, 99, 0.2)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(offset, offset, size, size);

  context.globalCompositeOperation = "source-over";
  context.setLineDash([5, 7]);
  context.strokeStyle = "rgba(242, 233, 218, 0.22)";
  context.lineWidth = 1;
  context.strokeRect(offset + 8, offset + 8, size - 16, size - 16);
  context.setLineDash([]);
  context.restore();
}

function drawBurnShading(context: CanvasRenderingContext2D, offset: number, size: number, light: LightState): void {
  context.save();
  context.beginPath();
  context.rect(offset, offset, size, size);
  context.clip();

  const centerX = offset + size * 0.5;
  const centerY = offset + size * 0.5;
  const vignette = context.createRadialGradient(centerX, centerY, size * 0.26, centerX, centerY, size * 0.74);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.7, "rgba(10, 5, 2, 0.28)");
  vignette.addColorStop(1, "rgba(4, 2, 1, 0.72)");
  context.globalCompositeOperation = "multiply";
  context.fillStyle = vignette;
  context.fillRect(offset, offset, size, size);

  const rimX = offset + size * (1 - light.x);
  const rimY = offset + size * (1 - light.y);
  const rim = context.createRadialGradient(rimX, rimY, size * 0.01, rimX, rimY, size * 0.72);
  rim.addColorStop(0, "rgba(200, 120, 60, 0.22)");
  rim.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.globalCompositeOperation = "screen";
  context.fillStyle = rim;
  context.fillRect(offset, offset, size, size);

  const random = seededRandom(31);
  context.globalCompositeOperation = "overlay";
  context.strokeStyle = "rgba(200, 155, 99, 0.07)";
  for (let index = 0; index < 30; index += 1) {
    const y = offset + random() * size;
    context.lineWidth = random() * 1.2 + 0.4;
    context.beginPath();
    context.moveTo(offset, y);
    context.bezierCurveTo(offset + size * 0.3, y - 9, offset + size * 0.7, y + 10, offset + size, y - 3);
    context.stroke();
  }
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

      const size = SIZE * (texture === "bordado" ? 0.56 : 0.62);
      const offset = (SIZE - size) / 2;

      context.save();
      if (texture === "bordado") {
        context.shadowColor = "rgba(0, 0, 0, 0.7)";
        context.shadowBlur = 18;
        context.drawImage(image, offset, offset, size, size);
        context.globalCompositeOperation = "multiply";
        context.fillStyle = "rgba(16, 24, 32, 0.28)";
        context.fillRect(offset, offset, size, size);
      } else if (texture === "hierro") {
        context.shadowColor = "rgba(0, 0, 0, 0.85)";
        context.shadowBlur = 34;
        context.shadowOffsetY = 12;
        context.drawImage(image, offset, offset, size, size);
      } else {
        context.shadowColor = "rgba(0, 0, 0, 0.9)";
        context.shadowBlur = 26;
        context.shadowOffsetY = 8;
        context.drawImage(image, offset, offset, size, size);
        context.shadowColor = "transparent";
        context.globalCompositeOperation = "overlay";
        context.fillStyle = "rgba(200, 120, 50, 0.3)";
        context.fillRect(offset, offset, size, size);
      }
      context.restore();

      if (texture === "hierro") drawSpecular(context, offset, size, light);
      else if (texture === "bordado") drawStitchRelief(context, offset, size, light);
      else drawBurnShading(context, offset, size, light);

      context.strokeStyle = "rgba(200, 155, 99, 0.4)";
      context.lineWidth = 1.4;
      context.strokeRect(offset - 14, offset - 14, size + 28, size + 28);
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
        <div className="absolute inset-0 flex items-center justify-center bg-forge-void/80 p-6 text-center text-sm text-forge-muted">
          No hemos podido cargar la vista previa. Vuelve a forjar la propuesta.
        </div>
      ) : null}
    </div>
  );
}
