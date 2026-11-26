import { NextResponse } from "next/server";
import { storyRequestSchema } from "@/types/forge";
import { getStore } from "@/lib/store";
import { renderAvatar, renderStoryCard } from "@/lib/forge-engine/story";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "story"), 40, 3600);
  if (!limit.success) {
    return NextResponse.json({ error: "Demasiadas descargas seguidas." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = storyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Solicitud de pieza no válida" }, { status: 400 });
  }

  const store = await getStore();
  const design = await store.getDesign(parsed.data.designId);
  if (!design) {
    return NextResponse.json({ error: "Diseño no encontrado" }, { status: 404 });
  }

  const isAvatar = parsed.data.format === "avatar";
  const png = isAvatar
    ? await renderAvatar(design, parsed.data.variant, true)
    : await renderStoryCard(design, parsed.data.variant);

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${isAvatar ? "mi-hierro-avatar-1x1.png" : "mi-hierro-story-9x16.png"}"`,
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
