import JSZip from "jszip";
import { rasterBackedSvg, vectorizeRecraftImage } from "@/lib/ai/recraft";
import { renderHighResolutionPng } from "@/lib/forge-engine/raster";
import { renderAvatar, renderStoryCard } from "@/lib/forge-engine/story";
import type { DesignRecord } from "@/lib/store/types";

export function designSlug(design: DesignRecord): string {
  const base = [design.firstName, design.lastName1, design.lastName2]
    .filter(Boolean)
    .join("-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "mi-hierro";
}

async function deliverySvg(design: DesignRecord): Promise<string> {
  if (!design.rasterPng) return design.svgMaster;
  try {
    return await vectorizeRecraftImage(Buffer.from(design.rasterPng, "base64"));
  } catch {
    return rasterBackedSvg(design.rasterPng);
  }
}

export async function buildDeliveryZip(design: DesignRecord): Promise<{ filename: string; buffer: Buffer }> {
  const slug = designSlug(design);
  const zip = new JSZip();

  const png = await renderHighResolutionPng(design.svgMaster, 2400);
  const avatar = await renderAvatar(design, "hierro");
  const story = await renderStoryCard(design, "hierro");

  zip.file(`${slug}-mi-hierro.svg`, await deliverySvg(design));
  zip.file(`${slug}-mi-hierro-2400.png`, png);
  zip.file(`${slug}-avatar-1080.png`, avatar);
  zip.file(`${slug}-story-1080x1920.png`, story);
  zip.file(
    "LEEME.txt",
    [
      "MI HIERRO · PACK DIGITAL PREMIUM",
      "",
      `Diseño: ${[design.firstName, design.lastName1, design.lastName2].filter(Boolean).join(" ")}`,
      `Iniciales: ${design.initials}`,
      `Estilo: ${design.style}`,
      "",
      "Contenido:",
      "- SVG forjable con trazos convertidos a curvas, sin etiquetas de texto.",
      "- PNG transparente a 2400 px.",
      "- Avatar 1080x1080 para redes.",
      "- Story 9:16 1080x1920 con la firma MI HIERRO.",
      "",
      "MI HIERRO propone y orienta; no certifica disponibilidad ante RUCTL, OEPM, EUIPO ni OMPI.",
      "Referencia normativa: RD 787/2023. Antes de fabricar o usar el hierro, solicita una revisión profesional.",
      "",
      `Generado el ${new Date().toISOString().slice(0, 10)}.`,
    ].join("\n"),
  );

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return { filename: `${slug}-mi-hierro-premium.zip`, buffer };
}
