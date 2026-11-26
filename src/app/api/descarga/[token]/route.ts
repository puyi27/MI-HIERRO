import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyDownloadToken } from "@/lib/security/tokens";
import { buildDeliveryZip } from "@/lib/stripe/zip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const verification = verifyDownloadToken(token);
  if (!verification.ok) {
    return NextResponse.json({ error: "Enlace no válido o caducado." }, { status: 403, headers: NO_STORE });
  }

  const store = await getStore();
  const order = await store.getOrder(verification.payload.o);
  if (!order || order.status !== "paid") {
    return NextResponse.json({ error: "El pago no está confirmado." }, { status: 403, headers: NO_STORE });
  }

  if (order.product === "similarity") {
    return NextResponse.json(
      { error: "El Informe de Similitud se envía por correo tras la revisión (24-48 h)." },
      { status: 409, headers: NO_STORE },
    );
  }

  const design = order.designId ? await store.getDesign(order.designId) : null;
  if (!design) {
    return NextResponse.json({ error: "El diseño asociado no está disponible." }, { status: 404, headers: NO_STORE });
  }

  const { filename, buffer } = await buildDeliveryZip(design);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.byteLength),
      ...NO_STORE,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
