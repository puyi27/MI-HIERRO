import { NextResponse } from "next/server";
import { leadRequestSchema, leadResponseSchema } from "@/types/forge";
import { getStore } from "@/lib/store";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { sendAdminEmail } from "@/lib/email/send";
import { leadEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

export async function POST(request: Request) {
  const limit = await rateLimit(clientKey(request, "leads"), 6, 3600);
  if (!limit.success) {
    return NextResponse.json({ error: "Demasiadas solicitudes seguidas. Inténtalo más tarde." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Revisa los datos de la solicitud",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 400, headers: NO_STORE },
    );
  }

  const data = parsed.data;
  const store = await getStore();
  const design = data.designId ? await store.getDesign(data.designId) : null;

  const lead = await store.createLead({
    type: data.type,
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    budget: data.budget ?? null,
    designId: design?.id ?? null,
  });

  const template = leadEmail({
    id: lead.id,
    type: lead.type,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    budget: lead.budget,
    designId: lead.designId,
  });
  await sendAdminEmail(template.subject, template.html);

  return NextResponse.json(
    leadResponseSchema.parse({
      ok: true,
      leadId: lead.id,
      message:
        data.type === "forja"
          ? "Solicitud de forja física recibida. Te contactamos con presupuesto y plazo."
          : "Solicitud de revisión profesional recibida. Te respondemos en 24-48 h laborables.",
    }),
    { status: 200, headers: NO_STORE },
  );
}
