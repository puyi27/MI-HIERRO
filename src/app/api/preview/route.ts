import { NextResponse } from "next/server";
import { previewQuerySchema } from "@/types/forge";
import { getStore } from "@/lib/store";
import { renderMaskPreview, renderPreview } from "@/lib/forge-engine/raster";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const previewCache = new Map<string, Buffer>();
const CACHE_LIMIT = 120;

function cacheGet(key: string): Buffer | null {
  const hit = previewCache.get(key);
  if (!hit) return null;
  previewCache.delete(key);
  previewCache.set(key, hit);
  return hit;
}

function cacheSet(key: string, value: Buffer): void {
  previewCache.set(key, value);
  if (previewCache.size > CACHE_LIMIT) {
    const oldest = previewCache.keys().next().value;
    if (oldest) previewCache.delete(oldest);
  }
}

export async function GET(request: Request) {
  const limit = await rateLimit(clientKey(request, "preview"), 240, 3600);
  if (!limit.success) {
    return NextResponse.json({ error: "Demasiadas vistas previas." }, { status: 429 });
  }

  const url = new URL(request.url);
  const parsed = previewQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "Vista previa no válida" }, { status: 400 });
  }

  const { d, f, t } = parsed.data;
  const store = await getStore();
  const design = await store.getDesign(d);
  if (!design) {
    return NextResponse.json({ error: "Diseño no encontrado" }, { status: 404 });
  }

  const cacheKey = `${design.id}:${f}:${t}`;
  let buffer = cacheGet(cacheKey);
  if (!buffer) {
    if (design.rasterPng) {
      buffer = await renderMaskPreview(Buffer.from(design.rasterPng, "base64"), {
        width: 900,
        format: f,
        backdrop: t,
      });
    } else {
      buffer = await renderPreview(design.svgMaster, { width: 900, format: f, backdrop: t });
    }
    cacheSet(cacheKey, buffer);
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": f === "webp" ? "image/webp" : "image/png",
      "Content-Disposition": `inline; filename="mi-hierro-vista-previa.${f}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
