"use client";

import { useEffect, useRef, useState } from "react";
import type { ForgeTexture } from "@/components/forge/types";

interface PreviewCanvasProps {
  previewUrl: string;
  texture: ForgeTexture;
  alt: string;
}

const SIZE = 900;

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

function drawTexture(context: CanvasRenderingContext2D, texture: ForgeTexture): void {
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

export function PreviewCanvas({ previewUrl, texture, alt }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    drawTexture(context, texture);

    const image = new Image();
    image.decoding = "async";
    image.src = previewUrl;

    const render = () => {
      const size = SIZE * (texture === "bordado" ? 0.56 : 0.62);
      const offset = (SIZE - size) / 2;

      context.save();
      if (texture === "hierro") {
        context.shadowColor = "rgba(0, 0, 0, 0.85)";
        context.shadowBlur = 34;
        context.shadowOffsetY = 12;
        context.drawImage(image, offset, offset, size, size);
      } else if (texture === "bordado") {
        context.shadowColor = "rgba(0, 0, 0, 0.7)";
        context.shadowBlur = 18;
        context.drawImage(image, offset, offset, size, size);
        context.globalCompositeOperation = "multiply";
        context.fillStyle = "rgba(16, 24, 32, 0.28)";
        context.fillRect(offset, offset, size, size);
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

      context.strokeStyle = "rgba(200, 155, 99, 0.4)";
      context.lineWidth = 1.4;
      context.strokeRect(offset - 14, offset - 14, size + 28, size + 28);
    };

    const handleError = () => setFailed(true);
    image.addEventListener("load", render);
    image.addEventListener("error", handleError);

    return () => {
      image.removeEventListener("load", render);
      image.removeEventListener("error", handleError);
    };
  }, [previewUrl, texture]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={alt}
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
